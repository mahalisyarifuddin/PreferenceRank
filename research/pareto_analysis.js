const algos = ['Binary Insertion', 'Bitonic Sort', 'BogoBogoSort', 'Bogosort', 'Bozosort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Odd-Even Sort', 'Pancake Sort', 'Patience Sort', 'Quantum Bogo', 'Quicksort', 'Quicksort (LTR)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Tournament Sort', 'Tree Sort'];
const battles = [532.5, 1334.0, 4950.0, 4950.0, 4950.0, 4888.5, 2148.8, 4950.0, 3974.0, 1240.6, 4950.0, 4950.0, 500.8, 0.0, 526.9, 4950.0, 99.0, 4915.1, 200.0, 944.9, 143.1, 2551.1, 0.0, 411.8, 541.1, 99.0, 4653.0, 4950.0, 243.2, 1.5, 612.7, 624.1, 655.6, 286.9, 4950.0, 727.4, 4950.0, 100.0, 4950.0, 144.8, 0.0, 99.0, 4950.0, 702.6, 190.0, 558.8, 663.1];
const tau     = [0.8864, 0.9505, 0.1042, 0.9758, 0.6042, 0.9727, 0.9726, 0.9463, 0.9808, 0.9908, 0.3718, 0.9434, 0.8404, 0.019, 0.8851, 1.0, 0.3038, 0.957, 0.6535, 0.7791, 0.4577, 0.8021, 0.0053, 0.8641, 0.9081, 0.5403, 0.9892, 0.975, 0.4531, -0.0172, 0.8364, 0.8321, 0.8362, 0.7137, 0.9323, 0.9398, 0.0821, 0.0259, 0.4644, 0.4684, -0.0166, 0.0893, 0.2665, 0.8137, 0.5385, 0.8796, 0.8354];

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
