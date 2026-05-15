
const algos = [
    "Ford-Johnson",
    "Merge Sort",
    "Shellsort",
    "Heapsort",
    "Comb Sort",
    "Cocktail Shaker",
    "Quicksort",
    "Full Rank",
    "Random Pairs (Matched to FJ)"
];
const battles = [527.14, 542.00, 729.82, 148.94, 1242.58, 3852.02, 660.70, 4950.00, 527.00];
const tau     = [0.8876, 0.9047, 0.9417, 0.4797, 0.9899, 0.9776, 0.8367, 1.0000, 0.8384];

function pareto_mask(x, y) {
    const n = x.length;
    const mask = new Array(n).fill(true);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            if (x[j] <= x[i] && y[j] >= y[i] && (x[j] < x[i] || y[j] > y[i])) {
                mask[i] = false;
                break;
            }
        }
    }
    return mask;
}

const pmask = pareto_mask(battles, tau);
const pareto_pts = algos
    .map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i] }))
    .filter(p => p.m)
    .sort((a, b) => a.b - b.b);

const pb = pareto_pts.map(p => p.b);
const pt = pareto_pts.map(p => p.t);

const b_min = Math.min(...pb);
const b_max = Math.max(...pb);
const t_min = Math.min(...pt);
const t_max = Math.max(...pt);

const xs_n = pb.map(b => (b - b_min) / (b_max - b_min));
const ys_n = pt.map(t => (t - t_min) / (t_max - t_min));

const x1n = xs_n[0], y1n = ys_n[0];
const x2n = xs_n[xs_n.length - 1], y2n = ys_n[ys_n.length - 1];

let max_dist = -1;
let knee_idx = -1;

for (let i = 0; i < xs_n.length; i++) {
    const num = Math.abs((y2n - y1n) * xs_n[i] - (x2n - x1n) * ys_n[i] + x2n * y1n - y2n * x1n);
    const den = Math.sqrt(Math.pow(y2n - y1n, 2) + Math.pow(x2n - x1n, 2));
    const dist = num / den;
    if (dist > max_dist) {
        max_dist = dist;
        knee_idx = i;
    }
}

const knee = pareto_pts[knee_idx];

console.log("Pareto-optimal algorithms (N=100):");
for (const p of pareto_pts) {
    const marker = p.name === knee.name ? "  <-- KNEE" : "";
    console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}${marker}`);
}

console.log("\nDominated algorithms:");
for (let i = 0; i < algos.length; i++) {
    if (!pmask[i]) {
        console.log(`  ${algos[i].padEnd(32)}  battles=${battles[i].toFixed(2).padStart(8)}  tau=${tau[i].toFixed(4)}`);
    }
}

console.log(`\nFinal Choice (Knee Point): ${knee.name}`);
