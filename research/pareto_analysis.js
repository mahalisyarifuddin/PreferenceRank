const algos = ["Miracle Sort", "Intelligent Design", "Quantum Bogo", "Ford-Johnson", "Quicksort (Random)", "Intro Sort", "Merge Sort", "Quicksort (Middle)", "Bottom-up Merge Sort", "Strand Sort", "Patience Sort", "Quicksort (Mo3)", "Natural Merge Sort", "Smooth Sort", "Ping-pong Merge Sort", "Quicksort (Ninther)", "Gnome Sort", "3-way Merge Sort", "Circle Sort", "4-way Merge Sort", "In-place Merge Sort", "Rotation Merge Sort", "Timsort", "Powersort", "Parallel Merge Sort", "Double Selection", "Hayate-Shiki", "Shellsort", "Quicksort (RTL)", "Cocktail Selection", "Socialist Sort", "Genghis Khan Sort", "Hater Sort", "Exit Sort", "Random Sort", "Stooge Sort", "Silly Sort", "Sleep Sort", "Radix Sort", "Quicksort (LTR)", "Quicksort (Hoare)", "3-Way Quicksort", "Dual-Pivot Quicksort", "Triple-Pivot Quicksort", "Stable Quicksort", "BlockQuicksort", "PDQSort", "Bogosort", "Parallel Quicksort", "Bubble Sort", "Bucket Sort", "Full Rank", "Selection Sort", "Insertion Sort", "Binary Insertion", "Cycle Sort", "Bitonic Sort", "Heap Sort", "Comb Sort", "Tournament Sort", "Odd-Even Sort", "Slowsort", "Pancake Sort", "Cocktail Shaker", "Tree Sort", "BogoBogoSort", "Stalin Sort", "Thanos Sort"];
const battles = [99.0, 0.0, 1.66, 527.0, 644.97, 722.48, 542.1, 651.15, 558.58, 752.38, 198.63, 714.68, 576.91, 99.1, 558.01, 605.08, 2559.98, 567.92, 1205.53, 543.85, 541.79, 719.14, 532.86, 562.2, 558.36, 2778.82, 930.26, 670.9, 652.68, 2769.04, 0.0, 99.0, 195.92, 0.0, 227.79, 2889.1, 138.0, 100.0, 4555.54, 645.43, 202.81, 100.4, 651.6, 534.81, 651.68, 712.38, 194.04, 4950.0, 640.13, 2571.98, 777.16, 4950.0, 2757.05, 2569.62, 530.58, 493.04, 1036.59, 99.63, 852.84, 558.23, 2585.9, 1323.76, 3083.51, 2591.84, 650.48, 45.08, 99.0, 99.0];
const tau = [0.5443, -0.0023, 0.015, 0.8881, 0.8364, 0.808, 0.9047, 0.8371, 0.8872, 0.8175, 0.4815, 0.8273, 0.8936, 0.4819, 0.8861, 0.8424, 0.8021, 0.8801, 0.9689, 0.9035, 0.9037, 0.9162, 0.8958, 0.9067, 0.8869, 0.922, 0.7829, 0.9323, 0.8365, 0.9232, 0.0051, 0.3413, 0.6617, -0.0032, 0.6268, 0.99, 0.2409, 0.0042, 0.9493, 0.8367, 0.5319, 0.3521, 0.8368, 0.8273, 0.8371, 0.8074, 0.5397, 1.0, 0.8366, 0.8024, 0.7984, 1.0, 0.8894, 0.8023, 0.8876, 0.4458, 0.9578, 0.4831, 0.9747, 0.8862, 0.8037, 0.9483, 0.9688, 0.8087, 0.8373, 0.0897, 0.0962, 0.5432];
const dups = [false, false, false, false, false, false, false, false, false, false, true, true, true, true, false, true, true, false, true, false, false, false, true, true, false, true, true, true, false, true, false, false, true, false, true, true, true, false, true, false, true, true, false, true, false, false, true, true, false, true, false, false, true, false, false, true, true, true, true, false, true, true, true, true, false, true, false, true];


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

const pb_log = pareto_pts.map(p => Math.log10(p.b + 1)), pt = pareto_pts.map(p => p.t);
const b_min = Math.min(...pb_log), b_max = Math.max(...pb_log), t_min = Math.min(...pt), t_max = Math.max(...pt);
const xs_n = pb_log.map(b => (b - b_min) / (b_max - b_min)), ys_n = pt.map(t => (t - t_min) / (t_max - t_min));

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
