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
        const node=document.getElementById(id),photo=window.NovaCommunity?.safeImage(self.profilePic)||'';if(!node)continue;
        const key=JSON.stringify([photo,name]);if(node.dataset.liveProfile===key && (photo ? node.querySelector('img')?.getAttribute('src')===photo : node.textContent===name.charAt(0).toUpperCase()))continue;
        node.dataset.liveProfile=key;node.replaceChildren();
        if(photo){const img=document.createElement('img');img.src=photo;img.alt='';node.appendChild(img)}else node.appendChild(document.createTextNode(name.charAt(0).toUpperCase()));
        const dot=document.createElement('div');dot.className=statusClass;node.appendChild(dot);
      }
    }
    document.querySelectorAll('[data-chat-profile],[data-profile-name],[data-profile-avatar]').forEach(node=>{
      const account=decode(node.dataset.chatProfile||node.dataset.profileName||node.dataset.profileAvatar),user=users[account];if(!user)return;
      const name=user.displayName||user.username||account;
      if(node.classList.contains('message-avatar')||node.hasAttribute('data-profile-avatar')){
        const url=window.NovaCommunity?.safeImage(user.profilePic)||'';
        if(node.dataset.currentPhoto===url && node.dataset.currentName===name)return;
        node.dataset.currentPhoto=url;node.dataset.currentName=name;node.replaceChildren();
        if(url){const img=document.createElement('img');img.src=url;img.alt='';img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:50%';node.appendChild(img)}else node.textContent=name.charAt(0).toUpperCase();
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

