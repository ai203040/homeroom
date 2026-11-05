/*
  Homeroom app: quiz, results, browse map, listing details, contact and tour flows, housing assistant.
  Needs data.js, match.js and art.js loaded first.
*/
(function () {
  'use strict';

  const D = window.HOMEROOM;
  const M = window.HR_MATCH;
  const ART = window.HR_ART;
  const L = D.listings;
  const byId = {};
  L.forEach((l) => { byId[l.id] = l; });

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = M.money;
  const pad = (v) => String(v).padStart(2, '0');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const mq = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
  const reduceMotion = mq('(prefers-reduced-motion: reduce)');
  let uid = 0;

  // ---------- icons ----------
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8.5 7.5h1M14.5 7.5h1M8.5 11.5h1M14.5 11.5h1M8.5 15.5h1M14.5 15.5h1M10 21v-3h4v3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    users3: '<circle cx="12" cy="7.5" r="3"/><circle cx="5" cy="10" r="2.5"/><circle cx="19" cy="10" r="2.5"/><path d="M7 20a5 5 0 0 1 10 0M1.5 19a4 4 0 0 1 5-3.8M22.5 19a4 4 0 0 0-5-3.8"/>',
    group: '<circle cx="8" cy="7" r="2.6"/><circle cx="16" cy="7" r="2.6"/><circle cx="4.5" cy="13" r="2.2"/><circle cx="12" cy="13" r="2.4"/><circle cx="19.5" cy="13" r="2.2"/><path d="M8 21a4 4 0 0 1 8 0M1 20.5a3.6 3.6 0 0 1 5.5-2.8M23 20.5a3.6 3.6 0 0 0-5.5-2.8"/>',
    walk: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4M4 13h4"/>',
    bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    bus: '<path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    washer: '<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><circle cx="12" cy="13.5" r="4.5"/><path d="M8 6.2h.01M11 6.2h1.5M10 15c1-.8 3-.8 4 0"/>',
    sofa: '<path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11"/><path d="M3 11.5a2 2 0 0 1 4 0V14h10v-2.5a2 2 0 0 1 4 0V18H3z"/><path d="M5.5 18v2M18.5 18v2"/>',
    bolt: '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17"/><path d="m9 4 3 2 3-2M9 20l3-2 3 2"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
    parking: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5"/>',
    paw: '<circle cx="8.5" cy="5.5" r="1.8"/><circle cx="15.5" cy="5.5" r="1.8"/><circle cx="4.5" cy="10.5" r="1.8"/><circle cx="19.5" cy="10.5" r="1.8"/><path d="M8 17.5c0-3 1.8-5.5 4-5.5s4 2.5 4 5.5c0 1.7-1.2 2.5-2.4 2.5-.7 0-1.1-.4-1.6-.4s-.9.4-1.6.4C9.2 20 8 19.2 8 17.5z"/>',
    dish: '<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M4 7.5h16M8 5h.01M11 5h.01"/><circle cx="12" cy="14.5" r="3.5"/>',
    bath: '<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M10 5 8 7M2 12h20M7 19v2M17 19v2"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    shield: '<path d="M12 22s8-3.6 8-10V5.2L12 2 4 5.2V12c0 6.4 8 10 8 10z"/>',
    shieldCheck: '<path d="M12 22s8-3.6 8-10V5.2L12 2 4 5.2V12c0 6.4 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M1.5 9a15 15 0 0 1 21 0M8.5 16a5 5 0 0 1 7 0"/><path d="M12 20h.01"/>',
    tree: '<path d="M12 22v-6"/><path d="M12 16a5 5 0 0 0 4.6-7A5 5 0 0 0 12 2a5 5 0 0 0-4.6 7A5 5 0 0 0 12 16z"/>',
    waves: '<path d="M2 7c2 0 2-1.5 4-1.5S8 7 10 7s2-1.5 4-1.5S16 7 18 7s2-1.5 4-1.5M2 13c2 0 2-1.5 4-1.5S8 13 10 13s2-1.5 4-1.5S16 13 18 13s2-1.5 4-1.5M2 19c2 0 2-1.5 4-1.5S8 19 10 19s2-1.5 4-1.5S16 19 18 19s2-1.5 4-1.5"/>',
    flame: '<path d="M12 22c3.9 0 7-2.9 7-7 0-4.5-4-6.5-4.5-11-2.5 1.8-4 4.4-4 7-1-.6-2-2-2.2-3.5C6.4 9.3 5 11.6 5 15c0 4.1 3.1 7 7 7z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    cap: '<path d="M22 9.5 12 4.5 2 9.5l10 5 10-5z"/><path d="M6 11.5V16c3 2.7 9 2.7 12 0v-4.5M22 9.5V15"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    star: '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>',
    heart: '<path d="M12 20.3 4.3 12.6a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.2 1.2 1.2-1.2a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    chevUp: '<path d="m18 15-6-6-6 6"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 18 6-6-6-6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    sparkle: '<path d="M12 3c.4 3.9 2.1 5.6 6 6-3.9.4-5.6 2.1-6 6-.4-3.9-2.1-5.6-6-6 3.9-.4 5.6-2.1 6-6z"/><path d="M19 15c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5z"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
    map: '<path d="M9 3.5 3 6v14.5l6-2.5 6 2.5 6-2.5V3.5L15 6z"/><path d="M9 3.5V18M15 6v14.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    video: '<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10.5 6-3.5v10l-6-3.5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/>',
    alert: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5M12 16.5h.01"/>',
    dollar: '<path d="M12 2v20M17 5.5H9.8a3.3 3.3 0 0 0 0 6.6h4.4a3.3 3.3 0 0 1 0 6.6H6.5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2.5"/>',
    bed: '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 16h20M6 10V7.5A1.5 1.5 0 0 1 7.5 6h3A1.5 1.5 0 0 1 12 7.5V10"/>',
  };
  function icon(name, cls) {
    return `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  }

  // ---------- storage (per-browser conveniences only) ----------
  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('homeroom:' + k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try { localStorage.setItem('homeroom:' + k, JSON.stringify(v)); } catch (e) { /* storage blocked: keep going without it */ }
    },
  };

  // ---------- state ----------
  const QZ = D.quiz;
  const STEPS = [
    { key: 'budget', label: 'Budget' },
    { key: 'roommates', label: 'Roommates' },
    { key: 'commute', label: 'Commute' },
    { key: 'amenities', label: 'Amenities' },
    { key: 'lease', label: 'Lease' },
  ];
  const DEFAULTS = { roommates: 'one', commute: 'walk', lease: 'academic' };
  const BLANK = { budget: QZ.budget.start, roommates: null, commute: null, amenities: [], lease: null };
  const saved = store.get('answers', null);
  const state = {
    view: null,
    step: 0,
    answers: Object.assign({}, BLANK, saved || {}),
    touched: new Set(saved ? STEPS.map((s) => s.key) : ['budget']),
    quizDone: !!store.get('quizDone', false),
    resultsCampus: 'all',
    expanded: new Set(),
    top: [],
    browse: { campus: 'all', price: 'any', rooms: 'any', sort: 'match', mode: 'list' },
    tours: store.get('tours', []),
    saved: store.get('saved', []),
    messages: store.get('messages', []),
    me: store.get('me', { name: '', email: '', phone: '' }),
  };
  if (!Array.isArray(state.answers.amenities)) state.answers.amenities = [];

  function answers() {
    const a = state.answers;
    return {
      budget: Number(a.budget) || QZ.budget.start,
      roommates: a.roommates || DEFAULTS.roommates,
      commute: a.commute || DEFAULTS.commute,
      amenities: a.amenities || [],
      lease: a.lease || DEFAULTS.lease,
    };
  }
  function persistAnswers() { store.set('answers', state.answers); }
  function currentTop() { return state.top && state.top.length ? state.top : M.rank(L, answers()).slice(0, 4); }

  // ---------- saved listings ----------
  if (!Array.isArray(state.saved)) state.saved = [];
  function isSaved(id) { return state.saved.indexOf(id) !== -1; }
  function toggleSave(id) {
    const i = state.saved.indexOf(id);
    if (i === -1) state.saved.push(id); else state.saved.splice(i, 1);
    store.set('saved', state.saved);
    updateSavedNav();
    // reflect the new state on any save button for this listing that is on screen
    $$('[data-action="save"][data-id="' + id + '"]').forEach(syncSaveBtn);
    if (state.view === 'saved') renderSaved();
  }
  function saveBtnHTML(l) {
    const on = isSaved(l.id);
    return `<button type="button" class="btn btn--secondary btn--sm save-btn${on ? ' is-on' : ''}" data-action="save" data-id="${l.id}" aria-pressed="${on}" aria-label="${on ? 'Remove ' + esc(l.name) + ' from saved' : 'Save ' + esc(l.name)}">${icon('heart')}<span class="save-label">${on ? 'Saved' : 'Save'}</span></button>`;
  }
  function syncSaveBtn(btn) {
    const on = isSaved(btn.dataset.id);
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    const lab = btn.querySelector('.save-label');
    if (lab) lab.textContent = on ? 'Saved' : 'Save';
  }
  function updateSavedNav() {
    const n = state.saved.length;
    const c = $('#navSavedCount');
    if (c) { c.textContent = n; c.hidden = n === 0; }
  }
  function savedListings() { return state.saved.map((id) => L.find((l) => l.id === id)).filter(Boolean); }
  function renderSaved() {
    const ls = savedListings();
    const a = answers();
    const count = $('#savedCount');
    if (count) count.textContent = ls.length ? `${ls.length} saved place${ls.length === 1 ? '' : 's'}` : '';
    $('#savedList').innerHTML = ls.length
      ? ls.map((l) => cardHTML(l, M.score(l, a))).join('')
      : '<div class="empty"><p>You haven’t saved any places yet.</p><p>Tap <b>Save</b> on any listing to keep it here.</p><p><button type="button" class="linkbtn" data-action="nav" data-view="browse">Browse listings</button></p></div>';
  }

  // ---------- small helpers ----------
  const COMMUTE_NAME = { walk: 'Walking', bike: 'Bike or scooter', transit: 'Bus', car: 'Car' };
  const MODE_ICON = { walk: 'walk', bike: 'bike', transit: 'bus', car: 'car' };
  const ROOM_CHIP = { solo: 'No roommates', one: '1 roommate', few: '2–3 roommates', many: '4+ roommates' };

  function campusTag(l) { return `<span class="tag tag--${l.campus}">${l.campus === 'on' ? 'On campus' : 'Off campus'}</span>`; }
  function roommateText(l) {
    const r = l.roommates;
    return r === 0 ? 'No roommates' : r === 1 ? '1 roommate' : r >= 4 ? r + ' housemates' : r + ' roommates';
  }
  function initials(name) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase(); }
  function firstName(name) { return name.split(' ')[0]; }
  function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function stars(r) {
    let o = '<span class="stars" aria-hidden="true">';
    for (let i = 1; i <= 5; i++) o += icon('star', r >= i - 0.5 ? '' : 'is-empty');
    return o + '</span>';
  }
  function fmtTime(t) {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  function isoToDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function fmtDate(iso, opts) { return isoToDate(iso).toLocaleDateString('en-US', opts || { weekday: 'short', month: 'short', day: 'numeric' }); }
  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }
  function saveMe(me) { state.me = me; store.set('me', me); }

  // ---------- accounts (optional, local to this browser) ----------
  // Sign-in is never required; it just personalises and pre-fills forms.
  // This is a demo: accounts live only in this browser's localStorage.
  function scramble(s) {
    // Light, non-reversible-ish digest so the raw password isn't sitting in
    // storage as plain text. Not real security — this demo has no server.
    let h = 2166136261;
    const str = 'hr§' + String(s);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  function getAccounts() { const a = store.get('accounts', {}); return a && typeof a === 'object' ? a : {}; }
  function setAccounts(a) { store.set('accounts', a); }
  state.auth = null;
  (function restoreSession() {
    const email = store.get('session', null);
    if (!email) return;
    const acct = getAccounts()[String(email).toLowerCase()];
    if (acct) state.auth = { name: acct.name, email: acct.email };
  })();
  function applyAuthToMe() {
    if (!state.auth) return;
    const cur = state.me || { name: '', email: '', phone: '' };
    saveMe({ name: state.auth.name, email: state.auth.email, phone: cur.phone || '' });
  }
  function signUp(name, email, pass) {
    const key = email.toLowerCase();
    const accts = getAccounts();
    if (accts[key]) return { error: 'An account with that email already exists. Try signing in instead.' };
    accts[key] = { name, email, pass: scramble(pass), created: Date.now() };
    setAccounts(accts);
    state.auth = { name, email };
    store.set('session', key);
    applyAuthToMe();
    return { ok: true };
  }
  function signIn(email, pass) {
    const acct = getAccounts()[email.toLowerCase()];
    if (!acct || acct.pass !== scramble(pass)) return { error: 'We couldn’t find an account with that email and password.' };
    state.auth = { name: acct.name, email: acct.email };
    store.set('session', email.toLowerCase());
    applyAuthToMe();
    return { ok: true };
  }
  function signOut() {
    state.auth = null;
    store.set('session', null);
    renderAccount();
    const d = $('#dlgAuth');
    if (d && d.open) d.close();
  }
  if (state.auth) applyAuthToMe();

  // ---------- quiz ----------
  function radioStep(i, name, title, help, opts) {
    return `<fieldset class="q-step" data-step="${i}" hidden>
      <legend class="q-title" tabindex="-1">${esc(title)}</legend>
      <p class="q-help">${esc(help)}</p>
      <div class="options">${opts.map((o) => `<label class="opt" for="q-${name}-${o.value}"><input type="radio" id="q-${name}-${o.value}" name="${name}" value="${o.value}"><span class="opt-icon">${icon(o.icon)}</span><span class="opt-text"><b>${esc(o.label)}</b><small>${esc(o.hint)}</small></span><span class="opt-check">${icon('check')}</span></label>`).join('')}</div>
    </fieldset>`;
  }

  function buildQuiz() {
    const b = QZ.budget;
    $('#quizSteps').innerHTML = STEPS.map((s, i) => `<li><button type="button" class="step-btn" data-step="${i}"><span class="n">${pad(i + 1)}<span class="n-check"></span></span>${s.label}</button></li>`).join('');
    let html = `<fieldset class="q-step" data-step="0">
      <legend class="q-title" tabindex="-1">What’s your monthly budget?</legend>
      <p class="q-help">Per person, per month. We count estimated utilities toward it.</p>
      <div class="budget-read"><output class="budget-out" id="budgetOut" for="budget">${money(state.answers.budget)}</output><span class="budget-unit">per month</span></div>
      <label for="budget" class="sr-only">Monthly budget</label>
      <input class="range" type="range" id="budget" name="budget" min="${b.min}" max="${b.max}" step="${b.step}" value="${state.answers.budget}" aria-describedby="budgetFit">
      <div class="budget-scale" aria-hidden="true">${b.ticks.map((t) => `<span style="left:calc(13px + (100% - 26px) * ${((t - b.min) / (b.max - b.min)).toFixed(4)})">${money(t)}</span>`).join('')}</div>
      <p class="budget-fit" id="budgetFit"></p>
    </fieldset>`;
    html += radioStep(1, 'roommates', 'How many roommates are you open to?', 'Count the people you would share a room or a unit with.', QZ.roommates);
    html += radioStep(2, 'commute', 'How will you get to campus?', 'We time every place to the Main Quad using your main way of getting around.', QZ.commute);
    html += `<fieldset class="q-step" data-step="3" hidden>
      <legend class="q-title" tabindex="-1">Which amenities matter to you?</legend>
      <p class="q-help">Pick as many as you like, or skip this step.</p>
      <div class="amen-pick">${QZ.amenities.map((o) => `<label class="chip-opt" for="q-amen-${o.value}"><input type="checkbox" id="q-amen-${o.value}" name="amenities" value="${o.value}">${icon(o.icon)}<span>${esc(o.label)}</span></label>`).join('')}</div>
    </fieldset>`;
    html += radioStep(4, 'lease', 'How long do you need the place?', 'Most Temple leases start in August. Spring sublets start in January.', QZ.lease);
    $('#quizBody').innerHTML = html;
    syncQuizInputs();
  }

  function syncOptClasses() {
    $$('#quizBody .opt, #quizBody .chip-opt').forEach((lab) => { lab.classList.toggle('is-checked', $('input', lab).checked); });
  }
  function syncQuizInputs() {
    const a = state.answers;
    ['roommates', 'commute', 'lease'].forEach((k) => $$(`#quizBody input[name="${k}"]`).forEach((i) => { i.checked = i.value === a[k]; }));
    $$('#quizBody input[name="amenities"]').forEach((i) => { i.checked = a.amenities.includes(i.value); });
    $('#budget').value = a.budget;
    syncOptClasses();
    updateBudget();
  }
  function updateBudget() {
    const b = QZ.budget;
    const v = Number(state.answers.budget);
    const p = (v - b.min) / (b.max - b.min);
    $('#budget').style.setProperty('--fill', `calc(13px + (100% - 26px) * ${p.toFixed(4)})`);
    $('#budgetOut').textContent = money(v);
    const fit = L.filter((l) => M.effective(l) <= v).length;
    $('#budgetFit').innerHTML = `<b>${fit} of ${L.length}</b> places fit this budget once estimated utilities are added.`;
  }

  function isAnswered(k) {
    const key = STEPS[k].key;
    if (key === 'budget') return true;
    if (key === 'amenities') return state.touched.has('amenities');
    return !!state.answers[key];
  }
  function canReach(k) {
    for (let j = 0; j < k; j++) {
      const key = STEPS[j].key;
      if (key !== 'amenities' && key !== 'budget' && !state.answers[key]) return false;
    }
    return true;
  }
  function showStep(i, focus) {
    state.step = i;
    $$('#quizBody .q-step').forEach((f) => { f.hidden = Number(f.dataset.step) !== i; });
    $$('#quizSteps .step-btn').forEach((b, k) => {
      const done = k !== i && isAnswered(k) && (k < i || state.touched.has(STEPS[k].key));
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.classList.toggle('is-done', done);
      $('.n-check', b).innerHTML = done ? icon('check') : '';
      b.disabled = k !== i && !canReach(k);
    });
    $('#quizBack').dataset.first = String(i === 0);
    $('#quizCount').textContent = `Step ${i + 1} of ${STEPS.length}`;
    updateNext();
    if (focus) {
      const t = $(`.q-step[data-step="${i}"] .q-title`);
      if (t) t.focus({ preventScroll: true });
    }
  }
  function updateNext() {
    const key = STEPS[state.step].key;
    const btn = $('#quizNext');
    const last = state.step === STEPS.length - 1;
    const label = last ? 'See my matches' : key === 'amenities' && !state.answers.amenities.length ? 'Skip' : 'Next';
    btn.innerHTML = `${label}${icon('arrowRight')}`;
    btn.disabled = (key === 'roommates' || key === 'commute' || key === 'lease') && !state.answers[key];
  }
  function nextStep() {
    const key = STEPS[state.step].key;
    if ((key === 'roommates' || key === 'commute' || key === 'lease') && !state.answers[key]) return;
    state.touched.add(key);
    if (state.step < STEPS.length - 1) {
      showStep(state.step + 1, true);
      updateLive();
    } else {
      finishQuiz();
    }
  }
  function finishQuiz() {
    state.quizDone = true;
    store.set('quizDone', true);
    persistAnswers();
    state.expanded.clear();
    state.resultsCampus = 'all';
    const btn = $('#quizNext');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Finding your matches';
    setTimeout(() => {
      go('results');
      updateNext();
    }, reduceMotion ? 0 : 600);
  }

  function bindQuiz() {
    const form = $('#quizForm');
    let lastPointer = 0;
    let autoTimer = 0;
    form.addEventListener('pointerdown', (e) => { if (e.target.closest('.opt')) lastPointer = Date.now(); });
    form.addEventListener('input', (e) => {
      if (e.target.id !== 'budget') return;
      state.answers.budget = Number(e.target.value);
      updateBudget();
      persistAnswers();
      updateLive();
    });
    form.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'roommates' || t.name === 'commute' || t.name === 'lease') {
        state.answers[t.name] = t.value;
        state.touched.add(t.name);
        syncOptClasses();
        persistAnswers();
        updateNext();
        updateLive();
        if (Date.now() - lastPointer < 900 && state.step < STEPS.length - 1) {
          clearTimeout(autoTimer);
          autoTimer = setTimeout(nextStep, reduceMotion ? 0 : 320);
        }
      } else if (t.name === 'amenities') {
        state.answers.amenities = $$('#quizBody input[name="amenities"]:checked').map((x) => x.value);
        state.touched.add('amenities');
        syncOptClasses();
        persistAnswers();
        updateNext();
        updateLive();
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      nextStep();
    });
    $('#quizBack').addEventListener('click', () => { if (state.step > 0) showStep(state.step - 1, true); });
    $('#quizSteps').addEventListener('click', (e) => {
      const b = e.target.closest('.step-btn');
      if (b && !b.disabled) showStep(Number(b.dataset.step), true);
    });
  }

  function quadMark(scale) {
    const q = D.campus.quad;
    return `<g class="qmark" transform="translate(${q[0]} ${q[1]}) scale(${scale || 1})"><circle r="12"/><path d="M-3.5 6.5V-6.5h8l-2 3 2 3h-8"/></g>`;
  }
  function buildLive() {
    $('#liveMap').innerHTML = `<svg viewBox="0 0 1200 800" role="img" aria-label="Map of Temple showing which places fit your answers so far" style="--road-labels:0;--ts:1.9;--routes:.55"><use href="#hr-map"/>${quadMark(1.9)}${L.map((l) => `<g class="dotg" data-id="${l.id}" transform="translate(${l.pos[0]} ${l.pos[1]})"><circle class="dot-ring" r="21"/><circle class="dot--${l.campus}" r="14"/></g>`).join('')}</svg>`;
  }
  function updateLive() {
    const keys = STEPS.map((s) => s.key).filter((k) => state.touched.has(k));
    const ranked = M.rank(L, answers(), { keys });
    const strong = ranked.filter((x) => x.s.total >= 72);
    const ids = new Set(strong.map((x) => x.l.id));
    const word = strong.length === 1 ? 'strong match' : 'strong matches';
    $('#liveNum').textContent = strong.length;
    $('#liveSub').innerHTML = `<b>${word} so far</b>out of ${L.length} places near campus`;
    $$('#liveMap .dotg').forEach((g) => g.classList.toggle('is-out', !ids.has(g.dataset.id)));
    $('#liveTop').innerHTML = ranked.slice(0, 3).map((x, i) => `<li><span class="lt-rank">${pad(i + 1)}</span><span class="lt-name">${esc(x.l.name)}</span>${campusTag(x.l)}<span class="lt-score">${x.s.total}%</span></li>`).join('');
    $('#quizLive').textContent = `${strong.length} ${word} so far, out of ${L.length} places.`;
  }

  // ---------- results ----------
  function prefChips(a) {
    const am = !a.amenities.length ? 'Any amenities' : a.amenities.length <= 2 ? a.amenities.map((x) => M.AMENITY[x].label).join(', ') : a.amenities.length + ' amenities';
    return [
      ['dollar', 'Up to ' + money(a.budget) + '/mo'],
      ['users', ROOM_CHIP[a.roommates]],
      [MODE_ICON[a.commute], COMMUTE_NAME[a.commute]],
      ['check', am],
      ['calendar', M.LEASE_NAME[a.lease]],
    ].map(([ic, t]) => `<span class="pref">${icon(ic)}${esc(t)}</span>`).join('');
  }

  function ring(p) {
    const C = 2 * Math.PI * 22;
    return `<div class="ring" role="img" aria-label="${p}% match"><svg viewBox="0 0 52 52" aria-hidden="true"><circle class="ring-track" cx="26" cy="26" r="22"/><circle class="ring-bar" cx="26" cy="26" r="22" stroke-dasharray="${((C * p) / 100).toFixed(1)} ${C.toFixed(1)}"/></svg><span class="ring-num" aria-hidden="true">${p}<small>%</small></span><span class="ring-cap" aria-hidden="true">match</span></div>`;
  }

  function recCardHTML(l, s, i) {
    const a = answers();
    const cl = M.commuteLabel(l, a.commute);
    return `<li class="rec" id="rec-${l.id}" data-id="${l.id}">
      <div class="rec-top">
        <button type="button" class="rec-media" data-action="expand" data-id="${l.id}" aria-label="Show the full listing for ${esc(l.name)}">
          <img src="${ART.photo(l, 0)}" alt="" width="480" height="320">
          <span class="rank${i === 0 ? ' rank--first' : ''}">${i === 0 ? 'Best match' : 'Match ' + pad(i + 1)}</span>
        </button>
        <div class="rec-body">
          <div class="rec-head">
            <div class="rec-titles">
              <div class="rec-tags">${campusTag(l)}<span class="kind">${esc(l.kind)}</span></div>
              <h3 class="rec-name">${esc(l.name)}</h3>
              <p class="rec-addr">${icon('pin')}${esc(l.address)} · ${esc(l.hood)}</p>
            </div>
            ${ring(s.total)}
          </div>
          <div class="rec-facts">
            <span class="price">${money(l.rent)}<small>/mo</small></span>
            <span class="fact">${l.utilities.included ? 'Utilities included' : '+ ' + money(l.utilities.estimate) + ' utilities'}</span>
            <span class="fact">${esc(l.layout.summary)}</span>
            <span class="fact">${roommateText(l)}</span>
          </div>
          <span class="sign">${icon(cl.icon)}${esc(cl.short)}</span>
          <ul class="why">${s.pros.slice(0, 3).map((p) => `<li class="ok">${icon('check')}<span>${esc(p.text)}</span></li>`).join('')}${s.cons.slice(0, 2).map((p) => `<li class="meh">${icon('alert')}<span>${esc(p.text)}</span></li>`).join('')}</ul>
        </div>
      </div>
      <div class="rec-actions">
        <button type="button" class="btn btn--ghost btn--sm rec-toggle" data-action="expand" data-id="${l.id}" aria-expanded="false" aria-controls="recd-${l.id}"><span>View full listing</span>${icon('chevDown')}</button>
        <div class="rec-cta">
          ${saveBtnHTML(l)}
          <button type="button" class="btn btn--secondary btn--sm" data-action="contact" data-id="${l.id}">${icon('chat')}Contact landlord</button>
          <button type="button" class="btn btn--primary btn--sm" data-action="tour" data-id="${l.id}">${icon('calendar')}Book a tour</button>
        </div>
      </div>
      <div class="rec-detail" id="recd-${l.id}" role="region" aria-label="Full listing for ${esc(l.name)}"><div class="rec-detail-clip"><div class="rec-detail-inner"></div></div></div>
    </li>`;
  }

  function renderResults() {
    const a = answers();
    const ranked = M.rank(L, a, { campus: state.resultsCampus });
    state.top = ranked.slice(0, 4);
    const where = state.resultsCampus === 'on' ? ' on-campus' : state.resultsCampus === 'off' ? ' off-campus' : '';
    $('#resultsEyebrow').textContent = state.quizDone ? 'Your matches' : 'Sample matches';
    $('#resultsHeading').textContent = state.quizDone ? `Your top 4${where} places` : `Top 4${where} places for these answers`;
    $('#sampleNotice').hidden = state.quizDone;
    $('#prefsSummary').innerHTML = prefChips(a);
    $$('#resultsCampus button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.val === state.resultsCampus)));
    $('#recList').innerHTML = state.top.map((x, i) => recCardHTML(x.l, x.s, i)).join('');
    state.top.forEach((x) => { if (state.expanded.has(x.l.id)) expandCard(x.l.id, true, true); });
    $('#moreCount').textContent = L.length;
    renderSuggestions();
  }

  function renderMoreMap() {
    $('#moreMap').innerHTML = `<svg viewBox="0 0 1200 800" aria-hidden="true" style="--road-labels:0;--hood-labels:0;--routes:.4"><use href="#hr-map"/>${L.map((l) => `<circle class="mdot dot--${l.campus}" cx="${l.pos[0]}" cy="${l.pos[1]}" r="26"/>`).join('')}</svg>`;
  }

  function toggleExpand(id, fromBottom) {
    const open = !state.expanded.has(id);
    expandCard(id, open);
    if (!open && fromBottom) {
      const card = document.getElementById('rec-' + id);
      if (card) card.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  function expandCard(id, open, instant) {
    const card = document.getElementById('rec-' + id);
    if (!card) return;
    const inner = $('.rec-detail-inner', card);
    if (open && !inner.dataset.ready) {
      inner.innerHTML = detailHTML(byId[id]) + detailFoot(byId[id]);
      inner.dataset.ready = '1';
    }
    if (instant) card.classList.add('no-anim');
    card.classList.toggle('is-open', open);
    const t = $('.rec-toggle', card);
    t.setAttribute('aria-expanded', String(open));
    $('span', t).textContent = open ? 'Hide full listing' : 'View full listing';
    if (open) state.expanded.add(id); else state.expanded.delete(id);
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('no-anim')));
  }

  // ---------- listing detail (shared by results and the listing dialog) ----------
  function miniMap(l) {
    const q = D.campus.quad;
    const p = l.pos;
    let x0 = Math.min(q[0], p[0]) - 110;
    let y0 = Math.min(q[1], p[1]) - 80;
    let w = Math.max(q[0], p[0]) + 110 - x0;
    let h = Math.max(q[1], p[1]) + 80 - y0;
    const ratio = 16 / 10;
    if (w / h < ratio) { const nw = h * ratio; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / ratio; y0 -= (nh - h) / 2; h = nh; }
    const sc = Math.max(1, w / 400);
    const ts = Math.min(3, Math.max(1, w / 380));
    return `<svg viewBox="${x0.toFixed(0)} ${y0.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}" role="img" aria-label="Map showing ${esc(l.name)} and the Main Quad" style="--ts:${ts.toFixed(2)};--road-labels:${w > 700 ? 0 : 1}"><use href="#hr-map"/>
      <line class="mm-line" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke-width="${(2.4 * sc).toFixed(2)}" stroke-dasharray="${(6 * sc).toFixed(1)} ${(5 * sc).toFixed(1)}"/>
      ${quadMark(sc)}
      <g transform="translate(${p[0]} ${p[1]}) scale(${(sc * 1.1).toFixed(3)})"><path class="mm-pin" d="M0 0C-3-6-11-10-11-18a11 11 0 0 1 22 0C11-10 3-6 0 0z"/><circle class="mm-pin-dot" cy="-18" r="4.2"/></g>
    </svg>`;
  }

  function commuteHTML(l) {
    const c = M.commute(l);
    const mode = state.quizDone ? answers().commute : null;
    const rows = [
      { k: 'walk', icon: 'walk', label: 'Walk', val: c.walk + ' min', note: c.miles.toFixed(1) + ' mi to the Main Quad' },
      { k: 'bike', icon: 'bike', label: 'Bike', val: c.bike + ' min', note: M.amenitySet(l).has('bike') ? 'Bike storage on site' : 'Bike racks across campus' },
      { k: 'transit', icon: 'bus', label: 'Bus', val: l.transit ? l.transit.total + ' min' : '—', note: l.transit ? `Route ${l.transit.route} from ${l.transit.stop}, ${l.transit.walkToStop} min walk to the stop` : l.campus === 'on' ? 'On campus, no bus needed' : 'No bus line that saves time' },
      { k: 'car', icon: 'car', label: 'Drive', val: c.drive + ' min', note: l.parking.note },
    ];
    return `<ul class="commute">${rows.map((r) => `<li class="${r.k === mode ? 'is-you' : ''}">${icon(r.icon)}<span class="cm-label">${r.label}${r.k === mode ? '<em>Your pick</em>' : ''}</span><span class="cm-val">${r.val}</span><span class="cm-note">${esc(r.note)}</span></li>`).join('')}</ul>`;
  }

  function landlordHTML(l) {
    const ll = l.landlord;
    const k = ++uid;
    const title = ll.kind === 'university' ? 'Housing office' : ll.kind === 'sublet' ? 'Current tenant' : ll.kind === 'coop' ? 'Co-op contact' : 'Landlord';
    const verified = ll.kind === 'university' ? 'Official university housing' : ll.kind === 'sublet' ? 'Sublet approved by the landlord' : 'Verified landlord';
    return `<section class="dsec"><h4 class="dsec-title">${title}</h4>
      <div class="box ll-box">
        <div class="ll-top"><span class="avatar" aria-hidden="true">${initials(ll.name)}</span><div class="ll-id"><b>${esc(ll.name)}</b><span>${esc(ll.role)}</span><span>${esc(ll.company)}</span></div></div>
        <ul class="ll-meta">
          ${ll.verified ? `<li class="is-verified">${icon('shieldCheck')}${verified}</li>` : ''}
          <li>${icon('clock')}${esc(ll.response)}</li>
          <li>${icon('calendar')}${esc(ll.hours)}</li>
          <li>${icon('home')}On Homeroom since ${ll.since}</li>
        </ul>
        <div class="ll-contact">
          <div class="ll-line">${icon('phone')}<span id="llp${k}">${esc(ll.phone)}</span><button type="button" class="copy" data-action="copy" data-copy="${esc(ll.phone)}" data-target="llp${k}" aria-label="Copy phone number">${icon('copy')}Copy</button></div>
          <div class="ll-line">${icon('mail')}<span id="lle${k}">${esc(ll.email)}</span><button type="button" class="copy" data-action="copy" data-copy="${esc(ll.email)}" data-target="lle${k}" aria-label="Copy email address">${icon('copy')}Copy</button></div>
        </div>
        <div class="ll-actions">
          ${saveBtnHTML(l)}
          <button type="button" class="btn btn--secondary btn--sm" data-action="contact" data-id="${l.id}">${icon('chat')}Message</button>
          <button type="button" class="btn btn--primary btn--sm" data-action="tour" data-id="${l.id}">${icon('calendar')}Book a tour</button>
        </div>
      </div>
    </section>`;
  }

  function detailHTML(l) {
    const a = answers();
    const quiz = state.quizDone;
    const ph = ART.photos(l);
    const has = M.amenitySet(l);
    const want = new Set(quiz ? a.amenities : []);
    const quizKeys = QZ.amenities.map((x) => x.value).filter((k) => has.has(k));
    const extraKeys = l.amenities.filter((k) => !M.AMENITY[k]);
    const amenItem = (k) => {
      const def = M.AMENITY[k] || D.extraAmenities[k] || { label: k, icon: 'check' };
      return `<li class="${want.has(k) ? 'is-want' : ''}">${icon(def.icon)}<span>${esc(def.label)}</span></li>`;
    };
    const missing = quiz ? a.amenities.filter((k) => !has.has(k)) : [];
    const leaseRows = Object.keys(l.leases).map((k) => `<span class="lease-opt${quiz && k === a.lease ? ' is-you' : ''}"><span class="tag tag--off">${esc(M.LEASE_NAME[k])}</span>${esc(l.leases[k])}</span>`).join('');
    const util = l.utilities.included ? 0 : l.utilities.estimate;
    const pk = l.parking;
    const parkMonthly = pk.kind === 'paid' || pk.kind === 'street' ? pk.cost : pk.kind === 'permit' ? Math.round(pk.cost / 4.5) : 0;
    const showPark = quiz && a.commute === 'car' && parkMonthly > 0;
    const monthly = l.rent + util + (showPark ? parkMonthly : 0);
    const other = l.costs.other || [];
    const signing = l.rent + l.costs.deposit + l.costs.appFee + other.reduce((t, o) => t + o.amount, 0);
    return `<div class="detail">
      <div class="gallery" data-gallery data-id="${l.id}" data-idx="0">
        <figure class="gallery-main">
          <img src="${ph[0].src}" alt="${esc(l.name)}: ${esc(ph[0].caption)}" data-main width="480" height="320">
          <figcaption data-cap>${esc(ph[0].caption)}</figcaption>
          <button type="button" class="gal-nav gal-nav--prev" data-action="photo-step" data-dir="-1" aria-label="Previous photo">${icon('chevLeft')}</button>
          <button type="button" class="gal-nav gal-nav--next" data-action="photo-step" data-dir="1" aria-label="Next photo">${icon('chevRight')}</button>
        </figure>
        <div class="gallery-thumbs">${ph.map((p, i) => `<button type="button" class="thumb${i === 0 ? ' is-on' : ''}" data-action="photo" data-idx="${i}" aria-label="Show ${esc(p.caption.toLowerCase())} photo" aria-pressed="${i === 0}"><img src="${p.src}" alt="" loading="lazy" width="480" height="320"></button>`).join('')}</div>
      </div>
      <div class="detail-grid">
        <div class="detail-col">
          <section class="dsec"><h4 class="dsec-title">About this place</h4><p>${esc(l.description)}</p><ul class="chips">${l.highlights.map((h) => `<li class="chip">${esc(h)}</li>`).join('')}</ul></section>
          <section class="dsec"><h4 class="dsec-title">Property details</h4>
            <dl class="facts">
              <dt>Type</dt><dd>${esc(l.kind)}, ${l.campus === 'on' ? 'on campus' : 'off campus'}</dd>
              <dt>Layout</dt><dd>${esc(l.layout.summary)} · ${l.layout.sqft.toLocaleString('en-US')} sq ft</dd>
              <dt>Your space</dt><dd>${esc(l.layout.space)}</dd>
              <dt>Bathroom</dt><dd>${esc(l.layout.bath)}</dd>
              <dt>Roommates</dt><dd>${roommateText(l)}</dd>
              <dt>Furnished</dt><dd>${l.furnished ? 'Yes' : 'No'}</dd>
              <dt>Lease type</dt><dd>${esc(l.leaseType)}</dd>
              <dt>Lease terms</dt><dd>${leaseRows}</dd>
              <dt>Move-in</dt><dd>From ${esc(l.available)}</dd>
            </dl>
          </section>
          <section class="dsec"><h4 class="dsec-title">Amenities</h4><ul class="amen">${quizKeys.concat(extraKeys).map(amenItem).join('')}</ul>${missing.length ? `<p class="missing">${icon('alert')}<span>Missing from your list: ${esc(missing.map((k) => M.AMENITY[k].label.toLowerCase()).join(', '))}</span></p>` : ''}</section>
          <section class="dsec"><h4 class="dsec-title">House rules</h4>
            <dl class="facts">
              <dt>Pets</dt><dd>${esc(l.rules.pets)}</dd>
              <dt>Smoking</dt><dd>${esc(l.rules.smoking)}</dd>
              <dt>Guests</dt><dd>${esc(l.rules.guests)}</dd>
              <dt>Quiet hours</dt><dd>${esc(l.rules.quiet)}</dd>
              <dt>Subletting</dt><dd>${esc(l.rules.sublet)}</dd>
            </dl>
          </section>
        </div>
        <div class="detail-col">
          <section class="dsec"><h4 class="dsec-title">Price</h4>
            <div class="box">
              <div class="costrow"><span>Rent, per person</span><span>${money(l.rent)}/mo</span></div>
              <div class="costrow"><span>Utilities</span><span>${l.utilities.included ? 'Included' : 'About ' + money(util) + '/mo'}</span></div>
              ${showPark ? `<div class="costrow"><span>Parking</span><span>${money(parkMonthly)}/mo</span></div>` : ''}
              <div class="costrow total"><span>Expected monthly cost</span><span>${money(monthly)}/mo</span></div>
              <p class="costnote">${esc(l.utilities.note.replace(/\.$/, ''))}. ${esc(l.billing)}.</p>
              <p class="costsub">Due at signing</p>
              <div class="costrow"><span>First month</span><span>${money(l.rent)}</span></div>
              <div class="costrow"><span>${esc(l.costs.depositLabel)}</span><span>${money(l.costs.deposit)}</span></div>
              <div class="costrow"><span>Application fee</span><span>${l.costs.appFee ? money(l.costs.appFee) : 'None'}</span></div>
              ${other.map((o) => `<div class="costrow"><span>${esc(o.label)}</span><span>${money(o.amount)}</span></div>`).join('')}
              <div class="costrow total"><span>Total to move in</span><span>${money(signing)}</span></div>
            </div>
          </section>
          <section class="dsec"><h4 class="dsec-title">Location and commute</h4>
            <p class="rec-addr">${icon('pin')}${esc(l.address)}, ${esc(l.hood)}</p>
            <div class="minimap">${miniMap(l)}</div>
            ${commuteHTML(l)}
          </section>
          ${landlordHTML(l)}
        </div>
      </div>
    </div>`;
  }

  function detailFoot(l) {
    return `<div class="detail-foot">
      <button type="button" class="btn btn--ghost btn--sm" data-action="collapse" data-id="${l.id}">${icon('chevUp')}Hide full listing</button>
      <div class="rec-cta">
        ${saveBtnHTML(l)}
        <button type="button" class="btn btn--secondary btn--sm" data-action="contact" data-id="${l.id}">${icon('chat')}Contact landlord</button>
        <button type="button" class="btn btn--primary btn--sm" data-action="tour" data-id="${l.id}">${icon('calendar')}Book a tour</button>
      </div>
    </div>`;
  }

  function setPhoto(btn, dir) {
    const g = btn.closest('[data-gallery]');
    if (!g) return;
    const l = byId[g.dataset.id];
    const ph = ART.photos(l);
    let i = dir ? Number(g.dataset.idx) + dir : Number(btn.dataset.idx);
    i = (i + ph.length) % ph.length;
    g.dataset.idx = String(i);
    const img = $('[data-main]', g);
    img.src = ph[i].src;
    img.alt = `${l.name}: ${ph[i].caption}`;
    $('[data-cap]', g).textContent = ph[i].caption;
    $$('.thumb', g).forEach((b, k) => {
      b.classList.toggle('is-on', k === i);
      b.setAttribute('aria-pressed', String(k === i));
    });
  }

  function copyText(btn) {
    if (btn.classList.contains('is-copied')) return;
    const original = btn.innerHTML;
    const done = () => {
      btn.classList.add('is-copied');
      btn.innerHTML = icon('check') + 'Copied';
      setTimeout(() => { btn.classList.remove('is-copied'); btn.innerHTML = original; }, 1500);
    };
    const selectIt = () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const r = document.createRange();
      r.selectNodeContents(target);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    };
    try {
      navigator.clipboard.writeText(btn.dataset.copy).then(done, selectIt);
    } catch (e) {
      selectIt();
    }
  }

  // ---------- browse ----------
  let browseMap = null;

  function cardHTML(l, s) {
    const cl = M.commuteLabel(l, state.quizDone ? answers().commute : 'walk');
    return `<article class="card" data-id="${l.id}">
      <button type="button" class="card-media" data-action="open" data-id="${l.id}" aria-label="Open ${esc(l.name)}">
        <img src="${ART.photo(l, 0)}" alt="" loading="lazy" width="480" height="320">
        ${campusTag(l)}
        ${state.quizDone ? `<span class="card-match">${s.total}% match</span>` : ''}
      </button>
      <div class="card-body">
        <div class="card-price"><span class="price">${money(l.rent)}<small>/mo</small></span><span class="card-util">${l.utilities.included ? 'Utilities included' : '+ ' + money(l.utilities.estimate) + ' utilities'}</span></div>
        <h3 class="card-title"><button type="button" data-action="open" data-id="${l.id}">${esc(l.name)}</button></h3>
        <p class="card-sub">${esc(l.kind)} · ${esc(l.hood)}</p>
        <div class="card-facts"><span>${icon('bed')}${esc(l.layout.summary)}</span><span>${icon('users')}${roommateText(l)}</span></div>
        <span class="sign">${icon(cl.icon)}${esc(cl.short)}</span>
        <div class="card-actions">
          ${saveBtnHTML(l)}
          <button type="button" class="btn btn--secondary btn--sm" data-action="contact" data-id="${l.id}">Contact</button>
          <button type="button" class="btn btn--primary btn--sm" data-action="tour" data-id="${l.id}">Book a tour</button>
        </div>
      </div>
    </article>`;
  }

  function renderBrowse() {
    if (!browseMap) browseMap = createMap($('#browseMap'));
    const f = state.browse;
    const a = answers();
    let items = L.map((l) => ({ l, s: M.score(l, a) }));
    if (f.campus !== 'all') items = items.filter((x) => x.l.campus === f.campus);
    if (f.price !== 'any') items = items.filter((x) => x.l.rent <= Number(f.price));
    if (f.rooms !== 'any') {
      const r = M.ROOM_RANGE[f.rooms];
      items = items.filter((x) => x.l.roommates >= r[0] && x.l.roommates <= r[1]);
    }
    if (f.sort === 'price') items.sort((x, y) => x.l.rent - y.l.rent);
    else if (f.sort === 'distance') items.sort((x, y) => x.s.commute.walk - y.s.commute.walk);
    else items.sort((x, y) => y.s.total - x.s.total || x.s.effective - y.s.effective);
    $('#browseCount').textContent = `${items.length} of ${L.length} places${state.quizDone ? ', ranked against your quiz answers' : ''}`;
    $('#browseList').innerHTML = items.length
      ? items.map((x) => cardHTML(x.l, x.s)).join('')
      : '<div class="empty"><p>No places match these filters.</p><p><button type="button" class="linkbtn" data-action="reset-filters">Clear filters</button></p></div>';
    $$('#browseCampus button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.val === f.campus)));
    $$('#browseMode button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.val === f.mode)));
    $('#browseLayout').classList.toggle('is-map', f.mode === 'map');
    $('#fPrice').value = f.price;
    $('#fRooms').value = f.rooms;
    $('#fSort').value = f.sort;
    $('#fSort option[value="match"]').textContent = state.quizDone ? 'Best match' : 'Recommended';
    browseMap.setPins(items);
  }

  function hotCard(id, on, scroll) {
    const c = document.querySelector(`#browseList .card[data-id="${id}"]`);
    $$('#browseList .card.is-hot').forEach((x) => { if (x !== c) x.classList.remove('is-hot'); });
    if (!c) return;
    c.classList.toggle('is-hot', on);
    if (on && scroll && mq('(min-width: 901px)')) c.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function bindBrowse() {
    $('#fPrice').addEventListener('change', (e) => { state.browse.price = e.target.value; renderBrowse(); });
    $('#fRooms').addEventListener('change', (e) => { state.browse.rooms = e.target.value; renderBrowse(); });
    $('#fSort').addEventListener('change', (e) => { state.browse.sort = e.target.value; renderBrowse(); });
    const list = $('#browseList');
    const over = (e) => {
      const c = e.target.closest('.card');
      if (c && browseMap) browseMap.highlight(c.dataset.id, true);
    };
    const out = (e) => {
      const c = e.target.closest('.card');
      if (c && browseMap && !c.contains(e.relatedTarget)) browseMap.highlight(c.dataset.id, false);
    };
    list.addEventListener('pointerover', over);
    list.addEventListener('pointerout', out);
    list.addEventListener('focusin', over);
    list.addEventListener('focusout', out);
  }

  function createMap(el) {
    el.innerHTML = `<div class="map-canvas"><svg viewBox="0 0 1200 800" width="1200" height="800" aria-hidden="true" focusable="false"><use href="#hr-map"/></svg><div class="map-pins"></div></div>
      <div class="map-legend" aria-hidden="true"><span><i class="lg lg--on"></i>On campus</span><span><i class="lg lg--pin-off"></i>Off campus</span><span><i class="lg-line lg-line--2"></i>Route 2</span><span><i class="lg-line lg-line--7"></i>Route 7</span></div>
      <div class="map-ctrl"><button type="button" data-z="in" aria-label="Zoom in">${icon('plus')}</button><button type="button" data-z="out" aria-label="Zoom out">${icon('minus')}</button><button type="button" data-z="fit" aria-label="Show the whole map">${icon('target')}</button></div>
      <div class="map-card" hidden></div>`;
    const canvas = $('.map-canvas', el);
    const pinsEl = $('.map-pins', el);
    const card = $('.map-card', el);
    const KMAX = 3;
    const pointers = new Map();
    let k = 1;
    let tx = 0;
    let ty = 0;
    let kMin = 0.3;
    let fitted = false;
    let moved = false;
    let drag = null;
    let pinch = null;
    let selected = null;

    function apply() {
      canvas.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${k.toFixed(4)})`;
      canvas.style.setProperty('--inv', (1 / k).toFixed(4));
      canvas.style.setProperty('--ts', Math.min(2.4, Math.max(1, 1 / k)).toFixed(3));
    }
    function clamp() {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const cx = Math.min(1200, Math.max(0, (w / 2 - tx) / k));
      const cy = Math.min(800, Math.max(0, (h / 2 - ty) / k));
      tx = w / 2 - cx * k;
      ty = h / 2 - cy * k;
    }
    function fit() {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const base = Math.min(w / 1200, h / 800);
      kMin = base * 0.85;
      k = Math.min(KMAX, Math.max(kMin, base * 1.02));
      tx = w / 2 - 600 * k;
      ty = h / 2 - 400 * k;
      clamp();
      apply();
      fitted = true;
    }
    function zoomAt(f, px, py) {
      const nk = Math.min(KMAX, Math.max(kMin, k * f));
      const mx = (px - tx) / k;
      const my = (py - ty) / k;
      k = nk;
      tx = px - mx * k;
      ty = py - my * k;
      clamp();
      apply();
      moved = true;
    }
    const onUI = (t) => t.closest('.pin, .map-ctrl, .map-card');

    el.addEventListener('pointerdown', (e) => {
      if (onUI(e.target)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
      if (pointers.size === 1) drag = { x: e.clientX, y: e.clientY, tx, ty, moved: false };
      if (pointers.size === 2) {
        const [p1, p2] = Array.from(pointers.values());
        pinch = { d: Math.hypot(p1.x - p2.x, p1.y - p2.y) || 1, k };
        drag = null;
      }
    });
    el.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [p1, p2] = Array.from(pointers.values());
        const r = el.getBoundingClientRect();
        const target = pinch.k * (Math.hypot(p1.x - p2.x, p1.y - p2.y) / pinch.d);
        zoomAt(target / k, (p1.x + p2.x) / 2 - r.left, (p1.y + p2.y) / 2 - r.top);
      } else if (drag) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; el.classList.add('is-dragging'); }
        if (drag.moved) {
          tx = drag.tx + dx;
          ty = drag.ty + dy;
          clamp();
          apply();
          moved = true;
        }
      }
    });
    const end = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 1) {
        const p = Array.from(pointers.values())[0];
        drag = { x: p.x, y: p.y, tx, ty, moved: true };
      } else if (pointers.size === 0) {
        const click = drag && !drag.moved && e.type === 'pointerup';
        drag = null;
        el.classList.remove('is-dragging');
        if (click) select(null);
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.008), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    el.addEventListener('dblclick', (e) => {
      if (onUI(e.target)) return;
      const r = el.getBoundingClientRect();
      zoomAt(1.6, e.clientX - r.left, e.clientY - r.top);
    });
    el.addEventListener('keydown', (e) => {
      if (e.target !== el) return;
      const step = 60;
      const pans = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      if (pans[e.key]) {
        e.preventDefault();
        tx += pans[e.key][0];
        ty += pans[e.key][1];
        clamp();
        apply();
        moved = true;
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomAt(1.3, el.clientWidth / 2, el.clientHeight / 2);
      } else if (e.key === '-') {
        e.preventDefault();
        zoomAt(1 / 1.3, el.clientWidth / 2, el.clientHeight / 2);
      }
    });
    $('.map-ctrl', el).addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.z === 'in') zoomAt(1.4, el.clientWidth / 2, el.clientHeight / 2);
      else if (b.dataset.z === 'out') zoomAt(1 / 1.4, el.clientWidth / 2, el.clientHeight / 2);
      else { moved = false; fit(); }
    });
    pinsEl.addEventListener('click', (e) => {
      const p = e.target.closest('.pin');
      if (p) select(p.dataset.id, true);
    });
    pinsEl.addEventListener('pointerover', (e) => {
      const p = e.target.closest('.pin');
      if (p) hotCard(p.dataset.id, true);
    });
    pinsEl.addEventListener('pointerout', (e) => {
      const p = e.target.closest('.pin');
      if (p && !p.contains(e.relatedTarget)) hotCard(p.dataset.id, p.dataset.id === selected);
    });
    card.addEventListener('click', (e) => { if (e.target.closest('[data-map-close]')) select(null); });
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        if (!fitted || !moved) fit();
        else { clamp(); apply(); }
      }).observe(el);
    }

    function markActive() {
      $$('.pin', pinsEl).forEach((p) => p.classList.toggle('is-active', p.dataset.id === selected));
    }
    function select(id, fromPin) {
      selected = id;
      markActive();
      if (!id) {
        card.hidden = true;
        hotCard('', false);
        return;
      }
      const l = byId[id];
      const cl = M.commuteLabel(l, state.quizDone ? answers().commute : 'walk');
      card.innerHTML = `<img src="${ART.photo(l, 0)}" alt="">
        <div class="map-card-body">
          <span class="card-sub">${esc(l.kind)} · ${esc(l.hood)}</span>
          <b>${esc(l.name)}</b>
          <span class="price price--sm">${money(l.rent)}<small>/mo</small></span>
          <span class="sign">${icon(cl.icon)}${esc(cl.short)}</span>
          <div class="map-card-row"><button type="button" class="btn btn--secondary btn--sm" data-action="open" data-id="${l.id}">Details</button><button type="button" class="btn btn--primary btn--sm" data-action="tour" data-id="${l.id}">Book a tour</button></div>
        </div>
        <button type="button" class="iconbtn" data-map-close aria-label="Close preview">${icon('x')}</button>`;
      card.hidden = false;
      if (fromPin) hotCard(id, true, true);
    }
    function setPins(items) {
      const q = D.campus.quad;
      pinsEl.innerHTML = `<div class="qpin" style="left:${q[0]}px;top:${q[1]}px">${icon('flag')}Main Quad</div>` +
        items.map(({ l }) => `<button type="button" class="pin pin--${l.campus}" data-id="${l.id}" style="left:${l.pos[0]}px;top:${l.pos[1]}px" aria-label="${esc(l.name)}, ${money(l.rent)} per month"><span>${money(l.rent)}</span></button>`).join('');
      if (selected && !items.some((x) => x.l.id === selected)) select(null);
      else markActive();
      if (!fitted) fit();
    }
    function highlight(id, on) {
      const p = pinsEl.querySelector(`.pin[data-id="${id}"]`);
      if (p) p.classList.toggle('is-hot', on);
    }
    return { setPins, highlight, select, fit };
  }

  // ---------- dialogs ----------
  function openDialog(d) {
    if (d.open) return;
    try { d.showModal(); } catch (e) { d.setAttribute('open', ''); }
  }
  function closeHostDialog(el, keepListing) {
    const d = el.closest('dialog');
    if (d && d.open && !(keepListing && d.id === 'dlgListing')) d.close();
  }

  function openListing(id) {
    const l = byId[id];
    if (!l) return;
    const s = M.score(l, answers());
    $('#dlgListingBody').innerHTML = `<div class="dl-head">
        <div>
          <div class="rec-tags">${campusTag(l)}<span class="kind">${esc(l.kind)}</span></div>
          <h2 class="dl-title" id="dlgListingTitle">${esc(l.name)}</h2>
          <p class="rec-addr">${icon('pin')}${esc(l.address)} · ${esc(l.hood)}</p>
        </div>
        ${state.quizDone ? ring(s.total) : ''}
      </div>${detailHTML(l)}`;
    $('#dlgListingFoot').innerHTML = `<div class="dl-price"><span class="price">${money(l.rent)}<small>/mo</small></span><span>${l.utilities.included ? 'Utilities included' : '+ about ' + money(l.utilities.estimate) + ' utilities'} · ${esc(l.layout.summary)}</span></div>
      <div class="dlg-actions">
        <button type="button" class="btn btn--secondary" data-action="contact" data-id="${l.id}">${icon('chat')}Contact landlord</button>
        <button type="button" class="btn btn--primary" data-action="tour" data-id="${l.id}">${icon('calendar')}Book a tour</button>
      </div>`;
    const d = $('#dlgListing');
    openDialog(d);
    $('#dlgListingBody').scrollTop = 0;
  }

  function openListingSmart(id) {
    const chatEl = $('#chat');
    if (state.view === 'results' && state.top.some((x) => x.l.id === id)) {
      if (chatEl.classList.contains('is-floating')) closeChat();
      expandCard(id, true);
      const card = document.getElementById('rec-' + id);
      if (card) card.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    if (chatEl.classList.contains('is-floating') && mq('(max-width: 560px)')) closeChat();
    openListing(id);
  }

  function llMini(l) {
    const ll = l.landlord;
    return `<div class="ll-mini"><span class="avatar" aria-hidden="true">${initials(ll.name)}</span><div class="ll-mini-text"><b>${esc(ll.name)}</b><span>${esc(ll.role)} · ${esc(ll.company)}</span><span>${esc(ll.response)}</span></div></div>`;
  }

  function openContact(id) {
    const l = byId[id];
    if (!l) return;
    const ll = l.landlord;
    const me = state.me;
    const a = answers();
    const leasePhrase = { semester: 'a one-semester lease', academic: 'the 2027–28 academic year', year: 'a 12-month lease', flex: 'a month-to-month lease' }[a.lease];
    const msg = `Hi ${firstName(ll.name)}, I’m a Temple student interested in ${l.name}${state.quizDone ? ` for ${leasePhrase}` : ''}. Is it still available? I’d also like to know what the monthly costs include. Thanks!`;
    const d = $('#dlgContact');
    d.innerHTML = `<form class="dlg-form" id="contactForm" novalidate>
      <header class="dlg-head"><div><p class="eyebrow">Contact landlord</p><h2 class="dlg-title" id="dlgContactTitle">Message ${esc(ll.name)}</h2><p class="dlg-sub">About ${esc(l.name)}</p></div><button type="button" class="iconbtn" data-action="close" aria-label="Close">${icon('x')}</button></header>
      <div class="dlg-body" id="contactBody">
        ${llMini(l)}
        <div class="form-grid">
          <div class="field"><label for="cName">Your name</label><input class="input" id="cName" name="name" autocomplete="name" value="${esc(me.name)}" required></div>
          <div class="field"><label for="cEmail">Email</label><input class="input" id="cEmail" name="email" type="email" autocomplete="email" value="${esc(me.email)}" required></div>
          <div class="field field--full"><label for="cPhone">Phone <span class="opt-label">optional</span></label><input class="input" id="cPhone" name="phone" type="tel" autocomplete="tel" value="${esc(me.phone)}"></div>
          <div class="field field--full"><label for="cMsg">Message</label><textarea class="textarea" id="cMsg" name="message" rows="5" required>${esc(msg)}</textarea>
            <div class="quick" aria-label="Add a question">${['Is the move-in date flexible?', 'What do utilities usually cost?', 'Can I see the lease first?', 'Do you need a guarantor?'].map((q) => `<button type="button" class="quick-btn" data-q="${esc(q)}">${icon('plus')}${esc(q)}</button>`).join('')}</div>
          </div>
        </div>
        <p class="form-error" id="cErr" role="alert" hidden></p>
      </div>
      <footer class="dlg-foot"><p class="demo-note">${icon('info')}Demo: messages stay in this browser.</p><div class="dlg-actions"><button type="button" class="btn btn--ghost" data-action="close">Cancel</button><button type="submit" class="btn btn--primary">${icon('send')}Send message</button></div></footer>
    </form>`;
    const form = $('#contactForm', d);
    $('.quick', d).addEventListener('click', (e) => {
      const b = e.target.closest('.quick-btn');
      if (!b) return;
      const ta = $('#cMsg', d);
      ta.value = ta.value.replace(/\s+$/, '') + '\n' + b.dataset.q;
      b.disabled = true;
      ta.focus();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#cName', d).value.trim();
      const email = $('#cEmail', d).value.trim();
      const phone = $('#cPhone', d).value.trim();
      const text = $('#cMsg', d).value.trim();
      const problems = [];
      if (!name) problems.push('add your name');
      if (!validEmail(email)) problems.push('add a valid email address');
      if (text.length < 10) problems.push('write a short message');
      $('#cName', d).setAttribute('aria-invalid', String(!name));
      $('#cEmail', d).setAttribute('aria-invalid', String(!validEmail(email)));
      $('#cMsg', d).setAttribute('aria-invalid', String(text.length < 10));
      const err = $('#cErr', d);
      if (problems.length) {
        err.textContent = 'To send this, ' + M.listJoin(problems) + '.';
        err.hidden = false;
        return;
      }
      saveMe({ name, email, phone });
      state.messages.unshift({ id: 'm' + Date.now().toString(36), listingId: l.id, text, created: Date.now() });
      store.set('messages', state.messages);
      updateToursNav();
      $('#contactBody', d).innerHTML = `<div class="success">
        <span class="success-icon">${icon('check')}</span>
        <h2>Message sent to ${esc(firstName(ll.name))}</h2>
        <p>${esc(firstName(ll.name))} ${esc(lowerFirst(ll.response))}. We saved a copy under My tours.</p>
        <div class="success-actions"><button type="button" class="btn btn--secondary" data-action="tour" data-id="${l.id}">${icon('calendar')}Book a tour too</button></div>
      </div>`;
      $('.dlg-foot', d).innerHTML = `<p class="demo-note">${icon('info')}Demo: Homeroom doesn’t deliver messages yet.</p><div class="dlg-actions"><button type="button" class="btn btn--primary" data-action="close">Done</button></div>`;
    });
    openDialog(d);
  }

  function tourDays(l) {
    const out = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const dow = d.getDay();
      const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const kind = l.landlord.kind;
      let base;
      if (kind === 'university') base = dow === 0 || dow === 6 ? [] : ['10:00', '11:30', '13:00', '14:30', '16:00'];
      else if (kind === 'coop') base = dow === 0 ? ['14:00', '15:00', '16:00'] : dow === 6 ? [] : ['17:30', '18:30'];
      else if (kind === 'owner' || kind === 'sublet') base = dow === 0 ? ['12:00', '14:00'] : ['10:00', '16:30', '18:00'];
      else base = dow === 0 ? [] : dow === 6 ? ['11:00', '12:30', '14:00'] : ['09:30', '11:00', '12:30', '14:00', '15:30', '17:00'];
      out.push({ iso, slots: base.map((t) => ({ t, open: ART.hash(l.id + iso + t) % 4 !== 0 })) });
    }
    return out;
  }

  function gcal(l, tour) {
    const [y, m, d] = tour.date.split('-').map(Number);
    const [hh, mm] = tour.time.split(':').map(Number);
    const fmt = (dt) => `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
    const start = new Date(y, m - 1, d, hh, mm);
    const end = new Date(y, m - 1, d, hh, mm + 30);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Tour: ${l.name}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `${tour.type === 'video' ? 'Video tour' : 'In-person tour'} with ${l.landlord.name} (${l.landlord.company}). Phone ${l.landlord.phone}. Booked on Homeroom.`,
      location: tour.type === 'video' ? 'Video call' : `${l.address}, ${D.campus.town}`,
    });
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) params.set('ctz', tz);
    } catch (e) { /* no time zone info */ }
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  function openTour(id) {
    const l = byId[id];
    if (!l) return;
    const ll = l.landlord;
    const me = state.me;
    const days = tourDays(l);
    const first = days.find((x) => x.slots.some((s) => s.open));
    const t = { type: 'in-person', day: first ? first.iso : null, time: null };
    const d = $('#dlgTour');
    d.innerHTML = `<form class="dlg-form" id="tourForm" novalidate>
      <header class="dlg-head"><div><p class="eyebrow">Book a tour</p><h2 class="dlg-title" id="dlgTourTitle">${esc(l.name)}</h2><p class="dlg-sub">${esc(l.address)} · with ${esc(ll.name)}</p></div><button type="button" class="iconbtn" data-action="close" aria-label="Close">${icon('x')}</button></header>
      <div class="dlg-body stack" id="tourBody">
        <div class="field"><span class="field-label" id="tTypeL">Tour type</span><div class="seg" role="group" aria-labelledby="tTypeL" id="tType"><button type="button" data-type="in-person" aria-pressed="true">In person</button><button type="button" data-type="video" aria-pressed="false">Video call</button></div></div>
        <div class="field"><span class="field-label" id="tDayL">Pick a day</span><div class="dates" role="group" aria-labelledby="tDayL" id="tDays"></div></div>
        <div class="field"><span class="field-label" id="tTimeL">Pick a time</span><div class="slots" role="group" aria-labelledby="tTimeL" id="tSlots"></div></div>
        <div class="form-grid">
          <div class="field"><label for="tName">Your name</label><input class="input" id="tName" autocomplete="name" value="${esc(me.name)}" required></div>
          <div class="field"><label for="tEmail">Email</label><input class="input" id="tEmail" type="email" autocomplete="email" value="${esc(me.email)}" required></div>
          <div class="field field--full"><label for="tPhone">Phone <span class="opt-label">optional, for day-of updates</span></label><input class="input" id="tPhone" type="tel" autocomplete="tel" value="${esc(me.phone)}"></div>
        </div>
        <div class="tour-sum" id="tSum" aria-live="polite"></div>
        <p class="form-error" id="tErr" role="alert" hidden></p>
      </div>
      <footer class="dlg-foot"><p class="demo-note">${icon('info')}Demo: requests stay in this browser.</p><div class="dlg-actions"><button type="button" class="btn btn--ghost" data-action="close">Cancel</button><button type="submit" class="btn btn--primary">${icon('calendar')}Request tour</button></div></footer>
    </form>`;
    const daysEl = $('#tDays', d);
    const slotsEl = $('#tSlots', d);
    const sumEl = $('#tSum', d);
    const longDate = (iso) => fmtDate(iso, { weekday: 'long', month: 'long', day: 'numeric' });
    function renderDays() {
      daysEl.innerHTML = days.map((x) => {
        const any = x.slots.some((s) => s.open);
        return `<button type="button" class="date" data-day="${x.iso}" aria-pressed="${t.day === x.iso}"${any ? '' : ' disabled'} aria-label="${longDate(x.iso)}${any ? '' : ', no times open'}"><span class="dow">${fmtDate(x.iso, { weekday: 'short' })}</span><span class="day">${isoToDate(x.iso).getDate()}</span><span class="mon">${fmtDate(x.iso, { month: 'short' })}</span></button>`;
      }).join('');
    }
    function renderSlots() {
      const x = days.find((y) => y.iso === t.day);
      slotsEl.innerHTML = x
        ? x.slots.map((s) => `<button type="button" class="slot" data-time="${s.t}" aria-pressed="${t.time === s.t}"${s.open ? '' : ' disabled'} aria-label="${fmtTime(s.t)}${s.open ? '' : ', booked'}">${fmtTime(s.t)}</button>`).join('')
        : '<p class="slots-empty">Pick a day first.</p>';
    }
    function renderSum() {
      sumEl.innerHTML = t.day && t.time
        ? `${icon('check')}<span>${t.type === 'video' ? 'Video tour' : 'In-person tour'} on ${longDate(t.day)} at ${fmtTime(t.time)}. Tours take about 30 minutes.</span>`
        : `${icon('clock')}<span>Pick a day and a time. Tours take about 30 minutes.</span>`;
    }
    renderDays();
    renderSlots();
    renderSum();
    $('#tType', d).addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      t.type = b.dataset.type;
      $$('#tType button', d).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      renderSum();
    });
    daysEl.addEventListener('click', (e) => {
      const b = e.target.closest('.date');
      if (!b || b.disabled) return;
      t.day = b.dataset.day;
      t.time = null;
      renderDays();
      renderSlots();
      renderSum();
      const sel = daysEl.querySelector(`.date[data-day="${t.day}"]`);
      if (sel) sel.focus();
    });
    slotsEl.addEventListener('click', (e) => {
      const b = e.target.closest('.slot');
      if (!b || b.disabled) return;
      t.time = b.dataset.time;
      $$('.slot', slotsEl).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      renderSum();
    });
    $('#tourForm', d).addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#tName', d).value.trim();
      const email = $('#tEmail', d).value.trim();
      const phone = $('#tPhone', d).value.trim();
      const problems = [];
      if (!t.day || !t.time) problems.push('pick a day and a time');
      if (!name) problems.push('add your name');
      if (!validEmail(email)) problems.push('add a valid email address');
      $('#tName', d).setAttribute('aria-invalid', String(!name));
      $('#tEmail', d).setAttribute('aria-invalid', String(!validEmail(email)));
      const err = $('#tErr', d);
      if (problems.length) {
        err.textContent = 'To request the tour, ' + M.listJoin(problems) + '.';
        err.hidden = false;
        return;
      }
      saveMe({ name, email, phone });
      const tour = { id: 't' + Date.now().toString(36), listingId: l.id, date: t.day, time: t.time, type: t.type, created: Date.now() };
      state.tours.push(tour);
      store.set('tours', state.tours);
      updateToursNav();
      $('#tourBody', d).classList.remove('stack');
      $('#tourBody', d).innerHTML = `<div class="success">
        <span class="success-icon">${icon('check')}</span>
        <h2>Tour requested</h2>
        <p>${tour.type === 'video' ? 'Video tour' : 'In-person tour'} of ${esc(l.name)} on ${longDate(tour.date)} at ${fmtTime(tour.time)} with ${esc(ll.name)}. ${esc(firstName(ll.name))} ${esc(lowerFirst(ll.response))} to confirm.</p>
        <div class="success-actions">
          <a class="btn btn--secondary" href="${esc(gcal(l, tour))}" target="_blank" rel="noopener">${icon('calendar')}Add to Google Calendar</a>
          <button type="button" class="btn btn--secondary" data-action="tours">${icon('list')}See my tours</button>
        </div>
      </div>`;
      $('.dlg-foot', d).innerHTML = `<p class="demo-note">${icon('info')}Demo: Homeroom doesn’t send tour requests yet.</p><div class="dlg-actions"><button type="button" class="btn btn--primary" data-action="close">Done</button></div>`;
    });
    openDialog(d);
  }

  function tourItemHTML(t) {
    const l = byId[t.listingId];
    if (!l) return '';
    return `<li class="tour-item">
      <div class="tour-cal" aria-hidden="true"><span class="dow">${fmtDate(t.date, { weekday: 'short' })}</span><span class="day">${isoToDate(t.date).getDate()}</span></div>
      <div class="tour-info">
        <b>${esc(l.name)}</b>
        <span>${fmtDate(t.date, { weekday: 'long', month: 'long', day: 'numeric' })} at ${fmtTime(t.time)} · ${t.type === 'video' ? 'Video call' : 'In person'}</span>
        <span>${esc(l.address)} · with ${esc(l.landlord.name)}</span>
        <div class="tour-acts">
          <a class="btn btn--secondary btn--sm" href="${esc(gcal(l, t))}" target="_blank" rel="noopener">${icon('calendar')}Add to calendar</a>
          <button type="button" class="btn btn--ghost btn--sm" data-action="open" data-id="${l.id}">View listing</button>
          <button type="button" class="btn btn--ghost btn--sm" data-action="cancel-tour" data-tour="${t.id}">Cancel tour</button>
        </div>
      </div>
    </li>`;
  }

  function toursBodyHTML() {
    const today = todayISO();
    const tours = state.tours.slice().sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
    const upcoming = tours.filter((t) => t.date >= today);
    const past = tours.filter((t) => t.date < today);
    let o = '<h3 class="sub-h">Upcoming tours</h3>';
    o += upcoming.length ? `<ul class="tour-list">${upcoming.map(tourItemHTML).join('')}</ul>` : '<p class="slots-empty">No tours booked yet. Use Book a tour on any listing.</p>';
    if (past.length) o += `<h3 class="sub-h">Past tours</h3><ul class="tour-list">${past.map(tourItemHTML).join('')}</ul>`;
    o += '<h3 class="sub-h">Messages you sent</h3>';
    o += state.messages.length
      ? `<ul class="msg-list">${state.messages.map((m) => { const l = byId[m.listingId]; return l ? `<li class="msg-item"><b>${esc(l.name)}</b> · to ${esc(l.landlord.name)} · ${new Date(m.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<p>${esc(m.text)}</p></li>` : ''; }).join('')}</ul>`
      : '<p class="slots-empty">No messages yet.</p>';
    return o;
  }

  function openTours() {
    const d = $('#dlgTours');
    d.innerHTML = `<div class="dlg-shell">
      <header class="dlg-head"><div><p class="eyebrow">Saved in this browser</p><h2 class="dlg-title" id="dlgToursTitle">My tours and messages</h2></div><button type="button" class="iconbtn" data-action="close" aria-label="Close">${icon('x')}</button></header>
      <div class="dlg-body" id="toursBody">${toursBodyHTML()}</div>
    </div>`;
    openDialog(d);
  }

  function cancelTour(btn) {
    if (!btn.dataset.confirm) {
      btn.dataset.confirm = '1';
      btn.textContent = 'Tap again to cancel';
      btn.classList.add('btn--secondary');
      return;
    }
    state.tours = state.tours.filter((t) => t.id !== btn.dataset.tour);
    store.set('tours', state.tours);
    updateToursNav();
    const body = $('#toursBody');
    if (body) body.innerHTML = toursBodyHTML();
  }

  function updateToursNav() {
    const count = state.tours.filter((t) => t.date >= todayISO()).length;
    $('#navTours').hidden = !(state.tours.length || state.messages.length);
    $('#navToursCount').textContent = count;
    $('#navToursCount').hidden = count === 0;
  }

  // ---------- account UI ----------
  function renderAccount() {
    const side = $('#accountSide');
    const mob = $('#accountMob');
    const u = state.auth;
    if (side) {
      side.innerHTML = u
        ? `<button type="button" class="acct-chip" data-action="auth-open" aria-label="Your account">
             <span class="avatar avatar--sm" aria-hidden="true">${esc(initials(u.name))}</span>
             <span class="acct-meta"><b>${esc(firstName(u.name))}</b><span>${esc(u.email)}</span></span>
           </button>
           <button type="button" class="linkbtn acct-link" data-action="signout">Sign out</button>`
        : `<button type="button" class="btn btn--secondary btn--block" data-action="auth-open" data-mode="signin">Sign in</button>
           <button type="button" class="linkbtn acct-link" data-action="auth-open" data-mode="signup">Create an account</button>`;
    }
    if (mob) {
      mob.innerHTML = u
        ? `<button type="button" class="avatar avatar--sm" data-action="auth-open" aria-label="Your account, ${esc(u.name)}">${esc(initials(u.name))}</button>`
        : `<button type="button" class="iconbtn" data-action="auth-open" data-mode="signin" aria-label="Sign in or create an account">${icon('user')}</button>`;
    }
  }

  function openAuth(mode) {
    const d = $('#dlgAuth');
    if (state.auth) {
      const u = state.auth;
      d.innerHTML = `<div class="dlg-shell">
        <header class="dlg-head"><div><p class="eyebrow">Homeroom account</p><h2 class="dlg-title" id="dlgAuthTitle">Your account</h2></div><button type="button" class="iconbtn" data-action="close" aria-label="Close">${icon('x')}</button></header>
        <div class="dlg-body stack">
          <div class="acct-card"><span class="avatar" aria-hidden="true">${esc(initials(u.name))}</span><div class="acct-card-text"><b>${esc(u.name)}</b><span>${esc(u.email)}</span></div></div>
          <p class="acct-hint">You’re signed in, so your name and email fill in automatically when you message a landlord or book a tour. Signing in is optional — everything on Homeroom works without it.</p>
        </div>
        <footer class="dlg-foot"><p class="demo-note">${icon('info')}Signed in on this browser.</p><div class="dlg-actions"><button type="button" class="btn btn--secondary" data-action="signout">Sign out</button></div></footer>
      </div>`;
      openDialog(d);
      return;
    }

    const signup = mode === 'signup';
    const me = state.me || { name: '', email: '', phone: '' };
    d.innerHTML = `<form class="dlg-form" id="authForm" novalidate>
      <header class="dlg-head"><div><p class="eyebrow">Homeroom account</p><h2 class="dlg-title" id="dlgAuthTitle">${signup ? 'Create your account' : 'Welcome back'}</h2><p class="dlg-sub">Optional — browse and get matched without one.</p></div><button type="button" class="iconbtn" data-action="close" aria-label="Close">${icon('x')}</button></header>
      <div class="dlg-body stack">
        <div class="seg auth-tabs" role="group" aria-label="Account">
          <button type="button" data-action="auth-open" data-mode="signin" aria-pressed="${!signup}">Sign in</button>
          <button type="button" data-action="auth-open" data-mode="signup" aria-pressed="${signup}">Sign up</button>
        </div>
        ${signup ? `<div class="field"><label for="auName">Your name</label><input class="input" id="auName" autocomplete="name" value="${esc(me.name)}" required></div>` : ''}
        <div class="field"><label for="auEmail">Email</label><input class="input" id="auEmail" type="email" autocomplete="email" value="${esc(me.email)}" required></div>
        <div class="field"><label for="auPass">Password</label><input class="input" id="auPass" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" required>${signup ? '<span class="opt-label field-hint">At least 6 characters.</span>' : ''}</div>
        <p class="form-error" id="authErr" role="alert" hidden></p>
      </div>
      <footer class="dlg-foot"><p class="demo-note">${icon('info')}Demo: your account is saved only in this browser.</p><div class="dlg-actions"><button type="submit" class="btn btn--primary">${signup ? 'Create account' : 'Sign in'}</button></div></footer>
    </form>`;
    const form = $('#authForm', d);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameEl = $('#auName', d);
      const name = nameEl ? nameEl.value.trim() : '';
      const email = $('#auEmail', d).value.trim();
      const pass = $('#auPass', d).value;
      const problems = [];
      if (signup && name.length < 2) problems.push('add your name');
      if (!validEmail(email)) problems.push('add a valid email address');
      if (pass.length < 6) problems.push(signup ? 'choose a password of at least 6 characters' : 'enter your password');
      if (nameEl) nameEl.setAttribute('aria-invalid', String(signup && name.length < 2));
      $('#auEmail', d).setAttribute('aria-invalid', String(!validEmail(email)));
      $('#auPass', d).setAttribute('aria-invalid', String(pass.length < 6));
      const err = $('#authErr', d);
      if (problems.length) {
        err.textContent = 'To continue, ' + M.listJoin(problems) + '.';
        err.hidden = false;
        return;
      }
      const res = signup ? signUp(name, email, pass) : signIn(email, pass);
      if (res.error) {
        err.textContent = res.error;
        err.hidden = false;
        return;
      }
      renderAccount();
      d.close();
    });
    openDialog(d);
    const focusEl = signup ? $('#auName', d) : $('#auEmail', d);
    if (focusEl) { try { focusEl.focus(); } catch (e) { /* focus not available */ } }
  }

  // ---------- assistant ----------
  const chat = { turns: [], busy: false, ctl: null, mode: 'checking', sample: null, ready: null };

  function setChatMode(mode) {
    chat.mode = mode;
    $('#chat').dataset.mode = mode;
    $('#chatStatus').textContent = mode === 'ai' ? 'Claude · knows your answers and every listing' : mode === 'basic' ? 'Basic mode · answers from the listing data' : 'Connecting…';
    $('#chatFoot').textContent = mode === 'basic'
      ? 'Basic mode handles common questions about prices, commutes, leases and amenities.'
      : 'Answers can be wrong. Confirm details with the landlord.';
  }

  function connectAI() {
    chat.ready = (async () => {
      try {
        if (window.claude && typeof window.claude.use === 'function') {
          const s = await window.claude.use('sample');
          if (s) { chat.sample = s; setChatMode('ai'); return; }
        }
      } catch (e) { /* fall through to basic mode */ }
      setChatMode('basic');
    })();
  }

  function scrollLog() {
    const log = $('#chatLog');
    log.scrollTop = log.scrollHeight;
  }
  function addMsg(role, html) {
    const el = document.createElement('div');
    el.className = 'msg msg--' + role;
    el.innerHTML = html;
    $('#chatLog').appendChild(el);
    scrollLog();
    return el;
  }
  function note(bubble, text) {
    bubble.insertAdjacentHTML('beforeend', `<p class="msg-note">${esc(text)}</p>`);
    scrollLog();
  }

  function md(text) {
    const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
    let html = '';
    let para = [];
    let list = null;
    const flushP = () => { if (para.length) { html += `<p>${para.map(inline).join('<br>')}</p>`; para = []; } };
    const flushL = () => { if (list) { html += `<${list.t}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.t}>`; list = null; } };
    String(text).replace(/\r/g, '').split('\n').forEach((raw) => {
      const line = raw.replace(/\s+$/, '');
      let m;
      if (!line.trim()) { flushP(); flushL(); return; }
      if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) {
        flushP();
        if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; }
        list.items.push(m[1]);
        return;
      }
      if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
        flushP();
        if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; }
        list.items.push(m[1]);
        return;
      }
      if ((m = line.match(/^#{1,6}\s+(.*)$/))) { flushP(); flushL(); html += `<p><strong>${inline(m[1])}</strong></p>`; return; }
      flushL();
      para.push(line);
    });
    flushP();
    flushL();
    return html;
  }

  function mentioned(text) {
    const t = text.toLowerCase();
    return L.filter((l) => t.includes(l.name.toLowerCase())).slice(0, 3);
  }
  function finishBot(bubble, text) {
    bubble.innerHTML = md(text);
    const ls = mentioned(text);
    if (ls.length) bubble.insertAdjacentHTML('beforeend', `<div class="msg-chips">${ls.map((l) => `<button type="button" class="msg-chip" data-action="open" data-id="${l.id}">${icon('arrowRight')}${esc(l.name)}</button>`).join('')}</div>`);
    chat.turns.push({ role: 'assistant', content: text });
    scrollLog();
  }

  function welcomeText() {
    return state.quizDone
      ? `Hi! I know your quiz answers and all ${L.length} listings. Ask me to compare places, explain a lease term, or find something specific, like parking or a pet-friendly place.`
      : `Hi! I know all ${L.length} listings near Temple. Ask me to compare places, explain a lease term, or find something specific, like parking or a pet-friendly place.`;
  }

  function renderSuggestions() {
    const el = $('#chatSuggest');
    if (chat.turns.some((t) => t.role === 'user')) { el.hidden = true; return; }
    const top = currentTop().map((x) => x.l);
    const s = [];
    if (top.length >= 2) s.push(`Compare ${top[0].name} and ${top[1].name}`);
    s.push('Which place is cheapest with utilities?');
    s.push('What is a by-the-bed lease?');
    s.push('Should I live on or off campus?');
    el.innerHTML = s.map((q) => `<button type="button" class="suggest" data-action="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('');
    el.hidden = false;
    const first = $('#chatLog .msg--bot');
    if (first && chat.turns.length === 0) first.innerHTML = md(welcomeText());
  }

  function setBusy(on) {
    chat.busy = on;
    const send = $('#chatSend');
    $('#chatLog').setAttribute('aria-busy', String(on));
    if (on && chat.mode === 'ai') {
      send.innerHTML = icon('stop');
      send.setAttribute('aria-label', 'Stop the answer');
      send.disabled = false;
    } else {
      send.innerHTML = icon('send');
      send.setAttribute('aria-label', 'Send');
      send.disabled = on;
    }
  }

  function listingLine(l) {
    const c = M.commute(l);
    const am = Array.from(M.amenitySet(l)).map((k) => (M.AMENITY[k] || D.extraAmenities[k] || { label: k }).label).join(', ');
    const leases = Object.keys(l.leases).map((k) => `${M.LEASE_NAME[k]} (${l.leases[k]})`).join('; ');
    const bus = l.transit ? `Route ${l.transit.route} bus from ${l.transit.stop}, about ${l.transit.total} min door to door` : l.campus === 'on' ? 'on campus, no bus needed' : 'no bus line that saves time';
    const other = (l.costs.other || []).map((o) => `, ${o.label} ${money(o.amount)}`).join('');
    return `- ${l.name} | ${l.campus === 'on' ? 'on campus' : 'off campus'}, ${l.kind}, ${l.hood}, ${l.address} | rent ${money(l.rent)}/mo (${l.billing}); utilities ${l.utilities.included ? 'included' : 'about ' + money(l.utilities.estimate) + '/mo extra'} (${l.utilities.note.replace(/\.$/, '')}); effective cost ${money(M.effective(l))}/mo | ${l.layout.summary}: ${l.layout.space}, ${l.layout.bath}, ${l.layout.sqft} sq ft, ${roommateText(l).toLowerCase()}, ${l.furnished ? 'furnished' : 'unfurnished'} | ${l.leaseType}; options: ${leases}; move-in from ${l.available} | to the Main Quad: walk ${c.walk} min, bike ${c.bike} min, drive ${c.drive} min, ${bus} | parking: ${l.parking.note} | amenities: ${am} | pets: ${l.rules.pets} | smoking: ${l.rules.smoking} | guests: ${l.rules.guests} | quiet hours: ${l.rules.quiet} | subletting: ${l.rules.sublet} | move-in costs: ${l.costs.depositLabel} ${money(l.costs.deposit)}, application fee ${l.costs.appFee ? money(l.costs.appFee) : 'none'}${other} | contact: ${l.landlord.name}, ${l.landlord.role}, ${l.landlord.company}, ${lowerFirst(l.landlord.response)}, hours ${l.landlord.hours} | ${l.description}`;
  }

  function aiContext() {
    const a = answers();
    const top = currentTop();
    const lines = [
      'You are the housing assistant on Homeroom, a website where Temple University students compare on-campus and off-campus housing. Temple, its town and every listing below are demo data for a prototype, but answer as if they were real listings on the site.',
      '',
      'How to answer:',
      '- Use only the listing data below for facts about listings. If a detail is missing, say so and suggest the Contact landlord button.',
      '- Rent is per person per month. Effective cost means rent plus estimated utilities.',
      '- Keep answers short and friendly: 2 to 5 sentences, or a short bulleted list. No tables and no headings.',
      '- When you mention a listing, write its exact name in **bold**.',
      '- For tours or questions for a landlord, point the student to the Book a tour and Contact landlord buttons on each listing.',
      '- General housing questions (leases, roommates, deposits, budgeting, moving) are welcome. Give practical advice for students.',
      '',
      state.quizDone ? 'The student’s quiz answers:' : 'The student has not taken the quiz yet; the page is using these sample answers:',
      `- Budget: up to ${money(a.budget)} per month`,
      `- Roommates: ${M.ROOM_WANT[a.roommates]}`,
      `- Main way to campus: ${COMMUTE_NAME[a.commute]}`,
      `- Amenities wanted: ${a.amenities.length ? a.amenities.map((x) => M.AMENITY[x].label).join(', ') : 'none picked'}`,
      `- Lease length: ${M.LEASE_NAME[a.lease]}`,
      '',
      `Top matches shown on the page${state.resultsCampus !== 'all' ? ` (filtered to ${state.resultsCampus}-campus places)` : ''}, best first:`,
    ];
    top.forEach((x, i) => lines.push(`${i + 1}. ${x.l.name}: ${x.s.total}% match. Good: ${x.s.pros.slice(0, 3).map((p) => p.text).join('; ') || 'none'}. Trade-offs: ${x.s.cons.slice(0, 2).map((p) => p.text).join('; ') || 'none'}.`));
    lines.push('', 'All listings:');
    L.forEach((l) => lines.push(listingLine(l)));
    lines.push('', `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`);
    return lines.join('\n');
  }

  async function sendChat(raw) {
    const text = String(raw || '').trim();
    if (!text || chat.busy) return;
    const input = $('#chatInput');
    input.value = '';
    autosize(input);
    addMsg('user', esc(text));
    chat.turns.push({ role: 'user', content: text });
    $('#chatSuggest').hidden = true;
    const bubble = addMsg('bot', '<span class="typing" role="status" aria-label="Thinking"><i></i><i></i><i></i></span>');
    setBusy(true);
    await chat.ready;
    if (chat.mode === 'ai') {
      const ctl = new AbortController();
      chat.ctl = ctl;
      setBusy(true);
      try {
        const res = await chat.sample([{ role: 'user', content: aiContext() }].concat(chat.turns.slice(-12)), {
          modelTier: 'quick',
          cache: false,
          signal: ctl.signal,
          onText: ({ text: t }) => { bubble.innerHTML = md(t); scrollLog(); },
        });
        finishBot(bubble, res.text);
        if (res.truncated) note(bubble, 'This answer was cut short. Ask a narrower question for the rest.');
      } catch (e) {
        const code = e && e.code;
        const partial = e && e.text;
        if (code === 'cancelled') {
          if (partial) finishBot(bubble, partial);
          else bubble.remove();
        } else if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code)) {
          setChatMode('basic');
          finishBot(bubble, basicAnswer(text));
          note(bubble, 'Claude isn’t available here, so this answer comes from the listing data.');
        } else if (code === 'rate_limited') {
          bubble.innerHTML = partial ? md(partial) : '';
          note(bubble, 'Too many questions in a row. Wait a moment, then ask again.');
        } else if (code === 'session_expired') {
          bubble.innerHTML = '';
          note(bubble, 'Your Claude session expired. Sign in again to keep chatting.');
        } else if (code === 'refused') {
          bubble.innerHTML = '';
          note(bubble, 'The assistant can’t help with that one. Try asking about a listing.');
        } else if (code === 'prompt_too_large') {
          bubble.innerHTML = '';
          chat.turns = chat.turns.slice(-2);
          note(bubble, 'The conversation got too long. Ask your question again and it will start fresh.');
        } else {
          bubble.innerHTML = partial ? md(partial) : '';
          if (partial) chat.turns.push({ role: 'assistant', content: partial });
          note(bubble, 'The answer was interrupted. Send your question again to retry.');
        }
      } finally {
        chat.ctl = null;
        setBusy(false);
      }
    } else {
      await wait(reduceMotion ? 0 : 420);
      finishBot(bubble, basicAnswer(text));
      setBusy(false);
    }
  }

  function autosize(t) {
    t.style.height = 'auto';
    t.style.height = Math.min(140, t.scrollHeight + 2) + 'px';
  }

  function buildChat() {
    setChatMode('checking');
    addMsg('bot', md(welcomeText()));
    renderSuggestions();
    setBusy(false);
    const input = $('#chatInput');
    $('#chatForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (chat.busy) {
        if (chat.ctl) chat.ctl.abort();
        return;
      }
      sendChat(input.value);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (!chat.busy) sendChat(input.value);
      }
    });
    input.addEventListener('input', () => autosize(input));
    connectAI();
  }

  const dockQuery = window.matchMedia ? window.matchMedia('(min-width: 1100px)') : null;
  function placeChat() {
    const el = $('#chat');
    const fab = $('#chatFab');
    const docked = state.view === 'results' && dockQuery && dockQuery.matches;
    if (docked) {
      if (el.parentElement !== $('#chatDock')) $('#chatDock').appendChild(el);
      el.classList.remove('is-floating', 'is-open');
      fab.hidden = true;
    } else {
      if (el.parentElement !== document.body) document.body.appendChild(el);
      el.classList.add('is-floating');
      if (state.view === 'quiz') el.classList.remove('is-open');
      fab.hidden = state.view === 'quiz' || el.classList.contains('is-open');
    }
    scrollLog();
  }
  function openChat() {
    const el = $('#chat');
    el.classList.add('is-open');
    $('#chatFab').hidden = true;
    scrollLog();
    $('#chatInput').focus();
  }
  function closeChat() {
    const el = $('#chat');
    el.classList.remove('is-open');
    $('#chatFab').hidden = state.view === 'quiz' || !el.classList.contains('is-floating');
  }

  // ---------- basic-mode answers (no AI available) ----------
  const AMEN_TOPICS = [
    { k: 'laundry', re: /laundry|washer|dryer/, yes: 'has a washer and dryer in the unit', no: 'doesn’t have in-unit laundry', list: 'In-unit laundry' },
    { k: 'ac', re: /\bac\b|a\/c|air.?condition/, yes: 'has air conditioning', no: 'doesn’t have air conditioning', list: 'Air conditioning' },
    { k: 'furnished', re: /furnish|furniture/, yes: 'comes furnished', no: 'is unfurnished', list: 'Furnished' },
    { k: 'dishwasher', re: /dishwasher/, yes: 'has a dishwasher', no: 'doesn’t have a dishwasher', list: 'Dishwasher' },
    { k: 'gym', re: /\bgym\b|fitness|work ?out/, yes: 'has a gym', no: 'doesn’t have a gym', list: 'Gym' },
    { k: 'pool', re: /\bpool\b|swim/, yes: 'has a pool', no: 'doesn’t have a pool', list: 'Pool' },
    { k: 'meal', re: /meal|dining|food|dinner/, yes: 'includes a meal plan or shared meals', no: 'doesn’t include meals', list: 'Meals included' },
    { k: 'security', re: /safe|security|secure/, yes: 'has 24/7 security', no: 'doesn’t list 24/7 security', list: '24/7 security' },
    { k: 'study', re: /study|quiet place/, yes: 'has study rooms', no: 'doesn’t list study rooms', list: 'Study rooms' },
  ];

  function basicAnswer(q) {
    const t = q.toLowerCase().replace(/[’']/g, "'");
    const a = answers();
    const topL = currentTop().map((x) => x.l);
    const named = L.filter((l) => t.includes(l.name.toLowerCase()) || (l.aliases || []).some((al) => t.includes(al)));
    const onOnly = /\bon[- ]?campus\b|\bdorms?\b|residence hall/.test(t);
    const offOnly = /\boff[- ]?campus\b/.test(t);
    const pool = onOnly && !offOnly ? L.filter((l) => l.campus === 'on') : offOnly && !onOnly ? L.filter((l) => l.campus === 'off') : L;
    const B = (l) => `**${l.name}**`;
    const costTxt = (l) => (l.utilities.included ? `${money(l.rent)}/mo, utilities included` : `${money(l.rent)}/mo plus about ${money(l.utilities.estimate)} in utilities`);
    const bullets = (ls, fn) => ls.map((l) => `- ${B(l)}: ${fn(l)}`).join('\n');
    const has = (l, k) => M.amenitySet(l).has(k);
    const byMatch = (ls) => ls.slice().sort((x, y) => M.score(y, a).total - M.score(x, a).total);

    if (/^\s*(hi|hey|hello|hiya|yo)\b/.test(t) && t.length < 30) return 'Hi! Ask me to compare your matches, find places with parking or pets, or explain a lease term.';
    if (/\bthanks?\b|thank you/.test(t) && t.length < 40) return 'Happy to help. When you’re ready to see a place, use **Book a tour** on the listing.';

    if (/(on.?campus|dorm).*(off.?campus|apartment)|(off.?campus|apartment).*(on.?campus|dorm)|should i live|live on or off/.test(t)) {
      const on = M.rank(L, a, { campus: 'on' })[0];
      const off = M.rank(L, a, { campus: 'off' })[0];
      return `**On campus** usually means a housing contract for the academic year, utilities and Wi-Fi included, a meal plan and a short walk to class. **Off campus** often costs less per person when you share, gives you a full kitchen and more space, and usually means a 12-month lease with utilities on top.\n\nFor your answers, the best on-campus pick is ${B(on.l)} (${on.s.total}% match) and the best off-campus pick is ${B(off.l)} (${off.s.total}% match).`;
    }

    if (/compare|\bvs\.?\b|versus|difference between/.test(t)) {
      let pair = named.length >= 2 ? named.slice(0, 2) : named.length === 1 ? [named[0], topL.find((l) => l !== named[0])] : topL.slice(0, 2);
      pair = pair.filter(Boolean);
      if (pair.length < 2) return 'Name two places to compare, for example “Compare Whitlock Hall and Rowan Hall.”';
      const [x, y] = pair;
      const line = (l) => {
        const c = M.commute(l);
        return `- ${B(l)}: ${costTxt(l)}, ${l.layout.summary.toLowerCase()} with ${roommateText(l).toLowerCase()}, ${c.walk} min walk to the Quad, ${Object.keys(l.leases).map((k) => M.LEASE_SHORT[k]).join(' or ')} lease. ${M.score(l, a).total}% match.`;
      };
      const cheaper = M.effective(x) <= M.effective(y) ? x : y;
      const closer = M.commute(x).walk <= M.commute(y).walk ? x : y;
      return `${line(x)}\n${line(y)}\n\n${B(cheaper)} costs less each month${cheaper === closer ? ' and is closer to the Quad.' : `, while ${B(closer)} is closer to the Quad.`}`;
    }

    if (/by.the.bed|individual lease|joint lease/.test(t)) {
      return 'With an **individual lease** (also called by the bed), you sign only for your own bedroom, so you’re not responsible if a roommate stops paying. **Parkline at College Ave** works this way. With a **joint lease**, everyone signs one lease and shares responsibility for the full rent. That’s common for apartments and houses like **The Mill Lofts** and **Union Street Duplex**.';
    }
    if (/guarantor|co-?sign/.test(t)) {
      return 'Many off-campus landlords ask students for a **guarantor**, usually a parent, who agrees to cover the rent if you can’t. University housing on campus doesn’t require one. If you don’t have a guarantor, ask the landlord with **Contact landlord** whether they accept a larger deposit or a guarantor service.';
    }

    if (/deposit|move.?in cost|upfront|fees?\b|application/.test(t)) {
      const ls = named.length ? named : topL.slice(0, 3);
      return 'Here’s what you’d pay when you sign:\n' + bullets(ls, (l) => {
        const other = (l.costs.other || []).reduce((s, o) => s + o.amount, 0);
        return `${money(l.costs.deposit)} ${l.costs.depositLabel.toLowerCase()}, ${l.costs.appFee ? money(l.costs.appFee) + ' application fee' : 'no application fee'}${other ? `, ${money(other)} in other fees` : ''}, plus the first month’s rent`;
      });
    }

    if (/pet|dog|cat\b|cats/.test(t)) {
      if (named.length) return named.map((l) => `${B(l)}: ${l.rules.pets}.`).join('\n');
      const ls = byMatch(pool.filter((l) => l.petsAllowed)).slice(0, 5);
      return ls.length ? 'Pet-friendly places:\n' + bullets(ls, (l) => l.rules.pets) : 'None of these places allow pets.';
    }

    if (/park|\bcar\b|garage|driv/.test(t)) {
      if (named.length) return named.map((l) => `${B(l)}: ${l.parking.note}. It’s about a ${M.commute(l).drive} min drive to the Quad.`).join('\n');
      const free = pool.filter((l) => l.parking.kind === 'free');
      const paid = pool.filter((l) => l.parking.kind !== 'free' && l.parking.kind !== 'none');
      return `Free parking: ${free.map(B).join(', ') || 'none'}.\n\nPaid parking: ${paid.map((l) => `${B(l)} (${M.parkingText(l).replace(/^Parking /, '')})`).join(', ') || 'none'}.`;
    }

    if (/cheap|afford|lowest|least expensive|budget|cost|price|how much|\brent\b|save money/.test(t)) {
      if (named.length) return named.map((l) => `${B(l)} is ${costTxt(l)}, so about ${money(M.effective(l))} a month all in.`).join('\n');
      const ls = pool.slice().sort((x, y) => M.effective(x) - M.effective(y)).slice(0, 3);
      const fit = L.filter((l) => M.effective(l) <= a.budget).length;
      return 'Lowest monthly cost, counting estimated utilities:\n' + bullets(ls, (l) => `about ${money(M.effective(l))}/mo (${costTxt(l)})`) + `\n\n${fit} of ${L.length} places fit a budget of ${money(a.budget)}.`;
    }

    if (/utilit|electric|internet|wi-?fi|\bbills?\b/.test(t)) {
      if (named.length) return named.map((l) => `${B(l)}: ${l.utilities.included ? 'utilities are included' : `utilities run about ${money(l.utilities.estimate)} a month`}. ${l.utilities.note}`).join('\n');
      const inc = pool.filter((l) => l.utilities.included);
      return `Utilities are included at ${inc.map(B).join(', ')}.\n\nEverywhere else, Homeroom adds the landlord’s estimate (usually $40–85 per person) to the rent when it checks your budget.`;
    }

    if (/bus|transit|route/.test(t)) {
      const ls = pool.filter((l) => l.transit).sort((x, y) => x.transit.total - y.transit.total);
      return 'Places on a Temple Transit line:\n' + bullets(ls, (l) => `Route ${l.transit.route} from ${l.transit.stop}, about ${l.transit.total} min door to door`) + '\n\nOn-campus halls don’t need a bus at all.';
    }

    for (const topic of AMEN_TOPICS) {
      if (!topic.re.test(t)) continue;
      if (named.length) return named.map((l) => `${B(l)} ${has(l, topic.k) ? topic.yes : topic.no}.`).join('\n');
      const ls = byMatch(pool.filter((l) => has(l, topic.k))).slice(0, 5);
      return ls.length ? `${topic.list} at:\n` + bullets(ls, costTxt) : `None of these places list ${topic.list.toLowerCase()}.`;
    }

    if (/bathroom/.test(t)) {
      const ls = named.length ? named : pool.filter((l) => has(l, 'privatebath'));
      return named.length ? named.map((l) => `${B(l)}: ${l.layout.bath}.`).join('\n') : 'Places with a private bathroom:\n' + bullets(ls, costTxt);
    }

    if (/close|closest|nearest|walk|distance|\bfar\b|commute|minutes/.test(t)) {
      if (named.length) return named.map((l) => { const c = M.commute(l); return `${B(l)} is a ${c.walk} min walk, ${c.bike} min bike ride or ${c.drive} min drive to the Main Quad${l.transit ? `. Route ${l.transit.route} takes about ${l.transit.total} min` : ''}.`; }).join('\n');
      const ls = pool.slice().sort((x, y) => M.commute(x).walk - M.commute(y).walk).slice(0, 4);
      return 'Closest to the Main Quad:\n' + bullets(ls, (l) => `${M.commute(l).walk} min walk, ${costTxt(l)}`);
    }

    if (/semester|spring|sublet|sublease|short|month.to.month|flexible|summer|12.month|academic year|lease length|how long/.test(t)) {
      const sem = pool.filter((l) => l.leases.semester);
      const flex = pool.filter((l) => l.leases.flex);
      return `One semester: ${sem.map((l) => `${B(l)} (${l.leases.semester})`).join(', ') || 'none'}.\n\nMonth-to-month: ${flex.map((l) => `${B(l)} (${l.leases.flex})`).join(', ') || 'none'}.\n\nMost off-campus places use 12-month leases that start August 1.`;
    }

    if (/roommate|alone|single|studio|own place|privacy|by myself/.test(t)) {
      const solo = pool.filter((l) => l.roommates === 0);
      return 'Places without roommates:\n' + bullets(solo, (l) => `${l.layout.summary.toLowerCase()}, ${costTxt(l)}`);
    }

    if (/quiet|noise|noisy|loud|part(y|ies)/.test(t)) {
      if (named.length) return named.map((l) => `${B(l)}: ${l.rules.quiet}.`).join('\n');
      const calm = byMatch(pool.filter((l) => /quiet|peaceful/i.test(l.description + ' ' + l.review.text + ' ' + l.highlights.join(' ')))).slice(0, 4);
      return 'Places students describe as quiet:\n' + bullets(calm, (l) => `${l.rules.quiet}, ${costTxt(l)}`);
    }

    if (/tour|visit|see (it|the place)|viewing|contact|landlord|message|call|email|phone number/.test(t)) {
      if (named.length) return named.map((l) => `${B(l)} is managed by ${l.landlord.name} (${l.landlord.company}), who ${lowerFirst(l.landlord.response)}. Phone ${l.landlord.phone}, email ${l.landlord.email}. Use **Book a tour** on the listing to pick a time.`).join('\n\n');
      return 'Every listing has **Contact landlord** and **Book a tour** buttons. Tours take about 30 minutes, and you can choose in person or a video call.';
    }

    if (/best|recommend|which (one|place)|top pick|suggest|should i (choose|pick)/.test(t) || (!named.length && /\bmatch/.test(t))) {
      return 'Your top matches:\n' + currentTop().slice(0, 3).map((x) => `- ${B(x.l)}: ${x.s.total}% match. ${x.s.pros[0] ? x.s.pros[0].text + '.' : ''}`).join('\n');
    }

    if (named.length) {
      const l = named[0];
      const s = M.score(l, a);
      const c = M.commute(l);
      return `${B(l)} is ${l.campus === 'on' ? 'on campus' : 'off campus'} in ${l.hood}: ${l.layout.summary.toLowerCase()} for ${costTxt(l)}, a ${c.walk} min walk to the Quad. ${l.description}\n\nIt’s a ${s.total}% match for you.${s.cons[0] ? ` The main trade-off: ${lowerFirst(s.cons[0].text)}.` : ''}`;
    }

    return 'I can’t answer that one in basic mode. Try asking about prices, commute times, pets, parking, laundry, lease lengths or a specific place, like “Tell me about Calder Suites.”';
  }

  // ---------- views & routing ----------
  const VIEWS = ['quiz', 'results', 'browse', 'saved'];
  function show(view, force) {
    if (view === state.view && !force) return;
    const first = state.view === null;
    state.view = view;
    document.body.dataset.view = view;
    VIEWS.forEach((v) => { $('#view-' + v).hidden = v !== view; });
    $$('[data-nav-item]').forEach((b) => { if (b.dataset.view === view) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    $('#navResults').hidden = !state.quizDone;
    if (view === 'quiz') { showStep(state.step); updateLive(); }
    if (view === 'results') renderResults();
    if (view === 'browse') renderBrowse();
    if (view === 'saved') renderSaved();
    placeChat();
    if (!first) window.scrollTo(0, 0);
  }
  function route() {
    const h = (location.hash || '').replace(/^#/, '');
    show(VIEWS.includes(h) ? h : 'quiz');
  }
  function go(view) {
    try {
      if (location.hash.replace(/^#/, '') !== view) location.hash = view;
    } catch (e) { /* hash not writable here */ }
    show(view);
  }

  function openMenu() {
    document.body.classList.add('nav-open');
    const t = $('#menuToggle');
    if (t) { t.setAttribute('aria-expanded', 'true'); t.setAttribute('aria-label', 'Close menu'); }
  }
  function closeMenu() {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    const t = $('#menuToggle');
    if (t) { t.setAttribute('aria-expanded', 'false'); t.setAttribute('aria-label', 'Open menu'); }
  }
  function toggleMenu() {
    if (document.body.classList.contains('nav-open')) closeMenu(); else openMenu();
  }

  function onClick(e) {
    if (e.target instanceof HTMLDialogElement && e.target.open) {
      const r = e.target.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        e.target.close();
        return;
      }
    }
    const t = e.target.closest('[data-action]');
    if (!t || t.disabled) return;
    const id = t.dataset.id;
    switch (t.dataset.action) {
      case 'nav': go(t.dataset.view); closeMenu(); break;
      case 'menu-toggle': toggleMenu(); break;
      case 'menu-close': closeMenu(); break;
      case 'auth-open': closeMenu(); openAuth(t.dataset.mode || 'signin'); break;
      case 'signout': signOut(); break;
      case 'save': toggleSave(id); break;
      case 'retake': state.step = 0; go('quiz'); showStep(0); break;
      case 'expand': toggleExpand(id); break;
      case 'collapse': toggleExpand(id, true); break;
      case 'open': closeHostDialog(t, false); openListingSmart(id); break;
      case 'contact': closeHostDialog(t, true); openContact(id); break;
      case 'tour': closeHostDialog(t, true); openTour(id); break;
      case 'tours': closeHostDialog(t, true); closeMenu(); openTours(); break;
      case 'cancel-tour': cancelTour(t); break;
      case 'close': { const d = t.closest('dialog'); if (d) d.close(); break; }
      case 'photo': setPhoto(t); break;
      case 'photo-step': setPhoto(t, Number(t.dataset.dir)); break;
      case 'copy': copyText(t); break;
      case 'ask': sendChat(t.dataset.q); break;
      case 'chat-open': openChat(); break;
      case 'chat-close': closeChat(); break;
      case 'results-campus': state.resultsCampus = t.dataset.val; renderResults(); break;
      case 'browse-campus': state.browse.campus = t.dataset.val; renderBrowse(); break;
      case 'browse-mode': state.browse.mode = t.dataset.val; renderBrowse(); break;
      case 'reset-filters': state.browse = Object.assign(state.browse, { campus: 'all', price: 'any', rooms: 'any' }); renderBrowse(); break;
      default: break;
    }
  }

  function snapshot() {
    return { view: state.view, step: state.step, answers: state.answers, touched: Array.from(state.touched), turns: chat.turns };
  }

  function start(data) {
    if (start.done) return;
    start.done = true;
    data = data || {};
    if (data.answers) state.answers = Object.assign({}, BLANK, data.answers);
    if (Array.isArray(data.touched)) state.touched = new Set(data.touched);
    if (typeof data.step === 'number') state.step = Math.max(0, Math.min(STEPS.length - 1, data.step));

    document.body.insertAdjacentHTML('afterbegin', `<svg class="sr-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><g id="hr-map">${ART.mapGroup(D.map)}</g></defs></svg>`);
    $$('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));

    buildQuiz();
    bindQuiz();
    buildLive();
    renderMoreMap();
    bindBrowse();
    buildChat();
    updateToursNav();
    updateSavedNav();
    renderAccount();
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      if (document.body.classList.contains('nav-open')) { closeMenu(); return; }
      if ($('#chat').classList.contains('is-open')) closeChat();
    });
    if (dockQuery) {
      if (dockQuery.addEventListener) dockQuery.addEventListener('change', placeChat);
      else if (dockQuery.addListener) dockQuery.addListener(placeChat);
    }
    window.addEventListener('hashchange', route);

    if (Array.isArray(data.turns) && data.turns.length) {
      data.turns.forEach((tn) => {
        if (tn.role === 'user') addMsg('user', esc(tn.content));
        else finishBot(addMsg('bot', ''), tn.content);
      });
      chat.turns = data.turns.slice();
      renderSuggestions();
    }

    const h = (location.hash || '').replace(/^#/, '');
    show(VIEWS.includes(h) ? h : data.view && VIEWS.includes(data.view) ? data.view : 'quiz');
  }

  const hot = window.claude && window.claude.hot;
  try { if (hot && typeof hot.snapshot === 'function') hot.snapshot(snapshot); } catch (e) { /* hot reload unavailable */ }
  if (hot && typeof hot.ready === 'function') hot.ready(start);
  else start((hot && hot.data) || {});
})();
