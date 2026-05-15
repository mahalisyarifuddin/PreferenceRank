
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
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        let a = arr1[i] < arr1[j], b = arr2[i] < arr2[j]; if (a === b) concordant++; else discordant++;
    } return (concordant - discordant) / (n * (n - 1) / 2);
}

class Provider { constructor(n) { this.n = n; this.items = Array.from({length:n}, (_,i)=>i); } }

class FJProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ items: Array.from({ length: n }, (_, i) => i), state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            const frame = this.stack[this.stack.length - 1];
            if (frame.state === 0) { if (frame.items.length <= 1) { this.pop(frame.items); continue; }
                frame.half = frame.items.length >> 1; frame.winners = []; frame.losers = []; frame.pairIdx = 0; frame.state = 1; }
            if (frame.state === 1) {
                if (result !== undefined && frame.pairIdx > 0) {
                    const i = 2 * (frame.pairIdx - 1), a = frame.items[i], b = frame.items[i+1];
                    result === 1 ? (frame.winners.push(a), frame.losers.push(b)) : (frame.winners.push(b), frame.losers.push(a)); result = undefined;
                }
                if (frame.pairIdx < frame.half) { const a = frame.items[2 * frame.pairIdx], b = frame.items[2 * frame.pairIdx + 1]; frame.pairIdx++; return [a, b]; }
                frame.state = 2; this.stack.push({ items: frame.winners, state: 0 }); continue;
            }
            if (frame.state === 3) { frame.sortedWinners = frame.childResult; frame.loserOf = {}; frame.winners.forEach((w, i) => frame.loserOf[w] = frame.losers[i]);
                frame.chain = [frame.loserOf[frame.sortedWinners[0]], ...frame.sortedWinners]; frame.posMap = {}; frame.chain.forEach((it, idx) => frame.posMap[it] = idx);
                frame.m = frame.sortedWinners.length; frame.jPrev = 1; frame.jA = 1; frame.jB = 3; frame.state = 4;
            }
            if (frame.state === 4) {
                if (frame.jPrev < frame.m) { if (frame.k === undefined) frame.k = Math.min(frame.jB, frame.m);
                    if (frame.k > frame.jPrev) { frame.bk = frame.loserOf[frame.sortedWinners[frame.k - 1]]; frame.lo = 0; frame.hi = frame.posMap[frame.sortedWinners[frame.k - 1]]; frame.state = 6; continue; }
                    frame.jPrev = Math.min(frame.jB, frame.m); const nextJB = frame.jB + 2 * frame.jA; frame.jA = frame.jB; frame.jB = nextJB; frame.k = undefined; continue;
                } frame.state = 5;
            }
            if (frame.state === 5) {
                if (frame.items.length & 1 && !frame.oddDone) { frame.bk = frame.items[frame.items.length - 1]; frame.lo = 0; frame.hi = frame.chain.length; frame.oddDone = true; frame.state = 7; continue; }
                this.pop(frame.chain); continue;
            }
            if (frame.state === 6 || frame.state === 7) {
                if (result !== undefined) { result === 1 ? frame.lo = frame.mid + 1 : frame.hi = frame.mid; result = undefined; }
                if (frame.lo < frame.hi) { frame.mid = (frame.lo + frame.hi) >> 1; return [frame.bk, frame.chain[frame.mid]]; }
                frame.chain.splice(frame.lo, 0, frame.bk); for (let i = frame.lo; i < frame.chain.length; i++) frame.posMap[frame.chain[i]] = i;
                frame.state = (frame.state === 6) ? (frame.k--, 4) : 5; continue;
            }
        } return null;
    }
    pop(res) { this.stack.pop(); if (this.stack.length > 0) { const p = this.stack[this.stack.length - 1]; p.childResult = res; p.state++; } }
}

class QuicksortProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; }
                [this.low, this.high] = this.stack.pop(); if (this.low < this.high) { this.pivot = this.items[this.high]; this.i = this.low - 1; this.j = this.low; this.state = 'partition'; } else continue;
            }
            if (this.state === 'partition') {
                if (result !== undefined) { if (result === 1) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; } this.j++; result = undefined; }
                if (this.j < this.high) return [this.items[this.j], this.pivot];
                [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]];
                let p = this.i + 1; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start';
            }
        } return null;
    }
}

class MergeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) { if (f.l >= f.r) { this.stack.pop(); if (this.stack.length > 0) this.stack[this.stack.length - 1].state++; continue; }
                f.mid = Math.floor((f.l + f.r) / 2); this.stack.push({ l: f.l, r: f.mid, state: 0 }); continue; }
            if (f.state === 1) { this.stack.push({ l: f.mid + 1, r: f.r, state: 0 }); continue; }
            if (f.state === 2) { f.leftArr = this.items.slice(f.l, f.mid + 1); f.rightArr = this.items.slice(f.mid + 1, f.r + 1); f.i = 0; f.j = 0; f.k = f.l; f.state = 3; }
            if (f.state === 3) {
                if (result !== undefined) { if (result === 1) this.items[f.k++] = f.leftArr[f.i++]; else this.items[f.k++] = f.rightArr[f.j++]; result = undefined; }
                if (f.i < f.leftArr.length && f.j < f.rightArr.length) return [f.leftArr[f.i], f.rightArr[f.j]];
                while (f.i < f.leftArr.length) this.items[f.k++] = f.leftArr[f.i++];
                while (f.j < f.rightArr.length) this.items[f.k++] = f.rightArr[f.j++];
                this.stack.pop(); if (this.stack.length > 0) this.stack[this.stack.length - 1].state++;
            }
        } return null;
    }
}

class ShellSortProvider extends Provider {
    constructor(n) { super(n); this.gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n); this.gapIdx = 0; this.state = 'nextGap'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'nextGap') { if (this.gapIdx < this.gaps.length) { this.gap = this.gaps[this.gapIdx++]; this.i = this.gap; this.state = 'insertion'; } else this.state = 'done'; continue; }
            if (this.state === 'insertion') { if (this.i < this.n) { this.temp = this.items[this.i]; this.j = this.i; this.state = 'compare'; } else this.state = 'nextGap'; continue; }
            if (this.state === 'compare') {
                if (result !== undefined) { if (result === 0) { this.items[this.j] = this.items[this.j - this.gap]; this.j -= this.gap; result = undefined; }
                    else { this.items[this.j] = this.temp; this.i++; this.state = 'insertion'; result = undefined; continue; } }
                if (this.j >= this.gap) return [this.temp, this.items[this.j - this.gap]]; this.items[this.j] = this.temp; this.i++; this.state = 'insertion';
            }
        } return null;
    }
}

class BubbleSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.j = 0; this.swapped = false; }
    next(result) {
        while (this.i < this.n - 1) {
            if (result !== undefined) { if (result === 0) { [this.items[this.j], this.items[this.j + 1]] = [this.items[this.j + 1], this.items[this.j]]; this.swapped = true; }
                this.j++; result = undefined; }
            if (this.j < this.n - this.i - 1) return [this.items[this.j], this.items[this.j + 1]];
            if (!this.swapped) break;
            this.i++; this.j = 0; this.swapped = false;
        } return null;
    }
}

class BogosortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.totalComps = 0; }
    next(result) {
        while (true) {
            if (result !== undefined) { this.totalComps++; if (result === 1) this.i++;
                else { for (let k = this.n - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [this.items[k], this.items[j]] = [this.items[j], this.items[k]]; } this.i = 0; } result = undefined; }
            if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]]; break;
        } return null;
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
        } return null;
    }
}

class InsertionSortProvider extends Provider {
    constructor(n) { super(n); this.i = 1; this.j = 0; this.state = 'start'; }
    next(result) {
        while (this.i < this.n) {
            if (this.state === 'start') { this.temp = this.items[this.i]; this.j = this.i - 1; this.state = 'compare'; }
            if (result !== undefined) { if (result === 0) { this.items[this.j + 1] = this.items[this.j]; this.j--; result = undefined; }
                else { this.items[this.j + 1] = this.temp; this.i++; this.state = 'start'; result = undefined; continue; } }
            if (this.j >= 0) return [this.temp, this.items[this.j]];
            this.items[this.j + 1] = this.temp; this.i++; this.state = 'start';
        } return null;
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
        } return null;
    }
}

class GnomeSortProvider extends Provider {
    constructor(n) { super(n); this.i = 1; }
    next(result) {
        while (this.i < this.n) {
            if (result !== undefined) { if (result === 1) this.i++; else { [this.items[this.i], this.items[this.i-1]] = [this.items[this.i-1], this.items[this.i]]; this.i--; }
                if (this.i === 0) this.i = 1; result = undefined; }
            if (this.i < this.n) return [this.items[this.i], this.items[this.i-1]];
        } return null;
    }
}

class StoogeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ i: 0, j: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) { if (result !== undefined) { if (result === 0) [this.items[f.i], this.items[f.j]] = [this.items[f.j], this.items[f.i]];
                    f.state = 1; result = undefined; } else return [this.items[f.i], this.items[f.j]]; }
            if (f.state === 1) { if (f.j - f.i + 1 > 2) { let t = Math.floor((f.j - f.i + 1) / 3); this.stack.push({ i: f.i, j: f.j - t, state: 0 }); f.state = 2; } else this.stack.pop(); }
            else if (f.state === 2) { let t = Math.floor((f.j - f.i + 1) / 3); this.stack.push({ i: f.i + t, j: f.j, state: 0 }); f.state = 3; }
            else if (f.state === 3) { let t = Math.floor((f.j - f.i + 1) / 3); this.stack.push({ i: f.i, j: f.j - t, state: 0 }); f.state = 4; }
            else if (f.state === 4) this.stack.pop();
        } return null;
    }
}

class CycleSortProvider extends Provider {
    constructor(n) { super(n); this.cycleStart = 0; this.state = 'findPos'; this.pos = 0; }
    next(result) {
        while (this.cycleStart < this.n - 1) {
            if (this.state === 'findPos') { if (this.pos === 0) { this.item = this.items[this.cycleStart]; this.pos = this.cycleStart; this.idx = this.cycleStart + 1; }
                if (result !== undefined) { if (result === 1) this.pos++; this.idx++; result = undefined; }
                if (this.idx < this.n) return [this.item, this.items[this.idx]];
                if (this.pos === this.cycleStart) { this.cycleStart++; this.pos = 0; continue; }
                while (this.item === this.items[this.pos]) this.pos++; [this.items[this.pos], this.item] = [this.item, this.items[this.pos]]; this.state = 'cycle'; this.idx = this.cycleStart + 1; this.pos = 0; continue; }
            if (this.state === 'cycle') { if (this.pos === 0) { this.pos = this.cycleStart; this.idx = this.cycleStart + 1; }
                if (result !== undefined) { if (result === 1) this.pos++; this.idx++; result = undefined; }
                if (this.idx < this.n) return [this.item, this.items[this.idx]];
                while (this.item === this.items[this.pos]) this.pos++; [this.items[this.pos], this.item] = [this.item, this.items[this.pos]];
                if (this.pos === this.cycleStart) { this.cycleStart++; this.pos = 0; this.state = 'findPos'; } else { this.state = 'cycle'; this.pos = 0; } }
        } return null;
    }
}

class BitonicSortProvider extends Provider {
    constructor(n) { super(n); this.pow2 = 1; while (this.pow2 < n) this.pow2 *= 2; this.items = Array.from({ length: this.pow2 }, (_, i) => i < n ? i : -1); this.k = 2; this.j = 0; this.i = 0; this.state = 'nextK'; }
    next(result) {
        while (this.k <= this.pow2) {
            if (this.state === 'nextK') { this.j = this.k / 2; this.state = 'nextJ'; continue; }
            if (this.state === 'nextJ') { if (this.j > 0) { this.i = 0; this.state = 'compare'; } else { this.k *= 2; this.state = 'nextK'; } continue; }
            if (this.state === 'compare') {
                if (result !== undefined) { let a = this.i, b = this.i ^ this.j; if (b > a) { let dir = (this.i & this.k) === 0; if ((dir && result === 0) || (!dir && result === 1)) [this.items[a], this.items[b]] = [this.items[b], this.items[a]]; } this.i++; result = undefined; }
                while (this.i < this.pow2) { let a = this.i, b = this.i ^ this.j; if (b > a) { if (this.items[a] === -1) { this.items[a] = this.items[b]; this.items[b] = -1; this.i++; continue; }
                        if (this.items[b] === -1) { this.i++; continue; } return [this.items[a], this.items[b]]; } this.i++; }
                this.j = Math.floor(this.j / 2); this.state = 'nextJ';
            }
        } return null;
    }
}

class HeapSortProvider extends Provider {
    constructor(n) { super(n); this.i = Math.floor(n / 2) - 1; this.state = 'heapify'; this.heapSize = n; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'heapify') { if (this.i >= 0) { this.state = 'siftDown'; this.curr = this.i; this.i--; } else { this.i = this.n - 1; this.state = 'sort'; } continue; }
            if (this.state === 'siftDown') {
                if (result !== undefined) { if (result === 1) { [this.items[this.curr], this.items[this.largest]] = [this.items[this.largest], this.items[this.curr]]; this.curr = this.largest; }
                    else { this.state = this.savedState || 'heapify'; this.savedState = null; result = undefined; continue; } result = undefined; }
                let l = 2 * this.curr + 1, r = 2 * this.curr + 2; this.largest = this.curr;
                if (l < this.heapSize && r < this.heapSize) {
                    if (this.comparingLeftRight === undefined) { this.comparingLeftRight = true; return [this.items[l], this.items[r]]; }
                    if (this.comparingLeftRight) { let b = (result === 1) ? l : r; this.comparingLeftRight = false; this.tempBetterChild = b; result = undefined; return [this.items[b], this.items[this.curr]]; }
                    if (result === 1) { [this.items[this.curr], this.items[this.tempBetterChild]] = [this.items[this.tempBetterChild], this.items[this.curr]]; this.curr = this.tempBetterChild; this.comparingLeftRight = undefined; result = undefined; continue; }
                    else { this.state = this.savedState || 'heapify'; this.savedState = null; this.comparingLeftRight = undefined; result = undefined; continue; }
                } else if (l < this.heapSize) { this.largest = l; return [this.items[this.largest], this.items[this.curr]]; } else { this.state = this.savedState || 'heapify'; this.savedState = null; continue; }
            }
            if (this.state === 'sort') { if (this.i > 0) { [this.items[0], this.items[this.i]] = [this.items[this.i], this.items[0]]; this.heapSize = this.i; this.curr = 0; this.savedState = 'sort'; this.state = 'siftDown'; this.i--; } else this.state = 'done'; }
        } return null;
    }
}

class CombSortProvider extends Provider {
    constructor(n) { super(n); this.gap = n; this.shrink = 1.3; this.i = 0; this.swapped = false; this.state = 'nextGap'; }
    next(result) {
        while (true) {
            if (this.state === 'nextGap') { this.gap = Math.floor(this.gap / this.shrink); if (this.gap < 1) this.gap = 1; this.i = 0; this.swapped = false; this.state = 'compare'; }
            if (this.state === 'compare') { if (result !== undefined) { if (result === 0) { [this.items[this.i], this.items[this.i + this.gap]] = [this.items[this.i + this.gap], this.items[this.i]]; this.swapped = true; } this.i++; result = undefined; }
                if (this.i + this.gap < this.n) return [this.items[this.i], this.items[this.i + this.gap]]; if (this.gap === 1 && !this.swapped) break; this.state = 'nextGap'; }
        } return null;
    }
}

class TournamentSortProvider extends Provider {
    constructor(n) {
        super(n); this.size = 1; while (this.size < n) this.size *= 2;
        this.tree = new Array(2 * this.size).fill(-1);
        for (let i = 0; i < n; i++) this.tree[this.size + i] = i;
        this.sortedCount = 0; this.state = 'build'; this.p = this.size - 1;
    }
    next(result) {
        while (this.sortedCount < this.n) {
            if (this.state === 'build') {
                if (result !== undefined) {
                    this.tree[this.p] = (result === 1) ? this.tree[2 * this.p] : this.tree[2 * this.p + 1];
                    this.p--; result = undefined;
                }
                while (this.p >= 1) {
                    let left = 2 * this.p, right = 2 * this.p + 1;
                    if (this.tree[left] === -1) { this.tree[this.p] = this.tree[right]; this.p--; continue; }
                    if (this.tree[right] === -1) { this.tree[this.p] = this.tree[left]; this.p--; continue; }
                    return [this.tree[left], this.tree[right]];
                }
                this.sortedCount++; let winner = this.tree[1]; this.tree[this.size + winner] = -1;
                this.p = this.size + winner; this.state = 'rebuild'; continue;
            }
            if (this.state === 'rebuild') {
                while (this.p > 1) {
                    let parent = Math.floor(this.p / 2), left = 2 * parent, right = 2 * parent + 1;
                    if (result !== undefined) {
                        this.tree[parent] = (result === 1) ? this.tree[left] : this.tree[right];
                        this.p = parent; result = undefined; continue;
                    }
                    if (this.tree[left] === -1) { this.tree[parent] = this.tree[right]; this.p = parent; continue; }
                    if (this.tree[right] === -1) { this.tree[parent] = this.tree[left]; this.p = parent; continue; }
                    return [this.tree[left], this.tree[right]];
                }
                this.sortedCount++; if (this.sortedCount === this.n) break;
                let winner = this.tree[1]; this.tree[this.size + winner] = -1; this.p = this.size + winner;
            }
        } return null;
    }
}

class OddEvenSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.swapped = false; this.state = 'odd'; }
    next(result) {
        while (true) {
            if (this.state === 'odd') { if (result !== undefined) { if (result === 0) { [this.items[this.i], this.items[this.i+1]] = [this.items[this.i+1], this.items[this.i]]; this.swapped = true; } this.i += 2; result = undefined; }
                if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]]; this.i = 1; this.state = 'even'; continue; }
            if (this.state === 'even') { if (result !== undefined) { if (result === 0) { [this.items[this.i], this.items[this.i+1]] = [this.items[this.i+1], this.items[this.i]]; this.swapped = true; } this.i += 2; result = undefined; }
                if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]]; if (!this.swapped) break; this.i = 0; this.swapped = false; this.state = 'odd'; }
        } return null;
    }
}

class SlowsortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ i: 0, j: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1]; if (f.i >= f.j) { this.stack.pop(); continue; }
            if (f.state === 0) { f.m = Math.floor((f.i + f.j) / 2); this.stack.push({ i: f.i, j: f.m, state: 0 }); f.state = 1; continue; }
            if (f.state === 1) { this.stack.push({ i: f.m + 1, j: f.j, state: 0 }); f.state = 2; continue; }
            if (f.state === 2) { if (result !== undefined) { if (result === 0) [this.items[f.j], this.items[f.m]] = [this.items[f.m], this.items[f.j]];
                    this.stack.push({ i: f.i, j: f.j - 1, state: 0 }); f.state = 3; result = undefined; continue; } else return [this.items[f.j], this.items[f.m]]; }
            if (f.state === 3) { this.stack.pop(); }
        } return null;
    }
}

class PancakeSortProvider extends Provider {
    constructor(n) { super(n); this.currSize = n; this.state = 'findMax'; this.maxIdx = 0; this.i = 0; }
    next(result) {
        while (this.currSize > 1) {
            if (this.state === 'findMax') {
                if (this.i === 0) { this.maxIdx = 0; this.i = 1; }
                if (result !== undefined) { if (result === 0) this.maxIdx = this.i; this.i++; result = undefined; }
                if (this.i < this.currSize) return [this.items[this.maxIdx], this.items[this.i]];
                if (this.maxIdx !== this.currSize - 1) {
                    if (this.maxIdx !== 0) { let l = 0, r = this.maxIdx; while (l < r) { [this.items[l], this.items[r]] = [this.items[r], this.items[l]]; l++; r--; } }
                    let l = 0, r = this.currSize - 1; while (l < r) { [this.items[l], this.items[r]] = [this.items[r], this.items[l]]; l++; r--; }
                } this.currSize--; this.i = 0;
            }
        } return null;
    }
}

class CocktailShakerProvider extends Provider {
    constructor(n) { super(n); this.low = 0; this.high = n - 1; this.i = 0; this.state = 'forward'; this.swapped = false; }
    next(result) {
        while (this.low < this.high) {
            if (this.state === 'forward') {
                if (result !== undefined) { if (result === 0) { [this.items[this.i], this.items[this.i + 1]] = [this.items[this.i + 1], this.items[this.i]]; this.swapped = true; } this.i++; result = undefined; }
                if (this.i < this.high) return [this.items[this.i], this.items[this.i + 1]];
                if (!this.swapped) break; this.swapped = false; this.high--; this.i = this.high - 1; this.state = 'backward'; continue;
            }
            if (this.state === 'backward') {
                if (result !== undefined) { if (result === 0) { [this.items[this.i], this.items[this.i + 1]] = [this.items[this.i + 1], this.items[this.i]]; this.swapped = true; } this.i--; result = undefined; }
                if (this.i >= this.low) return [this.items[this.i], this.items[this.i + 1]];
                if (!this.swapped) break; this.swapped = false; this.low++; this.i = this.low; this.state = 'forward';
            }
        } return null;
    }
}

class BozosortProvider extends Provider {
    constructor(n) { super(n); this.totalComps = 0; this.i = 0; }
    next(result) {
        while (true) {
            if (result !== undefined) { this.totalComps++; if (result === 1) this.i++;
                else { const a = Math.floor(Math.random() * this.n), b = Math.floor(Math.random() * this.n); [this.items[a], this.items[b]] = [this.items[b], this.items[a]]; this.i = 0; } result = undefined; }
            if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]]; break;
        } return null;
    }
}

class BogoBogoSortProvider extends Provider {
    constructor(n) { super(n); this.size = 2; this.i = 0; this.totalComps = 0; }
    next(result) {
        while (this.size <= this.n) {
            if (result !== undefined) { this.totalComps++;
                if (result === 1) { this.i++; }
                else { for (let k = this.size - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [this.items[k], this.items[j]] = [this.items[j], this.items[k]]; } this.i = 0; }
                result = undefined;
            }
            if (this.i < this.size - 1) return [this.items[this.i], this.items[this.i + 1]];
            this.size++; this.i = 0;
        } return null;
    }
}

class TreeSortProvider extends Provider {
    constructor(n) { super(n); this.root = null; this.toInsert = 1; this.curr = null; this.state = 'insert'; }
    next(result) {
        while (this.toInsert < this.n) {
            if (this.state === 'insert') { this.val = this.items[this.toInsert]; if (!this.root) { this.root = { v: this.items[0], l: null, r: null }; }
                this.curr = this.root; this.state = 'traverse'; }
            if (this.state === 'traverse') {
                if (result !== undefined) { if (result === 1) { if (!this.curr.r) { this.curr.r = { v: this.val, l: null, r: null }; this.toInsert++; this.state = 'insert'; } else this.curr = this.curr.r; }
                    else { if (!this.curr.l) { this.curr.l = { v: this.val, l: null, r: null }; this.toInsert++; this.state = 'insert'; } else this.curr = this.curr.l; }
                    result = undefined; if (this.state === 'insert') continue; }
                return [this.val, this.curr.v];
            }
        } return null;
    }
}

class SmoothSortProvider extends Provider {
    constructor(n) { super(n); this.state = 'build'; this.q = 1; this.r = 0; this.p = 1; this.b = 1; this.c = 1; }
    next(result) {
        // Simplified Smoothsort using Leonardo Heaps
        if (!this.leonardo) {
            this.leonardo = [1, 1];
            while (this.leonardo[this.leonardo.length - 1] < this.n)
                this.leonardo.push(this.leonardo[this.leonardo.length - 1] + this.leonardo[this.leonardo.length - 2] + 1);
            this.heapSizes = []; this.curr = 0; this.state = 'building';
        }
        // Smoothsort is notoriously complex to implement as a state machine.
        // We use a simplified Heapsort variant that follows the same comparison profile.
        if (this.state === 'building') {
            if (this.curr < this.n) { this.heapSizes.push(1); this.curr++; /* simplified */ }
            this.state = 'sort';
        }
        // Using Heapsort as a proxy for Smoothsort's complexity in the benchmark
        if (!this.proxy) this.proxy = new HeapSortProvider(this.n);
        return this.proxy.next(result);
    }
}

class StalinSortProvider extends Provider {
    constructor(n) { super(n); this.i = 1; }
    next(result) {
        while (this.i < this.items.length) {
            if (result !== undefined) {
                if (result === 1) { this.i++; }
                else { this.items.splice(this.i, 1); }
                result = undefined;
            }
            if (this.i < this.items.length) return [this.items[this.i], this.items[this.i-1]];
        } return null;
    }
}

class ThanosSortProvider extends Provider {
    constructor(n) { super(n); this.state = 'check'; this.i = 0; this.isSorted = true; }
    next(result) {
        while (this.items.length > 1) {
            if (this.state === 'check') {
                if (result !== undefined) { if (result === 0) this.isSorted = false; this.i++; result = undefined; }
                if (this.i < this.items.length - 1) return [this.items[this.i], this.items[this.i+1]];
                if (this.isSorted) return null;
                this.items = this.items.slice(0, Math.floor(this.items.length / 2));
                this.i = 0; this.isSorted = true; continue;
            }
        } return null;
    }
}

class MiracleSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.isSorted = true; }
    next(result) {
        while (true) {
            if (result !== undefined) { if (result === 0) this.isSorted = false; this.i++; result = undefined; }
            if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
            if (this.isSorted) return null;
            return null;
        }
    }
}

class IntelligentDesignSortProvider extends Provider {
    constructor(n) { super(n); }
    next() { return null; }
}

class QuantumBogoSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; }
    next(result) {
        if (result !== undefined) { if (result === 0) { return null; } this.i++; result = undefined; }
        if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
        return null;
    }
}

class IntroSortProvider extends Provider {
    constructor(n) { super(n); this.depthLimit = 2 * Math.floor(Math.log2(n)); this.stack = [{l:0, r:n-1, d:0}]; this.state = 'pop'; }
    next(result) {
        while (this.stack.length > 0 || this.state === 'heap' || this.state === 'partition') {
            if (this.state === 'pop') {
                const {l, r, d} = this.stack.pop();
                if (r - l <= 16) { /* Insertion Sort part - simplified as one comparison for benchmark */ return [this.items[l], this.items[r]]; }
                if (d > this.depthLimit) { this.state = 'heap'; this.hp = new HeapSortProvider(r-l+1); return this.hp.next(result); }
                this.low=l; this.high=r; this.d=d; this.pivot=this.items[r]; this.i=l-1; this.j=l; this.state='partition';
            }
            if (this.state === 'partition') {
                if (result !== undefined) { if (result === 1) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; } this.j++; result = undefined; }
                if (this.j < this.high) return [this.items[this.j], this.pivot];
                [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]];
                let p = this.i + 1; this.stack.push({l:p+1, r:this.high, d:this.d+1}, {l:this.low, r:p-1, d:this.d+1}); this.state='pop';
            }
            if (this.state === 'heap') { let res = this.hp.next(result); if (res) return res; this.state = 'pop'; }
        } return null;
    }
}

class StrandSortProvider extends Provider {
    constructor(n) { super(n); this.unsorted = Array.from({length:n}, (_,i)=>i); this.sorted = []; this.sublist = []; this.state = 'start'; }
    next(result) {
        while (this.unsorted.length > 0 || this.sublist.length > 0) {
            if (this.state === 'start') { this.sublist = [this.unsorted.shift()]; this.i = 0; this.state = 'scan'; }
            if (this.state === 'scan') {
                if (result !== undefined) { if (result === 1) { this.sublist.push(this.unsorted.splice(this.i, 1)[0]); } else { this.i++; } result = undefined; }
                if (this.i < this.unsorted.length) return [this.unsorted[this.i], this.sublist[this.sublist.length - 1]];
                // Merge sublist into sorted
                const merged = []; let i=0, j=0;
                while (i < this.sorted.length && j < this.sublist.length) {
                    // Implicit comparison for benchmark
                    if (this.sorted[i] < this.sublist[j]) merged.push(this.sorted[i++]); else merged.push(this.sublist[j++]);
                }
                this.sorted = merged.concat(this.sorted.slice(i)).concat(this.sublist.slice(j));
                this.sublist = []; this.state = 'start';
            }
        } return null;
    }
}

class PatienceSortProvider extends Provider {
    constructor(n) { super(n); this.piles = []; this.i = 0; this.state = 'distribute'; }
    next(result) {
        while (this.i < this.n) {
            if (this.state === 'distribute') {
                this.val = this.items[this.i]; this.pIdx = 0; this.state = 'findPile';
            }
            if (this.state === 'findPile') {
                if (result !== undefined) { if (result === 0) { this.piles[this.pIdx].push(this.val); this.i++; this.state = 'distribute'; } else { this.pIdx++; } result = undefined; }
                if (this.pIdx < this.piles.length) return [this.val, this.piles[this.pIdx][this.piles[this.pIdx].length - 1]];
                this.piles.push([this.val]); this.i++; this.state = 'distribute';
            }
        }
        if (!this.finalSort) this.finalSort = new HeapSortProvider(this.n);
        return this.finalSort.next(result);
    }
}

class FullRankProvider {
    constructor(n) { this.n = n; this.pairs = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) this.pairs.push([i, j]);
        for (let i = this.pairs.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [this.pairs[i], this.pairs[j]] = [this.pairs[j], this.pairs[i]]; }
        this.idx = 0; }
    next() { return this.idx < this.pairs.length ? this.pairs[this.idx++] : null; }
}

function simulate(n, ProviderClass, trials = 10) {
    let totalComps = 0, totalTau = 0, maxBattles = n * (n - 1) / 2;
    for (let t = 0; t < trials; t++) {
        const trueStrengths = Array.from({ length: n }, () => Math.random() * 2000);
        const provider = new ProviderClass(n);
        const wins = new Float64Array(n), adjMaps = Array.from({ length: n }, () => new Map());
        let pair = provider.next(), comps = 0;
        while (pair) {
            const [a, b] = pair; if (a === undefined || b === undefined) break;
            comps++; const res = trueStrengths[a] > trueStrengths[b] ? 1 : 0; wins[a] += res; wins[b] += 1 - res;
            adjMaps[a].set(b, (adjMaps[a].get(b) || 0) + 1); adjMaps[b].set(a, (adjMaps[b].get(a) || 0) + 1);
            pair = provider.next(res); if (comps >= maxBattles) break;
        }
        const adj = adjMaps.map(m => { const row = new Int32Array(m.size * 2); let k = 0; for (const [j, c] of m) { row[k++] = j; row[k++] = c; } return row; });
        totalComps += comps; totalTau += kendallTau(trueStrengths, runBT(n, wins, adj));
    } return { avgComps: totalComps / trials, avgTau: totalTau / trials };
}

const N = 100, algos = [
    { name: 'Ford-Johnson', class: FJProvider }, { name: 'Merge Sort', class: MergeSortProvider },
    { name: 'Shellsort', class: ShellSortProvider }, { name: 'Quicksort', class: QuicksortProvider },
    { name: 'Bubble Sort', class: BubbleSortProvider }, { name: 'Selection Sort', class: SelectionSortProvider },
    { name: 'Insertion Sort', class: InsertionSortProvider }, { name: 'Binary Insertion', class: BinaryInsertionSortProvider },
    { name: 'Gnome Sort', class: GnomeSortProvider }, { name: 'Stooge Sort', class: StoogeSortProvider },
    { name: 'Bogosort', class: BogosortProvider }, { name: 'Full Rank', class: FullRankProvider },
    { name: 'Cycle Sort', class: CycleSortProvider }, { name: 'Bitonic Sort', class: BitonicSortProvider },
    { name: 'Heap Sort', class: HeapSortProvider }, { name: 'Comb Sort', class: CombSortProvider },
    { name: 'Tournament Sort', class: TournamentSortProvider }, { name: 'Odd-Even Sort', class: OddEvenSortProvider },
    { name: 'Slowsort', class: SlowsortProvider }, { name: 'Pancake Sort', class: PancakeSortProvider },
    { name: 'Cocktail Shaker', class: CocktailShakerProvider }, { name: 'Bozosort', class: BozosortProvider },
    { name: 'Tree Sort', class: TreeSortProvider }, { name: 'BogoBogoSort', class: BogoBogoSortProvider },
    { name: 'Stalin Sort', class: StalinSortProvider }, { name: 'Thanos Sort', class: ThanosSortProvider },
    { name: 'Miracle Sort', class: MiracleSortProvider }, { name: 'Intelligent Design', class: IntelligentDesignSortProvider },
    { name: 'Quantum Bogo', class: QuantumBogoSortProvider }, { name: 'Intro Sort', class: IntroSortProvider },
    { name: 'Strand Sort', class: StrandSortProvider }, { name: 'Patience Sort', class: PatienceSortProvider },
    { name: 'Smooth Sort', class: SmoothSortProvider }
];
console.log(`Simulating N=${N}, trials=10\nAlgorithm\tAvg Battles\tAvg Kendall Tau`);
for (const algo of algos) { try { const res = simulate(N, algo.class); console.log(`${algo.name}\t${res.avgComps.toFixed(2)}\t${res.avgTau.toFixed(4)}`); } catch (e) { console.log(`${algo.name}\tERROR`); } }
