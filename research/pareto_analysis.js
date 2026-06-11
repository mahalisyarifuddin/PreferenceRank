const algos = ["3-way Merge Sort","3-Way Quicksort","4-way Merge Sort","Binary Insertion","Bitonic Sort","BlockQuicksort","BogoBogoSort","Bogosort","Bottom-up Merge Sort","Bubble Sort","Bucket Sort","Circle Sort","Cocktail Selection","Cocktail Shaker","Comb Sort","Cycle Sort","Double Selection","Dual-Pivot Quicksort","Exit Sort","Ford-Johnson","Full Rank","Genghis Khan Sort","Gnome Sort","Hater Sort","Hayate-Shiki","Heap Sort","In-place Merge Sort","Insertion Sort","Intelligent Design","Intro Sort","Merge Sort","Miracle Sort","Natural Merge Sort","Odd-Even Sort","Pancake Sort","Parallel Merge Sort","Parallel Quicksort","Patience Sort","PDQSort","Ping-pong Merge Sort","Powersort","Quantum Bogo","Quicksort (Hoare)","Quicksort (LTR)","Quicksort (Middle)","Quicksort (Mo3)","Quicksort (Ninther)","Quicksort (Random)","Quicksort (RTL)","Radix Sort","Random Sort","Selection Sort","Shellsort","Silly Sort","Sleep Sort","Slowsort","Smooth Sort","Socialist Sort","Stable Quicksort","Stalin Sort","Stooge Sort","Strand Sort","Thanos Sort","Timsort","Tournament Sort","Tree Sort","Triple-Pivot Quicksort"];
const battles = [567.63,100.79,543.54,531.09,1035.97,721.02,45.18,4950.0,558.55,2557.88,757.8,1213.2,2750.03,2581.88,850.98,525.11,2754.16,647.93,0.0,526.97,4950.0,99.0,2578.12,196.09,935.06,98.52,541.97,2545.65,0.0,724.65,541.96,99.0,577.16,2602.98,3080.19,558.11,648.72,198.77,193.79,558.4,562.93,1.71,195.29,653.62,645.95,713.57,604.38,650.47,650.24,4527.58,257.28,2761.1,670.96,138.0,100.0,1324.61,100.03,0.0,652.56,99.0,2896.27,744.92,99.0,533.01,558.63,647.78,536.5];
const tau = [0.8807,0.3512,0.9021,0.887,0.9577,0.8072,0.0975,1.0,0.8874,0.8013,0.8007,0.9691,0.9218,0.8072,0.9746,0.4193,0.9222,0.8368,0.0023,0.8885,1.0,0.319,0.8023,0.6611,0.7832,0.484,0.9053,0.8011,-0.0005,0.8072,0.9034,0.5432,0.8924,0.8051,0.9681,0.8859,0.8372,0.4817,0.5325,0.8867,0.9074,0.02,0.5138,0.8365,0.8366,0.8271,0.8421,0.837,0.8376,0.9458,0.6627,0.8908,0.9324,0.24,0.001,0.9486,0.4834,0.0007,0.8375,0.1056,0.9898,0.8223,0.5453,0.8961,0.8868,0.8361,0.8256];
const dups = [false,true,false,false,true,false,true,true,false,true,false,true,true,true,true,true,true,false,false,false,false,false,true,true,true,true,false,false,false,false,false,false,true,true,true,false,false,true,true,false,true,false,true,false,false,true,true,false,false,true,true,true,true,true,false,true,true,false,false,false,true,false,true,true,false,false,true];


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
