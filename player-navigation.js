(() => {
 if(window.parent===window)return;
 const player=location.pathname.includes('app-player')?'apps':'games';
 window.parent.postMessage({novaAction:'panelPage',kind:'player'},'*');
 try{window.parent.novaSetPanelPage?.(window,'player');}catch{}
 document.addEventListener('click',event=>{
  if(!event.target.closest('.close-btn'))return;
  event.preventDefault();event.stopImmediatePropagation();
  const fromDock=new URLSearchParams(location.search).get('from')==='dock';
  try{
   if(typeof window.parent.novaClosePlayer==='function'){window.parent.novaClosePlayer(player,fromDock);return;}
   if(typeof window.parent.closePanel==='function'){window.parent.closePanel(player);return;}
  }catch{}
  window.parent.postMessage({novaAction:'closeApp',app:player},'*');
 },true);
})();
