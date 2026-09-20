importScripts('/nova-search/scram/scramjet.all.js','/nova-search/game-asset-sources.js');
const {ScramjetServiceWorker}=$scramjetLoadWorker();
const scramjet=new ScramjetServiceWorker();
// Read packaged game files locally, then let Scramjet rewrite their HTML and assets.
// External game requests continue through the same relay as apps and Search.
scramjet.addEventListener('request', event => {
  if (event.url.origin !== 'https://nova-games.invalid') return;
  const allowed = /^\/(math-tutors-main|html-main\/html-main|assets-main\/assets-main|covers-main\/covers-main|Img)\//.test(event.url.pathname);
  if (!allowed) { event.response = Promise.reject(new Error('Game resource is outside the packaged game folders.')); return; }
  event.response = (async () => {
    let response = await fetch(new URL(event.url.pathname + event.url.search, self.location.origin).href, {method:event.method, credentials:'omit', redirect:'error'});
    if (/^\/(?:math-tutors-main|html-main\/html-main)\/[^/]+\.html(?:-[a-z]+)?$/i.test(event.url.pathname)) {
      const htmlHeaders = new Headers(response.headers);
      htmlHeaders.set('Content-Type','text/html; charset=utf-8');
      let html = await response.text();
      html = html.replace(/(<base\s+href=["'])([^"']+)(["'])/i,(match,before,base,after)=>{
        const original=self.NovaGameAssetSources[base];
        return original ? before+original.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+after : match;
      });
      htmlHeaders.delete('Content-Length');
      htmlHeaders.delete('Content-Encoding');
      response = new Response(html,{status:response.status,statusText:response.statusText,headers:htmlHeaders});
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
