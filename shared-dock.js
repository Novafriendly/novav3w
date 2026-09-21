(() => {
 const marker=document.documentElement.dataset.novaPage;
 const page=marker==='games'||marker==='apps'?marker+'.html':location.pathname.split('/').pop();
 const pages={ 'games.html':'games','apps.html':'apps' };
 const isShell=!!document.getElementById('frame-apps');
 if(!isShell){
  if(!pages[page])return;
  if(window.parent!==window){document.documentElement.classList.add('nova-embedded-page');window.parent.postMessage({novaAction:'panelPage',kind:'catalog'},'*');return;}
  if(pages[page])location.replace('home.html?nova-page='+encodeURIComponent(page+location.search));
  return;
 }
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==document.getElementById('frame-music')?.contentWindow||event.data?.novaAction!=='closeMusic')return;document.getElementById('overlay-music')?.classList.remove('open');document.getElementById('dock-music')?.classList.remove('active','app-open');});
 function start(){
  const dock=document.querySelector('.dock');if(!dock)return;
  document.documentElement.classList.add('nova-shared-shell');
  const pageKinds=new Map();
  window.novaSetPanelPage=(source,kind)=>{const frame=[...document.querySelectorAll('.panel-overlay iframe')].find(f=>f.contentWindow===source);if(frame){pageKinds.set(frame,kind);layout();}};
  window.addEventListener('message',event=>{if(event.data?.novaAction==='panelPage'&&['catalog','player'].includes(event.data.kind))window.novaSetPanelPage(event.source,event.data.kind);});
  const closeAll=()=>{document.querySelectorAll('.panel-overlay.open,.app-overlay.open,#browser-overlay.open').forEach(node=>node.classList.remove('open'));dock.querySelectorAll('.dock-btn').forEach(button=>button.classList.remove('active','app-open'));};
  function navigate(name,button){
   closeAll();
   if(name==='home'){(button||dock.querySelector('.dock-btn')).classList.add('active');return;}
   if(name==='browser'){window.brOpen(button);return;}
   const frame=document.getElementById('frame-'+name),panel=document.getElementById('overlay-'+name);
   if(!frame||!panel)return;
   let current='';try{current=frame.contentWindow.location.pathname.split('/').pop();}catch{}
   if(!frame.getAttribute('src') || frame.getAttribute('src')==='about:blank' || (['games','apps'].includes(name) && current!==name+'.html'))frame.src=name+'.html';
   if(['games','apps'].includes(name))pageKinds.set(frame,'catalog');
   panel.classList.add('open');button?.classList.add('active','app-open');
   dock.classList.remove('hidden-in-game','dock-hidden');
  }
  window.novaClosePlayer=function(name,fromDock){
   const frame=document.getElementById('frame-'+name);
   if(fromDock){closeAll();dock.classList.remove('hidden-in-game','dock-hidden');dock.querySelector('.dock-btn')?.classList.add('active');if(frame)frame.src='about:blank';}
   else {if(frame)frame.src=name+'.html';navigate(name,document.getElementById('dock-'+name));}
   layout();
  };
  window.novaCloseAppPlayer=fromDock=>window.novaClosePlayer('apps',fromDock);
  dock.addEventListener('click',event=>{
   const button=event.target.closest('.dock-btn');if(!button)return;
   const name=button===dock.querySelector('.dock-btn')?'home':button.id.replace('dock-','');
   if(['home','games','apps','chat','settings','browser','music'].includes(name)){event.preventDefault();event.stopImmediatePropagation();navigate(name,button);}
   else closeAll();
  },true);
  const panelFrames=[...document.querySelectorAll('.panel-overlay iframe')];
  function catalogIsOpen(){
   const open=[...document.querySelectorAll('.panel-overlay.open,.app-overlay.open,#browser-overlay.open')];
   if(!open.length)return {home:true,catalog:false};
   if(open.length!==1)return {home:false,catalog:false};
   const frame=open[0].querySelector('iframe');
   if(!frame||!['frame-games','frame-apps'].includes(frame.id))return {home:false,catalog:false};
   let kind=pageKinds.get(frame);
   try{
    const marker=frame.contentDocument?.documentElement.dataset.novaPage;
    if(marker==='games'||marker==='apps')kind='catalog';
    else if(marker==='player')kind='player';
   }catch{}
   if(kind)return {home:false,catalog:kind==='catalog'};
   const source=frame.getAttribute('src')||'';
   return {home:false,catalog:/(?:^|\/)(games|apps)(?:\.html)?(?:[?#]|$)/.test(source)};

  }
  function layout(){
   const state=catalogIsOpen();
   document.documentElement.classList.toggle('nova-catalog-dock',state.catalog);
   document.documentElement.classList.toggle('nova-dock-away',!state.home&&!state.catalog);
   if(!state.catalog)return;

   const rect=dock.getBoundingClientRect(),left=dock.classList.contains('dock-left'),right=dock.classList.contains('dock-right');
   for(const [key,value] of [['--shell-left',left?Math.ceil(rect.right+8):0],['--shell-right',right?Math.ceil(innerWidth-rect.left+8):0],['--shell-bottom',!left&&!right?Math.ceil(innerHeight-rect.top+8):0]]){
    const next=Math.max(0,value)+'px';if(document.documentElement.style.getPropertyValue(key)!==next)document.documentElement.style.setProperty(key,next);
   }
  }
  new ResizeObserver(layout).observe(dock);new MutationObserver(layout).observe(dock,{attributes:true,attributeFilter:['class','style']});window.addEventListener('resize',layout);dock.addEventListener('transitionend',layout);layout();
  const panelObserver=new MutationObserver(layout);
  document.querySelectorAll('.panel-overlay,.app-overlay,#browser-overlay').forEach(panel=>panelObserver.observe(panel,{attributes:true,attributeFilter:['class']}));
  panelFrames.forEach(frame=>frame.addEventListener('load',()=>{
   try{const marker=frame.contentDocument?.documentElement.dataset.novaPage;if(marker)pageKinds.set(frame,marker==='player'?'player':'catalog');}catch{}
   layout();
  }));
  const request=new URLSearchParams(location.search).get('nova-page');
  if(request){const destination=request.split('?')[0],name=pages[destination];if(name){const home=document.getElementById('s-home');const open=()=>{if(home?.classList.contains('hidden'))return false;const frame=document.getElementById('frame-'+name);frame.src=request;navigate(name,document.getElementById('dock-'+name));const url=new URL(location.href);url.searchParams.delete('nova-page');history.replaceState(null,'',url);return true;};if(!open()){const observer=new MutationObserver(()=>{if(open())observer.disconnect();});observer.observe(home,{attributes:true,attributeFilter:['class']});}}}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
