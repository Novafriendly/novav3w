importScripts('/nova-search/scram/scramjet.all.js');
const {ScramjetServiceWorker}=$scramjetLoadWorker();
const scramjet=new ScramjetServiceWorker();
// Read packaged game files locally, then let Scramjet rewrite their HTML and assets.
// External game requests continue through the same relay as apps and Search.
scramjet.addEventListener('request', event => {
  if (event.url.origin !== 'https://nova-games.invalid') return;
  const allowed = /^\/(html-main\/html-main|assets-main\/assets-main|covers-main\/covers-main|Img)\//.test(event.url.pathname);
  if (!allowed) { event.response = Promise.reject(new Error('Game resource is outside the packaged game folders.')); return; }
  event.response = (async () => {
    let response = await fetch(new URL(event.url.pathname + event.url.search, self.location.origin).href, {method:event.method, credentials:'omit', redirect:'error'});
    if (/^\/html-main\/html-main\/[^/]+\.html(?:-[a-z]+)?$/i.test(event.url.pathname)) {
      const htmlHeaders = new Headers(response.headers);
      htmlHeaders.set('Content-Type','text/html; charset=utf-8');
      response = new Response(response.body,{status:response.status,statusText:response.statusText,headers:htmlHeaders});
    }
    const headers = Object.fromEntries(response.headers);
    response.rawHeaders = headers;
    response.rawResponse = {body:response.body,headers,status:response.status,statusText:response.statusText};
    response.finalURL = event.url.href;
    return response;
  })();
});

self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>event.respondWith((async()=>{await scramjet.loadConfig();return scramjet.route(event)?scramjet.fetch(event):fetch(event.request)})()));
