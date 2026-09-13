import {basicReply} from './nova-ai-basic.js';
const sessions=new Map(),active=new Set();
export async function askNova(message,conversation){
  const clean=String(message).replace(/@Nova\s*AI/gi,'').trim();
  if(!clean)return 'Type a question after @Nova AI.';
  if(active.has(conversation))return 'Please wait for my current reply before sending another question.';
  active.add(conversation);
  try{
    const history=sessions.get(conversation)||[];
    const response=await fetch('/api/nova-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:clean,history}),signal:AbortSignal.timeout(28000)});
    let data;try{data=await response.json();}catch{return basicReply(clean);}
    if(!response.ok){if(data.code==='NOT_CONFIGURED')return basicReply(clean);return data.error||'Nova AI is unavailable. Please try again.';}
    if(typeof data.response!=='string'||!data.response.trim())return 'Nova AI returned an empty response. Please try again.';
    const next=[...history,{role:'user',text:clean},{role:'model',text:data.response.slice(0,4000)}];
    while(next.length>12||next.reduce((n,t)=>n+t.text.length,0)>16000)next.splice(0,2);
    sessions.set(conversation,next);return data.response;
  }catch{return 'I couldn’t reach the AI service. Please try again shortly.';}
  finally{active.delete(conversation);}
}
