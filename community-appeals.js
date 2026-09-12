export const banIdentity = ban => JSON.stringify([ban?.timestamp, ban?.bannedBy, ban?.reason, ban?.expiresAt]);

export function attachBanAppeal(dialog, api) {
  const account = api.state().name, banKey = banIdentity(api.state().siteBan);
  const path = `novaUnbanRequests/${account}`;
  const section = document.createElement('section');
  section.className = 'nova-appeal';
  section.innerHTML = `<button type="button" class="nova-appeal-button" data-open>Request unban</button><form hidden><label>Why should your access be restored?<textarea required maxlength="1000" rows="4" placeholder="Explain what happened and why you’re requesting another chance."></textarea></label><div class="nova-appeal-actions"><button class="nova-appeal-button" type="submit">Send request</button><button class="nova-appeal-cancel" type="button">Cancel</button></div></form><p role="status" aria-live="polite"></p>`;
  dialog.querySelector('.nova-ban-card').appendChild(section);
  const open = section.querySelector('[data-open]'), form = section.querySelector('form'), input = section.querySelector('textarea'), status = section.querySelector('[role=status]'), submit = section.querySelector('[type=submit]');
  let loaded = false, request = null, sending = false, disposed = false;
  function render() {
    const current = request?.banKey === banKey ? request : null;
    open.disabled = !loaded || sending;
    open.hidden = !!current;
    if (current) {
      form.hidden = true;
      status.textContent = current.status === 'rejected' ? 'Your request was reviewed and declined. Your restriction remains in place.' : current.status === 'approved' ? 'Your request was approved. Access is being restored.' : 'Request sent. A Nova administrator will review it. You can leave this page; your request is saved.';
    }
  }
  open.onclick = () => { form.hidden = false; open.hidden = true; input.focus(); };
  section.querySelector('.nova-appeal-cancel').onclick = () => { form.hidden = true; open.hidden = false; };
  form.onsubmit = async event => {
    event.preventDefault();
    const reason = input.value.trim();
    if (!loaded || sending || !reason || reason.length > 1000) return;
    sending = true; submit.disabled = true; status.textContent = 'Sending request…';
    try {
      const current = await api.backend.read(path);
      if (current?.banKey === banKey) { request = current; render(); return; }
      if (!api.state().siteBan || banIdentity(api.state().siteBan) !== banKey) throw Error('Your restriction changed. Please reopen the request form.');
      await api.backend.write(path, {username:account,reason,banKey,banReason:api.state().siteBan.reason || '',timestamp:api.backend.timestamp(),status:'pending',scope:'site'});
      if (!disposed) { request = {banKey,status:'pending'}; render(); }
    } catch (error) { if (!disposed) status.textContent = 'Could not send your request. Please try again.'; }
    finally { sending = false; submit.disabled = false; }
  };
  open.disabled = true;
  const stop = api.backend.subscribe(path, value => { request = value; loaded = true; render(); }, () => { status.textContent = 'Unban requests are unavailable right now. Reload to try again.'; });
  return () => { disposed = true; stop(); };
}

export function attachAppealReview(container, api, requireStaff) {
  let disposed = false;
  const heading = document.createElement('h3'); heading.textContent = 'Nova unban requests';
  const list = document.createElement('div'), notice = document.createElement('p'); notice.setAttribute('role','status'); notice.className = 'nova-admin-status';
  container.append(heading,list,notice);
  const stop = api.backend.subscribe('novaUnbanRequests', requests => {
    list.replaceChildren();
    const pending = Object.entries(requests || {}).filter(([,r]) => r?.scope === 'site' && r.status === 'pending');
    if (!pending.length) { list.textContent = 'No pending Nova-wide unban requests.'; return; }
    for (const [name,request] of pending) {
      if (/[.#$\[\]/]/.test(name)) continue;
      const row = document.createElement('div'); row.className = 'nova-restriction-row';
      const user = document.createElement('strong'); user.textContent = name;
      const reason = document.createElement('p'); reason.textContent = request.reason; reason.style.whiteSpace = 'pre-wrap'; reason.style.overflowWrap = 'anywhere';
      const actions = document.createElement('div'); actions.className = 'nova-admin-actions';
      for (const [decision,label] of [['approved','Approve unban'],['rejected','Decline']]) {
        const button = document.createElement('button'); button.className = 'admin-btn-new'; button.textContent = label;
        button.onclick = async () => {
          actions.querySelectorAll('button').forEach(b => b.disabled = true);
          try {
            await requireStaff();
            const latest = await api.backend.read(`novaUnbanRequests/${name}`);
            const ban = await api.backend.read(`novaModeration/${name}/siteBan`);
            if (!latest || latest.status !== 'pending' || latest.banKey !== request.banKey) throw Error('This request was already reviewed or replaced.');
            if (decision === 'approved' && ban && banIdentity(ban) !== request.banKey) throw Error('The ban has changed. Review the new restriction before removing it.');
            const updates = {[`novaUnbanRequests/${name}/status`]:decision,[`novaUnbanRequests/${name}/reviewedBy`]:api.state().name,[`novaUnbanRequests/${name}/reviewedAt`]:api.backend.timestamp()};
            if (decision === 'approved') updates[`novaModeration/${name}/siteBan`] = null;
            await api.backend.update(updates);
            if (!disposed) notice.textContent = decision === 'approved' ? `Nova access restored for ${name}.` : `Request from ${name} declined.`;
          } catch(error) { if (!disposed) notice.textContent = error.message || 'Could not review request.'; }
          finally { actions.querySelectorAll('button').forEach(b => b.disabled = false); }
        };
        actions.appendChild(button);
      }
      row.append(user,reason,actions); list.appendChild(row);
    }
  }, () => { notice.textContent = 'Could not load unban requests.'; });
  return () => { disposed = true; stop(); };
}
