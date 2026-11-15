/**
 * Fresh-seed confirmation of the production-relevant rows of the battle table.
 * Uses the exact standard protocol: simulate(n=100, trials=250).
 * The committed results.txt remains the full-suite snapshot; the comparison
 * harness is unchanged by the radix work, so only the headline rows are
 * re-measured here (a full rerun takes hours on a 2-core box).
 *
 * Usage: node research/confirm_battle.js > research/results_2026-11.txt
 */
'use strict';
const fs = require('fs');
const path = require('path');

let src = fs.readFileSync(path.join(__dirname, 'sort_analysis.js'), 'utf8');
src = src.slice(0, src.indexOf('const { Worker'));
src += '\nglobalThis.__algos = { algos, simulate };';
eval(src);
const { algos, simulate } = globalThis.__algos;

const KEY_ROWS = [
    'Full Rank',
    'Budgeted Merge Sort',
    'Ford-Johnson (Quick)',
    'Merge Sort',
    'Binary Insertion',
    'Binary Gnome',
    'Interpolation Sort',
    'Quicksort (Ninther)',
    '64-way Merge Sort',
    'Timsort',
    'Insertion Sort',
    'Recursive Binary Insertion',
];

console.log('Algorithm\tAvg Battles\tAvg Kendall Tau\tDuplicates');
for (const name of KEY_ROWS) {
    const entry = algos.find(a => a.name === name);
    if (!entry) { console.log(`${name}\tMISSING\t-\t-`); continue; }
    const res = simulate(100, entry.class, 250);
    console.log(`${name}\t${res.avgComps.toFixed(2)}\t${res.avgTau.toFixed(4)}\t${res.hasDuplicates ? 'YES' : 'NO'}`);
}
