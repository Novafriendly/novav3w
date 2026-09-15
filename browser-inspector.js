(() => {
  const shell=document.getElementById('browser-overlay')||document.querySelector('.browser');if(!shell)return;
  const nav=shell.querySelector('.br-nav-bar,.nav-bar');if(!nav)return;
  const launch=document.createElement('button');launch.className='br-nav-btn nav-btn nova-inspector-launch';launch.textContent='</>';launch.title='Inspect page';launch.setAttribute('aria-label','Inspect page');nav.appendChild(launch);
  const panel=document.createElement('section');panel.className='nova-inspector';panel.hidden=true;panel.setAttribute('aria-label','Page inspector');panel.innerHTML='<header><strong>Page inspector</strong><button data-close aria-label="Close inspector">×</button></header><p data-status></p><button data-refresh>Refresh elements</button> <button data-pick>Pick element</button><select aria-label="Page elements"></select><pre></pre>';shell.appendChild(panel);
  let doc=null,nodes=[],stopPick=null,lastFrame=null;
  const status=panel.querySelector('[data-status]'),list=panel.querySelector('select'),output=panel.querySelector('pre'),pick=panel.querySelector('[data-pick]');
  function details(node){if(!node)return;const css=node.ownerDocument.defaultView.getComputedStyle(node);output.textContent=node.outerHTML.slice(0,14000)+'\n\nCOMPUTED STYLES\n'+['display','position','width','height','color','background-color','font-family','font-size','margin','padding','border'].map(key=>key+': '+css.getPropertyValue(key)).join('\n');}
  function refresh(){stopPick?.();stopPick=null;doc=null;nodes=[];list.replaceChildren();output.textContent='';
    const frame=shell.querySelector('.br-view.active .br-frame.show,.tab-view.active .tab-frame.visible');lastFrame=frame;
    if(!frame){status.textContent='Open a website in this tab to inspect it.';pick.disabled=true;return;}
    try{doc=frame.contentDocument;if(!doc?.documentElement)throw Error();void doc.documentElement.tagName;}catch{status.textContent='Opening the proxy inspector… If it does not appear, the proxy needs its inspector update deployed.';pick.disabled=true;
      const origin=new URL(frame.src).origin;
      if(origin==='https://scracmjetfornovatester12340private.onrender.com')frame.contentWindow.postMessage({type:'nova-inspector-open'},origin);
      return;}
    status.textContent='Live page elements. Select an element to view its HTML and computed styles.';pick.disabled=false;
    nodes=[...doc.querySelectorAll('*')].slice(0,1500);nodes.forEach((node,i)=>{const option=document.createElement('option');option.value=i;option.textContent=node.tagName.toLowerCase()+(node.id?'#'+node.id:'')+(typeof node.className==='string'&&node.className?'.'+node.className.trim().split(/\s+/).join('.'):'');list.appendChild(option)});details(nodes[0]);
  }
  window.addEventListener('message',event=>{if(event.data?.type==='nova-inspector-ready' && event.origin==='https://scracmjetfornovatester12340private.onrender.com' && event.source===lastFrame?.contentWindow){panel.hidden=true;}});
  list.onchange=()=>details(nodes[Number(list.value)]);
  pick.onclick=()=>{if(!doc)return;stopPick?.();status.textContent='Click an element on the page to inspect it.';const click=event=>{event.preventDefault();event.stopPropagation();details(event.target);status.textContent='Selected element';stopPick();stopPick=null};doc.addEventListener('click',click,true);stopPick=()=>doc?.removeEventListener('click',click,true)};
  launch.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden)refresh();else stopPick?.()};panel.querySelector('[data-close]').onclick=()=>{panel.hidden=true;stopPick?.();launch.focus()};panel.querySelector('[data-refresh]').onclick=refresh;
  shell.addEventListener('load',event=>{if(!panel.hidden && event.target.tagName==='IFRAME')refresh()},true);
  setInterval(()=>{if(!panel.hidden){const frame=shell.querySelector('.br-view.active .br-frame.show,.tab-view.active .tab-frame.visible');if(frame!==lastFrame)refresh()}},700);
})();


