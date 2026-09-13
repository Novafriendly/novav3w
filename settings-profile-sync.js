// Account keys stay stable; the visible name comes from the shared profile.
const account=()=>localStorage.getItem('nova_user')||localStorage.getItem('nova_username')||'';
let watched=null,stop=()=>{},profile=null,busy=false,version=0;
function paint(){
  if(!profile)return;
  const name=profile.displayName||profile.username||watched;
  for(const id of ['currentUsername','profileDisplayName','infoUser']){const node=document.getElementById(id);if(node)node.textContent=name;}
  const initial=document.getElementById('profileInitial');if(initial)initial.textContent=name.charAt(0).toUpperCase();
}
function connect(){
  const api=window.NovaCommunity,key=account();if(!api||key===watched)return;
  stop();watched=key;profile=null;const token=++version;
  if(!key||/[.#$\[\]/]/.test(key))return;
  stop=api.backend.subscribe(`users/${key}`,value=>{if(token!==version)return;profile=value;paint();},()=>{});
}
const originalLoad=window.loadProfileData;
if(originalLoad)window.loadProfileData=function(...args){const result=originalLoad.apply(this,args);paint();return result;};
window.saveUsername=async function(){
  if(busy)return;
  const input=document.getElementById('newUsername'),name=input.value.trim(),key=account(),api=window.NovaCommunity;
  if(name.length<2||name.length>32){window.showToast('Use 2–32 characters.','red');return;}
  if(!api||!key||/[.#$\[\]/]/.test(key)){window.showToast('Still connecting to your account. Please try again.','red');return;}
  busy=true;input.disabled=true;
  try{
    if(!await api.backend.read(`users/${key}`))throw Error('Profile unavailable. Sign into chat first.');
    await api.backend.update({[`users/${key}/displayName`]:name});
    if(key===account()){profile={...(profile||{}),displayName:name};paint();input.value='';}
    window.showToast('Profile name saved.','green');
  }catch(error){window.showToast(error.message||'Could not save your name. Please try again.','red');}
  finally{busy=false;input.disabled=false;}
};
const input=document.getElementById('newUsername');if(input){input.maxLength=32;input.placeholder='Enter a display name';}
window.addEventListener('storage',connect);
setInterval(connect,1000);connect();
window.addEventListener('pagehide',()=>{stop();watched=null;});
window.addEventListener('pageshow',connect);
