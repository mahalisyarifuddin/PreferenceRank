
const algos = ["Binary Insertion","Bitonic Sort","BogoBogoSort","Bogosort","Bozosort","Bubble Sort","Circle Sort","Cocktail Selection","Cocktail Shaker","Comb Sort","Cycle Sort","Double Selection","Dual-Pivot Quicksort","Exit Sort","Ford-Johnson","Full Rank","Genghis Khan Sort","Gnome Sort","Hater Sort","Hayate-Shiki","Heap Sort","Insertion Sort","Intelligent Design","Intro Sort","Merge Sort","Miracle Sort","Odd-Even Sort","Pancake Sort","Patience Sort","Quantum Bogo","Quicksort","Random Sort","Selection Sort","Shellsort","Silly Sort","Sleep Sort","Slowsort","Smooth Sort","Socialist Sort","Stalin Sort","Stooge Sort","Strand Sort","Thanos Sort","Tournament Sort","Tree Sort"];
const battles = [529.4,1334,4950,4950,4950,4865.6,2180.4,4950,4022.5,1210.9,4950,4950,527.9,0,526.3,4950,99,4844,200,965.5,146.4,2506.4,0,423,542,99,4554,4950,255.5,2,642.6,264.1,4950,733,4950,100,4950,156.4,0,99,4950,709.7,190,561,667.9];
const tau     = [0.8855,0.9503,0.0848,0.9794,0.5606,0.9743,0.9715,0.9472,0.9815,0.9904,0.1995,0.9378,0.8377,-0.0146,0.8876,1,0.2963,0.966,0.6632,0.7921,0.4752,0.8046,-0.0098,0.8545,0.9043,0.5333,0.9855,0.975,0.4869,0.0227,0.8354,0.6943,0.9312,0.9451,0.1402,0.003,0.4629,0.4898,-0.0057,0.0945,0.282,0.8333,0.5457,0.8918,0.8363];

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
