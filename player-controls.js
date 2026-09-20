import {selectActivity} from './community-activity.js';
const bar=document.getElementById('controlBar'),params=new URLSearchParams(location.search),game=params.get('name')||'Game',gameUrl=params.get('url')||'';
const restore=document.createElement('button');restore.id='restoreControls';restore.type='button';restore.hidden=true;restore.textContent='⌃ Controls';restore.setAttribute('aria-label','Show game controls');restore.onclick=()=>{bar.classList.remove('hidden');bar.inert=false;restore.hidden=true;bar.querySelector('button')?.focus()};document.body.append(restore);
bar.querySelectorAll('[data-tooltip]').forEach(b=>b.setAttribute('aria-label',b.dataset.tooltip));
function dialog(title){const d=document.createElement('dialog');d.className='player-dialog';d.setAttribute('aria-label',title);const h=document.createElement('h2');h.textContent=title;d.append(h);d.addEventListener('close',()=>d.remove());document.body.append(d);return d}
window.openPlayerFeedback=kind=>{
 if(!['reports','suggestions'].includes(kind))return;
 const report=kind==='reports',d=dialog(report?'Report a game issue':'Suggest a game');
 const context=document.createElement('p');context.textContent=report?'Having trouble with '+game+'? Tell us what happened.':'What would you like to play on Nova?';d.append(context);
 const form=document.createElement('form');form.innerHTML='<label>Your message<textarea required maxlength="3000"></textarea></label><p role="status"></p><div class="player-dialog-actions"><button type="button">Cancel</button><button type="submit">Send</button></div>';d.append(form);
 const status=form.querySelector('[role=status]'),send=form.querySelector('[type=submit]');let busy=false;
 form.querySelector('[type=button]').onclick=()=>{if(!busy)d.close()};d.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 form.onsubmit=async e=>{e.preventDefault();if(busy)return;const api=window.NovaCommunity,name=api?.state().name,text=form.querySelector('textarea').value.trim();if(!text)return;
 if(!api?.canSend()||!name||name==='Guest'){status.textContent=api?.blockedMessage()||'Sign into Nova to send a message.';return}
 busy=true;send.disabled=true;status.textContent='Sending…';
 try{await api.backend.write(kind+'/'+crypto.randomUUID(),{username:name,type:report?'Game Bug':'Game Request',description:(report?'Game: '+game+'\n':'')+text,timestamp:api.now(),status:'pending',answer:null,gameName:game,gameUrl});status.textContent='Sent! Nova will DM you when the team replies.';form.querySelector('textarea').disabled=true;send.hidden=true;form.querySelector('[type=button]').textContent='Done';}
 catch{status.textContent='Could not send. Your message is still here—please try again.'}finally{busy=false;send.disabled=false}};
 d.showModal();form.querySelector('textarea').focus();
};
const online=document.createElement('button');online.className='player-online';online.type='button';online.innerHTML='<i aria-hidden="true"></i><span>…</span>';online.disabled=true;online.setAttribute('aria-label','Connecting to players');bar.prepend(online);
let records={},api,stop,members=[],roomDialog,clock;
function paint(){
 if(!api)return;members=Object.entries(records).filter(([,sessions])=>{const a=selectActivity(sessions,api.now());return a?.type==='game'&&(a.gameUrl? a.gameUrl===gameUrl:a.title===game)}).map(([name])=>name);
 online.querySelector('span').textContent=members.length;online.setAttribute('aria-label',members.length+' online in this game');online.title=members.length+' playing · Click to see players';
 if(roomDialog?.open){const list=roomDialog.querySelector('[data-members]');list.replaceChildren();if(!members.length){list.textContent='No active players right now.';return}for(const name of members){const row=document.createElement('div');row.className='player-member';const avatar=document.createElement('div');avatar.className='player-avatar';avatar.textContent=Array.from(name)[0]?.toUpperCase()||'?';const label=document.createElement('span');label.textContent=name;row.append(avatar,label);list.append(row);api.backend.read('users/'+name).then(profile=>{if(!row.isConnected)return;label.textContent=profile?.displayName||name;const src=api.safeImage(profile?.profilePic);if(src){const img=new Image();img.alt='';img.src=src;img.onerror=()=>img.remove();avatar.append(img)}}).catch(()=>{})}}
}
online.onclick=()=>{roomDialog=dialog('Playing now');const list=document.createElement('div');list.dataset.members='';const close=document.createElement('button');close.textContent='Done';close.onclick=()=>roomDialog.close();roomDialog.append(list,close);roomDialog.showModal();paint()};
function connect(){if(stop||!window.NovaCommunity)return;api=window.NovaCommunity;stop=api.backend.subscribe('novaActivity',value=>{records=value||{};online.disabled=false;paint()},()=>{online.disabled=true;online.querySelector('span').textContent='—';online.title='Player count unavailable'});clock=setInterval(paint,10000);clearInterval(wait)}
let wait=setInterval(connect,500);connect();window.addEventListener('pagehide',()=>{stop?.();clearInterval(clock);clearInterval(wait);stop=null});window.addEventListener('pageshow',e=>{if(e.persisted){wait=setInterval(connect,500);connect()}});
