const algos = ['3-Way Quicksort', '3-way Merge Sort', '4-way Merge Sort', 'Binary Insertion', 'Bitonic Sort', 'BlockQuicksort', 'BogoBogoSort', 'Bogosort', 'Bottom-up Merge Sort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'In-place Merge Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Natural Merge Sort', 'Odd-Even Sort', 'Pancake Sort', 'Parallel Merge Sort', 'Parallel Quicksort', 'Patience Sort', 'Ping-pong Merge Sort', 'Powersort', 'Quantum Bogo', 'Quicksort (Hoare)', 'Quicksort (LTR)', 'Quicksort (Middle)', 'Quicksort (Mo3)', 'Quicksort (Ninther)', 'Quicksort (RTL)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stable Quicksort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Timsort', 'Tournament Sort', 'Tree Sort', 'Triple-Pivot Quicksort'];
const battles = [100.4, 567.9, 543.62, 530.8, 1036.58, 714.08, 44.56, 4950.0, 558.4, 2553.59, 1212.3, 2745.26, 2588.4, 851.79, 497.28, 2756.6, 644.26, 0.0, 526.97, 4950.0, 99.0, 2568.57, 196.19, 934.54, 100.81, 541.85, 2570.98, 0.0, 717.42, 542.26, 99.0, 577.77, 2609.19, 3110.75, 558.61, 645.48, 197.99, 558.2, 562.91, 1.7, 201.05, 647.63, 654.52, 715.34, 603.94, 650.37, 645.84, 257.53, 2752.82, 669.93, 138.0, 100.0, 1320.97, 99.36, 0.0, 651.68, 99.0, 2889.56, 742.84, 99.0, 532.33, 558.21, 642.21, 531.33];
const tau = [0.3414, 0.8802, 0.9022, 0.887, 0.9567, 0.8067, 0.0895, 1.0, 0.8873, 0.8007, 0.9692, 0.9233, 0.8078, 0.9747, 0.4095, 0.9234, 0.8367, -0.0048, 0.8898, 1.0, 0.3484, 0.8019, 0.6643, 0.783, 0.4841, 0.9034, 0.8043, -0.0009, 0.8066, 0.9054, 0.5505, 0.8929, 0.8049, 0.9698, 0.8868, 0.8366, 0.4822, 0.8853, 0.9079, 0.024, 0.5212, 0.8376, 0.8368, 0.8278, 0.8414, 0.838, 0.837, 0.6674, 0.8899, 0.9326, 0.2431, -0.0061, 0.9486, 0.4767, -0.0093, 0.8365, 0.1069, 0.9902, 0.8196, 0.5452, 0.8962, 0.888, 0.8362, 0.8274];
const dups = [true, false, false, false, true, false, true, true, false, true, true, true, true, true, true, true, false, false, false, false, false, true, true, true, true, false, false, false, false, false, false, true, true, true, false, false, true, false, true, false, true, false, false, true, true, false, false, true, true, true, true, false, true, true, false, false, false, true, false, true, true, false, false, true];

function pareto_mask(x, y, d) {
    const n = x.length, mask = new Array(n).fill(true);
    for (let i = 0; i < n; i++) {
        if (d[i]) { mask[i] = false; continue; }
        for (let j = 0; j < n; j++)
            if (i !== j && !d[j] && x[j] <= x[i] && y[j] >= y[i] && (x[j] < x[i] || y[j] > y[i])) { mask[i] = false; break; }
    }
    return mask;
}

const pmask = pareto_mask(battles, tau, dups);
const pareto_pts = algos.map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i], d: dups[i] }))
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
let max_diff = -1, kneedle_idx = -1;
for (let i = 0; i < xs_n.length; i++) {
    const diff = ys_n[i] - xs_n[i];
    if (diff > max_diff) { max_diff = diff; kneedle_idx = i; }
}

const perp_knee = pareto_pts[perp_knee_idx];
const kneedle_knee = pareto_pts[kneedle_idx];

console.log("Pareto-optimal algorithms (N=100, NO DUPLICATES ONLY):");
for (const p of pareto_pts) {
    let markers = "";
    if (p.name === perp_knee.name) markers += "  <-- MAX PERP KNEE";
    if (p.name === kneedle_knee.name) markers += "  <-- KNEEDLE KNEE";
    console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}${markers}`);
}

console.log("\nDominated algorithms (or Duplicates):");
const dominated = algos.map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i], d: dups[i] }))
    .filter(p => !p.m).sort((a, b) => a.b - b.b);
for (const p of dominated) console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}${p.d ? ' [DUP]' : ''}`);
