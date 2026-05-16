
const algos = ["Intelligent Design","Quantum Bogo","Miracle Sort","Stalin Sort","Smooth Sort","Heap Sort","Thanos Sort","Patience Sort","Intro Sort","Ford-Johnson","Binary Insertion","Merge Sort","Tournament Sort","Tree Sort","Quicksort","Shellsort","Strand Sort","Hayate-Shiki","Comb Sort","Bitonic Sort","Insertion Sort","Cocktail Shaker","Odd-Even Sort","Gnome Sort","Bubble Sort","Full Rank","Bogosort","Pancake Sort","Selection Sort","Bozosort","Cycle Sort","Slowsort","Stooge Sort","BogoBogoSort"];
const battles = [0,1.62,99,99,152.42,152.94,190,251.7,420.16,526.98,531.08,542.62,561.58,649.72,650.62,728.94,753.62,932.42,1234.66,1334,2619.9,3868.36,4658.94,4859.46,4896.92,4950,4950,4950,4950,4950,4950,4950,4950,4950];
const tau     = [-0.0056,0.0078,0.5464,0.0701,0.474,0.4841,0.5322,0.4875,0.8498,0.8885,0.8875,0.9043,0.8872,0.8375,0.8369,0.9414,0.8169,0.7835,0.9902,0.9487,0.8068,0.9778,0.9881,0.9623,0.9723,1,0.9784,0.9757,0.9331,0.5856,0.4677,0.4627,0.2843,0.0518];

function pareto_mask(x, y) {
    const n = x.length, mask = new Array(n).fill(true);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
        if (i !== j && x[j] <= x[i] && y[j] >= y[i] && (x[j] < x[i] || y[j] > y[i])) { mask[i] = false; break; }
    return mask;
}

const pmask = pareto_mask(battles, tau);
const pareto_pts = algos.map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i] }))
    .filter(p => p.m).sort((a, b) => a.b - b.b);

const pb = pareto_pts.map(p => p.b), pt = pareto_pts.map(p => p.t);
const b_min = Math.min(...pb), b_max = Math.max(...pb), t_min = Math.min(...pt), t_max = Math.max(...pt);
const xs_n = pb.map(b => (b - b_min) / (b_max - b_min)), ys_n = pt.map(t => (t - t_min) / (t_max - t_min));
const x1n = xs_n[0], y1n = ys_n[0], x2n = xs_n[xs_n.length - 1], y2n = ys_n[ys_n.length - 1];

let max_dist = -1, knee_idx = -1;
for (let i = 0; i < xs_n.length; i++) {
    const num = Math.abs((y2n - y1n) * xs_n[i] - (x2n - x1n) * ys_n[i] + x2n * y1n - y2n * x1n);
    const den = Math.sqrt(Math.pow(y2n - y1n, 2) + Math.pow(x2n - x1n, 2));
    const dist = num / den;
    if (dist > max_dist) { max_dist = dist; knee_idx = i; }
}

const knee = pareto_pts[knee_idx];
console.log("Pareto-optimal algorithms (N=100):");
for (const p of pareto_pts) console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}${p.name === "Shellsort" ? "  <-- PROD" : ""}${p.name === knee.name ? "  <-- MATH KNEE" : ""}`);

console.log("\nDominated algorithms:");
const dominated = algos.map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i] }))
    .filter(p => !p.m).sort((a, b) => a.b - b.b);
for (const p of dominated) console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}`);
