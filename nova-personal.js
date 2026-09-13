import {selectActivity, elapsedLabel} from './community-activity.js';

const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const label=(u,key)=>u?.displayName||u?.username||key||'Guest';
const identity=()=>localStorage.getItem('nova_user')||localStorage.getItem('nova_username')||'';
function styles(){if(document.getElementById('nova-personal-style'))return;const link=el('link');link.id='nova-personal-style';link.rel='stylesheet';link.href=new URL('./nova-personal.css',import.meta.url).href;document.head.append(link);}
function avatar(api,user,key){const node=el('span','np-avatar',label(user,key).charAt(0).toUpperCase()),src=api.safeImage(user?.profilePic);if(src){const img=el('img');img.src=src;img.alt='';img.onerror=()=>img.remove();node.append(img);}return node;}
function roles(user){return [...new Set([...(Array.isArray(user?.roles)?user.roles:[]),user?.role].filter(Boolean))];}
export function visitTotal(value){return Math.max(190000,Number.isSafeInteger(value)?value:190000)+1;}
export function validateLog(data){
  const title=String(data.title||'').trim(),description=String(data.description||'').trim(),items=String(data.items||'').split('\n').map(x=>x.trim()).filter(Boolean);
  if(!title||title.length>100)throw Error('Add a title of 1–100 characters.');
  if(!description||description.length>1000)throw Error('Add a description of 1–1,000 characters.');
  if(!items.length||items.length>30||items.some(x=>x.length>300))throw Error('Add 1–30 update details, up to 300 characters each.');
  return {title,description,items};
}
export function openUpdateLogs(api){
  styles();if(document.getElementById('np-logs'))return;
  const dialog=el('dialog','np-dialog');dialog.id='np-logs';dialog.setAttribute('aria-label','Nova update log');
  const head=el('header');head.append(el('div','np-kicker','WHAT’S NEW'),el('h1','','Nova updates'));
  const close=el('button','np-close','×');close.setAttribute('aria-label','Close update log');head.append(close);
  const list=el('div','np-log-list','Loading updates…');dialog.append(head,list);document.body.append(dialog);
  let stop=()=>{};const cleanup=()=>{stop();dialog.remove();};dialog.addEventListener('close',cleanup,{once:true});close.onclick=()=>dialog.close();dialog.showModal();
  stop=api.backend.subscribe('novaUpdateLogs',records=>{
    list.replaceChildren();const logs=Object.values(records||{}).filter(x=>x&&typeof x.title==='string').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    if(!logs.length)list.append(el('p','np-empty','A new chapter is coming. Updates will appear here.'));
    logs.forEach(log=>{const card=el('article','np-log');const image=api.safeImage(log.banner);if(image){const img=el('img','np-log-banner');img.src=image;img.alt='';img.onerror=()=>img.remove();card.append(img);}
      const body=el('div','np-log-body');body.append(el('small','np-kicker',Number.isFinite(log.createdAt)?new Date(log.createdAt).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'}):'LATEST UPDATE'),el('h2','',log.title),el('p','',log.description||''));
      const ul=el('ul');(Array.isArray(log.items)?log.items:[]).forEach(item=>ul.append(el('li','',String(item))));body.append(ul);card.append(body);list.append(card);
    });
  },()=>{list.textContent='Updates couldn’t load. Close and reopen to try again.';});
}

export function startPersonal(api){
  const dock=document.querySelector('.dock');if(!dock||document.getElementById('nova-personal'))return;
  styles();const bar=el('aside','np-bar');bar.id='nova-personal';bar.setAttribute('aria-label','Nova Personal');
  let users={},activity={},online=[],profileVersion=0,activityReady=false,visits=null,signature='',selfSignature='';
  const cards=[];
  function group(name){const group=el('div','np-group'),button=el('button','np-trigger'),card=el('section','np-card');card.id=`np-card-${name}`;card.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',card.id);group.append(button,card);bar.append(group);let timeout;
    const show=()=>{clearTimeout(timeout);cards.forEach(x=>{if(x.card!==card)x.hide();});card.hidden=false;button.setAttribute('aria-expanded','true');};
    const hide=()=>{card.hidden=true;button.setAttribute('aria-expanded','false');};
    group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show();});group.addEventListener('pointerleave',()=>{timeout=setTimeout(()=>{if(!group.contains(document.activeElement))hide();},180);});
    button.onclick=show;group.addEventListener('focusout',()=>setTimeout(()=>{if(!group.contains(document.activeElement)&&!group.matches(':hover'))hide();},0));cards.push({card,hide});return {button,card};
  }
  const self=group('self'),people=group('people'),views=group('visits');
  self.button.setAttribute('aria-label','Your Nova profile and stats');people.button.setAttribute('aria-label','Users online now');views.button.setAttribute('aria-label','Home page visits');
  const logs=el('button','np-update','↻');logs.setAttribute('aria-label','Open update log');logs.title='Update log';logs.onclick=()=>openUpdateLogs(api);bar.append(logs);document.body.append(bar);
  document.addEventListener('pointerdown',event=>{if(!bar.contains(event.target))cards.forEach(x=>x.hide());});bar.addEventListener('keydown',event=>{if(event.key==='Escape'){cards.forEach(x=>x.hide());event.target.closest('.np-group')?.querySelector('button')?.focus();}});
  const setStyle=(node,key,value)=>{if(node.style.getPropertyValue(key)!==value)node.style.setProperty(key,value);};
  function position(){
    const vertical=dock.classList.contains('dock-left')||dock.classList.contains('dock-right'),right=dock.classList.contains('dock-right');
    bar.classList.toggle('np-side-dock',vertical);bar.classList.toggle('np-right-dock',right);dock.classList.toggle('np-has-personal-side',vertical);
    const theme=getComputedStyle(dock);
    for(const [key,value] of [['--np-background',theme.background],['--np-border',theme.border],['--np-shadow',theme.boxShadow],['--np-blur',theme.backdropFilter],['--np-radius',theme.borderRadius]])setStyle(bar,key,value);
    bar.classList.toggle('np-light',localStorage.getItem('nova_dock_color')==='white');
    if(vertical){
      if(dock.classList.contains('np-personal-paired'))dock.classList.remove('np-personal-paired');bar.classList.remove('np-tight');
      setStyle(bar,'width',`${dock.getBoundingClientRect().width}px`);
      setStyle(dock,'--np-reserve',`${bar.offsetHeight+24}px`);
      const rect=dock.getBoundingClientRect();setStyle(bar,'left',`${rect.left}px`);setStyle(bar,'top',`${rect.bottom+8}px`);setStyle(bar,'bottom','auto');
    }else{
      setStyle(bar,'width','max-content');bar.classList.remove('np-tight');
      if(dock.offsetWidth+bar.offsetWidth+32>innerWidth)bar.classList.add('np-tight');
      const fits=dock.offsetWidth+bar.offsetWidth+32<=innerWidth;
      dock.classList.toggle('np-personal-paired',fits);setStyle(dock,'--np-offset',`${(bar.offsetWidth+8)/2}px`);
      const rect=dock.getBoundingClientRect();setStyle(bar,'top','auto');
      setStyle(bar,'left',`${fits?rect.left-bar.offsetWidth-8:Math.max(8,rect.left)}px`);
      setStyle(bar,'bottom',`${fits?Math.max(8,innerHeight-rect.bottom):Math.max(8,innerHeight-rect.top+8)}px`);
    }
  }
  let layoutFrame=0;const layout=()=>{if(!layoutFrame)layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;position();});};
  const sizeObserver=new ResizeObserver(layout);sizeObserver.observe(dock);sizeObserver.observe(bar);
  new MutationObserver(layout).observe(dock,{attributes:true,attributeFilter:['class','style']});window.addEventListener('resize',layout);dock.addEventListener('transitionend',layout);position();
  function render(){
    const now=api.now(),me=identity(),user=users[me],current=selectActivity(activity[me],now);
    online=Object.entries(activity).map(([key,records])=>({key,current:selectActivity(records,now)})).filter(x=>x.current).sort((a,b)=>label(users[a.key],a.key).localeCompare(label(users[b.key],b.key)));
    const own=JSON.stringify([me,profileVersion,current?.title,current?.startedAt]);
    if(own!==selfSignature){selfSignature=own;self.button.replaceChildren(avatar(api,user,me),el('span','np-self-name',label(user,me)));self.card.replaceChildren(el('div','np-kicker','YOUR NOVA'),avatar(api,user,me),el('h2','',label(user,me)),el('p','',user?.bio||'Your space. Your people. Your Nova.'));
      const dl=el('dl');for(const [title,value] of [['Status',current?'Online':'Away'],['Roles',roles(user).join(' · ')||'Member'],['Member since',Number.isFinite(user?.createdAt)?new Date(user.createdAt).toLocaleDateString():'—'],['Now playing',current?.title||'Home']]){const row=el('div');row.append(el('dt','',title),el('dd','',value));dl.append(row);}self.card.append(dl);if(current){const time=el('p','np-time');time.dataset.since=current.startedAt;self.card.append(time);}}
    const next=JSON.stringify([profileVersion,online.map(x=>[x.key,x.current.title,x.current.icon,x.current.startedAt]),activityReady]);
    if(next!==signature){signature=next;const stack=el('span','np-stack');online.slice(0,4).forEach(x=>stack.append(avatar(api,users[x.key],x.key)));people.button.replaceChildren(stack,el('span','np-online-label',!activityReady?'Connecting…':online.length>4?`+${online.length-4} more`:`${online.length} online`));
      people.card.replaceChildren(el('div','np-kicker','TOGETHER ON NOVA'),el('h2','',`${online.length} online now`));const list=el('div','np-people');list.tabIndex=0;list.setAttribute('aria-label','Online users and activity');
      if(!online.length)list.append(el('p','np-empty',activityReady?'It’s quiet here. Say hello when someone arrives.':'Connecting to live activity…'));
      online.forEach(({key,current})=>{const row=el('div','np-person');row.append(avatar(api,users[key],key));const body=el('div');body.append(el('strong','',label(users[key],key)),el('span','',current.title));const time=el('small','np-time');time.dataset.since=current.startedAt;body.append(time);row.append(body);const icon=api.safeImage(current.icon);if(icon){const img=el('img','np-game-icon');img.src=icon;img.alt=current.type==='game'?'Game icon':'App icon';img.onerror=()=>img.remove();row.append(img);}list.append(row);});people.card.append(list);
    }
    bar.querySelectorAll('[data-since]').forEach(n=>n.textContent=elapsedLabel(Number(n.dataset.since),now));
  }
  views.button.append(el('span','','↗'),el('span','np-visits','Loading…'));views.card.append(el('div','np-kicker','NOVA, BY THE NUMBERS'),el('strong','np-big-count','—'),el('p','','Home page visits'),el('small','','Starting at 190,000. Each home-page load adds one visit.'));
  api.backend.subscribe('users',value=>{users=value||{};profileVersion++;render();},()=>{self.card.textContent='Profiles are unavailable. Please refresh to reconnect.';});
  api.backend.subscribe('novaActivity',value=>{activity=value||{};activityReady=true;render();},()=>{activity={};activityReady=false;render();people.card.textContent='Live activity is unavailable. Please refresh to reconnect.';});
  api.backend.subscribe('novaStats/homeVisits',value=>{visits=Math.max(190000,Number(value)||190000);views.button.querySelector('.np-visits').textContent=new Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(visits);views.card.querySelector('.np-big-count').textContent=visits.toLocaleString();},()=>{views.button.querySelector('.np-visits').textContent='Unavailable';});
  // Transaction avoids lost increments when visitors arrive simultaneously.
  api.backend.transaction('novaStats/homeVisits',visitTotal).catch(()=>{views.card.querySelector('small').textContent='This visit could not be counted. Refresh to reconnect.';});
  setInterval(render,1000);render();
}

export function mountUpdateLogEditor(root,api,authorize){
  styles();let selected='',records={},busy=false,disposed=false;
  root.innerHTML=`<div class="admin-page-header-new"><div class="nova-eyebrow">NOVA CONTROL ROOM</div><div class="admin-page-title-new">Update Log</div><div class="admin-page-subtitle-new">Share what’s new. Edit an existing release or create your next one.</div></div><div class="admin-card-new np-log-editor"><label>EDIT RELEASE<select data-release><option value="">New update</option></select></label><form><label>TITLE<input name="title" maxlength="100" required placeholder="A new chapter for Nova"></label><label>DESCRIPTION<textarea name="description" maxlength="1000" rows="3" required></textarea></label><label>BANNER IMAGE URL<input name="banner" type="url" placeholder="https://…"></label><label>WHAT’S NEW · ONE UPDATE PER LINE<textarea name="items" rows="6" required maxlength="9030" placeholder="A refreshed browser&#10;New ways to connect"></textarea></label><button class="admin-btn-new primary" type="submit">Publish update</button></form><p role="status" data-log-status></p></div>`;
  const form=root.querySelector('form'),select=root.querySelector('[data-release]'),status=root.querySelector('[data-log-status]'),field=name=>form.elements.namedItem(name);
  const disable=value=>{form.querySelectorAll('input,textarea,button').forEach(n=>n.disabled=value);select.disabled=value;};disable(true);
  authorize(true).then(()=>{if(!disposed)disable(false);}).catch(error=>{status.textContent=error.message;});
  const stop=api.backend.subscribe('novaUpdateLogs',value=>{records=value||{};select.replaceChildren(new Option('New update',''));Object.entries(records).sort((a,b)=>(b[1].createdAt||0)-(a[1].createdAt||0)).forEach(([id,log])=>select.append(new Option(log.title||'Untitled update',id)));select.value=selected;},()=>{status.textContent='Could not load releases. Reopen this tab to retry.';});
  select.onchange=()=>{selected=select.value;const log=records[selected]||{};field('title').value=log.title||'';field('description').value=log.description||'';field('banner').value=log.banner||'';field('items').value=(log.items||[]).join('\n');form.querySelector('button').textContent=selected?'Save changes':'Publish update';status.textContent='';};
  form.onsubmit=async event=>{event.preventDefault();if(busy)return;busy=true;disable(true);status.textContent='Saving…';try{await authorize(true);const data=validateLog({title:field('title').value,description:field('description').value,items:field('items').value}),banner=api.safeImage(field('banner').value.trim());if(field('banner').value.trim()&&!banner)throw Error('Choose a valid banner image URL.');const id=selected||crypto.randomUUID();await api.backend.update(Object.fromEntries(Object.entries({...data,banner,updatedAt:api.backend.timestamp(),...(!selected?{createdAt:api.backend.timestamp(),author:identity()}: {})}).map(([key,value])=>[`novaUpdateLogs/${id}/${key}`,value])));selected=id;select.value=id;form.querySelector('button').textContent='Save changes';status.textContent='Update saved. Everyone can read it from Nova Personal.';}catch(error){status.textContent=error.message||'Could not save. Please try again.';}finally{busy=false;if(!disposed)disable(false);}};
  return ()=>{disposed=true;stop();};
}
