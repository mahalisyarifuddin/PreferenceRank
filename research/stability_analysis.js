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
                if (result !== undefined) { if (result >= 0.5) this.items[f.k++] = f.L[f.i++]; else this.items[f.k++] = f.R[f.j++]; result = undefined; }
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
                        if (result >= 0.5) f.i++;
                        else { let val = this.items[f.j]; for (let k = f.j; k > f.i; k--) this.items[k] = this.items[k - 1]; this.items[f.i] = val; f.i++; f.m++; f.j++; }
                        result = undefined;
                    }
                    if (f.i <= f.m && f.j <= f.r) return [this.items[f.i], this.items[f.j]];
                }
                this.pop();
            }
        } return null;
    }
}

class KWayMergeSortProvider extends Provider {
    constructor(n, k = 2) { super(n); this.k = k; this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) {
                if (f.l >= f.r) { this.pop(); continue; }
                f.parts = []; let size = f.r - f.l + 1; let step = Math.ceil(size / this.k);
                for (let i = 0; i < this.k; i++) {
                    let l = f.l + i * step; let r = Math.min(f.l + (i + 1) * step - 1, f.r);
                    if (l <= r) f.parts.push({ l, r });
                }
                f.state = 1; continue;
            }
            if (typeof f.state === 'number' && f.state >= 1 && f.state <= f.parts.length) {
                let p = f.parts[f.state - 1]; this.stack.push({ l: p.l, r: p.r, state: 0 }); continue;
            }
            if (f.state === f.parts.length + 1) {
                f.arrays = f.parts.map(p => this.items.slice(p.l, p.r + 1));
                f.ii = new Array(f.arrays.length).fill(0); f.p = f.l;
                f.sz = 1; while (f.sz < f.arrays.length) f.sz *= 2;
                f.tree = new Array(2 * f.sz).fill(-1);
                for (let i = 0; i < f.arrays.length; i++) f.tree[f.sz + i] = i;
                f.bIdx = f.sz - 1; f.state = 'build';
            }
            if (f.state === 'build') {
                if (result !== undefined) {
                    let L = 2 * f.bIdx, R = 2 * f.bIdx + 1;
                    if (f.tree[L] === -1) f.tree[f.bIdx] = f.tree[R];
                    else if (f.tree[R] === -1) f.tree[f.bIdx] = f.tree[L];
                    else f.tree[f.bIdx] = (result >= 0.5) ? f.tree[L] : f.tree[R];
                    f.bIdx--; result = undefined;
                }
                while (f.bIdx >= 1) {
                    let L = 2 * f.bIdx, R = 2 * f.bIdx + 1;
                    if (f.tree[L] === -1) { f.tree[f.bIdx] = f.tree[R]; f.bIdx--; continue; }
                    if (f.tree[R] === -1) { f.tree[f.bIdx] = f.tree[L]; f.bIdx--; continue; }
                    return [f.arrays[f.tree[L]][f.ii[f.tree[L]]], f.arrays[f.tree[R]][f.ii[f.tree[R]]]];
                }
                f.state = 'pick';
            }
            if (f.state === 'pick') {
                let w = f.tree[1]; if (w === -1) { this.pop(); continue; }
                this.items[f.p++] = f.arrays[w][f.ii[w]++];
                if (f.ii[w] >= f.arrays[w].length) f.tree[f.sz + w] = -1;
                f.bIdx = f.sz + w; f.state = 'rebuild';
            }
            if (f.state === 'rebuild') {
                while (f.bIdx > 1) {
                    let P = Math.floor(f.bIdx / 2), L = 2 * P, R = 2 * P + 1;
                    if (result !== undefined) {
                        if (f.tree[L] === -1) f.tree[P] = f.tree[R];
                        else if (f.tree[R] === -1) f.tree[P] = f.tree[L];
                        else f.tree[P] = (result >= 0.5) ? f.tree[L] : f.tree[R];
                        f.bIdx = P; result = undefined; continue;
                    }
                    if (f.tree[L] === -1) { f.tree[P] = f.tree[R]; f.bIdx = P; continue; }
                    if (f.tree[R] === -1) { f.tree[P] = f.tree[L]; f.bIdx = P; continue; }
                    return [f.arrays[f.tree[L]][f.ii[f.tree[L]]], f.arrays[f.tree[R]][f.ii[f.tree[R]]]];
                }
                f.state = 'pick';
            }
        } return null;
    }
}

class MergeSort4WayProvider extends KWayMergeSortProvider { constructor(n) { super(n, 4); } }

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
    const fTaus = new Float64Array(trials);
    const vBattles = new Float64Array(trials);
    const iBattles = new Float64Array(trials);
    const fBattles = new Float64Array(trials);

    for (let t = 0; t < trials; t++) {
        const trueStrengths = new Float64Array(n);
        for (let i = 0; i < n; i++) trueStrengths[i] = Math.random() * 2000;

        const v = simulate(n, MergeSortProvider, trueStrengths);
        const i = simulate(n, InPlaceMergeSortProvider, trueStrengths);
        const f = simulate(n, MergeSort4WayProvider, trueStrengths);

        vTaus[t] = v.tau; vBattles[t] = v.battles;
        iTaus[t] = i.tau; iBattles[t] = i.battles;
        fTaus[t] = f.tau; fBattles[t] = f.battles;
    }

    const stats = (arr) => {
        const mean = arr.reduce((a, b) => a + b) / trials;
        const sem = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (trials * (trials - 1)));
        return { mean, sem };
    };

    return {
        vTau: stats(vTaus), vBattles: stats(vBattles),
        iTau: stats(iTaus), iBattles: stats(iBattles),
        fTau: stats(fTaus), fBattles: stats(fBattles)
    };
}

if (isMainThread) {
    const trialCounts = [];
    for (let i = 50; i <= 1000; i += 50) trialCounts.push(i);
    console.log('Trials\tV_Tau\tV_SEM\tV_Battles\tI_Tau\tI_SEM\tI_Battles\tF_Tau\tF_SEM\tF_Battles');
    let completed = 0;
    const results = new Array(trialCounts.length);
    for (let i = 0; i < trialCounts.length; i++) {
        const trials = trialCounts[i];
        const worker = new Worker(__filename, { workerData: { n: 100, trials } });
        worker.on('message', (res) => { results[i] = { trials, ...res }; });
        worker.on('exit', () => {
            if (++completed === trialCounts.length) {
                results.forEach(r => {
                    if (r) console.log(`${r.trials}\t${r.vTau.mean.toFixed(5)}\t${r.vTau.sem.toFixed(6)}\t${r.vBattles.mean.toFixed(2)}\t${r.iTau.mean.toFixed(5)}\t${r.iTau.sem.toFixed(6)}\t${r.iBattles.mean.toFixed(2)}\t${r.fTau.mean.toFixed(5)}\t${r.fTau.sem.toFixed(6)}\t${r.fBattles.mean.toFixed(2)}`);
                });
            }
        });
    }
} else {
    const { n, trials } = workerData;
    parentPort.postMessage(simulatePaired(n, trials));
}
