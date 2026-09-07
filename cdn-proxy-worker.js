// Service Worker to proxy CDN requests through Vercel
// This intercepts blocked CDN requests and fetches them server-side

const CDN_MAPPINGS = {
  'cdn.jsdelivr.net': 'https://cdn.jsdelivr.net',
  'cdn.statically.io': 'https://cdn.statically.io',
  'raw.githubusercontent.com': 'https://raw.githubusercontent.com'
};

// Install service worker
self.addEventListener('install', (event) => {
  console.log('🔧 CDN Proxy Worker installed');
  self.skipWaiting();
});

// Activate and take control immediately
self.addEventListener('activate', (event) => {
  console.log('✅ CDN Proxy Worker activated');
  event.waitUntil(self.clients.claim());
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if this is a blocked CDN request
  const blockedCDNs = ['cdn.jsdelivr.net', 'cdn.statically.io', 'raw.githubusercontent.com'];
  const isBlockedCDN = blockedCDNs.some(cdn => url.hostname.includes(cdn));
  
  if (isBlockedCDN) {
    console.log('🚫 Blocked CDN detected, proxying:', url.href);
    
    // Proxy through our Vercel edge function
    event.respondWith(
      fetch('/api/cdn-proxy?url=' + encodeURIComponent(url.href), {
        method: 'GET',
        headers: {
          'X-Proxy-Request': 'true'
        }
      })
      .then(response => {
        if (!response.ok) {
          console.error('❌ Proxy failed for:', url.href);
          // Fallback to direct request (might fail but worth trying)
          return fetch(event.request);
        }
        console.log('✅ Proxied successfully:', url.href);
        return response;
      })
      .catch(error => {
        console.error('❌ Proxy error:', error);
        // Fallback to direct request
        return fetch(event.request);
      })
    );
  }
  // For non-CDN requests, pass through normally
});
