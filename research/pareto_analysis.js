const algos = ['Binary Insertion', 'Bitonic Sort', 'BogoBogoSort', 'Bogosort', 'Bozosort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Odd-Even Sort', 'Pancake Sort', 'Parallel Merge Sort', 'Patience Sort', 'Quantum Bogo', 'Quicksort (LTR)', 'Quicksort (RTL)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Tournament Sort', 'Tree Sort'];
const battles = [532.2, 1334.0, 4950.0, 4950.0, 4950.0, 4886.0, 2180.4, 4950.0, 3844.8, 1240.6, 4950.0, 4950.0, 481.5, 0.0, 526.1, 4950.0, 99.0, 4857.5, 200.0, 919.5, 148.4, 2534.5, 0.0, 402.1, 541.8, 99.0, 4722.3, 4950.0, 560.5, 245.2, 2.0, 627.6, 643.4, 669.8, 199.9, 4950.0, 731.1, 4950.0, 100.0, 4950.0, 155.0, 0.0, 99.0, 4950.0, 745.8, 190.0, 559.0, 656.1];
const tau     = [0.8873, 0.9482, 0.0418, 0.9809, 0.5693, 0.9721, 0.9728, 0.9478, 0.9787, 0.9909, 0.4049, 0.9427, 0.8351, -0.0305, 0.8866, 1.0, 0.3277, 0.9486, 0.6546, 0.7874, 0.4863, 0.8076, -0.0489, 0.8538, 0.904, 0.5384, 0.9891, 0.9756, 0.8857, 0.4737, 0.0398, 0.8341, 0.8396, 0.8389, 0.5305, 0.9329, 0.944, 0.1081, 0.0345, 0.4585, 0.4589, 0.0014, 0.084, 0.279, 0.8183, 0.5288, 0.8807, 0.838];

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
