// Versions of these browser bundles are pinned in package.json and copied at build time.
async function initBootstrap() {
  const registration = await navigator.serviceWorker.register('/nova-proxy/sw.js', { scope: '/nova-proxy/', updateViaCache: 'none' });
  const serviceworker = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => finish(new Error('Search setup timed out. Refresh and try again.')), 30000);
    const finish = error => {
      clearTimeout(timeout);
      error ? reject(error) : resolve(registration.active);
    };
    if (registration.active) return finish();
    navigator.serviceWorker.ready.then(() => finish(), finish);
  });
  for (const src of ['/nova-proxy/scram/scramjet.js', '/nova-proxy/controller/controller.api.js', '/nova-proxy/scram/scramjet-utils.js', '/nova-proxy/clients/index.js']) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error('Could not load the search components. Refresh to retry.')); };
      document.head.append(script);
    });
  }
  const { Controller, config } = window.$scramjetController;
  config.prefix = '/nova-proxy/proxy/';
  config.injectPath = '/nova-proxy/controller/controller.inject.js';
  config.wasmPath = '/nova-proxy/scram/scramjet.wasm';
  config.scramjetPath = '/nova-proxy/scram/scramjet.js';
  // Vercel serves HTTP functions but cannot keep the Wisp WebSocket open.
  const wisp = new URL(window.NOVA_WISP_URL || 'wss://wisp.mercurywork.shop/');
  const transport = new window.LibcurlTransport.LibcurlClient({ wisp: wisp.href });
  const controller = new Controller({ serviceworker, transport: novaGameTransport(transport) });
  await controller.wait();
  return controller;
}
