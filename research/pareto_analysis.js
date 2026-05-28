const algos = ["Binary Insertion", "Bitonic Sort", "BogoBogoSort", "Bogosort", "Bozosort", "Bubble Sort", "Circle Sort", "Cocktail Selection", "Cocktail Shaker", "Comb Sort", "Cycle Sort", "Double Selection", "Dual-Pivot Quicksort", "Exit Sort", "Ford-Johnson", "Full Rank", "Genghis Khan Sort", "Gnome Sort", "Hater Sort", "Hayate-Shiki", "Heap Sort", "Insertion Sort", "Intelligent Design", "Intro Sort", "Merge Sort", "Miracle Sort", "Odd-Even Sort", "Pancake Sort", "Parallel Merge Sort", "Patience Sort", "Quantum Bogo", "Quicksort (LTR)", "Quicksort (RTL)", "Quicksort (Random)", "Random Sort", "Selection Sort", "Shellsort", "Silly Sort", "Sleep Sort", "Slowsort", "Smooth Sort", "Socialist Sort", "Stalin Sort", "Stooge Sort", "Strand Sort", "Thanos Sort", "Tournament Sort", "Tree Sort"];
const battles = [530.76, 1035.97, 45.6, 4950.0, 4946.39, 2563.98, 1210.0, 2744.18, 2573.89, 851.43, 572.37, 2769.61, 485.4, 0.0, 526.72, 4950.0, 99.0, 2574.47, 196.14, 934.28, 99.7, 2575.17, 0.0, 405.66, 542.29, 99.0, 2592.74, 3079.34, 558.87, 198.08, 1.72, 652.17, 646.58, 650.82, 250.53, 2747.26, 669.23, 138.0, 100.0, 1322.96, 98.84, 0.0, 99.0, 2877.67, 743.75, 99.0, 558.24, 643.69];
const tau = [0.8883, 0.9578, 0.0882, 1.0, 1.0, 0.8032, 0.9695, 0.9223, 0.807, 0.9747, 0.4612, 0.9226, 0.8329, 0.0058, 0.8892, 1.0, 0.3416, 0.802, 0.6618, 0.7874, 0.483, 0.803, -0.0028, 0.8408, 0.9022, 0.5431, 0.8044, 0.9688, 0.887, 0.4825, 0.0167, 0.8367, 0.8372, 0.837, 0.6546, 0.8898, 0.9326, 0.2396, 0.0085, 0.9458, 0.4795, -0.0004, 0.1031, 0.9899, 0.8179, 0.5433, 0.8871, 0.8371];
const dups = [false, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, true, true, true, true, false, false, true, false, false, true, true, false, true, false, false, false, false, true, true, true, true, false, true, true, false, false, true, false, true, false, false];

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
