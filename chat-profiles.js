const failedPictures=new Set();
export function paintProfileAvatar(node,name,picture,dotSelector){
 const initial=Array.from(String(name||'?').trim())[0]?.toUpperCase()||'?';
 const photo=window.NovaCommunity?.safeImage(picture)||'';
 const key=JSON.stringify([photo,initial]);
 if(node.dataset.avatarKey===key&&node.querySelector('[data-nova-initial]'))return;
 const dot=node.querySelector(dotSelector);node.replaceChildren();node.dataset.avatarKey=key;
 const fallback=document.createElement('span');fallback.dataset.novaInitial='true';fallback.textContent=initial;node.appendChild(fallback);
 if(photo&&!failedPictures.has(photo)){
  const img=document.createElement('img');img.alt='';img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit';
  img.onerror=()=>{if(failedPictures.size>256)failedPictures.clear();failedPictures.add(photo);img.remove();};img.src=photo;node.appendChild(img);
 }
 if(dot){dot.style.zIndex='1';node.appendChild(dot);}
}
export function syncChatProfiles({subscribe,currentAccount,onSelf}) {
  let users={},queued=false;
  const decode=value=>{try{return decodeURIComponent(value)}catch{return ''}};
  function paint(){
    queued=false;
    const self=users[currentAccount];
    if(self){
      const name=self.displayName||self.username||currentAccount;
      for(const id of ['profileName','settingsSidebarName']){const node=document.getElementById(id);if(node && node.textContent!==name)node.textContent=name;}
      for(const [id,statusClass] of [['profileAvatar','user-profile-status'],['settingsSidebarAvatar','settings-user-status']]){
        const node=document.getElementById(id);if(!node)continue;
        if(!node.querySelector('.'+statusClass)){const dot=document.createElement('div');dot.className=statusClass;node.appendChild(dot);}
        paintProfileAvatar(node,name,self.profilePic,'.'+statusClass);
      }
    }
    document.querySelectorAll('[data-chat-profile],[data-profile-name],[data-profile-avatar]').forEach(node=>{
      const account=decode(node.dataset.chatProfile||node.dataset.profileName||node.dataset.profileAvatar),user=users[account]||{username:account};
      const name=user.displayName||user.username||account;
      if(node.classList.contains('message-avatar')||node.hasAttribute('data-profile-avatar')){
        paintProfileAvatar(node,name,user.profilePic,'.status-indicator');
      }else if(node.textContent!==name)node.textContent=name;
    });
    const heading=document.getElementById('channelName');
    if(heading?.dataset.dmAccount && document.getElementById('messageInput')?.placeholder.startsWith('Message @')){
      const account=decode(heading.dataset.dmAccount),user=users[account];
      if(user){const label=user.displayName||account;const textNodes=[...heading.childNodes].filter(n=>n.nodeType===3);if(textNodes.length){if(textNodes[0].textContent!==label)textNodes[0].textContent=label;}document.getElementById('messageInput').placeholder='Message @'+label;}
    }
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  subscribe(value=>{users=value;const self=users[currentAccount];if(self){onSelf?.(self);try{localStorage.setItem('nova_profile_pic',self.profilePic||'')}catch{}}schedule()});
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
}

