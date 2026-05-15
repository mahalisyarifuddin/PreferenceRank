
const algos = [
    "Ford-Johnson", "Merge Sort", "Shellsort", "Quicksort", "Bubble Sort", "Selection Sort", "Insertion Sort",
    "Binary Insertion", "Gnome Sort", "Stooge Sort", "Bogosort", "Full Rank", "Cycle Sort", "Bitonic Sort",
    "Heap Sort", "Comb Sort", "Tournament Sort", "Odd-Even Sort", "Slowsort", "Pancake Sort", "Cocktail Shaker",
    "Bozosort", "Tree Sort", "BogoBogoSort", "Stalin Sort", "Thanos Sort", "Miracle Sort", "Intelligent Design",
    "Quantum Bogo", "Intro Sort", "Strand Sort", "Patience Sort", "Smooth Sort"
];
const battles = [525.70, 543.80, 719.50, 647.20, 4884.40, 4950.00, 2581.00, 529.90, 4895.60, 4950.00, 4950.00, 4950.00, 4950.00, 1334.00, 147.20, 1201.00, 556.40, 4682.70, 4950.00, 4950.00, 4011.00, 4950.00, 598.10, 4950.00, 99.00, 190.00, 99.00, 0.00, 1.40, 445.40, 705.50, 243.70, 147.00];
const tau     = [0.8937, 0.9049, 0.9446, 0.8359, 0.9709, 0.9339, 0.8063, 0.8953, 0.9660, 0.3124, 0.9789, 1.0000, 0.3362, 0.9477, 0.4650, 0.9897, 0.8895, 0.9896, 0.4645, 0.9762, 0.9802, 0.5992, 0.8354, 0.0487, 0.1055, 0.5265, 0.5165, 0.0331, -0.0349, 0.8566, 0.8321, 0.4525, 0.4847];

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
