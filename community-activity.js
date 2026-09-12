const validKey = value => typeof value === 'string' && value && !/[.#$\[\]/]/.test(value);
export function activityForURL(href) {
  const url = new URL(href), page = url.pathname.split('/').pop().replace(/\.html$/, '');
  if (page === 'game-player' || page === 'app-player') return {type:page === 'game-player'?'game':'app',title:(url.searchParams.get('name') || (page === 'game-player'?'Game':'App')).slice(0,100),icon:url.searchParams.get('icon') || ''};
  const pages={settings:'Settings',chat:'Chat',games:'Game library',apps:'App library',browser:'Nova Browser',proxy:'Nova Browser',home:'Home',second:'Home','':'Home'};
  return {type:page==='browser'||page==='proxy'?'browser':'page',title:pages[page] || 'Nova',icon:''};
}
export function selectActivity(records, now) {
  return Object.values(records || {}).filter(r=>r && r.visible && Number.isFinite(r.updatedAt) && now-r.updatedAt<65000 && r.updatedAt<=now+5000 && Number.isFinite(r.startedAt) && typeof r.title==='string').sort((a,b)=>(b.focusedAt||0)-(a.focusedAt||0)||b.updatedAt-a.updatedAt)[0] || null;
}
export function elapsedLabel(start,now) {
  const seconds=Math.max(0,Math.floor((now-start)/1000)), hours=Math.floor(seconds/3600), minutes=Math.floor(seconds/60)%60;
  return hours?`${hours}h ${minutes}m elapsed`:`${minutes}m ${String(seconds%60).padStart(2,'0')}s elapsed`;
}
export function startActivity(api) {
  let stopProfile, profileTimer, observer;
  api.watchProfileActivity = user => {
    stopProfile?.();clearInterval(profileTimer);observer?.disconnect();
    const modal=document.getElementById('userProfileModal'), section=document.getElementById('nowPlayingSection');
    if(!modal || !section || !validKey(user))return;
    section.style.display='block';
    let badge=document.getElementById('nova-profile-online');
    if(!badge){badge=document.createElement('span');badge.id='nova-profile-online';badge.setAttribute('role','status');document.getElementById('profileModalTag').after(badge);}
    let records={}, failed=false;
    const paint=()=>{
      const current=selectActivity(records,api.now());
      badge.textContent=failed?'Status unavailable':current?'Online':'Offline / away';
      badge.classList.toggle('is-online',!!current);
      const indicator=document.getElementById('profileStatusIndicator');
      if(indicator){indicator.title=current?'Online':'Offline / away';indicator.setAttribute('aria-label',indicator.title);}
      document.getElementById('activityGameName').textContent=current?current.title:'No current activity';
      document.getElementById('activityGameState').textContent=failed?'Activity unavailable':current?({game:'Playing a game',app:'Using an app',browser:'Browsing in Nova',page:'Exploring Nova'}[current.type]||'Active in Nova'):'Offline or away';
      document.getElementById('activityGameTime').textContent=current?elapsedLabel(current.startedAt,api.now()):'Activity appears here when they return.';
      section.classList.toggle('nova-activity-live',!!current);
      const icon=document.getElementById('activityGameIcon'), src=current?api.safeImage(current.icon):'';
      icon.style.display=src?'block':'none';if(src && icon.getAttribute('src')!==src)icon.src=src;
      icon.onerror=()=>{icon.style.display='none'};
      const status=document.getElementById('profileStatusIndicator');if(status)status.className='discord-status-indicator '+(current?'online':'offline');
    };
    paint();
    stopProfile=api.backend.subscribe(`novaActivity/${user}`,value=>{records=value||{};failed=false;paint()},()=>{records={};failed=true;paint()});
    profileTimer=setInterval(paint,1000);
    observer=new MutationObserver(()=>{if(!modal.classList.contains('show')){stopProfile?.();stopProfile=null;clearInterval(profileTimer);observer.disconnect()}});
    observer.observe(modal,{attributes:true,attributeFilter:['class']});
  };
  // Only the outer Nova page publishes. Its visible panels determine activity.
  try {if(window.parent!==window && window.parent.location.origin===location.origin)return;}catch{}
  const tab=crypto.randomUUID();let currentKey='',startedAt=api.now(),focusedAt=api.now(),lastWrite=0,path='',writing=false;
  function detect(win,depth=0){
    let result=activityForURL(win.location.href);
    if(result.type==='game'||result.type==='app'||result.type==='browser'||depth>3)return result;
    const browser=win.document.getElementById('browser-overlay');
    if(browser && browser.classList.contains('open'))return {type:'browser',title:'Nova Browser',icon:''};
    for(const frame of win.document.querySelectorAll('.panel-overlay.open iframe,.app-overlay.open iframe')){
      try {if(frame.contentWindow.location.origin===location.origin)return detect(frame.contentWindow,depth+1);}catch{}
      if(frame.getAttribute('src'))return activityForURL(new URL(frame.getAttribute('src'),win.location.href).href);
    }
    return result;
  }
  async function publish(force=false){
    if(writing)return;
    const user=localStorage.getItem('nova_user')||localStorage.getItem('nova_username');
    const nextPath=validKey(user)?`novaActivity/${user}/${tab}`:'';
    if(path && path!==nextPath)api.backend.write(path,null).catch(()=>{});
    path=nextPath;if(!path)return;
    const activity=detect(window),key=JSON.stringify([user,activity.type,activity.title]);
    if(key!==currentKey){currentKey=key;startedAt=api.now();force=true;}
    if(!force && api.now()-lastWrite<20000)return;
    writing=true;const destination=path;
    try {await api.backend.write(destination,{...activity,icon:api.safeImage(activity.icon),startedAt,focusedAt,visible:document.visibilityState==='visible'&&!api.isSiteBanned(),updatedAt:api.backend.timestamp()});lastWrite=api.now();}catch{}finally{writing=false;}
  }
  window.addEventListener('focus',()=>{focusedAt=api.now();publish(true)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)focusedAt=api.now();publish(true)});
  window.addEventListener('pagehide',()=>{if(path)api.backend.write(path,null).catch(()=>{})});
  window.addEventListener('pageshow',()=>publish(true));
  setInterval(()=>publish(),1000);publish(true);
}
