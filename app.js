// ============================================================
// FDI IMPACT DASHBOARD — Indonesia 2016-2023
// app.js — Charts, Leaflet Maps, Scroll Spy, Animations
// ============================================================

lucide.createIcons();

// ---- CONSTANTS ----
const YEARS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
const TEAL = '#0d9488';
const ORANGE = '#f59e0b';
const RED = '#ef4444';
const BLUE = '#3b82f6';

// Cluster 0 provinces (Pusat Investasi) — from the report
const CLUSTER_0 = ['BANTEN', 'DKI JAKARTA', 'JAWA BARAT', 'MALUKU UTARA', 'SULAWESI TENGAH'];

// Mapping GeoJSON province names → CSV province names
const GEOJSON_TO_CSV = {
    'Aceh': 'ACEH',
    'DI. ACEH': 'ACEH',
    'Sumatera Utara': 'SUMATERA UTARA',
    'Sumatera Barat': 'SUMATERA BARAT',
    'Riau': 'RIAU',
    'Kepulauan Riau': 'KEP. RIAU',
    'Jambi': 'JAMBI',
    'Sumatera Selatan': 'SUMATERA SELATAN',
    'Bangka-Belitung': 'KEP. BANGKA BELITUNG',
    'Bangka Belitung': 'KEP. BANGKA BELITUNG',
    'Bengkulu': 'BENGKULU',
    'Lampung': 'LAMPUNG',
    'Jakarta Raya': 'DKI JAKARTA',
    'DKI Jakarta': 'DKI JAKARTA',
    'Jawa Barat': 'JAWA BARAT',
    'Jawa Tengah': 'JAWA TENGAH',
    'Yogyakarta': 'DI YOGYAKARTA',
    'Daerah Istimewa Yogyakarta': 'DI YOGYAKARTA',
    'Jawa Timur': 'JAWA TIMUR',
    'Banten': 'BANTEN',
    'Bali': 'BALI',
    'Nusa Tenggara Barat': 'NUSA TENGGARA BARAT',
    'Nusa Tenggara Timur': 'NUSA TENGGARA TIMUR',
    'Kalimantan Barat': 'KALIMANTAN BARAT',
    'Kalimantan Tengah': 'KALIMANTAN TENGAH',
    'Kalimantan Selatan': 'KALIMANTAN SELATAN',
    'Kalimantan Timur': 'KALIMANTAN TIMUR',
    'Kalimantan Utara': 'KALIMANTAN UTARA',
    'Sulawesi Utara': 'SULAWESI UTARA',
    'Gorontalo': 'GORONTALO',
    'Sulawesi Tengah': 'SULAWESI TENGAH',
    'Sulawesi Barat': 'SULAWESI BARAT',
    'Sulawesi Selatan': 'SULAWESI SELATAN',
    'Sulawesi Tenggara': 'SULAWESI TENGGARA',
    'Maluku': 'MALUKU',
    'Maluku Utara': 'MALUKU UTARA',
    'Papua': 'PAPUA',
    'Papua Barat': 'PAPUA BARAT',
    'Irian Jaya Barat': 'PAPUA BARAT',
    'Irian Jaya Timur': 'PAPUA',
    'Irian Jaya Tengah': 'PAPUA',
    // Old GeoJSON names
    'SUMATERA UTARA': 'SUMATERA UTARA',
    'SUMATERA BARAT': 'SUMATERA BARAT',
    'NUSATENGGARA BARAT': 'NUSA TENGGARA BARAT',
    'PROBANTEN': 'BANTEN',
    'DAERAH ISTIMEWA YOGYAKARTA': 'DI YOGYAKARTA',
    'BANGKA BELITUNG': 'KEP. BANGKA BELITUNG',
};

// ---- DATA PROCESSING ----
const processedData = {
    provinceAvg: {},
    yearlyTrend: {},
    mergedRows: [],
};

function processData() {
    const pmaMap = {}, pdrbMap = {}, miskinMap = {}, tptMap = {};

    if (rawData.pma) rawData.pma.forEach(r => { pmaMap[`${r.provinsi}_${r.tahun}`] = parseFloat(r.investasi) || 0; });
    if (rawData.pdrb) rawData.pdrb.forEach(r => { pdrbMap[`${r.provinsi}_${r.tahun}`] = parseFloat(r.pdrb) || 0; });
    if (rawData.miskin) rawData.miskin.forEach(r => { miskinMap[`${r.provinsi}_${r.tahun}`] = parseFloat(r.pct_maret) || 0; });
    if (rawData.tpt) rawData.tpt.forEach(r => { tptMap[`${r.provinsi}_${r.tahun}`] = parseFloat(r.agustus) || 0; });

    const allProvs = new Set();
    [pmaMap, pdrbMap, miskinMap, tptMap].forEach(m => Object.keys(m).forEach(k => allProvs.add(k.split('_')[0])));

    allProvs.forEach(prov => {
        YEARS.forEach(year => {
            const key = `${prov}_${year}`;
            processedData.mergedRows.push({
                tahun: year, provinsi: prov,
                pma: pmaMap[key] ?? null, pdrb: pdrbMap[key] ?? null,
                miskin: miskinMap[key] ?? null, tpt: tptMap[key] ?? null,
            });
        });
    });

    processedData.mergedRows.sort((a, b) => a.tahun !== b.tahun ? a.tahun.localeCompare(b.tahun) : a.provinsi.localeCompare(b.provinsi));

    // Province averages
    const provSums = {};
    processedData.mergedRows.forEach(r => {
        if (!provSums[r.provinsi]) provSums[r.provinsi] = { pma: 0, pdrb: 0, miskin: 0, tpt: 0, cP: 0, cD: 0, cM: 0, cT: 0 };
        const s = provSums[r.provinsi];
        if (r.pma !== null) { s.pma += r.pma; s.cP++; }
        if (r.pdrb !== null) { s.pdrb += r.pdrb; s.cD++; }
        if (r.miskin !== null) { s.miskin += r.miskin; s.cM++; }
        if (r.tpt !== null) { s.tpt += r.tpt; s.cT++; }
    });
    Object.keys(provSums).forEach(prov => {
        const s = provSums[prov];
        processedData.provinceAvg[prov] = {
            pma: s.cP ? s.pma / s.cP : 0,
            pdrb: s.cD ? s.pdrb / s.cD : 0,
            miskin: s.cM ? s.miskin / s.cM : 0,
            tpt: s.cT ? s.tpt / s.cT : 0,
        };
    });

    // Yearly trends
    YEARS.forEach(year => {
        let pT = 0, dS = 0, mS = 0, tS = 0, cD = 0, cM = 0, cT = 0;
        processedData.mergedRows.filter(r => r.tahun === year).forEach(r => {
            if (r.pma !== null) pT += r.pma;
            if (r.pdrb !== null) { dS += r.pdrb; cD++; }
            if (r.miskin !== null) { mS += r.miskin; cM++; }
            if (r.tpt !== null) { tS += r.tpt; cT++; }
        });
        processedData.yearlyTrend[year] = { pmaTotal: pT, pdrbAvg: cD ? dS / cD : 0, miskinAvg: cM ? mS / cM : 0, tptAvg: cT ? tS / cT : 0 };
    });

    // No need to dynamically calculate PDRB Stat Value, using static value 4.38% from PDF
}

// ---- SCROLL SPY ----
function initScrollSpy() {
    const sections = document.querySelectorAll('.dashboard-section');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tabBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-target') === id));
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    sections.forEach(s => observer.observe(s));
}

// ---- TAB CLICK ----
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) {
                const navH = document.getElementById('stickyNav').offsetHeight;
                window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navH - 10, behavior: 'smooth' });
            }
        });
    });
}

// ---- ANIMATED COUNTERS ----
function initCounters() {
    const counters = document.querySelectorAll('.counter-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.getAttribute('data-target'));
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
    const start = performance.now();
    const dur = 1500;
    const isFloat = target % 1 !== 0;
    function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        const v = target * e;
        el.textContent = (isFloat ? v.toFixed(2) : Math.round(v).toLocaleString('id-ID'));
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ---- SCROLL REVEAL ----
function initScrollReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
}

// ---- CHARTS ----
Chart.defaults.color = '#64748b';
Chart.defaults.font.family = 'Inter';

function createLineChart(id, label, data, color) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: YEARS,
            datasets: [{
                label, data,
                borderColor: color,
                backgroundColor: color + '1a',
                borderWidth: 2.5,
                pointBackgroundColor: '#fff',
                pointBorderColor: color,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
                fill: true,
                tension: 0.35,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
                y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } }
            },
            interaction: { mode: 'index', intersect: false },
        }
    });
}

function initCharts() {
    const t = processedData.yearlyTrend;
    createLineChart('fdiChart', 'Total PMA (Jt USD)', YEARS.map(y => +t[y].pmaTotal.toFixed(1)), TEAL);
    const pdrbGrowth = [5.40, 5.40, 5.50, 5.40, -1.70, 4.00, 5.60, 5.44];
    createLineChart('pdrbChart', 'Pertumbuhan (%)', pdrbGrowth, ORANGE);
    createLineChart('povertyChart', 'Kemiskinan (%)', YEARS.map(y => +t[y].miskinAvg.toFixed(2)), RED);
    createLineChart('tptChart', 'TPT (%)', YEARS.map(y => +t[y].tptAvg.toFixed(2)), BLUE);
    initTopProvChart();
    initBottomProvChart();
    initClusterCharts();
    initCorrelationMatrix();
    initRadarChart();
    initScatterChart();
    initCoefChart();
}

function initTopProvChart() {
    const ctx = document.getElementById('topProvChart');
    if (!ctx) return;
    const sorted = Object.entries(processedData.provinceAvg).sort((a, b) => b[1].pma - a[1].pma).slice(0, 10);
    const colors = sorted.map(([n]) => CLUSTER_0.includes(n) ? TEAL : ORANGE);
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([n]) => n.length > 20 ? n.substring(0, 18) + '…' : n),
            datasets: [{ label: 'Rata-rata PMA (Jt USD)', data: sorted.map(([, v]) => +v.pma.toFixed(1)), backgroundColor: colors.map(c => c + '33'), borderColor: colors, borderWidth: 1.5, borderRadius: 6 }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } }
        }
    });
}

function initBottomProvChart() {
    const ctx = document.getElementById('bottomProvChart');
    if (!ctx) return;
    const sorted = Object.entries(processedData.provinceAvg).sort((a, b) => a[1].pma - b[1].pma).slice(0, 10);
    const colors = sorted.map(([n]) => CLUSTER_0.includes(n) ? TEAL : ORANGE);
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([n]) => n.length > 20 ? n.substring(0, 18) + '…' : n),
            datasets: [{ label: 'Rata-rata PMA (Jt USD)', data: sorted.map(([, v]) => +v.pma.toFixed(1)), backgroundColor: colors.map(c => c + '33'), borderColor: colors, borderWidth: 1.5, borderRadius: 6 }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } }
        }
    });
}

function pearsonCorr(x, y) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    const n = x.length;
    for (let i = 0; i < n; i++) {
        sumX += x[i]; sumY += y[i]; sumXY += x[i]*y[i];
        sumX2 += x[i]*x[i]; sumY2 += y[i]*y[i];
    }
    const num = (n * sumXY) - (sumX * sumY);
    const den = Math.sqrt((n * sumX2 - sumX*sumX) * (n * sumY2 - sumY*sumY));
    if (den === 0) return 0;
    return num / den;
}

function initCorrelationMatrix() {
    const container = document.getElementById('corrMatrixContainer');
    if (!container) return;
    
    const vars = ['PMA', 'PDRB', 'Kemiskinan', 'TPT'];
    const matrix = [
        [1.00, 0.31, -0.23, 0.48],
        [0.31, 1.00, -0.03, -0.16],
        [-0.23, -0.03, 1.00, -0.30],
        [0.48, -0.16, -0.30, 1.00]
    ];
    
    let html = '<div style="display:flex; justify-content:center;"><table style="border-collapse: collapse; text-align:center; font-size:0.95rem;"><tr><th></th>';
    vars.forEach(v => html += `<th style="padding:15px; border:none; color:#475569; font-weight:600;">${v}</th>`);
    html += '</tr>';
    
    for (let i = 0; i < vars.length; i++) {
        html += `<tr><th style="padding:15px; text-align:right; border:none; color:#475569; font-weight:600;">${vars[i]}</th>`;
        for (let j = 0; j < vars.length; j++) {
            const v = matrix[i][j];
            const val = v.toFixed(2);
            let bg = '#ffffff';
            let color = '#334155';
            
            if (v === 1.00) {
                bg = '#b2182b'; // Dark Red
                color = '#ffffff';
            } else if (v > 0) {
                bg = `rgba(215, 48, 39, ${Math.min(v * 1.8, 1)})`;
                if (v > 0.4) color = '#ffffff';
            } else if (v < 0) {
                bg = `rgba(69, 117, 180, ${Math.min(Math.abs(v) * 2.5, 1)})`;
                if (Math.abs(v) > 0.2) color = '#ffffff';
            }
            
            html += `<td style="width:75px; height:75px; padding:0; font-weight:500; background:${bg}; color:${color}; border:1px solid #ffffff;">${val}</td>`;
        }
        html += '</tr>';
    }
    html += '</table></div>';
    container.innerHTML = html;
}

function initClusterCharts() {
    const ctxElbow = document.getElementById('elbowChart');
    if (ctxElbow) {
        new Chart(ctxElbow, {
            type: 'line',
            data: {
                labels: ['2', '3', '4', '5', '6', '7', '8'],
                datasets: [{ label: 'Inertia (SSE)', data: [94, 65, 43, 35, 28, 22, 18], borderColor: '#548299', backgroundColor: '#54829922', fill: false, tension: 0, pointBackgroundColor: '#548299', pointRadius: 4 }]
            },
            options: { 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { x: { title: { display: true, text: 'Jumlah Kluster (k)' }, grid: { color: '#f1f5f9' } }, y: { title: { display: true, text: 'Inertia (SSE)' }, grid: { color: '#f1f5f9' } } }
            }
        });
    }
    const ctxSil = document.getElementById('silhouetteChart');
    if (ctxSil) {
        new Chart(ctxSil, {
            type: 'line',
            data: {
                labels: ['2', '3', '4', '5', '6', '7', '8'],
                datasets: [{ label: 'Silhouette Score', data: [0.482, 0.478, 0.331, 0.263, 0.302, 0.337, 0.371], borderColor: '#de6c4c', backgroundColor: '#de6c4c22', fill: false, tension: 0, pointBackgroundColor: '#de6c4c', pointRadius: 4 }]
            },
            options: { 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { x: { title: { display: true, text: 'Jumlah Kluster (k)' }, grid: { color: '#f1f5f9' } }, y: { title: { display: true, text: 'Silhouette Score' }, grid: { color: '#f1f5f9' } } }
            }
        });
    }
}

function initRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['PMA', 'PDRB', 'Kemiskinan (inv.)', 'TPT (inv.)'],
            datasets: [
                { label: 'Klaster 0: Pusat Investasi', data: [90, 85, 85, 40], borderColor: TEAL, backgroundColor: TEAL + '22', borderWidth: 2, pointBackgroundColor: TEAL },
                { label: 'Klaster 1: Berkembang', data: [15, 35, 40, 70], borderColor: ORANGE, backgroundColor: ORANGE + '22', borderWidth: 2, pointBackgroundColor: ORANGE }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { beginAtZero: true, max: 100, grid: { color: '#e2e8f0' }, angleLines: { color: '#e2e8f0' }, pointLabels: { color: '#64748b', font: { size: 11 } }, ticks: { display: false } } },
            plugins: { legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 11 }, usePointStyle: true, padding: 15 } } }
        }
    });
}

function initScatterChart() {
    const ctx = document.getElementById('scatterChart');
    if (!ctx) return;
    const c0 = [], c1 = [];
    Object.entries(processedData.provinceAvg).forEach(([p, v]) => {
        if (v.pma > 0 && v.miskin > 0) {
            const pt = { x: v.pma, y: v.miskin, label: p };
            (CLUSTER_0.includes(p) ? c0 : c1).push(pt);
        }
    });
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                { label: 'Klaster 0', data: c0, backgroundColor: TEAL + 'cc', borderColor: TEAL, pointRadius: 7, pointHoverRadius: 10 },
                { label: 'Klaster 1', data: c1, backgroundColor: ORANGE + '80', borderColor: ORANGE, pointRadius: 5, pointHoverRadius: 8 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'PMA (Jt USD)', color: '#64748b' }, grid: { color: '#f1f5f9' } },
                y: { title: { display: true, text: 'Kemiskinan (%)', color: '#64748b' }, grid: { color: '#f1f5f9' } }
            },
            plugins: {
                legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 11 }, usePointStyle: true, padding: 15 } },
                tooltip: { callbacks: { label: c => `${c.raw.label}: PMA ${c.raw.x.toFixed(1)}, Miskin ${c.raw.y.toFixed(2)}%` } }
            }
        }
    });
}

function initCoefChart() {
    const ctx = document.getElementById('coefChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['PMA → Pertumbuhan PDRB (β=0.00077)', 'PMA → Kemiskinan (β=−0.00015)', 'PMA → TPT (β=−0.00009)'],
            datasets: [{ label: 'Koefisien', data: [0.00077, -0.00015, -0.00009], backgroundColor: [TEAL + '55', TEAL + '55', TEAL + '55'], borderColor: [TEAL, TEAL, TEAL], borderWidth: 1.5, borderRadius: 6 }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } }
        }
    });
}

// ---- LEAFLET MAPS ----
let fdiMapInstance = null;
let clusterMapInstance = null;
let geojsonData = null;

function getColorByPMA(val) {
    if (!val || val <= 0) return '#f8fafc';
    if (val < 100) return '#ffffcc';
    if (val < 500) return '#a1dab4';
    if (val < 1500) return '#41b6c4';
    if (val < 3000) return '#2c7fb8';
    return '#253494';
}

function getClusterColor(provName) {
    return CLUSTER_0.includes(provName) ? TEAL : ORANGE;
}

function resolveProvName(geojsonName) {
    // Try direct match first
    if (GEOJSON_TO_CSV[geojsonName]) return GEOJSON_TO_CSV[geojsonName];
    // Try uppercase
    const upper = geojsonName.toUpperCase();
    if (GEOJSON_TO_CSV[upper]) return GEOJSON_TO_CSV[upper];
    // Try finding in provinceAvg keys
    for (const key of Object.keys(processedData.provinceAvg)) {
        if (key.toUpperCase() === upper) return key;
        if (upper.includes(key) || key.includes(upper)) return key;
    }
    return null;
}

function initLeafletMap(containerId, mode) {
    const container = document.getElementById(containerId);
    if (!container || !INA_GEOJSON) return null;

    const map = L.map(containerId, {
        center: [-2.5, 118],
        zoom: 5,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: false,
    });

    // Light tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 10,
        minZoom: 3,
    }).addTo(map);

    const pmaValues = Object.values(processedData.provinceAvg).map(p => p.pma).filter(v => v > 0);
    const maxPma = Math.max(...pmaValues);

    const geoJsonLayer = L.geoJSON(INA_GEOJSON, {
        style: function(feature) {
            const props = feature.properties;
            const geoName = props.state || props.Propinsi || props.name || props.NAME_1 || '';
            const csvName = resolveProvName(geoName);
            const avg = csvName ? processedData.provinceAvg[csvName] : null;

            let fillColor;
            if (mode === 'fdi') {
                fillColor = avg ? getColorByPMA(avg.pma) : '#f8fafc';
            } else {
                fillColor = csvName ? getClusterColor(csvName) : '#e2e8f0';
            }

            return {
                fillColor: fillColor,
                weight: 1,
                opacity: 1,
                color: '#ffffff',
                fillOpacity: 0.85,
            };
        },
        onEachFeature: function(feature, layer) {
            const props = feature.properties;
            const geoName = props.state || props.Propinsi || props.name || props.NAME_1 || '';
            const csvName = resolveProvName(geoName);
            const avg = csvName ? processedData.provinceAvg[csvName] : null;

            let tooltipHtml = `<div style="font-family:Inter,sans-serif;font-size:13px;"><strong>${csvName || geoName}</strong><br>`;
            if (avg) {
                tooltipHtml += `PMA: <b>${avg.pma.toFixed(1)}</b> Jt USD<br>`;
                tooltipHtml += `PDRB/Kap: <b>${avg.pdrb > 0 ? avg.pdrb.toFixed(0) : 'N/A'}</b> Rb Rp<br>`;
                tooltipHtml += `Kemiskinan: <b>${avg.miskin > 0 ? avg.miskin.toFixed(2) + '%' : 'N/A'}</b><br>`;
                tooltipHtml += `TPT: <b>${avg.tpt > 0 ? avg.tpt.toFixed(2) + '%' : 'N/A'}</b><br>`;
                tooltipHtml += `Klaster: <b style="color:${CLUSTER_0.includes(csvName) ? TEAL : ORANGE}">${CLUSTER_0.includes(csvName) ? '0 (Pusat)' : '1 (Berkembang)'}</b>`;
            } else {
                tooltipHtml += `<span style="color:#94a3b8;">Data tidak tersedia</span>`;
            }
            tooltipHtml += '</div>';

            layer.bindTooltip(tooltipHtml, { sticky: true, direction: 'top', offset: [0, -10] });

            layer.on({
                mouseover: function(e) {
                    e.target.setStyle({ weight: 3, color: mode === 'cluster' ? (csvName && CLUSTER_0.includes(csvName) ? TEAL : ORANGE) : TEAL, fillOpacity: 0.95 });
                    e.target.bringToFront();
                },
                mouseout: function(e) {
                    e.target.setStyle({ weight: 1.5, color: '#ffffff', fillOpacity: 0.85 });
                }
            });
        }
    });
    
    geoJsonLayer.addTo(map);

    // Bring small provinces to front so they aren't hidden by larger neighbors
    setTimeout(() => {
        geoJsonLayer.eachLayer(function(layer) {
            const name = layer.feature.properties.state || layer.feature.properties.Propinsi || layer.feature.properties.name || layer.feature.properties.NAME_1 || '';
            if (name === 'Jakarta Raya' || name === 'Yogyakarta' || name === 'DKI Jakarta') {
                layer.bringToFront();
            }
        });
    }, 500);

    // Add legend for FDI map
    if (mode === 'fdi') {
        const legendEl = document.getElementById('fdiMapLegend');
        if (legendEl) {
            legendEl.innerHTML = `
                <div class="legend-item"><div class="legend-color" style="background:#ffffcc; border:1px solid #e2e8f0;"></div> &lt; 100</div>
                <div class="legend-item"><div class="legend-color" style="background:#a1dab4"></div> 100 - 500</div>
                <div class="legend-item"><div class="legend-color" style="background:#41b6c4"></div> 500 - 1500</div>
                <div class="legend-item"><div class="legend-color" style="background:#2c7fb8"></div> 1500 - 3000</div>
                <div class="legend-item"><div class="legend-color" style="background:#253494"></div> &gt; 3000</div>
            `;
        }
    }

    return map;
}

// ---- DATA TABLE ----
function populateTable() {
    const tbody = document.getElementById('dataTableBody');
    const countEl = document.getElementById('rowCount');
    if (!tbody) return;

    const rows = processedData.mergedRows.filter(r => r.pma !== null || r.pdrb !== null);

    function renderRows(data) {
        tbody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.tahun}</td>
                <td style="text-align:left;font-weight:500;">${row.provinsi}</td>
                <td>${row.pma !== null ? row.pma.toFixed(1) : '–'}</td>
                <td>${row.pdrb !== null ? row.pdrb.toFixed(0) : '–'}</td>
                <td>${row.miskin !== null ? row.miskin.toFixed(2) : '–'}</td>
                <td>${row.tpt !== null ? row.tpt.toFixed(2) : '–'}</td>
            `;
            tbody.appendChild(tr);
        });
        if (countEl) countEl.textContent = `Menampilkan ${data.length} baris data`;
    }
    renderRows(rows);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            renderRows(q ? rows.filter(r => r.provinsi.toLowerCase().includes(q) || r.tahun.includes(q)) : rows);
        });
    }
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    processData();
    initScrollSpy();
    initTabs();
    initScrollReveal();
    initCharts();
    populateTable();
    setTimeout(initCounters, 300);

    // Init maps using globally defined INA_GEOJSON from indonesia_map.js
    if (typeof INA_GEOJSON !== 'undefined') {
        fdiMapInstance = initLeafletMap('fdiMap', 'fdi');
        clusterMapInstance = initLeafletMap('clusterMap', 'cluster');
    } else {
        console.error('Failed to load GeoJSON data from indonesia_map.js');
        document.getElementById('fdiMap').innerHTML = '<p style="text-align:center;padding:2rem;color:#94a3b8;">Peta tidak dapat dimuat. Pastikan file indonesia_map.js tersedia.</p>';
        document.getElementById('clusterMap').innerHTML = '<p style="text-align:center;padding:2rem;color:#94a3b8;">Peta tidak dapat dimuat. Pastikan file indonesia_map.js tersedia.</p>';
    }
});
