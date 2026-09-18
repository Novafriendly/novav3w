import {randomUUID} from 'node:crypto';
import {services,validAccount,voiceNameKey} from '../server/voice-service.js';
const profiles=new Map();
async function visibleMembers(db,members,now){
 return Object.fromEntries(await Promise.all(Object.entries(members||{}).filter(([,m])=>m.expires>now).map(async([session,m])=>{
  let cached=profiles.get(m.account);if(!cached||cached.until<now){const profile=(await db.ref('users/'+m.account).get()).val()||{};cached={until:now+15000,name:String(profile.displayName||profile.name||m.account).slice(0,100),picture:typeof profile.profilePic==='string'?profile.profilePic:''};if(profiles.size>256)profiles.clear();profiles.set(m.account,cached);}
  return [session,{account:m.account,id:m.uid,name:cached.name,picture:cached.picture,muted:!!m.muted,deafened:!!m.deafened,camera:!!m.camera}];
 })));
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 try{
  const {db,auth}=await services();
  let user;try{user=await auth.verifyIdToken((req.headers.authorization||'').replace(/^Bearer /,''),true);if(user.firebase?.sign_in_provider!=='anonymous')throw Error();}catch{return res.status(401).json({error:'Reconnect your Nova voice ID.'});}
  const device=(await db.ref('novaVoice/devices/'+user.uid).get()).val();
  const account=device?.account;if(!validAccount(account))return res.status(403).json({error:'Reconnect your Nova voice ID.'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{},now=Date.now();
  if(body.action==='lobby'){const room=(await db.ref('novaVoice/rooms/server-general').get()).val();return res.json({members:await visibleMembers(db,room?.members,now),capacity:10});}
  if(body.action==='peers'){
   if(!validAccount(body.target))return res.status(400).json({error:'Invalid Nova name.'});
   const directory=(await db.ref('novaVoice/directory/'+voiceNameKey(body.target)).get()).val()||{};
   const activeIds=Object.entries(directory).filter(([,seen])=>seen>now-60000).slice(0,100).map(([id])=>id);
   const devices=Object.fromEntries(await Promise.all(activeIds.map(async id=>[id,(await db.ref('novaVoice/devices/'+id).get()).val()])));
   const profile=(await db.ref('users/'+body.target).get()).val()||{};
   return res.json({peers:Object.entries(devices).filter(([id,d])=>id!==user.uid&&d?.account===body.target&&d.lastSeen>now-60000).map(([id,d])=>({id,name:String(profile.displayName||profile.name||d.account).slice(0,100),picture:typeof profile.profilePic==='string'?profile.profilePic:''}))});
  }
  if(body.action==='invites'){
   await db.ref('novaVoice/devices/'+user.uid+'/lastSeen').set(now);
   await db.ref('novaVoice/directory/'+voiceNameKey(account)+'/'+user.uid).set(now);
   const invites=(await db.ref('novaVoiceInvites/'+user.uid).get()).val()||{};return res.json({invites:Object.entries(invites).filter(([,v])=>v.expires>now).map(([id,v])=>({id,...v})).slice(-5)});
  }
  if(body.action==='decline'){if(!/^[\w-]{1,80}$/.test(body.room||''))return res.status(400).json({error:'Invalid call.'});const invite=db.ref('novaVoiceInvites/'+user.uid+'/'+body.room);if(!(await invite.get()).exists())return res.status(404).json({error:'This invitation has expired.'});await db.ref('novaVoice/rooms/'+body.room+'/ended').set('declined');await invite.remove();return res.json({ok:true});}
  const active=ban=>!!ban&&ban.banned!==false&&(!ban.expiresAt||ban.expiresAt>now);
  if(!['leave'].includes(body.action)){
   const [ban,mod,legacyMute]=await Promise.all([db.ref('bans/'+account).get(),db.ref('novaModeration/'+account).get(),db.ref('mutes/'+account).get()]);const m=mod.val();if(active(ban.val())||active(m?.siteBan)||active(m?.mute)||legacyMute.val()?.muteUntil>now)return res.status(403).json({error:'Voice is unavailable while your account is muted or restricted.'});
  }
  let room=body.room;
  if(body.action==='call'){
   const targetId=body.target;if(typeof targetId!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(targetId)||targetId===user.uid)return res.status(400).json({error:'Choose a different Nova voice ID.'});
   const targetDevice=(await db.ref('novaVoice/devices/'+targetId).get()).val();if(!validAccount(targetDevice?.account)||targetDevice.lastSeen<now-60000)return res.status(409).json({error:'That voice user is offline.'});const target=targetDevice.account;
   const blocks=await Promise.all([db.ref('blocked/'+account+'/'+target).get(),db.ref('blocked/'+target+'/'+account).get()]);if(blocks.some(b=>b.exists()))return res.status(403).json({error:'This call is unavailable.'});
   const rate=await db.ref('novaVoice/rates/'+user.uid).transaction(last=>last&&now-last<30000?undefined:now);if(!rate.committed)return res.status(429).json({error:'Wait 30 seconds before calling again.'});
   room=randomUUID();await db.ref('novaVoice/rooms/'+room).set({allowed:[user.uid,targetId],caller:user.uid,recipient:targetId,label:'Direct call',created:now,ringUntil:now+60000});
   await db.ref('novaVoiceInvites/'+targetId+'/'+room).set({from:account,fromId:user.uid,room,expires:now+60000});return res.json({room});
  }
  if(!/^[\w-]{1,80}$/.test(room||''))return res.status(400).json({error:'Invalid room.'});
  const ref=db.ref('novaVoice/rooms/'+room),session=body.session;
  if(!/^[\w-]{1,80}$/.test(session||''))return res.status(400).json({error:'Invalid session.'});
  let record=(await ref.get()).val();
  if(room!=='server-general'&&(!record?.allowed?.includes(user.uid)||now-record.created>4*3600000))return res.status(403).json({error:'This call is not available to your account.'});
  if(room!=='server-general'&&body.action!=='leave'&&(record.ended||(!record.answered&&record.ringUntil&&record.ringUntil<now)))return res.status(410).json({error:record.ended==='declined'?'Your friend declined the call.':record.ended?'The call ended.':'No answer. Try calling again later.'});
  if(body.action==='join'){
   const result=await ref.transaction(value=>{
    const r=value||{label:'General Voice',created:now};const members=Object.fromEntries(Object.entries(r.members||{}).filter(([,m])=>m.expires>now));
    if(Object.hasOwn(members,session)||Object.values(members).some(m=>m.uid===user.uid)||Object.keys(members).length>=(room==='server-general'?10:2))return;
    if(r.ended||(!r.answered&&r.ringUntil&&r.ringUntil<now))return;
    return {...r,...(r.recipient===user.uid?{answered:true}:{}),members:{...members,[session]:{uid:user.uid,account,expires:now+45000}}};
   });if(!result.committed)return res.status(409).json({error:'Room is full or you are already connected in another tab.'});
   await db.ref('novaVoiceInvites/'+user.uid+'/'+room).remove();
   const iceServers=[{urls:'stun:stun.l.google.com:19302'}];if(process.env.NOVA_TURN_URL&&process.env.NOVA_TURN_USERNAME&&process.env.NOVA_TURN_CREDENTIAL)iceServers.push({urls:process.env.NOVA_TURN_URL.split(',').map(url=>url.trim()).filter(Boolean),username:process.env.NOVA_TURN_USERNAME,credential:process.env.NOVA_TURN_CREDENTIAL});
   return res.json({room,iceServers,relayConfigured:iceServers.length>1});
  }
  if(record?.members?.[session]?.uid!==user.uid)return res.status(403).json({error:'You are not connected to this room.'});
  if(body.action==='leave'){if(room!=='server-general'){await ref.child('ended').set('ended');for(const uid of record.allowed||[])await db.ref('novaVoiceInvites/'+uid+'/'+room).remove();}await ref.child('members/'+session).remove();await ref.child('signals/'+session).remove();return res.json({ok:true});}
  if(record.members[session].expires<now)return res.status(409).json({error:'Your voice session expired. Join again.'});
  if(body.action==='poll'){
   await ref.child('members/'+session+'/expires').set(now+45000);
   await ref.child('members/'+session+'/muted').set(body.muted===true);
   await ref.child('members/'+session+'/deafened').set(body.deafened===true);
   await ref.child('members/'+session+'/camera').set(body.camera===true);record.members[session].camera=body.camera===true;record.members[session].muted=body.muted===true;record.members[session].deafened=body.deafened===true;
   const signals=Object.entries(record.signals?.[session]||{}).filter(([,v])=>v.at>now-60000);
   // Explicit acknowledgement prevents dropping signals when a response is lost.
   for(const id of (Array.isArray(body.ack)?body.ack:[]).slice(0,100))if(/^[\w-]{1,80}$/.test(id))await ref.child('signals/'+session+'/'+id).remove();
   return res.json({members:await visibleMembers(db,record.members,now),signals:signals.map(([id,v])=>({id,...v}))});
  }
  if(body.action==='signal'){
   if(typeof body.to!=='string'||!Object.hasOwn(record.members,body.to)||body.to===session||record.members[body.to].expires<now)return res.status(409).json({error:'The other user left.'});
   if(!['offer','answer','candidate'].includes(body.signal?.type)||JSON.stringify(body.signal).length>30000)return res.status(400).json({error:'Invalid connection message.'});
   await ref.child('signals/'+body.to+'/'+randomUUID()).set({from:session,signal:body.signal,at:now});return res.json({ok:true});
  }
  return res.status(400).json({error:'Unknown voice action.'});
 }catch(e){console.error('Nova voice request failed',{action:typeof req.body==='object'?req.body?.action:'unknown',code:e.code||e.name});return res.status(503).json({error:e.message?.startsWith('Publish the supplied')||e.message?.startsWith('Add FIREBASE_')?e.message:'Voice could not complete this request. Please reconnect and try again.',code:'VOICE_REQUEST_FAILED'});}
}
