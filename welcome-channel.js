export const isWelcome = message => message?.username === 'Nova Bot' && (message.type === 'welcome' || /^Welcome .+!\s*🎉\s*$/u.test(message.text || ''));
export function mountWelcome(area, subscribe) {
  let legacy={},current={},failed=false;
  const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n;};
  function paint(){
    const follow=area.scrollHeight-area.scrollTop-area.clientHeight<100;
    area.replaceChildren(node('header','nova-welcome-heading','Every new face, a new beginning.'),node('p','nova-welcome-intro','Welcome to Nova. Find your people, explore, and make yourself at home.'));
    const messages=[...Object.values(legacy),...Object.values(current)].filter(isWelcome).sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));
    const seen=new Set();
    for(const message of messages){const name=message.welcomeUser||(message.text||'').replace(/^Welcome /,'').replace(/!\s*🎉\s*$/u,'');if(seen.has(name))continue;seen.add(name);
      const card=node('article','nova-welcome-card',''),icon=node('span','nova-welcome-icon','✦'),body=node('div','','');body.append(node('small','','NOVA BOT · NEW ARRIVAL'),node('h3','',`Welcome, ${name}!`),node('p','','Glad you’re here. Your next favorite moment starts here.'));if(Number.isFinite(message.timestamp))body.append(node('time','',new Date(message.timestamp).toLocaleString()));card.append(icon,body);area.append(card);
    }
    if(!messages.length)area.append(node('p','nova-welcome-intro',failed?'Welcome messages could not load. Reopen this channel to retry.':'New arrivals will appear here.'));
    if(follow)area.scrollTop=area.scrollHeight;
  }
  const fail=()=>{failed=true;paint();};
  const stops=[subscribe('channels/announcements/messages',value=>{legacy=value||{};paint();},fail),subscribe('channels/welcome/messages',value=>{current=value||{};paint();},fail)];
  return ()=>stops.forEach(stop=>stop());
}
