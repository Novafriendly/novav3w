export function attachPoll(container, data, api) {
  if (!Array.isArray(data.options) || data.options.length < 2 || data.options.length > 4 || data.options.some(s=>typeof s !== 'string' || s.length>80) || !/^[a-zA-Z0-9-]+$/.test(data.id)) return () => {};
  const box=document.createElement('div'); box.className='nova-poll-options';
  const note=document.createElement('p'); note.className='nova-poll-note'; note.setAttribute('aria-live','polite');
  container.append(box,note);
  const name=api.state().name, validName=!!name && !/[.#$\[\]/]/.test(name), path=`novaPollVotes/${data.id}`;
  let votes={}, loaded=false, busy=false, disposed=false, failure="";
  const buttons=data.options.map((text,index)=>{
    const button=document.createElement('button');button.type='button';button.className='nova-poll-option';
    const fill=document.createElement('span');fill.className='nova-poll-fill';
    const label=document.createElement('span');label.textContent=text;
    const count=document.createElement('span');count.className='nova-poll-percent';
    button.append(fill,label,count);box.appendChild(button);
    button.onclick=async()=>{
      if (!loaded || busy || !validName || Object.hasOwn(votes,name) || api.isSiteBanned() || api.now() >= data.createdAt+60000) return;
      busy=true;failure="";render();
      try {
        const existing=await api.backend.read(`${path}/${name}`);
        if(existing !== null) { votes[name]=existing; return; }
        if(api.now() >= data.createdAt+60000) throw Error('Voting has ended.');
        await api.backend.write(`${path}/${name}`,index);
        votes[name]=index;
      } catch(error) {failure='Could not save your vote. Please try again.';}
      finally {busy=false;if(!disposed)render();}
    };
    return button;
  });
  function render(){
    const total=Object.values(votes).filter(v=>Number.isInteger(v)&&v>=0&&v<data.options.length).length;
    buttons.forEach((button,index)=>{
      const count=Object.values(votes).filter(v=>v===index).length, percent=total?Math.round(count/total*100):0;
      button.disabled=!loaded||busy||!validName||Object.hasOwn(votes,name)||api.isSiteBanned();
      button.classList.toggle('is-selected',votes[name]===index);
      button.querySelector('.nova-poll-fill').style.width=percent+'%';
      button.querySelector('.nova-poll-percent').textContent=total?percent+'%':'';
    });
    note.textContent=failure ? failure : !validName?'Sign in to vote.':!loaded?'Connecting…':busy?'Saving vote…':`${total} ${total===1?'vote':'votes'} · ${Object.hasOwn(votes,name)?'Your vote is in':'Choose one option'}`;
  }
  render();
  const stop=api.backend.subscribe(path,value=>{votes=value||{};loaded=true;if(!disposed)render();},()=>{note.textContent='Voting is unavailable. Please try the next poll.';});
  return ()=>{disposed=true;stop();};
}


