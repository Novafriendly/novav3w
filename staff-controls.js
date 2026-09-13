export function mountStaffControls({username,toast}) {
  const roleList=u=>[...(Array.isArray(u?.roles)?u.roles:[]),u?.role];
  async function authorize(allowed){const api=window.NovaCommunity;if(!api)throw Error('Still connecting. Please try again.');const user=await api.backend.read(`users/${username}`);if(!roleList(user).some(r=>allowed.includes(r))||api.isSiteBanned())throw Error('Your role cannot use this action.');return api;}
  const ownerActions=['openAdminPanel','switchAdminPageCompact','openAdminSection','switchAdminTab','quickBanUserCompact','quickUnbanUserCompact','banUserAdmin','quickBanUser','quickUnbanUser','banUser','unbanUser','permanentUnban','tempUnban','approveLobbyUnban','rejectLobbyUnban','dismissUnbanRequest','requestAIAssist','joinUnbanChat','sendLobbyMessage','assignRoleCompact','addRoleToUser','removeRoleFromUser','saveCustomRoleCompact','deleteRole','assignUserRole','assignRole'];
  for(const name of ownerActions){const original=window[name];if(typeof original!=='function')continue;window[name]=async function(...args){try{await authorize(['Owner']);return await original.apply(this,args);}catch(e){toast('Access',e.message,'error');}};}
  window.openOwnerUpdateLogs=async()=>{try{await authorize(['Owner']);await window.openAdminPanel();await window.switchAdminPageCompact('update-log');}catch(e){toast('Update Log',e.message,'error');}};
  const button=document.createElement('button');button.type='button';button.className='discord-btn nova-staff-mute';button.title='Mute user';button.textContent='🔇 Mute';button.hidden=true;document.querySelector('.discord-action-buttons')?.append(button);
  const modal=document.getElementById('userProfileModal');let ownRoles=[];
  function paint(){const owner=ownRoles.includes('Owner'),staff=ownRoles.some(r=>['Owner','Admin','Moderator'].includes(r));document.body.classList.toggle('nova-owner',owner);document.body.classList.toggle('nova-staff',staff);button.hidden=!staff||!modal?.dataset.account||modal.dataset.account===username;for(const id of ['adminBtn','adminBtnTop']){const n=document.getElementById(id);if(n)n.style.display=owner?'flex':'none';}}
  const wait=setInterval(()=>{if(!window.NovaCommunity)return;clearInterval(wait);window.NovaCommunity.backend.subscribe(`users/${username}`,u=>{ownRoles=roleList(u);paint();},()=>{ownRoles=[];paint();});},250);
  if(modal)new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['data-account']});
  async function openMute(target){if(!target||target===username)return;
    try{await authorize(['Owner','Admin','Moderator']);}catch(e){toast('Mute',e.message,'error');return;}
    const dialog=document.createElement('dialog');dialog.className='nova-mute-dialog';dialog.innerHTML='<form><h2>Mute user</h2><p data-target></p><label>Duration<select name="duration"><option value="5">5 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option><option value="1440">1 day</option><option value="10080">7 days</option></select></label><label>Reason<textarea name="reason" maxlength="500" required></textarea></label><p role="status"></p><button type="button" data-close>Cancel</button><button type="submit">Apply mute</button></form>';
    dialog.querySelector('[data-target]').textContent=target;document.body.append(dialog);dialog.showModal();dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();
    dialog.querySelector('form').onsubmit=async event=>{event.preventDefault();const form=event.target,submit=form.querySelector('[type=submit]');submit.disabled=true;try{const api=await authorize(['Owner','Admin','Moderator']),user=await api.backend.read(`users/${target}`);if(!user||roleList(user).includes('Owner'))throw Error('This user cannot be muted.');const minutes=Number(form.elements.duration.value),reason=form.elements.reason.value.trim();if(![5,30,60,1440,10080].includes(minutes)||!reason)throw Error('Choose a duration and enter a reason.');await api.backend.write(`novaModeration/${target}/mute`,{banned:true,bannedBy:username,reason,timestamp:api.backend.timestamp(),expiresAt:api.now()+minutes*60000});dialog.close();toast('Muted',`${target} has been muted.`,'success');}catch(e){form.querySelector('[role=status]').textContent=e.message;}finally{submit.disabled=false;}};
  };
  button.onclick=()=>openMute(modal?.dataset.account);
  window.quickMuteUser=()=>button.click();
  document.addEventListener('click',async event=>{
    const action=event.target.closest('[data-nova-moderate]');if(!action)return;
    event.preventDefault();event.stopPropagation();
    let target;try{target=decodeURIComponent(action.dataset.account);}catch{return;}
    if(!target||target===username||/[.#$\[\]/]/.test(target))return;
    if(action.dataset.novaModerate==='mute'){await openMute(target);return;}
    if(action.dataset.novaModerate!=='ban')return;
    try{const api=await authorize(['Owner']);const user=await api.backend.read('users/'+target);if(!user||roleList(user).includes('Owner'))throw Error('This user cannot be banned.');await window.openAdminPanel();await window.switchAdminPageCompact('moderation');const input=document.getElementById('nova-mod-target');if(input){input.value=target;document.getElementById('nova-mod-scope').value='chat';document.getElementById('nova-mod-scope').dispatchEvent(new Event('change'));input.dispatchEvent(new Event('change'));}}
    catch(e){toast('Ban',e.message,'error');}
  });
}
