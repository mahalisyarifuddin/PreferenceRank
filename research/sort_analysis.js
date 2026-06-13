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

function simulate(n, ProviderClass, trials = 250) {
    let totalComps = 0, totalTau = 0, maxUniqueBattles = n * (n - 1) / 2, hasDuplicates = false;
    const trueStrengths = new Float64Array(n);
    const wins = new Float64Array(n);
    const adjMaps = Array.from({ length: n }, () => new Map());
    for (let t = 0; t < trials; t++) {
        for (let i = 0; i < n; i++) trueStrengths[i] = Math.random() * 2000;
        const provider = new ProviderClass(n);
        wins.fill(0); for (let i = 0; i < n; i++) adjMaps[i].clear();
        const matchesMap = new Map();
        let pair = provider.next(), uniqueBattles = 0, totalIterations = 0;
        while (pair && totalIterations < 1000000) {
            totalIterations++;
            const [a, b] = pair;
            const pairKey = a < b ? (a << 16) | b : (b << 16) | a;
            const matchResult = matchesMap.get(pairKey);
            let res;
            if (matchResult !== undefined) {
                hasDuplicates = true;
                res = matchResult.a === a ? matchResult.res : 1 - matchResult.res;
            } else {
                uniqueBattles++;
                res = trueStrengths[a] > trueStrengths[b] ? 1 : 0;
                matchesMap.set(pairKey, { a, res });
                wins[a] += res; wins[b] += 1 - res;
                adjMaps[a].set(b, (adjMaps[a].get(b) || 0) + 1);
                adjMaps[b].set(a, (adjMaps[b].get(a) || 0) + 1);
            }
            pair = provider.next(res); if (uniqueBattles >= maxUniqueBattles) break;
        }
        const adj = adjMaps.map(m => { const row = new Int32Array(m.size * 2); let k = 0; for (const [j, c] of m) { row[k++] = j; row[k++] = c; } return row; });
        totalComps += uniqueBattles; totalTau += kendallTau(trueStrengths, runBT(n, wins, adj));
    }
    return { avgComps: totalComps / trials, avgTau: totalTau / trials, hasDuplicates };
}

class FullRankProvider {
    constructor(n) { this.n = n; this.pairs = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) this.pairs.push([i, j]);
        for (let i = this.pairs.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [this.pairs[i], this.pairs[j]] = [this.pairs[j], this.pairs[i]]; }
        this.idx = 0; }
    next() { return this.idx < this.pairs.length ? this.pairs[this.idx++] : null; }
}

class Provider {
    constructor(n) { this.n = n; this.items = Array.from({ length: n }, (_, i) => i); this.stack = []; }
    pop() { this.stack.pop(); if (this.stack.length > 0) { let f = this.stack[this.stack.length - 1]; if (typeof f.state === 'number') f.state++; } }
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

class BlockQuicksortProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n-1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.l, this.r] = this.stack.pop(); if (this.r - this.l <= 16) { this.iL=this.l; this.iR=this.r; this.iI=this.l+1; this.state='insStart'; continue; } this.pivotVal = this.items[this.l]; this.state = 'partition'; this.p_i = this.l + 1; this.p_j = this.r; }
            if (this.state === 'insStart') { if (this.iI <= this.iR) { this.iTemp = this.items[this.iI]; this.iJ = this.iI - 1; this.state = 'insCompare'; continue; } this.state = 'start'; continue; }
            if (this.state === 'insCompare') { if (this.iJ >= this.iL) { if (result !== undefined) { if (result === 0) { this.items[this.iJ + 1] = this.items[this.iJ]; this.iJ--; result = undefined; } else { this.items[this.iJ + 1] = this.iTemp; this.iI++; this.state = 'insStart'; result = undefined; continue; } } else return [this.iTemp, this.items[this.iJ]]; continue; } this.items[this.iJ + 1] = this.iTemp; this.iI++; this.state = 'insStart'; continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { this.p_i++; result = undefined; } else { [this.items[this.p_i], this.items[this.p_j]] = [this.items[this.p_j], this.items[this.p_i]]; this.p_j--; result = undefined; } } if (this.p_i <= this.p_j) return [this.items[this.p_i], this.pivotVal]; [this.items[this.l], this.items[this.p_i - 1]] = [this.items[this.p_i - 1], this.items[this.l]]; let p = this.p_i - 1; this.stack.push([p + 1, this.r], [this.l, p - 1]); this.state = 'start'; }
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

class BottomUpMergeSortProvider extends Provider {
    constructor(n) { super(n); this.width = 1; this.i = 0; this.state = 'merge'; }
    next(result) {
        while (this.width < this.n) {
            if (this.state === 'merge') {
                if (this.i < this.n) {
                    this.l = this.i; this.mid = Math.min(this.i + this.width, this.n); this.r = Math.min(this.i + 2 * this.width, this.n);
                    this.L = this.items.slice(this.l, this.mid); this.R = this.items.slice(this.mid, this.r);
                    this.ii = 0; this.jj = 0; this.k = this.l; this.state = 'work';
                } else { this.width *= 2; this.i = 0; continue; }
            }
            if (this.state === 'work') {
                if (result !== undefined) { if (result === 0) this.items[this.k++] = this.L[this.ii++]; else this.items[this.k++] = this.R[this.jj++]; result = undefined; }
                if (this.ii < this.L.length && this.jj < this.R.length) return [this.L[this.ii], this.R[this.jj]];
                while (this.ii < this.L.length) this.items[this.k++] = this.L[this.ii++];
                while (this.jj < this.R.length) this.items[this.k++] = this.R[this.jj++];
                this.i += 2 * this.width; this.state = 'merge';
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

class BucketSortProvider extends Provider {
    constructor(n) { super(n); this.numBuckets = Math.max(2, Math.floor(Math.sqrt(n))); this.state = 'init'; }
    next(result) {
        while (true) {
            if (this.state === 'init') { this.pivots = []; for (let i = 0; i < this.numBuckets - 1; i++) this.pivots.push(this.items[i]); this.others = this.items.slice(this.numBuckets - 1); this.pivotSorter = new MergeSortProvider(this.pivots.length); this.pivotSorter.items = this.pivots; this.state = 'sort_pivots'; }
            if (this.state === 'sort_pivots') { const res = this.pivotSorter.next(result); if (res) return res; this.pivots = this.pivotSorter.items; this.buckets = Array.from({ length: this.numBuckets }, () => []); this.itemIdx = 0; this.state = 'distribute'; result = undefined; }
            if (this.state === 'distribute') { if (this.itemIdx < this.others.length) { this.currentItem = this.others[this.itemIdx]; this.lo = 0; this.hi = this.pivots.length; this.state = 'binary_search'; } else { this.bucketIdx = 0; this.state = 'sort_buckets'; } continue; }
            if (this.state === 'binary_search') {
                if (result !== undefined) { if (result === 1) this.lo = this.mid + 1; else this.hi = this.mid; result = undefined; }
                if (this.lo < this.hi) { this.mid = (this.lo + this.hi) >> 1; return [this.currentItem, this.pivots[this.mid]]; }
                this.buckets[this.lo].push(this.currentItem); this.itemIdx++; this.state = 'distribute'; continue;
            }
            if (this.state === 'sort_buckets') {
                if (this.bucketIdx < this.buckets.length) {
                    if (this.buckets[this.bucketIdx].length > 1) { this.bucketSorter = new InsertionSortProvider(this.buckets[this.bucketIdx].length); this.bucketSorter.items = this.buckets[this.bucketIdx]; this.state = 'sorting_bucket'; }
                    else { this.bucketIdx++; }
                } else { this.items = []; for (let i = 0; i < this.numBuckets; i++) { if (i > 0) this.items.push(this.pivots[i - 1]); for (let x of this.buckets[i]) this.items.push(x); } return null; }
                continue;
            }
            if (this.state === 'sorting_bucket') { const res = this.bucketSorter.next(result); if (res) return res; this.buckets[this.bucketIdx] = this.bucketSorter.items; this.bucketIdx++; this.state = 'sort_buckets'; result = undefined; continue; }
        }
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

class CircleSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{l:0, h:n-1}]; this.anySwapped = true; this.p1 = 0; this.p2 = 0; this.state = 'init'; }
    next(result) {
        while (true) {
            if (this.state === 'init') {
                if (this.stack.length === 0) { if (!this.anySwapped) return null; this.stack.push({l:0, h:this.n-1}); this.anySwapped = false; }
                let f = this.stack.pop(); let l = f.l, h = f.h; if (l >= h) continue;
                this.l = l; this.h = h; this.p1 = l; this.p2 = h; this.state = 'circle';
            }
            if (this.state === 'circle') {
                if (result !== undefined) { if (result === 0) { [this.items[this.p1], this.items[this.p2]] = [this.items[this.p2], this.items[this.p1]]; this.swapped = true; this.anySwapped = true; } this.p1++; this.p2--; result = undefined; }
                if (this.p1 < this.p2) return [this.items[this.p1], this.items[this.p2]];
                if (this.p1 === this.p2) { /* compare p1 with p1+1? Circle sort usually does mid. */ }
                let mid = Math.floor((this.l + this.h) / 2);
                this.stack.push({l: mid + 1, h: this.h}, {l: this.l, h: mid}); this.state = 'init';
            }
        }
    }
}

class CocktailSelectionSortProvider extends Provider {
    constructor(n) { super(n); this.l = 0; this.r = n - 1; this.state = 'min'; this.i = 0; this.bestIdx = 0; }
    next(result) {
        while (this.l < this.r) {
            if (this.state === 'min') {
                if (this.i === 0) { this.bestIdx = this.l; this.i = this.l + 1; }
                if (result !== undefined) { if (result === 0) this.bestIdx = this.i; this.i++; result = undefined; }
                if (this.i <= this.r) return [this.items[this.bestIdx], this.items[this.i]];
                [this.items[this.l], this.items[this.bestIdx]] = [this.items[this.bestIdx], this.items[this.l]];
                this.l++; this.state = 'max'; this.i = 0; continue;
            }
            if (this.state === 'max') {
                if (this.i === 0) { this.bestIdx = this.r; this.i = this.r - 1; }
                if (result !== undefined) { if (result === 1) this.bestIdx = this.i; this.i--; result = undefined; }
                if (this.i >= this.l) return [this.items[this.bestIdx], this.items[this.i]];
                [this.items[this.r], this.items[this.bestIdx]] = [this.items[this.bestIdx], this.items[this.r]];
                this.r--; this.state = 'min'; this.i = 0;
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

class DoubleSelectionSortProvider extends Provider {
    constructor(n) { super(n); this.l = 0; this.r = n - 1; this.i = 0; this.minIdx = 0; this.maxIdx = 0; this.state = 'find'; }
    next(result) {
        while (this.l < this.r) {
            if (this.state === 'find') { this.minIdx = this.l; this.maxIdx = this.l; this.i = this.l + 1; this.state = 'compare'; }
            if (this.state === 'compare') {
                if (result !== undefined) {
                    if (this.compType === 'min') { if (result === 0) this.minIdx = this.i; this.compType = 'max'; }
                    else { if (result === 1) this.maxIdx = this.i; this.i++; this.compType = 'min'; }
                    result = undefined;
                }
                if (this.i <= this.r) {
                    if (!this.compType || this.compType === 'min') { this.compType = 'min'; return [this.items[this.minIdx], this.items[this.i]]; }
                    else return [this.items[this.maxIdx], this.items[this.i]];
                }
                [this.items[this.l], this.items[this.minIdx]] = [this.items[this.minIdx], this.items[this.l]];
                if (this.maxIdx === this.l) this.maxIdx = this.minIdx;
                [this.items[this.r], this.items[this.maxIdx]] = [this.items[this.maxIdx], this.items[this.r]];
                this.l++; this.r--; this.state = 'find';
            }
        } return null;
    }
}

class DualPivotQuicksortProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') {
                if (this.stack.length === 0) { this.state = 'done'; return null; }
                [this.l, this.r] = this.stack.pop();
                if (this.r - this.l < 1) continue;
                this.state = 'pivots';
            }
            if (this.state === 'pivots') {
                if (result !== undefined) {
                    if (result === 1) [this.items[this.l], this.items[this.r]] = [this.items[this.r], this.items[this.l]];
                    this.p1 = this.items[this.l]; this.p2 = this.items[this.r];
                    this.lt = this.l + 1; this.gt = this.r - 1; this.k = this.l + 1;
                    this.state = 'partition'; this.sub = undefined; result = undefined;
                } else return [this.items[this.l], this.items[this.r]];
            }
            if (this.state === 'partition') {
                if (this.k <= this.gt) {
                    if (this.sub === undefined) {
                        if (result !== undefined) {
                            if (result === 0) { [this.items[this.k], this.items[this.lt]] = [this.items[this.lt], this.items[this.k]]; this.lt++; this.k++; result = undefined; }
                            else { this.sub = 'p2'; result = undefined; }
                        } else return [this.items[this.k], this.p1];
                    }
                    if (this.sub === 'p2') {
                        if (result !== undefined) {
                            if (result === 1) { [this.items[this.k], this.items[this.gt]] = [this.items[this.gt], this.items[this.k]]; this.gt--; this.sub = undefined; }
                            else { this.k++; this.sub = undefined; }
                            result = undefined; continue;
                        } else return [this.items[this.k], this.p2];
                    }
                    continue;
                }
                this.lt--; this.gt++;
                [this.items[this.l], this.items[this.lt]] = [this.items[this.lt], this.items[this.l]];
                [this.items[this.r], this.items[this.gt]] = [this.items[this.gt], this.items[this.r]];
                this.stack.push([this.gt + 1, this.r], [this.lt + 1, this.gt - 1], [this.l, this.lt - 1]);
                this.state = 'start'; this.sub = undefined;
            }
        } return null;
    }
}

class ExitSortProvider extends Provider {
    constructor(n) { super(n); }
    next() { return null; }
}

class PDQSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.badAllowed = Math.floor(Math.log2(n));
        this.stack = [{ l: 0, r: n - 1, badAllowed: this.badAllowed, leftmost: true }];
        this.state = 'pop';
    }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'pop') {
            if (this.state === 'pop') {
                if (this.stack.length === 0) return null;
                const frame = this.stack.pop();
                this.l = frame.l; this.r = frame.r; this.badAllowed = frame.badAllowed; this.leftmost = frame.leftmost;
                const size = this.r - this.l + 1;
                if (size < 24) { this.state = 'insertionSort'; this.insI = this.l + 1; continue; }
                this.s2 = Math.floor(size / 2);
                if (size > 128) { this.state = 'ninther'; this.nintherStep = 0; continue; }
                this.state = 'sort3'; this.sort3A = this.l + this.s2; this.sort3B = this.l; this.sort3C = this.r; this.sort3Next = 'checkEqual'; this.sort3Step = 0; continue;
            }
            if (this.state === 'insertionSort') {
                if (this.insI <= this.r) { this.insTemp = this.items[this.insI]; this.insJ = this.insI - 1; this.state = 'insertionSortCompare'; continue; }
                this.state = 'pop'; continue;
            }
            if (this.state === 'insertionSortCompare') {
                if (this.insJ >= this.l) {
                    if (result !== undefined) {
                        if (result === 0) { this.items[this.insJ + 1] = this.items[this.insJ]; this.insJ--; result = undefined; }
                        else { this.items[this.insJ + 1] = this.insTemp; this.insI++; this.state = 'insertionSort'; result = undefined; continue; }
                    } else return [this.insTemp, this.items[this.insJ]];
                    continue;
                }
                this.items[this.insJ + 1] = this.insTemp; this.insI++; this.state = 'insertionSort'; continue;
            }
            if (this.state === 'sort3') {
                if (this.sort3Step === 0) {
                    if (result !== undefined) { if (result === 0) [this.items[this.sort3A], this.items[this.sort3B]] = [this.items[this.sort3B], this.items[this.sort3A]]; this.sort3Step = 1; result = undefined; }
                    else return [this.items[this.sort3B], this.items[this.sort3A]];
                }
                if (this.sort3Step === 1) {
                    if (result !== undefined) { if (result === 0) [this.items[this.sort3B], this.items[this.sort3C]] = [this.items[this.sort3C], this.items[this.sort3B]]; this.sort3Step = 2; result = undefined; }
                    else return [this.items[this.sort3C], this.items[this.sort3B]];
                }
                if (this.sort3Step === 2) {
                    if (result !== undefined) { if (result === 0) [this.items[this.sort3A], this.items[this.sort3B]] = [this.items[this.sort3B], this.items[this.sort3A]]; this.sort3Step = 0; this.state = this.sort3Next; result = undefined; continue; }
                    else return [this.items[this.sort3B], this.items[this.sort3A]];
                }
            }
            if (this.state === 'ninther') {
                if (this.nintherStep === 0) { this.sort3A = this.l; this.sort3B = this.l + this.s2; this.sort3C = this.r; this.sort3Next = 'ninther'; this.sort3Step = 0; this.nintherStep = 1; this.state = 'sort3'; continue; }
                if (this.nintherStep === 1) { this.sort3A = this.l + 1; this.sort3B = this.l + (this.s2 - 1); this.sort3C = this.r - 2; this.sort3Next = 'ninther'; this.sort3Step = 0; this.nintherStep = 2; this.state = 'sort3'; continue; }
                if (this.nintherStep === 2) { this.sort3A = this.l + 2; this.sort3B = this.l + (this.s2 + 1); this.sort3C = this.r - 1; this.sort3Next = 'ninther'; this.sort3Step = 0; this.nintherStep = 3; this.state = 'sort3'; continue; }
                if (this.nintherStep === 3) { this.sort3A = this.l + (this.s2 - 1); this.sort3B = this.l + this.s2; this.sort3C = this.l + (this.s2 + 1); this.sort3Next = 'ninther'; this.sort3Step = 0; this.nintherStep = 4; this.state = 'sort3'; continue; }
                if (this.nintherStep === 4) { [this.items[this.l], this.items[this.l + this.s2]] = [this.items[this.l + this.s2], this.items[this.l]]; this.state = 'checkEqual'; continue; }
            }
            if (this.state === 'checkEqual') {
                if (!this.leftmost) {
                    if (result !== undefined) {
                        if (result === 1) { this.state = 'partitionLeft'; this.pL_f = this.l; this.pL_l = this.r + 1; this.pL_sub = 'findLast'; result = undefined; }
                        else { this.state = 'partitionSetup'; result = undefined; }
                        continue;
                    } else return [this.items[this.l - 1], this.items[this.l]];
                }
                this.state = 'partitionSetup'; continue;
            }
            if (this.state === 'partitionLeft') {
                if (this.pL_sub === 'findLast') {
                    if (result !== undefined) { if (result === 0) { this.pL_l--; result = undefined; } else { this.pL_sub = 'findFirst'; result = undefined; } }
                    if (this.pL_sub === 'findLast') { if (this.pL_l > this.l + 1) return [this.items[this.l], this.items[this.pL_l - 1]]; this.pL_sub = 'findFirst'; }
                }
                if (this.pL_sub === 'findFirst') {
                    if (result !== undefined) { if (result === 1) { this.pL_f++; result = undefined; } else { this.pL_sub = 'loop'; result = undefined; } }
                    if (this.pL_sub === 'findFirst') { if (this.pL_f + 1 < this.pL_l) return [this.items[this.l], this.items[this.pL_f + 1]]; this.pL_sub = 'loop'; }
                }
                if (this.pL_sub === 'loop') {
                    if (this.pL_f + 1 < this.pL_l) {
                        [this.items[this.pL_f + 1], this.items[this.pL_l - 1]] = [this.items[this.pL_l - 1], this.items[this.pL_f + 1]];
                        this.pL_sub = 'findLast'; continue;
                    }
                    this.pivotPos = this.pL_l - 1; [this.items[this.l], this.items[this.pivotPos]] = [this.items[this.pivotPos], this.items[this.l]];
                    this.l = this.pivotPos + 1; this.leftmost = false; this.state = 'pop'; continue;
                }
            }
            if (this.state === 'partitionSetup') {
                this.pivot = this.items[this.l]; this.pR_f = this.l; this.pR_l = this.r + 1; this.pR_sub = 'findFirst'; this.state = 'partitionRight'; continue;
            }
            if (this.state === 'partitionRight') {
                if (this.pR_sub === 'findFirst') {
                    if (result !== undefined) { if (result === 0) { this.pR_f++; result = undefined; } else { this.pR_sub = 'findLast'; result = undefined; } }
                    if (this.pR_sub === 'findFirst') { if (this.pR_f + 1 < this.pR_l) return [this.items[this.pR_f + 1], this.pivot]; this.pR_sub = 'findLast'; }
                }
                if (this.pR_sub === 'findLast') {
                    if (this.pR_f === this.l) {
                        if (result !== undefined) { if (result === 1) { this.pR_l--; result = undefined; } else { this.pR_sub = 'finish'; result = undefined; } }
                        if (this.pR_sub === 'findLast') { if (this.pR_f < this.pR_l - 1) return [this.items[this.pR_l - 1], this.pivot]; this.pR_sub = 'finish'; }
                    } else {
                        if (result !== undefined) { if (result === 1) { this.pR_l--; result = undefined; } else { this.pR_sub = 'finish'; result = undefined; } }
                        if (this.pR_sub === 'findLast') return [this.items[this.pR_l - 1], this.pivot];
                    }
                }
                if (this.pR_sub === 'finish') {
                    this.alreadyPartitioned = (this.pR_f >= this.pR_l - 1);
                    if (!this.alreadyPartitioned) { [this.items[this.pR_f + 1], this.items[this.pR_l - 1]] = [this.items[this.pR_l - 1], this.items[this.pR_f + 1]]; this.pR_f++; this.pR_sub = 'loop'; continue; }
                    this.pivotPos = this.pR_f; [this.items[this.l], this.items[this.pivotPos]] = [this.items[this.pivotPos], this.items[this.l]];
                    this.state = 'partitionRightDone'; continue;
                }
                if (this.pR_sub === 'loop') {
                    if (this.pR_f + 1 < this.pR_l) {
                        if (result !== undefined) {
                            if (this.pR_side === 'first') { if (result === 0) { this.pR_f++; result = undefined; } else { this.pR_side = 'last'; result = undefined; } }
                            else { if (result === 1) { this.pR_l--; [this.items[this.pR_f + 1], this.items[this.pR_l]] = [this.items[this.pR_l], this.items[this.pR_f + 1]]; this.pR_f++; this.pR_side = 'first'; result = undefined; } else { this.pR_l--; this.pR_side = 'first'; result = undefined; } }
                            continue;
                        }
                        if (this.pR_side === undefined || this.pR_side === 'first') { this.pR_side = 'first'; return [this.items[this.pR_f + 1], this.pivot]; }
                        else return [this.items[this.pR_l - 1], this.pivot];
                    }
                    this.pivotPos = this.pR_f; [this.items[this.l], this.items[this.pivotPos]] = [this.items[this.pivotPos], this.items[this.l]];
                    this.state = 'partitionRightDone'; this.pR_sub = undefined; this.pR_side = undefined; continue;
                }
            }
            if (this.state === 'partitionRightDone') {
                const size = this.r - this.l + 1, lSize = this.pivotPos - this.l, rSize = this.r - this.pivotPos;
                const highlyUnbalanced = lSize < size / 8 || rSize < size / 8;
                if (highlyUnbalanced) {
                    if (--this.badAllowed === 0) { this.state = 'heapsort'; this.hs_l = this.l; this.hs_r = this.r; this.hs_provider = undefined; continue; }
                    if (lSize >= 24) {
                        [this.items[this.l], this.items[this.l + Math.floor(lSize / 4)]] = [this.items[this.l + Math.floor(lSize / 4)], this.items[this.l]];
                        [this.items[this.pivotPos - 1], this.items[this.pivotPos - 1 - Math.floor(lSize / 4)]] = [this.items[this.pivotPos - 1 - Math.floor(lSize / 4)], this.items[this.pivotPos - 1]];
                    }
                    if (rSize >= 24) {
                        [this.items[this.pivotPos + 1], this.items[this.pivotPos + 1 + Math.floor(rSize / 4)]] = [this.items[this.pivotPos + 1 + Math.floor(rSize / 4)], this.items[this.pivotPos + 1]];
                        [this.items[this.r], this.items[this.r - Math.floor(rSize / 4)]] = [this.items[this.r - Math.floor(rSize / 4)], this.items[this.r]];
                    }
                } else if (this.alreadyPartitioned) {
                    this.state = 'pisL'; this.pis_limit = 8; continue;
                }
                this.stack.push({ l: this.pivotPos + 1, r: this.r, badAllowed: this.badAllowed, leftmost: false });
                this.r = this.pivotPos - 1; this.state = 'pop'; continue;
            }
            if (this.state === 'pisL') {
                this.pis_l = this.l; this.pis_r = this.pivotPos - 1; this.pis_next = 'pisR'; this.pis_i = undefined; this.state = 'partialInsertionSort'; continue;
            }
            if (this.state === 'pisR') {
                this.pis_l = this.pivotPos + 1; this.pis_r = this.r; this.pis_next = 'pop'; this.pis_i = undefined; this.state = 'partialInsertionSort'; continue;
            }
            if (this.state === 'partialInsertionSort') {
                if (this.pis_l >= this.pis_r) { this.state = this.pis_next; continue; }
                if (this.pis_i === undefined) this.pis_i = this.pis_l + 1;
                if (this.pis_i <= this.pis_r) {
                    this.insTemp = this.items[this.pis_i]; this.insJ = this.pis_i - 1; this.state = 'pisCompare'; continue;
                }
                this.pis_i = undefined; this.state = this.pis_next; continue;
            }
            if (this.state === 'pisCompare') {
                if (this.insJ >= this.pis_l) {
                    if (result !== undefined) {
                        if (result === 0) {
                            this.items[this.insJ + 1] = this.items[this.insJ]; this.insJ--; this.pis_limit--;
                            if (this.pis_limit <= 0) {
                                this.stack.push({ l: this.pivotPos + 1, r: this.r, badAllowed: this.badAllowed, leftmost: false });
                                this.r = this.pivotPos - 1; this.state = 'pop'; result = undefined; continue;
                            }
                            result = undefined;
                        } else { this.items[this.insJ + 1] = this.insTemp; this.pis_i++; this.state = 'partialInsertionSort'; result = undefined; continue; }
                    } else return [this.insTemp, this.items[this.insJ]];
                    continue;
                }
                this.items[this.insJ + 1] = this.insTemp; this.pis_i++; this.state = 'partialInsertionSort'; continue;
            }
            if (this.state === 'heapsort') {
                if (this.hs_provider === undefined) {
                    this.hs_provider = new HeapSortProvider(this.hs_r - this.hs_l + 1);
                    this.hs_provider.items = this.items.slice(this.hs_l, this.hs_r + 1);
                }
                const hs_res = this.hs_provider.next(result);
                if (hs_res === null) {
                    for (let i = 0; i < this.hs_provider.items.length; i++) this.items[this.hs_l + i] = this.hs_provider.items[i];
                    this.hs_provider = undefined; this.state = 'pop'; continue;
                }
                return hs_res;
            }
        } return null;
    }
}

class RecursiveBubbleSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ n, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.n <= 1) { this.stack.pop(); continue; }
            if (f.state === 0) { f.i = 0; f.state = 1; }
            if (f.state === 1) {
                if (result !== undefined) { if (result === 0) [this.items[f.i], this.items[f.i + 1]] = [this.items[f.i + 1], this.items[f.i]]; f.i++; result = undefined; }
                if (f.i < f.n - 1) return [this.items[f.i], this.items[f.i + 1]];
                this.stack.push({ n: f.n - 1, state: 0 }); f.state = 2; continue;
            }
            if (f.state === 2) { this.stack.pop(); }
        } return null;
    }
}

class RecursiveInsertionSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ n, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.n <= 1) { this.stack.pop(); continue; }
            if (f.state === 0) { this.stack.push({ n: f.n - 1, state: 0 }); f.state = 1; continue; }
            if (f.state === 1) { f.temp = this.items[f.n - 1]; f.j = f.n - 2; f.state = 2; }
            if (f.state === 2) {
                if (result !== undefined) { if (result === 0) { this.items[f.j + 1] = this.items[f.j]; f.j--; result = undefined; } else { this.items[f.j + 1] = f.temp; this.stack.pop(); result = undefined; continue; } }
                if (f.j >= 0) return [f.temp, this.items[f.j]];
                this.items[f.j + 1] = f.temp; this.stack.pop();
            }
        } return null;
    }
}

class RecursiveSelectionSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ i: 0, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.i >= this.n - 1) { this.stack.pop(); continue; }
            if (f.state === 0) { f.minIdx = f.i; f.j = f.i + 1; f.state = 1; }
            if (f.state === 1) {
                if (result !== undefined) { if (result === 0) f.minIdx = f.j; f.j++; result = undefined; }
                if (f.j < this.n) return [this.items[f.minIdx], this.items[f.j]];
                [this.items[f.i], this.items[f.minIdx]] = [this.items[f.minIdx], this.items[f.i]];
                this.stack.push({ i: f.i + 1, state: 0 }); f.state = 2; continue;
            }
            if (f.state === 2) { this.stack.pop(); }
        } return null;
    }
}

class RecursiveCocktailSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.l >= f.r) { this.stack.pop(); continue; }
            if (f.state === 0) { f.i = f.l; f.state = 1; }
            if (f.state === 1) {
                if (result !== undefined) { if (result === 0) [this.items[f.i], this.items[f.i + 1]] = [this.items[f.i + 1], this.items[f.i]]; f.i++; result = undefined; }
                if (f.i < f.r) return [this.items[f.i], this.items[f.i + 1]];
                f.i = f.r - 1; f.state = 2; continue;
            }
            if (f.state === 2) {
                if (result !== undefined) { if (result === 0) [this.items[f.i], this.items[f.i + 1]] = [this.items[f.i + 1], this.items[f.i]]; f.i--; result = undefined; }
                if (f.i >= f.l) return [this.items[f.i], this.items[f.i + 1]];
                this.stack.push({ l: f.l + 1, r: f.r - 1, state: 0 }); f.state = 3; continue;
            }
            if (f.state === 3) { this.stack.pop(); }
        } return null;
    }
}

class RecursiveGnomeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [1]; }
    next(result) {
        while (this.stack.length > 0) {
            let i = this.stack[this.stack.length - 1];
            if (i >= this.n) { this.stack.pop(); continue; }
            if (i === 0) { this.stack.pop(); this.stack.push(1); continue; }
            if (result !== undefined) {
                if (result === 1) { this.stack.pop(); this.stack.push(i + 1); }
                else { [this.items[i], this.items[i - 1]] = [this.items[i - 1], this.items[i]]; this.stack.pop(); this.stack.push(i - 1); }
                result = undefined; continue;
            }
            return [this.items[i], this.items[i - 1]];
        } return null;
    }
}

class RecursiveBinaryInsertionSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ n, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.n <= 1) { this.stack.pop(); continue; }
            if (f.state === 0) { this.stack.push({ n: f.n - 1, state: 0 }); f.state = 1; continue; }
            if (f.state === 1) { f.temp = this.items[f.n - 1]; f.lo = 0; f.hi = f.n - 1; f.state = 2; }
            if (f.state === 2) {
                if (result !== undefined) { if (result === 1) f.lo = f.mid + 1; else f.hi = f.mid; result = undefined; }
                if (f.lo < f.hi) { f.mid = (f.lo + f.hi) >> 1; return [f.temp, this.items[f.mid]]; }
                for (let k = f.n - 1; k > f.lo; k--) this.items[k] = this.items[k - 1];
                this.items[f.lo] = f.temp; this.stack.pop();
            }
        } return null;
    }
}

class RecursiveDoubleSelectionSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.l >= f.r) { this.stack.pop(); continue; }
            if (f.state === 0) { f.minIdx = f.l; f.maxIdx = f.l; f.i = f.l + 1; f.state = 1; f.compType = 'min'; }
            if (f.state === 1) {
                if (result !== undefined) {
                    if (f.compType === 'min') { if (result === 0) f.minIdx = f.i; f.compType = 'max'; }
                    else { if (result === 1) f.maxIdx = f.i; f.i++; f.compType = 'min'; }
                    result = undefined;
                }
                if (f.i <= f.r) {
                    if (f.compType === 'min') return [this.items[f.minIdx], this.items[f.i]];
                    else return [this.items[f.maxIdx], this.items[f.i]];
                }
                [this.items[f.l], this.items[f.minIdx]] = [this.items[f.minIdx], this.items[f.l]];
                if (f.maxIdx === f.l) f.maxIdx = f.minIdx;
                [this.items[f.r], this.items[f.maxIdx]] = [this.items[f.maxIdx], this.items[f.r]];
                this.stack.push({ l: f.l + 1, r: f.r - 1, state: 0 }); f.state = 2; continue;
            }
            if (f.state === 2) { this.stack.pop(); }
        } return null;
    }
}

class RecursiveShellSortProvider extends Provider {
    constructor(n) { super(n); this.gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n); this.stack = [{ gIdx: 0, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.gIdx >= this.gaps.length) { this.stack.pop(); continue; }
            if (f.state === 0) { f.gap = this.gaps[f.gIdx]; f.i = f.gap; f.state = 1; }
            if (f.state === 1) {
                if (f.i < this.n) { f.temp = this.items[f.i]; f.j = f.i; f.state = 2; }
                else { this.stack.push({ gIdx: f.gIdx + 1, state: 0 }); f.state = 3; continue; }
            }
            if (f.state === 2) {
                if (result !== undefined) { if (result === 0) { this.items[f.j] = this.items[f.j - f.gap]; f.j -= f.gap; result = undefined; }
                    else { this.items[f.j] = f.temp; f.i++; f.state = 1; result = undefined; continue; } }
                if (f.j >= f.gap) return [f.temp, this.items[f.j - f.gap]];
                this.items[f.j] = f.temp; f.i++; f.state = 1; continue;
            }
            if (f.state === 3) { this.stack.pop(); }
        } return null;
    }
}

class RecursiveCombSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ gap: n, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) { f.gap = Math.floor(f.gap / 1.3); if (f.gap < 1) f.gap = 1; f.i = 0; f.swapped = false; f.state = 1; }
            if (f.state === 1) {
                if (result !== undefined) { if (result === 0) { [this.items[f.i], this.items[f.i + f.gap]] = [this.items[f.i + f.gap], this.items[f.i]]; f.swapped = true; } f.i++; result = undefined; }
                if (f.i + f.gap < this.n) return [this.items[f.i], this.items[f.i + f.gap]];
                if (f.gap === 1 && !f.swapped) { this.stack.pop(); continue; }
                this.stack.push({ gap: f.gap, state: 0 }); f.state = 2; continue;
            }
            if (f.state === 2) { this.stack.pop(); }
        } return null;
    }
}

class RecursiveOddEvenSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) { f.swapped = false; f.i = 1; f.state = 1; }
            if (f.state === 1) {
                if (result !== undefined) { if (result === 0) { [this.items[f.i], this.items[f.i + 1]] = [this.items[f.i + 1], this.items[f.i]]; f.swapped = true; } f.i += 2; result = undefined; }
                if (f.i < this.n - 1) return [this.items[f.i], this.items[f.i + 1]];
                f.i = 0; f.state = 2; continue;
            }
            if (f.state === 2) {
                if (result !== undefined) { if (result === 0) { [this.items[f.i], this.items[f.i + 1]] = [this.items[f.i + 1], this.items[f.i]]; f.swapped = true; } f.i += 2; result = undefined; }
                if (f.i < this.n - 1) return [this.items[f.i], this.items[f.i + 1]];
                if (!f.swapped) { this.stack.pop(); continue; }
                this.stack.push({ state: 0 }); f.state = 3; continue;
            }
            if (f.state === 3) { this.stack.pop(); }
        } return null;
    }
}

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

class GenghisKhanSortProvider extends Provider {
    constructor(n) { super(n); this.i = 1; }
    next(result) {
        while (this.i < this.items.length) {
            if (result !== undefined) { this.items.splice(this.i, 1); result = undefined; }
            if (this.i < this.items.length) return [this.items[0], this.items[this.i]];
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

class HaterSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; }
    next(result) {
        if (this.i < this.n * 2) { this.i++; return [Math.floor(Math.random()*this.n), Math.floor(Math.random()*this.n)]; }
        return null;
    }
}

class HayateShikiProvider extends Provider {
    constructor(n) { super(n); this.cnIns = 32; this.iSrc = 0; this.unitStack = []; this.nJoin = 0; this.state = 'MAKE_UNIT'; this.external = new Array(n); this.mergeTasks = []; this.mpSubState = null; }
    next(result) {
        while (true) {
            if (this.mergeTasks.length > 0) {
                const t = this.mergeTasks[this.mergeTasks.length - 1];
                if (t.state === 'INIT') { t.res = []; t.i = 0; t.j = 0; t.state = 'COMPARE'; }
                if (t.state === 'COMPARE') {
                    if (result !== undefined) { if (result === 1) t.res.push(t.u1[t.i++]); else t.res.push(t.u2[t.j++]); result = undefined; }
                    if (t.i < t.u1.length && t.j < t.u2.length) return [t.u1[t.i], t.u2[t.j]];
                    const merged = t.res.concat(t.u1.slice(t.i)).concat(t.u2.slice(t.j));
                    this.mergeTasks.pop(); if (t.callback) t.callback(merged); continue;
                }
            }
            if (this.state === 'MAKE_UNIT') { if (this.iSrc >= this.n) { this.state = 'FINAL_MERGE'; continue; } this.state = 'MAKE_PART_0'; continue; }
            if (this.state === 'MAKE_PART_0') {
                const res = this.subMakePart(result); if (res === 'BUSY') return this.lastPair;
                const unit0 = this.partToUnit(res); result = undefined;
                if (this.iSrc >= this.n) { this.pushUnit(unit0); this.state = 'MAKE_UNIT'; continue; }
                this.unit0 = unit0; this.state = 'MAKE_PART_1'; continue;
            }
            if (this.state === 'MAKE_PART_1') {
                const res = this.subMakePart(result); if (res === 'BUSY') return this.lastPair;
                const unit1 = this.partToUnit(res); result = undefined;
                this.mergeTasks.push({ u1: this.unit0, u2: unit1, state: 'INIT', callback: (merged) => this.pushUnit(merged) });
                this.state = 'MAKE_UNIT'; continue;
            }
            if (this.state === 'FINAL_MERGE') {
                if (this.unitStack.length > 1) {
                    const u2 = this.unitStack.pop(), u1 = this.unitStack.pop();
                    this.mergeTasks.push({ u1, u2, state: 'INIT', callback: (merged) => this.unitStack.push(merged) }); continue;
                }
                if (this.unitStack.length > 0) this.items = this.unitStack[0]; return null;
            }
        }
    }
    subMakePart(result) {
        if (!this.mpSubState) { this.mpSubState = 'INIT'; this.mpA = this.iSrc; this.mpE = this.iSrc; this.isDsc = false; }
        while (true) {
            if (this.mpSubState === 'INIT') {
                if (this.iSrc + 1 < this.n) { this.mpSubState = 'DECIDE'; this.lastPair = [this.items[this.iSrc + 1], this.items[this.iSrc]]; return 'BUSY'; }
                this.iSrc++; this.mpE = this.iSrc; this.mpSubState = 'EXTEND_RUN_END'; continue;
            }
            if (this.mpSubState === 'DECIDE') { this.isDsc = (result === 0); this.mpE = Math.min(this.mpA + this.cnIns, this.n); this.mpInsI = this.mpA + 1; this.mpSubState = 'INS_SORT_START'; result = undefined; continue; }
            if (this.mpSubState === 'INS_SORT_START') {
                if (this.mpInsI < this.mpE) { this.mpInsVal = this.items[this.mpInsI]; this.mpInsJ = this.mpInsI - 1; this.mpSubState = 'INS_SORT_COMPARE'; continue; }
                this.iSrc = this.mpE; this.mpSubState = 'EXTEND_RUN'; continue;
            }
            if (this.mpSubState === 'INS_SORT_COMPARE') {
                if (this.mpInsJ >= this.mpA) { this.lastPair = [this.mpInsVal, this.items[this.mpInsJ]]; this.mpSubState = 'INS_SORT_RESULT'; return 'BUSY'; }
                this.items[this.mpInsJ + 1] = this.mpInsVal; this.mpInsI++; this.mpSubState = 'INS_SORT_START'; continue;
            }
            if (this.mpSubState === 'INS_SORT_RESULT') {
                const cond = this.isDsc ? (result === 1) : (result === 0);
                if (cond) { this.items[this.mpInsJ + 1] = this.items[this.mpInsJ]; this.mpInsJ--; this.mpSubState = 'INS_SORT_COMPARE'; }
                else { this.items[this.mpInsJ + 1] = this.mpInsVal; this.mpInsI++; this.mpSubState = 'INS_SORT_START'; }
                result = undefined; continue;
            }
            if (this.mpSubState === 'EXTEND_RUN') {
                if (this.iSrc < this.mpE) this.iSrc = this.mpE;
                if (this.iSrc < this.n) { this.lastPair = [this.items[this.iSrc], this.items[this.iSrc - 1]]; this.mpSubState = 'EXTEND_RUN_RESULT'; return 'BUSY'; }
                this.mpSubState = 'EXTEND_RUN_END'; continue;
            }
            if (this.mpSubState === 'EXTEND_RUN_RESULT') {
                const cond = this.isDsc ? (result === 0) : (result === 1);
                if (cond) { this.iSrc++; this.mpE = this.iSrc; this.mpSubState = 'EXTEND_RUN'; }
                else { this.mpSubState = 'EXTEND_RUN_END'; }
                result = undefined; continue;
            }
            if (this.mpSubState === 'EXTEND_RUN_END') {
                if (this.isDsc) { let l = this.mpA, r = this.mpE - 1; while (l < r) { [this.items[l], this.items[r]] = [this.items[r], this.items[l]]; l++; r--; } }
                this.mpSubState = 'EXTEND_EXTERNAL_INIT'; continue;
            }
            if (this.mpSubState === 'EXTEND_EXTERNAL_INIT') {
                this.mpADsc = this.n; this.mpEDsc = this.n;
                if (this.iSrc < this.n) { this.lastPair = [this.items[this.iSrc], this.items[this.mpA]]; this.mpSubState = 'EXTEND_EXTERNAL_RESULT_MIN'; return 'BUSY'; }
                this.mpSubState = 'DONE'; continue;
            }
            if (this.mpSubState === 'EXTEND_EXTERNAL_RESULT_MIN') {
                if (result === 0) { this.external[--this.mpADsc] = this.items[this.iSrc++]; this.mpSubState = 'EXTEND_EXTERNAL_LOOP'; }
                else { this.mpSubState = 'DONE'; }
                result = undefined; continue;
            }
            if (this.mpSubState === 'EXTEND_EXTERNAL_LOOP') {
                if (this.iSrc < this.n) { this.lastPair = [this.items[this.iSrc], this.items[this.mpE - 1]]; this.mpSubState = 'EXTEND_EXTERNAL_LOOP_MAX'; return 'BUSY'; }
                this.mpSubState = 'DONE'; continue;
            }
            if (this.mpSubState === 'EXTEND_EXTERNAL_LOOP_MAX') {
                if (result === 1) { this.items[this.mpE++] = this.items[this.iSrc++]; this.mpSubState = 'EXTEND_EXTERNAL_LOOP'; }
                else { this.lastPair = [this.items[this.iSrc], this.external[this.mpADsc]]; this.mpSubState = 'EXTEND_EXTERNAL_LOOP_MIN'; return 'BUSY'; }
                result = undefined; continue;
            }
            if (this.mpSubState === 'EXTEND_EXTERNAL_LOOP_MIN') {
                if (result === 0) { this.external[--this.mpADsc] = this.items[this.iSrc++]; this.mpSubState = 'EXTEND_EXTERNAL_LOOP'; }
                else { this.mpSubState = 'DONE'; }
                result = undefined; continue;
            }
            if (this.mpSubState === 'DONE') {
                const res = { aAsc: this.mpA, nAsc: this.mpE - this.mpA, aDsc: this.mpADsc, nDsc: this.mpEDsc - this.mpADsc };
                this.mpSubState = null; return res;
            }
        }
    }
    partToUnit(p) {
        const res = [];
        for (let i = 0; i < p.nDsc; i++) res.push(this.external[p.aDsc + i]);
        for (let i = 0; i < p.nAsc; i++) res.push(this.items[p.aAsc + i]);
        return res;
    }
    pushUnit(unit) {
        this.unitStack.push(unit); let n = this.nJoin++; let carry = (n ^ (n + 1)) & n;
        this.performIterativeMerge(carry);
    }
    performIterativeMerge(carry) {
        if (carry > 0 && this.unitStack.length > 1) {
            const u2 = this.unitStack.pop(), u1 = this.unitStack.pop();
            this.mergeTasks.push({ u1, u2, state: 'INIT', callback: (merged) => { this.unitStack.push(merged); this.performIterativeMerge(carry >> 1); } });
        }
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

class RotationMergeSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.width = 16;
        this.i = 0;
        this.state = 'insertion_pass';
        this.mergeStack = [];
    }
    reverse(l, r) {
        while (l < r) {
            let t = this.items[l]; this.items[l] = this.items[r]; this.items[r] = t;
            l++; r--;
        }
    }
    rotate(l, m, r) {
        if (l >= m || m >= r) return;
        this.reverse(l, m - 1);
        this.reverse(m, r - 1);
        this.reverse(l, r - 1);
    }
    next(result) {
        while (true) {
            if (this.state === 'insertion_pass') {
                if (this.i < this.n) {
                    this.ins_i = this.i + 1;
                    this.ins_end = Math.min(this.i + 16, this.n);
                    this.state = 'insertion_work';
                } else {
                    this.width = 16;
                    this.i = 0;
                    this.state = 'merge_pass';
                }
                continue;
            }
            if (this.state === 'insertion_work') {
                if (this.ins_i < this.ins_end) {
                    if (this.ins_subState === undefined) {
                        this.ins_temp = this.items[this.ins_i];
                        this.ins_j = this.ins_i - 1;
                        this.ins_subState = 'compare';
                    }
                    if (this.ins_subState === 'compare') {
                        if (result !== undefined) {
                            if (result === 0) {
                                this.items[this.ins_j + 1] = this.items[this.ins_j];
                                this.ins_j--;
                                result = undefined;
                            } else {
                                this.items[this.ins_j + 1] = this.ins_temp;
                                this.ins_i++;
                                this.ins_subState = undefined;
                                result = undefined;
                                continue;
                            }
                        }
                        if (this.ins_j >= this.i) return [this.ins_temp, this.items[this.ins_j]];
                        this.items[this.ins_j + 1] = this.ins_temp;
                        this.ins_i++;
                        this.ins_subState = undefined;
                        continue;
                    }
                } else {
                    this.i += 16;
                    this.state = 'insertion_pass';
                }
                continue;
            }
            if (this.state === 'merge_pass') {
                if (this.width < this.n) {
                    if (this.i + this.width < this.n) {
                        let l = this.i, m = this.i + this.width, r = Math.min(this.i + 2 * this.width, this.n);
                        this.mergeStack = [{ l, m, r }];
                        this.state = 'merging';
                    } else {
                        this.width *= 2; this.i = 0;
                    }
                } else return null;
                continue;
            }
            if (this.state === 'merging') {
                if (this.mergeStack.length === 0) {
                    this.i += 2 * this.width;
                    this.state = 'merge_pass';
                    continue;
                }
                let f = this.mergeStack[this.mergeStack.length - 1];
                if (f.l >= f.m || f.m >= f.r) { this.mergeStack.pop(); continue; }
                if (f.subState === undefined) {
                    f.m1 = Math.floor((f.l + f.m) / 2);
                    f.lo = f.m; f.hi = f.r;
                    f.subState = 'binSearch';
                }
                if (f.subState === 'binSearch') {
                    if (result !== undefined) {
                        if (result === 1) f.lo = f.mid + 1; else f.hi = f.mid;
                        result = undefined;
                    }
                    if (f.lo < f.hi) {
                        f.mid = Math.floor((f.lo + f.hi) / 2);
                        return [this.items[f.m1], this.items[f.mid]];
                    }
                    f.m2 = f.lo;
                    this.rotate(f.m1, f.m, f.m2);
                    let newM = f.m1 + (f.m2 - f.m);
                    this.mergeStack.pop();
                    this.mergeStack.push({ l: newM + 1, m: f.m2, r: f.r });
                    this.mergeStack.push({ l: f.l, m: f.m1, r: newM });
                    continue;
                }
            }
        }
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
                        if (result === 1) { let val = this.items[f.j]; for (let k = f.j; k > f.i; k--) this.items[k] = this.items[k - 1]; this.items[f.i] = val; f.i++; f.m++; f.j++; }
                        else f.i++; result = undefined;
                    }
                    if (f.i <= f.m && f.j <= f.r) return [this.items[f.i], this.items[f.j]];
                }
                this.pop();
            }
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

class IntelligentDesignSortProvider extends Provider {
    constructor(n) { super(n); }
    next() { return null; }
}

class IntroSortProvider extends Provider {
    constructor(n) { super(n); this.depthLimit = 2 * Math.floor(Math.log2(n)); this.stack = [{l: 0, r: n - 1, d: 0}]; this.state = 'pop'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'pop') {
            if (this.state === 'pop') { if (this.stack.length === 0) return null; const {l, r, d} = this.stack.pop(); if (l >= r) continue; if (r - l <= 16) { this.iL = l; this.iR = r; this.iI = l + 1; this.state = 'insStart'; continue; } if (d > this.depthLimit) { this.state = 'heap'; this.hl = l; this.hr = r; this.hi = Math.floor((r - l + 1) / 2) - 1; this.h_state = 'heapify'; this.h_size = r - l + 1; continue; } this.low = l; this.high = r; this.d = d; this.pivotVal = this.items[r]; this.p_i = l - 1; this.p_j = l; this.state = 'partition'; }
            if (this.state === 'insStart') { if (this.iI <= this.iR) { this.iTemp = this.items[this.iI]; this.iJ = this.iI - 1; this.state = 'insCompare'; continue; } this.state = 'pop'; continue; }
            if (this.state === 'insCompare') { if (this.iJ >= this.iL) { if (result !== undefined) { if (result === 0) { this.items[this.iJ + 1] = this.items[this.iJ]; this.iJ--; result = undefined; } else { this.items[this.iJ + 1] = this.iTemp; this.iI++; this.state = 'insStart'; result = undefined; continue; } } else return [this.iTemp, this.items[this.iJ]]; continue; } this.items[this.iJ + 1] = this.iTemp; this.iI++; this.state = 'insStart'; continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 1) { this.p_i++; [this.items[this.p_i], this.items[this.p_j]] = [this.items[this.p_j], this.items[this.p_i]]; } this.p_j++; result = undefined; } if (this.p_j < this.high) return [this.items[this.p_j], this.pivotVal]; [this.items[this.p_i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.p_i + 1]]; let p = this.p_i + 1; this.stack.push({l: p + 1, r: this.high, d: this.d + 1}, {l: this.low, r: p - 1, d: this.d + 1}); this.state = 'pop'; }
            if (this.state === 'heap') { if (this.h_state === 'heapify') { if (this.hi >= 0) { this.h_curr = this.hl + this.hi; this.hi--; this.state = 'siftDown'; this.h_next = 'heapify'; } else { this.hi = this.h_size - 1; this.h_state = 'sort'; } continue; } if (this.h_state === 'sort') { if (this.hi > 0) { [this.items[this.hl], this.items[this.hl + this.hi]] = [this.items[this.hl + this.hi], this.items[this.hl]]; this.h_size = this.hi; this.h_curr = this.hl; this.hi--; this.state = 'siftDown'; this.h_next = 'sort'; } else this.state = 'pop'; continue; } }
            if (this.state === 'siftDown') { if (result !== undefined) { if (result === 1) { [this.items[this.h_curr], this.items[this.h_best]] = [this.items[this.h_best], this.items[this.h_curr]]; this.h_curr = this.h_best; } else { this.state = 'heap'; this.h_state = this.h_next; result = undefined; continue; } result = undefined; } let rel_curr = this.h_curr - this.hl, l = 2 * rel_curr + 1, r = 2 * rel_curr + 2; this.h_best = this.h_curr; if (l < this.h_size && r < this.h_size) { if (this.h_compLR === undefined) { this.h_compLR = true; return [this.items[this.hl + l], this.items[this.hl + r]]; } if (this.h_compLR) { let b = (result === 1) ? l : r; this.h_compLR = false; this.h_tempBest = this.hl + b; result = undefined; return [this.items[this.h_tempBest], this.items[this.h_curr]]; } if (result === 1) { [this.items[this.h_curr], this.items[this.h_tempBest]] = [this.items[this.h_tempBest], this.items[this.h_curr]]; this.h_curr = this.h_tempBest; this.h_compLR = undefined; result = undefined; continue; } else { this.state = 'heap'; this.h_state = this.h_next; this.h_compLR = undefined; result = undefined; continue; } } else if (l < this.h_size) { this.h_best = this.hl + l; return [this.items[this.h_best], this.items[this.h_curr]]; } else { this.state = 'heap'; this.h_state = this.h_next; continue; } }
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
                    else f.tree[f.bIdx] = (result === 0) ? f.tree[L] : f.tree[R];
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
                        else f.tree[P] = (result === 0) ? f.tree[L] : f.tree[R];
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

class MergeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) {
                if (f.l >= f.r) { this.pop(); continue; }
                f.mid = Math.floor((f.l + f.r) / 2); this.stack.push({ l: f.l, r: f.mid, state: 0 }); continue;
            }
            if (f.state === 1) { this.stack.push({ l: f.mid + 1, r: f.r, state: 0 }); continue; }
            if (f.state === 2) { f.L = this.items.slice(f.l, f.mid + 1); f.R = this.items.slice(f.mid + 1, f.r + 1); f.i = 0; f.j = 0; f.k = f.l; f.state = 3; }
            if (f.state === 3) {
                if (result !== undefined) { if (result === 0) this.items[f.k++] = f.L[f.i++]; else this.items[f.k++] = f.R[f.j++]; result = undefined; }
                if (f.i < f.L.length && f.j < f.R.length) return [f.L[f.i], f.R[f.j]];
                while (f.i < f.L.length) this.items[f.k++] = f.L[f.i++];
                while (f.j < f.R.length) this.items[f.k++] = f.R[f.j++];
                this.pop();
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

class NaturalMergeSortProvider extends Provider {
    constructor(n) { super(n); this.state = 'start'; }
    next(result) {
        while (true) {
            if (this.state === 'start') { this.runs = []; this.idx = 0; this.state = 'findRun'; }
            if (this.state === 'findRun') { if (this.idx < this.n) { this.runStart = this.idx; this.idx++; this.state = 'extendRun'; continue; } this.state = 'mergeLoop'; continue; }
            if (this.state === 'extendRun') {
                if (this.idx < this.n) {
                    if (result !== undefined) { if (result === 0) { this.idx++; result = undefined; } else { this.runs.push(this.items.slice(this.runStart, this.idx)); this.state = 'findRun'; result = undefined; continue; } }
                    else return [this.items[this.idx-1], this.items[this.idx]];
                    continue;
                }
                this.runs.push(this.items.slice(this.runStart, this.idx)); this.state = 'findRun'; continue;
            }
            if (this.state === 'mergeLoop') { if (this.runs.length <= 1) { if (this.runs.length === 1) this.items = this.runs[0]; return null; } this.newRuns = []; this.rIdx = 0; this.state = 'pair'; }
            if (this.state === 'pair') {
                if (this.rIdx < this.runs.length - 1) { this.A = this.runs[this.rIdx]; this.B = this.runs[this.rIdx + 1]; this.ai = 0; this.bi = 0; this.resArr = []; this.state = 'work'; }
                else { if (this.rIdx === this.runs.length - 1) this.newRuns.push(this.runs[this.rIdx]); this.runs = this.newRuns; this.state = 'mergeLoop'; continue; }
            }
            if (this.state === 'work') {
                if (result !== undefined) { if (result === 0) this.resArr.push(this.A[this.ai++]); else this.resArr.push(this.B[this.bi++]); result = undefined; }
                if (this.ai < this.A.length && this.bi < this.B.length) return [this.A[this.ai], this.B[this.bi]];
                while (this.ai < this.A.length) this.resArr.push(this.A[this.ai++]);
                while (this.bi < this.B.length) this.resArr.push(this.B[this.bi++]);
                this.newRuns.push(this.resArr); this.rIdx += 2; this.state = 'pair';
            }
        }
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

class ParallelMergeSortProvider extends Provider {
    constructor(n) { super(n); this.width = 1; this.tasks = []; this.state = 'init'; }
    next(result) {
        while (this.width < this.n) {
            if (this.state === 'init') { this.tasks = []; for (let i = 0; i < this.n; i += 2 * this.width) { let mid = i + this.width, r = Math.min(i + 2 * this.width, this.n); if (mid < r) this.tasks.push({ l: i, mid, r, left: this.items.slice(i, mid), right: this.items.slice(mid, r), i: 0, j: 0, k: i, done: false }); } if (this.tasks.length === 0) { this.width *= 2; continue; } this.idx = 0; this.state = 'work'; }
            if (this.state === 'work') { if (result !== undefined) { let t = this.tasks[this.idx]; if (result === 0) this.items[t.k++] = t.left[t.i++]; else this.items[t.k++] = t.right[t.j++]; if (t.i === t.left.length || t.j === t.right.length) { while (t.i < t.left.length) this.items[t.k++] = t.left[t.i++]; while (t.j < t.right.length) this.items[t.k++] = t.right[t.j++]; t.done = true; } this.idx = (this.idx + 1) % this.tasks.length; result = undefined; } let start = this.idx; while (this.tasks[this.idx].done) { this.idx = (this.idx + 1) % this.tasks.length; if (this.idx === start) break; } if (this.tasks[this.idx].done) { this.width *= 2; this.state = 'init'; continue; } let t = this.tasks[this.idx]; return [t.left[t.i], t.right[t.j]]; }
        } return null;
    }
}

class ParallelQuicksortProvider extends Provider {
    constructor(n) { super(n); this.tasks = [{ l: 0, r: n - 1, state: 'init' }]; }
    next(result) {
        while (this.tasks.some(t => t.state !== 'done')) {
            for (let idx = 0; idx < this.tasks.length; idx++) {
                let t = this.tasks[idx]; if (t.state === 'done') continue;
                if (t.state === 'init') { if (t.l >= t.r) { t.state = 'done'; continue; } t.pivotVal = this.items[t.r]; t.i = t.l - 1; t.j = t.l; t.state = 'partition'; }
                if (t.state === 'partition') { if (result !== undefined && t.busy) { if (result === 0) { t.i++; [this.items[t.i], this.items[t.j]] = [this.items[t.j], this.items[t.i]]; } t.j++; t.busy = false; result = undefined; } if (t.j < t.r) { t.busy = true; return [this.items[t.j], t.pivotVal]; } [this.items[t.i + 1], this.items[t.r]] = [this.items[t.r], this.items[t.i + 1]]; let p = t.i + 1; t.state = 'done'; this.tasks.push({ l: t.l, r: p - 1, state: 'init' }, { l: p + 1, r: t.r, state: 'init' }); continue; }
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

class PingPongMergeSortProvider extends Provider {
    constructor(n) { super(n); this.width = 1; this.state = 'init'; this.aux = new Array(n); this.onAux = false; }
    next(result) {
        while (this.width < this.n) {
            if (this.state === 'init') { this.i = 0; this.state = 'merge'; continue; }
            if (this.state === 'merge') {
                if (this.i < this.n) {
                    this.l = this.i; this.mid = Math.min(this.i + this.width, this.n); this.r = Math.min(this.i + 2 * this.width, this.n);
                    this.src = this.onAux ? this.aux : this.items; this.dst = this.onAux ? this.items : this.aux;
                    this.ii = this.l; this.jj = this.mid; this.k = this.l; this.state = 'work';
                } else { this.width *= 2; this.onAux = !this.onAux; this.state = 'init'; continue; }
            }
            if (this.state === 'work') {
                if (result !== undefined) { if (result === 0) this.dst[this.k++] = this.src[this.ii++]; else this.dst[this.k++] = this.src[this.jj++]; result = undefined; }
                if (this.ii < this.mid && this.jj < this.r) return [this.src[this.ii], this.src[this.jj]];
                while (this.ii < this.mid) this.dst[this.k++] = this.src[this.ii++];
                while (this.jj < this.r) this.dst[this.k++] = this.src[this.jj++];
                this.i += 2 * this.width; this.state = 'merge';
            }
        }
        if (this.onAux) { for(let i=0; i<this.n; i++) this.items[i] = this.aux[i]; this.onAux = false; }
        return null;
    }
}

class PowersortProvider extends Provider {
    constructor(n) { super(n); this.idx = 0; this.runStack = []; this.state = 'next_run'; }
    power(s1, n1, s2, n2, n) {
        let m1 = s1 + n1 / 2, m2 = s2 + n2 / 2;
        let a = m1 / n, b = m2 / n; let p = 0;
        while (true) {
            let abits = Math.floor(a * 2), bbits = Math.floor(b * 2);
            if (abits !== bbits) return p;
            a = a * 2 - abits; b = b * 2 - bbits; p++;
        }
    }
    next(result) {
        while (true) {
            if (this.state === 'next_run') { if (this.idx < this.n) { this.runStart = this.idx; this.i = this.idx + 1; this.state = 'decide_direction'; } else { this.state = 'force_collapse'; continue; } }
            if (this.state === 'decide_direction' || this.state === 'extend_ascending' || this.state === 'extend_descending') {
                if (result !== undefined) {
                    if (this.state === 'decide_direction') { this.isDescending = (result === 0); this.i++; this.state = this.isDescending ? 'extend_descending' : 'extend_ascending'; }
                    else if (this.state === 'extend_ascending') { if (result === 1) this.i++; else this.state = 'push_run'; }
                    else if (this.state === 'extend_descending') { if (result === 0) this.i++; else this.state = 'push_run'; }
                    result = undefined; if (this.state === 'push_run') continue;
                }
                if (this.i < this.n) return [this.items[this.i], this.items[this.i-1]];
                this.state = 'push_run'; continue;
            }
            if (this.state === 'push_run') {
                if (this.isDescending) { let l=this.runStart, r=this.i-1; while(l<r) { [this.items[l],this.items[r]]=[this.items[r],this.items[l]]; l++; r--; } }
                let newRun = { start: this.runStart, len: this.i - this.runStart };
                if (this.runStack.length > 0) {
                    let lastRun = this.runStack[this.runStack.length - 1];
                    lastRun.p = this.power(lastRun.start, lastRun.len, newRun.start, newRun.len, this.n);
                    while (this.runStack.length >= 2 && this.runStack[this.runStack.length-2].p >= lastRun.p) {
                        this.mergeIdx = this.runStack.length - 2; this.state = 'merging_init'; return this.next(undefined);
                    }
                }
                this.runStack.push(newRun); this.idx = this.i; this.state = 'next_run'; continue;
            }
            if (this.state === 'force_collapse') { if (this.runStack.length > 1) { this.mergeIdx = this.runStack.length - 2; this.state = 'merging_init'; continue; } return null; }
            if (this.state === 'merging_init') {
                let r1 = this.runStack[this.mergeIdx], r2 = this.runStack[this.mergeIdx+1];
                this.A = this.items.slice(r1.start, r1.start + r1.len); this.B = this.items.slice(r2.start, r2.start + r2.len);
                this.ai = 0; this.bi = 0; this.k = r1.start; this.state = 'merging_loop'; continue;
            }
            if (this.state === 'merging_loop') {
                if (result !== undefined) { if (result === 0) this.items[this.k++] = this.A[this.ai++]; else this.items[this.k++] = this.B[this.bi++]; result = undefined; }
                if (this.ai < this.A.length && this.bi < this.B.length) return [this.A[this.ai], this.B[this.bi]];
                while (this.ai < this.A.length) this.items[this.k++] = this.A[this.ai++]; while (this.bi < this.B.length) this.items[this.k++] = this.B[this.bi++];
                let merged = { start: this.runStack[this.mergeIdx].start, len: this.runStack[this.mergeIdx].len + this.runStack[this.mergeIdx+1].len, p: this.runStack[this.mergeIdx+1].p };
                this.runStack.splice(this.mergeIdx, 2, merged);
                if (this.idx === this.n) { this.state = 'force_collapse'; }
                else {
                    let lastRun = this.runStack[this.runStack.length - 1];
                    if (this.runStack.length >= 2 && this.runStack[this.runStack.length-2].p >= lastRun.p) {
                        this.mergeIdx = this.runStack.length - 2; this.state = 'merging_init';
                    } else { this.state = 'next_run'; }
                } continue;
            }
        }
    }
}

class QuantumBogoSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; }
    next(result) {
        if (result !== undefined) { if (result === 0) { return null; } this.i++; result = undefined; }
        if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
        return null;
    }
}

class Quicksort3WayProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.l, this.r] = this.stack.pop(); if (this.l < this.r) { this.pVal = this.items[this.l]; this.lt = this.l; this.eq = this.l; this.gt = this.r; this.state = 'partition'; } else continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { [this.items[this.lt], this.items[this.eq]] = [this.items[this.eq], this.items[this.lt]]; this.lt++; this.eq++; } else if (result === 1) { [this.items[this.eq], this.items[this.gt]] = [this.items[this.gt], this.items[this.eq]]; this.gt--; } else this.eq++; result = undefined; } if (this.eq <= this.gt) return [this.items[this.eq], this.pVal]; this.stack.push([this.gt + 1, this.r], [this.l, this.lt - 1]); this.state = 'start'; }
        } return null;
    }
}

class QuicksortHoareProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') {
                if (this.stack.length === 0) { this.state = 'done'; return null; }
                [this.l, this.r] = this.stack.pop();
                if (this.l < this.r) {
                    this.pVal = this.items[this.l + Math.floor((this.r - this.l)/2)];
                    this.i = this.l - 1; this.j = this.r + 1;
                    this.state = 'i_loop';
                } else continue;
            }
            if (this.state === 'i_loop') {
                if (result !== undefined) {
                    if (result === 1) { this.state = 'j_loop'; result = undefined; }
                    else { this.i++; result = undefined; }
                } else { this.i++; }
                if (this.state === 'i_loop') {
                    if (this.i <= this.r) return [this.items[this.i], this.pVal];
                    else { this.state = 'j_loop'; }
                }
            }
            if (this.state === 'j_loop') {
                if (result !== undefined) {
                    if (result === 0) { this.state = 'swap'; result = undefined; }
                    else { this.j--; result = undefined; }
                } else { this.j--; }
                if (this.state === 'j_loop') {
                    if (this.j >= this.l) return [this.items[this.j], this.pVal];
                    else { this.state = 'swap'; }
                }
            }
            if (this.state === 'swap') {
                if (this.i >= this.j) {
                    this.stack.push([this.j + 1, this.r], [this.l, this.j]);
                    this.state = 'start';
                } else {
                    [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]];
                    this.state = 'i_loop';
                }
                result = undefined; continue;
            }
        } return null;
    }
}

class QuicksortLTRProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.low, this.high] = this.stack.pop(); if (this.low < this.high) { [this.items[this.low], this.items[this.high]] = [this.items[this.high], this.items[this.low]]; this.pivot = this.items[this.high]; this.i = this.low - 1; this.j = this.low; this.state = 'partition'; } else continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; } this.j++; result = undefined; } if (this.j < this.high) return [this.items[this.j], this.pivot]; [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]]; let p = this.i + 1; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start'; }
        } return null;
    }
}

class QuicksortMiddleProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.low, this.high] = this.stack.pop(); if (this.low < this.high) { let m = Math.floor((this.low + this.high) / 2); [this.items[m], this.items[this.high]] = [this.items[this.high], this.items[m]]; this.pivot = this.items[this.high]; this.i = this.low - 1; this.j = this.low; this.state = 'partition'; } else continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; } this.j++; result = undefined; } if (this.j < this.high) return [this.items[this.j], this.pivot]; [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]]; let p = this.i + 1; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start'; }
        } return null;
    }
}

class QuicksortMo3Provider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.low, this.high] = this.stack.pop(); if (this.low < this.high) { this.mid = Math.floor((this.low + this.high) / 2); this.pState = 0; this.state = 'pivot'; } else continue; }
            if (this.state === 'pivot') { if (this.pState === 0) { if (result !== undefined) { if (result === 1) [this.items[this.low], this.items[this.mid]] = [this.items[this.mid], this.items[this.low]]; this.pState = 1; result = undefined; } else return [this.items[this.low], this.items[this.mid]]; } if (this.pState === 1) { if (result !== undefined) { if (result === 1) [this.items[this.low], this.items[this.high]] = [this.items[this.high], this.items[this.low]]; this.pState = 2; result = undefined; } else return [this.items[this.low], this.items[this.high]]; } if (this.pState === 2) { if (result !== undefined) { if (result === 1) [this.items[this.mid], this.items[this.high]] = [this.items[this.high], this.items[this.mid]]; this.pState = 3; result = undefined; } else return [this.items[this.mid], this.items[this.high]]; } if (this.pState === 3) { this.pivot = this.items[this.high]; this.i = this.low - 1; this.j = this.low; this.state = 'partition'; } }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; } this.j++; result = undefined; } if (this.j < this.high) return [this.items[this.j], this.pivot]; [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]]; let p = this.i + 1; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start'; }
        } return null;
    }
}

class QuicksortNintherProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.low, this.high] = this.stack.pop(); if (this.low < this.high) { if (this.high - this.low < 8) { let m = Math.floor((this.low+this.high)/2); [this.items[m], this.items[this.high]] = [this.items[this.high], this.items[m]]; this.pivot = this.items[this.high]; this.i = this.low-1; this.j = this.low; this.state = 'partition'; } else { let d = Math.floor((this.high-this.low)/8); this.idx = [0,1,2,3,4,5,6,7,8].map(k => this.low+k*d); this.g = 0; this.pS = 0; this.m = []; this.state = 'ninther'; } } else continue; }
            if (this.state === 'ninther') { if (this.g < 3) { let a = this.idx[this.g*3], b = this.idx[this.g*3+1], c = this.idx[this.g*3+2]; if (this.pS === 0) { if (result !== undefined) { if (result === 1) [this.items[a], this.items[b]] = [this.items[b], this.items[a]]; this.pS=1; result=undefined; } else return [this.items[a], this.items[b]]; } if (this.pS === 1) { if (result !== undefined) { if (result === 1) [this.items[a], this.items[c]] = [this.items[c], this.items[a]]; this.pS=2; result=undefined; } else return [this.items[a], this.items[c]]; } if (this.pS === 2) { if (result !== undefined) { if (result === 1) [this.items[b], this.items[c]] = [this.items[c], this.items[b]]; this.pS=3; result=undefined; } else return [this.items[b], this.items[c]]; } if (this.pS === 3) { this.m.push(this.items[this.idx[this.g*3+1]]); this.g++; this.pS = 0; continue; } } else { if (this.pS === 0) { if (result !== undefined) { if (result === 1) [this.m[0], this.m[1]] = [this.m[1], this.m[0]]; this.pS=1; result=undefined; } else return [this.m[0], this.m[1]]; } if (this.pS === 1) { if (result !== undefined) { if (result === 1) [this.m[0], this.m[2]] = [this.m[2], this.m[0]]; this.pS=2; result=undefined; } else return [this.m[0], this.m[2]]; } if (this.pS === 2) { if (result !== undefined) { if (result === 1) [this.m[1], this.m[2]] = [this.m[2], this.m[1]]; this.pS=3; result=undefined; } else return [this.m[1], this.m[2]]; } if (this.pS === 3) { let val = this.m[1]; let pos = this.high; for (let k=this.low; k<=this.high; k++) if (this.items[k] === val) { pos = k; break; } [this.items[pos], this.items[this.high]] = [this.items[this.high], this.items[pos]]; this.pivot = this.items[this.high]; this.i = this.low - 1; this.j = this.low; this.state = 'partition'; } } continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; } this.j++; result = undefined; } if (this.j < this.high) return [this.items[this.j], this.pivot]; [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]]; let p = this.i + 1; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start'; }
        } return null;
    }
}

class QuicksortRTLProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.low, this.high] = this.stack.pop(); if (this.low < this.high) { this.pivot = this.items[this.high]; this.i = this.low - 1; this.j = this.low; this.state = 'partition'; } else continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; } this.j++; result = undefined; } if (this.j < this.high) return [this.items[this.j], this.pivot]; [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]]; let p = this.i + 1; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start'; }
        } return null;
    }
}

class RadixSortProvider extends Provider {
    constructor(n) { super(n); this.pass = 0; this.numPasses = Math.ceil(Math.log2(n)); this.state = 'init_pass'; }
    next(result) {
        while (this.pass < this.numPasses) {
            if (this.state === 'init_pass') { this.pivot = this.items[Math.floor(Math.random() * this.items.length)]; this.lo_bucket = []; this.hi_bucket = []; this.idx = 0; this.state = 'partition'; }
            if (this.state === 'partition') {
                if (result !== undefined) { if (result === 0) this.hi_bucket.push(this.items[this.idx]); else this.lo_bucket.push(this.items[this.idx]); this.idx++; result = undefined; }
                if (this.idx < this.n) return [this.items[this.idx], this.pivot];
                this.items = [...this.lo_bucket, ...this.hi_bucket]; this.pass++; this.state = 'init_pass'; continue;
            }
        }
        if (!this.finalSort) { this.finalSort = new InsertionSortProvider(this.n); this.finalSort.items = this.items; }
        const res = this.finalSort.next(result);
        if (res === null) this.items = this.finalSort.items;
        return res;
    }
}

class QuicksortRandomProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.low, this.high] = this.stack.pop(); if (this.low < this.high) { let r = Math.floor(Math.random() * (this.high - this.low + 1)) + this.low; [this.items[r], this.items[this.high]] = [this.items[this.high], this.items[r]]; this.pivot = this.items[this.high]; this.i = this.low - 1; this.j = this.low; this.state = 'partition'; } else continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { this.i++; [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; } this.j++; result = undefined; } if (this.j < this.high) return [this.items[this.j], this.pivot]; [this.items[this.i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.i + 1]]; let p = this.i + 1; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start'; }
        } return null;
    }
}

class RandomSortProvider extends Provider {
    constructor(n) { super(n); this.count = 0; this.max = Math.floor(Math.random() * n * 5); }
    next() {
        if (this.count < this.max) { this.count++; return [Math.floor(Math.random()*this.n), Math.floor(Math.random()*this.n)]; }
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

class SillySortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{i:0, j:n-1}]; this.compCount = 0; }
    next(result) {
        while (this.stack.length > 0 && this.compCount < 10000) {
            let {i, j} = this.stack.pop(); if (i >= j) continue;
            let m = Math.floor((i+j)/2);
            this.stack.push({i:i, j:j-1}, {i:i+1, j:j}, {i:i, j:m}, {i:m+1, j:j});
            this.compCount++;
            return [this.items[i], this.items[j]];
        } return null;
    }
}

class SleepSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; }
    next() { if (this.i < this.n) { this.i++; return [this.items[this.i-1], this.items[this.i-1]]; } return null; }
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

class SmoothSortProvider extends Provider {
    constructor(n) { super(n); this.state = 'build'; this.q = 1; this.r = 0; this.p = 1; this.b = 1; this.c = 1; }
    next(result) {
        if (!this.proxy) this.proxy = new HeapSortProvider(this.n);
        return this.proxy.next(result);
    }
}

class SocialistSortProvider extends Provider {
    constructor(n) { super(n); }
    next() { return null; }
}

class StableQuicksortProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.low, this.high] = this.stack.pop(); if (this.low < this.high) { this.pivot = this.items[this.low]; this.left = []; this.right = []; this.curr = this.low + 1; this.state = 'partition'; } else continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 1) this.right.push(this.items[this.curr]); else this.left.push(this.items[this.curr]); this.curr++; result = undefined; } if (this.curr <= this.high) return [this.items[this.curr], this.pivot]; let idx = this.low; for (let x of this.left) this.items[idx++] = x; let p = idx++; this.items[p] = this.pivot; for (let x of this.right) this.items[idx++] = x; this.stack.push([p + 1, this.high], [this.low, p - 1]); this.state = 'start'; }
        } return null;
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

class TimsortProvider extends Provider {
    constructor(n) { super(n); this.minRun = this.calcMinRun(n); this.idx = 0; this.runStack = []; this.state = 'next_run'; }
    calcMinRun(n) { let r = 0; while (n >= 64) { r |= n & 1; n >>= 1; } return n + r; }
    next(result) {
        while (true) {
            if (this.state === 'next_run') { if (this.idx < this.n) { this.runStart = this.idx; this.i = this.idx + 1; this.state = 'decide_direction'; } else { this.state = 'force_collapse'; continue; } }
            if (this.state === 'decide_direction' || this.state === 'extend_ascending' || this.state === 'extend_descending') {
                if (result !== undefined) {
                    if (this.state === 'decide_direction') { this.isDescending = (result === 0); this.i++; this.state = this.isDescending ? 'extend_descending' : 'extend_ascending'; }
                    else if (this.state === 'extend_ascending') { if (result === 1) this.i++; else this.state = 'extend_minrun'; }
                    else if (this.state === 'extend_descending') { if (result === 0) this.i++; else this.state = 'extend_minrun'; }
                    result = undefined; if (this.state === 'extend_minrun') continue;
                }
                if (this.i < this.n) return [this.items[this.i], this.items[this.i-1]];
                this.state = 'extend_minrun'; continue;
            }
            if (this.state === 'extend_minrun') {
                if (this.isDescending) { let l=this.runStart, r=this.i-1; while(l<r) { [this.items[l],this.items[r]]=[this.items[r],this.items[l]]; l++; r--; } }
                this.targetEnd = Math.min(this.n, this.runStart + this.minRun);
                if (this.i < this.targetEnd) { this.ins_i = this.i; this.state = 'ins_start'; } else { this.state = 'push_run'; } continue;
            }
            if (this.state === 'ins_start') { if (this.ins_i < this.targetEnd) { this.temp = this.items[this.ins_i]; this.lo = this.runStart; this.hi = this.ins_i; this.state = 'ins_binary_search'; continue; } this.i = this.targetEnd; this.state = 'push_run'; continue; }
            if (this.state === 'ins_binary_search') {
                if (result !== undefined) { if (result === 1) this.lo = this.mid + 1; else this.hi = this.mid; result = undefined; }
                if (this.lo < this.hi) { this.mid = (this.lo + this.hi) >> 1; return [this.temp, this.items[this.mid]]; }
                for (let k = this.ins_i; k > this.lo; k--) this.items[k] = this.items[k-1]; this.items[this.lo] = this.temp; this.ins_i++; this.state = 'ins_start'; continue;
            }
            if (this.state === 'push_run') { this.runStack.push({ start: this.runStart, len: this.i - this.runStart }); this.idx = this.i; this.state = 'collapse'; continue; }
            if (this.state === 'collapse') {
                if (this.runStack.length > 1) {
                    let n = this.runStack.length;
                    if (n >= 3 && this.runStack[n-3].len <= this.runStack[n-2].len + this.runStack[n-1].len) {
                        if (this.runStack[n-3].len < this.runStack[n-1].len) { this.mergeIdx = n-3; } else { this.mergeIdx = n-2; }
                        this.state = 'merging_init'; continue;
                    } else if (this.runStack[n-2].len <= this.runStack[n-1].len) { this.mergeIdx = n-2; this.state = 'merging_init'; continue; }
                }
                this.state = 'next_run'; continue;
            }
            if (this.state === 'force_collapse') { if (this.runStack.length > 1) { this.mergeIdx = this.runStack.length - 2; this.state = 'merging_init'; continue; } return null; }
            if (this.state === 'merging_init') {
                let r1 = this.runStack[this.mergeIdx], r2 = this.runStack[this.mergeIdx+1];
                this.A = this.items.slice(r1.start, r1.start + r1.len); this.B = this.items.slice(r2.start, r2.start + r2.len);
                this.ai = 0; this.bi = 0; this.k = r1.start; this.state = 'merging_loop'; continue;
            }
            if (this.state === 'merging_loop') {
                if (result !== undefined) { if (result === 0) this.items[this.k++] = this.A[this.ai++]; else this.items[this.k++] = this.B[this.bi++]; result = undefined; }
                if (this.ai < this.A.length && this.bi < this.B.length) return [this.A[this.ai], this.B[this.bi]];
                while (this.ai < this.A.length) this.items[this.k++] = this.A[this.ai++]; while (this.bi < this.B.length) this.items[this.k++] = this.B[this.bi++];
                let m = { start: this.runStack[this.mergeIdx].start, len: this.runStack[this.mergeIdx].len + this.runStack[this.mergeIdx+1].len };
                this.runStack.splice(this.mergeIdx, 2, m); this.state = (this.idx === this.n) ? 'force_collapse' : 'collapse'; continue;
            }
        }
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

class TriplePivotQuicksortProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') {
                if (this.stack.length === 0) { this.state = 'done'; return null; }
                [this.l, this.r] = this.stack.pop();
                if (this.r - this.l < 3) { if (this.r > this.l) { this.state = 'insStart'; this.iI = this.l + 1; this.iJ = this.l; } continue; }
                this.pS = 0; this.state = 'pivots';
            }
            if (this.state === 'insStart') {
                if (this.iI <= this.r) { this.iTemp = this.items[this.iI]; this.iJ = this.iI - 1; this.state = 'insCompare'; continue; }
                this.state = 'start'; continue;
            }
            if (this.state === 'insCompare') {
                if (this.iJ >= this.l) {
                    if (result !== undefined) {
                        if (result === 1) { [this.items[this.iJ+1], this.items[this.iJ]] = [this.items[this.iJ], this.items[this.iJ+1]]; this.iJ--; result = undefined; }
                        else { this.items[this.iJ+1] = this.iTemp; this.iI++; this.state = 'insStart'; result = undefined; continue; }
                    } else return [this.items[this.iJ], this.iTemp];
                    continue;
                }
                this.items[this.iJ+1] = this.iTemp; this.iI++; this.state = 'insStart'; continue;
            }
            if (this.state === 'pivots') {
                let a = this.l, b = this.l+1, c = this.r;
                if (this.pS === 0) { if (result !== undefined) { if (result === 1) [this.items[a], this.items[b]] = [this.items[b], this.items[a]]; this.pS=1; result=undefined; } else return [this.items[a], this.items[b]]; }
                if (this.pS === 1) { if (result !== undefined) { if (result === 1) [this.items[a], this.items[c]] = [this.items[c], this.items[a]]; this.pS=2; result=undefined; } else return [this.items[a], this.items[c]]; }
                if (this.pS === 2) { if (result !== undefined) { if (result === 1) [this.items[b], this.items[c]] = [this.items[c], this.items[b]]; this.pS=3; result=undefined; } else return [this.items[b], this.items[c]]; }
                if (this.pS === 3) {
                    this.p1 = this.items[this.l]; this.p2 = this.items[this.l+1]; this.p3 = this.items[this.r];
                    this.i = this.l + 2; this.j = this.l + 2; this.k = this.r - 1;
                    this.state = 'partition'; this.sub = 'p1'; result = undefined;
                }
            }
            if (this.state === 'partition') {
                if (this.j <= this.k) {
                    if (this.sub === 'p1') {
                        if (result !== undefined) { if (result === 0) { [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]]; this.i++; this.j++; this.sub = 'p1'; result = undefined; } else this.sub = 'p2'; }
                        if (this.sub === 'p1' && this.j <= this.k) return [this.items[this.j], this.p1];
                    }
                    if (this.sub === 'p2') {
                        if (result !== undefined) { if (result === 0) { this.j++; this.sub = 'p1'; result = undefined; } else this.sub = 'p3'; }
                        if (this.sub === 'p2' && this.j <= this.k) return [this.items[this.j], this.p2];
                    }
                    if (this.sub === 'p3') {
                        if (result !== undefined) { if (result === 1) { [this.items[this.k], this.items[this.j]] = [this.items[this.j], this.items[this.k]]; this.k--; this.sub = 'p1'; result = undefined; } else { this.j++; this.sub = 'p1'; result = undefined; } }
                        if (this.sub === 'p3' && this.j <= this.k) return [this.items[this.j], this.p3];
                    }
                    continue;
                }
                [this.items[this.l+1], this.items[this.i-1]] = [this.items[this.i-1], this.items[this.l+1]];
                [this.items[this.l], this.items[this.i-2]] = [this.items[this.i-2], this.items[this.l]];
                [this.items[this.r], this.items[this.k+1]] = [this.items[this.k+1], this.items[this.r]];
                this.stack.push([this.k + 2, this.r], [this.j, this.k], [this.i, this.j - 1], [this.l, this.i - 3]);
                this.state = 'start'; this.sub = undefined;
            }
        } return null;
    }
}

class MergeSort3WayProvider extends KWayMergeSortProvider { constructor(n) { super(n, 3); } }

class MergeSort4WayProvider extends KWayMergeSortProvider { constructor(n) { super(n, 4); } }

const algos = [
    { name: 'Recursive Bubble', class: RecursiveBubbleSortProvider },
    { name: 'Recursive Insertion', class: RecursiveInsertionSortProvider },
    { name: 'Recursive Selection', class: RecursiveSelectionSortProvider },
    { name: 'Recursive Cocktail', class: RecursiveCocktailSortProvider },
    { name: 'Recursive Gnome', class: RecursiveGnomeSortProvider },
    { name: 'Recursive Binary Insertion', class: RecursiveBinaryInsertionSortProvider },
    { name: 'Recursive Double Selection', class: RecursiveDoubleSelectionSortProvider },
    { name: 'Recursive Shellsort', class: RecursiveShellSortProvider },
    { name: 'Recursive Comb Sort', class: RecursiveCombSortProvider },
    { name: 'Recursive Odd-Even Sort', class: RecursiveOddEvenSortProvider },
    { name: 'Ford-Johnson', class: FJProvider },
    { name: 'Merge Sort', class: MergeSortProvider },
    { name: 'Bottom-up Merge Sort', class: BottomUpMergeSortProvider },
    { name: 'Natural Merge Sort', class: NaturalMergeSortProvider },
    { name: 'Ping-pong Merge Sort', class: PingPongMergeSortProvider },
    { name: '3-way Merge Sort', class: MergeSort3WayProvider },
    { name: '4-way Merge Sort', class: MergeSort4WayProvider },
    { name: 'In-place Merge Sort', class: InPlaceMergeSortProvider },
    { name: 'Rotation Merge Sort', class: RotationMergeSortProvider },
    { name: 'Timsort', class: TimsortProvider },
    { name: 'Powersort', class: PowersortProvider },
    { name: 'Parallel Merge Sort', class: ParallelMergeSortProvider },
    { name: 'Hayate-Shiki', class: HayateShikiProvider },
    { name: 'Shellsort', class: ShellSortProvider },
    { name: 'Quicksort (RTL)', class: QuicksortRTLProvider },
    { name: 'Radix Sort', class: RadixSortProvider },
    { name: 'Quicksort (LTR)', class: QuicksortLTRProvider },
    { name: 'Quicksort (Random)', class: QuicksortRandomProvider },
    { name: 'Quicksort (Middle)', class: QuicksortMiddleProvider },
    { name: 'Quicksort (Mo3)', class: QuicksortMo3Provider },
    { name: 'Quicksort (Ninther)', class: QuicksortNintherProvider },
    { name: 'Quicksort (Hoare)', class: QuicksortHoareProvider },
    { name: '3-Way Quicksort', class: Quicksort3WayProvider },
    { name: 'Dual-Pivot Quicksort', class: DualPivotQuicksortProvider },
    { name: 'Triple-Pivot Quicksort', class: TriplePivotQuicksortProvider },
    { name: 'Stable Quicksort', class: StableQuicksortProvider },
    { name: 'BlockQuicksort', class: BlockQuicksortProvider },
    { name: 'PDQSort', class: PDQSortProvider },
    { name: 'Parallel Quicksort', class: ParallelQuicksortProvider },
    { name: 'Bubble Sort', class: BubbleSortProvider },
    { name: 'Bucket Sort', class: BucketSortProvider },
    { name: 'Selection Sort', class: SelectionSortProvider },
    { name: 'Insertion Sort', class: InsertionSortProvider },
    { name: 'Binary Insertion', class: BinaryInsertionSortProvider },
    { name: 'Gnome Sort', class: GnomeSortProvider },
    { name: 'Stooge Sort', class: StoogeSortProvider },
    { name: 'Bogosort', class: BogosortProvider },
    { name: 'Full Rank', class: FullRankProvider },
    { name: 'Cycle Sort', class: CycleSortProvider },
    { name: 'Bitonic Sort', class: BitonicSortProvider },
    { name: 'Heap Sort', class: HeapSortProvider },
    { name: 'Comb Sort', class: CombSortProvider },
    { name: 'Tournament Sort', class: TournamentSortProvider },
    { name: 'Odd-Even Sort', class: OddEvenSortProvider },
    { name: 'Slowsort', class: SlowsortProvider },
    { name: 'Pancake Sort', class: PancakeSortProvider },
    { name: 'Cocktail Shaker', class: CocktailShakerProvider },
    { name: 'Tree Sort', class: TreeSortProvider },
    { name: 'BogoBogoSort', class: BogoBogoSortProvider },
    { name: 'Stalin Sort', class: StalinSortProvider },
    { name: 'Thanos Sort', class: ThanosSortProvider },
    { name: 'Miracle Sort', class: MiracleSortProvider },
    { name: 'Intelligent Design', class: IntelligentDesignSortProvider },
    { name: 'Quantum Bogo', class: QuantumBogoSortProvider },
    { name: 'Intro Sort', class: IntroSortProvider },
    { name: 'Strand Sort', class: StrandSortProvider },
    { name: 'Patience Sort', class: PatienceSortProvider },
    { name: 'Smooth Sort', class: SmoothSortProvider },
    { name: 'Circle Sort', class: CircleSortProvider },
    { name: 'Double Selection', class: DoubleSelectionSortProvider },
    { name: 'Cocktail Selection', class: CocktailSelectionSortProvider },
    { name: 'Socialist Sort', class: SocialistSortProvider },
    { name: 'Genghis Khan Sort', class: GenghisKhanSortProvider },
    { name: 'Hater Sort', class: HaterSortProvider },
    { name: 'Exit Sort', class: ExitSortProvider },
    { name: 'Random Sort', class: RandomSortProvider },
    { name: 'Silly Sort', class: SillySortProvider },
    { name: 'Sleep Sort', class: SleepSortProvider }
];


const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
if (isMainThread) {
    const args = process.argv.slice(2);
    const n_val = args[0] ? parseInt(args[0]) : 100;
    const trials_val = args[1] ? parseInt(args[1]) : 250;
    const numWorkers = require('os').cpus().length || 4;
    const itemsPerWorker = Math.ceil(algos.length / numWorkers);
    console.log(`Simulating N=${n_val}, trials=${trials_val} with ${numWorkers} workers\nAlgorithm\tAvg Battles\tAvg Kendall Tau\tDuplicates`);
    let completed = 0;
    for (let i = 0; i < numWorkers; i++) {
        const start = i * itemsPerWorker;
        const end = Math.min(start + itemsPerWorker, algos.length);
        if (start >= end) continue;
        const workerAlgos = algos.slice(start, end).map(a => ({ name: a.name, className: a.class.name }));
        const worker = new Worker(__filename, { workerData: { workerAlgos, n: n_val, trials: trials_val } });
        worker.on('message', (res) => {
            console.log(`${res.name}\t${res.avgComps.toFixed(2)}\t${res.avgTau.toFixed(4)}\t${res.hasDuplicates ? "YES" : "NO"}`);
        });
        worker.on('exit', () => {
            completed++;
            if (completed === numWorkers) process.exit(0);
        });
    }
} else {
    const { workerAlgos, n, trials } = workerData;
    for (const algo of workerAlgos) {
        try {
            const Cls = eval(algo.className);
            const res = simulate(n, Cls, trials);
            parentPort.postMessage({ name: algo.name, ...res });
        } catch (e) {
            parentPort.postMessage({ name: algo.name, avgComps: 0, avgTau: 0, hasDuplicates: false, error: e.message });
        }
    }
}
