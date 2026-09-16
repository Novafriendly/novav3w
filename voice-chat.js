import {mountVoiceAccount} from './voice-account.js';
import {getApp} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
export function mountVoice(){
 const panel=document.createElement('section');panel.className='nova-voice';panel.innerHTML='<header><strong>Voice chat</strong><span data-state>Not connected</span></header><div data-members></div><div class="voice-actions"><button data-mute disabled>Mute</button><button data-deafen disabled>Deafen</button><button data-leave disabled>Leave</button><button data-audio hidden>Enable audio</button></div><p role="status"></p><div data-incoming></div>';
 document.body.append(panel);mountVoiceAccount(panel);const status=panel.querySelector('[role=status]'),members=panel.querySelector('[data-members]');
 const dm=document.createElement('button');dm.className='header-btn';dm.title='Start voice call';dm.textContent='☎ Call';document.querySelector('.header-actions')?.prepend(dm);
 let call=null,busy=false,muted=false,deaf=false,generation=0;const peers=new Map();
 async function request(body,login=false){const auth=getAuth(getApp());let user=auth.currentUser;if(!user&&login)user=(await signInWithPopup(auth,new GoogleAuthProvider())).user;if(!user)throw Error('Sign in with Google to use voice chat.');const r=await fetch('/api/voice',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await user.getIdToken()},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});const result=await r.json();if(!r.ok)throw Error(result.error||'Voice connection failed.');return result;}
 function removePeer(id){const p=peers.get(id);if(!p)return;p.pc.close();p.audio.srcObject=null;p.audio.remove();peers.delete(id);}
 function leave(){generation++;const old=call;call=null;for(const id of [...peers.keys()])removePeer(id);old?.stream.getTracks().forEach(track=>track.stop());if(old)request({action:'leave',room:old.room,session:old.session}).catch(()=>{});panel.querySelector('[data-state]').textContent='Not connected';members.textContent='';panel.querySelectorAll('[data-mute],[data-deafen],[data-leave]').forEach(b=>b.disabled=true);muted=deaf=false;panel.querySelector('[data-mute]').textContent='Mute';panel.querySelector('[data-deafen]').textContent='Deafen';}
 async function join(room,target){if(call||busy){status.textContent='Leave your current call first.';return;}busy=true;const version=++generation;let stream,joined;try{
  if(!navigator.mediaDevices?.getUserMedia)throw Error('Voice needs HTTPS and a browser with microphone support.');
  const auth=getAuth(getApp());if(!auth.currentUser)await signInWithPopup(auth,new GoogleAuthProvider());
  await request({action:'invites'});
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
  if(version!==generation){stream.getTracks().forEach(t=>t.stop());return;}
  if(target)room=(await request({action:'call',target})).room;
  const session=crypto.randomUUID();const config=await request({action:'join',room,session});joined={room,session};
  if(version!==generation){stream.getTracks().forEach(t=>t.stop());await request({action:'leave',...joined});return;}
  call={room,session,stream,iceServers:config.iceServers,ack:[],seen:new Set()};
  panel.querySelector('[data-state]').textContent=room==='server-general'?'General Voice':'DM call';panel.querySelectorAll('[data-mute],[data-deafen],[data-leave]').forEach(b=>b.disabled=false);
  status.textContent=config.relayConfigured?'Microphone connected. Waiting for other users…':'Microphone connected. Some networks may need a TURN relay.';poll(version);
 }catch(e){stream?.getTracks().forEach(t=>t.stop());if(joined)request({action:'leave',...joined}).catch(()=>{});status.textContent=e.name==='NotAllowedError'?'Microphone permission was denied. Allow it to join voice.':e.message;}finally{busy=false;}}
 async function signal(id,data){if(call)await request({action:'signal',room:call.room,session:call.session,to:id,signal:data});}
 function peer(id){if(peers.has(id))return peers.get(id);const pc=new RTCPeerConnection({iceServers:call.iceServers}),audio=document.createElement('audio');audio.autoplay=true;audio.muted=deaf;document.body.append(audio);const p={pc,audio,candidates:[]};peers.set(id,p);call.stream.getTracks().forEach(t=>pc.addTrack(t,call.stream));pc.onicecandidate=e=>{if(e.candidate)signal(id,{type:'candidate',candidate:e.candidate.toJSON()}).catch(()=>{});};pc.ontrack=e=>{audio.srcObject=e.streams[0];audio.play().catch(()=>{panel.querySelector('[data-audio]').hidden=false;});};pc.onconnectionstatechange=()=>{if(pc.connectionState==='connected')status.textContent='Connected';if(pc.connectionState==='failed')status.textContent='Could not connect audio. Leave and rejoin; this network may require a TURN relay.';};return p;}
 async function poll(version){if(!call||generation!==version)return;try{
  const current=call,data=await request({action:'poll',room:current.room,session:current.session,ack:current.ack});if(call!==current)return;current.ack=[];
  const ids=Object.keys(data.members);members.textContent=Object.values(data.members).map(m=>m.account).join(' · ');
  for(const id of [...peers.keys()])if(!ids.includes(id))removePeer(id);
  for(const id of ids){if(id===current.session)continue;const fresh=!peers.has(id),p=peer(id);if(fresh&&current.session<id){await p.pc.setLocalDescription(await p.pc.createOffer());await signal(id,{type:'offer',sdp:p.pc.localDescription.sdp});}}
  for(const item of data.signals){current.ack.push(item.id);if(current.seen.has(item.id)||!ids.includes(item.from))continue;const p=peer(item.from),s=item.signal;
   if(s.type==='candidate'){if(p.pc.remoteDescription)await p.pc.addIceCandidate(s.candidate);else p.candidates.push(s.candidate);}
   else{await p.pc.setRemoteDescription({type:s.type,sdp:s.sdp});for(const candidate of p.candidates)await p.pc.addIceCandidate(candidate);p.candidates=[];if(s.type==='offer'){await p.pc.setLocalDescription(await p.pc.createAnswer());await signal(item.from,{type:'answer',sdp:p.pc.localDescription.sdp});}}
   current.seen.add(item.id);
  }
 }catch(e){if(generation===version){status.textContent=e.message;leave();}return;}setTimeout(()=>poll(version),1500);}
 panel.querySelector('[data-leave]').onclick=leave;
 panel.querySelector('[data-mute]').onclick=e=>{muted=!muted;call?.stream.getAudioTracks().forEach(t=>t.enabled=!muted);e.target.textContent=muted?'Unmute':'Mute';e.target.setAttribute('aria-pressed',String(muted));};
 panel.querySelector('[data-deafen]').onclick=e=>{deaf=!deaf;for(const p of peers.values())p.audio.muted=deaf;e.target.textContent=deaf?'Undeafen':'Deafen';e.target.setAttribute('aria-pressed',String(deaf));};
 panel.querySelector('[data-audio]').onclick=()=>{for(const p of peers.values())p.audio.play().catch(()=>{});panel.querySelector('[data-audio]').hidden=true;};
 const heading=document.getElementById('channelName');function dmTarget(){try{return decodeURIComponent(heading.dataset.dmAccount||'');}catch{return '';}}function paint(){dm.hidden=!dmTarget();}new MutationObserver(paint).observe(heading,{attributes:true,attributeFilter:['data-dm-account']});paint();dm.onclick=()=>join(null,dmTarget());
 window.novaJoinServerVoice=()=>join('server-general');
 const channels=document.getElementById('channelsList');function addRoom(){if(channels.querySelector('[data-voice-room]'))return;const room=document.createElement('button');room.className='channel nova-voice-room';room.dataset.voiceRoom='general';room.textContent='♬ General Voice';room.onclick=window.novaJoinServerVoice;channels.append(room);}new MutationObserver(addRoom).observe(channels,{childList:true});addRoom();
 let checking=false;const timer=setInterval(async()=>{if(checking)return;try{
  if(call){try{if(window.frameElement?.closest('.panel-overlay')&&!window.frameElement.closest('.panel-overlay').classList.contains('open'))leave();}catch{}if(window.NovaCommunity&&!window.NovaCommunity.canSend())leave();}
  if(!getAuth(getApp()).currentUser)return;checking=true;const data=await request({action:'invites'});const incoming=panel.querySelector('[data-incoming]');incoming.replaceChildren();
  for(const invite of data.invites){const box=document.createElement('div'),label=document.createElement('span');label.textContent=invite.from+' is calling';box.append(label);for(const action of ['Accept','Decline']){const b=document.createElement('button');b.textContent=action;b.onclick=()=>{box.remove();if(action==='Accept')join(invite.room);else request({action:'decline',room:invite.room}).catch(()=>{});};box.append(b);}incoming.append(box);}
 }catch{}finally{checking=false;}},5000);
 window.addEventListener('pagehide',()=>{clearInterval(timer);leave();});
}
