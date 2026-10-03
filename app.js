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

/* ==========================================================
   SECURE MULTI-DEVICE CLOUD REALTIME SYNCHRONIZATION
   ========================================================== */
const MASTER_REGISTRY_ID = 'ff808181a09d98f701a100b1b6ea69d1';
const CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
let currentObjectId = '';
let currentEmail = '';
let currentBinId = '';
let currentPasswordHash = '';
let localLastSyncTime = 0;
let realtimePollInterval = null;
let isSyncingIncoming = false;

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

  try {
    const regRes = await fetch(CLOUD_API_BASE + '/' + MASTER_REGISTRY_ID + '?t=' + Date.now());
    if (regRes.ok) {
      const regObj = await regRes.json();
      const regData = regObj.data || {};
      if (!regData.users) regData.users = {};

      if (regData.users[norm]) {
        return regData.users[norm];
      }

      // Create new cloud storage object for user
      const createRes = await fetch(CLOUD_API_BASE, {
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

      if (createRes.ok) {
        const createObj = await createRes.json();
        const newId = createObj.id;
        regData.users[norm] = newId;
        regData.updatedAt = Date.now();

        await fetch(CLOUD_API_BASE + '/' + MASTER_REGISTRY_ID, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'hipoteca_sync_registry_master',
            data: regData
          })
        });

        return newId;
      }
    }
  } catch (err) {
    console.warn('Registry resolution error:', err);
  }
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
        if (data && (Array.isArray(data.payments) || data.settings)) {
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
  currentBinId = auth.objectId;

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
    // Zero state: Guest / Unauthenticated
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
    if (!currentEmail) {
      settings = getDefaultZeroSettings();
      revisions = [];
      payments = [];
      recomputeBalances();
      return;
    }

    const userKey = 'hipoteca_user_' + currentEmail;
    const val = localStorage.getItem(userKey);
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
    if (currentEmail) {
      const userKey = 'hipoteca_user_' + currentEmail;
      localStorage.setItem(userKey, JSON.stringify({
        account: currentEmail,
        settings,
        revisions,
        payments,
        updatedAt: now
      }));
      localStorage.setItem('hipoteca_last_updated_time', String(now));
    }
  } catch (err) {}
  scheduleCloudSync();
}


function recomputeBalances() {
  payments.sort((a, b) => (a.year - b.year) || (a.month - b.month));

  let bal = Number(settings.initialCapital) || 0;
  let capOwner2 = (settings.internalDebtOwner2 && Number(settings.internalDebtOwner2) >= 40000)
    ? Number(settings.internalDebtOwner2)
    : 0;

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
    const sMonth = MONTH_LABELS[(latestRev.startMonth - 1) % 12] || '';
    const eMonth = MONTH_LABELS[(latestRev.endMonth - 1) % 12] || '';

    if (document.getElementById('dashboard-rev-period')) {
      document.getElementById('dashboard-rev-period').textContent = 'Revisión #' + revisions.length + ' (' + sMonth + ' ' + latestRev.startYear + ' - ' + eMonth + ' ' + latestRev.endYear + ')';
    }
    if (document.getElementById('dashboard-rev-note')) {
      document.getElementById('dashboard-rev-note').textContent = latestRev.note || 'Periodo vigente de liquidación bancaria';
    }
    if (document.getElementById('dashboard-rev-rate')) {
      document.getElementById('dashboard-rev-rate').textContent = (latestRev.annualRate || 0).toFixed(2).replace('.', ',') + '%';
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
      const p2 = latestRev.pctOwner1 !== undefined ? latestRev.pctOwner1 : (100 - (latestRev.pctOwner2 || 50));
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
  drawEvolutionChart();
  drawReceiptBreakdownChart();
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
    ctx.fillText(MONTH_LABELS[p.month - 1].substring(0, 3), xCenter, baseLine + 14);
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
    const mName = MONTH_LABELS[p.month - 1].toLowerCase();
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
        <strong>${MONTH_LABELS[p.month - 1]}</strong>
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

  const sorted = [...revisions].sort((a, b) => (b.startYear - a.startYear) || (b.startMonth - a.startMonth));
  tbody.innerHTML = '';

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; padding: 24px; color: var(--text-muted);">No hay periodos de revisión creados.</td></tr>';
    return;
  }

  sorted.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${MONTH_LABELS[r.startMonth - 1]} ${r.startYear}</strong></td>
      <td style="font-weight: 700; color: #fff;">${r.name}</td>
      <td>${fmt(r.capTotal)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(r.capOwner2)}</td>
      <td style="color: var(--primary); font-weight: 800;">${r.pctOwner2.toFixed(2)}%</td>
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
  document.getElementById('rev-edit-id').value = id || "";
  document.getElementById('btn-delete-revision').style.display = id ? "inline-flex" : "none";
  document.getElementById('rev-modal-title').textContent = id ? "Editar Periodo" : "Añadir Periodo";

  if (id) {
    const r = revisions.find(x => x.id === id);
    if (r) {
      document.getElementById('rev-name').value = r.name;
      document.getElementById('rev-start-year').value = r.startYear;
      document.getElementById('rev-start-month').value = r.startMonth;
      document.getElementById('rev-cap-total').value = r.capTotal;
      document.getElementById('rev-cap-laura').value = r.capOwner2;
      document.getElementById('rev-pct-laura').value = r.pctOwner2;
      document.getElementById('rev-fee-total').value = r.feeTotal;
      document.getElementById('rev-int-total').value = r.intTotal;
    }
  } else {
    document.getElementById('rev-name').value = "Revisión " + MONTH_LABELS[(new Date()).getMonth()] + " " + (new Date()).getFullYear();
    document.getElementById('rev-start-year').value = (new Date()).getFullYear();
    document.getElementById('rev-start-month').value = (new Date()).getMonth() + 1;
    document.getElementById('rev-cap-total').value = (settings.initialCapital || 0).toFixed(2);
    document.getElementById('rev-cap-laura').value = ((settings.initialCapital || 0) * ((settings.coOwner1Percentage || 32.27)/100)).toFixed(2);
    document.getElementById('rev-pct-laura').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
    document.getElementById('rev-fee-total').value = "513.81";
    document.getElementById('rev-int-total').value = "187.69";
  }

  updateRevisionCalculatedBox();
  document.getElementById('revision-modal').classList.add('active');
}

function closeRevisionModal() {
  document.getElementById('revision-modal').classList.remove('active');
}

function onRevisionCapTotalChange() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const pctL = Number(document.getElementById('rev-pct-laura').value) || (settings.coOwner1Percentage || 32.27);
  if (capTot > 0) {
    document.getElementById('rev-cap-laura').value = (capTot * (pctL / 100)).toFixed(2);
  }
  updateRevisionCalculatedBox();
}

function onRevisionCapOwner2Change() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const capL = Number(document.getElementById('rev-cap-laura').value) || 0;
  if (capTot > 0 && capL > 0) {
    const pct = (capL / capTot) * 100;
    document.getElementById('rev-pct-laura').value = pct.toFixed(2);
  }
  updateRevisionCalculatedBox();
}

function onRevisionPctOwner2Change() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const pctL = Number(document.getElementById('rev-pct-laura').value) || 0;
  if (capTot > 0) {
    document.getElementById('rev-cap-laura').value = (capTot * (pctL / 100)).toFixed(2);
  }
  updateRevisionCalculatedBox();
}

function onRevisionFeeChange() {
  updateRevisionCalculatedBox();
}

function onRevisionInterestChange() {
  updateRevisionCalculatedBox();
}

function updateRevisionCalculatedBox() {
  const fee = Number(document.getElementById('rev-fee-total').value) || 0;
  const int = Number(document.getElementById('rev-int-total').value) || 0;
  const pctL = Number(document.getElementById('rev-pct-laura').value) || 32.27;

  const lauraFee = fee * (pctL / 100);
  const rakFee = Math.max(0, fee - lauraFee);
  const lauraInt = int * (pctL / 100);
  const prin = Math.max(0, fee - int);
  const lauraPrin = prin * (pctL / 100);

  if (document.getElementById('rev-prev-laura-fee')) document.getElementById('rev-prev-laura-fee').textContent = fmt(lauraFee);
  if (document.getElementById('rev-prev-rak-fee')) document.getElementById('rev-prev-rak-fee').textContent = fmt(rakFee);
  if (document.getElementById('rev-prev-laura-int')) document.getElementById('rev-prev-laura-int').textContent = fmt(lauraInt);
  if (document.getElementById('rev-prev-laura-prin')) document.getElementById('rev-prev-laura-prin').textContent = fmt(lauraPrin);
}

function submitRevisionHandler(e) {
  e.preventDefault();
  const editId = document.getElementById('rev-edit-id').value;
  const name = document.getElementById('rev-name').value || "Revisión";
  const y = Number(document.getElementById('rev-start-year').value);
  const m = Number(document.getElementById('rev-start-month').value);
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const capL = Number(document.getElementById('rev-cap-laura').value) || 0;
  const pctL = Number(document.getElementById('rev-pct-laura').value) || 32.27;
  const fee = Number(document.getElementById('rev-fee-total').value) || 0;
  const int = Number(document.getElementById('rev-int-total').value) || 0;
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
    showToast("Periodo actualizado");
  } else {
    revisions.push(revObj);
    showToast("Periodo añadido");
  }

  saveStateToStorage();
  closeRevisionModal();
  updateDashboardUI();
}

function deleteCurrentRevision() {
  const editId = document.getElementById('rev-edit-id').value;
  if (!editId) return;

  if (confirm("¿Estás seguro de eliminar este periodo de revisión?")) {
    revisions = revisions.filter(x => x.id != editId);
    saveStateToStorage();
    closeRevisionModal();
    updateDashboardUI();
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
    showToast(`Se han actualizado ${count} meses`);
  }
}


/* ==========================================================
   MONTH REGISTRATION FORM & REACTIVE BIDIRECTIONAL MATH
   ========================================================== */
function openModal() {
  document.getElementById('modal-title-text').textContent = "Registrar Mes";
  document.getElementById('p-edit-id').value = "";
  document.getElementById('btn-delete-row').style.display = "none";

  const latest = payments[payments.length - 1];
  let y = latest ? latest.year : (new Date()).getFullYear();
  let m = latest ? latest.month + 1 : ((new Date()).getMonth() + 1);
  if (m > 12) { m = 1; y++; }

  document.getElementById('p-year').value = y;
  document.getElementById('p-month').value = m;

  // Detect active revision for this month
  const rev = getActiveRevisionForDate(y, m);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    badge.textContent = rev ? `📌 Periodo: ${rev.name} (${rev.pctOwner2.toFixed(2)}%)` : "📌 Periodo General";
  }

  const fee = rev ? rev.feeTotal : (latest ? latest.totalFee : 513.81);
  const pct = rev ? rev.pctOwner2 : (settings.coOwner1Percentage || 32.27);
  const co1 = rev ? rev.lauraFee : (fee * (pct / 100));
  const co2 = rev ? rev.rakFee : (fee - co1);
  const int = rev ? rev.intTotal : (latest ? latest.interest : 180.00);
  const prin = rev ? rev.prinTotal : Math.max(0, fee - int);

  document.getElementById('p-total-fee').value = fee.toFixed(2);
  document.getElementById('p-laura-pct').value = pct.toFixed(2);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = co2.toFixed(2);
  document.getElementById('p-interest').value = int.toFixed(2);
  document.getElementById('p-principal').value = prin.toFixed(2);

  // Arrastra gastos anteriores del piso
  document.getElementById('p-community').value = (latest ? (latest.community || 81) : 81).toFixed(2);
  document.getElementById('p-electricity').value = (latest ? (latest.electricity || 35) : 35).toFixed(2);
  document.getElementById('p-derramas').value = (latest ? (latest.derramas || 0) : 0).toFixed(2);
  document.getElementById('p-insurance-ibi').value = "0.00";
  document.getElementById('p-other-extra').value = "0.00";
  document.getElementById('p-laura-extra-amort').value = "0.00";
  document.getElementById('p-deposit').value = (latest ? (latest.deposit || 500) : 500).toFixed(2);
  document.getElementById('p-notes').value = "";

  updateLiveModalSummary();
  document.getElementById('payment-modal').classList.add('active');
}

function openEditModal(id) {
  const p = payments.find(x => x.id === id);
  if (!p) return;

  document.getElementById('modal-title-text').textContent = `Editar Mes: ${MONTH_LABELS[p.month - 1]} ${p.year}`;
  document.getElementById('p-edit-id').value = p.id;
  document.getElementById('btn-delete-row').style.display = "inline-flex";

  document.getElementById('p-year').value = p.year;
  document.getElementById('p-month').value = p.month;

  const rev = getActiveRevisionForDate(p.year, p.month);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    badge.textContent = rev ? `📌 Periodo: ${rev.name}` : "📌 Periodo General";
  }

  const fee = p.totalFee || 513.81;
  const co1 = p.co1 || (fee * ((settings.coOwner1Percentage || 32.27) / 100));
  const pct = fee > 0 ? (co1 / fee) * 100 : (settings.coOwner1Percentage || 32.27);

  document.getElementById('p-total-fee').value = fee.toFixed(2);
  document.getElementById('p-laura-pct').value = pct.toFixed(2);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = (p.co2 || (fee - co1)).toFixed(2);
  document.getElementById('p-interest').value = (p.interest || 0).toFixed(2);
  document.getElementById('p-principal').value = (p.principal || 0).toFixed(2);

  document.getElementById('p-community').value = (p.community || 0).toFixed(2);
  document.getElementById('p-electricity').value = (p.electricity || 0).toFixed(2);
  document.getElementById('p-derramas').value = (p.derramas || 0).toFixed(2);
  document.getElementById('p-insurance-ibi').value = ((p.insurance || 0) + (p.ibi || 0)).toFixed(2);
  document.getElementById('p-other-extra').value = (p.otherExtra || 0).toFixed(2);
  document.getElementById('p-laura-extra-amort').value = (p.lauraExtraAmort || 0).toFixed(2);
  document.getElementById('p-deposit').value = (p.deposit || 0).toFixed(2);
  document.getElementById('p-notes').value = p.notes || "";

  updateLiveModalSummary();
  document.getElementById('payment-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('payment-modal').classList.remove('active');
}

function onPaymentDateChange() {
  const y = Number(document.getElementById('p-year').value);
  const m = Number(document.getElementById('p-month').value);
  const rev = getActiveRevisionForDate(y, m);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    badge.textContent = rev ? `📌 Periodo detectado: ${rev.name} (${rev.pctOwner2.toFixed(2)}%)` : "📌 Periodo General";
  }

  const editId = document.getElementById('p-edit-id').value;
  if (!editId && rev) {
    document.getElementById('p-total-fee').value = rev.feeTotal.toFixed(2);
    document.getElementById('p-laura-pct').value = rev.pctOwner2.toFixed(2);
    document.getElementById('p-co1').value = rev.lauraFee.toFixed(2);
    document.getElementById('p-co2').value = rev.rakFee.toFixed(2);
    document.getElementById('p-interest').value = rev.intTotal.toFixed(2);
    document.getElementById('p-principal').value = rev.prinTotal.toFixed(2);
    updateLiveModalSummary();
  }
}

function onTotalReceiptChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const pct = Number(document.getElementById('p-laura-pct').value) || (settings.coOwner1Percentage || 32.27);
  const co1 = fee * (pct / 100);
  const co2 = Math.max(0, fee - co1);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = co2.toFixed(2);

  const int = Number(document.getElementById('p-interest').value) || 0;
  const prin = Math.max(0, fee - int);
  document.getElementById('p-principal').value = prin.toFixed(2);
  updateLiveModalSummary();
}

function onOwner2PctChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const pct = Number(document.getElementById('p-laura-pct').value) || 0;
  const co1 = fee * (pct / 100);
  const co2 = Math.max(0, fee - co1);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = co2.toFixed(2);
  updateLiveModalSummary();
}

function onCuotaOwner2Change() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const co1 = Number(document.getElementById('p-co1').value) || 0;
  const co2 = Math.max(0, fee - co1);
  document.getElementById('p-co2').value = co2.toFixed(2);
  if (fee > 0) {
    const pct = (co1 / fee) * 100;
    document.getElementById('p-laura-pct').value = pct.toFixed(2);
  }
  updateLiveModalSummary();
}

function onCuotaOwner1Change() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const co2 = Number(document.getElementById('p-co2').value) || 0;
  const co1 = Math.max(0, fee - co2);
  document.getElementById('p-co1').value = co1.toFixed(2);
  if (fee > 0) {
    const pct = (co1 / fee) * 100;
    document.getElementById('p-laura-pct').value = pct.toFixed(2);
  }
  updateLiveModalSummary();
}

function onInterestChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const int = Number(document.getElementById('p-interest').value) || 0;
  const prin = Math.max(0, fee - int);
  document.getElementById('p-principal').value = prin.toFixed(2);
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
  e.preventDefault();
  const editId = document.getElementById('p-edit-id').value;

  const y = Number(document.getElementById('p-year').value);
  const m = Number(document.getElementById('p-month').value);
  const fee = Number(document.getElementById('p-total-fee').value) || 513.81;
  const co1 = Number(document.getElementById('p-co1').value) || (fee * ((settings.coOwner1Percentage || 32.27) / 100));
  const co2 = Number(document.getElementById('p-co2').value) || Math.max(0, fee - co1);
  const int = Number(document.getElementById('p-interest').value) || 0;
  const prin = Number(document.getElementById('p-principal').value) || 0;
  const com = Number(document.getElementById('p-community').value) || 0;
  const luz = Number(document.getElementById('p-electricity').value) || 0;
  const derr = Number(document.getElementById('p-derramas').value) || 0;
  const insIbi = Number(document.getElementById('p-insurance-ibi').value) || 0;
  const other = Number(document.getElementById('p-other-extra').value) || 0;
  const lExtraAmort = Number(document.getElementById('p-laura-extra-amort').value) || 0;
  const dep = Number(document.getElementById('p-deposit').value) || 0;
  const notes = document.getElementById('p-notes').value || "";

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
    showToast("Mes actualizado");
  } else {
    // Check if month already exists
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
}

function deleteCurrentRow() {
  const editId = document.getElementById('p-edit-id').value;
  if (!editId) return;

  if (confirm("¿Estás seguro de eliminar este registro mensual?")) {
    payments = payments.filter(x => x.id != editId);
    recomputeBalances();
    saveStateToStorage();
    closeModal();
    updateDashboardUI();
    showToast("Mes eliminado");
  }
}

/* ==========================================================
   SETTINGS & AGREEMENT FORM
   ========================================================== */
function fillSettingsInputs() {
  if (document.getElementById('cfg-capital-init')) {
    document.getElementById('cfg-capital-init').value = (settings.initialCapital || 0).toFixed(2);
    document.getElementById('cfg-term-years').value = settings.totalTermYears || 25;
    document.getElementById('cfg-interest-rate').value = (settings.annualInterestRate || 1.85).toFixed(2);
    document.getElementById('cfg-laura-pct').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
    document.getElementById('cfg-rak-pct').value = (settings.coOwner2Percentage || 67.73).toFixed(2);
    document.getElementById('cfg-debt-laura').value = (settings.internalDebtOwner2 || 0).toFixed(2);
    document.getElementById('cfg-debt-rak').value = (settings.internalDebtOwner1 || 0).toFixed(2);
    if (document.getElementById('sync-user-id')) {
      document.getElementById('sync-user-id').value = currentEmail;
    }
  }
}

function syncSettingsPercentages(source) {
  if (source === 'laura') {
    const lPct = Number(document.getElementById('cfg-laura-pct').value) || 0;
    document.getElementById('cfg-rak-pct').value = (100 - lPct).toFixed(2);
  } else {
    const rPct = Number(document.getElementById('cfg-rak-pct').value) || 0;
    document.getElementById('cfg-laura-pct').value = (100 - rPct).toFixed(2);
  }
}

function syncSettingsDebts() {
  const dL = Number(document.getElementById('cfg-debt-laura').value) || 0;
  const dR = Number(document.getElementById('cfg-debt-rak').value) || 0;
  const tot = dL + dR;
  if (tot > 0) {
    const lPct = (dL / tot) * 100;
    document.getElementById('cfg-laura-pct').value = lPct.toFixed(2);
    document.getElementById('cfg-rak-pct').value = (100 - lPct).toFixed(2);
  }
}

function onAgreementCapitalChange(source) {
  const totInput = document.getElementById('agree-init-capital');
  const lauraInput = document.getElementById('agree-debt-laura');
  const rakInput = document.getElementById('agree-debt-rak');
  const pctLInput = document.getElementById('agree-pct-laura');
  const pctRInput = document.getElementById('agree-pct-rak');

  let tot = Number(totInput?.value) || 0;
  let lCap = Number(lauraInput?.value) || 0;
  let rCap = Number(rakInput?.value) || 0;

  if (source === 'laura') {
    if (tot > 0) {
      rCap = Math.max(0, tot - lCap);
      if (rakInput) rakInput.value = rCap.toFixed(2);
    }
  } else if (source === 'rak') {
    if (tot > 0) {
      lCap = Math.max(0, tot - rCap);
      if (lauraInput) lauraInput.value = lCap.toFixed(2);
    }
  } else if (source === 'total') {
    const pctL = Number(pctLInput?.value) || 43.94;
    lCap = tot * (pctL / 100);
    rCap = Math.max(0, tot - lCap);
    if (lauraInput) lauraInput.value = lCap.toFixed(2);
    if (rakInput) rakInput.value = rCap.toFixed(2);
  }

  if (tot > 0) {
    const pctL = (lCap / tot) * 100;
    const pctR = 100 - pctL;
    if (pctLInput) pctLInput.value = pctL.toFixed(2);
    if (pctRInput) pctRInput.value = pctR.toFixed(2);
  }
}

function resetAgreementToDefaults() {
  const tot = 0;
  const lCap = 0;
  const rCap = 0;
  const pctL = (lCap / tot) * 100;
  const pctR = 100 - pctL;

  if (document.getElementById('agree-init-capital')) document.getElementById('agree-init-capital').value = tot.toFixed(2);
  if (document.getElementById('agree-debt-laura')) document.getElementById('agree-debt-laura').value = lCap.toFixed(2);
  if (document.getElementById('agree-debt-rak')) document.getElementById('agree-debt-rak').value = rCap.toFixed(2);
  if (document.getElementById('agree-pct-laura')) document.getElementById('agree-pct-laura').value = pctL.toFixed(2);
  if (document.getElementById('agree-pct-rak')) document.getElementById('agree-pct-rak').value = pctR.toFixed(2);
}

function openAgreementModal() {
  const initTot = Number(settings.initialCapital) || 0;
  const initL = (settings.internalDebtOwner2 && Number(settings.internalDebtOwner2) >= 40000) 
    ? Number(settings.internalDebtOwner2) 
    : 0;
  const initR = (settings.internalDebtOwner1 && Number(settings.internalDebtOwner1) > 0) 
    ? Number(settings.internalDebtOwner1) 
    : Math.max(0, initTot - initL);

  const pctL = initTot > 0 ? (initL / initTot) * 100 : 43.94;
  const pctR = 100 - pctL;

  if (document.getElementById('agree-init-capital')) document.getElementById('agree-init-capital').value = initTot.toFixed(2);
  if (document.getElementById('agree-debt-laura')) document.getElementById('agree-debt-laura').value = initL.toFixed(2);
  if (document.getElementById('agree-debt-rak')) document.getElementById('agree-debt-rak').value = initR.toFixed(2);
  if (document.getElementById('agree-pct-laura')) document.getElementById('agree-pct-laura').value = pctL.toFixed(2);
  if (document.getElementById('agree-pct-rak')) document.getElementById('agree-pct-rak').value = pctR.toFixed(2);

  const modal = document.getElementById('agreement-modal');
  if (modal) modal.classList.add('active');
}

function closeAgreementModal() {
  const modal = document.getElementById('agreement-modal');
  if (modal) modal.classList.remove('active');
}

function submitAgreementHandler(e) {
  if (e && e.preventDefault) e.preventDefault();
  const tot = Number(document.getElementById('agree-init-capital')?.value) || 0;
  const lCap = Number(document.getElementById('agree-debt-laura')?.value) || 0;
  const rCap = Number(document.getElementById('agree-debt-rak')?.value) || Math.max(0, tot - lCap);
  const pctL = tot > 0 ? (lCap / tot) * 100 : 43.94;
  const pctR = 100 - pctL;

  settings.initialCapital = tot;
  settings.internalDebtOwner2 = lCap;
  settings.internalDebtOwner1 = rCap;
  settings.coOwner1Percentage = pctL;
  settings.coOwner2Percentage = pctR;

  // Also update initial revision if exists
  const initialRev = revisions.find(r => r.startYear === 2020 && r.startMonth === 11) || revisions[0];
  if (initialRev) {
    initialRev.capTotal = tot;
    initialRev.capOwner2 = lCap;
    initialRev.pctOwner2 = pctL;
    initialRev.lauraFee = initialRev.feeTotal * (pctL / 100);
    initialRev.rakFee = Math.max(0, initialRev.feeTotal - initialRev.lauraFee);
    initialRev.lauraPrin = initialRev.prinTotal * (pctL / 100);
  }

  recomputeBalances();
  saveStateToStorage();
  closeAgreementModal();
  updateDashboardUI();
  showToast(`Capital inicial guardado: ${fmt(lCap)} (Owner2) / ${fmt(tot)} (Total)`);
}

function saveSettingsHandler(e) {
  e.preventDefault();
  settings.initialCapital = Number(document.getElementById('cfg-capital-init').value) || 0;
  settings.totalTermYears = Number(document.getElementById('cfg-term-years').value) || 25;
  settings.annualInterestRate = Number(document.getElementById('cfg-interest-rate').value) || 1.85;
  settings.coOwner1Percentage = Number(document.getElementById('cfg-laura-pct').value) || 32.27;
  settings.coOwner2Percentage = Number(document.getElementById('cfg-rak-pct').value) || 67.73;
  settings.internalDebtOwner2 = Number(document.getElementById('cfg-debt-laura').value) || 0;
  settings.internalDebtOwner1 = Number(document.getElementById('cfg-debt-rak').value) || 0;

  const newKey = document.getElementById('sync-user-id')?.value;
  if (newKey && newKey !== currentEmail) {
    currentEmail = newKey;
    saveStoredAuth(currentEmail, currentPasswordHash, currentBinId);
  }

  recomputeBalances();
  saveStateToStorage();
  updateDashboardUI();
  updateSyncUI();
  showToast("Ajustes guardados y sincronizados");
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

function resetAllData() {
  if (confirm("¿Estás seguro de restablecer todos los datos iniciales?")) {
    payments = getOriginalExcelSeed();
    recomputeBalances();
    saveStateToStorage();
    updateDashboardUI();
    showToast("Datos restablecidos");
  }
}

/* ==========================================================
   SECURE MULTI-DEVICE CLOUD REALTIME SYNC & MODAL HANDLERS
   ========================================================== */
let cloudSyncTimeout = null;
let lastCloudTimestampText = '';

function scheduleCloudSync(delayMs = 150) {
  if (isSyncingIncoming) return;
  if (!currentEmail || !currentBinId) return;
  if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
  cloudSyncTimeout = setTimeout(() => {
    syncToCloud();
  }, delayMs);
}

function switchSyncTab(tab) {
  const tabs = ['login', 'register', 'account'];
  tabs.forEach(t => {
    const btn = document.getElementById(`sync-tab-btn-${t}`);
    const view = document.getElementById(`sync-view-${t}`);
    if (btn) btn.classList.toggle('active', t === tab);
    if (view) view.style.display = (t === tab) ? 'block' : 'none';
  });

  const msgEl = document.getElementById('sync-modal-msg');
  if (msgEl) msgEl.style.display = 'none';

  if (tab === 'account') {
    const emailEl = document.getElementById('sync-manage-current-email');
    if (emailEl) emailEl.textContent = currentEmail || 'Sin Sesión';
    const lockEl = document.getElementById('sync-manage-lock-status');
    if (lockEl) {
      lockEl.textContent = currentPasswordHash ? '🔒 Protegida con Contraseña' : (currentEmail ? '🔓 Sin Contraseña' : '⚪ Desconectado');
      lockEl.style.color = currentPasswordHash ? '#84cc16' : '#94a3b8';
    }
    const timeEl = document.getElementById('sync-manage-last-time');
    if (timeEl) timeEl.textContent = lastCloudTimestampText || '--';
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
  const displayEmail = isLogged ? currentEmail : 'Sin Sesión (Modo local)';

  const userEl = document.getElementById('banner-sync-user');
  if (userEl) userEl.textContent = displayEmail;

  const activeLabel = document.getElementById('sync-active-label');
  if (activeLabel) activeLabel.textContent = isLogged ? currentEmail : 'Ninguna (Sesión cerrada)';

  const manageEmail = document.getElementById('sync-manage-current-email');
  if (manageEmail) manageEmail.textContent = displayEmail;

  const inputEmail = document.getElementById('sync-input-email');
  if (inputEmail && !inputEmail.value && isLogged) inputEmail.value = currentEmail;

  const pillLabel = document.getElementById('sync-pill-label');
  if (pillLabel) {
    pillLabel.textContent = isLogged ? currentEmail.split('@')[0] : 'Conectar cuenta';
  }
  const pillDot = document.getElementById('sync-pill-dot');
  if (pillDot) {
    pillDot.style.background = isLogged ? dotColor : '#94a3b8';
  }

  const statusEl = document.getElementById('banner-sync-status');
  if (statusEl) {
    statusEl.textContent = isLogged ? statusText : 'Desconectado';
    statusEl.style.color = isLogged ? dotColor : '#94a3b8';
  }

  const dotEl = document.getElementById('banner-sync-dot');
  if (dotEl) {
    dotEl.style.background = isLogged ? dotColor : '#94a3b8';
  }

  const timeEl = document.getElementById('banner-sync-time');
  const modalTimeEl = document.getElementById('sync-modal-last-time');
  const manageTimeEl = document.getElementById('sync-manage-last-time');
  const timeToShow = lastCloudTimestampText || (isLogged ? new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }) : '--');
  if (timeEl) timeEl.textContent = isLogged ? timeToShow : '';
  if (modalTimeEl) modalTimeEl.textContent = timeToShow;
  if (manageTimeEl) manageTimeEl.textContent = timeToShow;

  const badge = document.getElementById('sync-status-badge');
  if (badge) {
    badge.textContent = isLogged ? (currentPasswordHash ? 'Protegida con Contraseña' : 'Conectado') : 'Desconectado';
    badge.style.color = isLogged ? '#10b981' : '#94a3b8';
    badge.style.background = isLogged ? 'rgba(16,185,129,0.15)' : 'rgba(148, 163, 184, 0.15)';
  }

  const lockBadge = document.getElementById('banner-lock-badge');
  if (lockBadge) {
    lockBadge.style.display = isLogged ? 'inline-block' : 'none';
    if (isLogged) {
      lockBadge.textContent = currentPasswordHash ? '🔒 Protegida' : '☁️ Conectado';
      lockBadge.style.color = currentPasswordHash ? '#84cc16' : '#10b981';
    }
  }

  const settingsSyncAcc = document.getElementById('settings-sync-account-label');
  if (settingsSyncAcc) {
    settingsSyncAcc.textContent = displayEmail;
  }
}

async function initCloudSync() {
  if (!currentEmail) {
    updateSyncUI('Desconectado', '#94a3b8');
    return;
  }
  updateSyncUI('Sincronizando...', '#f59e0b');

  if (!currentObjectId) {
    currentObjectId = await resolveUserCloudId(currentEmail, currentPasswordHash);
    saveStoredAuth(currentEmail, currentPasswordHash, currentObjectId);
  }

  if (!currentObjectId) {
    updateSyncUI('Conectado', '#10b981');
    return;
  }

  let cloudApplied = false;
  try {
    const res = await fetch(CLOUD_API_BASE + '/' + currentObjectId + '?t=' + Date.now());
    if (res.ok) {
      const obj = await res.json();
      const cloudData = obj.data;
      const localTime = Number(localStorage.getItem('hipoteca_last_updated_time')) || 0;
      if (cloudData && cloudData.updatedAt && (Array.isArray(cloudData.payments) || cloudData.settings)) {
        if (cloudData.updatedAt > localTime) {
          applyCloudData(cloudData);
          cloudApplied = true;
        } else if (localTime > cloudData.updatedAt) {
          await syncToCloud();
          cloudApplied = true;
        } else {
          cloudApplied = true;
        }
      }
    }
  } catch (err) {}

  if (!cloudApplied) {
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
  if (!currentEmail || !currentObjectId) return;

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
    settings,
    revisions,
    payments
  };

  try {
    const res = await fetch(CLOUD_API_BASE + '/' + currentObjectId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'hipoteca_user_' + currentEmail,
        data: payload
      })
    });
    if (res.ok) {
      updateSyncUI('● En Tiempo Real', '#10b981');
    }
  } catch (err) {
    console.warn("Cloud sync notice:", err);
  }

  if (window.firebaseSync && window.firebaseSync.db) {
    try {
      const { db, doc, setDoc } = window.firebaseSync;
      const userDocId = sanitizeSyncKey(currentEmail);
      const docRef = doc(db, 'mortgages', userDocId);
      setDoc(docRef, payload, { merge: true }).catch(() => {});
    } catch(e) {}
  }
}

function startRealtimePoller() {
  if (realtimePollInterval) {
    clearInterval(realtimePollInterval);
    realtimePollInterval = null;
  }
  if (!currentEmail || !currentObjectId) return;

  realtimePollInterval = setInterval(async () => {
    if (isSyncingIncoming) return;
    if (!currentEmail || !currentObjectId) return;

    try {
      const res = await fetch(CLOUD_API_BASE + '/' + currentObjectId + '?t=' + Date.now());
      if (res.ok) {
        const obj = await res.json();
        const data = obj.data;
        const localTime = Number(localStorage.getItem('hipoteca_last_updated_time')) || localLastSyncTime;
        if (data && data.updatedAt && data.updatedAt > (localTime + 500)) {
          if (Array.isArray(data.payments) || data.settings) {
            applyCloudData(data);
          }
        }
      }
    } catch (err) {}
  }, 2500);
}

async function triggerManualSync() {
  if (!currentEmail) {
    openSyncModal('login');
    showToast('Inicia sesión para sincronizar tus datos con la nube');
    return;
  }

  const icon = document.getElementById('sync-spin-icon');
  if (icon) icon.classList.add('spin-active');
  updateSyncUI('Sincronizando...', '#f59e0b');

  if (!currentObjectId) {
    currentObjectId = await resolveUserCloudId(currentEmail, currentPasswordHash);
    saveStoredAuth(currentEmail, currentPasswordHash, currentObjectId);
  }

  let success = false;
  try {
    const res = await fetch(CLOUD_API_BASE + '/' + currentObjectId + '?t=' + Date.now());
    if (res.ok) {
      const obj = await res.json();
      const cloudData = obj.data;
      const localTime = Number(localStorage.getItem('hipoteca_last_updated_time')) || 0;
      if (cloudData && cloudData.updatedAt && cloudData.updatedAt > localTime && (Array.isArray(cloudData.payments) || cloudData.settings)) {
        applyCloudData(cloudData);
        showToast('Sincronizado desde la nube (' + payments.length + ' meses)');
      } else {
        await syncToCloud();
        showToast('Sincronizados ' + payments.length + ' meses en la nube');
      }
      success = true;
    }
  } catch (e) {}

  if (!success) {
    await syncToCloud();
    showToast('Guardados ' + payments.length + ' meses en la nube');
  }

  if (icon) icon.classList.remove('spin-active');
  updateSyncUI('● En Tiempo Real', '#10b981');
}

function openSyncModal(defaultTab) {
  const chosenTab = defaultTab || (currentEmail ? 'account' : 'login');
  switchSyncTab(chosenTab);

  const emailInput = document.getElementById('sync-input-email');
  if (emailInput) emailInput.value = currentEmail;

  const pwdInput = document.getElementById('sync-input-password');
  if (pwdInput) pwdInput.value = '';

  const activeLabel = document.getElementById('sync-active-label');
  if (activeLabel) activeLabel.textContent = currentEmail || 'Ninguna (Sesión cerrada)';

  const modalTimeEl = document.getElementById('sync-modal-last-time');
  if (modalTimeEl) modalTimeEl.textContent = lastCloudTimestampText || '--';

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

/* ==========================================================
   AUTHENTICATION: LOGIN
   ========================================================== */
async function handleSyncLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById('sync-input-email');
  const pwdInput = document.getElementById('sync-input-password');

  const rawEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const pwd = pwdInput ? pwdInput.value.trim() : '';

  if (!rawEmail) {
    showSyncModalMsg('Introduce un correo electrónico o usuario.', 'error');
    return;
  }

  const pwdHash = pwd ? hashPassword(pwd) : '';
  showSyncModalMsg('Conectando a la nube...', 'info');

  try {
    const objectId = await resolveUserCloudId(rawEmail, pwdHash);
    if (!objectId) {
      showSyncModalMsg('No se pudo conectar con el servidor en la nube.', 'error');
      return;
    }

    currentEmail = rawEmail;
    currentPasswordHash = pwdHash;
    currentObjectId = objectId;
    saveStoredAuth(rawEmail, pwdHash, objectId);

    const res = await fetch(CLOUD_API_BASE + '/' + objectId + '?t=' + Date.now());
    if (res.ok) {
      const obj = await res.json();
      const cloudData = obj.data;
      if (cloudData && cloudData.passwordHash && pwdHash && cloudData.passwordHash !== pwdHash) {
        showSyncModalMsg('❌ Contraseña incorrecta para esta cuenta.', 'error');
        return;
      }
      if (cloudData) {
        applyCloudData(cloudData);
      }
    } else {
      loadStateFromStorage();
    }

    recomputeBalances();
    updateDashboardUI();
    renderHistoryTable();
    renderRevisionsTable();
    updateSyncUI('● En Tiempo Real', '#10b981');
    closeSyncModal();
    switchTab('dashboard');
    showToast('Conectado como ' + rawEmail);

    startRealtimePoller();
  } catch (err) {
    showSyncModalMsg('Error al conectar: ' + err.message, 'error');
  }
}

/* ==========================================================
   AUTHENTICATION: CREATE NEW USER
   ========================================================== */
async function handleCreateUser(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById('sync-reg-email');
  const pwdInput = document.getElementById('sync-reg-password');
  const confirmInput = document.getElementById('sync-reg-confirm');

  const rawEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const pwd = pwdInput ? pwdInput.value.trim() : '';
  const confirmPwd = confirmInput ? confirmInput.value.trim() : '';

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

  const pwdHash = pwd ? hashPassword(pwd) : '';
  showSyncModalMsg('Creando cuenta en la nube...', 'info');

  try {
    const objectId = await resolveUserCloudId(rawEmail, pwdHash);
    if (!objectId) {
      showSyncModalMsg('No se pudo crear la cuenta en la nube.', 'error');
      return;
    }

    currentEmail = rawEmail;
    currentPasswordHash = pwdHash;
    currentObjectId = objectId;
    saveStoredAuth(rawEmail, pwdHash, objectId);

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
      await fetch(CLOUD_API_BASE + '/' + currentObjectId, { method: 'DELETE' }).catch(() => {});

      const regRes = await fetch(CLOUD_API_BASE + '/' + MASTER_REGISTRY_ID + '?t=' + Date.now());
      if (regRes.ok) {
        const regObj = await regRes.json();
        const regData = regObj.data || {};
        if (regData.users && regData.users[currentEmail]) {
          delete regData.users[currentEmail];
          regData.updatedAt = Date.now();
          await fetch(CLOUD_API_BASE + '/' + MASTER_REGISTRY_ID, {
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

async function handleChangePassword(e) {
  if (e && e.preventDefault) e.preventDefault();
  const newPwdInput = document.getElementById('pwd-new');
  const confirmPwdInput = document.getElementById('pwd-confirm');

  const newPwd = newPwdInput ? newPwdInput.value.trim() : '';
  const confirmPwd = confirmPwdInput ? confirmPwdInput.value.trim() : '';

  if (!newPwd || newPwd.length < 4) {
    showSyncModalMsg('La nueva contraseña debe tener al menos 4 caracteres.', 'error');
    return;
  }
  if (newPwd !== confirmPwd) {
    showSyncModalMsg('❌ Las contraseñas nuevas no coinciden.', 'error');
    return;
  }

  currentPasswordHash = hashPassword(newPwd);
  saveStoredAuth(currentEmail, currentPasswordHash, currentObjectId);
  await syncToCloud();

  if (document.getElementById('pwd-old')) document.getElementById('pwd-old').value = '';
  if (newPwdInput) newPwdInput.value = '';
  if (confirmPwdInput) confirmPwdInput.value = '';

  showSyncModalMsg('✅ ¡Contraseña establecida con éxito!', 'success');
  showToast('🔐 Contraseña guardada correctamente');
}

function handleQuickUnlock() {
  const emailInput = document.getElementById('sync-input-email');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : currentEmail;
  if (!email) {
    showSyncModalMsg('Introduce el correo electrónico a restablecer.', 'error');
    return;
  }
  currentEmail = email;
  currentPasswordHash = '';
  saveStoredAuth(email, '', currentObjectId);
  showToast('Acceso desbloqueado sin contraseña');
  handleSyncLogin();
}

function exportSyncCode() {
  try {
    const bundle = {
      appName: 'Hipoteca Compartida',
      exportedAt: Date.now(),
      settings,
      revisions,
      payments
    };
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(bundle))));
    navigator.clipboard.writeText(code).then(() => {
      showToast('📋 Código de sincronización copiado al portapapeles');
      alert("¡Código de sincronización copiado!\n\nPuedes pegarlo en cualquier otro dispositivo para sincronizar tus datos al instante.");
    }).catch(() => {
      prompt('Copia este código de sincronización y pégalo en tu otro dispositivo:', code);
    });
  } catch (err) {
    alert('Error al generar código: ' + err.message);
  }
}

function importSyncCodePrompt() {
  const code = prompt('Pega aquí el código de sincronización copiado desde tu otro dispositivo:');
  if (!code) return;
  try {
    const jsonStr = decodeURIComponent(escape(atob(code.trim())));
    const bundle = JSON.parse(jsonStr);
    if (bundle && (Array.isArray(bundle.payments) || bundle.settings)) {
      applyCloudData(bundle);
      showToast('✅ Sincronizados ' + payments.length + ' meses');
      closeSyncModal();
    } else {
      alert('El código introducido no contiene datos válidos.');
    }
  } catch (err) {
    alert('Código de sincronización inválido o corrupto.');
  }
}

function downloadBackupJSON() {
  try {
    const bundle = {
      appName: 'Hipoteca Compartida',
      exportedAt: Date.now(),
      dateText: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
      totalMonths: payments.length,
      settings,
      revisions,
      payments
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hipoteca_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 Copia de seguridad JSON descargada');
  } catch (err) {
    alert('Error al descargar copia: ' + err.message);
  }
}
