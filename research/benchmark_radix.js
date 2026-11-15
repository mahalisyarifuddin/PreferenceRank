/**
 * Wall-clock benchmark: LSD vs MSD radix sort vs comparison baselines.
 * Key-inspecting sorts cannot join the comparison-battle suite, so they are
 * measured here on real integer sorting workloads.
 *
 * Usage: node research/benchmark_radix.js
 * Writes research/radix_results.txt
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { lsdRadixSort, msdRadixSort } = require('./radix_sort');

/* ---------- comparison baselines (Int32Array, non-mutating) ---------- */
function quicksort3Way(input) {
    const a = Int32Array.from(input);
    const qs = (lo, hi) => {
        if (hi - lo <= 1) return;
        const pivot = a[lo + ((hi - lo) >> 1)];
        let lt = lo, gt = hi - 1, i = lo;
        while (i <= gt) {
            const v = a[i];
            if (v < pivot) { const t = a[i]; a[i] = a[lt]; a[lt] = t; lt++; i++; }
            else if (v > pivot) { const t = a[i]; a[i] = a[gt]; a[gt] = t; gt--; }
            else i++;
        }
        qs(lo, lt); qs(gt + 1, hi);
    };
    qs(0, a.length);
    return a;
}
function mergeSortTopDown(input) {
    const a = Int32Array.from(input);
    const aux = new Int32Array(a.length);
    const ms = (lo, hi) => {
        if (hi - lo <= 1) return;
        const mid = (lo + hi) >> 1;
        ms(lo, mid); ms(mid, hi);
        for (let i = lo; i < hi; i++) aux[i] = a[i];
        let i = lo, j = mid, k = lo;
        while (i < mid && j < hi) a[k++] = aux[i] <= aux[j] ? aux[i++] : aux[j++];
        while (i < mid) a[k++] = aux[i++];
        while (j < hi) a[k++] = aux[j++];
    };
    ms(0, a.length);
    return a;
}
function nativeSort(input) {
    return Int32Array.from(Array.from(input).sort((x, y) => x - y));
}

const ALGOS = [
    ['LSD Radix (base 256)', lsdRadixSort],
    ['MSD Radix (base 256, cutoff 16)', msdRadixSort],
    ['Quicksort (3-way, mid pivot)', quicksort3Way],
    ['Merge Sort (top-down)', mergeSortTopDown],
    ['Native Array.prototype.sort', nativeSort],
];

/* ---------- datasets ---------- */
function makeDataset(kind, n) {
    const a = new Int32Array(n);
    switch (kind) {
        case 'random32':
            for (let i = 0; i < n; i++) a[i] = (Math.random() * 4294967296) | 0;
            return a;
        case 'small-uniform-1e6':
            for (let i = 0; i < n; i++) a[i] = (Math.random() * 1e6) | 0;
            return a;
        case 'sorted':
            for (let i = 0; i < n; i++) a[i] = i * 2 - n;
            return a;
        case 'reversed':
            for (let i = 0; i < n; i++) a[i] = n - i * 2;
            return a;
        case 'nearly-sorted': {
            for (let i = 0; i < n; i++) a[i] = i;
            const swaps = Math.max(1, Math.floor(n * 0.01));
            for (let s = 0; s < swaps; s++) {
                const i = (Math.random() * n) | 0, j = (Math.random() * n) | 0;
                const t = a[i]; a[i] = a[j]; a[j] = t;
            }
            return a;
        }
        case 'few-unique-8': {
            const vals = [-7, -3, 0, 11, 42, 99, 512, 1000000];
            for (let i = 0; i < n; i++) a[i] = vals[(Math.random() * vals.length) | 0];
            return a;
        }
        case 'constant':
            a.fill(12345);
            return a;
        default:
            throw new Error('unknown dataset ' + kind);
    }
}
const DISTRIBUTIONS = ['random32', 'small-uniform-1e6', 'sorted', 'reversed', 'nearly-sorted', 'few-unique-8', 'constant'];
const SIZES = [10000, 100000, 1000000];
const REPS = { 10000: 25, 100000: 7, 1000000: 3 };

/* ---------- correctness gate (runs once per algo x dataset x size) ---------- */
function expectedSorted(data) {
    return Int32Array.from(Array.from(data).sort((x, y) => x - y));
}
for (const size of SIZES) {
    for (const dist of DISTRIBUTIONS) {
        const data = makeDataset(dist, size);
        const expected = expectedSorted(data);
        for (const [name, fn] of ALGOS) {
            const got = fn(data);
            if (got.length !== size) throw new Error(`correctness FAIL ${name} ${dist} N=${size}: length`);
            for (let i = 0; i < size; i++) {
                if (got[i] !== expected[i]) throw new Error(`correctness FAIL ${name} ${dist} N=${size} at index ${i}`);
            }
        }
    }
}
console.log('Correctness gate passed for all algorithm x dataset x size combinations.\n');

/* ---------- timing ---------- */
const lines = ['Algorithm\tDistribution\tN\tAvg ms\tBest ms\tReps'];
for (const size of SIZES) {
    for (const dist of DISTRIBUTIONS) {
        const data = makeDataset(dist, size);
        for (const [name, fn] of ALGOS) {
            const reps = REPS[size];
            let total = 0, best = Infinity;
            for (let r = 0; r < reps; r++) {
                const t0 = process.hrtime.bigint();
                fn(data);
                const ms = Number(process.hrtime.bigint() - t0) / 1e6;
                total += ms; if (ms < best) best = ms;
            }
            const line = `${name}\t${dist}\t${size}\t${(total / reps).toFixed(3)}\t${best.toFixed(3)}\t${reps}`;
            lines.push(line);
            console.log(line);
        }
        console.log('');
    }
}
fs.writeFileSync(path.join(__dirname, 'radix_results.txt'), lines.join('\n') + '\n');
console.log('Wrote research/radix_results.txt');
