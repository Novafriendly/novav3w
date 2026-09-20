import {createServer} from 'node:http';
import {server as wisp,logging} from '@mercuryworkshop/wisp-js/server';
logging.set_level(logging.NONE);
Object.assign(wisp.options,{allow_udp_streams:false,allow_private_ips:false,allow_loopback_ips:false,allow_direct_ip:false,port_whitelist:[80,443],stream_limit_per_host:32,stream_limit_total:128});
const server=createServer((req,res)=>{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({service:'nova-search',websocket:true}));});
server.on('upgrade',(req,socket,head)=>{
 let origin;try{origin=new URL(req.headers.origin)}catch{socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
 const host=req.headers['x-forwarded-host']||req.headers.host;
 if(origin.host!==host){socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
 // Vercel rewrites may remove the trailing slash required by Wisp.
 req.url='/api/wisp/';
 wisp.routeRequest(req,socket,head);
});
export default server;
