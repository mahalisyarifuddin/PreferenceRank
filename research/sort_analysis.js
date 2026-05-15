
const Math_log10 = Math.log(10);
const SCALE = 400 / Math_log10;

// Bradley-Terry MM Implementation
function runBT(n, matches, threshold = 1e-7, maxIter = 1000) {
    const wins = new Float64Array(n);
    const adjMaps = Array.from({ length: n }, () => new Map());
    for (const { a, b, result } of matches) {
        wins[a] += result;
        wins[b] += 1 - result;
        adjMaps[a].set(b, (adjMaps[a].get(b) || 0) + 1);
        adjMaps[b].set(a, (adjMaps[b].get(a) || 0) + 1);
    }
    const adj = adjMaps.map(m => {
        const row = new Int32Array(m.size * 2);
        let k = 0;
        for (const [j, c] of m) { row[k++] = j; row[k++] = c; }
        return row;
    });
    const PRIOR = 0.5;
    const W = new Float64Array(n);
    for (let i = 0; i < n; i++) W[i] = wins[i] + PRIOR;
    const s = new Float64Array(n).fill(1.0);
    const currentLogs = new Float64Array(n);
    const prevLogS = new Float64Array(n);
    const RENORM = 16;

    for (let iter = 0; iter < maxIter; iter++) {
        let maxDelta = 0;
        for (let i = 0; i < n; i++) {
            const si = s[i];
            let denom = 1 / (si + 1) + 1e-12;
            const row = adj[i];
            for (let k = 0, len = row.length; k < len; k += 2)
                denom += row[k + 1] / (si + s[row[k]]);
            s[i] = W[i] / denom;
        }
        if ((iter & (RENORM - 1)) === RENORM - 1 || iter === maxIter - 1) {
            let lsum = 0;
            for (let i = 0; i < n; i++) { const l = Math.log(s[i]); currentLogs[i] = l; lsum += l; }
            const sc = lsum / n;
            const scale = Math.exp(sc);
            for (let i = 0; i < n; i++) {
                s[i] /= scale;
                const curLog = currentLogs[i] - sc;
                const delta = Math.abs(curLog - prevLogS[i]);
                if (delta > maxDelta) maxDelta = delta;
                prevLogS[i] = curLog;
            }
            if (iter > 0 && maxDelta < threshold) break;
        }
    }
    const rawScores = new Float64Array(n);
    for (let i = 0; i < n; i++) rawScores[i] = 1000 + Math.log(s[i]) * SCALE;
    return rawScores;
}

// Kendall Tau Distance
function kendallTau(arr1, arr2) {
    let n = arr1.length;
    let concordant = 0;
    let discordant = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let a = arr1[i] < arr1[j];
            let b = arr2[i] < arr2[j];
            if (a === b) concordant++;
            else discordant++;
        }
    }
    return (concordant - discordant) / (n * (n - 1) / 2);
}

// Sorting Algorithms as "Providers"
class FJProvider {
    constructor(n) {
        this.n = n;
        this.stack = [{ items: Array.from({ length: n }, (_, i) => i), state: 0 }];
    }
    next(result) {
        while (this.stack.length > 0) {
            const frame = this.stack[this.stack.length - 1];
            if (frame.state === 0) {
                if (frame.items.length <= 1) { this.pop(frame.items); continue; }
                frame.half = frame.items.length >> 1;
                frame.winners = []; frame.losers = []; frame.pairIdx = 0; frame.state = 1;
            }
            if (frame.state === 1) {
                if (result !== undefined && frame.pairIdx > 0) {
                    const i = 2 * (frame.pairIdx - 1);
                    const a = frame.items[i], b = frame.items[i+1];
                    result === 1 ? (frame.winners.push(a), frame.losers.push(b)) : (frame.winners.push(b), frame.losers.push(a));
                    result = undefined;
                }
                if (frame.pairIdx < frame.half) {
                    const a = frame.items[2 * frame.pairIdx], b = frame.items[2 * frame.pairIdx + 1];
                    frame.pairIdx++; return [a, b];
                }
                frame.state = 2; this.stack.push({ items: frame.winners, state: 0 }); continue;
            }
            if (frame.state === 3) {
                frame.sortedWinners = frame.childResult;
                frame.loserOf = {}; frame.winners.forEach((w, i) => frame.loserOf[w] = frame.losers[i]);
                frame.chain = [frame.loserOf[frame.sortedWinners[0]], ...frame.sortedWinners];
                frame.posMap = {}; frame.chain.forEach((it, idx) => frame.posMap[it] = idx);
                frame.m = frame.sortedWinners.length;
                frame.jPrev = 1; frame.jA = 1; frame.jB = 3; frame.state = 4;
            }
            if (frame.state === 4) {
                if (frame.jPrev < frame.m) {
                    if (frame.k === undefined) frame.k = Math.min(frame.jB, frame.m);
                    if (frame.k > frame.jPrev) {
                        frame.bk = frame.loserOf[frame.sortedWinners[frame.k - 1]];
                        frame.lo = 0; frame.hi = frame.posMap[frame.sortedWinners[frame.k - 1]];
                        frame.state = 6; continue;
                    }
                    frame.jPrev = Math.min(frame.jB, frame.m);
                    const nextJB = frame.jB + 2 * frame.jA; frame.jA = frame.jB; frame.jB = nextJB;
                    frame.k = undefined; continue;
                }
                frame.state = 5;
            }
            if (frame.state === 5) {
                if (frame.items.length & 1 && !frame.oddDone) {
                    frame.bk = frame.items[frame.items.length - 1];
                    frame.lo = 0; frame.hi = frame.chain.length;
                    frame.oddDone = true; frame.state = 7; continue;
                }
                this.pop(frame.chain); continue;
            }
            if (frame.state === 6 || frame.state === 7) {
                if (result !== undefined) {
                    result === 1 ? frame.lo = frame.mid + 1 : frame.hi = frame.mid;
                    result = undefined;
                }
                if (frame.lo < frame.hi) {
                    frame.mid = (frame.lo + frame.hi) >> 1;
                    return [frame.bk, frame.chain[frame.mid]];
                }
                frame.chain.splice(frame.lo, 0, frame.bk);
                for (let i = frame.lo; i < frame.chain.length; i++) frame.posMap[frame.chain[i]] = i;
                frame.state = (frame.state === 6) ? (frame.k--, 4) : 5; continue;
            }
        }
        return null;
    }
    pop(res) {
        this.stack.pop();
        if (this.stack.length > 0) {
            const p = this.stack[this.stack.length - 1];
            p.childResult = res; p.state++;
        }
    }
}

class QuicksortProvider {
    constructor(n) {
        this.n = n;
        this.items = Array.from({ length: n }, (_, i) => i);
        this.stack = [[0, n - 1]];
        this.pivot = null;
        this.i = 0;
        this.j = 0;
        this.low = 0;
        this.high = 0;
        this.state = 'start';
    }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') {
                if (this.stack.length === 0) { this.state = 'done'; return null; }
                [this.low, this.high] = this.stack.pop();
                if (this.low < this.high) {
                    this.pivot = this.items[this.high];
                    this.i = this.low - 1;
                    this.j = this.low;
                    this.state = 'partition';
                } else continue;
            }
            if (this.state === 'partition') {
                if (result !== undefined) {
                    if (result === 1) { // items[j] < pivot
                        this.i++;
                        [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]];
                    }
                    this.j++;
                    result = undefined;
                }
                if (this.j < this.high) {
                    return [this.items[this.j], this.pivot];
                }
                [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]];
                let p = this.i + 1;
                this.stack.push([p + 1, this.high]);
                this.stack.push([this.low, p - 1]);
                this.state = 'start';
            }
        }
        return null;
    }
}

class MergeSortProvider {
    constructor(n) {
        this.n = n;
        this.items = Array.from({ length: n }, (_, i) => i);
        this.stack = [{ l: 0, r: n - 1, state: 0 }];
    }
    next(result) {
        while (this.stack.length > 0) {
            let frame = this.stack[this.stack.length - 1];
            if (frame.state === 0) {
                if (frame.l >= frame.r) { this.stack.pop(); if (this.stack.length > 0) this.stack[this.stack.length - 1].state++; continue; }
                frame.mid = Math.floor((frame.l + frame.r) / 2);
                this.stack.push({ l: frame.l, r: frame.mid, state: 0 });
                continue;
            }
            if (frame.state === 1) {
                this.stack.push({ l: frame.mid + 1, r: frame.r, state: 0 });
                continue;
            }
            if (frame.state === 2) {
                frame.leftArr = this.items.slice(frame.l, frame.mid + 1);
                frame.rightArr = this.items.slice(frame.mid + 1, frame.r + 1);
                frame.i = 0; frame.j = 0; frame.k = frame.l;
                frame.state = 3;
            }
            if (frame.state === 3) {
                if (result !== undefined) {
                    if (result === 1) {
                        this.items[frame.k++] = frame.leftArr[frame.i++];
                    } else {
                        this.items[frame.k++] = frame.rightArr[frame.j++];
                    }
                    result = undefined;
                }
                if (frame.i < frame.leftArr.length && frame.j < frame.rightArr.length) {
                    return [frame.leftArr[frame.i], frame.rightArr[frame.j]];
                }
                while (frame.i < frame.leftArr.length) this.items[frame.k++] = frame.leftArr[frame.i++];
                while (frame.j < frame.rightArr.length) this.items[frame.k++] = frame.rightArr[frame.j++];
                this.stack.pop();
                if (this.stack.length > 0) this.stack[this.stack.length - 1].state++;
                continue;
            }
        }
        return null;
    }
}

class ShellSortProvider {
    constructor(n) {
        this.n = n;
        this.items = Array.from({ length: n }, (_, i) => i);
        this.gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n);
        this.gapIdx = 0;
        this.i = 0;
        this.j = 0;
        this.state = 'nextGap';
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'nextGap') {
                if (this.gapIdx < this.gaps.length) {
                    this.gap = this.gaps[this.gapIdx++];
                    this.i = this.gap;
                    this.state = 'insertion';
                } else {
                    this.state = 'done';
                }
                continue;
            }
            if (this.state === 'insertion') {
                if (this.i < this.n) {
                    this.temp = this.items[this.i];
                    this.j = this.i;
                    this.state = 'compare';
                } else {
                    this.state = 'nextGap';
                }
                continue;
            }
            if (this.state === 'compare') {
                if (result !== undefined) {
                    if (result === 0) { // items[j-gap] > temp
                        this.items[this.j] = this.items[this.j - this.gap];
                        this.j -= this.gap;
                        result = undefined;
                    } else {
                        this.items[this.j] = this.temp;
                        this.i++;
                        this.state = 'insertion';
                        result = undefined;
                        continue;
                    }
                }
                if (this.j >= this.gap) {
                    return [this.temp, this.items[this.j - this.gap]];
                } else {
                    this.items[this.j] = this.temp;
                    this.i++;
                    this.state = 'insertion';
                    continue;
                }
            }
        }
        return null;
    }
}

class CocktailShakerProvider {
    constructor(n) {
        this.n = n;
        this.items = Array.from({ length: n }, (_, i) => i);
        this.low = 0;
        this.high = n - 1;
        this.i = 0;
        this.state = 'forward';
        this.swapped = false;
    }
    next(result) {
        while (this.low < this.high) {
            if (this.state === 'forward') {
                if (result !== undefined) {
                    if (result === 0) {
                        [this.items[this.i], this.items[this.i + 1]] = [this.items[this.i + 1], this.items[this.i]];
                        this.swapped = true;
                    }
                    this.i++;
                    result = undefined;
                }
                if (this.i < this.high) {
                    return [this.items[this.i], this.items[this.i + 1]];
                }
                if (!this.swapped) break;
                this.swapped = false;
                this.high--;
                this.i = this.high - 1;
                this.state = 'backward';
                continue;
            }
            if (this.state === 'backward') {
                if (result !== undefined) {
                    if (result === 0) {
                        [this.items[this.i], this.items[this.i + 1]] = [this.items[this.i + 1], this.items[this.i]];
                        this.swapped = true;
                    }
                    this.i--;
                    result = undefined;
                }
                if (this.i >= this.low) {
                    return [this.items[this.i], this.items[this.i + 1]];
                }
                if (!this.swapped) break;
                this.swapped = false;
                this.low++;
                this.i = this.low;
                this.state = 'forward';
                continue;
            }
        }
        return null;
    }
}

class CombSortProvider {
    constructor(n) {
        this.n = n;
        this.items = Array.from({ length: n }, (_, i) => i);
        this.gap = n;
        this.shrink = 1.3;
        this.i = 0;
        this.swapped = false;
        this.state = 'nextGap';
    }
    next(result) {
        while (true) {
            if (this.state === 'nextGap') {
                this.gap = Math.floor(this.gap / this.shrink);
                if (this.gap < 1) this.gap = 1;
                this.i = 0;
                this.swapped = false;
                this.state = 'compare';
            }
            if (this.state === 'compare') {
                if (result !== undefined) {
                    if (result === 0) {
                        [this.items[this.i], this.items[this.i + this.gap]] = [this.items[this.i + this.gap], this.items[this.i]];
                        this.swapped = true;
                    }
                    this.i++;
                    result = undefined;
                }
                if (this.i + this.gap < this.n) {
                    return [this.items[this.i], this.items[this.i + this.gap]];
                }
                if (this.gap === 1 && !this.swapped) break;
                this.state = 'nextGap';
                continue;
            }
        }
        return null;
    }
}

class HeapSortProvider {
    constructor(n) {
        this.n = n;
        this.items = Array.from({ length: n }, (_, i) => i);
        this.i = Math.floor(n / 2) - 1;
        this.state = 'heapify';
        this.heapSize = n;
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'heapify') {
                if (this.i >= 0) {
                    this.state = 'siftDown';
                    this.curr = this.i;
                    this.i--;
                } else {
                    this.i = this.n - 1;
                    this.state = 'sort';
                }
                continue;
            }
            if (this.state === 'siftDown') {
                if (result !== undefined) {
                    if (result === 1) { // items[largest] > items[curr]
                        [this.items[this.curr], this.items[this.largest]] = [this.items[this.largest], this.items[this.curr]];
                        this.curr = this.largest;
                    } else {
                        this.state = this.savedState || 'heapify';
                        this.savedState = null;
                        result = undefined;
                        continue;
                    }
                    result = undefined;
                }
                let left = 2 * this.curr + 1;
                let right = 2 * this.curr + 2;
                this.largest = this.curr;
                if (left < this.heapSize && right < this.heapSize) {
                    if (this.comparingLeftRight === undefined) {
                        this.comparingLeftRight = true;
                        return [this.items[left], this.items[right]];
                    }
                    if (this.comparingLeftRight) {
                        let betterChild = (result === 1) ? left : right;
                        this.comparingLeftRight = false;
                        this.tempBetterChild = betterChild;
                        result = undefined;
                        return [this.items[betterChild], this.items[this.curr]];
                    }
                    if (result === 1) {
                        [this.items[this.curr], this.items[this.tempBetterChild]] = [this.items[this.tempBetterChild], this.items[this.curr]];
                        this.curr = this.tempBetterChild;
                        this.comparingLeftRight = undefined;
                        result = undefined;
                        continue;
                    } else {
                        this.state = this.savedState || 'heapify';
                        this.savedState = null;
                        this.comparingLeftRight = undefined;
                        result = undefined;
                        continue;
                    }
                } else if (left < this.heapSize) {
                    this.largest = left;
                    return [this.items[this.largest], this.items[this.curr]];
                } else {
                    this.state = this.savedState || 'heapify';
                    this.savedState = null;
                    continue;
                }
            }
            if (this.state === 'sort') {
                if (this.i > 0) {
                    [this.items[0], this.items[this.i]] = [this.items[this.i], this.items[0]];
                    this.heapSize = this.i;
                    this.curr = 0;
                    this.savedState = 'sort';
                    this.state = 'siftDown';
                    this.i--;
                } else {
                    this.state = 'done';
                }
                continue;
            }
        }
        return null;
    }
}

class FullRankProvider {
    constructor(n) {
        this.n = n;
        this.pairs = [];
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) this.pairs.push([i, j]);
        for (let i = this.pairs.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.pairs[i], this.pairs[j]] = [this.pairs[j], this.pairs[i]];
        }
        this.idx = 0;
    }
    next() {
        if (this.idx < this.pairs.length) return this.pairs[this.idx++];
        return null;
    }
}

class RandomPairProvider {
    constructor(n, maxBattles) {
        this.n = n;
        this.maxBattles = maxBattles;
        this.count = 0;
    }
    next() {
        if (this.count < this.maxBattles) {
            this.count++;
            let a = Math.floor(Math.random() * this.n);
            let b = Math.floor(Math.random() * this.n);
            while (a === b) b = Math.floor(Math.random() * this.n);
            return [a, b];
        }
        return null;
    }
}

function simulate(n, ProviderClass, trials = 50, extraParam) {
    let totalComps = 0;
    let totalTau = 0;
    for (let t = 0; t < trials; t++) {
        const trueStrengths = Array.from({ length: n }, () => Math.random() * 2000);
        const provider = new ProviderClass(n, extraParam);
        const matches = [];
        let pair = provider.next();
        let comps = 0;
        while (pair) {
            comps++;
            const [a, b] = pair;
            const res = trueStrengths[a] > trueStrengths[b] ? 1 : 0;
            matches.push({ a, b, result: res });
            pair = provider.next(res);
        }
        totalComps += comps;
        const estimatedScores = runBT(n, matches);
        totalTau += kendallTau(trueStrengths, estimatedScores);
    }
    return { avgComps: totalComps / trials, avgTau: totalTau / trials };
}

const N = 100;
console.log(`Simulating N=${N}, trials=50`);
console.log('Algorithm\tAvg Battles\tAvg Kendall Tau');
const algorithms = [
    { name: 'Ford-Johnson', class: FJProvider },
    { name: 'Merge Sort', class: MergeSortProvider },
    { name: 'Shellsort', class: ShellSortProvider },
    { name: 'Heapsort', class: HeapSortProvider },
    { name: 'Comb Sort', class: CombSortProvider },
    { name: 'Cocktail Shaker', class: CocktailShakerProvider },
    { name: 'Quicksort', class: QuicksortProvider },
    { name: 'Full Rank', class: FullRankProvider }
];

let fjBattles = 0;
for (const algo of algorithms) {
    const res = simulate(N, algo.class);
    console.log(`${algo.name}\t${res.avgComps.toFixed(2)}\t${res.avgTau.toFixed(4)}`);
    if (algo.name === 'Ford-Johnson') fjBattles = res.avgComps;
}
const resRand = simulate(N, RandomPairProvider, 50, Math.round(fjBattles));
console.log(`Random Pairs\t${resRand.avgComps.toFixed(2)}\t${resRand.avgTau.toFixed(4)} (Matched to FJ)`);
