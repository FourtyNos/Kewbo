(() => {
  'use strict';

  // === Defaults ===
  const DEFAULTS = {
    name1: 'frontdoor',
    url1: 'https://yourlink/api/webhook/yourwebhookid',
    name2: 'backyard',
    url2: 'https://yourlink/api/webhook/yourwebhookid',
  };
  const KEY = 'wb-settings-v1';
  const BG_KEY = 'wb-bg-dataurl';       // speichert Data-URL des Hintergrunds
  const MAX_BG_BYTES = 4 * 1024 * 1024; // 4 MB Limit, damit localStorage nicht platzt

  // === Helpers / DOM ===
  const $ = (s, r=document) => r.querySelector(s);
  const els = {
    btn1: $('#btn1'),
    btn2: $('#btn2'),
    out:  $('#out'),

    settingsBtn:   $('#settingsBtn'),
    modal:         $('#settingsModal'),
    modalClose:    $('#settingsModal .modal__close'),
    name1:         $('#name1'),
    url1:          $('#url1'),
    name2:         $('#name2'),
    url2:          $('#url2'),
    save:          $('#saveSettings'),
    reset:         $('#resetDefaults'),

    // NEW: Background
    bgFile:        $('#bgFile'),
    bgChoose:      $('#bgChoose'),
    bgRemove:      $('#bgRemove'),
  };

  function loadSettings() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch { return { ...DEFAULTS }; }
  }
  function saveSettings(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

  function applySettings(s) {
    if (els.btn1) { els.btn1.textContent = s.name1; els.btn1.dataset.webhook = s.url1; }
    if (els.btn2) { els.btn2.textContent = s.name2; els.btn2.dataset.webhook = s.url2; }
  }

  function updateUrlPlaceholders(s) {
    if (els.url1) { els.url1.value = ''; els.url1.placeholder = s.url1 ? '•••••••• (gespeichert)' : 'Webhook-Link'; }
    if (els.url2) { els.url2.value = ''; els.url2.placeholder = s.url2 ? '•••••••• (gespeichert)' : 'Webhook-Link'; }
  }

  // === Hintergrund anwenden/lesen ===
  function applyBackgroundFromStorage() {
    const dataUrl = localStorage.getItem(BG_KEY);
    if (dataUrl) {
      document.body.style.setProperty('--bg-image', `url("${dataUrl}")`);
    } else {
      // zurück auf Default (CSS-Fallback greift)
      document.body.style.removeProperty('--bg-image');
    }
  }

  async function fileToDataURL(file) {
    // kleine Validierung
    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Bitte ein Bild wählen (GIF/PNG/JPG).');
    }
    if (file.size > MAX_BG_BYTES) {
      throw new Error(`Bild ist zu groß (${Math.round(file.size/1024/1024)} MB). Max. ${Math.round(MAX_BG_BYTES/1024/1024)} MB.`);
    }
    // lesen
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error('Konnte die Datei nicht lesen.'));
      r.readAsDataURL(file);
    });
  }

  // === Modal Open/Close + Focus-Handling ===
  let lastFocus = null;

  function trapFocus(root) {
    if (!root) return;
    const sel = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const f = Array.from(root.querySelectorAll(sel)).filter(el => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];

    function onKey(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    root.addEventListener('keydown', onKey);
    root._trapKeyHandler = onKey;
  }

  function openModal() {
    const s = loadSettings();
    if (els.name1) els.name1.value = s.name1;
    if (els.name2) els.name2.value = s.name2;
    updateUrlPlaceholders(s);

    if (els.modal) {
      els.modal.hidden = false;
      document.body.classList.add('modal-open');   // blendet Inhalt/Zahnrad aus
      lastFocus = document.activeElement;
      if (els.name1) els.name1.focus();
      document.addEventListener('keydown', onEsc);
      els.modal.addEventListener('click', onBackdrop);
      trapFocus(els.modal);
    }
  }

  function closeModal() {
    if (els.modal) {
      els.modal.hidden = true;
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onEsc);
      els.modal.removeEventListener('click', onBackdrop);
      if (els.modal._trapKeyHandler) {
        els.modal.removeEventListener('keydown', els.modal._trapKeyHandler);
        delete els.modal._trapKeyHandler;
      }
    }
    if (lastFocus) lastFocus.focus();
  }

  function onEsc(e){ if (e.key === 'Escape') closeModal(); }
  function onBackdrop(e){ if (e.target && e.target.hasAttribute('data-close')) closeModal(); }

  // === Speichern nur bei echter Eingabe (Passwortfelder bleiben leer/maskiert) ===
  const looksMasked = (v) => v === '' || /^[\s\*•]+$/.test(v);

  function onSave() {
    const prev = loadSettings();
    const v1 = els.url1 ? (els.url1.value || '').trim() : '';
    const v2 = els.url2 ? (els.url2.value || '').trim() : '';

    const s = {
      name1: els.name1 && els.name1.value.trim() ? els.name1.value.trim() : prev.name1,
      url1:  looksMasked(v1) ? prev.url1 : v1,
      name2: els.name2 && els.name2.value.trim() ? els.name2.value.trim() : prev.name2,
      url2:  looksMasked(v2) ? prev.url2 : v2,
    };

    saveSettings(s);
    applySettings(s);
    closeModal();
  }

  function onReset() {
    saveSettings(DEFAULTS);
    applySettings(DEFAULTS);
    if (els.name1) els.name1.value = DEFAULTS.name1;
    if (els.name2) els.name2.value = DEFAULTS.name2;
    updateUrlPlaceholders(DEFAULTS);

    // Hintergrund zurücksetzen
    localStorage.removeItem(BG_KEY);
    applyBackgroundFromStorage();
  }

  // === Hintergrund: Events ===
  if (els.bgChoose && els.bgFile) {
    els.bgChoose.addEventListener('click', () => els.bgFile.click());
    els.bgFile.addEventListener('change', async () => {
      const file = els.bgFile.files && els.bgFile.files[0];
      if (!file) return;
      try {
        const dataUrl = await fileToDataURL(file);
        localStorage.setItem(BG_KEY, dataUrl);
        applyBackgroundFromStorage();
        if (els.out) els.out.textContent = 'Hintergrund gespeichert.';
      } catch (err) {
        if (els.out) els.out.textContent = (err && err.message) ? err.message : 'Fehler beim Speichern des Hintergrunds.';
      } finally {
        els.bgFile.value = ''; // Auswahl zurücksetzen
      }
    });
  }
  if (els.bgRemove) {
    els.bgRemove.addEventListener('click', () => {
      localStorage.removeItem(BG_KEY);
      applyBackgroundFromStorage();
      if (els.out) els.out.textContent = 'Hintergrund zurückgesetzt.';
    });
  }

  // === Webhook senden ===
  async function send(url, label){
    if (els.out) els.out.textContent = `Sende: ${label} …`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      if (els.out) els.out.textContent = `${label}: HTTP ${res.status} ${res.ok ? 'OK' : 'Fehler'}`;
    } catch (e) {
      if (els.out) els.out.textContent = `${label}: Netzwerkfehler – ${e.message}`;
    }
  }

  // === Event-Bindings ===
  if (els.btn1) els.btn1.addEventListener('click', () => send(els.btn1.dataset.webhook, els.btn1.textContent));
  if (els.btn2) els.btn2.addEventListener('click', () => send(els.btn2.dataset.webhook, els.btn2.textContent));

  if (els.settingsBtn) els.settingsBtn.addEventListener('click', openModal);
  if (els.modalClose) els.modalClose.addEventListener('click', closeModal);
  if (els.modal) els.modal.addEventListener('click', onBackdrop);
  if (els.save) els.save.addEventListener('click', onSave);
  if (els.reset) els.reset.addEventListener('click', onReset);

  // === Init ===
  applySettings(loadSettings());
  applyBackgroundFromStorage();
})();
