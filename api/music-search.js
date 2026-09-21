// Fixed Apple search endpoint; never accepts arbitrary upstream URLs.
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');
 const send=(status,body)=>{res.statusCode=status;res.end(JSON.stringify(body));};
 if(req.method!=='GET'){res.setHeader('Allow','GET');return send(405,{error:'Use GET for music search.'});}
 const term=new URL(req.url,'https://nova.local').searchParams.get('term')?.trim();
 if(!term||term.length>150)return send(400,{error:'Enter a song or artist (up to 150 characters).'});
 try{
  const upstream=new URL('https://itunes.apple.com/search');
  upstream.search=new URLSearchParams({entity:'song',limit:'30',term}).toString();
  const response=await fetch(upstream,{signal:AbortSignal.timeout(10000),headers:{Accept:'application/json'}});
  if(!response.ok)return send(502,{error:'Music search is temporarily unavailable. Try again shortly.'});
  const data=await response.json();
  if(!Array.isArray(data.results))throw new Error('Invalid search response');
  const results=data.results.map(({trackId,trackName,artistName,artworkUrl100,previewUrl})=>({trackId,trackName,artistName,artworkUrl100,previewUrl}));
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
  return send(200,{results});
 }catch{return send(502,{error:'Music search could not connect. Please try again.'});}
}
