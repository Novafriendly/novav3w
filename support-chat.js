const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./support-glass.css',import.meta.url);document.head.append(style);

export function mountAppealConversation(container,api,path,account){
  const self=api.state().name;
  const panel=document.createElement('section');panel.className='nova-support-chat';
  panel.innerHTML='<header><span class="nova-support-kicker">NOVA SUPPORT</span><h3>Appeal conversation</h3><p>Talk with the team about your request.</p></header><div class="nova-support-messages" role="log" aria-live="polite"></div><form><label class="nova-support-label">Your message<textarea required maxlength="1000" rows="2" placeholder="Write a message…"></textarea></label><div class="nova-support-actions"><button type="submit">Send message</button></div><p role="status"></p></form>';
  container.append(panel);
  const list=panel.querySelector('[role=log]'),form=panel.querySelector('form'),input=panel.querySelector('textarea'),status=panel.querySelector('[role=status]');
  let request=null,busy=false,disposed=false;
  const roles=user=>[user?.role,...(Array.isArray(user?.roles)?user.roles:[])];
  async function authorize(){if(self===account)return;const user=await api.backend.read('users/'+self);if(!roles(user).some(r=>['Owner','Admin'].includes(r)))throw Error('Only this user and the support team can join this appeal.');}
  async function append(text){await api.backend.write(path+'/messages/'+crypto.randomUUID(),{from:self,text,timestamp:api.backend.timestamp(),isAdmin:self!==account});}
  const stop=api.backend.subscribe(path,value=>{
    request=value;list.replaceChildren();
    for(const message of Object.values(value?.messages||{}).sort((a,b)=>(a.timestamp||0)-(b.timestamp||0))){
      const bubble=document.createElement('article');bubble.className='nova-support-bubble'+(message.from===self?' is-self':'')+(message.isAI?' is-ai':'');
      const name=document.createElement('strong');name.textContent=message.from+(message.isAdmin?' · Staff':'');
      const text=document.createElement('p');text.textContent=message.text;
      bubble.append(name,text);list.append(bubble);
    }
    if(!list.children.length)list.textContent='Your conversation starts here. Send a message to the support team.';
    list.scrollTop=list.scrollHeight;
    const closed=!value||['approved','rejected'].includes(value.status);form.hidden=closed;
    if(closed)status.textContent='This appeal has been closed.';
  },()=>{status.textContent='Could not connect to the conversation. Reopen it to retry.';});
  async function run(){if(busy||!request)return;busy=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{await authorize();const latest=await api.backend.read(path);if(!latest||['approved','rejected'].includes(latest.status))throw Error('This appeal has been closed.');
      const text=input.value.trim();if(!text)return;await append(text);input.value='';
      status.textContent='';
    }catch(error){status.textContent=error.message||'Could not send. Please try again.';}finally{busy=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
  }
  form.onsubmit=async e=>{e.preventDefault();await run();};
  return()=>{disposed=true;stop();panel.remove();};
}

export function mountLegacyAppealChat(){
  let closeCurrent=()=>{};
  window.joinUnbanChat=async account=>{
    const api=window.NovaCommunity;if(!api)return;
    const self=api.state().name,user=await api.backend.read('users/'+self);
    if(account!==self&&![user?.role,...(user?.roles||[])].some(r=>['Owner','Admin'].includes(r)))return;
    closeCurrent();const dialog=document.createElement('dialog');dialog.className='nova-support-dialog';
    const close=document.createElement('button');close.className='nova-support-close';close.textContent='Close';dialog.append(close);document.body.append(dialog);
    const stop=mountAppealConversation(dialog,api,'unbanRequests/'+account,account);
    if([user?.role,...(user?.roles||[])].includes('Owner')){
      const approve=document.createElement('button');approve.className='nova-support-close';approve.textContent='Approve chat unban';dialog.append(approve);
      approve.onclick=async()=>{approve.disabled=true;try{
        const latestUser=await api.backend.read('users/'+self);if(![latestUser?.role,...(latestUser?.roles||[])].includes('Owner'))throw Error('Owner access required.');
        await api.backend.update({['bans/'+account]:null,['novaModeration/'+account+'/chatBan']:null,['users/'+account+'/banned']:false,['unbanRequests/'+account+'/status']:'approved',['unbanRequests/'+account+'/reviewedBy']:self});
        dialog.close();
      }catch(e){approve.textContent=e.message;}finally{approve.disabled=false;}};
    }
    dialog.onclose=()=>{stop();dialog.remove();};close.onclick=()=>dialog.close();closeCurrent=()=>dialog.close();dialog.showModal();
  };
  const target=document.getElementById('requestPendingMsg');
  const connect=setInterval(()=>{
    const api=window.NovaCommunity,account=api?.state().name;if(!account)return;clearInterval(connect);
    const stop=api.backend.subscribe('unbanRequests/'+account,request=>{
      if(!target)return;
      target.style.display=request&&!['approved','rejected'].includes(request.status)?'block':'none';
    },()=>{});
    window.addEventListener('pagehide',()=>stop(),{once:true});
  },250);
  if(target){const button=document.createElement('button');button.className='banned-btn';button.textContent='Open appeal conversation';button.onclick=()=>window.joinUnbanChat(window.NovaCommunity?.state().name);target.append(button);}
}
