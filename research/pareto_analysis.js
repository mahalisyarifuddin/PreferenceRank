const algos = ['3-Way Quicksort', '3-way Merge Sort', '4-way Merge Sort', 'Binary Insertion', 'Bitonic Sort', 'BlockQuicksort', 'BogoBogoSort', 'Bogosort', 'Bottom-up Merge Sort', 'Bubble Sort', 'Circle Sort', 'Cocktail Selection', 'Cocktail Shaker', 'Comb Sort', 'Cycle Sort', 'Double Selection', 'Dual-Pivot Quicksort', 'Exit Sort', 'Ford-Johnson', 'Full Rank', 'Genghis Khan Sort', 'Gnome Sort', 'Hater Sort', 'Hayate-Shiki', 'Heap Sort', 'In-place Merge Sort', 'Insertion Sort', 'Intelligent Design', 'Intro Sort', 'Merge Sort', 'Miracle Sort', 'Natural Merge Sort', 'Odd-Even Sort', 'Pancake Sort', 'Parallel Merge Sort', 'Parallel Quicksort', 'Patience Sort', 'Ping-pong Merge Sort', 'Powersort', 'Quantum Bogo', 'Quicksort (Hoare)', 'Quicksort (LTR)', 'Quicksort (Middle)', 'Quicksort (Mo3)', 'Quicksort (Ninther)', 'Quicksort (RTL)', 'Quicksort (Random)', 'Random Sort', 'Selection Sort', 'Shellsort', 'Silly Sort', 'Sleep Sort', 'Slowsort', 'Smooth Sort', 'Socialist Sort', 'Stable Quicksort', 'Stalin Sort', 'Stooge Sort', 'Strand Sort', 'Thanos Sort', 'Timsort', 'Tournament Sort', 'Tree Sort', 'Triple-Pivot Quicksort'];
const battles = [101.58, 568.33, 542.69, 530.44, 1037.63, 718.28, 44.26, 4950.0, 558.25, 2580.12, 1210.62, 2752.02, 2569.86, 851.81, 504.61, 2743.44, 645.96, 0.0, 526.82, 4950.0, 99.0, 2588.91, 196.09, 932.18, 99.56, 541.76, 2568.9, 0.0, 722.06, 541.23, 99.0, 578.56, 2600.93, 3076.83, 558.29, 651.38, 199.25, 558.03, 562.54, 1.72, 203.7, 637.28, 652.87, 709.14, 602.87, 647.14, 647.97, 254.65, 2766.8, 671.36, 138.0, 100.0, 1320.52, 100.8, 0.0, 651.82, 99.0, 2877.99, 740.23, 99.0, 532.38, 558.73, 644.16, 534.5];
const tau = [0.3448, 0.88, 0.9023, 0.8875, 0.9577, 0.8073, 0.0893, 1.0, 0.8873, 0.8035, 0.9702, 0.9223, 0.8075, 0.9747, 0.423, 0.9218, 0.8372, 0.0054, 0.889, 1.0, 0.363, 0.8039, 0.6637, 0.7849, 0.4803, 0.9046, 0.8013, 0.0023, 0.8072, 0.9039, 0.5475, 0.8935, 0.8052, 0.9683, 0.8862, 0.8369, 0.4868, 0.8863, 0.9078, 0.017, 0.5313, 0.8373, 0.8361, 0.8277, 0.8423, 0.8377, 0.8368, 0.66, 0.8899, 0.9328, 0.2464, -0.0059, 0.9465, 0.486, -0.0025, 0.8362, 0.097, 0.9901, 0.8193, 0.5467, 0.8943, 0.8867, 0.8363, 0.8286];
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
