(() => {
  'use strict';

  function normalizePlayerFlow() {
    const form = document.querySelector('#access-request-form');
    if (!form) return;
    const kind = form.querySelector('select[name="kind"]');
    if (kind) {
      kind.value = 'player_signup';
      kind.querySelector('option[value="password_reset"]')?.remove();
    }
  }

  function install() {
    const card = document.querySelector('.auth-card');
    if (!card || card.querySelector('#public-venue-registration')) return;
    const section = document.createElement('section');
    section.id = 'public-venue-registration';
    section.innerHTML = `<div class="divider"></div>
      <button type="button" class="btn ghost" data-public-venue-toggle>¿Necesitas crear un local?</button>
      <form class="auth-form" data-public-venue-form hidden>
        <h2>Create a new venue</h2>
        <p class="inline-help">Register your venue and create its primary administrator. Access will remain pending until monthly billing is configured.</p>
        <div class="field"><label>Venue name</label><input name="groupName" maxlength="80" required></div>
        <div class="field"><label>Your name</label><input name="name" maxlength="70" autocomplete="name" required></div>
        <div class="field"><label>Username</label><input name="username" maxlength="40" autocapitalize="none" required></div>
        <div class="field"><label>Email (optional)</label><input name="email" type="email" maxlength="120" autocomplete="email"></div>
        <div class="field"><label>Phone (optional)</label><input name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label>Password (8+ characters)</label><input name="password" type="password" minlength="8" autocomplete="new-password" required></div>
        <div class="actions"><button class="btn primary" type="submit">Create venue</button><button class="btn ghost" type="button" data-public-venue-cancel>Cancel</button></div>
        <div class="notice" data-public-venue-status hidden></div>
      </form>`;
    card.appendChild(section);
    const form = section.querySelector('[data-public-venue-form]');
    const status = section.querySelector('[data-public-venue-status]');
    form.hidden = true;
    form.setAttribute('hidden', '');
    section.querySelector('[data-public-venue-toggle]').addEventListener('click', () => {
      form.hidden = !form.hidden;
      if (!form.hidden) section.querySelector('input[name="groupName"]').focus();
    });
    section.querySelector('[data-public-venue-cancel]').addEventListener('click', () => { form.hidden = true; form.reset(); status.hidden = true; });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      status.hidden = true;
      try {
        const response = await fetch('/api/register-venue', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
        const result = await response.json();
        if (!response.ok) throw Error(result.error || 'Could not create the venue.');
        form.reset();
        status.textContent = `Venue created. You can now sign in with username ${result.username}.`;
        status.className = 'notice success';
        status.hidden = false;
      } catch (error) {
        status.textContent = error.message;
        status.className = 'notice warn';
        status.hidden = false;
      } finally { button.disabled = false; }
    });
  }

  async function installOwnerTrialControls() {
    const list = document.querySelector('.owner-venue-list');
    const billingForm = document.querySelector('#owner-billing-form');
    if (!list || !billingForm || list.dataset.trialControlsInstalled || list.dataset.trialControlsLoading) return;
    list.dataset.trialControlsLoading = '1';
    try {
      for (const row of list.querySelectorAll('.owner-venue-row')) {
        const manage = row.querySelector('[data-action="owner-manage"]');
        const actions = row.querySelector('.actions');
        if (manage && actions && !actions.querySelector('[data-trial-action]')) {
          actions.insertAdjacentHTML('beforeend', `<label class="trial-days-control">Días <input type="number" min="1" max="3650" value="7" data-trial-days data-id="${manage.dataset.id}"></label><button class="btn small ghost" type="button" data-trial-action data-id="${manage.dataset.id}" data-active="1">Activar / renovar trial</button>`);
        }
      }
      const response = await fetch('/api/owner/trials', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const venues = new Map((data.venues || []).map(v => [v.groupId, v]));
      for (const row of list.querySelectorAll('.owner-venue-row')) {
        const manage = row.querySelector('[data-action="owner-manage"]');
        const actions = row.querySelector('.actions');
        const venue = manage && venues.get(manage.dataset.id);
        if (!actions || !venue) continue;
        const active = venue.trialActive;
        const label = active ? 'Desactivar trial' : venue.trialStartedAt ? 'Renovar trial' : 'Activar trial';
        const action = actions.querySelector('[data-trial-action]');
        const daysInput = actions.querySelector('[data-trial-days]');
        if (!action) actions.insertAdjacentHTML('beforeend', `<button class="btn small ghost" type="button" data-trial-action data-id="${manage.dataset.id}" data-active="${active ? '0' : '1'}">${label}</button>`);
        else { action.dataset.active = active ? '0' : '1'; action.textContent = label; }
        if (daysInput) daysInput.value = String(Number(venue.trialDays) || Number(data.defaultTrialDays) || 7);
      }
      list.dataset.trialControlsInstalled = '1';
    } finally {
      delete list.dataset.trialControlsLoading;
    }
  }

  document.addEventListener('click', async event => {
    const trial = event.target.closest('[data-trial-action]');
    if (trial) {
      trial.disabled = true;
      try {
        const row = trial.closest('.owner-venue-row');
        const days = Number(row?.querySelector('[data-trial-days]')?.value || 7);
        const r = await fetch(`/api/owner/venues/${encodeURIComponent(trial.dataset.id)}/trial`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: trial.dataset.active === '1', days }) });
        const result = await r.json();
        if (!r.ok) throw Error(result.error || 'Could not update the trial.');
        location.reload();
      } catch (error) { trial.disabled = false; window.alert(error.message); }
      return;
    }
  });
  new MutationObserver(() => { install(); normalizePlayerFlow(); installOwnerTrialControls().catch(() => {}); }).observe(document.body, { childList: true, subtree: true });
  const initialize = () => {
    install();
    normalizePlayerFlow();
    installOwnerTrialControls().catch(() => {});
    setTimeout(() => installOwnerTrialControls().catch(() => {}), 1500);
    const retryTimer = setInterval(() => {
      installOwnerTrialControls().catch(() => {});
      if (document.querySelector('.owner-venue-list[data-trial-controls-installed="1"]')) clearInterval(retryTimer);
    }, 1000);
    setTimeout(() => clearInterval(retryTimer), 30000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true }); else initialize();
})();
