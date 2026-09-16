import {getApp,getApps,initializeApp} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {getAuth,signInAnonymously,setPersistence,browserLocalPersistence} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
let pending=null,lastName='',lastRegister=0,retryAt=0,lastError=null;
export async function voiceIdentity(){
 if(pending)return pending;
 if(Date.now()<retryAt)throw lastError;
 pending=(async()=>{
  const app=getApps().find(a=>a.name==='nova-device-voice')||initializeApp(getApp().options,'nova-device-voice');const auth=getAuth(app);
  await auth.authStateReady();await setPersistence(auth,browserLocalPersistence);
  const user=auth.currentUser||(await signInAnonymously(auth)).user;
  const name=localStorage.getItem('nova_user')||'Guest';
  if(name!==lastName||Date.now()-lastRegister>30000){
   const response=await fetch('/api/voice-account',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await user.getIdToken()},body:JSON.stringify({action:'register',name}),signal:AbortSignal.timeout(12000)});const result=await response.json();if(!response.ok)throw Error(result.error||'Voice could not connect.');
   lastName=name;lastRegister=Date.now();localStorage.setItem('nova_voice_id',user.uid);
  }
  return user;
 })().catch(e=>{lastError=e.code==='auth/operation-not-allowed'||e.code==='auth/admin-restricted-operation'?Error('The owner needs to enable Anonymous in Firebase Authentication → Sign-in method.'):e;retryAt=Date.now()+30000;throw lastError;}).finally(()=>{pending=null;});return pending;
}
export function mountVoiceAccount(panel){
 const identity=document.createElement('div');identity.className='voice-device-id';identity.innerHTML='<strong>Your Nova voice ID</strong><code></code><p>Saved on this browser. Clearing site data creates a new ID. Names are display names, not verified accounts.</p><button>Reconnect voice</button>';panel.querySelector('header').after(identity);
 const show=async()=>{try{const user=await voiceIdentity();identity.querySelector('code').textContent=user.uid;identity.querySelector('button').hidden=true;}catch(e){identity.querySelector('code').textContent=e.message;identity.querySelector('button').hidden=false;}};
 identity.querySelector('button').onclick=()=>{retryAt=0;show();};show();
}
