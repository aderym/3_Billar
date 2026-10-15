(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let session = null, ownerVenues = [], ownerVenue = '', ownerData = null, adminData = null;
  const request = async (path, method = 'GET', data) => {
    const response = await fetch(path, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined, cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'Support request failed.');
    return result;
  };
  const formatTime = value => value ? new Date(value).toLocaleString() : '';
  function messagesView(data, prefix) {
    if (!data) return '<p class="inline-help">Select a venue to open the conversation.</p>';
    return `<div class="support-thread">${data.messages?.map(message => `<div class="support-message ${message.sender_role === 'owner' ? 'mine' : ''}"><div>${esc(message.body)}</div><small>${esc(message.sender_name)} · ${esc(formatTime(message.created_at))}</small></div>`).join('') || '<div class="empty">No messages yet.</div>'}</div><form class="support-form" data-support-form="${prefix}"><textarea name="message" maxlength="2000" rows="3" placeholder="Write a message…" required></textarea><button class="btn primary">Send message</button></form>`;
  }
  function ownerPanel() {
    const selected = ownerVenues.find(v => v.group_id === ownerVenue);
    const list = ownerVenues.map(v => `<button class="support-venue ${v.group_id === ownerVenue ? 'active' : ''}" data-support-select="${esc(v.group_id)}"><span><strong>${esc(v.venue)}</strong><small>${esc(v.admin_name || 'No active administrator')}</small></span>${v.unread ? `<b class="badge live">${v.unread}</b>` : ''}</button>`).join('');
    return `<section id="owner-support-panel" class="support-panel"><div class="support-heading"><div><div class="eyebrow">OSP · SUPPORT</div><h2>Owner ↔ administrator</h2><p class="inline-help">Private communication for venue operations, payments and incidents.</p></div><button class="btn small ghost" data-support-close>Close</button></div><div class="support-layout"><div class="support-venue-list">${list || '<div class="empty">No venues available.</div>'}</div><div class="support-conversation">${selected ? `<h3>${esc(selected.venue)} <small>· ${esc(selected.admin_name || 'Administrator')}</small></h3>` : ''}${messagesView(ownerData, 'owner')}</div></div></section>`;
  }
  function adminPanel() {
    return `<section id="admin-support-panel" class="card support-panel"><div class="support-heading"><div><div class="eyebrow">OSP · SUPPORT</div><h2>Messages with OSP</h2><p class="inline-help" data-i18n="supportDescription">Private communication with the platform owner. Players cannot see these messages.</p></div></div>${messagesView(adminData, 'admin')}</section>`;
  }
  async function loadOwner(selected = ownerVenue) {
    ownerVenues = (await request('/api/owner/support')).venues || [];
    ownerVenue = selected && ownerVenues.some(v => v.group_id === selected) ? selected : ownerVenues[0]?.group_id || '';
    ownerData = ownerVenue ? await request('/api/owner/support/' + encodeURIComponent(ownerVenue)) : null;
  }
  async function loadAdmin() { adminData = await request('/api/support'); await request('/api/support/read', 'POST').catch(() => {}); }
  function ownerMount() {
    const root = document.querySelector('.owner-shell');
    if (!root) return;
    root.querySelectorAll('.owner-venue-row').forEach(row => {
      const manage = row.querySelector('[data-action="owner-manage"]');
      const actions = row.querySelector('.actions');
      if (manage && actions && !actions.querySelector('[data-support-venue]')) actions.insertAdjacentHTML('beforeend', `<button class="btn small ghost" data-support-venue="${esc(manage.dataset.id)}">Support</button>`);
    });
    if (ownerVenue && !document.querySelector('#owner-support-panel')) {
      const venueCard = root.querySelector('.owner-grid > .card');
      (venueCard || root).appendChild(document.createRange().createContextualFragment(ownerPanel()));
    }
  }
  function adminMount() {
    const main = document.querySelector('.main');
    const overviewGrid = main?.querySelector('.grid.split');
    if (!overviewGrid || !adminData || document.querySelector('#admin-support-panel')) return;
    overviewGrid.appendChild(document.createRange().createContextualFragment(adminPanel()));
  }
  async function refresh() {
    try {
      const current = (await request('/api/session')).account;
      if (current?.role !== session?.role) { document.querySelector('#owner-support-panel')?.remove(); document.querySelector('#admin-support-panel')?.remove(); }
      session = current;
      if (session?.role === 'owner') { await loadOwner(ownerVenue); const panel = document.querySelector('#owner-support-panel'); if (panel) panel.outerHTML = ownerPanel(); ownerMount(); }
      else if (session?.role === 'admin') { await loadAdmin(); const panel = document.querySelector('#admin-support-panel'); if (panel) panel.outerHTML = adminPanel(); adminMount(); }
    } catch {}
  }
  document.addEventListener('click', async event => {
    const select = event.target.closest('[data-support-select]');
    if (select) { ownerVenue = select.dataset.supportSelect; ownerData = await request('/api/owner/support/' + encodeURIComponent(ownerVenue)); document.querySelector('#owner-support-panel')?.remove(); ownerMount(); return; }
    const open = event.target.closest('[data-support-venue]');
    if (open) { ownerVenue = open.dataset.supportVenue; ownerData = await request('/api/owner/support/' + encodeURIComponent(ownerVenue)); document.querySelector('#owner-support-panel')?.remove(); ownerMount(); document.querySelector('#owner-support-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (event.target.closest('[data-support-close]')) document.querySelector('#owner-support-panel')?.remove();
  });
  document.addEventListener('submit', async event => {
    const form = event.target.closest('[data-support-form]');
    if (!form) return;
    event.preventDefault();
    const message = form.elements.message.value.trim();
    if (!message) return;
    const button = form.querySelector('button'); button.disabled = true;
    try {
      if (form.dataset.supportForm === 'owner') ownerData = await request('/api/owner/support/' + encodeURIComponent(ownerVenue), 'POST', { message });
      else adminData = await request('/api/support', 'POST', { message });
      form.reset(); form.closest('.support-panel').outerHTML = form.dataset.supportForm === 'owner' ? ownerPanel() : adminPanel();
    } catch (error) { window.alert(error.message); } finally { button.disabled = false; }
  });
  new MutationObserver(() => { ownerMount(); adminMount(); }).observe(document.body, { childList: true, subtree: true });
  refresh();
  window.setInterval(refresh, 3500);
})();
