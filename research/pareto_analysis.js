const algos = ["Stalin Sort","Thanos Sort","Miracle Sort","Intelligent Design","Quantum Bogo","Timsort","Powersort","Intro Sort","Parallel Merge Sort","Strand Sort","Patience Sort","Smooth Sort","Hayate-Shiki","Bubble Sort","Recursive Bubble","Shellsort","Bucket Sort","Circle Sort","Quicksort (RTL)","Recursive Insertion","Selection Sort","Double Selection","Radix Sort","Recursive Selection","Insertion Sort","Quicksort (LTR)","Cocktail Selection","Socialist Sort","Genghis Khan Sort","Binary Insertion","Hater Sort","Exit Sort","Random Sort","Quicksort (Random)","Silly Sort","Sleep Sort","Quicksort (Middle)","Quicksort (Mo3)","Recursive Cocktail","Quicksort (Ninther)","Gnome Sort","Recursive Gnome","Recursive Binary Insertion","Recursive Double Selection","Recursive Shellsort","Recursive Comb Sort","Stooge Sort","Recursive Odd-Even Sort","Ford-Johnson","Quick Rank (proposed)","Merge Sort","Bottom-up Merge Sort","Quicksort (Hoare)","Natural Merge Sort","Ping-pong Merge Sort","3-way Merge Sort","4-way Merge Sort","In-place Merge Sort","Rotation Merge Sort","3-Way Quicksort","Dual-Pivot Quicksort","Bogosort","Triple-Pivot Quicksort","Stable Quicksort","BlockQuicksort","PDQSort","Parallel Quicksort","Full Rank","Cycle Sort","Bitonic Sort","Heap Sort","Comb Sort","Tournament Sort","Odd-Even Sort","Slowsort","Pancake Sort","Cocktail Shaker","Tree Sort","BogoBogoSort"];
const battles = [99,99,99,0,1.78,531.71,562.25,716.38,558.46,753.68,198.06,99.74,933.37,2576.11,2551.73,669.88,764.06,1210.64,646.05,2567.1,2745.49,2772.33,4559.05,2757.96,2538.74,645.34,2749.64,0,99,530.66,196.12,0,245.07,643.7,138,100,649.43,708.7,2586.62,603.72,2588.84,2575.64,531.01,2756.15,671.64,851.27,2900.25,2622.09,526.68,526.91,542.31,558.41,201.46,577.82,558.58,568.9,543.42,542.01,712.32,101.19,650.3,4950,541.32,653.38,726.06,196.28,647.71,4950,596.32,1036.86,98.07,852.13,557.74,2605.13,1321.86,3079.65,2583.71,650.28,45.14];
const tau = [0.1,0.5436,0.5418,-0.0051,0.0104,0.8959,0.907,0.8087,0.8866,0.8207,0.4869,0.4845,0.7844,0.805,0.8014,0.9332,0.8008,0.9698,0.8365,0.8005,0.8901,0.9227,0.9499,0.8894,0.7998,0.8369,0.9212,-0.0007,0.3551,0.8883,0.6641,0.0031,0.6439,0.8373,0.2365,-0.0063,0.8377,0.8267,0.8081,0.8419,0.8055,0.8019,0.8863,0.922,0.9335,0.9748,0.9901,0.807,0.888,0.8879,0.9045,0.888,0.5256,0.8937,0.8863,0.8793,0.9048,0.9038,0.9137,0.3419,0.8369,1,0.8268,0.8363,0.8065,0.5433,0.837,1,0.4822,0.9571,0.4696,0.9745,0.8862,0.8057,0.9503,0.9688,0.8055,0.8376,0.0895];
const dups = [false,true,false,false,false,true,true,false,false,false,true,true,true,true,true,true,false,true,false,false,true,true,true,true,false,false,true,false,false,false,true,false,true,false,true,false,false,true,true,true,true,true,false,true,true,true,true,true,false,false,false,false,true,true,false,false,false,false,false,true,false,true,true,false,false,true,false,false,true,true,true,true,false,true,true,true,true,false,true];


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
