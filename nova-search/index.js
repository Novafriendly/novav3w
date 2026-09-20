"use strict";
const form=document.getElementById('sj-form'),address=document.getElementById('sj-address'),error=document.getElementById('sj-error'),errorCode=document.getElementById('sj-error-code');
const {ScramjetController}=$scramjetLoadController();
const scramjet=new ScramjetController({prefix:'/nova-search/proxy/',files:{wasm:'/nova-search/scram/scramjet.wasm.wasm',all:'/nova-search/scram/scramjet.all.js',sync:'/nova-search/scram/scramjet.sync.js'}});
const connection=new BareMux.BareMuxConnection('/nova-search/baremux/worker.js');
let frame,busy=false;
const ready=(async()=>{await scramjet.init();const registration=await navigator.serviceWorker.register('/nova-search/sw.js',{scope:'/nova-search/',updateViaCache:'none'});const installing=registration.installing||registration.waiting;if(installing&&installing.state!=='activated')await new Promise((resolve,reject)=>{installing.addEventListener('statechange',()=>{if(installing.state==='activated')resolve();if(installing.state==='redundant')reject(new Error('Search worker could not update.'));});});await navigator.serviceWorker.ready;await connection.setTransport('/nova-search/libcurl/index.mjs?v=2',[{websocket:(location.protocol==='https:'?'wss://':'ws://')+location.host+'/api/wisp/'}]);})();
ready.catch(()=>{});
async function navigate(value){if(busy)return;busy=true;error.textContent='Connecting…';errorCode.textContent='';try{await ready;const url=search(value,document.getElementById('sj-search-engine').value);if(!/^https?:\/\//i.test(url))throw Error('Use an http or https address.');if(!frame){frame=scramjet.createFrame();frame.frame.id='sj-frame';document.body.append(frame.frame)}frame.go(url);error.textContent='';}catch(e){document.documentElement.classList.add('search-error');error.textContent='Search could not start. Refresh to try again.';errorCode.textContent=e.message||String(e);}finally{busy=false}}
form.addEventListener('submit',event=>{event.preventDefault();navigate(address.value)});
const target=new URLSearchParams(location.search).get('url');if(target){address.value=target;navigate(target)};

document.getElementById('reconnect').onclick=()=>location.reload();

