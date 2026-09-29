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
  internalDebtLaura: 33486.0,
  internalDebtRak: 68266.0
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
    capTotal: 84704.60,
    capLaura: 27334.17,
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
   FIRESTORE CLOUD SYNCHRONIZATION
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
    // 1. Recover Settings across all known versions
    const cfgKeys = ['hipoteca_cfg_v7', 'hipoteca_cfg_v6', 'hipoteca_cfg_v5', 'hipoteca_cfg_v4', 'hipoteca_cfg_v3', 'hipoteca_cfg_v2', 'hipoteca_cfg_v1', 'hipoteca_cfg', 'hipoteca_settings'];
    for (const k of cfgKeys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            settings = { ...settings, ...parsed };
            break;
          }
        } catch(e) {}
      }
    }

    // 2. Recover Revisions across all known versions
    const revKeys = ['hipoteca_revs_v7', 'hipoteca_revs_v6', 'hipoteca_revs_v5', 'hipoteca_revs_v4', 'hipoteca_revs_v3', 'hipoteca_revs_v2', 'hipoteca_revs_v1', 'hipoteca_revs', 'hipoteca_revisions', 'revisions'];
    for (const k of revKeys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            revisions = parsed;
            break;
          }
        } catch(e) {}
      }
    }

    // 3. Recover Payments across all known versions
    let loadedPayments = false;
    const payKeys = ['hipoteca_payments_v7', 'hipoteca_payments_v6', 'hipoteca_payments_v5', 'hipoteca_payments_v4', 'hipoteca_payments_v3', 'hipoteca_payments_v2', 'hipoteca_payments_v1', 'hipoteca_payments', 'mortgage_payments', 'payments'];
    for (const k of payKeys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            payments = parsed;
            loadedPayments = true;
            break;
          }
        } catch(e) {}
      }
    }

    if (!loadedPayments) {
      payments = getOriginalExcelSeed();
    }
  } catch (err) {
    console.warn("Storage loading notice:", err);
  }
  recomputeBalances();
}

function saveStateToStorage() {
  try {
    const cfgStr = JSON.stringify(settings);
    const revStr = JSON.stringify(revisions);
    const payStr = JSON.stringify(payments);

    localStorage.setItem('hipoteca_cfg_v7', cfgStr);
    localStorage.setItem('hipoteca_cfg_v6', cfgStr);
    localStorage.setItem('hipoteca_revs_v7', revStr);
    localStorage.setItem('hipoteca_revs_v6', revStr);
    localStorage.setItem('hipoteca_payments_v7', payStr);
    localStorage.setItem('hipoteca_payments_v6', payStr);
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
      lauraExtraAmort: 0.0,
      deposit: r.dep,
      notes: r.n || "Cuota ordinaria",
      remaining: bal
    };
  });
}

function recomputeBalances() {
  payments.sort((a, b) => (a.year - b.year) || (a.month - b.month));

  let bal = settings.initialCapital || 121766.32;
  const initialPct = (settings.coOwner1Percentage || 32.27) / 100;
  let capLaura = (settings.internalDebtLaura && settings.internalDebtLaura > 0)
    ? Number(settings.internalDebtLaura)
    : (bal * initialPct);

  let accBal = 0;
  let totLauraDiscount = 0;

  payments.forEach(p => {
    const rev = getActiveRevisionForDate(p.year, p.month);
    const lauraPct = (p.totalFee && p.co1) 
      ? (p.co1 / p.totalFee) 
      : (rev ? (rev.pctLaura / 100) : initialPct);

    const prin = Number(p.principal) || 0;
    const ext = Number(p.extra) || 0;
    const lDiscount = Number(p.lauraExtraAmort) || 0;

    // Laura's regular principal amortization from receipt
    const lauraPrin = prin * lauraPct;

    totLauraDiscount += lDiscount;
    p.accLauraDiscount = totLauraDiscount;

    // Laura's pending capital reduces month-by-month
    capLaura = Math.max(0, capLaura - (lauraPrin + lDiscount));
    p.lauraRemaining = capLaura;

    // Total bank loan capital reduces
    bal = Math.max(0, bal - (prin + ext + lDiscount));
    p.remaining = bal;

    const co1 = Number(p.co1) || 0;
    const com = Number(p.community) || 0;
    const luz = Number(p.electricity) || 0;
    const derr = Number(p.derramas) || 0;
    const ins = Number(p.insurance) || 0;
    const ibi = Number(p.ibi) || 0;
    const other = Number(p.otherExtra) || 0;

    // Laura's operational monthly expenses
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

function checkCapitalDiscrepancy() {
  const banner = document.getElementById('capital-mismatch-banner');
  const textEl = document.getElementById('capital-mismatch-text');
  if (!banner || !textEl) return;

  if (!payments || payments.length === 0 || !revisions || revisions.length === 0) {
    banner.style.display = 'none';
    return;
  }

  const latest = payments[payments.length - 1];
  const rev = getActiveRevisionForDate(latest.year, latest.month);
  if (!rev) {
    banner.style.display = 'none';
    return;
  }

  // Calculate expected trajectory from the revision benchmark
  const revStartPayments = payments.filter(p => p.year > rev.startYear || (p.year === rev.startYear && p.month >= rev.startMonth));
  
  let expectedCap = rev.capTotal;
  revStartPayments.forEach(p => {
    expectedCap = Math.max(0, expectedCap - ((Number(p.principal) || 0) + (Number(p.extra) || 0) + (Number(p.lauraExtraAmort) || 0)));
  });

  const diff = Math.abs(latest.remaining - expectedCap);

  if (diff > 250) {
    banner.style.display = 'flex';
    textEl.innerHTML = `Descuadre de <strong>${fmt(diff)}</strong> entre el capital acumulado (${fmt(latest.remaining)}) y la referencia bancaria (${fmt(expectedCap)}) de <em>${rev.name}</em>.`;
  } else {
    banner.style.display = 'none';
  }
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
      statusElem.textContent = "Sin meses registrados";
      statusElem.style.color = "var(--text-muted)";
    } else {
      statusElem.textContent = accBal >= 0 
        ? "Saldo acumulado a favor de Laura (+)" 
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

  const initialLauraCap = (settings.internalDebtLaura && settings.internalDebtLaura > 0)
    ? Number(settings.internalDebtLaura)
    : (settings.initialCapital * (pctLaura / 100));
  const currentLauraCap = latest ? latest.lauraRemaining : initialLauraCap;

  if (document.getElementById('kpi-laura-remaining')) {
    document.getElementById('kpi-laura-remaining').textContent = fmt(currentLauraCap);
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

  // 3 Revisions boxes on Dashboard
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

  if (document.getElementById('val-debt-laura')) document.getElementById('val-debt-laura').textContent = fmt(currentLauraCap);
  if (document.getElementById('val-debt-rak')) document.getElementById('val-debt-rak').textContent = fmt(Math.max(0, remaining - currentLauraCap));

  checkCapitalDiscrepancy();
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

    // Desktop navbar button
    const dBtn = document.getElementById('d-btn-' + t);
    if (dBtn) {
      if (t === tabId) dBtn.classList.add('active');
      else dBtn.classList.remove('active');
    }

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
  const canvas = document.getElementById('amort-chart-canvas');
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
  const maxCap = Math.max(settings.initialCapital || 125000, ...payments.map(p => p.remaining || 0));

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

  // Draw Capital Curve
  ctx.beginPath();
  payments.forEach((p, idx) => {
    const x = pad.left + (idx / Math.max(1, payments.length - 1)) * plotW;
    const y = pad.top + plotH - ((p.remaining || 0) / maxCap) * plotH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Gradient fill
  const lastX = pad.left + plotW;
  const firstX = pad.left;
  const baseLine = pad.top + plotH;
  ctx.lineTo(lastX, baseLine);
  ctx.lineTo(firstX, baseLine);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, pad.top, 0, baseLine);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawReceiptBreakdownChart() {
  const canvas = document.getElementById('receipt-chart-canvas');
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
      <td style="color: var(--primary); font-weight: 700;">${fmt(p.lauraRemaining)}</td>
      <td style="color: var(--secondary); font-size: 11px;">${fmt(p.remaining)}</td>
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
  document.getElementById('rev-modal-title').textContent = id ? "Editar Periodo" : "Añadir Periodo";

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
    document.getElementById('rev-cap-total').value = (settings.initialCapital || 121766.32).toFixed(2);
    document.getElementById('rev-cap-laura').value = ((settings.initialCapital || 121766.32) * ((settings.coOwner1Percentage || 32.27)/100)).toFixed(2);
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

function onRevisionCapLauraChange() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const capL = Number(document.getElementById('rev-cap-laura').value) || 0;
  if (capTot > 0 && capL > 0) {
    const pct = (capL / capTot) * 100;
    document.getElementById('rev-pct-laura').value = pct.toFixed(2);
  }
  updateRevisionCalculatedBox();
}

function onRevisionPctLauraChange() {
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

function generateTriAnnualRevisions() {
  if (confirm("¿Deseas generar/completar el histórico de las 3 revisiones anuales (Noviembre, Febrero, Julio) desde 2020 a 2026?")) {
    const list = [
      // 2020
      { y: 2020, m: 11, name: "Periodo Inicial (Nov 2020)", cap: 121766.32, fee: 513.81, int: 187.69, pct: 32.27 },
      // 2021
      { y: 2021, m: 2, name: "Revisión Febrero 2021", cap: 120800.00, fee: 513.81, int: 185.00, pct: 32.27 },
      { y: 2021, m: 7, name: "Revisión Julio 2021", cap: 119200.00, fee: 513.81, int: 182.50, pct: 32.27 },
      { y: 2021, m: 11, name: "Revisión Noviembre 2021", cap: 118000.00, fee: 513.81, int: 180.00, pct: 32.27 },
      // 2022
      { y: 2022, m: 2, name: "Revisión Febrero 2022", cap: 117000.00, fee: 513.81, int: 178.00, pct: 32.27 },
      { y: 2022, m: 7, name: "Revisión Julio 2022", cap: 115500.00, fee: 513.81, int: 176.50, pct: 32.27 },
      { y: 2022, m: 11, name: "1ª Rev. Noviembre 2022", cap: 114200.00, fee: 513.81, int: 176.00, pct: 32.27 },
      // 2023
      { y: 2023, m: 2, name: "2ª Rev. Febrero 2023", cap: 113500.00, fee: 560.20, int: 210.00, pct: 32.27 },
      { y: 2023, m: 7, name: "3ª Rev. Julio 2023", cap: 84704.60, fee: 590.45, int: 235.00, pct: 32.27 },
      { y: 2023, m: 11, name: "Revisión Noviembre 2023", cap: 83200.00, fee: 590.45, int: 225.00, pct: 32.27 },
      // 2024
      { y: 2024, m: 2, name: "Revisión Febrero 2024", cap: 82000.00, fee: 645.54, int: 245.00, pct: 43.94 },
      { y: 2024, m: 7, name: "Revisión Julio 2024", cap: 80500.00, fee: 645.54, int: 240.00, pct: 43.94 },
      { y: 2024, m: 11, name: "Revisión Noviembre 2024", cap: 79000.00, fee: 645.54, int: 230.00, pct: 43.94 },
      // 2025
      { y: 2025, m: 2, name: "Revisión Febrero 2025", cap: 77500.00, fee: 706.02, int: 220.00, pct: 43.94 },
      { y: 2025, m: 7, name: "Revisión Julio 2025", cap: 75800.00, fee: 706.02, int: 210.00, pct: 43.94 },
      { y: 2025, m: 11, name: "Revisión Noviembre 2025", cap: 74200.00, fee: 706.02, int: 200.00, pct: 43.94 },
      // 2026
      { y: 2026, m: 2, name: "Revisión Febrero 2026", cap: 72800.00, fee: 706.02, int: 190.00, pct: 43.94 },
      { y: 2026, m: 7, name: "Revisión Julio 2026", cap: 71200.00, fee: 706.02, int: 180.00, pct: 43.94 }
    ];

    const generated = list.map((item, idx) => {
      const capL = item.cap * (item.pct / 100);
      const prin = Math.max(0, item.fee - item.int);
      const lauraFee = item.fee * (item.pct / 100);
      const rakFee = Math.max(0, item.fee - lauraFee);
      const lauraInt = item.int * (item.pct / 100);
      const lauraPrin = prin * (item.pct / 100);

      return {
        id: idx + 1,
        name: item.name,
        startYear: item.y,
        startMonth: item.m,
        capTotal: item.cap,
        capLaura: capL,
        pctLaura: item.pct,
        feeTotal: item.fee,
        intTotal: item.int,
        prinTotal: prin,
        lauraFee,
        rakFee,
        lauraInt,
        lauraPrin
      };
    });

    revisions = generated;
    saveStateToStorage();
    recomputeBalances();
    updateDashboardUI();
    showToast("¡Se han generado las 18 revisiones de 2020 a 2026!");
  }
}

function scanAndRecoverBackups() {
  const foundBackups = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('rev') || key.includes('hipoteca') || key.includes('backup') || key.includes('payment'))) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(val) && val.length > 0) {
            foundBackups.push({ key, count: val.length, data: val, type: (val[0].startYear || val[0].capTotal) ? 'revisiones' : 'pagos' });
          }
        } catch(e) {}
      }
    }
  } catch(err) {}

  if (foundBackups.length === 0) {
    alert("No se encontraron otras copias en el almacenamiento de este navegador.");
    return;
  }

  let msg = "Copias de datos encontradas en tu navegador:\n\n";
  foundBackups.forEach((b, idx) => {
    msg += `${idx + 1}. [${b.type.toUpperCase()}] Clave: "${b.key}" (${b.count} elementos)\n`;
  });
  msg += "\nEscribe el número de la copia que deseas restaurar (o pulsa Cancelar):";

  const choice = prompt(msg, "1");
  if (choice) {
    const selected = foundBackups[parseInt(choice) - 1];
    if (selected) {
      if (selected.type === 'revisiones') {
        revisions = selected.data;
        showToast(`Restauradas ${selected.count} revisiones desde "${selected.key}"`);
      } else {
        payments = selected.data;
        showToast(`Restaurados ${selected.count} meses desde "${selected.key}"`);
      }
      saveStateToStorage();
      recomputeBalances();
      updateDashboardUI();
    }
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
    badge.textContent = rev ? `📌 Periodo: ${rev.name} (${rev.pctLaura.toFixed(2)}%)` : "📌 Periodo General";
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
    badge.textContent = rev ? `📌 Periodo detectado: ${rev.name} (${rev.pctLaura.toFixed(2)}%)` : "📌 Periodo General";
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
    document.getElementById('cfg-capital-init').value = (settings.initialCapital || 121766.32).toFixed(2);
    document.getElementById('cfg-term-years').value = settings.totalTermYears || 25;
    document.getElementById('cfg-interest-rate').value = (settings.annualInterestRate || 1.85).toFixed(2);
    document.getElementById('cfg-laura-pct').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
    document.getElementById('cfg-rak-pct').value = (settings.coOwner2Percentage || 67.73).toFixed(2);
    document.getElementById('cfg-debt-laura').value = (settings.internalDebtLaura || 33486).toFixed(2);
    document.getElementById('cfg-debt-rak').value = (settings.internalDebtRak || 68266).toFixed(2);
    document.getElementById('sync-user-id').value = currentSyncKey;
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

function syncAgreementPercentages(source) {
  if (source === 'laura') {
    const lPct = Number(document.getElementById('agree-pct-laura').value) || 0;
    document.getElementById('agree-pct-rak').value = (100 - lPct).toFixed(2);
  } else {
    const rPct = Number(document.getElementById('agree-pct-rak').value) || 0;
    document.getElementById('agree-pct-laura').value = (100 - rPct).toFixed(2);
  }
}

function syncAgreementDebts() {
  const dL = Number(document.getElementById('agree-debt-laura').value) || 0;
  const dR = Number(document.getElementById('agree-debt-rak').value) || 0;
  const tot = dL + dR;
  if (tot > 0) {
    const lPct = (dL / tot) * 100;
    document.getElementById('agree-pct-laura').value = lPct.toFixed(2);
    document.getElementById('agree-pct-rak').value = (100 - lPct).toFixed(2);
  }
}

function openAgreementModal() {
  document.getElementById('agree-name-laura').value = settings.coOwner1Name || "Laura";
  document.getElementById('agree-name-rak').value = settings.coOwner2Name || "Rak";
  document.getElementById('agree-pct-laura').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
  document.getElementById('agree-pct-rak').value = (settings.coOwner2Percentage || 67.73).toFixed(2);
  document.getElementById('agree-debt-laura').value = (settings.internalDebtLaura || 33486).toFixed(2);
  document.getElementById('agree-debt-rak').value = (settings.internalDebtRak || 68266).toFixed(2);

  document.getElementById('agreement-modal').classList.add('active');
}

function closeAgreementModal() {
  document.getElementById('agreement-modal').classList.remove('active');
}

function submitAgreementHandler(e) {
  e.preventDefault();
  settings.coOwner1Name = document.getElementById('agree-name-laura').value || "Laura";
  settings.coOwner2Name = document.getElementById('agree-name-rak').value || "Rak";
  settings.coOwner1Percentage = Number(document.getElementById('agree-pct-laura').value) || 32.27;
  settings.coOwner2Percentage = Number(document.getElementById('agree-pct-rak').value) || 67.73;
  settings.internalDebtLaura = Number(document.getElementById('agree-debt-laura').value) || 0;
  settings.internalDebtRak = Number(document.getElementById('agree-debt-rak').value) || 0;

  saveStateToStorage();
  closeAgreementModal();
  updateDashboardUI();
  showToast("Acuerdo actualizado");
}

function saveSettingsHandler(e) {
  e.preventDefault();
  settings.initialCapital = Number(document.getElementById('cfg-capital-init').value) || 121766.32;
  settings.totalTermYears = Number(document.getElementById('cfg-term-years').value) || 25;
  settings.annualInterestRate = Number(document.getElementById('cfg-interest-rate').value) || 1.85;
  settings.coOwner1Percentage = Number(document.getElementById('cfg-laura-pct').value) || 32.27;
  settings.coOwner2Percentage = Number(document.getElementById('cfg-rak-pct').value) || 67.73;
  settings.internalDebtLaura = Number(document.getElementById('cfg-debt-laura').value) || 0;
  settings.internalDebtRak = Number(document.getElementById('cfg-debt-rak').value) || 0;

  const newKey = document.getElementById('sync-user-id').value;
  if (newKey && newKey !== currentSyncKey) {
    setSyncKey(newKey);
  }

  recomputeBalances();
  saveStateToStorage();
  updateDashboardUI();
  showToast("Ajustes guardados");
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
  a.download = `hipoteca_laura_rak_${new Date().toISOString().substring(0, 10)}.json`;
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
   FIRESTORE CLOUD REALTIME SYNC & MODAL HANDLERS
   ========================================================== */
function openSyncModal() {
  const inputEl = document.getElementById('sync-input-key');
  if (inputEl) inputEl.value = currentSyncKey;
  
  const activeLabel = document.getElementById('sync-active-label');
  if (activeLabel) activeLabel.textContent = currentSyncKey;

  const modal = document.getElementById('sync-modal');
  if (modal) modal.classList.add('active');
}

function closeSyncModal() {
  const modal = document.getElementById('sync-modal');
  if (modal) modal.classList.remove('active');
}

function handleSyncConnect(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inputEl = document.getElementById('sync-input-key');
  const key = inputEl ? inputEl.value.trim() : '';
  if (key) {
    setSyncKey(key);
    closeSyncModal();
    showToast("Conectado a: " + key);
  }
}

function updateSyncUI() {
  const pillLabel = document.getElementById('sync-pill-label');
  if (pillLabel) pillLabel.textContent = currentSyncKey;

  const bannerText = document.getElementById('banner-sync-text');
  if (bannerText) bannerText.textContent = `Sincronización activa (${currentSyncKey})`;

  const activeLabel = document.getElementById('sync-active-label');
  if (activeLabel) activeLabel.textContent = currentSyncKey;

  const badge = document.getElementById('sync-status-badge');
  if (badge) {
    const isCustom = currentSyncKey !== DEFAULT_SYNC_KEY;
    badge.textContent = isCustom ? "Conectado" : "Sistema base";
    badge.style.color = isCustom ? "#10b981" : "#fcd34d";
    badge.style.background = isCustom ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)";
  }

  const syncUserId = document.getElementById('sync-user-id');
  if (syncUserId) syncUserId.value = currentSyncKey;
}

function promptChangeSyncKey() {
  openSyncModal();
}

let isSyncingIncoming = false;

function connectFirestoreSync(key) {
  if (!window.firebaseSync || !window.firebaseSync.db) return;
  const { db, doc, onSnapshot } = window.firebaseSync;

  if (firestoreUnsubscribe) {
    try { firestoreUnsubscribe(); } catch (e) {}
  }

  try {
    const docRef = doc(db, 'mortgage_accounts', key);

    firestoreUnsubscribe = onSnapshot(docRef, docSnap => {
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          isSyncingIncoming = true;
          if (data.settings) settings = { ...settings, ...data.settings };
          if (Array.isArray(data.revisions) && data.revisions.length > 0) {
            revisions = data.revisions;
          }
          if (Array.isArray(data.payments) && data.payments.length > 0) {
            payments = data.payments;
          }
          
          if (data.updatedAt) {
            localStorage.setItem('hipoteca_last_sync_time', data.updatedAt.toString());
          }

          try {
            const cfgStr = JSON.stringify(settings);
            const revStr = JSON.stringify(revisions);
            const payStr = JSON.stringify(payments);
            localStorage.setItem('hipoteca_cfg_v7', cfgStr);
            localStorage.setItem('hipoteca_cfg_v6', cfgStr);
            localStorage.setItem('hipoteca_revs_v7', revStr);
            localStorage.setItem('hipoteca_revs_v6', revStr);
            localStorage.setItem('hipoteca_payments_v7', payStr);
            localStorage.setItem('hipoteca_payments_v6', payStr);
          } catch(e) {}

          recomputeBalances();
          updateDashboardUI();
          isSyncingIncoming = false;
        }
      } else {
        // Document does not exist in cloud yet for this key, sync our local data up
        syncToFirestoreIfAvailable(true);
      }
    }, err => {
      console.warn("Firestore sync listener notice:", err);
    });
  } catch (err) {
    console.warn("Firestore connection notice:", err);
  }
}

function syncToFirestoreIfAvailable(force = false) {
  if (isSyncingIncoming) return;
  if (!window.firebaseSync || !window.firebaseSync.db) return;

  const { db, doc, setDoc } = window.firebaseSync;
  const key = currentSyncKey || DEFAULT_SYNC_KEY;
  const now = Date.now();
  localStorage.setItem('hipoteca_last_sync_time', now.toString());

  try {
    const docRef = doc(db, 'mortgage_accounts', key);
    setDoc(docRef, {
      settings,
      revisions,
      payments,
      updatedAt: now
    }, { merge: true }).catch(err => {
      console.warn("Firestore save notice:", err);
    });
  } catch (err) {
    console.warn("Firestore setDoc notice:", err);
  }
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '90px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#062014';
  toast.style.color = '#10b981';
  toast.style.border = '1px solid #10b981';
  toast.style.padding = '10px 18px';
  toast.style.borderRadius = '9999px';
  toast.style.fontSize = '12px';
  toast.style.fontWeight = '700';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2400);
}
