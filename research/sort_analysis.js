
const Math_log10 = Math.log(10);
const SCALE = 400 / Math_log10;

// Bradley-Terry MM Implementation
function runBT(n, wins, adj, threshold = 1e-7, maxIter = 1000) {
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

// Providers
class Provider { constructor(n) { this.n = n; this.items = Array.from({length:n}, (_,i)=>i); } }

class FJProvider extends Provider {
    constructor(n) {
        super(n);
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

class QuicksortProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') {
                if (this.stack.length === 0) { this.state = 'done'; return null; }
                [this.low, this.high] = this.stack.pop();
                if (this.low < this.high) {
                    this.pivot = this.items[this.high]; this.i = this.low - 1; this.j = this.low; this.state = 'partition';
                } else continue;
            }
            if (this.state === 'partition') {
                if (result !== undefined) {
                    if (result === 1) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; }
                    this.j++; result = undefined;
                }
                if (this.j < this.high) return [this.items[this.j], this.pivot];
                [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]];
                let p = this.i + 1; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start';
            }
        }
        return null;
    }
}

class MergeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) {
                if (f.l >= f.r) { this.stack.pop(); if (this.stack.length > 0) this.stack[this.stack.length - 1].state++; continue; }
                f.mid = Math.floor((f.l + f.r) / 2); this.stack.push({ l: f.l, r: f.mid, state: 0 }); continue;
            }
            if (f.state === 1) { this.stack.push({ l: f.mid + 1, r: f.r, state: 0 }); continue; }
            if (f.state === 2) { f.leftArr = this.items.slice(f.l, f.mid + 1); f.rightArr = this.items.slice(f.mid + 1, f.r + 1); f.i = 0; f.j = 0; f.k = f.l; f.state = 3; }
            if (f.state === 3) {
                if (result !== undefined) {
                    if (result === 1) this.items[f.k++] = f.leftArr[f.i++]; else this.items[f.k++] = f.rightArr[f.j++];
                    result = undefined;
                }
                if (f.i < f.leftArr.length && f.j < f.rightArr.length) return [f.leftArr[f.i], f.rightArr[f.j]];
                while (f.i < f.leftArr.length) this.items[f.k++] = f.leftArr[f.i++];
                while (f.j < f.rightArr.length) this.items[f.k++] = f.rightArr[f.j++];
                this.stack.pop(); if (this.stack.length > 0) this.stack[this.stack.length - 1].state++;
            }
        }
        return null;
    }
}

class ShellSortProvider extends Provider {
    constructor(n) { super(n); this.gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n); this.gapIdx = 0; this.state = 'nextGap'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'nextGap') {
                if (this.gapIdx < this.gaps.length) { this.gap = this.gaps[this.gapIdx++]; this.i = this.gap; this.state = 'insertion'; } else this.state = 'done';
                continue;
            }
            if (this.state === 'insertion') {
                if (this.i < this.n) { this.temp = this.items[this.i]; this.j = this.i; this.state = 'compare'; } else this.state = 'nextGap';
                continue;
            }
            if (this.state === 'compare') {
                if (result !== undefined) {
                    if (result === 0) { this.items[this.j] = this.items[this.j - this.gap]; this.j -= this.gap; result = undefined; }
                    else { this.items[this.j] = this.temp; this.i++; this.state = 'insertion'; result = undefined; continue; }
                }
                if (this.j >= this.gap) return [this.temp, this.items[this.j - this.gap]];
                this.items[this.j] = this.temp; this.i++; this.state = 'insertion';
            }
        }
        return null;
    }
}

class BubbleSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.j = 0; this.swapped = false; }
    next(result) {
        while (this.i < this.n - 1) {
            if (result !== undefined) {
                if (result === 0) { [this.items[this.j], this.items[this.j + 1]] = [this.items[this.j + 1], this.items[this.j]]; this.swapped = true; }
                this.j++; result = undefined;
            }
            if (this.j < this.n - this.i - 1) return [this.items[this.j], this.items[this.j + 1]];
            if (!this.swapped) break;
            this.i++; this.j = 0; this.swapped = false;
        }
        return null;
    }
}

class BogosortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.cap = 1000; this.totalComps = 0; }
    next(result) {
        while (this.totalComps < this.cap) {
            if (result !== undefined) {
                this.totalComps++;
                if (result === 1) this.i++;
                else { for (let k = this.n - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [this.items[k], this.items[j]] = [this.items[j], this.items[k]]; } this.i = 0; }
                result = undefined;
            }
            if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
            break;
        }
        return null;
    }
}

class SelectionSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.j = 1; this.minIdx = 0; }
    next(result) {
        while (this.i < this.n - 1) {
            if (result !== undefined) { if (result === 0) this.minIdx = this.j; this.j++; result = undefined; }
            if (this.j < this.n) return [this.items[this.minIdx], this.items[this.j]];
            [this.items[this.i], this.items[this.minIdx]] = [this.items[this.minIdx], this.items[this.i]];
            this.i++; this.minIdx = this.i; this.j = this.i + 1;
        }
        return null;
    }
}

class InsertionSortProvider extends Provider {
    constructor(n) { super(n); this.i = 1; this.j = 0; this.state = 'start'; }
    next(result) {
        while (this.i < this.n) {
            if (this.state === 'start') { this.temp = this.items[this.i]; this.j = this.i - 1; this.state = 'compare'; }
            if (result !== undefined) {
                if (result === 0) { this.items[this.j + 1] = this.items[this.j]; this.j--; result = undefined; }
                else { this.items[this.j + 1] = this.temp; this.i++; this.state = 'start'; result = undefined; continue; }
            }
            if (this.j >= 0) return [this.temp, this.items[this.j]];
            this.items[this.j + 1] = this.temp; this.i++; this.state = 'start';
        }
        return null;
    }
}

class BinaryInsertionSortProvider extends Provider {
    constructor(n) { super(n); this.i = 1; this.state = 'start'; }
    next(result) {
        while (this.i < this.n) {
            if (this.state === 'start') { this.temp = this.items[this.i]; this.lo = 0; this.hi = this.i; this.state = 'binarySearch'; }
            if (result !== undefined) { if (result === 1) this.lo = this.mid + 1; else this.hi = this.mid; result = undefined; }
            if (this.lo < this.hi) { this.mid = (this.lo + this.hi) >> 1; return [this.temp, this.items[this.mid]]; }
            for (let k = this.i; k > this.lo; k--) this.items[k] = this.items[k - 1];
            this.items[this.lo] = this.temp; this.i++; this.state = 'start';
        }
        return null;
    }
}

class GnomeSortProvider extends Provider {
    constructor(n) { super(n); this.i = 1; }
    next(result) {
        while (this.i < this.n) {
            if (result !== undefined) {
                if (result === 1) this.i++; else { [this.items[this.i], this.items[this.i-1]] = [this.items[this.i-1], this.items[this.i]]; this.i--; }
                if (this.i === 0) this.i = 1; result = undefined;
            }
            if (this.i < this.n) return [this.items[this.i], this.items[this.i-1]];
        }
        return null;
    }
}

class StoogeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ i: 0, j: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) {
                if (result !== undefined) {
                    if (result === 0) [this.items[f.i], this.items[f.j]] = [this.items[f.j], this.items[f.i]];
                    f.state = 1; result = undefined;
                } else return [this.items[f.i], this.items[f.j]];
            }
            if (f.state === 1) {
                if (f.j - f.i + 1 > 2) { let t = Math.floor((f.j - f.i + 1) / 3); this.stack.push({ i: f.i, j: f.j - t, state: 0 }); f.state = 2; }
                else this.stack.pop();
            } else if (f.state === 2) { let t = Math.floor((f.j - f.i + 1) / 3); this.stack.push({ i: f.i + t, j: f.j, state: 0 }); f.state = 3; }
            else if (f.state === 3) { let t = Math.floor((f.j - f.i + 1) / 3); this.stack.push({ i: f.i, j: f.j - t, state: 0 }); f.state = 4; }
            else if (f.state === 4) this.stack.pop();
        }
        return null;
    }
}

class CycleSortProvider extends Provider {
    constructor(n) { super(n); this.cycleStart = 0; this.state = 'findPos'; this.pos = 0; }
    next(result) {
        while (this.cycleStart < this.n - 1) {
            if (this.state === 'findPos') {
                if (this.pos === 0) { this.item = this.items[this.cycleStart]; this.pos = this.cycleStart; this.idx = this.cycleStart + 1; }
                if (result !== undefined) { if (result === 1) this.pos++; this.idx++; result = undefined; }
                if (this.idx < this.n) return [this.item, this.items[this.idx]];
                if (this.pos === this.cycleStart) { this.cycleStart++; this.pos = 0; continue; }
                while (this.item === this.items[this.pos]) this.pos++;
                [this.items[this.pos], this.item] = [this.item, this.items[this.pos]];
                this.state = 'cycle'; this.idx = this.cycleStart + 1; this.pos = 0; continue;
            }
            if (this.state === 'cycle') {
                if (this.pos === 0) { this.pos = this.cycleStart; this.idx = this.cycleStart + 1; }
                if (result !== undefined) { if (result === 1) this.pos++; this.idx++; result = undefined; }
                if (this.idx < this.n) return [this.item, this.items[this.idx]];
                while (this.item === this.items[this.pos]) this.pos++;
                [this.items[this.pos], this.item] = [this.item, this.items[this.pos]];
                if (this.pos === this.cycleStart) { this.cycleStart++; this.pos = 0; this.state = 'findPos'; }
                else { this.state = 'cycle'; this.pos = 0; }
            }
        }
        return null;
    }
}

class BitonicSortProvider extends Provider {
    constructor(n) { super(n); this.pow2 = 1; while (this.pow2 < n) this.pow2 *= 2;
        this.items = Array.from({ length: this.pow2 }, (_, i) => i < n ? i : -1);
        this.k = 2; this.j = 0; this.i = 0; this.state = 'nextK'; }
    next(result) {
        while (this.k <= this.pow2) {
            if (this.state === 'nextK') { this.j = this.k / 2; this.state = 'nextJ'; continue; }
            if (this.state === 'nextJ') { if (this.j > 0) { this.i = 0; this.state = 'compare'; } else { this.k *= 2; this.state = 'nextK'; } continue; }
            if (this.state === 'compare') {
                if (result !== undefined) {
                    let a = this.i, b = this.i ^ this.j;
                    if (b > a) { let dir = (this.i & this.k) === 0; if ((dir && result === 0) || (!dir && result === 1)) [this.items[a], this.items[b]] = [this.items[b], this.items[a]]; }
                    this.i++; result = undefined;
                }
                while (this.i < this.pow2) {
                    let a = this.i, b = this.i ^ this.j;
                    if (b > a) {
                        if (this.items[a] === -1) { this.items[a] = this.items[b]; this.items[b] = -1; this.i++; continue; }
                        if (this.items[b] === -1) { this.i++; continue; }
                        return [this.items[a], this.items[b]];
                    }
                    this.i++;
                }
                this.j = Math.floor(this.j / 2); this.state = 'nextJ';
            }
        }
        return null;
    }
}

class HeapSortProvider extends Provider {
    constructor(n) { super(n); this.i = Math.floor(n / 2) - 1; this.state = 'heapify'; this.heapSize = n; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'heapify') { if (this.i >= 0) { this.state = 'siftDown'; this.curr = this.i; this.i--; } else { this.i = this.n - 1; this.state = 'sort'; } continue; }
            if (this.state === 'siftDown') {
                if (result !== undefined) {
                    if (result === 1) { [this.items[this.curr], this.items[this.largest]] = [this.items[this.largest], this.items[this.curr]]; this.curr = this.largest; }
                    else { this.state = this.savedState || 'heapify'; this.savedState = null; result = undefined; continue; }
                    result = undefined;
                }
                let l = 2 * this.curr + 1, r = 2 * this.curr + 2; this.largest = this.curr;
                if (l < this.heapSize && r < this.heapSize) {
                    if (this.comparingLeftRight === undefined) { this.comparingLeftRight = true; return [this.items[l], this.items[r]]; }
                    if (this.comparingLeftRight) { let b = (result === 1) ? l : r; this.comparingLeftRight = false; this.tempBetterChild = b; result = undefined; return [this.items[b], this.items[this.curr]]; }
                    if (result === 1) { [this.items[this.curr], this.items[this.tempBetterChild]] = [this.items[this.tempBetterChild], this.items[this.curr]]; this.curr = this.tempBetterChild; this.comparingLeftRight = undefined; result = undefined; continue; }
                    else { this.state = this.savedState || 'heapify'; this.savedState = null; this.comparingLeftRight = undefined; result = undefined; continue; }
                } else if (l < this.heapSize) { this.largest = l; return [this.items[this.largest], this.items[this.curr]]; }
                else { this.state = this.savedState || 'heapify'; this.savedState = null; continue; }
            }
            if (this.state === 'sort') { if (this.i > 0) { [this.items[0], this.items[this.i]] = [this.items[this.i], this.items[0]]; this.heapSize = this.i; this.curr = 0; this.savedState = 'sort'; this.state = 'siftDown'; this.i--; } else this.state = 'done'; }
        }
        return null;
    }
}

class CombSortProvider extends Provider {
    constructor(n) { super(n); this.gap = n; this.shrink = 1.3; this.i = 0; this.swapped = false; this.state = 'nextGap'; }
    next(result) {
        while (true) {
            if (this.state === 'nextGap') { this.gap = Math.floor(this.gap / this.shrink); if (this.gap < 1) this.gap = 1; this.i = 0; this.swapped = false; this.state = 'compare'; }
            if (this.state === 'compare') {
                if (result !== undefined) { if (result === 0) { [this.items[this.i], this.items[this.i + this.gap]] = [this.items[this.i + this.gap], this.items[this.i]]; this.swapped = true; } this.i++; result = undefined; }
                if (this.i + this.gap < this.n) return [this.items[this.i], this.items[this.i + this.gap]];
                if (this.gap === 1 && !this.swapped) break;
                this.state = 'nextGap';
            }
        }
        return null;
    }
}

class FullRankProvider {
    constructor(n) { this.n = n; this.pairs = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) this.pairs.push([i, j]);
        for (let i = this.pairs.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [this.pairs[i], this.pairs[j]] = [this.pairs[j], this.pairs[i]]; }
        this.idx = 0; }
    next() { return this.idx < this.pairs.length ? this.pairs[this.idx++] : null; }
}

function simulate(n, ProviderClass, trials = 3) {
    let totalComps = 0, totalTau = 0;
    for (let t = 0; t < trials; t++) {
        const trueStrengths = Array.from({ length: n }, () => Math.random() * 2000);
        const provider = new ProviderClass(n);
        const wins = new Float64Array(n);
        const adjMaps = Array.from({ length: n }, () => new Map());
        let pair = provider.next(), comps = 0;
        while (pair) {
            const [a, b] = pair; if (a === undefined || b === undefined) break;
            comps++; const res = trueStrengths[a] > trueStrengths[b] ? 1 : 0;
            wins[a] += res; wins[b] += 1 - res;
            adjMaps[a].set(b, (adjMaps[a].get(b) || 0) + 1); adjMaps[b].set(a, (adjMaps[b].get(a) || 0) + 1);
            pair = provider.next(res);
            if (comps > 100000) break;
        }
        const adj = adjMaps.map(m => { const row = new Int32Array(m.size * 2); let k = 0; for (const [j, c] of m) { row[k++] = j; row[k++] = c; } return row; });
        totalComps += comps; totalTau += kendallTau(trueStrengths, runBT(n, wins, adj));
    }
    return { avgComps: totalComps / trials, avgTau: totalTau / trials };
}

const N = 100, algos = [
    { name: 'Ford-Johnson', class: FJProvider }, { name: 'Merge Sort', class: MergeSortProvider },
    { name: 'Shellsort', class: ShellSortProvider }, { name: 'Quicksort', class: QuicksortProvider },
    { name: 'Bubble Sort', class: BubbleSortProvider }, { name: 'Selection Sort', class: SelectionSortProvider },
    { name: 'Insertion Sort', class: InsertionSortProvider }, { name: 'Binary Insertion', class: BinaryInsertionSortProvider },
    { name: 'Gnome Sort', class: GnomeSortProvider }, { name: 'Stooge Sort', class: StoogeSortProvider },
    { name: 'Bogosort', class: BogosortProvider }, { name: 'Full Rank', class: FullRankProvider },
    { name: 'Cycle Sort', class: CycleSortProvider }, { name: 'Bitonic Sort', class: BitonicSortProvider },
    { name: 'Heap Sort', class: HeapSortProvider }, { name: 'Comb Sort', class: CombSortProvider }
];
console.log(`Simulating N=${N}, trials=3\nAlgorithm\tAvg Battles\tAvg Kendall Tau`);
for (const algo of algos) { const res = simulate(N, algo.class); console.log(`${algo.name}\t${res.avgComps.toFixed(2)}\t${res.avgTau.toFixed(4)}`); }
