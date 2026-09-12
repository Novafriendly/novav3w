export async function mountProfileEditor(root,{username,backend,onSaved}) {
  root.innerHTML='<p class="nova-editor-status">Loading your profile…</p>';
  const loadingNode=root.firstChild;
  let user;try{user=await backend.read(`users/${username}`)||{}}catch{root.textContent='Could not load your profile. Reopen settings to try again.';return}
  if(!root.isConnected || root.firstChild!==loadingNode)return;
  const safeImage=value=>{if(!value)return '';if(/^data:image\/(png|jpeg|webp|gif);base64,/i.test(value))return value;try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return ''}};
  let photo=safeImage(user.profilePic),banner=safeImage(user.bannerImage),busy=false;
  root.innerHTML=`<div class="nova-profile-editor"><header><div class="nova-editor-kicker">YOUR SPACE ON NOVA</div><h1>Edit profile</h1><p>Make it yours. Your preview updates as you edit.</p></header><div class="nova-editor-layout"><form class="nova-editor-form"><section><h2>Identity</h2><label>Display name<input name="displayName" maxlength="32" required></label><small>Your profile name. Your account @username stays the same.</small><label>About me<textarea name="bio" rows="4" maxlength="190"></textarea></label><small data-count></small></section><section><h2>Profile photo</h2><label>Image URL<input name="photo" type="url" placeholder="https://…"></label><div class="nova-editor-actions"><label class="nova-file-button">Upload photo<input name="photoFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label><button type="button" data-remove-photo>Remove photo</button></div></section><section><h2>Banner</h2><label>Style<select name="bannerType"><option value="glass">Transparent glass</option><option value="gradient">Color gradient</option><option value="image">Image</option></select></label><div data-colors><label>First color<input name="color1" type="color"></label><label>Second color<input name="color2" type="color"></label></div><div data-banner-image><label>Image URL<input name="bannerUrl" type="url" placeholder="https://…"></label><label class="nova-file-button">Upload banner<input name="bannerFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label></div><small>Uploads: PNG, JPG, WEBP or GIF, up to 2 MB.</small></section><div class="nova-editor-save"><button type="submit">Save profile</button><p class="nova-editor-status" role="status" data-status></p></div></form><aside class="nova-editor-preview"><div class="nova-editor-kicker">LIVE PREVIEW</div><div class="nova-preview-card"><div data-preview-banner></div><div class="nova-preview-inner"><div data-preview-avatar></div><h2 data-preview-name></h2><p data-preview-tag></p><span class="nova-preview-online">● Online</span><h3>ABOUT ME</h3><p data-preview-bio></p><h3>ROLES</h3><div data-preview-roles></div><small>Roles are assigned by Nova staff.</small></div></div></aside></div></div>`;
  const form=root.querySelector('form'),field=name=>form.elements.namedItem(name),q=s=>root.querySelector(s),status=q('[data-status]');
  field('displayName').value=user.displayName||username;field('bio').value=user.bio||'';
  field('photo').value=photo.startsWith('http')?photo:'';field('bannerUrl').value=banner.startsWith('http')?banner:'';
  field('bannerType').value=user.banner==='image'?'image':user.banner==='gradient'?'gradient':'glass';
  field('color1').value=/^#[a-f0-9]{6}$/i.test(user.bannerColor1)?user.bannerColor1:'#34383e';field('color2').value=/^#[a-f0-9]{6}$/i.test(user.bannerColor2)?user.bannerColor2:'#171a1e';
  q('[data-preview-tag]').textContent='@'+username;
  const roles=[...new Set([...(Array.isArray(user.roles)?user.roles:[]),user.role].filter(r=>typeof r==='string'&&r))];
  for(const role of roles.length?roles:['Member']){const badge=document.createElement('span');badge.textContent=role;q('[data-preview-roles]').appendChild(badge)}
  function preview(){
    q('[data-preview-name]').textContent=field('displayName').value||username;q('[data-preview-bio]').textContent=field('bio').value||"This user hasn't added a bio yet.";
    q('[data-count]').textContent=field('bio').value.length+'/190 characters';
    const type=field('bannerType').value;q('[data-colors]').hidden=type!=='gradient';q('[data-banner-image]').hidden=type!=='image';
    const cover=q('[data-preview-banner]');cover.style.background=type==='gradient'?`linear-gradient(135deg,${field('color1').value},${field('color2').value})`:'linear-gradient(130deg,#ffffff12,#ffffff03)';
    if(type==='image'&&banner){cover.style.backgroundImage=`url(${JSON.stringify(banner)})`;cover.style.backgroundSize='cover';cover.style.backgroundPosition='center'}
    const avatar=q('[data-preview-avatar]');avatar.replaceChildren();if(photo){const image=document.createElement('img');image.src=photo;image.alt='Profile photo preview';avatar.appendChild(image)}else avatar.textContent=(field('displayName').value||username).charAt(0).toUpperCase();
  }
  form.addEventListener('input',event=>{if(event.target===field('photo'))photo=safeImage(event.target.value);if(event.target===field('bannerUrl'))banner=safeImage(event.target.value);preview()});
  q('[data-remove-photo]').onclick=()=>{photo='';field('photo').value='';field('photoFile').value='';preview()};
  async function upload(input,isBanner){const file=input.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>2*1024*1024){status.textContent='Choose a supported image under 2 MB.';input.value='';return}
    const reader=new FileReader();reader.onload=()=>{if(isBanner){banner=reader.result;field('bannerUrl').value='';field('bannerType').value='image'}else{photo=reader.result;field('photo').value=''}status.textContent='Image ready. Save your profile to apply it.';preview()};reader.onerror=()=>status.textContent='Could not read that image.';reader.readAsDataURL(file);
  }
  field('photoFile').onchange=()=>upload(field('photoFile'),false);field('bannerFile').onchange=()=>upload(field('bannerFile'),true);
  form.onsubmit=async event=>{event.preventDefault();if(busy)return;const displayName=field('displayName').value.trim(),type=field('bannerType').value;if(!displayName){status.textContent='Enter a display name.';return}if(type==='image'&&!banner){status.textContent='Choose a banner image.';return}
    const patch={displayName,bio:field('bio').value.trim(),profilePic:photo,banner:type,bannerImage:type==='image'?banner:null,bannerColor1:type==='gradient'?field('color1').value:null,bannerColor2:type==='gradient'?field('color2').value:null};
    busy=true;form.querySelectorAll('button,input,select,textarea').forEach(n=>n.disabled=true);status.textContent='Saving…';
    try{await backend.update(Object.fromEntries(Object.entries(patch).map(([key,value])=>[`users/${username}/${key}`,value])));onSaved?.(patch);status.textContent='Profile saved. Your changes are ready.'}catch{status.textContent='Could not save. Your edits are still here—please try again.'}finally{busy=false;form.querySelectorAll('button,input,select,textarea').forEach(n=>n.disabled=false)}
  };preview();
}
