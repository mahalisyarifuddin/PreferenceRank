
const algos = ["Ford-Johnson", "Merge Sort", "Hayate-Shiki", "Shellsort", "Quicksort", "Bubble Sort", "Selection Sort", "Insertion Sort", "Binary Insertion", "Gnome Sort", "Stooge Sort", "Bogosort", "Full Rank", "Cycle Sort", "Bitonic Sort", "Heap Sort", "Comb Sort", "Tournament Sort", "Odd-Even Sort", "Slowsort", "Pancake Sort", "Cocktail Shaker", "Bozosort", "Tree Sort", "BogoBogoSort", "Stalin Sort", "Thanos Sort", "Miracle Sort", "Intelligent Design", "Quantum Bogo", "Intro Sort", "Strand Sort", "Patience Sort", "Smooth Sort"];
const battles = [526.20, 542.10, 980.50, 743.30, 651.10, 4917.30, 4950.00, 2556.60, 529.90, 4911.80, 4950.00, 4950.00, 4950.00, 4950.00, 1334.00, 164.30, 1230.70, 557.00, 4702.50, 4950.00, 4950.00, 3873.70, 4950.00, 643.60, 4950.00, 99.00, 190.00, 99.00, 0.00, 1.70, 456.80, 774.50, 248.80, 170.20];
const tau     = [0.8879, 0.8985, 0.7909, 0.9387, 0.8354, 0.9731, 0.9344, 0.8041, 0.8834, 0.9581, 0.2826, 0.9781, 1.0000, 0.4720, 0.9526, 0.4808, 0.9905, 0.8855, 0.9884, 0.4357, 0.9761, 0.9777, 0.5962, 0.8367, 0.0975, 0.0640, 0.5334, 0.5413, 0.0324, 0.0230, 0.8465, 0.8265, 0.4926, 0.5445];

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
