(() => {
  'use strict';
  if (window.NovaPanicSmart) return;
  const DEFAULT_URL = 'https://classroom.google.com/';
  const KEY = 'nova_panic_smart_key', URL_KEY = 'nova_panic_smart_url', ENABLED = 'nova_panic_smart_enabled';
  const read = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const enabled = () => read(ENABLED, 'false') === 'true';
  const shortcut = () => read(KEY, 'F8').toUpperCase();
  const validURL = value => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  };
  let overlay, previousFocus, recording = false, recordTimer;
  const documents = new WeakSet(), frames = new WeakSet();

  function host() {
    let target = window;
    try { while (target.parent !== target && target.parent.NovaPanicSmart) target = target.parent; } catch {}
    return target.NovaPanicSmart;
  }

  function close() {
    if (!overlay) return;
    overlay.close();
    overlay.remove();
    overlay = null;
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll: true});
  }

  function open() {
    const owner = host();
    if (owner !== api) return owner.open();
    if (!enabled() || overlay || window.NovaCommunity?.isSiteBanned()) return;
    previousFocus = document.activeElement;
    const destination = validURL(read(URL_KEY, DEFAULT_URL)) || DEFAULT_URL;
    overlay = document.createElement('dialog');
    overlay.id = 'nova-smart-overlay';
    overlay.setAttribute('aria-label', 'Panic Button Smart');
    overlay.innerHTML = `<header><button type="button" data-back>← Go back to Nova</button><a target="_blank" rel="noopener noreferrer">Open website ↗</a></header><p>Website not appearing? Some sites, including Google Classroom, may require “Open website”. Close that tab to return here.</p><iframe title="Your Smart Panic website" referrerpolicy="no-referrer" sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"></iframe>`;
    overlay.querySelector('a').href = destination;
    overlay.querySelector('iframe').src = destination;
    overlay.querySelector('[data-back]').onclick = close;
    overlay.addEventListener('cancel', event => { event.preventDefault(); close(); });
    document.body.appendChild(overlay);
    // Top-layer modal covers Nova without navigating or replacing its pages.
    overlay.showModal();
    overlay.querySelector('button').focus();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }

  function status(message) {
    const el = document.getElementById('panicSmartStatus');
    if (el) el.textContent = message;
  }

  function refresh() {
    const display = document.getElementById('panicSmartKeyDisplay');
    if (display && !recording) display.textContent = shortcut();
    const toggle = document.getElementById('panicSmartEnabled');
    if (toggle) toggle.checked = enabled();
  }

  function cancelRecording() {
    recording = false;
    clearTimeout(recordTimer);
    if (document.documentElement.dataset.novaPanicRecording === 'smart') delete document.documentElement.dataset.novaPanicRecording;
    refresh();
  }

  function record() {
    if (document.documentElement.dataset.novaPanicRecording === 'legacy') return;
    recording = true;
    document.documentElement.dataset.novaPanicRecording = 'smart';
    document.getElementById('panicSmartKeyDisplay').textContent = 'Press a key…';
    status('Press one key. Escape cancels. Avoid keys you use for typing or games.');
    clearTimeout(recordTimer);
    recordTimer = setTimeout(() => { cancelRecording(); status('Key selection cancelled.'); }, 10000);
  }

  function onKey(event) {
    if (event.defaultPrevented || event.repeat || event.isComposing) return;
    const doc = event.target?.ownerDocument || document;
    if (recording && doc === document) {
      event.preventDefault(); event.stopImmediatePropagation();
      const key = event.key.toUpperCase();
      if (key === 'ESCAPE') { cancelRecording(); status('Key selection cancelled.'); return; }
      if (['CONTROL','ALT','SHIFT','META','UNIDENTIFIED'].includes(key) || event.ctrlKey || event.altKey || event.metaKey) {
        status('Choose a single key without Ctrl, Alt, or Command.'); return;
      }
      if (key === read('nova_panic_key', '').toUpperCase()) {
        status('That key already belongs to the original Panic Key. Choose a different key.'); return;
      }
      try { localStorage.setItem(KEY, key); } catch { status('Your browser could not save the key.'); cancelRecording(); return; }
      cancelRecording(); status(`Smart Panic key saved: ${key === ' ' ? 'Space' : key}`);
      return;
    }
    if (doc.documentElement.dataset.novaPanicRecording || !enabled()) return;
    if (event.ctrlKey || event.altKey || event.metaKey || event.key.toUpperCase() !== shortcut()) return;
    // Preserve an existing redirect key if it predates Smart Panic settings.
    if (shortcut() === read('nova_panic_key', '').toUpperCase()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    open();
  }

  function watchFrame(frame) {
    if (frame.closest('#nova-smart-overlay')) return;
    const attach = () => { try { if (frame.contentDocument) watchDocument(frame.contentDocument); } catch {} };
    if (!frames.has(frame)) { frames.add(frame); frame.addEventListener('load', attach); }
    attach();
  }

  function watchDocument(doc) {
    if (documents.has(doc)) return;
    documents.add(doc);
    doc.defaultView?.addEventListener('keydown', onKey, true);
    doc.querySelectorAll('iframe').forEach(watchFrame);
    const observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches('iframe')) watchFrame(node);
        node.querySelectorAll('iframe').forEach(watchFrame);
      }
    });
    observer.observe(doc, {childList: true, subtree: true});
  }

  const api = window.NovaPanicSmart = {open, close, cancelRecording};
  watchDocument(document);
  window.addEventListener('storage', refresh);
  function init() {
    const style = document.createElement('style');
    style.textContent = `#nova-smart-overlay{position:fixed;inset:0;box-sizing:border-box;margin:0;width:100%;height:100%;height:100dvh;max-width:none;max-height:none;border:0;padding:0;background:#fff;color:#202124;font:14px Arial,sans-serif;z-index:2147483647}#nova-smart-overlay[open]{display:flex;flex-direction:column}#nova-smart-overlay::backdrop{background:#fff}#nova-smart-overlay header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:#f8f9fa;border-bottom:1px solid #dadce0;flex-shrink:0}#nova-smart-overlay button,#nova-smart-overlay a{font:600 14px Arial,sans-serif;padding:10px 12px;border-radius:6px;color:#174ea6;background:#fff;border:1px solid #dadce0;text-decoration:none;cursor:pointer}#nova-smart-overlay p{font:12px Arial,sans-serif;margin:0;padding:8px 14px;color:#5f6368;background:#fff;flex-shrink:0}#nova-smart-overlay iframe{display:block;width:100%;flex:1;min-height:0;border:0;background:#fff}`;
    document.head.appendChild(style);
    const keyButton = document.getElementById('panicSmartKeyBtn');
    if (keyButton) {
      keyButton.onclick = record;
      const urlInput = document.getElementById('panicSmartUrl');
      urlInput.value = read(URL_KEY, DEFAULT_URL);
      document.getElementById('panicSmartSave').onclick = () => {
        const url = validURL(urlInput.value.trim());
        if (!url) { status('Enter a full http:// or https:// website address.'); return; }
        try { localStorage.setItem(URL_KEY, url); urlInput.value = url; status('Smart Panic website saved.'); }
        catch { status('Your browser could not save this setting.'); }
      };
      document.getElementById('panicSmartEnabled').onchange = event => {
        try { localStorage.setItem(ENABLED, String(event.target.checked)); status(event.target.checked ? 'Smart Panic enabled.' : 'Smart Panic disabled.'); }
        catch { status('Your browser could not save this setting.'); }
        refresh();
        host().refresh?.();
      };
    }
    refresh();
  }
  api.refresh = refresh;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
