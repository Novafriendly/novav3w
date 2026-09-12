import {attachAppealReview} from './community-appeals.js';
export function mountCommunityAdmin({username, toast}) {
  const originalSwitch = window.switchAdminPageCompact;
  let stopAppealReview = null;
  let busy = false, view = '', generation = 0;
  const root = () => document.getElementById('adminPageContentCompact');
  const service = () => { if (!window.NovaCommunity) throw Error('Still connecting. Please try again.'); return window.NovaCommunity; };
  const status = text => { const node = root().querySelector('[data-status]'); if (node) node.textContent = text; };
  const roles = user => [...(Array.isArray(user?.roles) ? user.roles : []), user?.role];
  async function actor(ownerOnly = false) {
    const user = await service().backend.read(`users/${username}`);
    if (!(ownerOnly ? roles(user).includes('Owner') : roles(user).some(role => ['Owner','Admin','Moderator'].includes(role)))) throw Error(ownerOnly ? 'Only an owner can publish website announcements.' : 'A staff role is required.');
    if (service().isSiteBanned()) throw Error('This account is restricted.');
    return user;
  }
  function lock(value) { busy = value; root().querySelectorAll('[data-mutate]').forEach(button => button.disabled = value); }
  async function mutate(action) {
    if (busy) return;
    lock(true); status('Saving…');
    try { await action(); } catch (error) { status(error.message || 'Could not save. Please try again.'); }
    finally { lock(false); }
  }
  const header = (title, subtitle) => `<div class="admin-page-header-new"><div class="nova-eyebrow">NOVA CONTROL ROOM</div><div class="admin-page-title-new">${title}</div><div class="admin-page-subtitle-new">${subtitle}</div></div>`;
  async function loadTargets(token) {
    try {
      const users = await service().backend.read('users');
      if (token !== generation) return;
      const list = document.getElementById('nova-mod-users');
      Object.keys(users || {}).sort().forEach(name => { const option = document.createElement('option'); option.value = name; list.appendChild(option); });
    } catch { if (token === generation) status('Could not load suggestions. You can enter an exact username.'); }
  }
  const target = () => {
    const value = document.getElementById('nova-mod-target').value.trim();
    if (!value || /[.#$\[\]/]/.test(value)) throw Error('Choose a valid username.');
    return value;
  };
  async function showRestrictions() {
    const token = generation, name = target(), api = service();
    const [record, chat] = await Promise.all([api.backend.read(`novaModeration/${name}`),api.backend.read(`bans/${name}`)]);
    if (token !== generation || name !== document.getElementById('nova-mod-target').value.trim()) return;
    const node = document.getElementById('nova-mod-current'); node.replaceChildren();
    for (const [label,item] of [['Mute',record?.mute],['Chat ban',chat?.banned ? chat : null],['Nova ban',record?.siteBan]]) {
      const line = document.createElement('div'); line.className = 'nova-restriction-row';
      line.textContent = `${label}: ${api.active(item) ? (item.expiresAt ? 'Until '+new Date(item.expiresAt).toLocaleString() : 'Until removed')+(item.reason ? ' · '+item.reason : '') : 'Not active'}`;
      node.appendChild(line);
    }
  }
  async function applyRestriction(remove = false) {
    await mutate(async () => {
      await actor(); const api = service(), name = target();
      const user = await api.backend.read(`users/${name}`);
      if (!user) throw Error('That user was not found. Choose an existing account.');
      if (!remove && (name === username || roles(user).includes('Owner'))) throw Error('You cannot restrict yourself or an owner.');
      const scope = document.getElementById('nova-mod-scope').value;
      const paths = {mute:`novaModeration/${name}/mute`,chat:`bans/${name}`,site:`novaModeration/${name}/siteBan`};
      if (!paths[scope]) throw Error('Choose a restriction type.');
      if (remove) {
        const patch = {[paths[scope]]:null};
        if (scope === 'chat') { patch[`users/${name}/banned`] = false; if (user.role === 'Banned') patch[`users/${name}/role`] = 'Member'; }
        await api.backend.update(patch); status('Selected restriction removed.');
      } else {
        const reason = document.getElementById('nova-mod-reason').value.trim();
        if (!reason || reason.length > 500) throw Error('Enter a reason of 1–500 characters.');
        const unit = document.getElementById('nova-mod-unit').value;
        const amount = Number(document.getElementById('nova-mod-duration').value);
        const multipliers = {minutes:60000,hours:3600000,days:86400000};
        if (scope === 'mute' && unit === 'permanent') throw Error('Mutes need an end time. Choose minutes, hours, or days.');
        if (unit !== 'permanent' && (!Number.isFinite(amount) || amount < 1 || !Number.isInteger(amount) || !multipliers[unit] || amount * multipliers[unit] > 365*86400000)) throw Error('Choose a whole-number duration between 1 minute and 365 days.');
        const data = {banned:true,bannedBy:username,reason,timestamp:api.backend.timestamp(),expiresAt:unit === 'permanent' ? null : api.now()+amount*multipliers[unit]};
        await api.backend.write(paths[scope], data);
        status(`${scope === 'mute' ? 'Mute' : scope === 'chat' ? 'Chat ban' : 'Nova-wide ban'} saved for ${name}.`);
      }
      await showRestrictions();
    });
  }
  function moderation() {
    view = 'moderation'; const token = ++generation;
    root().innerHTML = header('Moderation','Choose exactly what an account can access, and for how long.')+`
      <div class="admin-card-new"><label class="nova-admin-field">ACCOUNT<input id="nova-mod-target" class="admin-input-new" list="nova-mod-users" placeholder="Search or enter an exact username" autocomplete="off"><datalist id="nova-mod-users"></datalist></label>
      <div class="nova-admin-grid"><label class="nova-admin-field">RESTRICTION<select class="admin-select-new" id="nova-mod-scope"><option value="mute">Mute user</option><option value="chat">Ban from chat</option><option value="site">Ban from Nova</option></select></label><div class="nova-admin-field">DURATION<div style="display:flex;gap:8px"><input class="admin-input-new" id="nova-mod-duration" type="number" value="30" min="1" step="1" aria-label="Duration amount"><select class="admin-select-new" id="nova-mod-unit" aria-label="Duration unit"><option value="minutes">Minutes</option><option value="hours">Hours</option><option value="days">Days</option><option value="permanent">Until removed</option></select></div></div></div>
      <div class="nova-scope-info" id="nova-mod-explanation">Muted users can read chat and use Nova, but cannot send messages or reactions.</div>
      <label class="nova-admin-field">REASON<textarea id="nova-mod-reason" class="admin-input-new" maxlength="500" placeholder="Explain the reason to the user…"></textarea></label>
      <div class="nova-admin-actions"><button class="admin-btn-new danger" data-mutate id="nova-mod-apply">Apply restriction</button><button class="admin-btn-new" data-mutate id="nova-mod-remove">Remove selected restriction</button></div><p class="nova-admin-status" role="status" data-status></p></div>
      <div class="admin-card-new"><h3 style="font-size:15px;margin-bottom:10px">Account restrictions</h3><div id="nova-mod-current" class="nova-admin-hint">Choose an account to see its current restrictions.</div></div>`;
    document.getElementById('nova-mod-scope').onchange = event => {
      const explanations = {mute:'Muted users can read chat and use Nova, but cannot send messages or reactions.',chat:'Blocks chat channels and direct messages. The rest of Nova stays available.',site:'Blocks the entire Nova website, including open games, apps, and settings.'};
      document.getElementById('nova-mod-explanation').textContent = explanations[event.target.value];
      if (event.target.value === 'mute' && document.getElementById('nova-mod-unit').value === 'permanent') document.getElementById('nova-mod-unit').value = 'minutes';
    };
    document.getElementById('nova-mod-target').onchange = () => showRestrictions().catch(error => status(error.message));
    document.getElementById('nova-mod-apply').onclick = () => applyRestriction(false);
    document.getElementById('nova-mod-remove').onclick = () => applyRestriction(true);
    const reviews = document.createElement('div'); reviews.className = 'admin-card-new'; root().appendChild(reviews);
    stopAppealReview = attachAppealReview(reviews, service(), actor);
    loadTargets(token);
  }
  async function announcements() {
    view = 'announcements'; const token = ++generation;
    root().innerHTML = header('Announcement to website','Send a live message or let everyone vote in a poll.')+`<div class="admin-card-new"><label class="nova-admin-field">ANNOUNCEMENT TYPE<select id="nova-ann-type" class="admin-select-new"><option value="message">Message · 15 seconds</option><option value="poll">Poll · 60 seconds</option></select></label><label class="nova-admin-field">MESSAGE OR POLL QUESTION<textarea id="nova-ann-text" class="admin-input-new" maxlength="1000" rows="5" placeholder="What would you like everyone to know?"></textarea></label><div id="nova-poll-fields" hidden><label class="nova-admin-field">POLL OPTIONS · ONE PER LINE<textarea id="nova-poll-options" class="admin-input-new" rows="4" maxlength="500" placeholder="Yes&#10;No"></textarea></label><p class="nova-admin-hint">Add 2–4 unique choices, up to 80 characters each. One vote per account; results update live.</p></div><p class="nova-admin-hint">Appears at the top center of every open Nova page. Users can close it at any time.</p><div class="nova-admin-actions"><button class="admin-btn-new primary" data-mutate id="nova-ann-publish">Send announcement</button></div><p class="nova-admin-status" role="status" data-status></p></div><div class="nova-eyebrow">PREVIEW</div><div class="nova-ann-preview"><div id="nova-ann-preview-avatar"></div><div><strong id="nova-ann-preview-name"></strong><p id="nova-ann-preview-text">Your announcement will appear here.</p></div></div>`;
    const input = document.getElementById('nova-ann-text');
    const kind = document.getElementById('nova-ann-type'), optionsInput = document.getElementById('nova-poll-options');
    const previewOptions = document.createElement('div'); previewOptions.className = 'nova-poll-options'; document.getElementById('nova-ann-preview-text').after(previewOptions);
    function preview() { document.getElementById('nova-poll-fields').hidden = kind.value !== 'poll'; document.getElementById('nova-ann-publish').textContent = kind.value === 'poll' ? 'Send poll' : 'Send announcement'; previewOptions.replaceChildren(); if (kind.value === 'poll') optionsInput.value.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,4).forEach(text=>{const item=document.createElement('div');item.className='nova-poll-preview-option';item.textContent=text;previewOptions.appendChild(item)}); }
    kind.onchange = optionsInput.oninput = preview;
    document.getElementById('nova-ann-preview-name').textContent = username;
    input.oninput = () => { document.getElementById('nova-ann-preview-text').textContent = input.value || 'Your announcement will appear here.'; };
    document.getElementById('nova-ann-publish').onclick = () => mutate(async () => {
      const text = input.value.trim(); if (!text || text.length > 1000) throw Error('Enter a message of 1–1,000 characters.');
      const owner = await actor(true), api = service();
      const type = kind.value, options = optionsInput.value.split('\n').map(s=>s.trim()).filter(Boolean);
      if (type === 'poll' && (options.length < 2 || options.length > 4 || options.some(s=>s.length>80) || new Set(options.map(s=>s.toLowerCase())).size !== options.length)) throw Error('Add 2–4 different options, each 80 characters or fewer.');
      await api.backend.write('novaAnnouncements/latest', {id:crypto.randomUUID(),author:username,profilePic:api.safeImage(owner.profilePic || ''),text,type,...(type === 'poll' ? {options} : {}),createdAt:api.backend.timestamp()});
      status(type === 'poll' ? 'Poll sent. Voting stays open for 60 seconds.' : 'Announcement sent. It will disappear after 15 seconds.');
    });
    try {
      const owner = await actor(true); if (token !== generation) return;
      const image = service().safeImage(owner.profilePic || '');
      if (image) { const img = document.createElement('img'); img.src = image; img.alt = ''; document.getElementById('nova-ann-preview-avatar').appendChild(img); }
    } catch(error) { if (token === generation) { status(error.message); document.getElementById('nova-ann-publish').disabled = true; } }
  }
  window.switchAdminPageCompact = function(page) {
    if (busy) { status('Please wait for the current action to finish.'); return; }
    stopAppealReview?.(); stopAppealReview = null;
    generation++; view = page;
    if (page !== 'moderation' && page !== 'announcements') return originalSwitch(page);
    document.querySelectorAll('.admin-nav-item-new').forEach(item => item.classList.toggle('active',item.dataset.page === page));
    if (page === 'moderation') moderation(); else announcements();
  };
  const originalClose = window.closeAdminPanelCompact;
  window.closeAdminPanelCompact = () => { stopAppealReview?.(); stopAppealReview = null; originalClose(); };
  const openModeration = targetName => {
    window.openAdminPanel(); window.switchAdminPageCompact('moderation');
    if (typeof targetName === 'string') { document.getElementById('nova-mod-target').value = targetName; showRestrictions().catch(() => {}); }
  };
  window.quickBanUserCompact = () => openModeration();
  window.quickUnbanUserCompact = () => openModeration();
  window.banUserAdmin = openModeration;
}
