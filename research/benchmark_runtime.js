/**
 * Runtime benchmark for all providers.
 * Measures wall-clock time to drive each provider to completion
 * for N=1000 with random strengths (oracle), averaged over trials.
 * This complements the battle-count benchmark (which measures unique
 * human comparisons) with a machine-time perspective.
 *
 * Usage: node research/benchmark_runtime.js 1000 20
 */
'use strict';
const fs = require('fs');
const path = require('path');

let src = fs.readFileSync(path.join(__dirname, 'sort_analysis.js'), 'utf8');
src = src.slice(0, src.indexOf('const { Worker'));
src += '\nglobalThis.__algos = algos;';
eval(src);
const algos = globalThis.__algos;

function runProvider(Cls, n, strengths) {
    const oracle = (a,b) => (a===b?0:(strengths[a]>strengths[b]?1:0));
    const p = new Cls(n);
    let pair = p.next();
    let steps=0;
    const STEP_CAP=5e6;
    while(pair!==null && pair!==undefined){
        if(++steps>STEP_CAP) return {timeout:true, steps};
        const [a,b]=pair;
        pair = p.next(oracle(a,b));
    }
    return {timeout:false, steps, items:p.items};
}

function benchOne(Cls, n, trials){
    let totalTime=0, totalSteps=0, timeouts=0;
    for(let t=0;t<trials;t++){
        const strengths = new Float64Array(n);
        for(let i=0;i<n;i++) strengths[i]=Math.random()*2000;
        const start = process.hrtime.bigint();
        const r = runProvider(Cls, n, strengths);
        const end = process.hrtime.bigint();
        const ms = Number(end-start)/1e6;
        totalTime+=ms;
        if(r.timeout) timeouts++;
        else totalSteps+=r.steps;
    }
    return {avgMs: totalTime/trials, avgSteps: totalSteps/Math.max(1,trials-timeouts), timeouts};
}

const args = process.argv.slice(2);
const n = args[0]?parseInt(args[0]):1000;
const trials = args[1]?parseInt(args[1]):20;

console.log(`Runtime benchmark N=${n} trials=${trials}`);
console.log(`Algorithm\tAvg Ms\tAvg Steps\tTimeouts`);

const results=[];
for(const {name, class:Cls} of algos){
    // Skip exponential bogo sorts for large n
    const BOGOLIKE = ['Bogosort','BogoBogoSort','Bozo Sort','Silly Sort','Permutation Sort','Bovo Sort','Cocktail Bogo','Exchange Bogo','Bubble Bogo','Odd-Even Bogo','Less Bogo'];
    if(n>20 && BOGOLIKE.includes(name)) {
        console.log(`${name}\tSKIP\t-\t-`);
        results.push({name, avgMs: Infinity, avgSteps:0});
        continue;
    }
    const r = benchOne(Cls, n, trials);
    console.log(`${name}\t${r.avgMs.toFixed(2)}\t${r.avgSteps.toFixed(1)}\t${r.timeouts}`);
    results.push({name, ...r});
}

// Write sorted by avgMs
results.sort((a,b)=>a.avgMs-b.avgMs);
fs.writeFileSync(path.join(__dirname, 'runtime_results.txt'),
    results.map(r=>`${r.name}\t${r.avgMs}\t${r.avgSteps}\t${r.timeouts}`).join('\n')+'\n');
console.log('\nWrote research/runtime_results.txt');
console.log('\nTop 10 fastest (wall-clock) for N='+n+':');
for(let i=0;i<Math.min(10, results.length);i++){
    console.log(`${i+1}. ${results[i].name}: ${results[i].avgMs.toFixed(2)} ms`);
}
