const algos = ["Thanos Sort", "Miracle Sort", "Intelligent Design", "Quantum Bogo", "Powersort", "Bucket Sort", "Intro Sort", "Parallel Merge Sort", "Strand Sort", "Patience Sort", "Smooth Sort", "Hayate-Shiki", "Recursive Bubble", "Shellsort", "Circle Sort", "Quicksort (RTL)", "Selection Sort", "Recursive Insertion", "Double Selection", "Insertion Sort", "Binary Insertion", "Recursive Selection", "Radix Sort", "Quicksort (LTR)", "Cocktail Selection", "Socialist Sort", "Genghis Khan Sort", "Hater Sort", "Exit Sort", "Random Sort", "Gnome Sort", "Quicksort (Random)", "Silly Sort", "Sleep Sort", "Quicksort (Middle)", "Quicksort (Mo3)", "Recursive Cocktail", "Quicksort (Ninther)", "Recursive Gnome", "Recursive Binary Insertion", "Recursive Double Selection", "Stooge Sort", "Recursive Shellsort", "Recursive Comb Sort", "Recursive Odd-Even Sort", "Ford-Johnson", "Merge Sort", "Bottom-up Merge Sort", "Natural Merge Sort", "Ping-pong Merge Sort", "3-way Merge Sort", "4-way Merge Sort", "In-place Merge Sort", "Quicksort (Hoare)", "Rotation Merge Sort", "Timsort", "Bogosort", "3-Way Quicksort", "Dual-Pivot Quicksort", "Full Rank", "Triple-Pivot Quicksort", "Stable Quicksort", "BlockQuicksort", "PDQSort", "Parallel Quicksort", "Bubble Sort", "Cycle Sort", "Bitonic Sort", "Heap Sort", "Comb Sort", "Tournament Sort", "Odd-Even Sort", "Slowsort", "Pancake Sort", "Cocktail Shaker", "Tree Sort", "BogoBogoSort", "Stalin Sort"];
const battles = [99.0, 99.0, 0.0, 1.78, 563.04, 783.01, 719.48, 558.25, 746.07, 198.03, 97.84, 933.01, 2569.29, 671.04, 1202.28, 654.18, 2752.71, 2577.35, 2764.38, 2563.52, 530.94, 2740.07, 4542.68, 647.04, 2748.46, 0.0, 99.0, 196.05, 0.0, 247.16, 2543.54, 642.43, 138.0, 100.0, 646.44, 704.96, 2584.96, 604.99, 2574.11, 530.66, 2755.4, 2884.66, 671.19, 852.27, 2612.56, 526.92, 542.64, 558.13, 577.61, 558.4, 567.0, 544.3, 541.42, 203.04, 712.26, 532.69, 4950.0, 101.58, 650.75, 4950.0, 529.04, 646.09, 714.93, 201.99, 652.75, 2569.33, 596.32, 1037.39, 99.31, 852.17, 558.15, 2607.34, 1322.84, 3087.26, 2564.72, 654.11, 45.34, 99.0];
const tau = [0.5412, 0.545, 0.0025, 0.0173, 0.9079, 0.799, 0.8076, 0.8858, 0.8186, 0.4813, 0.4784, 0.7846, 0.8026, 0.9331, 0.9692, 0.8378, 0.8899, 0.8045, 0.9216, 0.8011, 0.8877, 0.89, 0.9476, 0.8371, 0.9222, -0.0013, 0.3446, 0.6631, -0.0007, 0.6487, 0.8004, 0.8364, 0.2424, 0.0103, 0.8366, 0.8277, 0.8047, 0.8424, 0.8031, 0.8871, 0.9226, 0.9901, 0.9326, 0.9744, 0.8062, 0.8886, 0.9029, 0.886, 0.8934, 0.8862, 0.8804, 0.903, 0.9029, 0.5262, 0.9158, 0.896, 1.0, 0.3589, 0.8373, 1.0, 0.8279, 0.8369, 0.8066, 0.5613, 0.8361, 0.8019, 0.4322, 0.9583, 0.4819, 0.975, 0.886, 0.8054, 0.9499, 0.9691, 0.8039, 0.8361, 0.098, 0.1123];
const dups = [true, false, false, false, true, false, false, false, false, true, true, true, true, true, true, false, true, false, true, false, false, true, true, false, true, false, false, true, false, true, true, false, true, false, false, true, true, true, true, false, true, true, true, true, true, false, false, false, true, false, false, false, false, true, false, true, true, true, false, false, true, false, false, true, false, true, true, true, true, true, false, true, true, true, true, false, true, false];


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
