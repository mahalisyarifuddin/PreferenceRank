const algos = ['3-Way Quicksort', '3-way Merge Sort', '4-way Merge Sort', 'Binary Insertion', 'Bitonic Sort', 'BlockQuicksort', 'BogoBogoSort', 'Bogosort', 'Bottom-up Merge Sort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'In-place Merge Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Natural Merge Sort', 'Odd-Even Sort', 'Pancake Sort', 'Parallel Merge Sort', 'Parallel Quicksort', 'Patience Sort', 'Ping-pong Merge Sort', 'Powersort', 'Quantum Bogo', 'Quicksort (Hoare)', 'Quicksort (LTR)', 'Quicksort (Middle)', 'Quicksort (Mo3)', 'Quicksort (Ninther)', 'Quicksort (RTL)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stable Quicksort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Timsort', 'Tournament Sort', 'Tree Sort', 'Triple-Pivot Quicksort'];
const battles = [101.48, 568.17, 543.63, 531.08, 1037.29, 719.53, 44.12, 4950.0, 559.5, 2573.69, 1212.07, 2770.76, 2596.14, 851.18, 517.46, 2782.18, 643.67, 0.0, 526.99, 4950.0, 99.0, 2580.36, 195.91, 939.88, 97.42, 541.74, 2554.97, 0.0, 719.22, 541.99, 99.0, 576.67, 2612.7, 3078.48, 557.78, 648.99, 198.22, 558.46, 562.72, 1.75, 205.33, 645.79, 647.15, 701.46, 604.3, 647.97, 641.96, 233.29, 2737.31, 670.18, 138.0, 100.0, 1324.86, 100.25, 0.0, 655.29, 99.0, 2875.11, 746.43, 99.0, 533.38, 557.73, 651.63, 531.03];
const tau = [0.3641, 0.8801, 0.9025, 0.8867, 0.9574, 0.808, 0.084, 1.0, 0.8868, 0.8029, 0.9696, 0.9227, 0.8081, 0.9745, 0.4358, 0.9229, 0.8368, -0.0013, 0.8892, 1.0, 0.3497, 0.8029, 0.6646, 0.7841, 0.4792, 0.9031, 0.8004, -0.0038, 0.8067, 0.904, 0.5428, 0.8919, 0.8065, 0.9684, 0.8865, 0.8373, 0.4732, 0.8866, 0.9088, 0.0096, 0.5223, 0.8374, 0.8375, 0.8277, 0.8418, 0.8381, 0.8365, 0.6401, 0.8909, 0.9319, 0.2403, 0.0036, 0.9484, 0.4827, -0.0071, 0.8366, 0.0983, 0.99, 0.823, 0.544, 0.8971, 0.8874, 0.8371, 0.8292];
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
