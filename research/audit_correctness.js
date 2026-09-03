/**
 * Correctness harness for the state-machine sorting providers in sort_analysis.js.
 *
 * Drives every provider with a deterministic comparison oracle
 * (result = 1 if first item's strength > second's, else 0 — exactly the
 * convention used by simulate() in sort_analysis.js) and verifies:
 *   1. it terminates within a step cap,
 *   2. it only ever requests pairs of valid item indices,
 *   3. its final `items` array is the input in sorted order, and records WHICH
 *      order: DESC = strongest first (the app's best-first convention),
 *      ASC = weakest first (inverted relative to the win convention).
 * Lossy "joke" sorts are checked as sorted subsequences; non-sorting jokes
 * are only required to terminate; Full Rank is a pure pair enumerator.
 * Also counts duplicate (repeated unordered) pairs.
 *
 * Usage: node research/audit_correctness.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

// Load all provider classes + the algos registry, but skip the worker/main block.
let src = fs.readFileSync(path.join(__dirname, 'sort_analysis.js'), 'utf8');
src = src.slice(0, src.indexOf('const { Worker'));
src += '\nglobalThis.__algos = algos;';
eval(src);
const algos = globalThis.__algos;

// Deterministic RNG (mulberry32) so results are reproducible.
function rng(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const strengthsFor = (n, seed) => {
    // Non-monotonic distinct strengths: the identity permutation must NOT be
    // sorted in either direction, otherwise a provider that does nothing
    // would falsely pass the ASC check.
    const rand = rng(seed * 7919 + n * 104729 + 13), s = [];
    for (let i = 0; i < n; i++) s.push(rand() * 1000 + i * 1e-7);
    return s;
};

const LOSSY = new Set(['Stalin Sort', 'Thanos Sort', 'Genghis Khan Sort']);
const NONSORTING = new Set([
    'Exit Sort', 'Intelligent Design', 'Socialist Sort', 'Sleep Sort',
    'Quantum Bogo', 'Hater Sort', 'Random Sort', 'Miracle Sort',
]);
const ENUMERATOR = new Set(['Full Rank']);
// Probabilistic/exponential sorts: only feasible for tiny n.
const BOGOLIKE = { 'Bogosort': 5, 'BogoBogoSort': 5, 'Bozo Sort': 7, 'Silly Sort': 14 };

const NS = [2, 3, 4, 5, 7, 8, 9, 15, 16, 17, 31, 32, 33, 50, 63, 64, 65, 100, 127, 128];
const seedsFor = (n) => (n <= 17 ? 40 : n <= 33 ? 15 : n <= 65 ? 8 : 4);
const STEP_CAP = 5e6;

function runOne(Cls, n, seed) {
    const strengths = strengthsFor(n, seed);
    const oracle = (a, b) => (a === b ? 0 : (strengths[a] > strengths[b] ? 1 : 0));
    const p = new Cls(n);
    let steps = 0, pair = p.next(), dups = 0, selfComps = 0;
    const seen = new Set();
    while (pair !== null && pair !== undefined) {
        if (++steps > STEP_CAP) return { outcome: 'TIMEOUT', steps, dups };
        const [a, b] = pair;
        if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n)
            return { outcome: 'BAD_PAIR', detail: JSON.stringify(pair), steps, dups };
        if (a === b) selfComps++;
        else {
            const key = a < b ? a * 100000 + b : b * 100000 + a;
            if (seen.has(key)) dups++; else seen.add(key);
        }
        pair = p.next(oracle(a, b));
    }
    return {
        outcome: 'DONE', steps, dups, selfComps,
        items: Array.isArray(p.items) ? p.items.slice() : null,
        truncated: !!(p.done && p.budget && p.asked >= p.budget), // Budgeted Merge Sort only
    };
}

function orientation(arr, st) {
    let asc = true, desc = true;
    for (let i = 1; i < arr.length; i++) {
        if (st[arr[i - 1]] < st[arr[i]]) desc = false;
        if (st[arr[i - 1]] > st[arr[i]]) asc = false;
    }
    return asc && desc ? 'BOTH' : asc ? 'ASC' : desc ? 'DESC' : 'NONE';
}

const summary = {};
for (const { name, class: Cls } of algos) {
    let runs = 0, timeouts = 0, badpair = 0, desc = 0, asc = 0, none = 0, dupRuns = 0, totalSteps = 0;
    const notes = [];
    const orientSet = new Set();
    for (const n of NS) {
        if (name in BOGOLIKE && n > BOGOLIKE[name]) continue;
        let seeds = seedsFor(n);
        if (name in BOGOLIKE) seeds = n <= 4 ? 40 : n <= 6 ? 10 : 3;
        for (let s = 0; s < seeds; s++) {
            const r = runOne(Cls, n, s);
            runs++;
            if (r.outcome === 'TIMEOUT') { timeouts++; notes.push(`n=${n} TIMEOUT`); continue; }
            if (r.outcome === 'BAD_PAIR') { badpair++; notes.push(`n=${n} BAD_PAIR ${r.detail}`); continue; }
            totalSteps += r.steps;
            if (r.dups > 0) dupRuns++;
            if (ENUMERATOR.has(name)) { orientSet.add('ENUM'); continue; } // no items array by design
            if (r.items === null) { none++; notes.push(`n=${n} NO_ITEMS`); continue; }
            const st = strengthsFor(n, s);
            const out = r.items.filter(x => Number.isInteger(x) && x >= 0 && x < n);
            const counts = new Array(n).fill(0); out.forEach(x => counts[x]++);
            // Bitonic pads its array with -1 sentinels; other providers never emit -1.
            if (!r.items.every(x => (x >= 0 && x < n) || x === -1) || counts.some(c => c > 1)) {
                none++; notes.push(`n=${n} INVALID_ITEMS`); continue;
            }
            if (name === 'Budgeted Merge Sort') {
                // By design it stops when its comparison budget is exhausted; only
                // runs that complete normally are required to be sorted.
                if (r.truncated) continue;
            }
            const o = orientation(out, st);
            orientSet.add(o);
            if (NONSORTING.has(name)) { if (o === 'NONE' && out.length > 2) notes.push(`n=${n} leaves-unsorted(expected)`); continue; }
            if (LOSSY.has(name)) {
                if (o === 'NONE' && out.length > 2) none++; else if (o === 'DESC') desc++; else if (o === 'ASC') asc++;
                if (out.length >= n) notes.push(`n=${n} LOSSY_BUT_FULL_LENGTH`);
                continue;
            }
            if (out.length !== n) { none++; notes.push(`n=${n} LENGTH ${out.length}!=${n}`); continue; }
            if (o === 'DESC') desc++; else if (o === 'ASC' || o === 'BOTH') asc++; else { none++; notes.push(`n=${n} NOT_SORTED`); }
        }
    }
    const verdict = ENUMERATOR.has(name) ? 'ENUMERATOR'
        : badpair ? 'BAD_PAIR'
        : none > (NONSORTING.has(name) || name === 'Budgeted Merge Sort' ? 0 : 0) && !NONSORTING.has(name) ? 'BROKEN'
        : NONSORTING.has(name) ? 'NON_SORTING(by design)'
        : LOSSY.has(name) ? (none ? 'BROKEN(lossy)' : `SORTED(lossy) ${[...orientSet].join('/')}`)
        : timeouts ? 'TIMEOUT' : (desc && !asc) ? 'SORTED_DESC' : (asc && !desc) ? 'SORTED_ASC' : (desc && asc) ? 'SORTED_BOTH' : 'BROKEN';
    summary[name] = { runs, desc, asc, none, timeouts, badpair, dupRuns, verdict, avgSteps: runs ? (totalSteps / runs).toFixed(1) : '-' };
    console.log(
        `${verdict.padEnd(24)} ${name.padEnd(28)} runs=${String(runs).padStart(4)} desc=${String(desc).padStart(4)} asc=${String(asc).padStart(4)} ` +
        `bad=${String(none).padStart(3)} to=${String(timeouts).padStart(3)} dupRuns=${String(dupRuns).padStart(4)} avgSteps=${summary[name].avgSteps} ${notes[0] || ''}`
    );
}

fs.writeFileSync(path.join(__dirname, 'audit_results.txt'),
    Object.entries(summary).map(([k, v]) => `${k}\t${JSON.stringify(v)}`).join('\n') + '\n');
console.log('\nWrote research/audit_results.txt');
