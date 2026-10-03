// ==========================================================================
// HIPOTECA COMPARTIDA - MOTOR DE CÁLCULO, GESTIÓN Y SINCRONIZACIÓN EN NUBE
// ==========================================================================

const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getDefaultZeroSettings() {
  return {
    initialCapital: 0,
    totalTermYears: 25,
    annualInterestRate: 2.50,
    coOwner1Name: "1º Propietario",
    coOwner2Name: "2º Propietario",
    coOwner1Percentage: 50.00,
    coOwner2Percentage: 50.00,
    internalDebtOwner1: 0,
    internalDebtOwner2: 0
  };
}

let settings = getDefaultZeroSettings();
const INITIAL_REVISIONS_DEFAULT = [];
const INITIAL_PAYMENTS_DEFAULT = [];
let revisions = [];
let payments = [];
// ==========================================================================
// SAFE DOM HELPERS (CRITICAL: Prevents ReferenceError & Null Dereferences)
// ==========================================================================
function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text !== undefined && text !== null ? String(text) : '';
}

function safeSetVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val !== undefined && val !== null ? String(val) : '';
}


let toastTimeout = null;
function showToast(msg) {
  try {
    const banner = document.getElementById('toast-banner');
    const textEl = document.getElementById('toast-text');
    if (textEl) textEl.textContent = msg;
    if (banner) {
      banner.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        banner.classList.remove('show');
      }, 3000);
    }
  } catch (e) {
    console.log('Toast:', msg);
  }
}

function safeGetVal(id) {
  const el = document.getElementById(id);
  return el ? (el.value || '').trim() : '';
}

// Global click handler to dismiss modals on backdrop click
window.addEventListener('click', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop')) {
    if (e.target.id === 'payment-modal') closeModal();
    else if (e.target.id === 'sync-modal') closeSyncModal();
    else if (e.target.id === 'revision-modal') closeRevisionModal();
    else if (e.target.id === 'agreement-modal') closeAgreementModal();
  }
});


/* ==========================================================
   SECURE MULTI-DEVICE CLOUD REALTIME SYNCHRONIZATION
   ========================================================== */
const MASTER_REGISTRY_ID = 'ff808181a09d98f701a100b1b6ea69d1';
const CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
const BUILTIN_USERS = {
  'ferjrm@hotmail.com': 'ff808181a09d98f701a100d8c5f16a0c',
  'fejrm@hotmail.com': 'ff808181a09d98f701a1015eb1a76ac5'
};
let currentObjectId = '';
let currentEmail = '';
let currentBinId = '';
let currentPasswordHash = '';
let localLastSyncTime = 0;
let realtimePollInterval = null;
let isSyncingIncoming = false;

// Universal Cloud Fetch: Uses native Android OkHttp Bridge if inside Android APK, or window.fetch in Browser/Web
async function cloudFetch(url, options = {}) {
  if (window.AndroidBridge && typeof window.AndroidBridge.httpRequest === 'function') {
    try {
      const method = options.method || 'GET';
      const headersJson = options.headers ? JSON.stringify(options.headers) : '{}';
      const bodyStr = options.body || '';

      const respRaw = window.AndroidBridge.httpRequest(url, method, headersJson, bodyStr);
      if (respRaw) {
        const parsed = JSON.parse(respRaw);
        if (parsed && typeof parsed.status === 'number' && parsed.status > 0) {
          return {
            ok: parsed.status >= 200 && parsed.status < 300,
            status: parsed.status,
            statusText: parsed.statusText || '',
            json: async () => {
              try { return JSON.parse(parsed.body); }
              catch(e) { return {}; }
            },
            text: async () => parsed.body || ''
          };
        }
      }
    } catch (err) {
      console.warn("AndroidBridge request error:", err);
    }
  }

  return fetch(url, options);
}

function normalizeUserEmail(rawEmail) {
  if (!rawEmail) return '';
  return String(rawEmail).trim().toLowerCase();
}

function hashPassword(pwd) {
  if (!pwd) return '';
  const ascii = String(pwd).trim();
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const words = [];
  const utf8 = unescape(encodeURIComponent(ascii));
  const asciiBitLength = utf8.length * 8;

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let i, j;
  for (i = 0; i < utf8.length; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((3 - i % 4) * 8);
  }
  words[i >> 2] |= 0x80 << ((3 - i % 4) * 8);
  words[(((utf8.length + 8) >> 6) + 1) * 16 - 1] = asciiBitLength;

  const w = new Array(64);
  for (i = 0; i < words.length; i += 16) {
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3],
        e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  let result = '';
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byte = (hash[i] >>> (j * 8)) & 0xff;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

function getStoredAuth() {
  try {
    const rawEmail = localStorage.getItem('mortgage_auth_email');
    if (!rawEmail) {
      return { email: '', hash: '', objectId: '' };
    }
    const email = normalizeUserEmail(rawEmail);
    const hash = localStorage.getItem('mortgage_auth_hash') || '';
    const objectId = localStorage.getItem('mortgage_auth_cloud_id') || '';
    return { email, hash, objectId };
  } catch (e) {
    return { email: '', hash: '', objectId: '' };
  }
}

function saveStoredAuth(email, hash, objectId) {
  try {
    const norm = normalizeUserEmail(email);
    if (norm) {
      localStorage.setItem('mortgage_auth_email', norm);
      localStorage.setItem('mortgage_auth_hash', hash || '');
      localStorage.setItem('mortgage_auth_cloud_id', objectId || '');
    } else {
      localStorage.removeItem('mortgage_auth_email');
      localStorage.removeItem('mortgage_auth_hash');
      localStorage.removeItem('mortgage_auth_cloud_id');
      localStorage.removeItem('mortgage_auth_bin');
    }
  } catch (e) {}
}

async function resolveUserCloudId(rawEmail, pwdHash = '') {
  const norm = normalizeUserEmail(rawEmail);
  if (!norm) return '';

  // 1. Check BUILTIN_USERS first for zero-latency deterministic resolution
  if (BUILTIN_USERS[norm]) {
    const builtinId = BUILTIN_USERS[norm];
    try { localStorage.setItem('cached_cloud_id_' + norm, builtinId); } catch(e) {}
    return builtinId;
  }

  // 2. Check local cache
  try {
    const cachedId = localStorage.getItem('cached_cloud_id_' + norm);
    if (cachedId) {
      return cachedId;
    }
  } catch (e) {}

  // 3. Fetch from Master Registry with retries
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const regRes = await cloudFetch(CLOUD_API_BASE + '/' + MASTER_REGISTRY_ID + '?t=' + Date.now());
      if (regRes && regRes.ok) {
        const regObj = await regRes.json();
        const regData = (regObj && regObj.data) || {};
        if (!regData.users) regData.users = {};

        if (regData.users[norm]) {
          const userObjId = regData.users[norm];
          try { localStorage.setItem('cached_cloud_id_' + norm, userObjId); } catch(e) {}
          return userObjId;
        }

        // Create new cloud storage object for user
        const createRes = await cloudFetch(CLOUD_API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'hipoteca_user_' + norm,
            data: {
              account: norm,
              passwordHash: pwdHash,
              updatedAt: Date.now(),
              lastUpdatedText: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
              settings: getDefaultZeroSettings(),
              revisions: [],
              payments: []
            }
          })
        });

        if (createRes && createRes.ok) {
          const createObj = await createRes.json();
          const newId = createObj.id;
          regData.users[norm] = newId;
          regData.updatedAt = Date.now();

          await cloudFetch(CLOUD_API_BASE + '/' + MASTER_REGISTRY_ID, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'hipoteca_sync_registry_master',
              data: regData
            })
          }).catch(() => {});

          try { localStorage.setItem('cached_cloud_id_' + norm, newId); } catch(e) {}
          return newId;
        }
      }
    } catch (err) {
      console.warn(`Registry resolution attempt ${attempt + 1} failed:`, err);
      if (attempt < 2) await new Promise(r => setTimeout(r, 600));
    }
  }

  // 4. Fallback to cached id if registry was unreachable
  try {
    const fallbackId = localStorage.getItem('cached_cloud_id_' + norm);
    if (fallbackId) return fallbackId;
  } catch (e) {}

  return '';
}
let firestoreUnsubscribe = null;

function sanitizeSyncKey(val) {
  const norm = normalizeUserEmail(val || currentEmail);
  if (!norm) return 'anonymous';
  return norm.replace(/[/\#$.[]]/g, '_');
}

function initFirebaseSync() {
  if (!window.firebaseSync || !window.firebaseSync.db || !currentEmail) return;

  const { db, doc, onSnapshot } = window.firebaseSync;
  const userDocId = sanitizeSyncKey(currentEmail);

  if (firestoreUnsubscribe) {
    try { firestoreUnsubscribe(); } catch(e) {}
    firestoreUnsubscribe = null;
  }

  try {
    const docRef = doc(db, 'mortgages', userDocId);
    firestoreUnsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && (Array.isArray(data.payments) || Array.isArray(data.revisions) || data.settings)) {
          if (data.updatedAt && data.updatedAt > localLastSyncTime) {
            applyCloudData(data);
            updateSyncUI('● En Tiempo Real', '#10b981');
          }
        }
      }
    }, (error) => {
      console.warn("Firestore snapshot notice:", error);
    });
  } catch (err) {
    console.warn("Firebase sync notice:", err);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const auth = getStoredAuth();
  currentEmail = auth.email;
  currentPasswordHash = auth.hash;
  currentObjectId = auth.objectId;

  if (currentEmail) {
    loadStateFromStorage();
    updateDashboardUI();
    renderHistoryTable();
    renderRevisionsTable();
    updateSyncUI('● En Tiempo Real', '#10b981');

    await initCloudSync();
    initFirebaseSync();
    startRealtimePoller();
  } else {
    // 100% clean zero state for guest/no-session
    settings = getDefaultZeroSettings();
    revisions = [];
    payments = [];
    recomputeBalances();
    updateDashboardUI();
    renderHistoryTable();
    renderRevisionsTable();
    updateSyncUI('Desconectado', '#94a3b8');
  }
});

window.addEventListener('firebase-sync-ready', () => {
  if (currentEmail) initFirebaseSync();
});

function loadStateFromStorage() {
  try {
    const key = currentEmail ? ('hipoteca_user_' + currentEmail) : 'hipoteca_local_data';
    const val = localStorage.getItem(key);
    if (val) {
      const parsed = JSON.parse(val);
      if (parsed) {
        if (parsed.settings) settings = { ...getDefaultZeroSettings(), ...parsed.settings };
        if (Array.isArray(parsed.revisions)) revisions = parsed.revisions;
        if (Array.isArray(parsed.payments)) payments = parsed.payments;
      }
    } else {
      settings = getDefaultZeroSettings();
      revisions = [];
      payments = [];
    }
  } catch (err) {
    settings = getDefaultZeroSettings();
    revisions = [];
    payments = [];
  }
  recomputeBalances();
}

function saveStateToStorage() {
  const now = Date.now();
  localLastSyncTime = now;
  try {
    const dataToSave = {
      account: currentEmail || 'local',
      settings,
      revisions,
      payments,
      updatedAt: now
    };
    if (currentEmail) {
      const userKey = 'hipoteca_user_' + currentEmail;
      localStorage.setItem(userKey, JSON.stringify(dataToSave));
    } else {
      localStorage.setItem('hipoteca_local_data', JSON.stringify(dataToSave));
    }
    localStorage.setItem('hipoteca_last_updated_time', String(now));
  } catch (err) {
    console.warn('Storage save notice:', err);
  }
  if (currentEmail) {
    scheduleCloudSync();
  }
}

function recomputeBalances() {
  payments.sort((a, b) => (a.year - b.year) || (a.month - b.month));

  let bal = Number(settings.initialCapital) || 0;
  let capOwner2 = (settings.internalDebtOwner2 && Number(settings.internalDebtOwner2) > 0)
    ? Number(settings.internalDebtOwner2)
    : (bal * ((Number(settings.coOwner1Percentage) || 50) / 100));

  let accBal = 0;
  let totOwner2Discount = 0;

  payments.forEach(p => {
    const rev = getActiveRevisionForDate(p.year, p.month);
    const fee = Number(p.totalFee) || (rev ? rev.feeTotal : 645.54);
    const co1 = Number(p.co1) || (rev ? rev.lauraFee : (fee * (rev ? (rev.pctOwner2 / 100) : 0.4394)));
    const lauraPct = (fee > 0 && co1 > 0) ? (co1 / fee) : (rev ? (rev.pctOwner2 / 100) : 0.4394);

    const prin = Number(p.principal) || (rev ? rev.prinTotal : Math.max(0, fee - (Number(p.interest) || (rev ? rev.intTotal : 0))));
    const ext = Number(p.extra) || 0;
    const lDiscount = Number(p.lauraExtraAmort) || 0;
    const totalExtraAmort = Math.max(ext, lDiscount);

    // Owner2's regular principal amortization in receipt
    const lauraPrin = (rev && rev.lauraPrin && !p.principal) ? rev.lauraPrin : (prin * lauraPct);

    totOwner2Discount += lDiscount;
    p.accOwner2Discount = totOwner2Discount;

    // Owner2's capital reduces month-by-month
    capOwner2 = Math.max(0, capOwner2 - (lauraPrin + lDiscount));
    p.lauraRemaining = capOwner2;

    // Total bank loan capital reduces
    bal = Math.max(0, bal - (prin + totalExtraAmort));
    p.remaining = bal;

    // Owner1's capital
    p.rakRemaining = Math.max(0, bal - capOwner2);

    const com = Number(p.community) || 0;
    const luz = Number(p.electricity) || 0;
    const derr = Number(p.derramas) || 0;
    const ins = Number(p.insurance) || 0;
    const ibi = Number(p.ibi) || 0;
    const other = Number(p.otherExtra) || 0;

    // Owner2's operational monthly expenses
    const expense = co1 + com + luz + derr + ins + ibi + other;
    p.totalExpenses = expense;
    p.monthGap = ((Number(p.deposit) || 0) - expense);
    accBal += p.monthGap;
    p.accBalance = accBal;
  });
}

function fmt(val) {
  return (Number(val) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function getActiveRevisionForDate(year, month) {
  if (!revisions || revisions.length === 0) return null;
  const sorted = [...revisions].sort((a, b) => (a.startYear - b.startYear) || (a.startMonth - b.startMonth));
  let matched = sorted[0];
  for (const rev of sorted) {
    if (rev.startYear < year || (rev.startYear === year && rev.startMonth <= month)) {
      matched = rev;
    }
  }
  return matched;
}

function updateDashboardUI() {
  const hasPayments = payments && payments.length > 0;
  const latest = hasPayments ? payments[payments.length - 1] : null;

  const emptyBanner = document.getElementById('empty-state-banner');
  if (emptyBanner) {
    emptyBanner.style.display = hasPayments ? 'none' : 'block';
  }

  const initialTotalCap = Number(settings.initialCapital) || 0;
  const initialOwner2Cap = (settings.internalDebtOwner2 && Number(settings.internalDebtOwner2) > 0)
    ? Number(settings.internalDebtOwner2)
    : 0;
  const initialOwner1Cap = Math.max(0, initialTotalCap - initialOwner2Cap);

  const remaining = latest ? latest.remaining : initialTotalCap;
  const currentOwner2Cap = latest ? latest.lauraRemaining : initialOwner2Cap;
  const currentOwner1Cap = latest ? latest.rakRemaining : initialOwner1Cap;

  const amortizedTotal = Math.max(0, initialTotalCap - remaining);
  const amortizedOwner2 = Math.max(0, initialOwner2Cap - currentOwner2Cap);
  const amortizedOwner1 = Math.max(0, initialOwner1Cap - currentOwner1Cap);

  const pct = initialTotalCap > 0 ? (amortizedTotal / initialTotalCap) * 100 : 0;

  const fee = latest ? latest.totalFee : (revisions[0] ? revisions[0].feeTotal : 0);
  const pctOwner2 = remaining > 0 ? (currentOwner2Cap / remaining) * 100 : (settings.coOwner1Percentage || 32.27);
  const pctOwner1 = remaining > 0 ? (currentOwner1Cap / remaining) * 100 : (100 - pctOwner2);
  const lauraFee = latest ? latest.co1 : (fee * (pctOwner2 / 100));
  const rakFee = latest ? latest.co2 : (fee - lauraFee);

  if (document.getElementById('kpi-remaining')) document.getElementById('kpi-remaining').textContent = fmt(remaining);
  if (document.getElementById('kpi-progress-bar')) document.getElementById('kpi-progress-bar').style.width = Math.min(100, pct) + '%';

  if (document.getElementById('kpi-total-fee')) document.getElementById('kpi-total-fee').textContent = fmt(fee);
  if (document.getElementById('kpi-fee-laura')) document.getElementById('kpi-fee-laura').textContent = fmt(lauraFee);
  if (document.getElementById('kpi-fee-rak')) document.getElementById('kpi-fee-rak').textContent = fmt(rakFee);

  // Owner2 Desfase KPIs
  const accBal = latest ? latest.accBalance : 0;
  const mGap = latest ? (latest.monthGap || 0) : 0;
  const accElem = document.getElementById('kpi-acc-balance');
  if (accElem) {
    accElem.textContent = (accBal >= 0 ? '+' : '') + fmt(accBal);
    accElem.style.color = !hasPayments ? 'var(--text-muted)' : (accBal >= 0 ? 'var(--primary)' : 'var(--red)');
  }

  const mGapElem = document.getElementById('kpi-month-gap');
  if (mGapElem) {
    mGapElem.textContent = hasPayments ? ((mGap >= 0 ? '+' : '') + fmt(mGap)) : "0,00 €";
    mGapElem.style.color = !hasPayments ? 'var(--text-muted)' : (mGap >= 0 ? 'var(--primary)' : 'var(--red)');
  }

  const statusElem = document.getElementById('kpi-balance-status');
  if (statusElem) {
    if (!hasPayments) {
      statusElem.textContent = "Sin meses registrados";
      statusElem.style.color = "var(--text-muted)";
    } else {
      statusElem.textContent = accBal >= 0 
        ? "Saldo a favor (2º Propietario) (+)" 
        : "Saldo pendiente de regularizar (-)";
      statusElem.style.color = accBal >= 0 ? 'var(--primary)' : 'var(--red)';
    }
  }

  if (document.getElementById('kpi-laura-total-expenses')) {
    document.getElementById('kpi-laura-total-expenses').textContent = hasPayments ? fmt(latest.totalExpenses) : "0,00 €";
    document.getElementById('kpi-laura-deposit').textContent = hasPayments ? fmt(latest.deposit) : "0,00 €";
    document.getElementById('kpi-exp-hip').textContent = hasPayments ? fmt(lauraFee) : "0,00 €";
    document.getElementById('kpi-exp-com').textContent = hasPayments ? fmt(latest.community) : "0,00 €";
    document.getElementById('kpi-exp-luz').textContent = hasPayments ? fmt(latest.electricity) : "0,00 €";
  }

  if (document.getElementById('kpi-laura-remaining')) {
    document.getElementById('kpi-laura-remaining').textContent = fmt(currentOwner2Cap);
  }

  // Capital Pendiente Card: 3 Primary Metrics + Amortization
  if (document.getElementById('card-total-capital')) document.getElementById('card-total-capital').textContent = fmt(remaining);
  if (document.getElementById('val-debt-laura')) document.getElementById('val-debt-laura').textContent = fmt(currentOwner2Cap);
  if (document.getElementById('val-debt-rak')) document.getElementById('val-debt-rak').textContent = fmt(currentOwner1Cap);

  if (document.getElementById('card-amort-laura')) document.getElementById('card-amort-laura').textContent = fmt(amortizedOwner2);
  if (document.getElementById('card-amort-rak')) document.getElementById('card-amort-rak').textContent = fmt(amortizedOwner1);
  if (document.getElementById('card-amort-total')) document.getElementById('card-amort-total').textContent = fmt(amortizedTotal);

  if (document.getElementById('laura-pct-label')) {
    document.getElementById('laura-pct-label').textContent = pctOwner2.toFixed(2).replace('.', ',') + '%';
    document.getElementById('rak-pct-label').textContent = pctOwner1.toFixed(2).replace('.', ',') + '%';
    document.getElementById('laura-share-fee-label').textContent = fmt(lauraFee);
    document.getElementById('rak-share-fee-label').textContent = fmt(rakFee);
    document.getElementById('split-track-laura').style.width = pctOwner2 + '%';
    document.getElementById('split-track-rak').style.width = pctOwner1 + '%';
  }

  // Dynamic Revision card on Dashboard
  const revEmptyEl = document.getElementById('dashboard-rev-empty');
  const revCardEl = document.getElementById('dashboard-rev-card');
  const revBadgeEl = document.getElementById('dashboard-rev-badge');
  const revCountBadgeEl = document.getElementById('dashboard-rev-count-badge');

  if (revCountBadgeEl) revCountBadgeEl.textContent = String(revisions.length);

  if (!revisions || revisions.length === 0) {
    if (revEmptyEl) revEmptyEl.style.display = 'block';
    if (revCardEl) revCardEl.style.display = 'none';
    if (revBadgeEl) revBadgeEl.style.display = 'none';
  } else {
    if (revEmptyEl) revEmptyEl.style.display = 'none';
    if (revCardEl) revCardEl.style.display = 'block';
    if (revBadgeEl) revBadgeEl.style.display = 'inline-block';

    const latestRev = revisions[revisions.length - 1];
    const sMonth = MONTH_LABELS[((Number(latestRev.startMonth) || 1) - 1) % 12] || '';
    const sYear = latestRev.startYear || '';

    if (document.getElementById('dashboard-rev-period')) {
      document.getElementById('dashboard-rev-period').textContent = 'Revisión #' + revisions.length + ' (' + sMonth + ' ' + sYear + ' - ' + (latestRev.name || 'Vigente') + ')';
    }
    if (document.getElementById('dashboard-rev-note')) {
      document.getElementById('dashboard-rev-note').textContent = latestRev.note || latestRev.name || 'Periodo vigente de liquidación bancaria';
    }
    if (document.getElementById('dashboard-rev-rate')) {
      document.getElementById('dashboard-rev-rate').textContent = (Number(latestRev.annualRate) || Number(settings.annualInterestRate) || 0).toFixed(2).replace('.', ',') + '%';
    }
    if (document.getElementById('dashboard-rev-fee-total')) {
      document.getElementById('dashboard-rev-fee-total').textContent = fmt(latestRev.feeTotal);
    }
    if (document.getElementById('dashboard-rev-cap-total')) {
      document.getElementById('dashboard-rev-cap-total').textContent = fmt(latestRev.capTotal);
    }
    if (document.getElementById('dashboard-rev-fee-co2')) {
      document.getElementById('dashboard-rev-fee-co2').textContent = fmt(latestRev.rakFee);
    }
    if (document.getElementById('dashboard-rev-pct-co2')) {
      const p2 = latestRev.pctOwner1 !== undefined ? latestRev.pctOwner1 : (100 - (Number(latestRev.pctOwner2) || 50));
      document.getElementById('dashboard-rev-pct-co2').textContent = Number(p2).toFixed(2).replace('.', ',') + '%';
    }
    if (document.getElementById('dashboard-rev-fee-co1')) {
      document.getElementById('dashboard-rev-fee-co1').textContent = fmt(latestRev.lauraFee);
    }
    if (document.getElementById('dashboard-rev-pct-co1')) {
      const p1 = latestRev.pctOwner2 !== undefined ? latestRev.pctOwner2 : 50;
      document.getElementById('dashboard-rev-pct-co1').textContent = Number(p1).toFixed(2).replace('.', ',') + '%';
    }
  }
  renderHistoryTable();
  renderRevisionsTable();
  drawFinancialCharts();
  fillSettingsInputs();
}

function switchTab(tabId) {
  const tabs = ['dashboard', 'history', 'revisions', 'settings'];
  tabs.forEach(t => {
    const viewEl = document.getElementById('tab-content-' + t);
    if (viewEl) viewEl.style.display = (t === tabId) ? 'block' : 'none';

    // Bottom tabbar button
    const mBtn = document.getElementById('m-btn-' + t);
    if (mBtn) {
      if (t === tabId) mBtn.classList.add('active');
      else mBtn.classList.remove('active');
    }
  });

  if (tabId === 'dashboard') {
    setTimeout(drawFinancialCharts, 50);
  }
}

/* ==========================================================
   CANVAS CHART DRAWING
   ========================================================== */
function drawFinancialCharts() {
  try {
    drawEvolutionChart();
  } catch (e) {
    console.warn('drawEvolutionChart warning:', e);
  }
  try {
    drawReceiptBreakdownChart();
  } catch (e) {
    console.warn('drawReceiptBreakdownChart warning:', e);
  }
}

function drawEvolutionChart() {
  const canvas = document.getElementById('amortCurveCanvas') || document.getElementById('amort-chart-canvas');
  if (!canvas || !canvas.parentElement) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight || 240;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  if (!payments || payments.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Sin datos registrados", w / 2, h / 2);
    return;
  }

  const pad = { top: 20, right: 15, bottom: 25, left: 45 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const maxCap = Math.max(Number(settings.initialCapital) || 125000, ...payments.map(p => p.remaining || 0));

  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();

    const val = maxCap - (maxCap / 4) * i;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText((val / 1000).toFixed(0) + 'k€', pad.left - 6, y + 3);
  }

  // Draw Total Bank Mortgage Line (Purple)
  ctx.beginPath();
  payments.forEach((p, idx) => {
    const x = pad.left + (idx / Math.max(1, payments.length - 1)) * plotW;
    const y = pad.top + plotH - ((p.remaining || 0) / maxCap) * plotH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw Owner2 Pending Capital Line (Emerald)
  ctx.beginPath();
  payments.forEach((p, idx) => {
    const x = pad.left + (idx / Math.max(1, payments.length - 1)) * plotW;
    const y = pad.top + plotH - ((p.lauraRemaining || 0) / maxCap) * plotH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Gradient fill for Owner2 curve
  const lastX = pad.left + plotW;
  const firstX = pad.left;
  const baseLine = pad.top + plotH;
  ctx.lineTo(lastX, baseLine);
  ctx.lineTo(firstX, baseLine);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, pad.top, 0, baseLine);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawReceiptBreakdownChart() {
  const canvas = document.getElementById('breakdownMonthlyCanvas') || document.getElementById('receipt-chart-canvas');
  if (!canvas || !canvas.parentElement) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight || 240;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const recent = payments.slice(-12);
  if (recent.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Sin datos mensuales registrados", w / 2, h / 2);
    return;
  }

  const pad = { top: 20, right: 10, bottom: 25, left: 35 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const maxVal = Math.max(650, ...recent.map(p => (p.principal || 0) + (p.interest || 0) + (p.extra || 0)));
  const colW = (plotW / recent.length) * 0.65;

  recent.forEach((p, idx) => {
    const xCenter = pad.left + ((idx + 0.5) / recent.length) * plotW;
    const x = xCenter - (colW / 2);

    const prinH = (((p.principal || 0) + (p.extra || 0)) / maxVal) * plotH;
    const intH = ((p.interest || 0) / maxVal) * plotH;
    const baseLine = pad.top + plotH;

    // Principal (Emerald)
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x, baseLine - prinH, colW, prinH);

    // Interest (Amber)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, baseLine - prinH - intH, colW, intH);

    // Month label
    ctx.fillStyle = '#64748b';
    ctx.font = '9px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const mName = MONTH_LABELS[((Number(p.month) || 1) - 1) % 12] || ('M' + p.month);
    ctx.fillText(mName.substring(0, 3), xCenter, baseLine + 14);
  });
}

function getMortgageYearKey(year, month) {
  if (month === 12) return `HY_${year}_${year + 1}`;
  return `HY_${year - 1}_${year}`;
}

function getRevisionBadge(year, month) {
  const rev = getActiveRevisionForDate(year, month);
  if (!rev) {
    return `<span style="font-size: 10px; color: var(--text-dim); background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 4px;">General</span>`;
  }
  return `<span style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); padding: 2px 6px; border-radius: 4px;">${rev.name}</span>`;
}

/* History Table Rendering */
function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  const query = (document.getElementById('filter-search')?.value || '').toLowerCase();
  const yr = document.getElementById('filter-year-select')?.value || 'ALL';

  let list = payments.filter(p => {
    const hypKey = getMortgageYearKey(p.year, p.month);
    const matchYear = (yr === 'ALL') || (yr === hypKey) || (p.year.toString() === yr);
    const mName = (MONTH_LABELS[p.month - 1] || '').toLowerCase();
    const matchQ = !query ||
      mName.includes(query) ||
      p.year.toString().includes(query) ||
      (p.notes && p.notes.toLowerCase().includes(query));
    return matchYear && matchQ;
  });

  list.sort((a, b) => (b.year - a.year) || (b.month - a.month));

  tbody.innerHTML = '';
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="17" style="text-align: center; padding: 32px; color: var(--text-muted);">No se encontraron mensualidades.</td></tr>';
    return;
  }

  list.forEach(p => {
    const tr = document.createElement('tr');
    const gapColor = p.monthGap >= 0 ? 'var(--primary)' : 'var(--red)';
    const accColor = p.accBalance >= 0 ? 'var(--primary)' : 'var(--red)';
    tr.innerHTML = `
      <td>
        <strong>${MONTH_LABELS[p.month - 1] || ('Mes ' + p.month)}</strong>
        <span style="color: var(--text-muted); font-size: 11px;"> ${p.year}</span>
        ${p.extra > 0 ? `<span class="badge-pill" style="font-size: 9px; padding: 1px 5px; margin-left: 4px;">EXTRA</span>` : ''}
      </td>
      <td>${getRevisionBadge(p.year, p.month)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(p.deposit)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(p.co1)}</td>
      <td style="color: var(--purple); font-weight: 700;">${fmt(p.co2)}</td>
      <td style="color: var(--text-muted);">${p.community ? fmt(p.community) : '-'}</td>
      <td style="color: var(--text-muted);">${p.electricity ? fmt(p.electricity) : '-'}</td>
      <td style="color: var(--amber); font-weight: 600;">${p.derramas ? fmt(p.derramas) : '-'}</td>
      <td style="color: var(--text-muted);">${((p.insurance||0)+(p.ibi||0)) ? fmt((p.insurance||0)+(p.ibi||0)) : '-'}</td>
      <td style="color: var(--text-muted);">${p.otherExtra ? fmt(p.otherExtra) : '-'}</td>
      <td style="color: #38bdf8; font-weight: 700;">${p.lauraExtraAmort ? `<span style="background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); padding: 2px 6px; border-radius: 4px;">-${fmt(p.lauraExtraAmort)}</span>` : '-'}</td>
      <td style="color: #f43f5e; font-weight: 700;">${fmt(p.totalExpenses)}</td>
      <td style="font-weight: 700; color: ${gapColor};">${p.monthGap >= 0 ? '+' : ''}${fmt(p.monthGap)}</td>
      <td style="font-weight: 800; font-size: 13px; color: ${accColor}; background: ${p.accBalance >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'}; border-radius: 6px; padding: 6px 10px;">${p.accBalance >= 0 ? '+' : ''}${fmt(p.accBalance)}</td>
      <td style="color: var(--text-muted); font-size: 11px;">${fmt(p.totalFee)}</td>
      <td style="color: var(--primary); font-weight: 800; background: rgba(16, 185, 129, 0.08); border-radius: 4px; padding: 4px 8px;">${fmt(p.lauraRemaining)}</td>
      <td style="color: #fff; font-weight: 600; font-size: 12px;">${fmt(p.remaining)}</td>
      <td style="text-align: center;">
        <button onclick="openEditModal(${p.id})" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px;">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ==========================================================
   REVISIONS MANAGER
   ========================================================== */
function renderRevisionsTable() {
  const tbody = document.getElementById('revisions-table-body');
  if (!tbody) return;

  const sorted = [...revisions].sort((a, b) => ((Number(b.startYear) || 0) - (Number(a.startYear) || 0)) || ((Number(b.startMonth) || 0) - (Number(a.startMonth) || 0)));
  tbody.innerHTML = '';

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; padding: 24px; color: var(--text-muted);">No hay periodos de revisión creados.</td></tr>';
    return;
  }

  sorted.forEach(r => {
    const tr = document.createElement('tr');
    const mName = MONTH_LABELS[((Number(r.startMonth) || 1) - 1) % 12] || ('Mes ' + r.startMonth);
    const yr = r.startYear || '';
    const pct = Number(r.pctOwner2) || 0;
    tr.innerHTML = `
      <td><strong>${mName} ${yr}</strong></td>
      <td style="font-weight: 700; color: #fff;">${r.name || 'Revisión'}</td>
      <td>${fmt(r.capTotal)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(r.capOwner2)}</td>
      <td style="color: var(--primary); font-weight: 800;">${pct.toFixed(2)}%</td>
      <td style="font-weight: 700; color: #fff;">${fmt(r.feeTotal)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(r.lauraFee)}</td>
      <td style="color: var(--purple); font-weight: 700;">${fmt(r.rakFee)}</td>
      <td style="color: var(--amber);">${fmt(r.intTotal)}</td>
      <td style="color: var(--primary);">${fmt(r.lauraInt)}</td>
      <td>${fmt(r.prinTotal)}</td>
      <td style="color: var(--primary);">${fmt(r.lauraPrin)}</td>
      <td style="text-align: center; white-space: nowrap;">
        <button onclick="openRevisionModal(${r.id})" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 8px; margin-right: 4px;">Editar</button>
        <button onclick="applyRevisionToRange(${r.id})" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 8px; color: var(--primary); border-color: rgba(16,185,129,0.3);">Aplicar a Meses</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openRevisionModal(id = null) {
  safeSetVal("rev-edit-id", id || "");
  const delBtn = document.getElementById('btn-delete-revision');
  if (delBtn) delBtn.style.display = id ? "inline-flex" : "none";
  safeSetText('rev-modal-title', id ? "Editar Periodo" : "Añadir Periodo");

  if (id) {
    const r = revisions.find(x => x.id == id);
    if (r) {
      safeSetVal('rev-name', r.name || 'Revisión');
      safeSetVal('rev-start-year', r.startYear || (new Date()).getFullYear());
      safeSetVal('rev-start-month', r.startMonth || ((new Date()).getMonth() + 1));
      safeSetVal('rev-cap-total', (Number(r.capTotal) || 0).toFixed(2));
      safeSetVal('rev-cap-laura', (Number(r.capOwner2) || 0).toFixed(2));
      safeSetVal('rev-pct-laura', (Number(r.pctOwner2) || (Number(settings.coOwner1Percentage) || 50)).toFixed(2));
      safeSetVal('rev-fee-total', (Number(r.feeTotal) || 0).toFixed(2));
      safeSetVal('rev-int-total', (Number(r.intTotal) || 0).toFixed(2));
    }
  } else {
    const initCap = Number(settings.initialCapital) || 0;
    const initPctL = Number(settings.coOwner1Percentage) || 50;
    const initDebtL = (settings.internalDebtOwner2 && Number(settings.internalDebtOwner2) > 0)
      ? Number(settings.internalDebtOwner2)
      : (initCap * (initPctL / 100));

    safeSetVal('rev-name', "Revisión " + MONTH_LABELS[(new Date()).getMonth()] + " " + (new Date()).getFullYear());
    safeSetVal('rev-start-year', (new Date()).getFullYear());
    safeSetVal('rev-start-month', (new Date()).getMonth() + 1);
    safeSetVal('rev-cap-total', initCap.toFixed(2));
    safeSetVal('rev-cap-laura', initDebtL.toFixed(2));
    safeSetVal('rev-pct-laura', initPctL.toFixed(2));
    safeSetVal('rev-fee-total', "0.00");
    safeSetVal('rev-int-total', "0.00");
  }

  updateRevisionCalculatedBox();
  const modal = document.getElementById('revision-modal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeRevisionModal() {
  const modal = document.getElementById('revision-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function onRevisionCapTotalChange() {
  const capTot = Number(safeGetVal('rev-cap-total')) || 0;
  const pctL = Number(safeGetVal('rev-pct-laura')) || (Number(settings.coOwner1Percentage) || 50);
  if (capTot > 0) {
    safeSetVal('rev-cap-laura', (capTot * (pctL / 100)).toFixed(2));
  }
  updateRevisionCalculatedBox();
}

function onRevisionCapOwner2Change() {
  const capTot = Number(safeGetVal('rev-cap-total')) || 0;
  const capL = Number(safeGetVal('rev-cap-laura')) || 0;
  if (capTot > 0 && capL > 0) {
    const pct = (capL / capTot) * 100;
    safeSetVal('rev-pct-laura', pct.toFixed(2));
  }
  updateRevisionCalculatedBox();
}

function onRevisionPctOwner2Change() {
  const capTot = Number(safeGetVal('rev-cap-total')) || 0;
  const pctL = Number(safeGetVal('rev-pct-laura')) || 0;
  if (capTot > 0) {
    safeSetVal('rev-cap-laura', (capTot * (pctL / 100)).toFixed(2));
  }
  updateRevisionCalculatedBox();
}


function onRevisionCapLauraChange() { onRevisionCapOwner2Change(); }
function onRevisionPctLauraChange() { onRevisionPctOwner2Change(); }

function onRevisionFeeChange() {
  updateRevisionCalculatedBox();
}

function onRevisionInterestChange() {
  updateRevisionCalculatedBox();
}

function updateRevisionCalculatedBox() {
  const fee = Number(safeGetVal('rev-fee-total')) || 0;
  const int = Number(safeGetVal('rev-int-total')) || 0;
  const pctL = Number(safeGetVal('rev-pct-laura')) || (Number(settings.coOwner1Percentage) || 50);

  const lauraFee = fee * (pctL / 100);
  const rakFee = Math.max(0, fee - lauraFee);
  const lauraInt = int * (pctL / 100);
  const prin = Math.max(0, fee - int);
  const lauraPrin = prin * (pctL / 100);

  safeSetText('rev-prev-laura-fee', fmt(lauraFee));
  safeSetText('rev-prev-rak-fee', fmt(rakFee));
  safeSetText('rev-prev-laura-int', fmt(lauraInt));
  safeSetText('rev-prev-laura-prin', fmt(lauraPrin));
}

function submitRevisionHandler(e) {
  if (e && e.preventDefault) e.preventDefault();
  try {
    const editId = safeGetVal('rev-edit-id');
    const name = safeGetVal('rev-name') || "Revisión";
    const y = Number(safeGetVal('rev-start-year')) || (new Date()).getFullYear();
    const m = Number(safeGetVal('rev-start-month')) || ((new Date()).getMonth() + 1);
    const capTot = Number(safeGetVal('rev-cap-total')) || 0;
    const capL = Number(safeGetVal('rev-cap-laura')) || 0;
    const pctL = Number(safeGetVal('rev-pct-laura')) || (Number(settings.coOwner1Percentage) || 50);
    const fee = Number(safeGetVal('rev-fee-total')) || 0;
    const int = Number(safeGetVal('rev-int-total')) || 0;
    const prin = Math.max(0, fee - int);
    const lauraFee = fee * (pctL / 100);
    const rakFee = Math.max(0, fee - lauraFee);
    const lauraInt = int * (pctL / 100);
    const lauraPrin = prin * (pctL / 100);

    const revObj = {
      id: editId ? Number(editId) : Date.now(),
      name,
      startYear: y,
      startMonth: m,
      capTotal: capTot,
      capOwner2: capL,
      pctOwner2: pctL,
      feeTotal: fee,
      intTotal: int,
      prinTotal: prin,
      lauraFee,
      rakFee,
      lauraInt,
      lauraPrin
    };

    if (editId) {
      const idx = revisions.findIndex(x => x.id == editId);
      if (idx !== -1) revisions[idx] = revObj;
      else revisions.push(revObj);
      showToast("Periodo actualizado");
    } else {
      revisions.push(revObj);
      showToast("Periodo añadido");
    }

    recomputeBalances();
    saveStateToStorage();
    closeRevisionModal();
    updateDashboardUI();
    syncToCloud();
  } catch (err) {
    console.error('Error guardando periodo de revisión:', err);
    closeRevisionModal();
    updateDashboardUI();
    showToast('Error al guardar periodo: ' + err.message);
  }
  return false;
}

function deleteCurrentRevision() {
  const editId = safeGetVal('rev-edit-id');
  if (!editId) return;

  if (confirm("¿Estás seguro de eliminar este periodo de revisión?")) {
    revisions = revisions.filter(x => x.id != editId);
    recomputeBalances();
    saveStateToStorage();
    closeRevisionModal();
    updateDashboardUI();
    syncToCloud();
    showToast("Periodo eliminado");
  }
}

function applyRevisionToRange(revId) {
  const rev = revisions.find(x => x.id === revId);
  if (!rev) return;

  if (confirm(`¿Aplicar cuotas y % de "${rev.name}" a los meses a partir de ${MONTH_LABELS[rev.startMonth-1]} ${rev.startYear}?`)) {
    let count = 0;
    payments.forEach(p => {
      if (p.year > rev.startYear || (p.year === rev.startYear && p.month >= rev.startMonth)) {
        p.totalFee = rev.feeTotal;
        p.co1 = rev.lauraFee;
        p.co2 = rev.rakFee;
        p.interest = rev.intTotal;
        p.principal = rev.prinTotal;
        count++;
      }
    });
    recomputeBalances();
    saveStateToStorage();
    updateDashboardUI();
    syncToCloud();
    showToast(`Se han actualizado ${count} meses`);
  }
}


/* ==========================================================
   MONTH REGISTRATION FORM & REACTIVE BIDIRECTIONAL MATH
   ========================================================== */
function getPreviousPaymentForDate(year, month) {
  if (!payments || payments.length === 0) return null;
  const sorted = [...payments].sort((a, b) => ((Number(a.year) || 0) - (Number(b.year) || 0)) || ((Number(a.month) || 0) - (Number(b.month) || 0)));
  const targetYear = Number(year) || 0;
  const targetMonth = Number(month) || 0;
  const prior = sorted.filter(p => {
    const py = Number(p.year) || 0;
    const pm = Number(p.month) || 0;
    return py < targetYear || (py === targetYear && pm < targetMonth);
  });
  return prior.length > 0 ? prior[prior.length - 1] : sorted[sorted.length - 1];
}

function openModal() {
  safeSetText('modal-title-text', "Registrar Mes");
  safeSetVal('p-edit-id', '');
  const delBtn = document.getElementById('btn-delete-row');
  if (delBtn) delBtn.style.display = "none";

  const sorted = [...payments].sort((a, b) => ((Number(a.year) || 0) - (Number(b.year) || 0)) || ((Number(a.month) || 0) - (Number(b.month) || 0)));
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  let y = latest ? Number(latest.year) : (new Date()).getFullYear();
  let m = latest ? Number(latest.month) + 1 : ((new Date()).getMonth() + 1);
  if (m > 12) { m = 1; y++; }

  safeSetVal('p-year', y);
  safeSetVal('p-month', m);

  const prev = getPreviousPaymentForDate(y, m);
  const rev = getActiveRevisionForDate(y, m);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    const revPct = rev && rev.pctOwner2 != null ? Number(rev.pctOwner2) : (Number(settings.coOwner1Percentage) || 50);
    badge.textContent = rev ? '📌 Periodo: ' + (rev.name || 'Periodo') + ' (' + revPct.toFixed(2) + '%)' : "📌 Periodo General";
  }

  const fee = rev && rev.feeTotal != null ? Number(rev.feeTotal) : (prev ? Number(prev.totalFee || 0) : 0);
  const pct = rev && rev.pctOwner2 != null ? Number(rev.pctOwner2) : (Number(settings.coOwner1Percentage) || 50);
  const co1 = rev && rev.lauraFee != null ? Number(rev.lauraFee) : (fee * (pct / 100));
  const co2 = rev && rev.rakFee != null ? Number(rev.rakFee) : (fee - co1);
  const int = rev && rev.intTotal != null ? Number(rev.intTotal) : (prev ? Number(prev.interest || 0) : 0);
  const prin = rev && rev.prinTotal != null ? Number(rev.prinTotal) : Math.max(0, fee - int);

  safeSetVal('p-total-fee', fee > 0 ? fee.toFixed(2) : "0.00");
  safeSetVal('p-laura-pct', pct.toFixed(2));
  safeSetVal('p-co1', co1 > 0 ? co1.toFixed(2) : "0.00");
  safeSetVal('p-co2', co2 > 0 ? co2.toFixed(2) : "0.00");
  safeSetVal('p-interest', int > 0 ? int.toFixed(2) : "0.00");
  safeSetVal('p-principal', prin > 0 ? prin.toFixed(2) : "0.00");

  // Strictly carry over the exact values from the previous month (including 0.00 when the previous month was 0)
  safeSetVal('p-community', (prev && prev.community !== undefined && prev.community !== null && prev.community !== '') ? Number(prev.community).toFixed(2) : "0.00");
  safeSetVal('p-electricity', (prev && prev.electricity !== undefined && prev.electricity !== null && prev.electricity !== '') ? Number(prev.electricity).toFixed(2) : "0.00");
  safeSetVal('p-derramas', (prev && prev.derramas !== undefined && prev.derramas !== null && prev.derramas !== '') ? Number(prev.derramas).toFixed(2) : "0.00");
  safeSetVal('p-insurance-ibi', "0.00");
  safeSetVal('p-other-extra', "0.00");
  safeSetVal('p-laura-extra-amort', "0.00");
  safeSetVal('p-deposit', (prev && prev.deposit !== undefined && prev.deposit !== null && prev.deposit !== '') ? Number(prev.deposit).toFixed(2) : "0.00");
  safeSetVal('p-notes', "");

  updateLiveModalSummary();
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function openEditModal(id) {
  const p = payments.find(x => x.id === id);
  if (!p) return;

  safeSetText('modal-title-text', 'Editar Mes: ' + MONTH_LABELS[p.month - 1] + ' ' + p.year);
  safeSetVal('p-edit-id', p.id);
  const delBtn = document.getElementById('btn-delete-row');
  if (delBtn) delBtn.style.display = "inline-flex";

  safeSetVal('p-year', p.year);
  safeSetVal('p-month', p.month);

  const rev = getActiveRevisionForDate(p.year, p.month);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    badge.textContent = rev ? '📌 Periodo: ' + rev.name : "📌 Periodo General";
  }

  const fee = p.totalFee || 0;
  const co1 = p.co1 || (fee * ((settings.coOwner1Percentage || 50) / 100));
  const pct = fee > 0 ? (co1 / fee) * 100 : (settings.coOwner1Percentage || 50);

  safeSetVal('p-total-fee', fee.toFixed(2));
  safeSetVal('p-laura-pct', pct.toFixed(2));
  safeSetVal('p-co1', co1.toFixed(2));
  safeSetVal('p-co2', (p.co2 || Math.max(0, fee - co1)).toFixed(2));
  safeSetVal('p-interest', (p.interest || 0).toFixed(2));
  safeSetVal('p-principal', (p.principal || 0).toFixed(2));

  safeSetVal('p-community', (p.community != null ? Number(p.community) : 0).toFixed(2));
  safeSetVal('p-electricity', (p.electricity != null ? Number(p.electricity) : 0).toFixed(2));
  safeSetVal('p-derramas', (p.derramas != null ? Number(p.derramas) : 0).toFixed(2));
  safeSetVal('p-insurance-ibi', ((p.insurance || 0) + (p.ibi || 0)).toFixed(2));
  safeSetVal('p-other-extra', (p.otherExtra || 0).toFixed(2));
  safeSetVal('p-laura-extra-amort', (p.lauraExtraAmort || 0).toFixed(2));
  safeSetVal('p-deposit', (p.deposit != null ? Number(p.deposit) : 0).toFixed(2));
  safeSetVal('p-notes', p.notes || "");

  updateLiveModalSummary();
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function onPaymentDateChange() {
  const y = Number(safeGetVal('p-year')) || (new Date()).getFullYear();
  const m = Number(safeGetVal('p-month')) || ((new Date()).getMonth() + 1);
  const rev = getActiveRevisionForDate(y, m);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    badge.textContent = rev ? `📌 Periodo detectado: ${rev.name || 'Revisión'} (${(Number(rev.pctOwner2) || 0).toFixed(2)}%)` : "📌 Periodo General";
  }

  const editId = safeGetVal('p-edit-id');
  if (!editId) {
    const prev = getPreviousPaymentForDate(y, m);
    if (rev) {
      safeSetVal('p-total-fee', (Number(rev.feeTotal) || 0).toFixed(2));
      safeSetVal('p-laura-pct', (Number(rev.pctOwner2) || 0).toFixed(2));
      safeSetVal('p-co1', (Number(rev.lauraFee) || 0).toFixed(2));
      safeSetVal('p-co2', (Number(rev.rakFee) || 0).toFixed(2));
      safeSetVal('p-interest', (Number(rev.intTotal) || 0).toFixed(2));
      safeSetVal('p-principal', (Number(rev.prinTotal) || 0).toFixed(2));
    } else if (prev) {
      const fee = Number(prev.totalFee) || 0;
      const pct = Number(settings.coOwner1Percentage) || 50;
      const co1 = fee * (pct / 100);
      const co2 = Math.max(0, fee - co1);
      const int = Number(prev.interest) || 0;
      const prin = Math.max(0, fee - int);
      safeSetVal('p-total-fee', fee.toFixed(2));
      safeSetVal('p-laura-pct', pct.toFixed(2));
      safeSetVal('p-co1', co1.toFixed(2));
      safeSetVal('p-co2', co2.toFixed(2));
      safeSetVal('p-interest', int.toFixed(2));
      safeSetVal('p-principal', prin.toFixed(2));
    }

    if (prev) {
      safeSetVal('p-community', (prev.community !== undefined && prev.community !== null && prev.community !== '') ? Number(prev.community).toFixed(2) : "0.00");
      safeSetVal('p-electricity', (prev.electricity !== undefined && prev.electricity !== null && prev.electricity !== '') ? Number(prev.electricity).toFixed(2) : "0.00");
      safeSetVal('p-derramas', (prev.derramas !== undefined && prev.derramas !== null && prev.derramas !== '') ? Number(prev.derramas).toFixed(2) : "0.00");
      safeSetVal('p-deposit', (prev.deposit !== undefined && prev.deposit !== null && prev.deposit !== '') ? Number(prev.deposit).toFixed(2) : "0.00");
    }
    updateLiveModalSummary();
  }
}

function onTotalReceiptChange() {
  const fee = Number(safeGetVal('p-total-fee')) || 0;
  const pct = Number(safeGetVal('p-laura-pct')) || (settings.coOwner1Percentage || 50);
  const co1 = fee * (pct / 100);
  const co2 = Math.max(0, fee - co1);
  safeSetVal('p-co1', co1.toFixed(2));
  safeSetVal('p-co2', co2.toFixed(2));

  const int = Number(safeGetVal('p-interest')) || 0;
  const prin = Math.max(0, fee - int);
  safeSetVal('p-principal', prin.toFixed(2));
  updateLiveModalSummary();
}

function onOwner2PctChange() {
  const fee = Number(safeGetVal('p-total-fee')) || 0;
  const pct = Number(safeGetVal('p-laura-pct')) || 0;
  const co1 = fee * (pct / 100);
  const co2 = Math.max(0, fee - co1);
  safeSetVal('p-co1', co1.toFixed(2));
  safeSetVal('p-co2', co2.toFixed(2));
  updateLiveModalSummary();
}

function onCuotaOwner2Change() {
  const fee = Number(safeGetVal('p-total-fee')) || 0;
  const co1 = Number(safeGetVal('p-co1')) || 0;
  const co2 = Math.max(0, fee - co1);
  safeSetVal('p-co2', co2.toFixed(2));
  if (fee > 0) {
    const pct = (co1 / fee) * 100;
    safeSetVal('p-laura-pct', pct.toFixed(2));
  }
  updateLiveModalSummary();
}

function onCuotaOwner1Change() {
  const fee = Number(safeGetVal('p-total-fee')) || 0;
  const co2 = Number(safeGetVal('p-co2')) || 0;
  const co1 = Math.max(0, fee - co2);
  safeSetVal('p-co1', co1.toFixed(2));
  if (fee > 0) {
    const pct = (co1 / fee) * 100;
    safeSetVal('p-laura-pct', pct.toFixed(2));
  }
  updateLiveModalSummary();
}


function onLauraPctChange() { onOwner2PctChange(); }
function onCuotaLauraChange() { onCuotaOwner2Change(); }
function onCuotaRakChange() { onCuotaOwner1Change(); }

function onInterestChange() {
  const fee = Number(safeGetVal('p-total-fee')) || 0;
  const int = Number(safeGetVal('p-interest')) || 0;
  const prin = Math.max(0, fee - int);
  safeSetVal('p-principal', prin.toFixed(2));
  updateLiveModalSummary();
}

function updateLiveModalSummary() {
  const co1 = Number(document.getElementById('p-co1')?.value) || 0;
  const com = Number(document.getElementById('p-community')?.value) || 0;
  const luz = Number(document.getElementById('p-electricity')?.value) || 0;
  const derr = Number(document.getElementById('p-derramas')?.value) || 0;
  const ins = Number(document.getElementById('p-insurance-ibi')?.value) || 0;
  const other = Number(document.getElementById('p-other-extra')?.value) || 0;
  const lExtraAmort = Number(document.getElementById('p-laura-extra-amort')?.value) || 0;
  const dep = Number(document.getElementById('p-deposit')?.value) || 0;

  // Operational expenses only
  const totalExp = co1 + com + luz + derr + ins + other;
  const gap = dep - totalExp;

  const sumExpEl = document.getElementById('p-sum-expenses');
  const sumGapEl = document.getElementById('p-sum-gap');
  const capBoxEl = document.getElementById('p-sum-capital-box');
  const capValEl = document.getElementById('p-sum-capital');

  if (sumExpEl) sumExpEl.textContent = fmt(totalExp);
  if (sumGapEl) {
    sumGapEl.textContent = (gap >= 0 ? '+' : '') + fmt(gap);
    sumGapEl.style.color = gap >= 0 ? 'var(--primary)' : 'var(--red)';
  }

  if (capBoxEl && capValEl) {
    if (lExtraAmort > 0) {
      capBoxEl.style.display = 'block';
      capValEl.textContent = fmt(lExtraAmort);
    } else {
      capBoxEl.style.display = 'none';
    }
  }
}

function submitPaymentHandler(e) {
  if (e && e.preventDefault) e.preventDefault();
  const editId = safeGetVal('p-edit-id');
  const y = Number(safeGetVal('p-year')) || (new Date()).getFullYear();
  const m = Number(safeGetVal('p-month')) || ((new Date()).getMonth() + 1);
  const fee = Number(safeGetVal('p-total-fee')) || 0;
  const co1 = Number(safeGetVal('p-co1')) || (fee * ((Number(settings.coOwner1Percentage) || 50) / 100));
  const co2 = Number(safeGetVal('p-co2')) || Math.max(0, fee - co1);
  const int = Number(safeGetVal('p-interest')) || 0;
  const prin = Number(safeGetVal('p-principal')) || Math.max(0, fee - int);
  const com = Number(safeGetVal('p-community')) || 0;
  const luz = Number(safeGetVal('p-electricity')) || 0;
  const derr = Number(safeGetVal('p-derramas')) || 0;
  const insIbi = Number(safeGetVal('p-insurance-ibi')) || 0;
  const other = Number(safeGetVal('p-other-extra')) || 0;
  const lExtraAmort = Number(safeGetVal('p-laura-extra-amort')) || 0;
  const dep = Number(safeGetVal('p-deposit')) || 0;
  const notes = safeGetVal('p-notes');

  const paymentObj = {
    id: editId ? Number(editId) : Date.now(),
    year: y,
    month: m,
    totalFee: fee,
    co1,
    co2,
    interest: int,
    principal: prin,
    extra: 0,
    community: com,
    electricity: luz,
    derramas: derr,
    insurance: insIbi,
    ibi: 0,
    otherExtra: other,
    lauraExtraAmort: lExtraAmort,
    deposit: dep,
    notes,
    remaining: 0
  };

  if (editId) {
    const idx = payments.findIndex(x => x.id == editId);
    if (idx !== -1) payments[idx] = paymentObj;
    else payments.push(paymentObj);
    showToast("Mes actualizado");
  } else {
    const existingIdx = payments.findIndex(x => x.year === y && x.month === m);
    if (existingIdx !== -1) {
      payments[existingIdx] = paymentObj;
      showToast("Mes sobrescrito");
    } else {
      payments.push(paymentObj);
      showToast("Mes añadido correctamente");
    }
  }

  recomputeBalances();
  saveStateToStorage();
  closeModal();
  updateDashboardUI();
  syncToCloud();
}

function deleteCurrentRow() {
  const editId = safeGetVal('p-edit-id');
  if (!editId) return;

  if (confirm("¿Estás seguro de eliminar este registro mensual?")) {
    payments = payments.filter(x => x.id != editId);
    recomputeBalances();
    saveStateToStorage();
    closeModal();
    updateDashboardUI();
    syncToCloud();
    showToast("Mes eliminado");
  }
}

/* ==========================================================
   SETTINGS & AGREEMENT FORM
   ========================================================== */
function fillSettingsInputs() {
  safeSetVal('cfg-capital-init', (settings.initialCapital || 0).toFixed(2));
  safeSetVal('cfg-term-years', settings.totalTermYears || 25);
  safeSetVal('cfg-interest-rate', (settings.annualInterestRate || 2.50).toFixed(2));
  safeSetVal('cfg-laura-pct', (settings.coOwner1Percentage || 50.00).toFixed(2));
  safeSetVal('cfg-rak-pct', (settings.coOwner2Percentage || 50.00).toFixed(2));
  safeSetVal('cfg-laura-debt', (settings.internalDebtOwner2 || 0).toFixed(2));
  safeSetVal('cfg-rak-debt', (settings.internalDebtOwner1 || 0).toFixed(2));
  safeSetVal('cfg-debt-laura', (settings.internalDebtOwner2 || 0).toFixed(2));
  safeSetVal('cfg-debt-rak', (settings.internalDebtOwner1 || 0).toFixed(2));
  safeSetVal('sync-user-id', currentEmail);
}

function syncSettingsPercentages(source) {
  if (source === 'laura') {
    const lPct = Number(safeGetVal('cfg-laura-pct')) || 0;
    safeSetVal('cfg-rak-pct', (100 - lPct).toFixed(2));
  } else {
    const rPct = Number(safeGetVal('cfg-rak-pct')) || 0;
    safeSetVal('cfg-laura-pct', (100 - rPct).toFixed(2));
  }
}

function syncSettingsDebts() {
  const dL = Number(safeGetVal('cfg-laura-debt') || safeGetVal('cfg-debt-laura')) || 0;
  const dR = Number(safeGetVal('cfg-rak-debt') || safeGetVal('cfg-debt-rak')) || 0;
  const tot = dL + dR;
  if (tot > 0) {
    const lPct = (dL / tot) * 100;
    safeSetVal('cfg-laura-pct', lPct.toFixed(2));
    safeSetVal('cfg-rak-pct', (100 - lPct).toFixed(2));
  }
}

function onAgreementCapitalChange(source) {
  let tot = Number(safeGetVal('agree-init-capital')) || 0;
  let lCap = Number(safeGetVal('agree-debt-laura')) || 0;
  let rCap = Number(safeGetVal('agree-debt-rak')) || 0;

  if (source === 'laura') {
    if (tot > 0) {
      rCap = Math.max(0, tot - lCap);
      safeSetVal('agree-debt-rak', rCap.toFixed(2));
    }
  } else if (source === 'rak') {
    if (tot > 0) {
      lCap = Math.max(0, tot - rCap);
      safeSetVal('agree-debt-laura', lCap.toFixed(2));
    }
  } else if (source === 'total') {
    const pctL = Number(safeGetVal('agree-pct-laura')) || 43.94;
    lCap = tot * (pctL / 100);
    rCap = Math.max(0, tot - lCap);
    safeSetVal('agree-debt-laura', lCap.toFixed(2));
    safeSetVal('agree-debt-rak', rCap.toFixed(2));
  }

  if (tot > 0) {
    const pctL = (lCap / tot) * 100;
    const pctR = 100 - pctL;
    safeSetVal('agree-pct-laura', pctL.toFixed(2));
    safeSetVal('agree-pct-rak', pctR.toFixed(2));
  }
}

function resetAgreementToDefaults() {
  safeSetVal('agree-init-capital', "0.00");
  safeSetVal('agree-debt-laura', "0.00");
  safeSetVal('agree-debt-rak', "0.00");
  safeSetVal('agree-pct-laura', "50.00");
  safeSetVal('agree-pct-rak', "50.00");
}

function openAgreementModal() {
  const initTot = Number(settings.initialCapital) || 0;
  const initL = Number(settings.internalDebtOwner2) || 0;
  const initR = Number(settings.internalDebtOwner1) || Math.max(0, initTot - initL);
  const pctL = initTot > 0 ? (initL / initTot) * 100 : 50.00;
  const pctR = 100 - pctL;

  safeSetVal('agree-init-capital', initTot.toFixed(2));
  safeSetVal('agree-debt-laura', initL.toFixed(2));
  safeSetVal('agree-debt-rak', initR.toFixed(2));
  safeSetVal('agree-pct-laura', pctL.toFixed(2));
  safeSetVal('agree-pct-rak', pctR.toFixed(2));

  const modal = document.getElementById('agreement-modal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeAgreementModal() {
  const modal = document.getElementById('agreement-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function submitAgreementHandler(e) {
  if (e && e.preventDefault) e.preventDefault();
  try {
    const tot = Number(safeGetVal('agree-init-capital')) || 0;
    const lCap = Number(safeGetVal('agree-debt-laura')) || 0;
    const rCap = Number(safeGetVal('agree-debt-rak')) || Math.max(0, tot - lCap);
    const pctL = tot > 0 ? (lCap / tot) * 100 : 50.00;
    const pctR = 100 - pctL;

    settings.initialCapital = tot;
    settings.internalDebtOwner2 = lCap;
    settings.internalDebtOwner1 = rCap;
    settings.coOwner1Percentage = pctL;
    settings.coOwner2Percentage = pctR;

    recomputeBalances();
    saveStateToStorage();
    closeAgreementModal();
    updateDashboardUI();
    syncToCloud();
    showToast(`Capital inicial guardado: ${fmt(lCap)} (2º Prop.) / ${fmt(tot)} (Total)`);
  } catch (err) {
    console.error('Error guardando reparto:', err);
    closeAgreementModal();
    updateDashboardUI();
  }
  return false;
}

function saveSettingsHandler(e) {
  if (e && e.preventDefault) e.preventDefault();
  try {
    settings.initialCapital = Number(safeGetVal('cfg-capital-init')) || 0;
    settings.totalTermYears = Number(safeGetVal('cfg-term-years')) || 25;
    settings.annualInterestRate = Number(safeGetVal('cfg-interest-rate')) || 2.50;
    settings.coOwner1Percentage = Number(safeGetVal('cfg-laura-pct')) || 50.00;
    settings.coOwner2Percentage = Number(safeGetVal('cfg-rak-pct')) || 50.00;
    settings.internalDebtOwner2 = Number(safeGetVal('cfg-laura-debt') || safeGetVal('cfg-debt-laura')) || 0;
    settings.internalDebtOwner1 = Number(safeGetVal('cfg-rak-debt') || safeGetVal('cfg-debt-rak')) || 0;

    recomputeBalances();
    saveStateToStorage();
    updateDashboardUI();
    syncToCloud();
    showToast("Ajustes guardados correctamente");
  } catch (err) {
    console.error('Error guardando ajustes:', err);
  }
  return false;
}


function handleFilterChange() {
  renderHistoryTable();
}

function filterByYearPill(pillVal, btnElem) {
  document.querySelectorAll('.year-pill').forEach(el => el.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');

  const select = document.getElementById('filter-year-select');
  if (select) {
    select.value = pillVal;
    renderHistoryTable();
  }
}

/* ==========================================================
   EXPORT & BACKUP
   ========================================================== */
function exportDataJSON() {
  const data = {
    settings,
    revisions,
    payments,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hipoteca_copropietarios_${new Date().toISOString().substring(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Copia descargada");
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.settings) settings = data.settings;
      if (data.revisions) revisions = data.revisions;
      if (data.payments) payments = data.payments;
      recomputeBalances();
      saveStateToStorage();
      updateDashboardUI();
      showToast("Datos importados con éxito");
    } catch (err) {
      alert("Error al leer el archivo JSON.");
    }
  };
  reader.readAsText(file);
}


function forceCloudSave() {
  return triggerManualSync();
}

function clearAllData() {
  if (!confirm('¿Estás seguro de que deseas borrar todos los pagos y revisiones registrados?')) return;
  payments = [];
  revisions = [];
  recomputeBalances();
  updateDashboardUI();
  renderHistoryTable();
  renderRevisionsTable();
  saveStateToStorage();
  syncToCloud();
  showToast('Todos los datos han sido borrados');
}

function exportDataCSV() {
  if (!payments || payments.length === 0) {
    showToast('No hay pagos registrados para exportar');
    return;
  }
  const headers = ['ID', 'Año', 'Mes', 'CuotaTotal', 'Propietario2', 'Propietario1', 'Interes', 'Amortizacion', 'Comunidad', 'Luz', 'Derramas', 'Seguro_IBI', 'Otros', 'AporteExtra', 'Ingreso', 'Notas'];
  const rows = payments.map(p => [
    p.id, p.year, p.month, p.totalFee, p.co1, p.co2, p.interest, p.principal,
    p.community, p.electricity, p.derramas, (p.insurance || 0) + (p.ibi || 0), p.otherExtra, p.lauraExtraAmort, p.deposit, `"${(p.notes || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `hipoteca_pagos_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function resetToExcelOriginal() {
  if (!confirm('¿Deseas restablecer los datos con una plantilla de ejemplo limpia?')) return;
  settings = {
    initialCapital: 120000,
    totalTermYears: 25,
    annualInterestRate: 2.50,
    coOwner1Name: "1º Propietario",
    coOwner2Name: "2º Propietario",
    coOwner1Percentage: 50.00,
    coOwner2Percentage: 50.00,
    internalDebtOwner1: 60000,
    internalDebtOwner2: 60000
  };
  revisions = [];
  payments = [];
  recomputeBalances();
  updateDashboardUI();
  renderHistoryTable();
  renderRevisionsTable();
  saveStateToStorage();
  syncToCloud();
  showToast('Plantilla de ejemplo cargada');
}


/* ==========================================================
   SECURE MULTI-DEVICE CLOUD REALTIME SYNC & MODAL HANDLERS
   ========================================================== */
let cloudSyncTimeout = null;
let lastCloudTimestampText = '';

function scheduleCloudSync(delayMs = 150) {
  if (isSyncingIncoming) return;
  if (!currentEmail) return;
  if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
  cloudSyncTimeout = setTimeout(() => {
    syncToCloud();
  }, delayMs);
}

function switchSyncTab(tab) {
  const tabs = ['login', 'register', 'account'];
  tabs.forEach(t => {
    const btn = document.getElementById('sync-tab-btn-' + t);
    const view = document.getElementById('sync-view-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
    if (view) view.style.display = (t === tab) ? 'block' : 'none';
  });

  const msgEl = document.getElementById('sync-modal-msg');
  if (msgEl) msgEl.style.display = 'none';

  if (tab === 'account') {
    safeSetText('sync-manage-current-email', currentEmail || 'Sin Sesión');
    safeSetText('sync-manage-lock-status', currentEmail ? 'En Tiempo Real' : 'Desconectado');
    safeSetText('sync-manage-last-time', lastCloudTimestampText || '--');
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function showSyncModalMsg(text, type = 'info') {
  const msgEl = document.getElementById('sync-modal-msg');
  if (!msgEl) return;
  msgEl.style.display = 'block';
  msgEl.textContent = text;
  if (type === 'error') {
    msgEl.style.background = 'rgba(239, 68, 68, 0.18)';
    msgEl.style.color = '#fca5a5';
    msgEl.style.border = '1px solid rgba(239, 68, 68, 0.4)';
  } else if (type === 'warning') {
    msgEl.style.background = 'rgba(245, 158, 11, 0.18)';
    msgEl.style.color = '#fcd34d';
    msgEl.style.border = '1px solid rgba(245, 158, 11, 0.4)';
  } else if (type === 'success') {
    msgEl.style.background = 'rgba(16, 185, 129, 0.18)';
    msgEl.style.color = '#86efac';
    msgEl.style.border = '1px solid rgba(16, 185, 129, 0.4)';
  } else {
    msgEl.style.background = 'rgba(59, 130, 246, 0.18)';
    msgEl.style.color = '#93c5fd';
    msgEl.style.border = '1px solid rgba(59, 130, 246, 0.4)';
  }
}

function updateSyncUI(statusText = 'En Tiempo Real', dotColor = '#10b981') {
  const isLogged = !!currentEmail;

  // Header pill
  safeSetText('sync-pill-label', isLogged ? currentEmail.split('@')[0] : 'Conectar cuenta');
  const pillDot = document.getElementById('sync-pill-dot');
  if (pillDot) pillDot.style.background = isLogged ? dotColor : '#94a3b8';

  // Banner
  safeSetText('banner-sync-status', isLogged ? statusText : 'Modo Local');
  const statusEl = document.getElementById('banner-sync-status');
  if (statusEl) statusEl.style.color = isLogged ? dotColor : '#94a3b8';

  const dotEl = document.getElementById('banner-sync-dot');
  if (dotEl) dotEl.style.background = isLogged ? dotColor : '#94a3b8';

  safeSetText('banner-sync-user', isLogged ? currentEmail : 'Sin cuenta');
  safeSetText('banner-sync-time', isLogged ? (lastCloudTimestampText || '--') : '');

  const lockBadge = document.getElementById('banner-lock-badge');
  if (lockBadge) lockBadge.style.display = isLogged ? 'inline-block' : 'none';

  // Modal account tab visibility
  const accountTabBtn = document.getElementById('sync-tab-btn-account');
  if (accountTabBtn) accountTabBtn.style.display = isLogged ? 'block' : 'none';

  safeSetText('sync-manage-current-email', isLogged ? currentEmail : 'Sin Sesión');
  safeSetText('sync-manage-last-time', lastCloudTimestampText || '--');
}

async function initCloudSync() {
  if (!currentEmail) {
    updateSyncUI('Desconectado', '#94a3b8');
    return;
  }
  updateSyncUI('Sincronizando...', '#f59e0b');

  if (!currentObjectId) {
    currentObjectId = await resolveUserCloudId(currentEmail, currentPasswordHash);
    if (currentObjectId) saveStoredAuth(currentEmail, currentPasswordHash, currentObjectId);
  }

  if (!currentObjectId) {
    updateSyncUI('● En Tiempo Real', '#10b981');
    return;
  }

  let cloudApplied = false;
  try {
    const res = await cloudFetch(CLOUD_API_BASE + '/' + currentObjectId + '?t=' + Date.now());
    if (res && res.ok) {
      const obj = await res.json();
      const cloudData = obj.data;
      const localTime = Number(localStorage.getItem('hipoteca_last_updated_time')) || 0;
      if (cloudData && (Array.isArray(cloudData.payments) || Array.isArray(cloudData.revisions) || cloudData.settings)) {
        const cloudTime = cloudData.updatedAt || 0;
        const localHasData = (payments && payments.length > 0) || (revisions && revisions.length > 0);
        const cloudHasData = (cloudData.payments && cloudData.payments.length > 0) || (cloudData.revisions && cloudData.revisions.length > 0);

        if (cloudTime > localTime) {
          applyCloudData(cloudData);
          cloudApplied = true;
        } else if (localTime > cloudTime) {
          await syncToCloud();
          cloudApplied = true;
        } else if (cloudHasData && !localHasData) {
          applyCloudData(cloudData);
          cloudApplied = true;
        } else if (localHasData && !cloudHasData) {
          await syncToCloud();
          cloudApplied = true;
        } else {
          applyCloudData(cloudData);
          cloudApplied = true;
        }
      }
    }
  } catch (err) {
    console.warn("Init cloud sync fetch notice:", err);
  }

  if (!cloudApplied && ((payments && payments.length > 0) || (revisions && revisions.length > 0))) {
    await syncToCloud();
  }

  updateSyncUI('● En Tiempo Real', '#10b981');
}

function applyCloudData(data) {
  if (!data) return;
  isSyncingIncoming = true;
  localLastSyncTime = data.updatedAt || Date.now();
  lastCloudTimestampText = data.lastUpdatedText || new Date(localLastSyncTime).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

  if (data.settings) settings = { ...getDefaultZeroSettings(), ...data.settings };
  if (Array.isArray(data.revisions)) {
    revisions = data.revisions;
  }
  if (Array.isArray(data.payments)) {
    payments = data.payments;
  }

  try {
    if (currentEmail) {
      const userKey = 'hipoteca_user_' + currentEmail;
      localStorage.setItem(userKey, JSON.stringify({
        account: currentEmail,
        settings,
        revisions,
        payments,
        updatedAt: localLastSyncTime
      }));
      localStorage.setItem('hipoteca_last_updated_time', String(localLastSyncTime));
    }
  } catch (e) {}

  recomputeBalances();
  updateDashboardUI();
  renderHistoryTable();
  renderRevisionsTable();
  updateSyncUI('● En Tiempo Real', '#10b981');
  isSyncingIncoming = false;
}

async function syncToCloud() {
  if (isSyncingIncoming) return;
  if (!currentEmail) return;

  const now = Date.now();
  localLastSyncTime = now;
  try {
    localStorage.setItem('hipoteca_last_updated_time', String(now));
  } catch(e) {}
  lastCloudTimestampText = new Date(now).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

  const payload = {
    account: currentEmail,
    passwordHash: currentPasswordHash || '',
    updatedAt: now,
    lastUpdatedText: lastCloudTimestampText,
    settings: settings || getDefaultZeroSettings(),
    revisions: Array.isArray(revisions) ? revisions : [],
    payments: Array.isArray(payments) ? payments : []
  };

  // 1. Primary Sync: Firebase Firestore Realtime (instant, unmetered, push-based)
  if (window.firebaseSync && window.firebaseSync.db && window.firebaseSync.setDoc && window.firebaseSync.doc) {
    try {
      const { db, doc, setDoc } = window.firebaseSync;
      const userDocId = sanitizeSyncKey(currentEmail);
      await setDoc(doc(db, 'mortgages', userDocId), payload);
      updateSyncUI('● En Tiempo Real', '#10b981');
    } catch(fsErr) {
      console.warn("Firestore save notice:", fsErr);
    }
  }

  // 2. Also save to local user cache
  try {
    const userKey = 'hipoteca_user_' + currentEmail;
    localStorage.setItem(userKey, JSON.stringify(payload));
  } catch(e) {}
}

async function pollCloudUpdates() {
  if (isSyncingIncoming || !currentEmail) return;

  // 1. Check Firestore
  if (window.firebaseSync && window.firebaseSync.db && window.firebaseSync.getDoc && window.firebaseSync.doc) {
    try {
      const { db, doc, getDoc } = window.firebaseSync;
      const userDocId = sanitizeSyncKey(currentEmail);
      const snap = await getDoc(doc(db, 'mortgages', userDocId));
      if (snap && snap.exists()) {
        const data = snap.data();
        if (data) {
          const cloudUpdatedAt = Number(data.updatedAt) || 0;
          const localTime = Number(localStorage.getItem('hipoteca_last_updated_time')) || localLastSyncTime;
          const cloudRevsLen = Array.isArray(data.revisions) ? data.revisions.length : 0;
          const cloudPaysLen = Array.isArray(data.payments) ? data.payments.length : 0;
          const localRevsLen = Array.isArray(revisions) ? revisions.length : 0;
          const localPaysLen = Array.isArray(payments) ? payments.length : 0;

          const hasDifferentCounts = (cloudRevsLen !== localRevsLen) || (cloudPaysLen !== localPaysLen);
          const hasNewerCloudTime = cloudUpdatedAt > (localTime + 100);

          if (hasNewerCloudTime || (hasDifferentCounts && localLastSyncTime !== cloudUpdatedAt)) {
            if (Array.isArray(data.payments) || Array.isArray(data.revisions) || data.settings) {
              applyCloudData(data);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Poll cloud update notice:", err);
    }
  }
}

function startRealtimePoller() {
  if (realtimePollInterval) {
    clearInterval(realtimePollInterval);
    realtimePollInterval = null;
  }
  if (!currentEmail) return;

  realtimePollInterval = setInterval(() => {
    pollCloudUpdates();
  }, 2000);
}

// Auto-sync on tab visibility or window focus
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && currentEmail) {
    pollCloudUpdates();
  }
});
window.addEventListener('focus', () => {
  if (currentEmail) {
    pollCloudUpdates();
  }
});

async function triggerManualSync() {
  if (!currentEmail) {
    openSyncModal('login');
    showToast('Inicia sesión para sincronizar tus datos con la nube');
    return;
  }

  const icon = document.getElementById('sync-spin-icon');
  if (icon) icon.classList.add('spin-active');
  updateSyncUI('Sincronizando...', '#f59e0b');

  let success = false;
  if (window.firebaseSync && window.firebaseSync.db && window.firebaseSync.getDoc && window.firebaseSync.doc) {
    try {
      const { db, doc, getDoc } = window.firebaseSync;
      const userDocId = sanitizeSyncKey(currentEmail);
      const snap = await getDoc(doc(db, 'mortgages', userDocId));
      if (snap && snap.exists()) {
        const cloudData = snap.data();
        if (cloudData && (Array.isArray(cloudData.payments) || Array.isArray(cloudData.revisions) || cloudData.settings)) {
          applyCloudData(cloudData);
          showToast(`Sincronizado: ${revisions.length} revisiones, ${payments.length} meses`);
          success = true;
        }
      }
    } catch(e) {
      console.warn("Manual sync firestore notice:", e);
    }
  }

  if (!success) {
    await syncToCloud();
    showToast(`Guardado en la nube: ${revisions.length} revisiones, ${payments.length} meses`);
  }

  if (icon) icon.classList.remove('spin-active');
  updateSyncUI('● En Tiempo Real', '#10b981');
}

function openSyncModal(defaultTab) {
  const chosenTab = defaultTab || (currentEmail ? 'account' : 'login');

  const accountTabBtn = document.getElementById('sync-tab-btn-account');
  if (accountTabBtn) accountTabBtn.style.display = currentEmail ? 'block' : 'none';

  switchSyncTab(chosenTab);

  safeSetVal('sync-input-email', currentEmail || '');
  safeSetVal('sync-input-password', '');
  safeSetText('sync-active-label', currentEmail || 'Ninguna (Sesión cerrada)');
  safeSetText('sync-modal-last-time', lastCloudTimestampText || '--');

  const modal = document.getElementById('sync-modal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeSyncModal() {
  const modal = document.getElementById('sync-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

async function handleSyncLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const rawEmail = safeGetVal('sync-input-email').trim().toLowerCase();
  const pwd = safeGetVal('sync-input-password').trim();

  if (!rawEmail) {
    showSyncModalMsg('Introduce tu correo electrónico o usuario.', 'error');
    return;
  }

  showSyncModalMsg('Conectando a la cuenta...', 'info');

  try {
    const pwdHash = pwd ? hashPassword(pwd) : '';
    const pwdHashLower = pwd ? hashPassword(pwd.toLowerCase()) : '';
    let cloudData = null;

    // 1. Fetch from Firestore directly
    if (window.firebaseSync && window.firebaseSync.db && window.firebaseSync.getDoc && window.firebaseSync.doc) {
      try {
        const { db, doc, getDoc } = window.firebaseSync;
        const userDocId = sanitizeSyncKey(rawEmail);
        const snap = await getDoc(doc(db, 'mortgages', userDocId));
        if (snap && snap.exists()) {
          cloudData = snap.data();
        }
      } catch (fsErr) {
        console.warn("Firestore login fetch notice:", fsErr);
      }
    }

    // 2. Fallback to local user cache if cloud document not yet created
    if (!cloudData) {
      try {
        const localCached = localStorage.getItem('hipoteca_user_' + rawEmail);
        if (localCached) cloudData = JSON.parse(localCached);
      } catch(e) {}
    }

    // Validate password if account has password
    if (cloudData && cloudData.passwordHash) {
      const expected = cloudData.passwordHash;
      if (!pwdHash || (pwdHash !== expected && pwdHashLower !== expected)) {
        showSyncModalMsg('❌ Contraseña incorrecta para esta cuenta.', 'error');
        return;
      }
    }

    currentEmail = rawEmail;
    currentPasswordHash = (cloudData && cloudData.passwordHash) || pwdHash;
    saveStoredAuth(rawEmail, currentPasswordHash, '');

    if (cloudData && (Array.isArray(cloudData.payments) || Array.isArray(cloudData.revisions) || cloudData.settings)) {
      applyCloudData(cloudData);
    } else {
      loadStateFromStorage();
      await syncToCloud();
    }

    recomputeBalances();
    updateDashboardUI();
    renderHistoryTable();
    renderRevisionsTable();
    updateSyncUI('● En Tiempo Real', '#10b981');
    closeSyncModal();
    switchTab('dashboard');
    showToast(`Sesión iniciada: ${revisions.length} revisiones, ${payments.length} meses`);

    initFirebaseSync();
    startRealtimePoller();
  } catch (err) {
    showSyncModalMsg('Error al conectar: ' + (err.message || err), 'error');
  }
}

async function handleCreateUser(e) {
  if (e && e.preventDefault) e.preventDefault();
  const rawEmail = safeGetVal('sync-reg-email').trim().toLowerCase();
  const pwd = safeGetVal('sync-reg-password').trim();
  const confirmPwd = safeGetVal('sync-reg-confirm').trim();

  if (!rawEmail) {
    showSyncModalMsg('Introduce un correo electrónico o nombre de usuario.', 'error');
    return;
  }
  if (pwd && pwd.length < 4) {
    showSyncModalMsg('La contraseña debe tener al menos 4 caracteres.', 'error');
    return;
  }
  if (pwd && pwd !== confirmPwd) {
    showSyncModalMsg('Las contraseñas no coinciden.', 'error');
    return;
  }

  showSyncModalMsg('Creando cuenta en la nube...', 'info');

  try {
    const pwdHash = pwd ? hashPassword(pwd) : '';
    currentEmail = rawEmail;
    currentPasswordHash = pwdHash;
    saveStoredAuth(rawEmail, pwdHash, '');

    // New account starts clean/zero
    settings = getDefaultZeroSettings();
    revisions = [];
    payments = [];

    recomputeBalances();
    updateDashboardUI();
    renderHistoryTable();
    renderRevisionsTable();
    updateSyncUI('● En Tiempo Real', '#10b981');
    closeSyncModal();
    switchTab('dashboard');
    showToast('Cuenta creada como ' + rawEmail);

    await syncToCloud();
    initFirebaseSync();
    startRealtimePoller();
  } catch (err) {
    showSyncModalMsg('Error al crear cuenta: ' + err.message, 'error');
  }
}

async function handleLogout(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (realtimePollInterval) {
    clearInterval(realtimePollInterval);
    realtimePollInterval = null;
  }

  saveStoredAuth('', '', '');
  currentEmail = '';
  currentPasswordHash = '';
  currentObjectId = '';

  settings = getDefaultZeroSettings();
  revisions = [];
  payments = [];

  recomputeBalances();
  updateDashboardUI();
  renderHistoryTable();
  renderRevisionsTable();
  updateSyncUI('Desconectado', '#94a3b8');
  closeSyncModal();
  switchTab('dashboard');
  showToast('Sesión cerrada. Modo sin cuenta.');
}

async function handleDeleteAccount(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!currentEmail) {
    showToast('No hay ninguna sesión activa para eliminar');
    return;
  }

  if (!confirm('¿Estás seguro de que deseas eliminar permanentemente la cuenta ' + currentEmail + ' y todos sus datos en la nube?')) {
    return;
  }

  showSyncModalMsg('Eliminando cuenta...', 'info');

  try {
    if (currentObjectId) {
      await cloudFetch(CLOUD_API_BASE + '/' + currentObjectId, { method: 'DELETE' }).catch(() => {});

      const regRes = await cloudFetch(CLOUD_API_BASE + '/' + MASTER_REGISTRY_ID + '?t=' + Date.now());
      if (regRes.ok) {
        const regObj = await regRes.json();
        const regData = regObj.data || {};
        if (regData.users && regData.users[currentEmail]) {
          delete regData.users[currentEmail];
          regData.updatedAt = Date.now();
          await cloudFetch(CLOUD_API_BASE + '/' + MASTER_REGISTRY_ID, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'hipoteca_sync_registry_master',
              data: regData
            })
          }).catch(() => {});
        }
      }
    }

    localStorage.removeItem('hipoteca_user_' + currentEmail);
    await handleLogout();
    showToast('Cuenta eliminada con éxito.');
  } catch (err) {
    showToast('Error al eliminar cuenta: ' + err.message);
  }
}
