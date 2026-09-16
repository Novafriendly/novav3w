import {services,protectedRules,owner,validAccount} from '../server/voice-service.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 try{
  const {db,auth}=await services(false);let user;
  try{user=await auth.verifyIdToken((req.headers.authorization||'').replace(/^Bearer /,''),true);if(user.firebase?.sign_in_provider!=='google.com')throw Error();}catch{return res.status(401).json({error:'Sign in with Google first.'});}
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(body.action==='status'){
   let setupError='';try{await protectedRules(db);}catch(e){setupError=e.message;}
   const accounts=setupError?{}:(await db.ref('novaSecureAccounts').get()).val()||{};
   return res.json({uid:user.uid,owner:owner(user.uid),ownerConfigured:!!process.env.NOVA_OWNER_UIDS,account:Object.keys(accounts).find(a=>accounts[a]?.uid===user.uid)||null,setupError});
  }
  if(!owner(user.uid))return res.status(403).json({error:'Only the configured owner can link accounts.'});
  await protectedRules(db);
  if(body.action!=='link'||!validAccount(body.account)||typeof body.uid!=='string'||body.uid.length>128||!body.uid)return res.status(400).json({error:'Enter a valid Nova username and Google user ID.'});
  if(!(await db.ref('users/'+body.account).get()).exists())return res.status(404).json({error:'That Nova username does not exist. Use the account username, not its display name.'});
  const target=await auth.getUser(body.uid);if(target.disabled||!target.providerData.some(p=>p.providerId==='google.com'))return res.status(400).json({error:'That Google account is unavailable.'});
  const result=await db.ref('novaSecureAccounts').transaction(accounts=>{
   accounts=accounts||{};
   if(accounts[body.account]&&accounts[body.account].uid!==body.uid||Object.keys(accounts).some(a=>a!==body.account&&accounts[a]?.uid===body.uid))return;
   return {...accounts,[body.account]:{uid:body.uid,linkedBy:user.uid,linkedAt:Date.now()}};
  });
  if(!result.committed)return res.status(409).json({error:'One of those accounts is already linked. Existing links cannot be overwritten here.'});
  return res.json({ok:true,account:body.account});
 }catch(e){console.error('Voice account setup failed:',e.code||e.name);return res.status(503).json({error:e.message?.startsWith('Publish the supplied')||e.message?.startsWith('Add FIREBASE_')?e.message:'Voice account setup is unavailable. Check the Firebase service account in Vercel.'});}
}
