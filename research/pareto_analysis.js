const algos = ['Binary Insertion', 'Bitonic Sort', 'BogoBogoSort', 'Bogosort', 'Bozosort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Odd-Even Sort', 'Pancake Sort', 'Patience Sort', 'Quantum Bogo', 'Quicksort', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Tournament Sort', 'Tree Sort'];
const battles = [530.2, 1334.0, 4950.0, 4950.0, 4950.0, 4886.7, 2148.8, 4950.0, 3942.2, 1260.4, 4950.0, 4950.0, 484.6, 0.0, 526.7, 4950.0, 99.0, 4921.1, 200.0, 928.5, 146.1, 2591.7, 0.0, 407.7, 542.9, 99.0, 4742.1, 4950.0, 250.7, 1.7, 637.6, 176.5, 4950.0, 744.4, 4950.0, 100.0, 4950.0, 141.8, 0.0, 99.0, 4950.0, 736.8, 190.0, 552.7, 679.7];
const tau     = [0.885, 0.9503, 0.0391, 0.9799, 0.6008, 0.973, 0.9733, 0.946, 0.9766, 0.9906, 0.3437, 0.941, 0.8255, 0.0404, 0.8925, 1.0, 0.3765, 0.9517, 0.6513, 0.7728, 0.4937, 0.8034, -0.0036, 0.8538, 0.9036, 0.5541, 0.9874, 0.9756, 0.5142, 0.0516, 0.8416, 0.5124, 0.9354, 0.9434, 0.1095, 0.0046, 0.4712, 0.4803, -0.0389, 0.1075, 0.2829, 0.8183, 0.5288, 0.8869, 0.8392];

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
