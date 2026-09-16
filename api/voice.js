import {randomUUID} from 'node:crypto';
import {services} from '../server/voice-service.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 try{
  const {db,auth}=await services();
  let user;try{user=await auth.verifyIdToken((req.headers.authorization||'').replace(/^Bearer /,''),true);if(user.firebase?.sign_in_provider!=='google.com')throw Error();}catch{return res.status(401).json({error:'Sign in with Google to use voice chat.'});}
  const accounts=(await db.ref('novaSecureAccounts').get()).val()||{};
  const account=Object.keys(accounts).find(key=>accounts[key]?.uid===user.uid);if(!account)return res.status(403).json({error:'Ask the owner to link your Google account to your Nova username first.'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{},now=Date.now();
  if(body.action==='invites'){
   const invites=(await db.ref('novaVoiceInvites/'+user.uid).get()).val()||{};return res.json({invites:Object.entries(invites).filter(([,v])=>v.expires>now).map(([id,v])=>({id,...v})).slice(-5)});
  }
  if(body.action==='decline'){if(!/^[\w-]{1,80}$/.test(body.room||''))return res.status(400).json({error:'Invalid call.'});await db.ref('novaVoiceInvites/'+user.uid+'/'+body.room).remove();return res.json({ok:true});}
  const active=ban=>!!ban&&ban.banned!==false&&(!ban.expiresAt||ban.expiresAt>now);
  if(!['leave'].includes(body.action)){
   const [ban,mod,legacyMute]=await Promise.all([db.ref('bans/'+account).get(),db.ref('novaModeration/'+account).get(),db.ref('mutes/'+account).get()]);const m=mod.val();if(active(ban.val())||active(m?.siteBan)||active(m?.mute)||legacyMute.val()?.muteUntil>now)return res.status(403).json({error:'Voice is unavailable while your account is muted or restricted.'});
  }
  let room=body.room;
  if(body.action==='call'){
   const target=body.target;if(typeof target!=='string'||!accounts[target]?.uid||target===account)return res.status(400).json({error:'This user needs to link their Google account before receiving calls.'});
   const blocks=await Promise.all([db.ref('blocked/'+account+'/'+target).get(),db.ref('blocked/'+target+'/'+account).get()]);if(blocks.some(b=>b.exists()))return res.status(403).json({error:'This call is unavailable.'});
   const rate=await db.ref('novaVoice/rates/'+user.uid).transaction(last=>last&&now-last<30000?undefined:now);if(!rate.committed)return res.status(429).json({error:'Wait 30 seconds before calling again.'});
   room=randomUUID();await db.ref('novaVoice/rooms/'+room).set({allowed:[user.uid,accounts[target].uid],label:'Direct call',created:now});
   await db.ref('novaVoiceInvites/'+accounts[target].uid+'/'+room).set({from:account,room,expires:now+60000});return res.json({room});
  }
  if(!/^[\w-]{1,80}$/.test(room||''))return res.status(400).json({error:'Invalid room.'});
  const ref=db.ref('novaVoice/rooms/'+room),session=body.session;
  if(!/^[\w-]{1,80}$/.test(session||''))return res.status(400).json({error:'Invalid session.'});
  let record=(await ref.get()).val();
  if(room!=='server-general'&&(!record?.allowed?.includes(user.uid)||now-record.created>4*3600000))return res.status(403).json({error:'This call is not available to your account.'});
  if(body.action==='join'){
   const result=await ref.transaction(value=>{
    const r=value||{label:'General Voice',created:now};const members=Object.fromEntries(Object.entries(r.members||{}).filter(([,m])=>m.expires>now));
    if(Object.hasOwn(members,session)||Object.values(members).some(m=>m.uid===user.uid)||Object.keys(members).length>=(room==='server-general'?6:2))return;
    return {...r,members:{...members,[session]:{uid:user.uid,account,expires:now+45000}}};
   });if(!result.committed)return res.status(409).json({error:'Room is full or you are already connected in another tab.'});
   await db.ref('novaVoiceInvites/'+user.uid+'/'+room).remove();
   const iceServers=[{urls:'stun:stun.l.google.com:19302'}];if(process.env.NOVA_TURN_URL&&process.env.NOVA_TURN_USERNAME&&process.env.NOVA_TURN_CREDENTIAL)iceServers.push({urls:process.env.NOVA_TURN_URL,username:process.env.NOVA_TURN_USERNAME,credential:process.env.NOVA_TURN_CREDENTIAL});
   return res.json({room,iceServers,relayConfigured:iceServers.length>1});
  }
  if(record?.members?.[session]?.uid!==user.uid)return res.status(403).json({error:'You are not connected to this room.'});
  if(body.action==='leave'){await ref.child('members/'+session).remove();await ref.child('signals/'+session).remove();return res.json({ok:true});}
  if(record.members[session].expires<now)return res.status(409).json({error:'Your voice session expired. Join again.'});
  if(body.action==='poll'){
   await ref.child('members/'+session+'/expires').set(now+45000);
   const signals=Object.entries(record.signals?.[session]||{}).filter(([,v])=>v.at>now-60000);
   // Explicit acknowledgement prevents dropping signals when a response is lost.
   for(const id of (Array.isArray(body.ack)?body.ack:[]).slice(0,100))if(/^[\w-]{1,80}$/.test(id))await ref.child('signals/'+session+'/'+id).remove();
   return res.json({members:Object.fromEntries(Object.entries(record.members||{}).filter(([,m])=>m.expires>now).map(([id,m])=>[id,{account:m.account}])),signals:signals.map(([id,v])=>({id,...v}))});
  }
  if(body.action==='signal'){
   if(typeof body.to!=='string'||!Object.hasOwn(record.members,body.to)||body.to===session||record.members[body.to].expires<now)return res.status(409).json({error:'The other user left.'});
   if(!['offer','answer','candidate'].includes(body.signal?.type)||JSON.stringify(body.signal).length>30000)return res.status(400).json({error:'Invalid connection message.'});
   await ref.child('signals/'+body.to+'/'+randomUUID()).set({from:session,signal:body.signal,at:now});return res.json({ok:true});
  }
  return res.status(400).json({error:'Unknown voice action.'});
 }catch{return res.status(503).json({error:'Voice needs Firebase server configuration. Please try again after setup.'});}
}
