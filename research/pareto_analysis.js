const algos = ["3-Way Quicksort", "3-way Merge Sort", "4-way Merge Sort", "Binary Insertion", "Bitonic Sort", "BlockQuicksort", "BogoBogoSort", "Bogosort", "Bottom-up Merge Sort", "Bubble Sort", "Bucket Sort", "Circle Sort", "Cocktail Selection", "Cocktail Shaker", "Comb Sort", "Cycle Sort", "Double Selection", "Dual-Pivot Quicksort", "Exit Sort", "Ford-Johnson", "Full Rank", "Genghis Khan Sort", "Gnome Sort", "Hater Sort", "Hayate-Shiki", "Heap Sort", "In-place Merge Sort", "Insertion Sort", "Intelligent Design", "Intro Sort", "Merge Sort", "Miracle Sort", "Natural Merge Sort", "Odd-Even Sort", "PDQSort", "Pancake Sort", "Parallel Merge Sort", "Parallel Quicksort", "Patience Sort", "Ping-pong Merge Sort", "Powersort", "Quantum Bogo", "Quicksort (Hoare)", "Quicksort (LTR)", "Quicksort (Middle)", "Quicksort (Mo3)", "Quicksort (Ninther)", "Quicksort (RTL)", "Quicksort (Random)", "Radix Sort", "Random Sort", "Selection Sort", "Shellsort", "Silly Sort", "Sleep Sort", "Slowsort", "Smooth Sort", "Socialist Sort", "Stable Quicksort", "Stalin Sort", "Stooge Sort", "Strand Sort", "Thanos Sort", "Timsort", "Tournament Sort", "Tree Sort", "Triple-Pivot Quicksort"];
const battles = [100.4, 566.74, 543.64, 530.22, 1038.31, 708.3, 44.38, 4950.0, 559.05, 2579.74, 766.32, 1210.5, 2757.45, 2569.84, 851.28, 640.01, 2756.29, 644.86, 0.0, 526.5, 4950.0, 99.0, 2566.16, 196.16, 937.26, 99.44, 541.92, 2560.05, 0.0, 721.47, 542.4, 99.0, 577.6, 2603.56, 193.24, 3075.65, 558.11, 646.52, 197.36, 558.48, 563.29, 1.7, 208.18, 645.78, 649.79, 701.75, 604.68, 639.08, 649.66, 4537.68, 225.15, 2745.33, 669.64, 138.0, 100.0, 1322.83, 99.9, 0.0, 650.45, 99.0, 2893.91, 744.45, 99.0, 532.74, 559.0, 643.25, 530.84];
const tau = [0.3553, 0.8792, 0.9049, 0.8863, 0.9572, 0.8067, 0.0907, 1.0, 0.8872, 0.8028, 0.7986, 0.969, 0.9232, 0.8066, 0.975, 0.4481, 0.9217, 0.8368, 0.0042, 0.8883, 1.0, 0.3493, 0.8022, 0.6601, 0.7811, 0.4757, 0.9032, 0.8001, -0.0002, 0.8077, 0.9043, 0.5443, 0.8922, 0.805, 0.5299, 0.9684, 0.8871, 0.8364, 0.4817, 0.888, 0.9088, 0.0185, 0.5422, 0.8362, 0.8366, 0.828, 0.8421, 0.8365, 0.8369, 0.9477, 0.6326, 0.8897, 0.9332, 0.2414, -0.0018, 0.9473, 0.4822, 0.0024, 0.8371, 0.1004, 0.99, 0.8175, 0.5477, 0.8953, 0.8879, 0.8369, 0.8291];
const dups = [true, false, false, false, true, false, true, true, false, true, false, true, true, true, true, true, true, false, false, false, false, false, true, true, true, true, false, false, false, false, false, false, true, true, true, true, false, false, true, false, true, false, true, false, false, true, true, false, false, true, true, true, true, true, false, true, true, false, false, false, true, false, true, true, false, false, true];


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
