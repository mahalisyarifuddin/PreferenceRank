const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');

const Math_log10 = Math.log(10);
const SCALE = 400 / Math_log10;

function runBT(n, wins, adj, threshold = 1e-7, maxIter = 1000) {
    const PRIOR = 0.5, W = new Float64Array(n); for (let i = 0; i < n; i++) W[i] = wins[i] + PRIOR;
    const s = new Float64Array(n).fill(1.0), currentLogs = new Float64Array(n), prevLogS = new Float64Array(n), RENORM = 16;
    for (let iter = 0; iter < maxIter; iter++) {
        let maxDelta = 0; for (let i = 0; i < n; i++) {
            const si = s[i]; let denom = 1 / (si + 1) + 1e-12; const row = adj[i];
            for (let k = 0, len = row.length; k < len; k += 2) denom += row[k + 1] / (si + s[row[k]]);
            s[i] = W[i] / denom;
        }
        if ((iter & (RENORM - 1)) === RENORM - 1 || iter === maxIter - 1) {
            let lsum = 0; for (let i = 0; i < n; i++) { const l = Math.log(s[i]); currentLogs[i] = l; lsum += l; }
            const sc = lsum / n, scale = Math.exp(sc);
            for (let i = 0; i < n; i++) { s[i] /= scale; const curLog = currentLogs[i] - sc; const delta = Math.abs(curLog - prevLogS[i]); if (delta > maxDelta) maxDelta = delta; prevLogS[i] = curLog; }
            if (iter > 0 && maxDelta < threshold) break;
        }
    }
    const rawScores = new Float64Array(n); for (let i = 0; i < n; i++) rawScores[i] = 1000 + Math.log(s[i]) * SCALE; return rawScores;
}

function kendallTau(arr1, arr2) {
    let n = arr1.length, concordant = 0, discordant = 0;
    for (let i = 0; i < n; i++) {
        const a1 = arr1[i], a2 = arr2[i];
        for (let j = i + 1; j < n; j++) {
            if ((a1 < arr1[j]) === (a2 < arr2[j])) concordant++; else discordant++;
        }
    }
    return (concordant - discordant) / (n * (n - 1) / 2);
}

class Provider {
    constructor(n) { this.n = n; this.items = Array.from({ length: n }, (_, i) => i); this.stack = []; }
    pop() { this.stack.pop(); if (this.stack.length > 0) { let f = this.stack[this.stack.length - 1]; if (typeof f.state === 'number') f.state++; } }
}

class MergeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) { if (f.l >= f.r) { this.pop(); continue; } f.mid = Math.floor((f.l + f.r) / 2); this.stack.push({ l: f.l, r: f.mid, state: 0 }); continue; }
            if (f.state === 1) { this.stack.push({ l: f.mid + 1, r: f.r, state: 0 }); continue; }
            if (f.state === 2) { f.L = this.items.slice(f.l, f.mid + 1); f.R = this.items.slice(f.mid + 1, f.r + 1); f.i = 0; f.j = 0; f.k = f.l; f.state = 3; }
            if (f.state === 3) {
                if (result !== undefined) {
                    if (result === 1) this.items[f.k++] = f.L[f.i++]; else this.items[f.k++] = f.R[f.j++];
                    result = undefined;
                }
                if (f.i < f.L.length && f.j < f.R.length) return [f.L[f.i], f.R[f.j]];
                while (f.i < f.L.length) this.items[f.k++] = f.L[f.i++];
                while (f.j < f.R.length) this.items[f.k++] = f.R[f.j++];
                this.pop();
            }
        } return null;
    }
}

class InPlaceMergeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) { if (f.l >= f.r) { this.pop(); continue; } f.m = Math.floor((f.l + f.r) / 2); this.stack.push({ l: f.l, r: f.m, state: 0 }); continue; }
            if (f.state === 1) { this.stack.push({ l: f.m + 1, r: f.r, state: 0 }); continue; }
            if (f.state === 2) { f.i = f.l; f.j = f.m + 1; f.state = 3; }
            if (f.state === 3) {
                if (f.i <= f.m && f.j <= f.r) {
                    if (result !== undefined) {
                        if (result === 0) {
                            let val = this.items[f.j]; for (let k = f.j; k > f.i; k--) this.items[k] = this.items[k - 1]; this.items[f.i] = val;
                            f.i++; f.m++; f.j++;
                        } else f.i++;
                        result = undefined;
                    }
                    if (f.i <= f.m && f.j <= f.r) return [this.items[f.i], this.items[f.j]];
                }
                this.pop();
            }
        } return null;
    }
}

function simulate(n, ProviderClass, trueStrengths) {
    const provider = new ProviderClass(n);
    const wins = new Float64Array(n);
    const adjMaps = Array.from({ length: n }, () => new Map());
    const matchesMap = new Map();
    let pair = provider.next(), uniqueBattles = 0;
    while (pair) {
        const [a, b] = pair;
        const pairKey = a < b ? (a << 16) | b : (b << 16) | a;
        const matchResult = matchesMap.get(pairKey);
        let res;
        if (matchResult !== undefined) {
            res = matchResult.a === a ? matchResult.res : 1 - matchResult.res;
        } else {
            uniqueBattles++;
            res = trueStrengths[a] > trueStrengths[b] ? 1 : 0;
            matchesMap.set(pairKey, { a, res });
            wins[a] += res; wins[b] += 1 - res;
            adjMaps[a].set(b, (adjMaps[a].get(b) || 0) + 1);
            adjMaps[b].set(a, (adjMaps[b].get(a) || 0) + 1);
        }
        pair = provider.next(res);
    }
    const adj = adjMaps.map(m => { const row = new Int32Array(m.size * 2); let k = 0; for (const [j, c] of m) { row[k++] = j; row[k++] = c; } return row; });
    return { tau: kendallTau(trueStrengths, runBT(n, wins, adj)), battles: uniqueBattles };
}

function simulatePaired(n, trials) {
    const vTaus = new Float64Array(trials);
    const iTaus = new Float64Array(trials);
    const diffs = new Float64Array(trials);

    for (let t = 0; t < trials; t++) {
        const trueStrengths = new Float64Array(n);
        for (let i = 0; i < n; i++) trueStrengths[i] = Math.random() * 2000;

        const vanilla = simulate(n, MergeSortProvider, trueStrengths);
        const inPlace = simulate(n, InPlaceMergeSortProvider, trueStrengths);

        vTaus[t] = vanilla.tau;
        iTaus[t] = inPlace.tau;
        diffs[t] = iTaus[t] - vTaus[t];
    }

    const meanV = vTaus.reduce((a, b) => a + b) / trials;
    const meanI = iTaus.reduce((a, b) => a + b) / trials;
    const meanDiff = diffs.reduce((a, b) => a + b) / trials;

    const semV = Math.sqrt(vTaus.reduce((a, b) => a + Math.pow(b - meanV, 2), 0) / (trials * (trials - 1)));
    const semI = Math.sqrt(iTaus.reduce((a, b) => a + Math.pow(b - meanI, 2), 0) / (trials * (trials - 1)));
    const semDiff = Math.sqrt(diffs.reduce((a, b) => a + Math.pow(b - meanDiff, 2), 0) / (trials * (trials - 1)));

    return { meanV, semV, meanI, semI, meanDiff, semDiff };
}

if (isMainThread) {
    const trialCounts = [];
    for (let i = 50; i <= 1000; i += 50) trialCounts.push(i);
    console.log('Trials\tVanilla_Tau\tVanilla_SEM\tInPlace_Tau\tInPlace_SEM\tMean_Diff\tSEM_Diff\tTotal_SEM');
    let completed = 0;
    const results = new Array(trialCounts.length);
    for (let i = 0; i < trialCounts.length; i++) {
        const trials = trialCounts[i];
        const worker = new Worker(__filename, { workerData: { n: 100, trials } });
        worker.on('message', (res) => {
            results[i] = { trials, ...res, totalSEM: res.semV + res.semI };
        });
        worker.on('exit', () => {
            if (++completed === trialCounts.length) {
                results.forEach(r => console.log(`${r.trials}\t${r.meanV.toFixed(5)}\t${r.semV.toFixed(5)}\t${r.meanI.toFixed(5)}\t${r.semI.toFixed(5)}\t${r.meanDiff.toFixed(6)}\t${r.semDiff.toFixed(6)}\t${r.totalSEM.toFixed(6)}`));
            }
        });
    }
} else {
    const { n, trials } = workerData;
    parentPort.postMessage(simulatePaired(n, trials));
}
