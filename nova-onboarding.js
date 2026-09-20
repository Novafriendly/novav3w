
import {saveProfileFields} from './profile-editor.js';
const wallpapers=[{"name":"Blue Lake","src":"https://res.cloudinary.com/bn9aice0/video/upload/blue-lake-minecraft.1920x1080.mp4","thumb":"Img/Wallpapers/ezgif-7ddf323bfb72e48b.jpg"},{"name":"Cherry Blossom","src":"https://res.cloudinary.com/bn9aice0/video/upload/cherry-blossom.1920x1080.mp4","thumb":"Img/Wallpapers/ezgif-1f14617846267eb7.jpg"},{"name":"Dark Abyss","src":"https://res.cloudinary.com/bn9aice0/video/upload/dark-king-abyss.1920x1080.mp4","thumb":"Img/Wallpapers/ezgif-78d06c5d02034022.jpg"},{"name":"Goku Ultra","src":"https://res.cloudinary.com/bn9aice0/video/upload/goku-ultra-instinct_2.3840x2160.mp4","thumb":"Img/Wallpapers/ezgif-7a71ce22a1564c38.jpg"},{"name":"Falling Snow","src":"https://res.cloudinary.com/bn9aice0/video/upload/minecraft-falling-snow.1920x1080.mp4","thumb":"Img/Wallpapers/ezgif-76748afb1b304bbf.jpg"},{"name":"Night Sky","src":"https://res.cloudinary.com/bn9aice0/video/upload/minecraft-in-the-night.1920x1080.mp4","thumb":"Img/Wallpapers/ezgif-1138d476828ac305.jpg"},{"name":"Rainy Cabin","src":"https://res.cloudinary.com/bn9aice0/video/upload/minecraft-rainy-cabin.1920x1080.mp4","thumb":"Img/Wallpapers/ezgif-79b45eeff6158103.jpg"},{"name":"Snowy Campfire","src":"https://res.cloudinary.com/bn9aice0/video/upload/minecraft-snowy-campfire.1920x1080.mp4","thumb":"Img/Wallpapers/ezgif-7caa32f46ef636d1.jpg"},{"name":"Sunset","src":"https://res.cloudinary.com/bn9aice0/video/upload/minecraft-sunset.1920x1080.mp4","thumb":"Img/Wallpapers/ezgif-7e145d292eeff0a2.jpg"}];
const home=document.getElementById('s-home');
let active=false;
const account=()=>localStorage.getItem('nova_user')||localStorage.getItem('nova_username')||'';
const key=user=>'nova_welcome_v1:'+encodeURIComponent(user);
function begin(){
 if(active||!home||home.classList.contains('hidden')||!account())return;
 const user=account();if(localStorage.getItem(key(user)))return;active=true;
 let step=0,busy=false,photo='',dirty=false;
 const dialog=document.createElement('dialog');dialog.className='nova-tour';dialog.setAttribute('aria-labelledby','nova-tour-title');
 dialog.innerHTML='<header><img src="Nova12.png" alt="Nova"><button type="button" data-skip>Skip tour</button></header><div class="nova-tour-body"></div><p class="nova-tour-status" role="status"></p><footer><div class="nova-tour-progress" aria-label="Tour progress"></div><button type="button" data-back>Back</button><button type="button" class="nova-tour-next">Get started</button></footer>';
 document.body.append(dialog);const q=s=>dialog.querySelector(s),body=q('.nova-tour-body'),status=q('[role=status]');
 function finish(){if(busy)return;try{localStorage.setItem(key(user),'done')}catch{status.textContent='Your browser could not remember this choice. Please allow site storage.';return}dialog.close();dialog.remove();active=false;}
 q('[data-skip]').onclick=finish;dialog.addEventListener('cancel',e=>{e.preventDefault();finish()});
 q('[data-back]').onclick=()=>{if(!busy){step--;render()}};
 q('.nova-tour-next').onclick=async()=>{
  if(busy)return;
  if(step===2){const typed=q('input[type=url]').value.trim();if(typed&&typed!==photo){await choosePhoto(typed);if(photo!==typed)return;}}
  if(step===2&&dirty){busy=true;setBusy(true);status.textContent='Saving your profile…';try{
   const backend=window.NovaCommunity?.backend;if(!backend)throw Error('Still connecting. Try again in a moment.');
   if(account()!==user)throw Error('Your account changed. Reload to continue.');
   await saveProfileFields(backend,user,{profilePic:photo});dirty=false;
  }catch(e){status.textContent=e.message||'Could not save your photo. Please try again.';return}finally{busy=false;setBusy(false)}}
  if(step===5)finish();else{step++;render()}
 };
 function setBusy(value){dialog.querySelectorAll('button,input').forEach(n=>n.disabled=value)}
 function preview(){const avatar=q('.nova-tour-avatar');if(!avatar)return;avatar.textContent=Array.from(user)[0]?.toUpperCase()||'N';if(photo){const img=new Image();img.alt='Your profile picture';img.src=photo;img.onerror=()=>img.remove();avatar.append(img)}}
 async function choosePhoto(value){
  status.textContent='Checking image…';busy=true;setBusy(true);
  try{if(!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(value)){const url=new URL(value);if(!['https:','http:'].includes(url.protocol))throw Error('Use an https image link.');}
   await new Promise((resolve,reject)=>{const image=new Image(),timer=setTimeout(()=>reject(Error('Image took too long to load. Try another image.')),10000);image.onload=()=>{clearTimeout(timer);resolve()};image.onerror=()=>{clearTimeout(timer);reject(Error('That image could not load. Check the link.'))};image.src=value});photo=value;dirty=true;const input=q('input[type=url]');if(input)input.value=value.startsWith('http')?value:'';preview();status.textContent='Ready. Next saves your picture.';
  }catch(e){status.textContent=e.message||'Choose a valid image.'}finally{busy=false;setBusy(false)}
 }
 function render(){
  status.textContent='';q('[data-back]').hidden=step===0;q('.nova-tour-next').textContent=step===0?'Get started':step===5?'Enter Nova':'Next';
  q('.nova-tour-progress').innerHTML=Array.from({length:6},(_,i)=>'<i class="'+(i===step?'active':'')+'"></i>').join('');q('.nova-tour-progress').setAttribute('aria-label','Step '+(step+1)+' of 6');
  const headings=['Welcome to Nova','Your space. Your controls.','Put a face to your name','Make your tab yours','Find your atmosphere','You’re all set'];
  const descriptions=['Games, apps, friends, and your own corner of the internet. Let’s make it feel like you.','Choose your game ad preference. You can change this anytime in Settings.','Upload a picture or paste an image link. You can always change it later.','Choose the name and icon shown on your browser tab.','Pick a live wallpaper from Nova’s collection. More choices are waiting in Settings.','Your Nova is ready. Here’s where to start.'];
  body.innerHTML='<div class="nova-tour-kicker">NOVA / MAKE IT YOURS</div><h1 id="nova-tour-title" tabindex="-1">'+headings[step]+'</h1><p>'+descriptions[step]+'</p>';
  if(step===0)body.insertAdjacentHTML('beforeend','<div class="nova-tour-art" aria-hidden="true"><i></i><i></i><i></i><i></i></div><small>A quick setup. A space that feels like home.</small>');
  if(step===1){body.insertAdjacentHTML('beforeend','<div class="nova-tour-art" aria-hidden="true"><i></i><i></i><i></i><i></i></div><label class="nova-tour-toggle"><input type="checkbox">Block game ads</label><small>Uses Nova’s existing ad-block setting. Some embedded games may still show ads.</small>');const toggle=q('input');toggle.checked=localStorage.getItem('nova_block_game_ads')!=='false';toggle.onchange=()=>localStorage.setItem('nova_block_game_ads',String(toggle.checked));}
  if(step===2){body.insertAdjacentHTML('beforeend','<div class="nova-tour-avatar"></div><label>Upload a photo<input type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label><small>PNG, JPG, WebP or GIF · Up to 2 MB</small><label>Or paste an image link<input type="url" placeholder="https://example.com/photo.jpg"></label><button type="button" data-photo>Preview image</button>');preview();q('[data-photo]').onclick=()=>choosePhoto(q('input[type=url]').value.trim());q('input[type=file]').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>2097152){status.textContent='Choose a PNG, JPG, WebP or GIF under 2 MB.';return}const reader=new FileReader();reader.onload=()=>choosePhoto(reader.result);reader.onerror=()=>status.textContent='Could not read that file.';reader.readAsDataURL(file)};}
  if(step===3){const options=[['Nova','Nova12.png','default'],['Google','https://www.google.com/favicon.ico','google'],['Home - Google Classroom','https://ssl.gstatic.com/classroom/favicon.png','classroom']];const grid=document.createElement('div');grid.className='nova-tour-grid';for(const [title,icon,preset]of options){const button=document.createElement('button');button.type='button';const img=new Image();img.src=icon;img.alt='';img.style.cssText='object-fit:contain;padding:18px';const label=document.createElement('span');label.textContent=title;button.append(img,label);button.setAttribute('aria-pressed',String((localStorage.getItem('nova_cloak_preset')||'default')===preset));button.onclick=()=>{localStorage.setItem('nova_cloak_title',title);localStorage.setItem('nova_cloak_icon',icon);localStorage.setItem('nova_cloak_preset',preset);window.postMessage({novaAction:'tabCloakChanged',title,iconUrl:icon},location.origin);grid.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===button)))};grid.append(button)}body.append(grid)}
  if(step===4){const grid=document.createElement('div');grid.className='nova-tour-grid';for(const wallpaper of wallpapers){const button=document.createElement('button');button.type='button';const img=new Image();img.src=wallpaper.thumb;img.alt='';const label=document.createElement('span');label.textContent=wallpaper.name;button.append(img,label);button.setAttribute('aria-pressed',String(localStorage.getItem('nova_wallpaper')===wallpaper.src));button.onclick=()=>{for(const k of ['nova_wallpaper_upload','nova_grad','nova_using_import','nova_active_import_label'])localStorage.removeItem(k);localStorage.setItem('nova_wallpaper',wallpaper.src);localStorage.setItem('nova_wallpaper_is_video','true');localStorage.setItem('nova_wallpaper_is_gif','false');window.postMessage({novaAction:'wallpaperChanged',src:wallpaper.src,isVideo:true},location.origin);grid.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===button)))};grid.append(button)}body.append(grid)}
  if(step===5)body.insertAdjacentHTML('beforeend','<div class="nova-tour-feature">♡ &nbsp; Find a game and save your favorites</div><div class="nova-tour-feature">☏ &nbsp; Meet your friends in Nova Chat</div><div class="nova-tour-feature">⚙ &nbsp; Fine-tune your look in Settings</div><small>This tour won’t appear again for this Nova user on this browser unless site data is cleared.</small>');
  q('h1').focus({preventScroll:true});
 }
 render();dialog.showModal();
 const backend=window.NovaCommunity?.backend;if(backend)backend.read('users/'+user).then(profile=>{if(!dirty){photo=profile?.profilePic||'';preview()}}).catch(()=>{});
}
if(home){new MutationObserver(begin).observe(home,{attributes:true,attributeFilter:['class']});begin()}
