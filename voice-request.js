// Preserve HTTP status so callers can distinguish a cooldown from a closed room.
export function createVoiceRequest(identity, fetcher=fetch, now=Date.now){
 const blocked=new Map();
 return async body=>{
  const key=body.room?'room:'+body.room:'action:'+body.action;
  for(const [id,value] of blocked)if(value.until<=now())blocked.delete(id);
  const previous=blocked.get(key)||blocked.get('all');
  if(previous)throw previous.error;
  const user=await identity();
  const response=await fetcher('/api/voice',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await user.getIdToken()},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
  let data;try{data=await response.json()}catch{data={}}
  if(response.ok)return data;
  const error=Object.assign(new Error(data.error||(response.status===429?'Voice is busy. Please wait before trying again.':response.status===403?'Voice access was denied. Reconnect your voice ID or check your account restrictions.':'Voice connection failed.')),{status:response.status});
  if(response.status===429){const header=response.headers.get('Retry-After'),seconds=Number(header);error.retryAfterMs=Math.min(120000,Math.max(1000,header&&Number.isFinite(seconds)?seconds*1000:30000));blocked.set(body.action==='call'?'action:call':'all',{until:now()+error.retryAfterMs,error});}
  if(response.status===401||response.status===403||response.status===410)blocked.set(key,{until:now()+60000,error});
  throw error;
 };
}
