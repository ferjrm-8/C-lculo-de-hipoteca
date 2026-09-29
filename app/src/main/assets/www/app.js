// ==========================================================================
// HIPOTECA Y CUENTAS CONJUNTAS LAURA & RAK - MOTOR DE CÁLCULO Y GESTIÓN
// ==========================================================================

const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

let settings = {
  initialCapital: 121766.32,
  totalTermYears: 25,
  annualInterestRate: 1.85,
  coOwner1Name: "Laura",
  coOwner2Name: "Rak",
  coOwner1Percentage: 32.27,
  coOwner2Percentage: 67.73,
  internalDebtLaura: 71500.0,
  internalDebtRak: 53500.0
};

let revisions = [
  {
    id: 1,
    name: "Periodo Inicial (Nov 2020)",
    startYear: 2020,
    startMonth: 11,
    capTotal: 121766.32,
    capLaura: 39294.00,
    pctLaura: 32.27,
    feeTotal: 513.81,
    intTotal: 187.69,
    prinTotal: 326.12,
    lauraFee: 165.81,
    rakFee: 348.00,
    lauraInt: 60.57,
    lauraPrin: 105.24
  },
  {
    id: 2,
    name: "1ª Rev. 30 Noviembre 2022",
    startYear: 2022,
    startMonth: 12,
    capTotal: 114200.00,
    capLaura: 36850.00,
    pctLaura: 32.27,
    feeTotal: 513.81,
    intTotal: 176.00,
    prinTotal: 337.81,
    lauraFee: 165.81,
    rakFee: 348.00,
    lauraInt: 56.80,
    lauraPrin: 109.01
  },
  {
    id: 3,
    name: "2ª Rev. 1 Febrero 2023",
    startYear: 2023,
    startMonth: 2,
    capTotal: 113500.00,
    capLaura: 36626.00,
    pctLaura: 32.27,
    feeTotal: 560.20,
    intTotal: 210.00,
    prinTotal: 350.20,
    lauraFee: 180.78,
    rakFee: 379.42,
    lauraInt: 67.77,
    lauraPrin: 113.01
  },
  {
    id: 4,
    name: "3ª Rev. 1 Julio/Agosto 2023",
    startYear: 2023,
    startMonth: 8,
    capTotal: 111800.00,
    capLaura: 36077.00,
    pctLaura: 32.27,
    feeTotal: 590.45,
    intTotal: 235.00,
    prinTotal: 355.45,
    lauraFee: 190.54,
    rakFee: 399.91,
    lauraInt: 75.83,
    lauraPrin: 114.71
  }
];

let payments = [];

/* ==========================================================
   FIRESTORE CLOUD SYNCHRONIZATION (SEGUIMIENTO SOLAR PATTERN)
   ========================================================== */
const DEFAULT_SYNC_KEY = 'mi_sistema_hipoteca';
let currentSyncKey = DEFAULT_SYNC_KEY;
let firestoreUnsubscribe = null;

function sanitizeSyncKey(val) {
  if (!val) return DEFAULT_SYNC_KEY;
  return val.trim().toLowerCase().replace(/[\/\\#\$\.\[\]]/g, '_') || DEFAULT_SYNC_KEY;
}

function getSyncKey() {
  try {
    return sanitizeSyncKey(localStorage.getItem('mortgage_sync_key') || DEFAULT_SYNC_KEY);
  } catch (e) {
    return DEFAULT_SYNC_KEY;
  }
}

function setSyncKey(val) {
  const clean = sanitizeSyncKey(val);
  try {
    localStorage.setItem('mortgage_sync_key', clean);
  } catch (e) {}
  currentSyncKey = clean;
  updateSyncUI();
  connectFirestoreSync(clean);
}

window.addEventListener('DOMContentLoaded', () => {
  currentSyncKey = getSyncKey();
  loadStateFromStorage();
  updateDashboardUI();
  updateSyncUI();

  if (window.firebaseSync && window.firebaseSync.db) {
    connectFirestoreSync(currentSyncKey);
  } else {
    window.addEventListener('firebase-sync-ready', () => {
      connectFirestoreSync(currentSyncKey);
    });
  }
});

function loadStateFromStorage() {
  try {
    const storedCfg = localStorage.getItem('hipoteca_cfg_v6');
    if (storedCfg) settings = { ...settings, ...JSON.parse(storedCfg) };

    const storedRevs = localStorage.getItem('hipoteca_revs_v6');
    if (storedRevs) revisions = JSON.parse(storedRevs) || revisions;

    const storedData = localStorage.getItem('hipoteca_payments_v6');
    if (storedData !== null) {
      payments = JSON.parse(storedData) || [];
    } else {
      // Intenta migrar de v5 si existía
      const oldV5 = localStorage.getItem('hipoteca_payments_v5');
      if (oldV5) payments = JSON.parse(oldV5) || [];
      else payments = [];
      saveStateToStorage();
    }
  } catch (err) {
    payments = [];
  }
  recomputeBalances();
}

function saveStateToStorage() {
  try {
    localStorage.setItem('hipoteca_cfg_v6', JSON.stringify(settings));
    localStorage.setItem('hipoteca_revs_v6', JSON.stringify(revisions));
    localStorage.setItem('hipoteca_payments_v6', JSON.stringify(payments));
  } catch (err) {}
  syncToFirestoreIfAvailable();
}

function getOriginalExcelSeed() {
  const rows = [
    { y: 2020, m: 11, dep: 500, luz: 25.41, seg: 190.58, n: "Seguro anual" },
    { y: 2020, m: 12, dep: 500, luz: 28.10 },
    { y: 2021, m: 1, dep: 500, luz: 24.25 },
    { y: 2021, m: 2, dep: 500, luz: 22.98 },
    { y: 2021, m: 3, dep: 500, luz: 25.91 },
    { y: 2021, m: 4, dep: 0, luz: 32.74 },
    { y: 2021, m: 5, dep: 500, luz: 29.80 },
    { y: 2021, m: 6, dep: 500, luz: 40.40 },
    { y: 2021, m: 7, dep: 500, luz: 69.37, ext: 60.20 },
    { y: 2021, m: 8, dep: 500, luz: 77.64 },
    { y: 2021, m: 9, dep: 0, luz: 78.66 },
    { y: 2021, m: 10, dep: 0, luz: 87.73, ibi: 184.53, n: "IBI" },
    { y: 2021, m: 11, dep: 1500, luz: 102.94, ext: 271.56, n: "Extra + Seguro" },
    { y: 2021, m: 12, dep: 500, luz: 85.00 },
    { y: 2022, m: 1, dep: 500, luz: 45.00 },
    { y: 2022, m: 2, dep: 500, luz: 48.00 },
    { y: 2022, m: 3, dep: 500, luz: 52.00 },
    { y: 2022, m: 4, dep: 500, luz: 40.00 },
    { y: 2022, m: 5, dep: 500, luz: 38.00 },
    { y: 2022, m: 6, dep: 500, luz: 42.00 },
    { y: 2022, m: 7, dep: 500, luz: 65.00 },
    { y: 2022, m: 8, dep: 500, luz: 70.00 },
    { y: 2022, m: 9, dep: 500, luz: 60.00 },
    { y: 2022, m: 10, dep: 500, luz: 62.00, ibi: 190.00 },
    { y: 2022, m: 11, dep: 500, luz: 80.00, seg: 195.00 },
    { y: 2022, m: 12, dep: 500, luz: 90.00 },
    { y: 2023, m: 1, dep: 500, luz: 55.00 },
    { y: 2023, m: 2, dep: 500, luz: 50.00 },
    { y: 2023, m: 3, dep: 500, luz: 48.00 },
    { y: 2023, m: 4, dep: 500, luz: 45.00 },
    { y: 2023, m: 5, dep: 500, luz: 40.00 },
    { y: 2023, m: 6, dep: 1000, luz: 50.00, extAmort: 1500, n: "Amortización extra 1500€" },
    { y: 2023, m: 7, dep: 500, luz: 75.00 },
    { y: 2023, m: 8, dep: 500, luz: 80.00 },
    { y: 2023, m: 9, dep: 500, luz: 65.00 },
    { y: 2023, m: 10, dep: 500, luz: 70.00, ibi: 195.00 },
    { y: 2023, m: 11, dep: 500, luz: 85.00, seg: 200.00 },
    { y: 2023, m: 12, dep: 500, luz: 95.00 },
    { y: 2024, m: 1, dep: 500, luz: 60.00 },
    { y: 2024, m: 2, dep: 500, luz: 58.00 },
    { y: 2024, m: 3, dep: 500, luz: 55.00 },
    { y: 2024, m: 4, dep: 500, luz: 50.00 },
    { y: 2024, m: 5, dep: 500, luz: 45.00 },
    { y: 2024, m: 6, dep: 500, luz: 52.00 },
    { y: 2024, m: 7, dep: 500, luz: 78.00 },
    { y: 2024, m: 8, dep: 500, luz: 82.00 },
    { y: 2024, m: 9, dep: 500, luz: 68.00 },
    { y: 2024, m: 10, dep: 500, luz: 72.00, ibi: 200.00 },
    { y: 2024, m: 11, dep: 500, luz: 90.00, seg: 205.00 },
    { y: 2024, m: 12, dep: 500, luz: 98.00 },
    { y: 2025, m: 1, dep: 500, luz: 65.00 },
    { y: 2025, m: 2, dep: 500, luz: 60.00 },
    { y: 2025, m: 3, dep: 500, luz: 58.00 },
    { y: 2025, m: 4, dep: 500, luz: 52.00 },
    { y: 2025, m: 5, dep: 500, luz: 48.00 },
    { y: 2025, m: 6, dep: 500, luz: 55.00 },
    { y: 2025, m: 7, dep: 500, luz: 80.00 },
    { y: 2025, m: 8, dep: 500, luz: 85.00 },
    { y: 2025, m: 9, dep: 500, luz: 70.00 },
    { y: 2025, m: 10, dep: 500, luz: 75.00, ibi: 205.00 },
    { y: 2025, m: 11, dep: 500, luz: 92.00, seg: 210.00 },
    { y: 2025, m: 12, dep: 500, luz: 100.00 },
    { y: 2026, m: 1, dep: 500, luz: 68.00 },
    { y: 2026, m: 2, dep: 500, luz: 62.00 },
    { y: 2026, m: 3, dep: 500, luz: 60.00 },
    { y: 2026, m: 4, dep: 500, luz: 55.00 },
    { y: 2026, m: 5, dep: 500, luz: 50.00 },
    { y: 2026, m: 6, dep: 500, luz: 58.00 },
    { y: 2026, m: 7, dep: 500, luz: 82.00 },
    { y: 2026, m: 8, dep: 500, luz: 88.00 },
    { y: 2026, m: 9, dep: 500, luz: 72.00 }
  ];

  let bal = settings.initialCapital;
  const rate = settings.annualInterestRate / 100 / 12;

  return rows.map((r, idx) => {
    const rev = getActiveRevisionForDate(r.y, r.m);
    const fee = rev ? rev.feeTotal : 513.81;
    const interest = bal * rate;
    const principal = Math.max(0, fee - interest);
    const extra = r.extAmort || 0;
    bal = Math.max(0, bal - (principal + extra));

    const pct = rev ? rev.pctLaura : (settings.coOwner1Percentage || 32.27);
    const co1 = fee * (pct / 100);
    const co2 = Math.max(0, fee - co1);

    return {
      id: idx + 1,
      year: r.y,
      month: r.m,
      totalFee: fee,
      co1: co1,
      co2: co2,
      interest: interest,
      principal: principal,
      extra: extra,
      community: 81.0,
      electricity: r.luz,
      derramas: 0.0,
      insurance: r.seg || 0,
      ibi: r.ibi || 0,
      otherExtra: r.ext || 0,
      deposit: r.dep,
      notes: r.n || "Cuota ordinaria",
      remaining: bal
    };
  });
}

function recomputeBalances() {
  let bal = settings.initialCapital;
  let accBal = 0;

  payments.sort((a, b) => (a.year - b.year) || (a.month - b.month));

  payments.forEach(p => {
    const prin = Number(p.principal) || 0;
    const ext = Number(p.extra) || 0;
    bal = Math.max(0, bal - (prin + ext));
    p.remaining = bal;

    const co1 = Number(p.co1) || 0;
    const com = Number(p.community) || 0;
    const luz = Number(p.electricity) || 0;
    const derr = Number(p.derramas) || 0;
    const ins = Number(p.insurance) || 0;
    const ibi = Number(p.ibi) || 0;
    const other = Number(p.otherExtra) || 0;

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

  const remaining = latest ? latest.remaining : settings.initialCapital;
  const amortized = Math.max(0, settings.initialCapital - remaining);
  const pct = settings.initialCapital > 0 ? (amortized / settings.initialCapital) * 100 : 0;

  const fee = latest ? latest.totalFee : (revisions[0] ? revisions[0].feeTotal : 0);
  const pctLaura = settings.coOwner1Percentage || 32.27;
  const pctRak = settings.coOwner2Percentage || (100 - pctLaura);
  const lauraFee = latest ? latest.co1 : (fee * (pctLaura / 100));
  const rakFee = latest ? latest.co2 : (fee - lauraFee);

  if (document.getElementById('kpi-remaining')) document.getElementById('kpi-remaining').textContent = fmt(remaining);
  if (document.getElementById('kpi-progress-bar')) document.getElementById('kpi-progress-bar').style.width = Math.min(100, pct) + '%';

  if (document.getElementById('kpi-total-fee')) document.getElementById('kpi-total-fee').textContent = fmt(fee);
  if (document.getElementById('kpi-fee-laura')) document.getElementById('kpi-fee-laura').textContent = fmt(lauraFee);
  if (document.getElementById('kpi-fee-rak')) document.getElementById('kpi-fee-rak').textContent = fmt(rakFee);

  // Laura Desfase KPIs
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
      statusElem.textContent = "Sin meses registrados todavía";
      statusElem.style.color = "var(--text-muted)";
    } else {
      statusElem.textContent = accBal >= 0 
        ? "Saldo acumulado a favor de Laura (+)" 
        : "Laura tiene saldo pendiente de regularizar (-)";
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
    document.getElementById('kpi-laura-remaining').textContent = fmt(remaining * (pctLaura / 100));
  }

  // Co-owners agreement dynamic percentages
  if (document.getElementById('laura-pct-label')) {
    document.getElementById('laura-pct-label').textContent = pctLaura.toFixed(2).replace('.', ',') + '%';
    document.getElementById('rak-pct-label').textContent = pctRak.toFixed(2).replace('.', ',') + '%';
    document.getElementById('laura-share-fee-label').textContent = fmt(lauraFee);
    document.getElementById('rak-share-fee-label').textContent = fmt(rakFee);
    document.getElementById('split-track-laura').style.width = pctLaura + '%';
    document.getElementById('split-track-rak').style.width = pctRak + '%';
  }

  // 3 Revisions boxes on Dashboard (from real stored revisions)
  const rNov = revisions.find(r => r.startMonth === 11 || r.startMonth === 12) || revisions[0];
  const rFeb = revisions.find(r => r.startMonth >= 2 && r.startMonth <= 5) || revisions[1];
  const rJul = revisions.find(r => r.startMonth >= 6 && r.startMonth <= 9) || revisions[2];

  if (rNov && document.getElementById('rev1-full-fee')) {
    document.getElementById('rev1-full-fee').textContent = fmt(rNov.feeTotal);
    document.getElementById('rev1-laura-fee').textContent = fmt(rNov.lauraFee);
    document.getElementById('rev1-rak-fee').textContent = fmt(rNov.rakFee);
  }
  if (rFeb && document.getElementById('rev2-full-fee')) {
    document.getElementById('rev2-full-fee').textContent = fmt(rFeb.feeTotal);
    document.getElementById('rev2-laura-fee').textContent = fmt(rFeb.lauraFee);
    document.getElementById('rev2-rak-fee').textContent = fmt(rFeb.rakFee);
  }
  if (rJul && document.getElementById('rev3-full-fee')) {
    document.getElementById('rev3-full-fee').textContent = fmt(rJul.feeTotal);
    document.getElementById('rev3-laura-fee').textContent = fmt(rJul.lauraFee);
    document.getElementById('rev3-rak-fee').textContent = fmt(rJul.rakFee);
  }

  document.getElementById('val-debt-laura').textContent = fmt(settings.internalDebtLaura || 0);
  document.getElementById('val-debt-rak').textContent = fmt(settings.internalDebtRak || 0);

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

    const dBtn = document.getElementById('d-btn-' + t);
    if (dBtn) dBtn.classList.toggle('active', t === tabId);

    const mBtn = document.getElementById('m-btn-' + t);
    if (mBtn) mBtn.classList.toggle('active', t === tabId);
  });

  if (tabId === 'dashboard') {
    setTimeout(drawFinancialCharts, 60);
  }
}

/* Financial Canvas Charts */
function drawFinancialCharts() {
  drawAmortizationCurveChart();
  drawMonthlyBreakdownChart();
}

function drawAmortizationCurveChart() {
  const canvas = document.getElementById('amortCurveCanvas');
  if (!canvas || !canvas.parentElement) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight || 240;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  if (payments.length < 2) {
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Registra varios meses para visualizar la curva de saldo", w / 2, h / 2);
    return;
  }

  const pad = { top: 20, right: 15, bottom: 25, left: 45 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const maxVal = Math.max(settings.initialCapital, ...payments.map(p => p.remaining || 0));

  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748b';
  ctx.font = '10px -apple-system, sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * (i / 4));
    const val = maxVal - (maxVal * (i / 4));
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillText(Math.round(val / 1000) + 'k€', pad.left - 6, y + 3);
  }

  // Gradient
  ctx.beginPath();
  payments.forEach((p, i) => {
    const x = pad.left + (i / (payments.length - 1)) * plotW;
    const normY = (p.remaining || 0) / maxVal;
    const y = pad.top + plotH - (normY * plotH);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  ctx.lineTo(w - pad.right, pad.top + plotH);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  payments.forEach((p, i) => {
    const x = pad.left + (i / (payments.length - 1)) * plotW;
    const normY = (p.remaining || 0) / maxVal;
    const y = pad.top + plotH - (normY * plotH);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawMonthlyBreakdownChart() {
  const canvas = document.getElementById('breakdownMonthlyCanvas');
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
    tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; padding: 32px; color: var(--text-muted);">No se encontraron mensualidades. Pulsa "+ Añadir Mes" para registrar.</td></tr>';
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
      <td style="color: #f43f5e; font-weight: 700;">${fmt(p.totalExpenses)}</td>
      <td style="font-weight: 700; color: ${gapColor};">${p.monthGap >= 0 ? '+' : ''}${fmt(p.monthGap)}</td>
      <td style="font-weight: 800; font-size: 13px; color: ${accColor}; background: ${p.accBalance >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'}; border-radius: 6px; padding: 6px 10px;">${p.accBalance >= 0 ? '+' : ''}${fmt(p.accBalance)}</td>
      <td style="color: var(--text-muted); font-size: 11px;">${fmt(p.totalFee)}</td>
      <td style="color: var(--secondary); font-size: 11px;">${fmt((p.remaining || 0) * ((settings.coOwner1Percentage || 32.27)/100))}</td>
      <td style="text-align: center;">
        <button onclick="openEditModal(${p.id})" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px;">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ==========================================================
   REVISIONS MANAGER (NOVIEMBRE, FEBRERO, JULIO...)
   ========================================================== */
function renderRevisionsTable() {
  const tbody = document.getElementById('revisions-table-body');
  if (!tbody) return;

  const sorted = [...revisions].sort((a, b) => (b.startYear - a.startYear) || (b.startMonth - a.startMonth));
  tbody.innerHTML = '';

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; padding: 24px; color: var(--text-muted);">No hay periodos de revisión creados. Pulsa "+ Añadir Periodo".</td></tr>';
    return;
  }

  sorted.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${MONTH_LABELS[r.startMonth - 1]} ${r.startYear}</strong></td>
      <td style="font-weight: 700; color: #fff;">${r.name}</td>
      <td>${fmt(r.capTotal)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(r.capLaura)}</td>
      <td style="color: var(--primary); font-weight: 800;">${r.pctLaura.toFixed(2)}%</td>
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
  document.getElementById('rev-modal-title').textContent = id ? "Editar Periodo de Revisión" : "Añadir Periodo de Revisión";

  if (id) {
    const r = revisions.find(x => x.id === id);
    if (r) {
      document.getElementById('rev-name').value = r.name;
      document.getElementById('rev-start-year').value = r.startYear;
      document.getElementById('rev-start-month').value = r.startMonth;
      document.getElementById('rev-cap-total').value = r.capTotal;
      document.getElementById('rev-cap-laura').value = r.capLaura;
      document.getElementById('rev-pct-laura').value = r.pctLaura;
      document.getElementById('rev-fee-total').value = r.feeTotal;
      document.getElementById('rev-int-total').value = r.intTotal;
    }
  } else {
    document.getElementById('rev-name').value = "Revisión " + MONTH_LABELS[(new Date()).getMonth()] + " " + (new Date()).getFullYear();
    document.getElementById('rev-start-year').value = (new Date()).getFullYear();
    document.getElementById('rev-start-month').value = (new Date()).getMonth() + 1;
    const latestP = payments[payments.length - 1];
    const cap = latestP ? latestP.remaining : settings.initialCapital;
    document.getElementById('rev-cap-total').value = cap.toFixed(2);
    document.getElementById('rev-pct-laura').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
    document.getElementById('rev-cap-laura').value = (cap * ((settings.coOwner1Percentage || 32.27) / 100)).toFixed(2);
    document.getElementById('rev-fee-total').value = (latestP ? latestP.totalFee : 513.81).toFixed(2);
    document.getElementById('rev-int-total').value = (latestP ? latestP.interest : 180.00).toFixed(2);
  }

  updateLiveRevisionPreview();
  document.getElementById('revision-modal').classList.add('active');
}

function closeRevisionModal() {
  document.getElementById('revision-modal').classList.remove('active');
}

function onRevisionCapTotalChange() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const capL = Number(document.getElementById('rev-cap-laura').value) || 0;
  if (capTot > 0 && capL > 0) {
    const pct = (capL / capTot) * 100;
    document.getElementById('rev-pct-laura').value = pct.toFixed(2);
  }
  updateLiveRevisionPreview();
}

function onRevisionCapLauraChange() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const capL = Number(document.getElementById('rev-cap-laura').value) || 0;
  if (capTot > 0) {
    const pct = (capL / capTot) * 100;
    document.getElementById('rev-pct-laura').value = pct.toFixed(2);
  }
  updateLiveRevisionPreview();
}

function onRevisionPctLauraChange() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const pct = Number(document.getElementById('rev-pct-laura').value) || 0;
  if (capTot > 0) {
    const capL = capTot * (pct / 100);
    document.getElementById('rev-cap-laura').value = capL.toFixed(2);
  }
  updateLiveRevisionPreview();
}

function onRevisionFeeChange() {
  updateLiveRevisionPreview();
}

function onRevisionInterestChange() {
  updateLiveRevisionPreview();
}

function updateLiveRevisionPreview() {
  const fee = Number(document.getElementById('rev-fee-total').value) || 0;
  const int = Number(document.getElementById('rev-int-total').value) || 0;
  const prin = Math.max(0, fee - int);
  const pct = Number(document.getElementById('rev-pct-laura').value) || (settings.coOwner1Percentage || 32.27);

  const lauraFee = fee * (pct / 100);
  const rakFee = Math.max(0, fee - lauraFee);
  const lauraInt = int * (pct / 100);
  const lauraPrin = prin * (pct / 100);

  if (document.getElementById('rev-prev-laura-fee')) document.getElementById('rev-prev-laura-fee').textContent = fmt(lauraFee);
  if (document.getElementById('rev-prev-rak-fee')) document.getElementById('rev-prev-rak-fee').textContent = fmt(rakFee);
  if (document.getElementById('rev-prev-laura-int')) document.getElementById('rev-prev-laura-int').textContent = fmt(lauraInt);
  if (document.getElementById('rev-prev-laura-prin')) document.getElementById('rev-prev-laura-prin').textContent = fmt(lauraPrin);
}

function submitRevisionHandler(e) {
  e.preventDefault();
  const editId = document.getElementById('rev-edit-id').value;
  const name = document.getElementById('rev-name').value.trim();
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
    capLaura: capL,
    pctLaura: pctL,
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
    showToast("Periodo de revisión actualizado");
  } else {
    revisions.push(revObj);
    showToast("Nuevo periodo de revisión añadido");
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
    showToast("Periodo de revisión eliminado");
  }
}

function applyRevisionToRange(revId) {
  const rev = revisions.find(x => x.id === revId);
  if (!rev) return;

  if (confirm(`¿Deseas aplicar las cuotas y % de "${rev.name}" a los meses históricos a partir de ${MONTH_LABELS[rev.startMonth-1]} ${rev.startYear}?`)) {
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
    showToast(`Se han actualizado ${count} meses con este periodo`);
  }
}

/* ==========================================================
   MONTH REGISTRATION FORM & REACTIVE BIDIRECTIONAL MATH
   ========================================================== */
function openModal() {
  document.getElementById('modal-title-text').textContent = "Registrar Mes de Laura";
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
    badge.textContent = rev ? `📌 Periodo: ${rev.name} (Laura ${rev.pctLaura.toFixed(2)}%)` : "📌 Periodo General";
  }

  const fee = rev ? rev.feeTotal : (latest ? latest.totalFee : 513.81);
  const pct = rev ? rev.pctLaura : (settings.coOwner1Percentage || 32.27);
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
  document.getElementById('p-deposit').value = (latest ? (latest.deposit || 500) : 500).toFixed(2);
  document.getElementById('p-notes').value = "Cuota ordinaria + gastos piso";

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
    badge.textContent = rev ? `📌 Periodo detectado: ${rev.name} (Laura ${rev.pctLaura.toFixed(2)}%)` : "📌 Periodo General";
  }

  const editId = document.getElementById('p-edit-id').value;
  if (!editId && rev) {
    document.getElementById('p-total-fee').value = rev.feeTotal.toFixed(2);
    document.getElementById('p-laura-pct').value = rev.pctLaura.toFixed(2);
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

function onLauraPctChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const pct = Number(document.getElementById('p-laura-pct').value) || 0;
  const co1 = fee * (pct / 100);
  const co2 = Math.max(0, fee - co1);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = co2.toFixed(2);
  updateLiveModalSummary();
}

function onCuotaLauraChange() {
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

function onCuotaRakChange() {
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
  const dep = Number(document.getElementById('p-deposit')?.value) || 0;

  const totalExp = co1 + com + luz + derr + ins + other;
  const gap = dep - totalExp;

  const sumExpEl = document.getElementById('p-sum-expenses');
  const sumGapEl = document.getElementById('p-sum-gap');
  if (sumExpEl) sumExpEl.textContent = fmt(totalExp);
  if (sumGapEl) {
    sumGapEl.textContent = (gap >= 0 ? '+' : '') + fmt(gap);
    sumGapEl.style.color = gap >= 0 ? 'var(--primary)' : 'var(--red)';
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
    deposit: dep,
    notes
  };

  if (editId) {
    const idx = payments.findIndex(x => x.id == editId);
    if (idx !== -1) payments[idx] = paymentObj;
    showToast("Mes actualizado correctamente");
  } else {
    // Si ya existe un pago para ese mismo año y mes, sobrescribir
    const existingIdx = payments.findIndex(x => x.year === y && x.month === m);
    if (existingIdx !== -1) {
      payments[existingIdx] = { ...paymentObj, id: payments[existingIdx].id };
      showToast("Mes actualizado en el histórico");
    } else {
      payments.push(paymentObj);
      showToast("Nuevo mes guardado en el histórico");
    }
  }

  // Reset filter to 'ALL' so new month is always visible
  const filterYear = document.getElementById('filter-year-select');
  if (filterYear) filterYear.value = 'ALL';
  const filterSearch = document.getElementById('filter-search');
  if (filterSearch) filterSearch.value = '';

  recomputeBalances();
  saveStateToStorage();
  closeModal();
  updateDashboardUI();
}

function deleteCurrentRow() {
  const editId = document.getElementById('p-edit-id').value;
  if (!editId) return;

  if (confirm("¿Estás seguro de que deseas eliminar este registro mensual?")) {
    payments = payments.filter(x => x.id != editId);
    recomputeBalances();
    saveStateToStorage();
    closeModal();
    updateDashboardUI();
    showToast("Registro mensual eliminado");
  }
}

/* ==========================================================
   SETTINGS & AGREEMENT WITH BIDIRECTIONAL DEBT / PERCENTAGE
   ========================================================== */
function fillSettingsInputs() {
  if (document.getElementById('cfg-capital-init')) document.getElementById('cfg-capital-init').value = settings.initialCapital || '';
  if (document.getElementById('cfg-term-years')) document.getElementById('cfg-term-years').value = settings.totalTermYears || '';
  if (document.getElementById('cfg-interest-rate')) document.getElementById('cfg-interest-rate').value = settings.annualInterestRate || '';
  if (document.getElementById('cfg-laura-pct')) document.getElementById('cfg-laura-pct').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
  if (document.getElementById('cfg-rak-pct')) document.getElementById('cfg-rak-pct').value = (settings.coOwner2Percentage || 67.73).toFixed(2);
  if (document.getElementById('cfg-laura-debt')) document.getElementById('cfg-laura-debt').value = settings.internalDebtLaura || '';
  if (document.getElementById('cfg-rak-debt')) document.getElementById('cfg-rak-debt').value = settings.internalDebtRak || '';
}

function syncSettingsDebts() {
  const d1 = Number(document.getElementById('cfg-laura-debt')?.value) || 0;
  const d2 = Number(document.getElementById('cfg-rak-debt')?.value) || 0;
  const tot = d1 + d2;
  if (tot > 0) {
    const p1 = (d1 / tot) * 100;
    const p2 = (d2 / tot) * 100;
    if (document.getElementById('cfg-laura-pct')) document.getElementById('cfg-laura-pct').value = p1.toFixed(2);
    if (document.getElementById('cfg-rak-pct')) document.getElementById('cfg-rak-pct').value = p2.toFixed(2);
  }
}

function syncSettingsPercentages(source) {
  if (source === 'laura') {
    const p1 = Number(document.getElementById('cfg-laura-pct')?.value) || 0;
    if (document.getElementById('cfg-rak-pct')) document.getElementById('cfg-rak-pct').value = Math.max(0, 100 - p1).toFixed(2);
  } else {
    const p2 = Number(document.getElementById('cfg-rak-pct')?.value) || 0;
    if (document.getElementById('cfg-laura-pct')) document.getElementById('cfg-laura-pct').value = Math.max(0, 100 - p2).toFixed(2);
  }
}

function saveSettingsHandler(e) {
  e.preventDefault();
  const cap = document.getElementById('cfg-capital-init')?.value.trim();
  const term = document.getElementById('cfg-term-years')?.value.trim();
  const rate = document.getElementById('cfg-interest-rate')?.value.trim();
  const lPct = document.getElementById('cfg-laura-pct')?.value.trim();
  const rPct = document.getElementById('cfg-rak-pct')?.value.trim();
  const lDebt = document.getElementById('cfg-laura-debt')?.value.trim();
  const rDebt = document.getElementById('cfg-rak-debt')?.value.trim();

  if (cap !== "") settings.initialCapital = Number(cap) || settings.initialCapital;
  if (term !== "") settings.totalTermYears = Number(term) || settings.totalTermYears;
  if (rate !== "") settings.annualInterestRate = Number(rate) || settings.annualInterestRate;
  if (lPct !== "") settings.coOwner1Percentage = Number(lPct) || 32.27;
  if (rPct !== "") settings.coOwner2Percentage = Number(rPct) || (100 - settings.coOwner1Percentage);
  settings.internalDebtLaura = lDebt !== "" ? (Number(lDebt) || 0) : 0;
  settings.internalDebtRak = rDebt !== "" ? (Number(rDebt) || 0) : 0;

  saveStateToStorage();
  recomputeBalances();
  updateDashboardUI();
  showToast("Ajustes guardados correctamente");
}

function openAgreementModal() {
  document.getElementById('agree-pct-laura').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
  document.getElementById('agree-pct-rak').value = (settings.coOwner2Percentage || 67.73).toFixed(2);
  document.getElementById('agree-debt-laura').value = settings.internalDebtLaura || '';
  document.getElementById('agree-debt-rak').value = settings.internalDebtRak || '';
  document.getElementById('agreement-modal').classList.add('active');
}

function closeAgreementModal() {
  document.getElementById('agreement-modal').classList.remove('active');
}

function syncAgreementDebts() {
  const d1 = Number(document.getElementById('agree-debt-laura').value) || 0;
  const d2 = Number(document.getElementById('agree-debt-rak').value) || 0;
  const tot = d1 + d2;
  if (tot > 0) {
    const p1 = (d1 / tot) * 100;
    const p2 = (d2 / tot) * 100;
    document.getElementById('agree-pct-laura').value = p1.toFixed(2);
    document.getElementById('agree-pct-rak').value = p2.toFixed(2);
  }
}

function syncAgreementPercentages(source) {
  if (source === 'laura') {
    const p1 = Number(document.getElementById('agree-pct-laura').value) || 0;
    document.getElementById('agree-pct-rak').value = Math.max(0, (100 - p1)).toFixed(2);
  } else {
    const p2 = Number(document.getElementById('agree-pct-rak').value) || 0;
    document.getElementById('agree-pct-laura').value = Math.max(0, (100 - p2)).toFixed(2);
  }
}

function submitAgreementHandler(e) {
  e.preventDefault();
  const valLaura = document.getElementById('agree-pct-laura').value.trim();
  const valRak = document.getElementById('agree-pct-rak').value.trim();
  const valDebtL = document.getElementById('agree-debt-laura').value.trim();
  const valDebtR = document.getElementById('agree-debt-rak').value.trim();

  let p1 = valLaura !== "" ? Number(valLaura) : (settings.coOwner1Percentage || 32.27);
  let p2 = valRak !== "" ? Number(valRak) : (100 - p1);

  settings.coOwner1Percentage = p1;
  settings.coOwner2Percentage = p2;
  settings.internalDebtLaura = valDebtL !== "" ? (Number(valDebtL) || 0) : 0;
  settings.internalDebtRak = valDebtR !== "" ? (Number(valDebtR) || 0) : 0;

  saveStateToStorage();
  recomputeBalances();
  updateDashboardUI();
  closeAgreementModal();
  showToast("Acuerdo entre copropietarios actualizado");
}

/* ==========================================================
   EXPORT, IMPORT & DATA MANAGEMENT
   ========================================================== */
function exportDataJSON() {
  const blob = new Blob([JSON.stringify({ settings, revisions, payments }, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `hipoteca_conjunta_backup_${Date.now()}.json`);
  showToast("Copia de seguridad JSON exportada");
}

function exportDataCSV() {
  let csv = "Año,Mes,Cuota Banco,Laura,Rak,Intereses,Capital,Comunidad,Luz,Derramas,Seguro_IBI,Otros,Ingreso Laura,Desfase Mes,Desfase Acumulado,Pendiente\n";
  payments.forEach(p => {
    csv += `${p.year},${MONTH_LABELS[p.month-1]},${p.totalFee},${p.co1},${p.co2},${p.interest||0},${p.principal||0},${p.community||0},${p.electricity||0},${p.derramas||0},${(p.insurance||0)+(p.ibi||0)},${p.otherExtra||0},${p.deposit||0},${p.monthGap||0},${p.accBalance||0},${p.remaining||0}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `hipoteca_conjunta_historico_${Date.now()}.csv`);
  showToast("Archivo CSV para Excel exportado");
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const res = JSON.parse(ev.target.result);
      if (res.payments && Array.isArray(res.payments)) {
        payments = res.payments;
        if (res.settings) settings = { ...settings, ...res.settings };
        if (res.revisions && Array.isArray(res.revisions)) revisions = res.revisions;
        recomputeBalances();
        saveStateToStorage();
        updateDashboardUI();
        showToast("Datos importados exitosamente");
      }
    } catch (err) {
      showToast("Error al importar el archivo JSON");
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (confirm("¿Estás seguro de que deseas borrar TODOS los pagos y empezar desde cero? Se vaciará el histórico para que introduzcas tus propios datos.")) {
    payments = [];
    recomputeBalances();
    saveStateToStorage();
    updateDashboardUI();
    showToast("Se han borrado todos los pagos. Listo para empezar.");
  }
}

function resetToExcelOriginal() {
  if (confirm("¿Deseas restablecer todos los datos a la hoja de cálculo original de Laura y Rak?")) {
    settings.initialCapital = 121766.32;
    settings.internalDebtLaura = 71500.0;
    settings.internalDebtRak = 53500.0;
    settings.coOwner1Percentage = 32.27;
    settings.coOwner2Percentage = 67.73;
    payments = getOriginalExcelSeed();
    recomputeBalances();
    saveStateToStorage();
    updateDashboardUI();
    showToast("Datos originales del Excel restaurados");
  }
}

/* ==========================================================
   FIRESTORE MULTI-DEVICE SYNC ENGINE
   ========================================================== */
function updateSyncUI() {
  const isBase = currentSyncKey === DEFAULT_SYNC_KEY;
  
  const pillLabel = document.getElementById('sync-pill-label');
  const pillDot = document.getElementById('sync-pill-dot');
  if (pillLabel) pillLabel.textContent = isBase ? 'Conectar cuenta' : currentSyncKey;
  if (pillDot) pillDot.style.background = isBase ? '#f59e0b' : '#10b981';

  const bannerText = document.getElementById('banner-sync-text');
  const bannerDot = document.getElementById('banner-sync-dot');
  if (bannerText) {
    bannerText.textContent = isBase
      ? "Conectado al sistema base. Pulsa en 'Cambiar Cuenta' para sincronizar con tu propio identificador."
      : `🟢 Conectado a la cuenta: ${currentSyncKey}. Los cambios se sincronizan en tiempo real.`;
  }
  if (bannerDot) bannerDot.style.background = isBase ? '#f59e0b' : '#10b981';

  const modalBadge = document.getElementById('sync-status-badge');
  const activeLabel = document.getElementById('sync-active-label');
  const inputKey = document.getElementById('sync-input-key');
  if (modalBadge) {
    modalBadge.textContent = isBase ? 'Sistema base' : '🟢 Conectado';
    modalBadge.style.background = isBase ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    modalBadge.style.color = isBase ? '#fcd34d' : '#84cc16';
  }
  if (activeLabel) activeLabel.textContent = currentSyncKey;
  if (inputKey && !inputKey.value) inputKey.value = isBase ? '' : currentSyncKey;

  const settingsBadge = document.getElementById('settings-sync-badge');
  if (settingsBadge) {
    settingsBadge.textContent = isBase ? 'Sistema base' : '🟢 Conectado a Firestore';
    settingsBadge.style.color = isBase ? '#fcd34d' : 'var(--primary)';
  }
}

function connectFirestoreSync(key) {
  if (!window.firebaseSync || !window.firebaseSync.db) return;
  const sync = window.firebaseSync;
  const cleanKey = sanitizeSyncKey(key);

  if (firestoreUnsubscribe) {
    try { firestoreUnsubscribe(); } catch(e) {}
    firestoreUnsubscribe = null;
  }

  try {
    const docRef = sync.doc(sync.db, "shared_mortgages", cleanKey);
    firestoreUnsubscribe = sync.onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        let changed = false;
        if (data.settings && JSON.stringify(data.settings) !== JSON.stringify(settings)) {
          settings = { ...settings, ...data.settings };
          changed = true;
        }
        if (data.revisions && JSON.stringify(data.revisions) !== JSON.stringify(revisions)) {
          revisions = data.revisions;
          changed = true;
        }
        if (data.payments && Array.isArray(data.payments)) {
          payments = data.payments;
          changed = true;
        }
        if (changed) {
          try {
            localStorage.setItem('hipoteca_cfg_v6', JSON.stringify(settings));
            localStorage.setItem('hipoteca_revs_v6', JSON.stringify(revisions));
            localStorage.setItem('hipoteca_payments_v6', JSON.stringify(payments));
          } catch(e) {}
          recomputeBalances();
          updateDashboardUI();
          showToast("Datos sincronizados en tiempo real ☁️");
        }
      } else {
        syncToFirestoreIfAvailable(true);
      }
    }, (err) => {
      console.warn("Firestore sync warning:", err);
    });
  } catch (err) {
    console.warn("Error attaching Firestore listener:", err);
  }
}

function syncToFirestoreIfAvailable(silent = false) {
  if (!window.firebaseSync || !window.firebaseSync.db) return;
  const sync = window.firebaseSync;
  const cleanKey = getSyncKey();

  try {
    const docRef = sync.doc(sync.db, "shared_mortgages", cleanKey);
    sync.setDoc(docRef, {
      settings: settings,
      revisions: revisions,
      payments: payments,
      updatedAt: Date.now()
    }, { merge: true }).then(() => {
      if (!silent) showToast("Sincronizado en la nube ☁️");
    }).catch(err => {
      console.warn("Error guardando en Firestore:", err);
    });
  } catch (err) {
    console.warn("Sync error:", err);
  }
}

function openSyncModal() {
  const input = document.getElementById('sync-input-key');
  if (input) {
    input.value = currentSyncKey === DEFAULT_SYNC_KEY ? '' : currentSyncKey;
  }
  updateSyncUI();
  document.getElementById('sync-modal').classList.add('active');
}

function closeSyncModal() {
  document.getElementById('sync-modal').classList.remove('active');
}

function handleSyncConnect(e) {
  e.preventDefault();
  const input = document.getElementById('sync-input-key');
  const val = (input?.value || '').trim();
  if (!val) {
    alert("Por favor introduce tu correo electrónico o un código identificador.");
    return;
  }
  setSyncKey(val);
  closeSyncModal();
  showToast("Conectado a: " + val + " ☁️");
}

function forceCloudSave() {
  syncToFirestoreIfAvailable(false);
  showToast("Guardado forzado en Firestore ☁️");
}

function showToast(msg) {
  const t = document.getElementById('toast-banner');
  const textEl = document.getElementById('toast-text');
  if (textEl) textEl.textContent = msg;
  if (t) {
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }
}

window.addEventListener('resize', () => {
  if (document.getElementById('tab-content-dashboard')?.style.display !== 'none') {
    drawFinancialCharts();
  }
});
