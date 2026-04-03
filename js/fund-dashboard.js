/*
  FUND-DASHBOARD.JS — Chart.js + Firestore Integration

  HOW CHART.JS WORKS:
  ───────────────────
  Chart.js needs THREE things to render a chart:
  
  1. A <canvas> element in HTML (the drawing surface)
  2. A "type" — bar, pie, doughnut, line, etc.
  3. A "data" object with:
     - labels: ["Category 1", "Category 2", ...]  ← X-axis labels
     - datasets: [{
         data: [100, 200, 300, ...],               ← Y-axis values
         backgroundColor: ["#color1", "#color2"],   ← bar/slice colors
       }]
  
  The KEY mapping: labels[i] pairs with datasets[0].data[i]
  So labels[0] = "Defence" maps to data[0] = 621940 (₹6.2 Lakh Cr)
  
  HOW FIRESTORE DATA MAPS TO CHARTS:
  ──────────────────────────────────
  If Firestore has a document like:
  {
    sectors: ["Defence", "Education", "Health"],
    amounts: [621940, 120628, 90171]
  }
  
  We map it directly:
    labels = doc.sectors       → ["Defence", "Education", ...]
    data   = doc.amounts       → [621940, 120628, ...]
  
  Chart.js reads these arrays and draws the chart automatically.
*/

// ── Real Indian Union Budget Data (₹ in Crores) ────────────
const BUDGET_DATA = {
  '2026-27': {
    title: 'Union Budget 2026-27 (Projections)',
    totalBudget: '₹53.18 Lakh Crore',
    fiscalDeficit: '4.1% of GDP',
    capitalExpenditure: '₹12.50 Lakh Crore',
    revenueExpenditure: '₹40.68 Lakh Crore',
    sectors: [
      { name: 'Defence', amount: 712000, icon: '🛡️', change: '+4.7%' },
      { name: 'Rural Development', amount: 289400, icon: '🏘️', change: '+3.7%' },
      { name: 'Agriculture', amount: 182500, icon: '🌾', change: '+5.8%' },
      { name: 'Education', amount: 138000, icon: '🎓', change: '+9.8%' },
      { name: 'Health & Family Welfare', amount: 112000, icon: '🏥', change: '+12.1%' },
      { name: 'Home Affairs (Police)', amount: 135000, icon: '👮', change: '+6.2%' },
      { name: 'Railways', amount: 285000, icon: '🚂', change: '+6.6%' },
      { name: 'Road Transport & Highways', amount: 295000, icon: '🛣️', change: '+3.7%' },
      { name: 'IT & Telecom', amount: 142000, icon: '💻', change: '+14.3%' },
      { name: 'Housing & Urban Affairs', amount: 96000, icon: '🏗️', change: '+8.1%' },
    ],
    revenue: [
      { source: 'Income Tax', amount: 1450000 },
      { source: 'GST', amount: 1320000 },
      { source: 'Corporation Tax', amount: 1180000 },
      { source: 'Borrowings', amount: 1610000 },
      { source: 'Excise Duty', amount: 395000 },
      { source: 'Customs', amount: 265000 },
      { source: 'Non-Tax Revenue', amount: 450000 },
    ]
  },
  '2025-26': {
    title: 'Union Budget 2025-26 (Budget Estimates)',
    totalBudget: '₹50.65 Lakh Crore',
    fiscalDeficit: '4.4% of GDP',
    capitalExpenditure: '₹11.21 Lakh Crore',
    revenueExpenditure: '₹39.44 Lakh Crore',
    sectors: [
      { name: 'Defence', amount: 679500, icon: '🛡️', change: '+9.3%' },
      { name: 'Rural Development', amount: 278854, icon: '🏘️', change: '+3.8%' },
      { name: 'Agriculture', amount: 172398, icon: '🌾', change: '+5.6%' },
      { name: 'Education', amount: 125638, icon: '🎓', change: '+4.2%' },
      { name: 'Health & Family Welfare', amount: 99858, icon: '🏥', change: '+10.7%' },
      { name: 'Home Affairs (Police)', amount: 127014, icon: '👮', change: '+4.7%' },
      { name: 'Railways', amount: 267200, icon: '🚂', change: '+3.9%' },
      { name: 'Road Transport & Highways', amount: 284300, icon: '🛣️', change: '+2.3%' },
      { name: 'IT & Telecom', amount: 124200, icon: '💻', change: '+6.8%' },
      { name: 'Housing & Urban Affairs', amount: 88740, icon: '🏗️', change: '+7.5%' },
    ],
    revenue: [
      { source: 'Income Tax', amount: 1289000 },
      { source: 'GST', amount: 1178000 },
      { source: 'Corporation Tax', amount: 1080000 },
      { source: 'Borrowings', amount: 1572650 },
      { source: 'Excise Duty', amount: 378000 },
      { source: 'Customs', amount: 246000 },
      { source: 'Non-Tax Revenue', amount: 415000 },
    ]
  },
  '2024-25': {
    title: 'Union Budget 2024-25 (Revised Estimates)',
    totalBudget: '₹48.21 Lakh Crore',
    fiscalDeficit: '4.9% of GDP',
    capitalExpenditure: '₹11.11 Lakh Crore',
    revenueExpenditure: '₹37.09 Lakh Crore',
    sectors: [
      { name: 'Defence', amount: 621940, icon: '🛡️', change: '+4.7%' },
      { name: 'Rural Development', amount: 268691, icon: '🏘️', change: '+12.3%' },
      { name: 'Agriculture', amount: 163220, icon: '🌾', change: '+8.5%' },
      { name: 'Education', amount: 120628, icon: '🎓', change: '+14.7%' },
      { name: 'Health & Family Welfare', amount: 90171, icon: '🏥', change: '+12.9%' },
      { name: 'Home Affairs (Police)', amount: 121338, icon: '👮', change: '+5.1%' },
      { name: 'Railways', amount: 257200, icon: '🚂', change: '+17.3%' },
      { name: 'Road Transport & Highways', amount: 278000, icon: '🛣️', change: '+3.2%' },
      { name: 'IT & Telecom', amount: 116342, icon: '💻', change: '+18.5%' },
      { name: 'Housing & Urban Affairs', amount: 82577, icon: '🏗️', change: '+8.1%' },
    ],
    revenue: [
      { source: 'Income Tax', amount: 1125000 },
      { source: 'GST', amount: 1068000 },
      { source: 'Corporation Tax', amount: 1020000 },
      { source: 'Borrowings', amount: 1686490 },
      { source: 'Excise Duty', amount: 339000 },
      { source: 'Customs', amount: 218000 },
      { source: 'Non-Tax Revenue', amount: 385000 },
    ]
  },
  '2023-24': {
    title: 'Union Budget 2023-24 (Actual)',
    totalBudget: '₹45.03 Lakh Crore',
    fiscalDeficit: '5.8% of GDP',
    capitalExpenditure: '₹10.00 Lakh Crore',
    revenueExpenditure: '₹35.02 Lakh Crore',
    sectors: [
      { name: 'Defence', amount: 593538, icon: '🛡️', change: '+13.0%' },
      { name: 'Rural Development', amount: 239302, icon: '🏘️', change: '+7.2%' },
      { name: 'Agriculture', amount: 150398, icon: '🌾', change: '+5.2%' },
      { name: 'Education', amount: 105192, icon: '🎓', change: '+8.3%' },
      { name: 'Health & Family Welfare', amount: 79860, icon: '🏥', change: '+3.5%' },
      { name: 'Home Affairs (Police)', amount: 115498, icon: '👮', change: '+6.4%' },
      { name: 'Railways', amount: 219207, icon: '🚂', change: '+50.3%' },
      { name: 'Road Transport & Highways', amount: 269361, icon: '🛣️', change: '+25.4%' },
      { name: 'IT & Telecom', amount: 98151, icon: '💻', change: '+16.0%' },
      { name: 'Housing & Urban Affairs', amount: 76432, icon: '🏗️', change: '+19.4%' },
    ],
    revenue: [
      { source: 'Income Tax', amount: 1020000 },
      { source: 'GST', amount: 950000 },
      { source: 'Corporation Tax', amount: 920000 },
      { source: 'Borrowings', amount: 1742390 },
      { source: 'Excise Duty', amount: 310000 },
      { source: 'Customs', amount: 210000 },
      { source: 'Non-Tax Revenue', amount: 310000 },
    ]
  }
};

// Chart color palette
const CHART_COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];

const REVENUE_COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
];

let activeYear = '2026-27';
let chartInstances = {};

// ── Load Data (Firestore with fallback) ────────────────────
async function loadDashboard() {
  let data;

  try {
    const doc = await db.collection('budgets').doc(activeYear).get();
    if (doc.exists) {
      data = doc.data();
    } else {
      data = BUDGET_DATA[activeYear];
    }
  } catch {
    data = BUDGET_DATA[activeYear];
  }

  renderStats(data);
  renderCharts(data);
  renderTable(data);
}

// ── Render Stats Cards ─────────────────────────────────────
function renderStats(data) {
  document.getElementById('stat-total').textContent = data.totalBudget;
  document.getElementById('stat-fiscal').textContent = data.fiscalDeficit;
  document.getElementById('stat-capex').textContent = data.capitalExpenditure;
  document.getElementById('stat-revenue').textContent = data.revenueExpenditure;
}

// ── Render Charts ──────────────────────────────────────────
/*
  HOW CHART.JS MAPS DATA:
  
  For a bar chart with 10 sectors:
    labels:  ["Defence", "Rural Dev", "Agriculture", ...]  ← sector names
    data:    [621940,     268691,      163220,       ...]  ← amounts in ₹ Cr
    colors:  ["#4f46e5",  "#06b6d4",   "#10b981",   ...]  ← bar colors
  
  labels[0] = "Defence"   → data[0] = 621940   → color[0] = "#4f46e5"
  labels[1] = "Rural Dev"  → data[1] = 268691  → color[1] = "#06b6d4"
  ...and so on. The INDEX links them together.
  
  new Chart(canvas, config) does the rest — calculates
  scales, draws axes, renders bars, adds hover tooltips.
*/
function renderCharts(data) {
  // Destroy old charts before re-creating
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.15)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // ── Chart 1: Sector-wise Allocation (Horizontal Bar) ─────
  const sectorCtx = document.getElementById('chart-sectors')?.getContext('2d');
  if (sectorCtx) {
    /*
      MAPPING DATABASE → CHART FORMAT:
      data.sectors = [{ name: "Defence", amount: 621940 }, ...]
      
      .map(s => s.name)    → extracts just the names → labels array
      .map(s => s.amount)  → extracts just the amounts → data array
      
      Chart.js reads: labels[0] with data[0], labels[1] with data[1], etc.
    */
    chartInstances.sectors = new Chart(sectorCtx, {
      type: 'bar',
      data: {
        labels: data.sectors.map(s => s.name),
        datasets: [{
          label: 'Allocation (₹ Crore)',
          data: data.sectors.map(s => s.amount),
          backgroundColor: CHART_COLORS,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',  // horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `₹${(ctx.raw / 100).toFixed(0)} Lakh Cr (₹${ctx.raw.toLocaleString('en-IN')} Cr)`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (v) => `₹${(v / 1000).toFixed(0)}K Cr`
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 11, weight: 500 } }
          }
        }
      }
    });
  }

  // ── Chart 2: Revenue Sources (Doughnut) ──────────────────
  const revenueCtx = document.getElementById('chart-revenue')?.getContext('2d');
  if (revenueCtx) {
    chartInstances.revenue = new Chart(revenueCtx, {
      type: 'doughnut',
      data: {
        labels: data.revenue.map(r => r.source),
        datasets: [{
          data: data.revenue.map(r => r.amount),
          backgroundColor: REVENUE_COLORS,
          borderWidth: 2,
          borderColor: isDark ? '#1e293b' : '#ffffff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, padding: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ₹${(ctx.raw / 100).toFixed(0)} Lakh Cr`
            }
          }
        }
      }
    });
  }

  // ── Chart 3: Year-over-Year Comparison (Line) ────────────
  const compCtx = document.getElementById('chart-comparison')?.getContext('2d');
  if (compCtx) {
    const data2025 = BUDGET_DATA['2025-26'].sectors;
    const data2024 = BUDGET_DATA['2024-25'].sectors;
    const data2023 = BUDGET_DATA['2023-24'].sectors;

    chartInstances.comparison = new Chart(compCtx, {
      type: 'line',
      data: {
        labels: data2025.map(s => s.name),
        datasets: [
          {
            label: '2025-26',
            data: data2025.map(s => s.amount),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
          },
          {
            label: '2024-25',
            data: data2024.map(s => s.amount),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79,70,229,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#4f46e5',
          },
          {
            label: '2023-24',
            data: data2023.map(s => s.amount),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6,182,212,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#06b6d4',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: textColor, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')} Cr`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 10 }, maxRotation: 45 }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (v) => `₹${(v / 1000).toFixed(0)}K`
            }
          }
        }
      }
    });
  }
}

// ── Render Allocation Table ────────────────────────────────
function renderTable(data) {
  const tbody = document.getElementById('allocation-tbody');
  if (!tbody) return;

  tbody.innerHTML = data.sectors.map((s, i) => {
    const lakhCr = (s.amount / 100).toFixed(2);
    const isPositive = s.change.startsWith('+');
    return `
      <tr>
        <td>
          <div class="sector-name">
            <span class="sector-dot" style="background:${CHART_COLORS[i]}"></span>
            ${s.icon} ${s.name}
          </div>
        </td>
        <td class="amount">₹${s.amount.toLocaleString('en-IN')} Cr</td>
        <td class="amount">₹${lakhCr} Lakh Cr</td>
        <td class="${isPositive ? 'change-positive' : 'change-negative'}">${s.change}</td>
      </tr>
    `;
  }).join('');
}

// ── Initialize ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();

  // Year tab switching
  document.querySelectorAll('.year-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.year-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeYear = tab.dataset.year;
      loadDashboard();
    });
  });

  // Re-render charts when theme changes (for correct colors)
  const observer = new MutationObserver(() => {
    const data = BUDGET_DATA[activeYear];
    renderCharts(data);
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
});
