import {services,validAccount} from '../server/voice-service.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 try{
  const {db,auth}=await services();let user;
  try{user=await auth.verifyIdToken((req.headers.authorization||'').replace(/^Bearer /,''),true);if(user.firebase?.sign_in_provider!=='anonymous')throw Error();}catch{return res.status(401).json({error:'Reconnect your Nova voice ID.'});}
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(body.action!=='register'||!validAccount(body.name))return res.status(400).json({error:'Choose a valid Nova name before joining voice.'});
  // Names are unverified labels. Identity always comes from the signed Firebase token.
  await db.ref('novaVoice/devices/'+user.uid).set({account:body.name,lastSeen:Date.now()});
  return res.json({id:user.uid,name:body.name});
 }catch(e){return res.status(503).json({error:e.message?.startsWith('Publish the supplied')||e.message?.startsWith('Add FIREBASE_')?e.message:'Voice is unavailable. The owner should check the Firebase server configuration.'});}
}
