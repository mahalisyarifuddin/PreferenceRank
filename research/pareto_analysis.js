
const algos = [
    "Ford-Johnson", "Merge Sort", "Shellsort", "Quicksort", "Bubble Sort", "Selection Sort", "Insertion Sort",
    "Binary Insertion", "Gnome Sort", "Stooge Sort", "Bogosort", "Full Rank", "Cycle Sort", "Bitonic Sort",
    "Heap Sort", "Comb Sort", "Tournament Sort", "Odd-Even Sort", "Slowsort", "Pancake Sort", "Cocktail Shaker",
    "Bozosort", "Tree Sort", "BogoBogoSort"
];
const battles = [527.20, 543.10, 722.10, 652.40, 4887.60, 4950.00, 2592.70, 532.30, 4923.60, 4950.00, 4950.00, 4950.00, 4950.00, 1334.00, 165.00, 1260.40, 556.30, 4573.80, 4950.00, 4950.00, 4003.40, 4950.00, 627.40, 4950.00];
const tau     = [0.8865, 0.9078, 0.9458, 0.8307, 0.9728, 0.9330, 0.8085, 0.8884, 0.9557, 0.2841, 0.9798, 1.0000, 0.2279, 0.9463, 0.4856, 0.9913, 0.8870, 0.9877, 0.4656, 0.9758, 0.9788, 0.5752, 0.8405, 0.0487];

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
for (const p of pareto_pts) console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}${p.name === "Shellsort" ? "  <-- PRODUCTION KNEE" : ""}${p.name === knee.name ? "  <-- MATH KNEE" : ""}`);

console.log("\nDominated algorithms:");
const dominated = algos.map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i] }))
    .filter(p => !p.m).sort((a, b) => a.b - b.b);
for (const p of dominated) console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}`);
