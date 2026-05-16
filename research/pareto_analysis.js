const algos = ["Aetheris","Ford-Johnson","Merge Sort","Hayate-Shiki","Shellsort","Quicksort","Bubble Sort","Selection Sort","Insertion Sort","Binary Insertion","Gnome Sort","Stooge Sort","Bogosort","Full Rank","Cycle Sort","Bitonic Sort","Heap Sort","Comb Sort","Tournament Sort","Odd-Even Sort","Slowsort","Pancake Sort","Cocktail Shaker","Bozosort","Tree Sort","BogoBogoSort","Stalin Sort","Thanos Sort","Miracle Sort","Intelligent Design","Quantum Bogo","Intro Sort","Strand Sort","Patience Sort","Smooth Sort"];
const battles = [949.64,527.2,541.62,943.66,730.18,658.64,4887.64,4950,2551.58,530.62,4876.2,4950,4950,4950,4950,1334,153.58,1252.48,559.8,4684.68,4950,4950,3901.04,4950,662.28,4950,99,190,99,0,1.62,435.28,739.42,249,150.92];
const tau = [0.9629,0.8886,0.9015,0.7802,0.9425,0.8382,0.972,0.9341,0.801,0.8891,0.9622,0.2916,0.9792,1,0.4338,0.9513,0.4755,0.9905,0.8853,0.9889,0.4739,0.9757,0.9778,0.5906,0.8369,0.063,0.0978,0.533,0.5423,-0.0147,0.0005,0.8512,0.8211,0.4721,0.4771];

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
for (const p of pareto_pts) console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}${p.name === "Aetheris" ? "  <-- PROD" : ""}${p.name === knee.name ? "  <-- MATH KNEE" : ""}`);

console.log("\nDominated algorithms:");
const dominated = algos.map((name, i) => ({ name, b: battles[i], t: tau[i], m: pmask[i] }))
    .filter(p => !p.m).sort((a, b) => a.b - b.b);
for (const p of dominated) console.log(`  ${p.name.padEnd(32)}  battles=${p.b.toFixed(2).padStart(8)}  tau=${p.t.toFixed(4)}`);
