import {attachPoll} from './community-polls.js';
import {attachBanAppeal, banIdentity} from './community-appeals.js';
export function startCommunity(backend) {
  if (window.NovaCommunity) return window.NovaCommunity;
  let stopPoll = null;
  let stopAppeal = null, appealBanKey = '';
  let name = '', mute = null, siteBan = null, chatBan = null, ready = false;
  let stops = [], received = new Set(), banDialog, banner, bannerTimer, previousFocus, subscriptionVersion = 0;
  const now = () => backend.now ? backend.now() : Date.now();
  const active = record => !!record && record.banned !== false && (!record.expiresAt || record.expiresAt > now());
  const isTop = () => { try { return window.parent === window || window.parent.location.origin !== location.origin; } catch { return true; } };
  const identity = () => localStorage.getItem('nova_user') || localStorage.getItem('nova_username') || '';
  const keyOK = value => !!value && !/[.#$\[\]/]/.test(value);
  const safeImage = value => {
    if (typeof value !== 'string') return '';
    if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(value)) return value;
    try { const u = new URL(value, location.href); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
  };
  function state() { return {name, ready, mute: active(mute) ? mute : null, siteBan: active(siteBan) ? siteBan : null, chatBan: active(chatBan) ? chatBan : null}; }
  const api = window.NovaCommunity = {
    state, now, backend, active, safeImage,
    canSend: () => ready && !active(mute) && !active(siteBan) && !active(chatBan),
    isSiteBanned: () => active(siteBan),
    blockedMessage: () => !ready ? 'Connecting to moderation… Please try again.' : active(siteBan) ? 'Your Nova access is restricted.' : active(chatBan) ? 'Your chat access is restricted.' : active(mute) ? `You are muted until ${new Date(mute.expiresAt).toLocaleString()}.` : '',
    showAnnouncement
  };
  function emit() {
    window.dispatchEvent(new CustomEvent('nova-moderation', {detail: state()}));
    renderBan();
    const input = document.getElementById('messageInput');
    if (input) {
      input.readOnly = !api.canSend();
      let note = document.getElementById('nova-mute-note');
      if (!note) { note = document.createElement('div'); note.id = 'nova-mute-note'; note.setAttribute('role', 'status'); input.parentElement.appendChild(note); }
      note.textContent = api.blockedMessage();
      note.hidden = api.canSend();
    }
  }
  function renderBan() {
    if (!isTop()) return;
    if (banDialog && appealBanKey !== banIdentity(siteBan)) {
      stopAppeal?.(); stopAppeal = null; banDialog.close(); banDialog.remove(); banDialog = null;
    }
    if (!active(siteBan)) {
      stopAppeal?.(); stopAppeal = null;
      if (banDialog) { banDialog.close(); banDialog.remove(); banDialog = null; previousFocus?.focus?.(); }
      return;
    }
    window.NovaPanicSmart?.close();
    if (!banDialog) {
      previousFocus = document.activeElement;
      banDialog = document.createElement('dialog'); banDialog.id = 'nova-site-ban';
      banDialog.setAttribute('aria-label', 'Nova access restricted');
      banDialog.innerHTML = `<section class="nova-ban-card"><div class="nova-wordmark">NOVA <span>ACCOUNT STATUS</span></div><div class="nova-ban-symbol">◇</div><div class="nova-eyebrow">NOVA-WIDE RESTRICTION</div><h1>Your access is paused.</h1><p class="nova-ban-intro">An administrator has restricted this account across Nova. Access will return automatically when the restriction ends or is removed.</p><dl><div><dt>Account</dt><dd data-name></dd></div><div><dt>Reason</dt><dd data-reason></dd></div><div><dt>Issued by</dt><dd data-author></dd></div><div><dt>Access returns</dt><dd data-end></dd></div></dl><p class="nova-ban-footer">If you believe this is a mistake, you can request a review below.</p></section>`;
      banDialog.addEventListener('cancel', event => event.preventDefault());
      document.body.appendChild(banDialog); banDialog.showModal();
      appealBanKey = banIdentity(siteBan);
      stopAppeal = attachBanAppeal(banDialog, api);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
    banDialog.querySelector('[data-name]').textContent = name;
    banDialog.querySelector('[data-reason]').textContent = siteBan.reason || 'No reason provided';
    banDialog.querySelector('[data-author]').textContent = siteBan.bannedBy || 'Administrator';
    banDialog.querySelector('[data-end]').textContent = siteBan.expiresAt ? new Date(siteBan.expiresAt).toLocaleString() : 'When an administrator removes this restriction';
  }
  function dismissAnnouncement() { clearTimeout(bannerTimer); stopPoll?.(); stopPoll = null; if (banner) { const old = banner; banner = null; old.classList.add('nova-ann-leaving'); setTimeout(() => old.remove(), 240); } }
  function showAnnouncement(data) {
    if (!isTop() || !data || typeof data.text !== 'string' || !data.id || !Number.isFinite(data.createdAt)) return;
    const remaining = data.createdAt + (data.type === 'poll' ? 60000 : 15000) - now();
    if (remaining <= 0 || remaining > (data.type === 'poll' ? 61000 : 16000) || received.has(data.id)) return;
    try { if (sessionStorage.getItem('nova_announcement_seen') === data.id) return; sessionStorage.setItem('nova_announcement_seen', data.id); } catch {}
    received.add(data.id); if (received.size > 100) received.delete(received.values().next().value);
    dismissAnnouncement();
    banner = document.createElement('aside'); banner.id = 'nova-owner-announcement';
    banner.setAttribute('popover','manual'); banner.setAttribute('role','status');
    banner.innerHTML = `<div class="nova-ann-avatar"></div><div class="nova-ann-body"><div class="nova-ann-meta"><strong></strong><span>OWNER ANNOUNCEMENT</span></div><p></p></div><button aria-label="Close announcement" type="button">×</button><div class="nova-ann-progress"></div>`;
    banner.querySelector('strong').textContent = String(data.author || 'Owner').slice(0,80);
    banner.querySelector('p').textContent = data.text.slice(0,1000);
    const avatar = banner.querySelector('.nova-ann-avatar'), image = safeImage(data.profilePic);
    avatar.textContent = (data.author || 'N').charAt(0).toUpperCase();
    if (image) { const img = document.createElement('img'); img.src = image; img.alt = ''; img.onerror = () => img.remove(); avatar.appendChild(img); }
    banner.querySelector('button').onclick = dismissAnnouncement;
    if (data.type === 'poll') { banner.querySelector('.nova-ann-meta span').textContent = 'OWNER POLL'; stopPoll = attachPoll(banner.querySelector('.nova-ann-body'), data, api); }
    banner.style.setProperty('--announcement-duration', `${remaining}ms`);
    document.body.appendChild(banner); banner.showPopover?.();
    bannerTimer = setTimeout(dismissAnnouncement, remaining);
  }
  function subscribeUser() {
    const version = ++subscriptionVersion;
    stops.forEach(stop => stop()); stops = []; received.clear();
    name = identity(); mute = siteBan = chatBan = null; ready = false;
    if (!keyOK(name)) { ready = true; emit(); return; }
    let modLoaded = false, banLoaded = false;
    stops.push(backend.subscribe(`novaModeration/${name}`, value => {
      if (version !== subscriptionVersion) return;
      mute = value?.mute || null; siteBan = value?.siteBan || null;
      modLoaded = true; ready = modLoaded && banLoaded; emit();
    }, () => { if (version === subscriptionVersion) { modLoaded = false; ready = false; emit(); } }));
    stops.push(backend.subscribe(`bans/${name}`, value => {
      if (version !== subscriptionVersion) return;
      chatBan = value?.banned === true ? value : null;
      banLoaded = true; ready = modLoaded && banLoaded; emit();
    }, () => { if (version === subscriptionVersion) { banLoaded = false; ready = false; emit(); } }));
    emit();
  }
  subscribeUser();
  if (isTop()) backend.subscribe('novaAnnouncements/latest', showAnnouncement, error => console.warn('Announcements unavailable', error));
  let signature = '';
  setInterval(() => {
    if (name !== identity()) { subscribeUser(); return; }
    const next = JSON.stringify([ready, active(mute), active(siteBan), active(chatBan)]);
    if (next !== signature) { signature = next; emit(); }
  }, 1000);
  window.addEventListener('storage', () => { if (name !== identity()) subscribeUser(); });
  return api;
}
