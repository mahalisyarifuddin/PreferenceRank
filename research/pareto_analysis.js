const algos = ['Binary Insertion', 'Bitonic Sort', 'BogoBogoSort', 'Bogosort', 'Bozosort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Odd-Even Sort', 'Pancake Sort', 'Parallel Merge Sort', 'Patience Sort', 'Quantum Bogo', 'Quicksort (LTR)', 'Quicksort (RTL)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Tournament Sort', 'Tree Sort'];
const battles = [530.07, 1334.0, 4950.0, 4950.0, 4950.0, 4890.31, 2221.48, 4950.0, 3888.84, 1242.58, 4950.0, 4950.0, 481.19, 0.0, 527.05, 4950.0, 99.0, 4847.01, 200.0, 951.19, 150.66, 2558.51, 0.0, 393.4, 541.53, 99.0, 4712.4, 4950.0, 559.65, 248.23, 1.78, 643.17, 648.81, 645.64, 264.94, 4950.0, 734.36, 4950.0, 100.0, 4950.0, 151.44, 0.0, 99.0, 4950.0, 747.55, 190.0, 557.57, 641.35];
const tau     = [0.8889, 0.9496, 0.0677, 0.9789, 0.5866, 0.9721, 0.9743, 0.9479, 0.9779, 0.9904, 0.4901, 0.9417, 0.8348, 0.004, 0.8877, 1.0, 0.3556, 0.9597, 0.6613, 0.7884, 0.4814, 0.8016, -0.0024, 0.8071, 0.9037, 0.5423, 0.9892, 0.976, 0.8862, 0.4662, 0.0082, 0.8373, 0.838, 0.8365, 0.6487, 0.9336, 0.9432, 0.127, 0.0106, 0.4634, 0.4853, 0.0077, 0.0933, 0.2942, 0.8199, 0.5373, 0.8872, 0.8379];

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
