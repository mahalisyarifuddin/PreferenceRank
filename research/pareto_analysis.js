const algos = ['3-Way Quicksort', '3-way Merge Sort', '4-way Merge Sort', 'Binary Insertion', 'Bitonic Sort', 'BlockQuicksort', 'BogoBogoSort', 'Bogosort', 'Bottom-up Merge Sort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'In-place Merge Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Natural Merge Sort', 'Odd-Even Sort', 'Pancake Sort', 'Parallel Merge Sort', 'Parallel Quicksort', 'Patience Sort', 'Ping-pong Merge Sort', 'Powersort', 'Quantum Bogo', 'Quicksort (Hoare)', 'Quicksort (LTR)', 'Quicksort (Middle)', 'Quicksort (Mo3)', 'Quicksort (Ninther)', 'Quicksort (RTL)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stable Quicksort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Timsort', 'Tournament Sort', 'Tree Sort', 'Triple-Pivot Quicksort'];
const battles = [101.58, 566.94, 543.44, 530.61, 1037.33, 717.95, 44.81, 4950.0, 558.57, 2589.34, 1211.16, 2749.38, 2579.46, 850.95, 528.88, 2774.61, 645.06, 0.0, 526.51, 4950.0, 99.0, 2578.87, 195.97, 930.57, 98.08, 541.82, 2565.09, 0.0, 723.25, 542.16, 99.0, 577.58, 2605.79, 3079.14, 558.04, 645.14, 198.5, 558.58, 562.51, 1.73, 207.09, 650.76, 647.08, 710.38, 604.4, 643.33, 650.54, 244.41, 2759.44, 670.58, 138.0, 100.0, 1324.76, 100.12, 0.0, 654.62, 99.0, 2893.43, 743.92, 99.0, 532.34, 558.63, 650.24, 532.48];
const tau = [0.362, 0.8808, 0.9024, 0.8867, 0.9574, 0.8064, 0.0927, 1.0, 0.8874, 0.8044, 0.9693, 0.922, 0.8076, 0.9747, 0.4202, 0.9227, 0.837, 0.0015, 0.888, 1.0, 0.3201, 0.8033, 0.6639, 0.7832, 0.4785, 0.9029, 0.8018, 0.0027, 0.8063, 0.9041, 0.5424, 0.8924, 0.8053, 0.9688, 0.8872, 0.8367, 0.4866, 0.8879, 0.9071, 0.0121, 0.5238, 0.8371, 0.8371, 0.8278, 0.8427, 0.8364, 0.8371, 0.6469, 0.889, 0.9323, 0.2385, -0.0047, 0.9496, 0.4848, 0.0035, 0.8372, 0.0983, 0.99, 0.8188, 0.5451, 0.8957, 0.8875, 0.8374, 0.8292];
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
