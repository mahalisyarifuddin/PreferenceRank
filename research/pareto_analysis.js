const algos = ['3-Way Quicksort', '3-way Merge Sort', '4-way Merge Sort', 'Binary Insertion', 'Bitonic Sort', 'BlockQuicksort', 'BogoBogoSort', 'Bogosort', 'Bottom-up Merge Sort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'In-place Merge Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Natural Merge Sort', 'Odd-Even Sort', 'Pancake Sort', 'Parallel Merge Sort', 'Parallel Quicksort', 'Patience Sort', 'Ping-pong Merge Sort', 'Powersort', 'Quantum Bogo', 'Quicksort (Hoare)', 'Quicksort (LTR)', 'Quicksort (Middle)', 'Quicksort (Mo3)', 'Quicksort (Ninther)', 'Quicksort (RTL)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stable Quicksort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Timsort', 'Tournament Sort', 'Tree Sort', 'Triple-Pivot Quicksort'];
const battles = [101.19, 567.15, 543.3, 530.86, 1035.66, 720.97, 45.56, 4950.0, 557.2, 2560.32, 1205.12, 2755.45, 2566.22, 851.0, 581.33, 2772.62, 484.71, 0.0, 526.9, 4950.0, 99.0, 2582.75, 196.07, 935.63, 100.48, 541.33, 2571.94, 0.0, 724.48, 541.16, 99.0, 577.83, 2593.64, 3079.58, 558.4, 650.79, 198.38, 558.7, 1790.22, 1.78, 105.76, 646.63, 645.36, 708.9, 605.56, 647.26, 643.12, 229.83, 2753.81, 669.95, 138.0, 100.0, 1322.42, 98.56, 0.0, 641.46, 99.0, 2891.3, 745.1, 99.0, 1020.77, 557.8, 649.35, 533.7];
const tau = [0.3487, 0.8811, 0.9032, 0.8875, 0.9574, 0.8071, 0.0853, 1.0, 0.8861, 0.8019, 0.9695, 0.9221, 0.8064, 0.9746, 0.4134, 0.9229, 0.8373, -0.0048, 0.8898, 1.0, 0.3382, 0.8016, 0.662, 0.7844, 0.4839, 0.903, 0.8012, -0.0017, 0.8071, 0.904, 0.545, 0.8936, 0.8047, 0.9683, 0.8864, 0.8363, 0.4812, 0.8873, 0.7974, 0.0145, 0.4137, 0.8367, 0.8361, 0.8276, 0.8412, 0.8367, 0.8366, 0.6279, 0.8901, 0.9327, 0.2438, 0.0007, 0.9498, 0.478, -0.0037, 0.8367, 0.0971, 0.9899, 0.8206, 0.5427, 0.881, 0.888, 0.8373, 0.8293];
const dups = [true, false, false, false, true, false, true, true, false, true, true, true, true, true, true, true, false, false, false, false, false, true, true, true, true, false, false, false, false, false, false, true, true, true, false, false, true, false, true, false, true, false, false, true, true, false, false, true, true, true, true, false, true, true, false, false, false, true, false, true, false, false, false, true];

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
