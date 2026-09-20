import {createVoiceRequest} from './voice-request.js';
import {createMiniCall} from './voice-mini.js';
import {callNotifications} from './voice-notifications.js';
import {mountVoiceAccount,voiceIdentity} from './voice-account.js';
import {createVoiceView,paintMembers,paintSpeaking,icon} from './voice-ui.js';
export function mountVoice(){
 const main=document.querySelector('.chat-main'),general=createVoiceView(),privateView=createVoiceView(true);
 main.append(general);mountVoiceAccount(general);
 const dialog=document.createElement('dialog');dialog.className='nova-call-dialog';const minimize=document.createElement('button');minimize.className='voice-minimize';minimize.textContent='Back to chat';minimize.onclick=()=>dialog.close();dialog.append(minimize,privateView);document.body.append(dialog);
 const tab=document.createElement('button');tab.className='channel nova-voice-tab';tab.innerHTML=icon('wave')+'<span>Voice Chat</span><span class="voice-tab-count">0 / 10</span>';document.getElementById('channelsList').before(tab);
 function openTab(){main.classList.add('nova-voice-view');general.hidden=false;tab.classList.add('active');tab.setAttribute('aria-pressed','true');refreshLobby();}
 function closeTab(){main.classList.remove('nova-voice-view');general.hidden=true;tab.classList.remove('active');tab.setAttribute('aria-pressed','false');}
 tab.onclick=openTab;for(const key of ['switchChannel','switchView']){const original=window[key];if(original)window[key]=function(...args){closeTab();return original.apply(this,args);};}
 const dm=document.createElement('button');dm.className='header-btn nova-dm-call';dm.title='Call this friend privately';dm.innerHTML=icon('phone')+'<span>Call friend</span>';document.querySelector('.header-actions')?.prepend(dm);
 const resume=document.createElement('button');resume.className='header-btn nova-dm-call';resume.hidden=true;resume.innerHTML=icon('phone')+'<span>Open call</span>';resume.onclick=()=>{if(call?.room==='server-general')openTab();else showPrivate();};document.querySelector('.header-actions')?.prepend(resume);
 let call=null,busy=false,muted=false,deaf=false,generation=0,pendingView=null,lobbyBusy=false,checking=false,audioContext=null,meterTimer=null,cameraBusy=false;const peers=new Map(),meters=new Map();
 const status=(view,text)=>{view.querySelector('[role=status]').textContent=text;updateMini();};
 const mini=createMiniCall({mute:()=>call?.view.querySelector('[data-mute]').click(),deafen:()=>call?.view.querySelector('[data-deafen]').click(),camera:()=>call?.view.querySelector('[data-camera]').click(),leave,open:()=>{revealChat();if(call?.room==='server-general')openTab();else showPrivate();}});
 function updateMini(){const view=call?.view||pendingView;mini.update(view&&(call||busy)?{name:call?.room==='server-general'?'General Voice':view.querySelector('h1').textContent,status:view.querySelector('[role=status]').textContent,muted,deaf,cameraOn:!!call?.cameraTrack,participants:call?.members||{},pending:!call}:null);}
 const request=createVoiceRequest(voiceIdentity);
 function showPrivate(){if(!dialog.open)dialog.showModal();}
 function controls(){for(const view of [general,privateView]){const active=call?.view===view,waiting=busy&&pendingView===view;const camera=view.querySelector('[data-camera]');camera.disabled=!active||cameraBusy;camera.querySelector('span').textContent=active&&call.cameraTrack?'Camera off':'Camera on';camera.setAttribute('aria-pressed',String(!!(active&&call.cameraTrack)));view.querySelector('[data-mute]').disabled=!active;view.querySelector('[data-deafen]').disabled=!active;view.querySelector('[data-leave]').disabled=!active&&!waiting;for(const [key,on,yes,no] of [['mute',muted,'Unmute','Mute'],['deafen',deaf,'Undeafen','Deafen']]){const button=view.querySelector('[data-'+key+']');button.querySelector('span').textContent=active&&on?yes:no;button.classList.toggle('is-selected',active&&on);button.setAttribute('aria-pressed',String(active&&on));}}
  general.querySelector('[data-join-general]').disabled=busy||!!call;resume.hidden=!call;updateMini();
 }
 function removeMeter(id){const meter=meters.get(id);if(meter){meter.source.disconnect();meter.analyser.disconnect();meter.silent?.disconnect();meters.delete(id);}}
 function watchAudio(id,stream){removeMeter(id);if(!audioContext||!stream)return;try{const source=audioContext.createMediaStreamSource(stream),analyser=audioContext.createAnalyser();analyser.fftSize=512;const silent=audioContext.createGain();silent.gain.value=0;source.connect(analyser);analyser.connect(silent);silent.connect(audioContext.destination);meters.set(id,{source,analyser,silent,data:new Float32Array(analyser.fftSize),last:0});}catch{}}
 function startMeters(){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;try{audioContext=new Context();audioContext.resume().catch(()=>{});audioContext.onstatechange=()=>{if(call&&audioContext?.state==='suspended')call.view.querySelector('[data-audio]').hidden=false;};meterTimer=setInterval(()=>{if(!call)return;for(const [id,m] of meters){m.analyser.getFloatTimeDomainData(m.data);const rms=Math.sqrt(m.data.reduce((sum,n)=>sum+n*n,0)/m.data.length);if(rms>.012&&!(id===call.session&&muted))m.last=Date.now();paintSpeaking(call.view,id,Date.now()-m.last<250&&!(id===call.session&&muted));}},100);}catch{}}
 function removePeer(id){const p=peers.get(id);if(!p)return;removeMeter(id);clearTimeout(p.connectionTimer);p.pc.close();p.video?.remove();p.audio.srcObject=null;p.audio.remove();peers.delete(id);}
 function leave(notifyServer=true){generation++;const old=call;call=null;for(const id of [...peers.keys()])removePeer(id);for(const id of [...meters.keys()])removeMeter(id);clearInterval(meterTimer);meterTimer=null;if(audioContext){audioContext.close().catch(()=>{});audioContext=null;}old?.cameraTrack?.stop();old?.view.querySelector('[data-videos]').replaceChildren();old?.stream.getTracks().forEach(t=>t.stop());if(old){if(notifyServer)request({action:'leave',room:old.room,session:old.session}).catch(()=>{});old.view.querySelector('[data-state]').textContent='Call ended';status(old.view,'You left the call.');paintMembers(old.view,{},'');}muted=deaf=false;controls();refreshLobby();}
 async function join(room,target=null,friend='',background=false){
  const view=room==='server-general'?general:privateView;
  if(call||busy){status(view,'Leave your current call before starting another.');return;}
  if(view===general)openTab();else{if(!background)showPrivate();privateView.querySelector('h1').textContent=friend?'Call with '+friend:'Private call';}
  busy=true;pendingView=view;const version=++generation;controls();status(view,'Connecting your microphone…');view.querySelector('[data-state]').textContent='Connecting';startMeters();let stream,joined;
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw Error('Voice requires microphone support and HTTPS.');
   await voiceIdentity();await request({action:'invites'});if(version!==generation)return;
   stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
   if(version!==generation){stream.getTracks().forEach(t=>t.stop());return;}
   if(target)room=(await request({action:'call',target})).room;
   const session=crypto.randomUUID(),config=await request({action:'join',room,session});joined={room,session};
   if(version!==generation){stream.getTracks().forEach(t=>t.stop());await request({action:'leave',...joined});return;}
   call={room,session,stream,view,iceServers:config.iceServers,relayConfigured:config.relayConfigured,ack:[],seen:new Set()};audioContext?.resume().catch(()=>{});watchAudio(session,stream);if(audioContext?.state==='suspended')view.querySelector('[data-audio]').hidden=false;view.querySelector('[data-direct]').replaceChildren();view.querySelector('[data-state]').textContent=target?'Ringing…':view===general?'In General Voice':'Private call';status(view,target?'Waiting for your friend to answer…':'Microphone ready · Waiting for another person’s audio connection.');poll(version);
  }catch(e){stream?.getTracks().forEach(t=>t.stop());if(joined)request({action:'leave',...joined}).catch(()=>{});if(version===generation){leave();status(view,e.name==='NotAllowedError'?'Allow microphone access to join the call.':e.message);}}
  finally{busy=false;pendingView=null;controls();}
 }
 async function signal(id,data){if(call)await request({action:'signal',room:call.room,session:call.session,to:id,signal:data});}
 function connectionStatus(current){
  if(call!==current)return;const all=[...peers.values()],connected=all.filter(p=>p.pc.connectionState==='connected').length;
  const failed=all.some(p=>p.pc.connectionState==='failed'||p.timedOut);
  current.view.querySelector('[data-state]').textContent=failed?'Connection blocked':connected===all.length&&all.length?'Connected':'Connecting audio';
  status(current.view,failed?(current.relayConfigured?'Audio could not connect through this network. Check your relay settings or try another permitted network.':'Audio could not connect. The owner needs to configure a TURN relay for networks that block direct calls.'):all.length&&connected===all.length?'Connected · Your conversation is live':connected+' / '+all.length+' audio connections ready');
 }
 function videoTile(view,id,stream,label){
  const tile=document.createElement('figure'),video=document.createElement('video'),caption=document.createElement('figcaption');tile.className='voice-video';tile.dataset.videoSession=id;video.autoplay=true;video.playsInline=true;video.muted=true;video.srcObject=stream;caption.textContent=label;tile.append(video,caption);view.querySelector('[data-videos]').append(tile);video.play().catch(()=>{});return tile;
 }
 async function attachCamera(p){const transceiver=p.pc.getTransceivers().find(t=>t.receiver.track.kind==='video');if(transceiver){transceiver.direction='sendrecv';await transceiver.sender.replaceTrack(call?.cameraTrack||null);}}
 async function toggleCamera(){
  if(!call||cameraBusy)return;const current=call;cameraBusy=true;controls();let captured;
  try{if(current.cameraTrack){current.cameraTrack.stop();current.cameraTrack=null;current.localVideo?.remove();current.localVideo=null;}else{
   captured=await navigator.mediaDevices.getUserMedia({audio:false,video:{width:{ideal:640},height:{ideal:360},frameRate:{ideal:15,max:24}}});
   if(call!==current){captured.getTracks().forEach(t=>t.stop());return;}
   current.cameraTrack=captured.getVideoTracks()[0];current.cameraTrack.onended=()=>{if(call===current){current.cameraTrack=null;current.localVideo?.remove();for(const p of peers.values())attachCamera(p).catch(()=>{});controls();}};
   current.localVideo=videoTile(current.view,current.session,captured,'You · Camera preview');
  }await Promise.all([...peers.values()].map(attachCamera));
  }catch(e){captured?.getTracks().forEach(t=>t.stop());if(call===current){current.cameraTrack?.stop();current.cameraTrack=null;current.localVideo?.remove();await Promise.allSettled([...peers.values()].map(attachCamera));status(current.view,e.name==='NotAllowedError'?'Allow camera access to share video. Your microphone call is still active.':'Camera unavailable. Your microphone call is still active.');}}
  finally{cameraBusy=false;controls();}
 }
 function peer(id){if(peers.has(id))return peers.get(id);const current=call,pc=new RTCPeerConnection({iceServers:current.iceServers}),audio=document.createElement('audio');audio.autoplay=true;audio.muted=deaf;document.body.append(audio);const p={pc,audio,candidates:[]};peers.set(id,p);current.stream.getAudioTracks().forEach(t=>pc.addTrack(t,current.stream));
  if(current.session<id)pc.addTransceiver(current.cameraTrack||'video',{direction:'sendrecv'});
  p.connectionTimer=setTimeout(()=>{if(call===current&&pc.connectionState!=='connected'){p.timedOut=true;connectionStatus(current);}},20000);
  pc.onicecandidate=e=>{if(e.candidate&&call===current)signal(id,{type:'candidate',candidate:e.candidate.toJSON()}).catch(()=>{if(call===current)status(current.view,'Connection details could not be sent. Leave and rejoin to retry.');});};
  pc.ontrack=e=>{if(call!==current)return;const stream=new MediaStream([e.track]);if(e.track.kind==='video'){p.video?.remove();p.video=videoTile(current.view,id,stream,current.members?.[id]?.name||'Friend');p.video.hidden=!current.members?.[id]?.camera;return;}audio.srcObject=stream;watchAudio(id,stream);audio.play().catch(()=>{current.view.querySelector('[data-audio]').hidden=false;});};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='connected'){clearTimeout(p.connectionTimer);p.timedOut=false;}connectionStatus(current);};return p;
 }
 async function poll(version){if(!call||generation!==version)return;try{const current=call,data=await request({action:'poll',room:current.room,session:current.session,ack:current.ack,muted,deafened:deaf,camera:!!current.cameraTrack});if(call!==current)return;current.ack=[];current.members=data.members;updateMini();paintMembers(current.view,data.members,current.session);for(const [id,p]of peers){if(p.video){p.video.hidden=!data.members[id]?.camera;p.video.querySelector('figcaption').textContent=data.members[id]?.name||'Friend';}}const ids=Object.keys(data.members);if(current.room==='server-general')countRoom(ids.length);
   for(const id of [...peers.keys()])if(!ids.includes(id))removePeer(id);
   for(const id of ids){if(id===current.session)continue;const fresh=!peers.has(id),p=peer(id);if(fresh&&current.session<id){await p.pc.setLocalDescription(await p.pc.createOffer());await signal(id,{type:'offer',sdp:p.pc.localDescription.sdp});}}
   for(const item of data.signals){if(call!==current)return;current.ack.push(item.id);if(current.seen.has(item.id)||!ids.includes(item.from))continue;const p=peer(item.from),s=item.signal;if(s.type==='candidate'){if(p.pc.remoteDescription)await p.pc.addIceCandidate(s.candidate);else p.candidates.push(s.candidate);}else{await p.pc.setRemoteDescription({type:s.type,sdp:s.sdp});for(const candidate of p.candidates)await p.pc.addIceCandidate(candidate);p.candidates=[];if(s.type==='offer'){await attachCamera(p);await p.pc.setLocalDescription(await p.pc.createAnswer());await signal(item.from,{type:'answer',sdp:p.pc.localDescription.sdp});}}current.seen.add(item.id);}
  }catch(e){if(generation!==version)return;const current=call;if(current&&(e.status===429||e.status>=500||e.name==='TimeoutError'||e.name==='TypeError')){current.failures=(current.failures||0)+1;if(current.failures<=3){status(current.view,e.message+' · Retrying shortly…');setTimeout(()=>poll(version),e.retryAfterMs||Math.min(15000,2000*2**current.failures));return;}}const view=call?.view;leave(![401,403,410].includes(e.status));if(view)status(view,e.message);return;}if(call)call.failures=0;setTimeout(()=>poll(version),2000);
 }
 function countRoom(count){tab.querySelector('.voice-tab-count').textContent=count+' / 10';general.querySelector('[data-count]').textContent=String(count);}
 async function refreshLobby(){if(lobbyBusy||call?.room==='server-general')return;lobbyBusy=true;try{const data=await request({action:'lobby'});if(call?.room!=='server-general'){paintMembers(general,data.members,'');countRoom(Object.keys(data.members).length);}}catch(e){if(!general.hidden)status(general,e.message);}finally{lobbyBusy=false;}}
 for(const view of [general,privateView]){
  view.querySelector('[data-leave]').onclick=()=>leave();view.querySelector('[data-camera]').onclick=toggleCamera;
  view.querySelector('[data-mute]').onclick=()=>{if(call?.view!==view)return;muted=!muted;call.stream.getAudioTracks().forEach(t=>t.enabled=!muted);controls();paintSpeaking(view,call.session,false);};
  view.querySelector('[data-deafen]').onclick=()=>{if(call?.view!==view)return;deaf=!deaf;for(const p of peers.values())p.audio.muted=deaf;controls();};
  view.querySelector('[data-audio]').onclick=async()=>{try{await audioContext?.resume();await Promise.all([...peers.values()].map(p=>p.audio.play()));view.querySelector('[data-audio]').hidden=!audioContext||audioContext.state==='running';}catch{status(view,'Audio is blocked by the browser. Allow sound for Nova, then press Enable audio again.');}};
 }
 const heading=document.getElementById('channelName');function dmTarget(){try{return decodeURIComponent(heading.dataset.dmAccount||'');}catch{return '';}}function paint(){dm.hidden=!dmTarget();}new MutationObserver(paint).observe(heading,{attributes:true,attributeFilter:['data-dm-account']});paint();
 dm.onclick=async()=>{if(call){resume.onclick();return;}showPrivate();const name=dmTarget();privateView.querySelector('h1').textContent='Call '+name;privateView.querySelector('[data-state]').textContent='Ready to call';const area=privateView.querySelector('[data-direct]');area.replaceChildren();paintMembers(privateView,{},'');status(privateView,'Finding your friend…');try{const data=await request({action:'peers',target:name});status(privateView,data.peers.length?'Choose Call user when you’re ready. Confirm the device under Details if needed.':'Your friend is offline. Ask them to open Nova Chat.');for(const item of data.peers){const choice=document.createElement('div');choice.className='voice-person-choice';const avatar=document.createElement('span');avatar.className='voice-person-avatar';avatar.textContent=item.name.slice(0,1).toUpperCase();if(/^(https?:\/\/|data:image\/(png|jpeg|gif|webp);base64,)/i.test(item.picture||'')){const img=document.createElement('img');img.src=item.picture;img.alt='';img.onerror=()=>img.remove();avatar.append(img);}const label=document.createElement('strong');label.textContent=item.name;const details=document.createElement('details'),summary=document.createElement('summary'),id=document.createElement('code');summary.textContent='Device details';id.textContent=item.id;details.append(summary,id);const b=document.createElement('button');b.className='voice-call-user';b.textContent='Call user';b.onclick=()=>join(null,item.id,item.name);choice.append(avatar,label,b,details);area.append(choice);}}catch(e){status(privateView,e.message);}};
 window.novaJoinServerVoice=()=>join('server-general');general.querySelector('[data-join-general]').onclick=window.novaJoinServerVoice;
 function revealChat(){try{if(window.frameElement?.closest('.panel-overlay')&&!window.frameElement.closest('.panel-overlay').classList.contains('open'))window.parent.openPanel?.('chat');}catch{}}
 const notices=callNotifications({reveal:()=>{},accept:async invite=>{if(call||busy)throw Error('Leave your current call first.');await join(invite.room,null,invite.from,true);if(!call)throw Error(privateView.querySelector('[role=status]').textContent||'Call could not connect.');},decline:invite=>request({action:'decline',room:invite.room})});
 const timer=setInterval(async()=>{if(checking)return;try{const hidden=window.frameElement?.closest('.panel-overlay')&&!window.frameElement.closest('.panel-overlay').classList.contains('open');if((call||busy)&&window.NovaCommunity&&!window.NovaCommunity.canSend())leave();checking=true;const data=await request({action:'invites'});notices.sync(data.invites);dm.classList.toggle('has-incoming-call',data.invites.length>0);if(!general.hidden&&!hidden)refreshLobby();}catch(e){if(!general.hidden)status(general,e.message);}finally{checking=false;}},3000);
 window.addEventListener('pagehide',()=>{clearInterval(timer);notices.destroy();leave();mini.destroy();});paintMembers(general,{},'');controls();
}


