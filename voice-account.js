import {getApp} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
export function mountVoiceAccount(panel){
 const button=document.createElement('button');button.textContent='Voice setup';panel.querySelector('header').append(button);
 const dialog=document.createElement('dialog');dialog.className='nova-voice-setup';dialog.innerHTML='<form method="dialog"><button aria-label="Close voice setup">✕</button></form><h2>Connect your voice</h2><p>Link Google to your Nova account to join General Voice and receive direct calls.</p><button data-signin>Sign in with Google / Refresh</button><p role="status"></p><label>Your Google user ID<input data-uid readonly></label><p data-help></p><section data-owner hidden><h3>Owner: link a Nova account</h3><p>Verify this person owns the Nova account before linking. You can also link your own account here.</p><label>Nova account username<input data-account maxlength="100" autocomplete="off"></label><label>Google user ID<input data-target maxlength="128" autocomplete="off"></label><button data-link>Link verified account</button></section>';
 document.body.append(dialog);const status=dialog.querySelector('[role=status]');
 async function request(body){const user=getAuth(getApp()).currentUser;if(!user)throw Error('Sign in with Google first.');const response=await fetch('/api/voice-account',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await user.getIdToken()},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok)throw Error(result.error||'Setup could not load.');return result;}
 async function refresh(login){try{const auth=getAuth(getApp());if(!auth.currentUser&&login)await signInWithPopup(auth,new GoogleAuthProvider());if(!auth.currentUser)return;
  dialog.querySelector('[data-uid]').value=auth.currentUser.uid;
  const data=await request({action:'status'});dialog.querySelector('[data-owner]').hidden=!data.owner;
  status.textContent=data.setupError||(data.account?'Linked to '+data.account+'. You can join voice now.':'Your Google account is signed in. Ask the owner to link this ID to your Nova username.');
  dialog.querySelector('[data-help]').textContent=!data.ownerConfigured?'Site owner: add your Google user ID above as NOVA_OWNER_UIDS in Vercel Production, then redeploy.':'This ID identifies your account. It is not a password.';
 }catch(e){status.textContent=e.message;}}
 button.onclick=()=>{dialog.showModal();refresh(false);};dialog.querySelector('[data-signin]').onclick=()=>refresh(true);
 dialog.querySelector('[data-link]').onclick=async e=>{e.target.disabled=true;try{await request({action:'link',account:dialog.querySelector('[data-account]').value.trim(),uid:dialog.querySelector('[data-target]').value.trim()});status.textContent='Account linked. That user can now join voice.';}catch(error){status.textContent=error.message;}finally{e.target.disabled=false;}};
}
