const algos = ['Binary Insertion', 'Bitonic Sort', 'BogoBogoSort', 'Bogosort', 'Bozosort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Odd-Even Sort', 'Pancake Sort', 'Parallel Merge Sort', 'Patience Sort', 'Quantum Bogo', 'Quicksort (LTR)', 'Quicksort (RTL)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Tournament Sort', 'Tree Sort'];
const battles = [530.97, 1334.0, 4950.0, 4950.0, 4950.0, 4880.82, 2186.72, 4950.0, 3898.81, 1241.39, 4950.0, 4950.0, 489.0, 0.0, 526.82, 4950.0, 99.0, 4872.93, 200.0, 931.62, 151.39, 2560.82, 0.0, 401.3, 541.69, 99.0, 4656.17, 4950.0, 559.08, 251.28, 1.69, 642.94, 646.87, 651.45, 263.36, 4950.0, 732.02, 4950.0, 100.0, 4950.0, 151.71, 0.0, 99.0, 4950.0, 744.11, 190.0, 558.48, 653.91];
const tau     = [0.8875, 0.9491, 0.0723, 0.979, 0.5863, 0.972, 0.974, 0.9477, 0.9784, 0.9899, 0.4609, 0.9414, 0.8364, -0.0036, 0.8893, 1.0, 0.3553, 0.9598, 0.6639, 0.7845, 0.485, 0.803, 0.0026, 0.8263, 0.9037, 0.549, 0.9878, 0.9754, 0.8877, 0.4758, 0.0155, 0.837, 0.8363, 0.8367, 0.6546, 0.9336, 0.9424, 0.1305, 0.0066, 0.4597, 0.4801, 0.0022, 0.1033, 0.2914, 0.82, 0.5306, 0.8865, 0.8369];

function pareto_mask(x, y) {
    const n = x.length, mask = new Array(n).fill(true);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
        if (i !== j && x[j] <= x[i] && y[j] >= y[i] && (x[j] < x[i] || y[j] > y[i])) { mask[i] = false; break; }
    return mask;
}

const pmask = pareto_mask(battles, tau);
const pareto_pts = algos.map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i] }))
    .filter(p => p.m)
    .sort((a, b) => a.b - b.b); // ENSURE POINTS ARE ORDERED BY COST

const pb = pareto_pts.map(p => p.b), pt = pareto_pts.map(p => p.t);
const b_min = Math.min(...pb), b_max = Math.max(...pb), t_min = Math.min(...pt), t_max = Math.max(...pt);
const xs_n = pb.map(b => (b - b_min) / (b_max - b_min)), ys_n = pt.map(t => (t - t_min) / (t_max - t_min));

// Method 1: Max Perpendicular Distance from Endpoint Chord
let max_dist = -1, perp_knee_idx = -1;
const x1n = xs_n[0], y1n = ys_n[0], x2n = xs_n[xs_n.length - 1], y2n = ys_n[ys_n.length - 1];
for (let i = 0; i < xs_n.length; i++) {
    const num = Math.abs((y2n - y1n) * xs_n[i] - (x2n - x1n) * ys_n[i] + x2n * y1n - y2n * x1n);
    const den = Math.sqrt(Math.pow(y2n - y1n, 2) + Math.pow(x2n - x1n, 2));
    const dist = num / den;
    if (dist > max_dist) { max_dist = dist; perp_knee_idx = i; }
}

// Method 2: Kneedle (Difference Curve)
// Maximizes the difference between normalized accuracy and normalized cost.
// For a Pareto frontier where we want to maximize y and minimize x, the knee is where y - x is largest.
let max_diff = -1, kneedle_idx = -1;
for (let i = 0; i < xs_n.length; i++) {
    const diff = ys_n[i] - xs_n[i];
    if (diff > max_diff) { max_diff = diff; kneedle_idx = i; }
}

const perp_knee = pareto_pts[perp_knee_idx];
const kneedle_knee = pareto_pts[kneedle_idx];

console.log("Pareto-optimal algorithms (N=100):");
for (const p of pareto_pts) {
    let markers = "";
    if (p.name === "Shellsort") markers += "  <-- PROD";
    if (p.name === perp_knee.name) markers += "  <-- MAX PERP KNEE";
    if (p.name === kneedle_knee.name) markers += "  <-- KNEEDLE KNEE";
    console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}${markers}`);
}

console.log("\nDominated algorithms:");
const dominated = algos.map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i] }))
    .filter(p => !p.m).sort((a, b) => a.b - b.b);
for (const p of dominated) console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}`);
