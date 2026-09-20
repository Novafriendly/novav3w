import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {scramjetPath} from '@mercuryworkshop/scramjet/path';
import {libcurlPath} from '@mercuryworkshop/libcurl-transport';
import {baremuxPath} from '@mercuryworkshop/bare-mux/node';
for(const [name,path] of [['scram',scramjetPath],['libcurl',libcurlPath],['baremux',baremuxPath]]){const out=new URL('../nova-search/'+name+'/',import.meta.url);await mkdir(out,{recursive:true});await cp(path,out,{recursive:true});}
console.log('Nova search assets ready.');

// The bundled transport creates HTTPSession before embedded WASM finishes on cold starts.
const transport=new URL('../nova-search/libcurl/index.mjs',import.meta.url);
let source=await readFile(transport,'utf8');
const needle='    libcurl.set_websocket(this.wisp);';
if(!source.includes(needle))throw Error('Transport changed; review WASM readiness patch.');
source=source.replace(needle,'    await libcurl.load_wasm();\n'+needle);
await writeFile(transport,source);

// Wisp 0.4.1 stores streams in an object; keep its per-host limit working.
const filterPath=new URL('../node_modules/@mercuryworkshop/wisp-js/src/server/filter.mjs',import.meta.url);
let filter=await readFile(filterPath,'utf8');
const brokenLoop='for (let stream of connection.streams) {';
const fixedLoop='for (let stream of Object.values(connection.streams)) {';
if (!filter.includes(brokenLoop) && !filter.includes(fixedLoop)) throw Error('Wisp changed; review stream-limit compatibility patch.');
await writeFile(filterPath,filter.replace(brokenLoop,fixedLoop));
// Keep game launch paths tied to files on disk, not catalog links.
const {readdir}=await import('node:fs/promises');
try {
 const names=await readdir(new URL('../math-tutors-main/',import.meta.url));
 const games={};
 for(const name of names.sort()) { const match=name.match(/^(\d+).*\.html(?:-[a-z]+)?$/i); if(match&&(!games[match[1]]||name===match[1]+'.html'))games[match[1]]=name; }
 await writeFile(new URL('../game-html-files.js',import.meta.url),'// Generated from local HTML filenames.\nwindow.NovaGameHtmlFiles='+JSON.stringify(games,null,2)+';\n');
} catch(error) { if(error.code!=='ENOENT')throw error; }
