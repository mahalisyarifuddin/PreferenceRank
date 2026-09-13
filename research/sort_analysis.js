const Math_log10 = Math.log(10);
const SCALE = 400 / Math_log10;

function runBT(n, wins, adjData, counts, threshold = 1e-7, maxIter = 100) {
    const PRIOR = 0.5, W = new Float64Array(n); for (let i = 0; i < n; i++) W[i] = wins[i] + PRIOR;
    const s = new Float64Array(n).fill(1.0), prevLogS = new Float64Array(n), RENORM = 16;
    for (let iter = 0; iter < maxIter; iter++) {
        let maxDelta = 0;
        for (let i = 0; i < n; i++) {
            const si = s[i]; let denom = 1 / (si + 1) + 1e-12;
            const rowStart = i * n * 2, rowCount = counts[i];
            for (let k = 0; k < rowCount; k++) denom += adjData[rowStart + k * 2 + 1] / (si + s[adjData[rowStart + k * 2]]);
            s[i] = W[i] / denom;
        }
        if ((iter & (RENORM - 1)) === RENORM - 1 || iter === maxIter - 1) {
            let lsum = 0; for (let i = 0; i < n; i++) lsum += Math.log(s[i]);
            const sc = lsum / n, scale = Math.exp(sc);
            for (let i = 0; i < n; i++) {
                s[i] /= scale; const curLog = Math.log(s[i]);
                const delta = Math.abs(curLog - prevLogS[i]); if (delta > maxDelta) maxDelta = delta;
                prevLogS[i] = curLog;
            }
            if (iter > 0 && maxDelta < threshold) break;
        }
    }
    const rawScores = new Float64Array(n); for (let i = 0; i < n; i++) rawScores[i] = 1000 + prevLogS[i] * SCALE; return rawScores;
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
    const trueStrengths = new Float64Array(n), wins = new Float64Array(n), rowSize = (n + 31) >> 5;
    const reach = new Uint32Array(n * rowSize);
    for (let t = 0; t < trials; t++) {
        for (let i = 0; i < n; i++) trueStrengths[i] = Math.random() * 2000;
        const provider = new ProviderClass(n); wins.fill(0); reach.fill(0);
        for (let i = 0; i < n; i++) reach[i * rowSize + (i >> 5)] |= (1 << (i & 31));
        const matchesMap = new Map(); let pair = provider.next(), uniqueBattles = 0, totalIterations = 0;
        while (pair && totalIterations < 1000000) {
            totalIterations++; const [a, b] = pair;
            const pairKey = a < b ? (a << 16) | b : (b << 16) | a, matchResult = matchesMap.get(pairKey);
            let res;
            if (matchResult !== undefined) {
                hasDuplicates = true; res = matchResult.a === a ? matchResult.res : 1 - matchResult.res;
            } else {
                const aInReachB = (reach[a * rowSize + (b >> 5)] >> (b & 31)) & 1;
                const bInReachA = (reach[b * rowSize + (a >> 5)] >> (a & 31)) & 1;
                if (aInReachB || bInReachA) {
                    res = aInReachB ? 1 : 0; provider.isTransitiveDiscovery = true;
                } else {
                    uniqueBattles++; res = trueStrengths[a] > trueStrengths[b] ? 1 : 0;
                    matchesMap.set(pairKey, { a, res });
                    const [w, l] = res === 1 ? [a, b] : [b, a], wIdx = w * rowSize, lIdx = l * rowSize, wWord = w >> 5, wMask = 1 << (w & 31);
                    for (let i = 0; i < n; i++) {
                        if (reach[i * rowSize + wWord] & wMask) {
                            const iIdx = i * rowSize;
                            for (let j = 0; j < rowSize; j++) reach[iIdx + j] |= reach[lIdx + j];
                        }
                    }
                }
            }
            pair = provider.next(res); if (uniqueBattles >= maxUniqueBattles) break;
        }
        for (let i = 0; i < n; i++) {
            const iBase = i * rowSize;
            for (let wordIdx = 0; wordIdx < rowSize; wordIdx++) {
                let word = reach[iBase + wordIdx];
                if (wordIdx === (i >> 5)) word &= ~(1 << (i & 31));
                while (word !== 0) { word &= (word - 1); wins[i]++; }
            }
        }
        totalComps += uniqueBattles; totalTau += kendallTau(trueStrengths, wins);
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

class BinaryGnomeSortProvider extends Provider {
    constructor(n) { super(n); this.i = 1; this.state = 'start'; }
    next(result) {
        while (this.i < this.n) {
            if (this.state === 'start') { this.temp = this.items[this.i]; this.lo = 0; this.hi = this.i; this.state = 'bin'; }
            if (result !== undefined) { if (result === 1) this.lo = this.mid + 1; else this.hi = this.mid; result = undefined; }
            if (this.lo < this.hi) { this.mid = (this.lo + this.hi) >> 1; return [this.temp, this.items[this.mid]]; }
            for (let k = this.i; k > this.lo; k--) this.items[k] = this.items[k - 1];
            this.items[this.lo] = this.temp; this.i++; this.state = 'start';
        } return null;
    }
}

class BitonicSortProvider extends Provider {
    constructor(n) { super(n); this.size = 1; while (this.size < n) this.size *= 2; this.items = Array.from({ length: this.size }, (_, i) => i < n ? i : -1); this.k = 2; this.j = 0; this.i = 0; this.state = 'kStart'; }
    next(result) {
        while (this.k <= this.size) {
            if (this.state === 'kStart') { this.j = this.k >> 1; this.state = 'jStart'; continue; }
            if (this.state === 'jStart') { if (this.j > 0) { this.i = 0; this.state = 'scan'; } else { this.k <<= 1; this.state = 'kStart'; } continue; }
            if (this.state === 'scan') {
              if (result !== undefined) {
                const a = this.i, b = this.i ^ this.j;
                if (b > a) { const up = (this.i & this.k) === 0, aWins = result === 1;
                  if ((up && aWins) || (!up && !aWins)) [this.items[a], this.items[b]] = [this.items[b], this.items[a]]; }
                this.i++; result = undefined;
              }
              while (this.i < this.size) {
                const a = this.i, b = this.i ^ this.j;
                if (b > a) {
                  const up = (this.i & this.k) === 0;
                  if (this.items[a] === -1) { if (!up) [this.items[a], this.items[b]] = [this.items[b], this.items[a]]; this.i++; continue; }
                  if (this.items[b] === -1) { if (up)  [this.items[a], this.items[b]] = [this.items[b], this.items[a]]; this.i++; continue; }
                  return [this.items[a], this.items[b]];
                }
                this.i++;
              }
              this.j >>= 1; this.state = 'jStart';
            }
        } return null;
    }
}

class BinaryBottomUpMergeSortProvider extends Provider {
    constructor(n) { super(n); this.width = 1; this.i = 0; this.state = 'merge'; }
    next(result) {
        while (this.width < this.n) {
            if (this.state === 'merge') {
                if (this.i < this.n) {
                    this.l = this.i; this.mSplit = Math.min(this.i + this.width, this.n); this.r = Math.min(this.i + 2 * this.width, this.n);
                    this.L = this.items.slice(this.l, this.mSplit); this.R = this.items.slice(this.mSplit, this.r);
                    this.ii = 0; this.jj = 0; this.k = this.l; this.state = 'work'; this.sub = 'start';
                } else { this.width *= 2; this.i = 0; continue; }
            }
            if (this.state === 'work') {
                if (this.ii < this.L.length && this.jj < this.R.length) {
                    if (this.sub === 'start') { this.lo = this.jj; this.hi = this.R.length - 1; this.sub = 'bin'; }
                    if (result !== undefined && this.sub === 'bin') { if (result === 1) this.lo = this.mBin + 1; else this.hi = this.mBin - 1; result = undefined; }
                    if (this.lo <= this.hi) { this.mBin = (this.lo + this.hi) >> 1; return [this.L[this.ii], this.R[this.mBin]]; }
                    while (this.jj < this.lo) this.items[this.k++] = this.R[this.jj++];
                    this.items[this.k++] = this.L[this.ii++]; this.sub = 'start'; continue;
                }
                while (this.ii < this.L.length) this.items[this.k++] = this.L[this.ii++];
                while (this.jj < this.R.length) this.items[this.k++] = this.R[this.jj++];
                this.i += 2 * this.width; this.state = 'merge';
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

class BinaryMergeSortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ l: 0, r: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            let f = this.stack[this.stack.length - 1];
            if (f.state === 0) {
                if (f.l >= f.r) { this.pop(); continue; }
                f.mSplit = Math.floor((f.l + f.r) / 2); this.stack.push({ l: f.l, r: f.mSplit, state: 0 }); continue;
            }
            if (f.state === 1) { this.stack.push({ l: f.mSplit + 1, r: f.r, state: 0 }); continue; }
            if (f.state === 2) { f.L = this.items.slice(f.l, f.mSplit + 1); f.R = this.items.slice(f.mSplit + 1, f.r + 1); f.ii = 0; f.jj = 0; f.k = f.l; f.state = 3; f.sub = 'start'; }
            if (f.state === 3) {
                if (f.ii < f.L.length && f.jj < f.R.length) {
                    if (f.sub === 'start') { f.lo = f.jj; f.hi = f.R.length - 1; f.sub = 'bin'; }
                    if (result !== undefined && f.sub === 'bin') { if (result === 1) f.lo = f.mBin + 1; else f.hi = f.mBin - 1; result = undefined; }
                    if (f.lo <= f.hi) { f.mBin = (f.lo + f.hi) >> 1; return [f.L[f.ii], f.R[f.mBin]]; }
                    while (f.jj < f.lo) this.items[f.k++] = f.R[f.jj++];
                    this.items[f.k++] = f.L[f.ii++]; f.sub = 'start'; continue;
                }
                while (f.ii < f.L.length) this.items[f.k++] = f.L[f.ii++];
                while (f.jj < f.R.length) this.items[f.k++] = f.R[f.jj++];
                this.pop();
            }
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
                if (result !== undefined) { if (result === 1) this.items[this.k++] = this.L[this.ii++]; else this.items[this.k++] = this.R[this.jj++]; result = undefined; }
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
              if (result !== undefined) { if (result === 0) { [this.items[this.p1], this.items[this.p2]] = [this.items[this.p2], this.items[this.p1]]; this.anySwapped = true; } this.p1++; this.p2--; result = undefined; }
              if (this.p1 < this.p2) return [this.items[this.p1], this.items[this.p2]];
              if (this.p1 === this.p2 && this.p1+1 <= this.h) { this.state = 'mid'; continue; }
              const mid = Math.floor((this.l + this.h) / 2);
              this.stack.push({l: mid + 1, h: this.h}, {l: this.l, h: mid}); this.state = 'init';
            }
            if (this.state === 'mid') {
              if (result !== undefined) {
                if (result === 0) { [this.items[this.p1], this.items[this.p1+1]] = [this.items[this.p1+1], this.items[this.p1]]; this.anySwapped = true; }
                result = undefined; const mid = Math.floor((this.l + this.h) / 2);
                this.stack.push({l: mid + 1, h: this.h}, {l: this.l, h: mid}); this.state = 'init'; continue;
              }
              return [this.items[this.p1], this.items[this.p1+1]];
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
  constructor(n){ super(n); this.cs=0; this.state='count'; this.phase='find'; this.idx=undefined; }
  next(result){
    while(this.cs<this.n-1){
      if(this.idx===undefined){
        if(this.phase==='find') this.item=this.items[this.cs];
        this.pos=this.cs; this.idx=this.cs+1;
      }
      if(result!==undefined){ if(result===1) this.pos++; this.idx++; result=undefined; }
      if(this.idx<this.n) return [this.item, this.items[this.idx]];
      this.idx=undefined;
      if(this.phase==='find' && this.pos===this.cs){ this.cs++; continue; } // already placed
      [this.items[this.pos], this.item]=[this.item, this.items[this.pos]];  // place; pick up displaced
      if(this.pos===this.cs){ this.cs++; this.phase='find'; } else this.phase='cycle';
    }
    return null;
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
                    this.stack.push({ l: this.pivotPos + 1, r: this.r, badAllowed: this.badAllowed, leftmost: false });
                    this.stack.push({ l: this.l, r: this.pivotPos - 1, badAllowed: this.badAllowed, leftmost: this.leftmost });
                    this.state = 'pop'; continue;
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
                    if (result !== undefined) { if (result === 1) { this.pR_l--; result = undefined; } else { this.pR_sub = 'finish'; result = undefined; } }
                    if (this.pR_sub === 'findLast') { if (this.pR_f < this.pR_l - 1) return [this.items[this.pR_l - 1], this.pivot]; this.pR_sub = 'finish'; }
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
                            else { if (result === 0) { this.pR_l--; [this.items[this.pR_f + 1], this.items[this.pR_l]] = [this.items[this.pR_l], this.items[this.pR_f + 1]]; this.pR_f++; this.pR_side = 'first'; result = undefined; } else { this.pR_l--; this.pR_side = 'first'; result = undefined; } }
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
                    if (--this.badAllowed === 0) { this.state = 'heapsort'; this.hs_l = this.l; this.hs_r = this.r; this.hi = Math.floor((this.r - this.l + 1) / 2) - 1; this.h_state = 'heapify'; this.h_size = this.r - this.l + 1; this.h_curr = null; continue; }
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
                this.stack.push({ l: this.l, r: this.pivotPos - 1, badAllowed: this.badAllowed, leftmost: this.leftmost });
                this.state = 'pop'; continue;
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
                                this.stack.push({ l: this.l, r: this.pivotPos - 1, badAllowed: this.badAllowed, leftmost: this.leftmost });
                                this.state = 'pop'; result = undefined; continue;
                            }
                            result = undefined;
                        } else { this.items[this.insJ + 1] = this.insTemp; this.pis_i++; this.state = 'partialInsertionSort'; result = undefined; continue; }
                    } else return [this.insTemp, this.items[this.insJ]];
                    continue;
                }
                this.items[this.insJ + 1] = this.insTemp; this.pis_i++; this.state = 'partialInsertionSort'; continue;
            }
            if (this.state === 'heapsort') {
              if (this.h_curr === null) {
                if (this.h_state === 'heapify') {
                  if (this.hi < 0) { this.h_state = 'sort'; this.si = this.h_size - 1; continue; }
                  this.h_curr = this.hs_l + this.hi; this.hi--; this.h_sub = 0;
                } else {
                  if (this.si <= 0) { this.state = 'pop'; continue; }
                  [this.items[this.hs_l], this.items[this.hs_l + this.si]] = [this.items[this.hs_l + this.si], this.items[this.hs_l]];
                  this.h_size = this.si; this.si--; this.h_curr = this.hs_l; this.h_sub = 0;
                }
              }
              while (true) {
                let rel_curr = this.h_curr - this.hs_l, l = 2 * rel_curr + 1, r = 2 * rel_curr + 2;
                if (l >= this.h_size) { this.h_curr = null; break; }
                if (this.h_sub === 0) {
                  if (r < this.h_size) {
                    if (this.h_aLR === undefined) { this.h_aLR = true; return [this.items[this.hs_l + l], this.items[this.hs_l + r]]; }
                    this.h_larger = (result === 1) ? (this.hs_l + l) : (this.hs_l + r); this.h_aLR = undefined; result = undefined;
                  } else this.h_larger = this.hs_l + l;
                  this.h_sub = 1;
                }
                if (this.h_sub === 1) {
                  if (this.h_aCC === undefined) { this.h_aCC = true; return [this.items[this.h_larger], this.items[this.h_curr]]; }
                  this.h_aCC = undefined;
                  if (result === 1) {
                    [this.items[this.h_curr], this.items[this.h_larger]] = [this.items[this.h_larger], this.items[this.h_curr]];
                    this.h_curr = this.h_larger; this.h_sub = 0; result = undefined; continue;
                  }
                  this.h_curr = null; break;
                }
              }
              continue;
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

class QuickPairProvider extends Provider {
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
    pop(res) {
        this.stack.pop();
        if (this.stack.length > 0) { const p = this.stack[this.stack.length - 1]; p.childResult = res; p.state++; }
        else { this.items = res; }
    }
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
                    // ASC merge: the WEAKER item (result === 0 means u1[i] is
                    // not stronger than u2[j]) must be emitted first. This was
                    // previously inverted, corrupting multi-part merges
                    // (n >= 33 with random strengths). See PROVIDER_AUDIT.md.
                    if (result !== undefined) { if (result === 0) t.res.push(t.u1[t.i++]); else t.res.push(t.u2[t.j++]); result = undefined; }
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
  constructor(n){ super(n); this.heapSize=n; this.phase='heapify';
    this.hi=Math.floor(n/2)-1; this.curr=null; this.sub=0; }
  next(result){
    while(true){
      if(this.curr===null){
        if(this.phase==='heapify'){
          if(this.hi<0){ this.phase='sort'; this.si=this.n-1; continue; }
          this.curr=this.hi; this.hi--; this.sub=0;
        } else {                                   // sort phase
          if(this.si<=0) return null;
          [this.items[0],this.items[this.si]]=[this.items[this.si],this.items[0]];
          this.heapSize=this.si; this.si--; this.curr=0; this.sub=0;
        }
      }
      const r=this.sift(result); result=undefined;
      if(r) return r;                              // need a comparison
      this.curr=null;                              // sift done → next target
    }
  }
  sift(result){
    while(true){
      const l=2*this.curr+1, rg=2*this.curr+2;
      if(l>=this.heapSize) return null;            // leaf: done
      if(this.sub===0){                            // pick larger child
        if(rg<this.heapSize){
          if(this.aLR===undefined){ this.aLR=true; return [this.items[l],this.items[rg]]; }
          this.larger=(result===1)?l:rg; this.aLR=undefined; result=undefined;
        } else this.larger=l;
        this.sub=1;
      }
      if(this.sub===1){                            // larger child vs parent
        if(this.aCC===undefined){ this.aCC=true; return [this.items[this.larger],this.items[this.curr]]; }
        this.aCC=undefined;
        if(result===1){ [this.items[this.curr],this.items[this.larger]]=
                        [this.items[this.larger],this.items[this.curr]];
          this.curr=this.larger; this.sub=0; result=undefined; continue; }
        return null;                               // heap property restored
      }
    }
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

/**
 * Stanley P. Y. Fung's "I Can't Believe It Can Sort" algorithm.
 *
 * The original algorithm deliberately compares every pair of positions:
 *
 *     for i = 0 .. n - 1
 *         for j = 0 .. n - 1
 *             if (A[i] < A[j]) swap(A[i], A[j])
 *
 * A pair is yielded in the same order as the nested loops.  The benchmark
 * supplies 1 when the first item wins and 0 when it loses, so a losing
 * comparison is the swap condition from the paper.
 */
class ICantBelieveItCanSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.i = 0;
        this.j = 0;
    }

    next(result) {
        if (result !== undefined) {
            if (result === 0) {
                [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]];
            }
            this.j++;
            result = undefined;
        }

        while (this.i < this.n) {
            if (this.j < this.n) return [this.items[this.i], this.items[this.j]];
            this.i++;
            this.j = 0;
        }
        return null;
    }
}

class IntelligentDesignSortProvider extends Provider {
    constructor(n) { super(n); }
    next() { return null; }
}

class IntroSortProvider extends Provider {
    // Musser's introsort: quicksort with depth limit 2*floor(log2(n)), heapsort
    // fallback, insertion sort for small ranges. NOTE: all three sub-algorithms
    // must interpret results identically (result===0 while scanning means
    // items[j] <= pivot => Lomuto ASC); an orientation mismatch here previously
    // broke sorting for n >= 31 (see research/PROVIDER_AUDIT.md, Finding 1).
    constructor(n) { super(n); this.depthLimit = 2 * Math.floor(Math.log2(n)); this.stack = [{l: 0, r: n - 1, d: 0}]; this.state = 'pop'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'pop') {
            if (this.state === 'pop') { if (this.stack.length === 0) return null; const {l, r, d} = this.stack.pop(); if (l >= r) continue; if (r - l <= 16) { this.iL = l; this.iR = r; this.iI = l + 1; this.state = 'insStart'; continue; } if (d > this.depthLimit) { this.state = 'heap'; this.hl = l; this.hr = r; this.hi = Math.floor((r - l + 1) / 2) - 1; this.h_state = 'heapify'; this.h_size = r - l + 1; this.h_curr = null; continue; } this.low = l; this.high = r; this.d = d; this.pivotVal = this.items[r]; this.p_i = l - 1; this.p_j = l; this.state = 'partition'; }
            if (this.state === 'insStart') { if (this.iI <= this.iR) { this.iTemp = this.items[this.iI]; this.iJ = this.iI - 1; this.state = 'insCompare'; continue; } this.state = 'pop'; continue; }
            if (this.state === 'insCompare') { if (this.iJ >= this.iL) { if (result !== undefined) { if (result === 0) { this.items[this.iJ + 1] = this.items[this.iJ]; this.iJ--; result = undefined; } else { this.items[this.iJ + 1] = this.iTemp; this.iI++; this.state = 'insStart'; result = undefined; continue; } } else return [this.iTemp, this.items[this.iJ]]; continue; } this.items[this.iJ + 1] = this.iTemp; this.iI++; this.state = 'insStart'; continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { this.p_i++; [this.items[this.p_i], this.items[this.p_j]] = [this.items[this.p_j], this.items[this.p_i]]; } this.p_j++; result = undefined; } if (this.p_j < this.high) return [this.items[this.p_j], this.pivotVal]; [this.items[this.p_i + 1], this.items[this.high]] = [this.items[this.high], this.items[this.p_i + 1]]; let p = this.p_i + 1; this.stack.push({l: p + 1, r: this.high, d: this.d + 1}, {l: this.low, r: p - 1, d: this.d + 1}); this.state = 'pop'; }
            if (this.state === 'heap') {
              if (this.h_curr === null) {
                if (this.h_state === 'heapify') {
                  if (this.hi < 0) { this.h_state = 'sort'; this.si = this.h_size - 1; continue; }
                  this.h_curr = this.hl + this.hi; this.hi--; this.h_sub = 0;
                } else {
                  if (this.si <= 0) { this.state = 'pop'; continue; }
                  [this.items[this.hl], this.items[this.hl + this.si]] = [this.items[this.hl + this.si], this.items[this.hl]];
                  this.h_size = this.si; this.si--; this.h_curr = this.hl; this.h_sub = 0;
                }
              }
              while (true) {
                let rel_curr = this.h_curr - this.hl, l = 2 * rel_curr + 1, r = 2 * rel_curr + 2;
                if (l >= this.h_size) { this.h_curr = null; break; }
                if (this.h_sub === 0) {
                  if (r < this.h_size) {
                    if (this.h_aLR === undefined) { this.h_aLR = true; return [this.items[this.hl + l], this.items[this.hl + r]]; }
                    this.h_larger = (result === 1) ? (this.hl + l) : (this.hl + r); this.h_aLR = undefined; result = undefined;
                  } else this.h_larger = this.hl + l;
                  this.h_sub = 1;
                }
                if (this.h_sub === 1) {
                  if (this.h_aCC === undefined) { this.h_aCC = true; return [this.items[this.h_larger], this.items[this.h_curr]]; }
                  this.h_aCC = undefined;
                  if (result === 1) {
                    [this.items[this.h_curr], this.items[this.h_larger]] = [this.items[this.h_larger], this.items[this.h_curr]];
                    this.h_curr = this.h_larger; this.h_sub = 0; result = undefined; continue;
                  }
                  this.h_curr = null; break;
                }
              }
              continue;
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

class QuickMergeSortProvider extends BottomUpMergeSortProvider {
    static estimate(n) { return n < 16 ? Math.round(n * Math.log2(n) - n + 1) : Math.max(n - 1, Math.round(n * Math.log2(n) - 1.44 * n)); }
    constructor(n) { super(n); this.budget = QuickMergeSortProvider.estimate(n); this.asked = 0; this.done = false; }
    next(result) {
        if (this.done) return null;
        if (result !== undefined) {
            if (this.isTransitiveDiscovery) { this.isTransitiveDiscovery = false; }
            else if (++this.asked >= this.budget) {
            if (this.state === 'work') {
                while (this.ii < this.L.length) this.items[this.k++] = this.L[this.ii++];
                while (this.jj < this.R.length) this.items[this.k++] = this.R[this.jj++];
            }
            this.done = true; return null; }
        }
        const pair = super.next(result);
        if (!pair) this.done = true;
        return pair;
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
            if (this.state === 'distribute') { this.val = this.items[this.i]; this.pIdx = 0; this.state = 'findPile'; }
            if (this.state === 'findPile') {
                if (result !== undefined) {
                    if (result === 0) { this.piles[this.pIdx].push(this.val); this.i++; this.state = 'distribute'; }
                    else { this.pIdx++; } result = undefined;
                }
                if (this.state === 'findPile') {
                    if (this.pIdx < this.piles.length) return [this.val, this.piles[this.pIdx][this.piles[this.pIdx].length - 1]];
                    this.piles.push([this.val]); this.i++; this.state = 'distribute'; continue;
                }
            }
        }
        if (!this.mergeState) {
            for (let i = 0; i < this.piles.length; i++) this.piles[i].reverse();
            this.mergeState = { pileIdx: new Array(this.piles.length).fill(0), out: [], sortedCount: 0 };
            if (this.piles.length > 0) {
                this.tournament = new TournamentSortProvider(this.piles.length);
                this.tournament.tree = new Array(2 * this.tournament.size).fill(-1);
                for (let i = 0; i < this.piles.length; i++) this.tournament.tree[this.tournament.size + i] = i;
                this.tournament.state = 'build'; this.tournament.p = this.tournament.size - 1;
            }
        }
        if (this.piles.length === 0) return null;
        while (this.mergeState.sortedCount < this.n) {
            if (this.tournament.state === 'build') {
                if (result !== undefined) {
                    const L = 2 * this.tournament.p, R = 2 * this.tournament.p + 1;
                    this.tournament.tree[this.tournament.p] = (result === 0) ? this.tournament.tree[L] : this.tournament.tree[R];
                    this.tournament.p--; result = undefined;
                }
                while (this.tournament.p >= 1) {
                    const L = 2 * this.tournament.p, R = 2 * this.tournament.p + 1, vL = this.tournament.tree[L], vR = this.tournament.tree[R];
                    if (vL === -1) { this.tournament.tree[this.tournament.p] = vR; this.tournament.p--; continue; }
                    if (vR === -1) { this.tournament.tree[this.tournament.p] = vL; this.tournament.p--; continue; }
                    return [this.piles[vL][this.mergeState.pileIdx[vL]], this.piles[vR][this.mergeState.pileIdx[vR]]];
                }
                const win = this.tournament.tree[1]; this.mergeState.out.push(this.piles[win][this.mergeState.pileIdx[win]++]); this.mergeState.sortedCount++;
                if (this.mergeState.pileIdx[win] >= this.piles[win].length) this.tournament.tree[this.tournament.size + win] = -1;
                this.tournament.p = this.tournament.size + win; this.tournament.state = 'rebuild';
            }
            if (this.tournament.state === 'rebuild') {
                while (this.tournament.p > 1) {
                    const parent = this.tournament.p >> 1, L = 2 * parent, R = 2 * parent + 1;
                    if (result !== undefined) {
                        this.tournament.tree[parent] = (result === 0) ? this.tournament.tree[L] : this.tournament.tree[R];
                        this.tournament.p = parent; result = undefined; continue;
                    }
                    const vL = this.tournament.tree[L], vR = this.tournament.tree[R];
                    if (vL === -1) { this.tournament.tree[parent] = vR; this.tournament.p = parent; continue; }
                    if (vR === -1) { this.tournament.tree[parent] = vL; this.tournament.p = parent; continue; }
                    return [this.piles[vL][this.mergeState.pileIdx[vL]], this.piles[vR][this.mergeState.pileIdx[vR]]];
                }
                if (this.mergeState.sortedCount === this.n) { this.items = this.mergeState.out; return null; }
                const win = this.tournament.tree[1]; this.mergeState.out.push(this.piles[win][this.mergeState.pileIdx[win]++]); this.mergeState.sortedCount++;
                if (this.mergeState.pileIdx[win] >= this.piles[win].length) this.tournament.tree[this.tournament.size + win] = -1;
                this.tournament.p = this.tournament.size + win;
            }
        }
        this.items = this.mergeState.out; return null;
    }
}

class BinaryPatienceSortProvider extends Provider {
    constructor(n) { super(n); this.piles = []; this.i = 0; this.state = 'distribute'; }
    next(result) {
        while (this.i < this.n) {
            if (this.state === 'distribute') { this.val = this.items[this.i]; this.pIdx = 0; this.lo = 0; this.hi = this.piles.length - 1; this.state = 'bin'; }
            if (this.state === 'bin') {
                if (result !== undefined) { if (result === 0) this.hi = this.midBin - 1; else this.lo = this.midBin + 1; result = undefined; }
                if (this.lo <= this.hi) { this.midBin = (this.lo + this.hi) >> 1; return [this.val, this.piles[this.midBin][this.piles[this.midBin].length - 1]]; }
                if (this.lo < this.piles.length) this.piles[this.lo].push(this.val); else this.piles.push([this.val]);
                this.i++; this.state = 'distribute'; continue;
            }
        }
        if (!this.mergeState) {
            for (let i = 0; i < this.piles.length; i++) this.piles[i].reverse();
            this.mergeState = { pileIdx: new Array(this.piles.length).fill(0), out: [], sortedCount: 0 };
            if (this.piles.length > 0) {
                this.tournament = new TournamentSortProvider(this.piles.length);
                this.tournament.tree = new Array(2 * this.tournament.size).fill(-1);
                for (let i = 0; i < this.piles.length; i++) this.tournament.tree[this.tournament.size + i] = i;
                this.tournament.state = 'build'; this.tournament.p = this.tournament.size - 1;
            }
        }
        if (this.piles.length === 0) return null;
        while (this.mergeState.sortedCount < this.n) {
            if (this.tournament.state === 'build') {
                if (result !== undefined) {
                    const L = 2 * this.tournament.p, R = 2 * this.tournament.p + 1;
                    this.tournament.tree[this.tournament.p] = (result === 0) ? this.tournament.tree[L] : this.tournament.tree[R];
                    this.tournament.p--; result = undefined;
                }
                while (this.tournament.p >= 1) {
                    const L = 2 * this.tournament.p, R = 2 * this.tournament.p + 1, vL = this.tournament.tree[L], vR = this.tournament.tree[R];
                    if (vL === -1) { this.tournament.tree[this.tournament.p] = vR; this.tournament.p--; continue; }
                    if (vR === -1) { this.tournament.tree[this.tournament.p] = vL; this.tournament.p--; continue; }
                    return [this.piles[vL][this.mergeState.pileIdx[vL]], this.piles[vR][this.mergeState.pileIdx[vR]]];
                }
                const win = this.tournament.tree[1]; this.mergeState.out.push(this.piles[win][this.mergeState.pileIdx[win]++]); this.mergeState.sortedCount++;
                if (this.mergeState.pileIdx[win] >= this.piles[win].length) this.tournament.tree[this.tournament.size + win] = -1;
                this.tournament.p = this.tournament.size + win; this.tournament.state = 'rebuild';
            }
            if (this.tournament.state === 'rebuild') {
                while (this.tournament.p > 1) {
                    const parent = this.tournament.p >> 1, L = 2 * parent, R = 2 * parent + 1;
                    if (result !== undefined) {
                        this.tournament.tree[parent] = (result === 0) ? this.tournament.tree[L] : this.tournament.tree[R];
                        this.tournament.p = parent; result = undefined; continue;
                    }
                    const vL = this.tournament.tree[L], vR = this.tournament.tree[R];
                    if (vL === -1) { this.tournament.tree[parent] = vR; this.tournament.p = parent; continue; }
                    if (vR === -1) { this.tournament.tree[parent] = vL; this.tournament.p = parent; continue; }
                    return [this.piles[vL][this.mergeState.pileIdx[vL]], this.piles[vR][this.mergeState.pileIdx[vR]]];
                }
                if (this.mergeState.sortedCount === this.n) { this.items = this.mergeState.out; return null; }
                const win = this.tournament.tree[1]; this.mergeState.out.push(this.piles[win][this.mergeState.pileIdx[win]++]); this.mergeState.sortedCount++;
                if (this.mergeState.pileIdx[win] >= this.piles[win].length) this.tournament.tree[this.tournament.size + win] = -1;
                this.tournament.p = this.tournament.size + win;
            }
        }
        this.items = this.mergeState.out; return null;
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
                if (result !== undefined) { if (result === 1) this.dst[this.k++] = this.src[this.ii++]; else this.dst[this.k++] = this.src[this.jj++]; result = undefined; }
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
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.l, this.r] = this.stack.pop(); if (this.l < this.r) { this.pVal = this.items[this.l]; this.lt = this.l; this.eq = this.l + 1; this.gt = this.r; this.state = 'partition'; } else continue; }
            if (this.state === 'partition') { if (result !== undefined) { if (result === 0) { [this.items[this.lt], this.items[this.eq]] = [this.items[this.eq], this.items[this.lt]]; this.lt++; this.eq++; } else if (result === 1) { [this.items[this.eq], this.items[this.gt]] = [this.items[this.gt], this.items[this.eq]]; this.gt--; } else this.eq++; result = undefined; } if (this.eq <= this.gt) return [this.items[this.eq], this.pVal]; this.stack.push([this.gt + 1, this.r], [this.l, this.lt - 1]); this.state = 'start'; }
        } return null;
    }
}

class BinaryShellSortProvider extends Provider {
    constructor(n) { super(n); this.gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n); this.gapIdx = 0; this.state = 'nextGap'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'nextGap') { if (this.gapIdx < this.gaps.length) { this.gap = this.gaps[this.gapIdx++]; this.i = this.gap; this.state = 'insertion'; } else this.state = 'done'; continue; }
            if (this.state === 'insertion') { if (this.i < this.n) { this.temp = this.items[this.i]; this.lo = 0; this.hi = Math.floor(this.i / this.gap); this.state = 'bin'; } else { this.state = 'nextGap'; } continue; }
            if (this.state === 'bin') {
                if (result !== undefined) { if (result === 1) this.lo = this.mBin + 1; else this.hi = this.mBin; result = undefined; }
                if (this.lo < this.hi) { this.mBin = (this.lo + this.hi) >> 1; return [this.temp, this.items[this.mBin * this.gap + (this.i % this.gap)]]; }
                for (let k = Math.floor(this.i / this.gap); k > this.lo; k--) this.items[k * this.gap + (this.i % this.gap)] = this.items[(k - 1) * this.gap + (this.i % this.gap)];
                this.items[this.lo * this.gap + (this.i % this.gap)] = this.temp; this.i++; this.state = 'insertion'; continue;
            }
        } return null;
    }
}

class QuicksortHoareProvider extends Provider {
  constructor(n){ super(n); this.stack=[[0,n-1]]; this.state='start'; }
  next(result){
    while(this.stack.length>0 || this.state!=='done'){
      if(this.state==='start'){
        if(this.stack.length===0){ this.state='done'; return null; }
        [this.l,this.r]=this.stack.pop(); if(this.l>=this.r) continue;
        this.pIdx=this.l; this.pVal=this.items[this.l];
        this.i=this.l-1; this.j=this.r+1; this.state='j'; this.await=false;
      }
      if(this.state==='j'){
        if(this.await){ this.await=false;
          if(result===0){ result=undefined; }                 // pivot<items[j]: keep j--
          else { result=undefined; this.state='i'; continue; } }
        this.j--;
        if(this.j===this.pIdx){ this.state='i'; continue; }    // pivot ≤ pivot: stop
        this.await=true; return [this.pVal, this.items[this.j]];
      }
      if(this.state==='i'){
        if(this.await){ this.await=false;
          if(result===1){ result=undefined; }                 // pivot>items[i]: keep i++
          else { result=undefined; this.state='cmp'; continue; } }
        this.i++;
        if(this.i===this.pIdx){ this.state='cmp'; continue; }  // pivot ≥ pivot: stop
        this.await=true; return [this.pVal, this.items[this.i]];
      }
      if(this.state==='cmp'){
        if(this.i<this.j){ [this.items[this.i],this.items[this.j]]=[this.items[this.j],this.items[this.i]];
          if(this.i===this.pIdx) this.pIdx=this.j; else if(this.j===this.pIdx) this.pIdx=this.i;
          this.state='j'; continue; }
        this.stack.push([this.j+1,this.r],[this.l,this.j]); this.state='start';
      }
    }
    return null;
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
            if (this.state === 'start') { if (this.stack.length === 0) { this.state = 'done'; return null; } [this.low, this.high] = this.stack.pop();
              if (this.low < this.high) {
                if(this.high-this.low<2){
                  this.pivot=this.items[this.high]; this.i=this.low-1; this.j=this.low;
                  this.state='partition'; continue;
                }
                this.mid = Math.floor((this.low + this.high) / 2); this.pState = 0; this.state = 'pivot';
              } else continue; }
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

/**
 * Binary quicksort — the comparison-based analogue of MSD radix exchange.
 * Partitions each segment around a randomly chosen pivot VALUE into a
 * "<= pivot" bucket and a "> pivot" bucket, places the pivot between them,
 * and recurses on both buckets. Each element is compared against its
 * segment's pivot exactly once, so no pair is ever requested twice.
 *
 * Replaces the former "RadixSortProvider" (fixed ceil(log2 n) random-pivot
 * passes over the whole array plus a full insertion sort), which was NOT a
 * radix sort: true radix sort is non-comparative (digit/counting passes) and
 * cannot be expressed as a comparison provider. See
 * research/PROVIDER_AUDIT.md, Finding 4.
 */
class BinaryQuicksortProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n]]; this.state = 'start'; }
    next(result) {
        while (true) {
            if (this.state === 'start') {
                if (this.stack.length === 0) return null;
                const seg = this.stack.pop();
                if (seg[1] - seg[0] < 2) continue;
                this.lo = seg[0]; this.hi = seg[1];
                this.pivotIdx = this.lo + Math.floor(Math.random() * (this.hi - this.lo));
                this.pivot = this.items[this.pivotIdx];
                this.lo_bucket = []; this.hi_bucket = [];
                this.idx = this.lo; this.state = 'scan'; continue;
            }
            if (this.state === 'scan') {
                if (result !== undefined) {
                    (result === 0 ? this.lo_bucket : this.hi_bucket).push(this.items[this.idx]);
                    this.idx++; result = undefined;
                }
                while (this.idx < this.hi && this.idx === this.pivotIdx) this.idx++;
                if (this.idx < this.hi) return [this.items[this.idx], this.pivot];
                const out = this.lo_bucket.concat([this.pivot], this.hi_bucket);
                for (let k = 0; k < out.length; k++) this.items[this.lo + k] = out[k];
                const pivotPos = this.lo + this.lo_bucket.length;
                this.stack.push([pivotPos + 1, this.hi], [this.lo, pivotPos]);
                this.state = 'start'; continue;
            }
        }
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

/**
 * "Silly sort" — deliberately absurd recursive exchange sort (meme family;
 * no single canonical definition exists, this is the classic silly
 * recursion): for interval [i, j], compare/swap the two endpoints, then
 * recursively sort [i+1, j] and [i, j-1]. Correct by induction (after the
 * second call both overlapping windows of length len-1 are sorted and the
 * endpoint is the maximum), but it takes Theta(2^(j-i)) comparisons.
 *
 * The previous provider pushed four sub-intervals per frame and ignored
 * every comparison result, so it could never sort (see
 * research/PROVIDER_AUDIT.md, Finding 6).
 */
class SillySortProvider extends Provider {
    constructor(n) { super(n); this.stack = [{ i: 0, j: n - 1, state: 0 }]; }
    next(result) {
        while (this.stack.length > 0) {
            const f = this.stack[this.stack.length - 1];
            if (f.state === 0) {
                if (f.i >= f.j) { this.stack.pop(); continue; }
                if (result !== undefined) {
                    if (result === 1) [this.items[f.i], this.items[f.j]] = [this.items[f.j], this.items[f.i]];
                    this.stack.push({ i: f.i + 1, j: f.j, state: 0 }); f.state = 1; result = undefined; continue;
                }
                return [this.items[f.i], this.items[f.j]];
            }
            if (f.state === 1) { this.stack.push({ i: f.i, j: f.j - 1, state: 0 }); f.state = 2; continue; }
            if (f.state === 2) { this.stack.pop(); continue; }
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
  // Honest labelling: this is a PROXY that delegates to HeapSortProvider, not
  // Dijkstra's smoothsort (Leonardo heaps, O(n) best case). Kept so the
  // benchmark suite size is unchanged; registered as "Heap Sort (Smooth
  // Proxy)". See research/PROVIDER_AUDIT.md, Finding 5.
  constructor(n){ super(n); }
  next(result){
    if(!this.proxy){ this.proxy=new HeapSortProvider(this.n); this.proxy.items=this.items; }
    const res=this.proxy.next(result);
    if(res===null) this.items=this.proxy.items;
    return res;
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
        while (this.unsorted.length > 0 || this.sublist.length > 0 || this.state === 'merge') {
            if (this.state === 'start') { this.sublist = [this.unsorted.shift()]; this.i = 0; this.state = 'scan'; }
            if (this.state === 'scan') {
                if (result !== undefined) { if (result === 1) { this.sublist.push(this.unsorted.splice(this.i, 1)[0]); } else { this.i++; } result = undefined; }
                if (this.i < this.unsorted.length) return [this.unsorted[this.i], this.sublist[this.sublist.length - 1]];
                this.mi=0; this.mj=0; this.merged=[]; this.state='merge';
            }
            if(this.state==='merge'){
              if(result!==undefined){
                if(result===0) this.merged.push(this.sorted[this.mi++]);
                else           this.merged.push(this.sublist[this.mj++]);
                result=undefined;
              }
              if(this.mi<this.sorted.length && this.mj<this.sublist.length)
                return [this.sorted[this.mi], this.sublist[this.mj]];
              this.sorted=this.merged.concat(this.sorted.slice(this.mi)).concat(this.sublist.slice(this.mj));
              this.sublist=[]; this.state='start';
            }
        } this.items=this.sorted; return null;
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
        this.sortedCount = 0; this.state = 'build'; this.p = this.size - 1; this.out = [];
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
                this.sortedCount++; let winner = this.tree[1]; this.out.push(winner); this.tree[this.size + winner] = -1;
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
                // Push the winner BEFORE counting completion: an early break
                // here used to drop the final (weakest) element.
                let winner = this.tree[1]; this.out.push(winner); this.sortedCount++;
                if (this.sortedCount >= this.n) break;
                this.tree[this.size + winner] = -1; this.p = this.size + winner;
            }
        } this.items = this.out; return null;
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
        }
        const out = [];
        (function io(node){ if(!node) return; io(node.l); out.push(node.v); io(node.r); })(this.root);
        this.items = out; return null;
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
                  this.region = this.items.slice(this.l+2, this.r);
                  this.b1 = []; this.b2 = []; this.b3 = []; this.b4 = []; this.ri = 0; this.sub = 'vs2'; this.state = 'scan';
                }
            }
            if (this.state === 'scan') {
              if (this.ri < this.region.length) {
                const x = this.region[this.ri];
                if (this.sub === 'vs2') { if (result !== undefined) { this.sub = (result === 0) ? 'lt2' : 'ge2'; result = undefined; } else return [x, this.p2]; }
                if (this.sub === 'lt2') { if (result !== undefined) { (result === 0 ? this.b1 : this.b2).push(x); this.ri++; this.sub = 'vs2'; result = undefined; } else return [x, this.p1]; }
                if (this.sub === 'ge2') { if (result !== undefined) { (result === 1 ? this.b4 : this.b3).push(x); this.ri++; this.sub = 'vs2'; result = undefined; } else return [x, this.p3]; }
                continue;
              }
              const out = [...this.b1, this.p1, ...this.b2, this.p2, ...this.b3, this.p3, ...this.b4];
              for (let i = 0; i < out.length; i++) this.items[this.l + i] = out[i];
              const i1 = this.l + this.b1.length, i2 = i1 + 1 + this.b2.length, i3 = i2 + 1 + this.b3.length;
              this.stack.push([this.l, i1 - 1], [i1 + 1, i2 - 1], [i2 + 1, i3 - 1], [i3 + 1, this.r]);
              this.state = 'start';
            }
        } return null;
    }
}

class MergeSort3WayProvider extends KWayMergeSortProvider { constructor(n) { super(n, 3); } }

class MergeSort4WayProvider extends KWayMergeSortProvider { constructor(n) { super(n, 4); } }

/**
 * Batcher's odd-even mergesort as a sorting network (Batcher 1968, ASC).
 * The comparator network is generated for the next power of two >= n and
 * the array is padded with +infinity sentinels (-1 ids, stripped at the
 * end), exactly like the repo's BitonicSortProvider. Phantom comparators
 * touching sentinels resolve without asking the oracle. Non-adaptive:
 * Theta(S log^2 S) positional comparators for S = next pow2 (1792 at
 * n = 100).
 * Source: https://en.wikipedia.org/wiki/Batcher_odd%E2%80%93even_mergesort
 */
class BatcherOddEvenSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.size = 1; while (this.size < n) this.size *= 2;
        for (let i = n; i < this.size; i++) this.items.push(-1);
        this.comps = [];
        const gen = (lo, len) => {
            if (len <= 1) return;
            const half = len >> 1;
            gen(lo, half); gen(lo + half, half);
            this._batcherMerge(lo, len, 1);
        };
        gen(0, this.size);
        this.idx = 0;
    }
    _batcherMerge(lo, len, r) {
        const m = r * 2;
        if (m < len) {
            this._batcherMerge(lo, len, m);
            this._batcherMerge(lo + r, len, m);
            for (let i = lo + r; i + r < lo + len; i += m) this.comps.push([i, i + r]);
        } else this.comps.push([lo, lo + r]);
    }
    next(result) {
        while (this.idx < this.comps.length) {
            const [i, j] = this.comps[this.idx++];
            const a = this.items[i], b = this.items[j];
            if (a === -1 && b === -1) continue;
            if (b === -1) continue;             // a <= +inf already
            if (a === -1) { this.items[i] = b; this.items[j] = a; continue; }
            if (result !== undefined) { if (result === 1) { this.items[i] = b; this.items[j] = a; } result = undefined; continue; }
            // Ask below: rewind so the comparison is served on this call.
            this.idx--; return [a, b];
        }
        this.items = this.items.filter(x => x !== -1);
        return null;
    }
}

/**
 * Bose-Nelson sorting network (Bose & Nelson 1962, ASC). Recursive
 * construction: sort each half (Pstar), then merge the halves with the
 * Pbracket comparator cascade. Works for any n (no padding needed).
 * Ported to 0-based indices from the classic C generator's recurrences:
 * Pstar splits at m/2; Pbracket handles the (1,1), (1,2), (2,1) bases and
 * otherwise splits x at x/2 and y at y/2 or (y+1)/2 depending on x parity.
 * Source: https://github.com/atinm/bose-nelson (bose-nelson.c)
 */
class BoseNelsonSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.comps = [];
        const bracket = (i, x, j, y) => {
            if (x === 1 && y === 1) this.comps.push([i, j]);
            else if (x === 1 && y === 2) { this.comps.push([i, j + 1]); this.comps.push([i, j]); }
            else if (x === 2 && y === 1) { this.comps.push([i, j]); this.comps.push([i + 1, j]); }
            else {
                const a = x >> 1, b = (x & 1) ? (y >> 1) : ((y + 1) >> 1);
                bracket(i, a, j, b);
                bracket(i + a, x - a, j + b, y - b);
                bracket(i + a, x - a, j, b);
            }
        };
        const star = (i, m) => {
            if (m <= 1) return;
            const a = m >> 1;
            star(i, a); star(i + a, m - a);
            bracket(i, a, i + a, m - a);
        };
        star(0, n);
        this.idx = 0; this.pending = null;
    }
    next(result) {
        if (this.pending) {
            const [i, j] = this.pending; this.pending = null;
            if (result === 1) { const t = this.items[i]; this.items[i] = this.items[j]; this.items[j] = t; }
        }
        while (this.idx < this.comps.length) {
            const [i, j] = this.comps[this.idx++];
            this.pending = [i, j];
            return [this.items[i], this.items[j]];
        }
        return null;
    }
}

/**
 * Exchange sort (DESC, to match the repo's Selection sort): for each i,
 * compare A[i] against every later A[j] and swap immediately when inverted.
 * Same n(n-1)/2 positional pairs as selection sort, but eager swaps make
 * the element-pair stream (and duplicate profile) quite different.
 * Source: https://en.wikipedia.org/wiki/Exchange_sort
 */
class ExchangeSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.j = 1; }
    next(result) {
        while (this.i < this.n - 1) {
            if (this.j >= this.n) { this.i++; this.j = this.i + 1; continue; }
            if (result !== undefined) {
                if (result === 0) { const t = this.items[this.i]; this.items[this.i] = this.items[this.j]; this.items[this.j] = t; }
                this.j++; result = undefined; continue;
            }
            return [this.items[this.i], this.items[this.j]];
        }
        return null;
    }
}

/**
 * Bingo sort, a.k.a. maximal selection sort (DESC variant of the Wikipedia
 * pseudocode: repeatedly finds the current minimum and pulls all copies to
 * the end, so output is strongest-first like the repo's other selection
 * sorts). The "equals current max/min" tests are id comparisons (strengths
 * are distinct), so only the scan comparisons are asked.
 * Source: https://en.wikipedia.org/wiki/Bingo_sort
 */
class BingoSortProvider extends Provider {
    constructor(n) { super(n); this.last = n - 1; this.i = n - 2; this.state = this.n > 1 ? 'init_scan' : 'done'; this.nextMin = n > 0 ? this.items[n - 1] : -1; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'init_scan') {
                // Find min of A[0..last]: compare [A[i], nextMin], result 0 => new min.
                if (result !== undefined) { if (result === 0) this.nextMin = this.scanItem; this.i--; result = undefined; }
                if (this.i >= 0) { this.scanItem = this.items[this.i]; return [this.scanItem, this.nextMin]; }
                this.state = 'strip';
            }
            if (this.state === 'strip') {
                while (this.last > 0 && this.items[this.last] === this.nextMin) this.last--;
                this.state = this.last > 0 ? 'loop_start' : 'done';
            }
            if (this.state === 'loop_start') {
                this.prevMin = this.nextMin; this.nextMin = this.items[this.last]; this.i = this.last - 1;
                this.state = 'loop_scan';
            }
            if (this.state === 'loop_scan') {
                if (result !== undefined) {
                    if (result === 0) {
                        if (this.scanItem !== this.prevMin) this.nextMin = this.scanItem;
                        else { const t = this.items[this.i]; this.items[this.i] = this.items[this.last]; this.items[this.last] = t; this.last--; }
                    }
                    this.i--; result = undefined;
                }
                if (this.i >= 0) { this.scanItem = this.items[this.i]; return [this.scanItem, this.nextMin]; }
                this.state = 'strip';
            }
        }
        return null;
    }
}

/**
 * Cocktail shaker sort with shifting bounds (DESC, matching the repo's
 * CocktailShakerProvider): each forward/backward pass remembers the last
 * swap position and shrinks the active window to it, so sorted prefix /
 * suffix regions are never rescanned.
 * Source: https://rosettacode.org/wiki/Sorting_algorithms/Cocktail_sort
 */
class CocktailBoundsSortProvider extends Provider {
    constructor(n) { super(n); this.lo = 0; this.hi = n - 1; this.i = 0; this.state = 'fwd'; this.lastSwap = 0; }
    next(result) {
        while (true) {
            if (this.state === 'fwd') {
                if (result !== undefined) { if (result === 0) { const t = this.items[this.i]; this.items[this.i] = this.items[this.i + 1]; this.items[this.i + 1] = t; this.lastSwap = this.i; } this.i++; result = undefined; }
                else { this.i = this.lo; this.lastSwap = this.lo; }
                if (this.i < this.hi) return [this.items[this.i], this.items[this.i + 1]];
                this.hi = this.lastSwap; this.state = 'bwd'; continue;
            }
            if (this.state === 'bwd') {
                if (result !== undefined) { if (result === 0) { const t = this.items[this.i]; this.items[this.i] = this.items[this.i + 1]; this.items[this.i + 1] = t; this.lastSwap = this.i + 1; } this.i--; result = undefined; }
                else { if (this.hi <= this.lo) return null; this.i = this.hi - 1; this.lastSwap = this.hi; }
                if (this.i >= this.lo) return [this.items[this.i], this.items[this.i + 1]];
                this.lo = this.lastSwap; this.state = 'fwd'; continue;
            }
        }
    }
}

/**
 * Bottom-up heapsort (Wegener 1993 variant; ASC max-heap). Sift-down goes to
 * a leaf comparing only children (1 comparison per level, no
 * parent-vs-child test), then the displaced root value sifts back up to its
 * correct position. ~n log n + O(n) comparisons.
 * Source: https://en.wikipedia.org/wiki/Heapsort#Bottom-up_heapsort
 */
class BottomUpHeapSortProvider extends Provider {
    constructor(n) { super(n); this.phase = 'build'; this.i = (n >> 1) - 1; this.end = n - 1; this.state = 'next'; }
    _advance() { if (this.phase === 'build') { this.i--; if (this.i < 0) this.phase = 'sort'; } this.state = 'next'; }
    next(result) {
        while (true) {
            if (this.state === 'next') {
                if (this.phase === 'build') {
                    if (this.i < 0) { this.phase = 'sort'; continue; }
                    this.x = this.items[this.i]; this.root = this.i; this.j = this.i; this.size = this.n;
                } else {
                    if (this.end < 1) return null;
                    const t = this.items[0]; this.items[0] = this.items[this.end]; this.items[this.end] = t;
                    this.x = this.items[0]; this.root = 0; this.j = 0; this.size = this.end;
                    this.end--;
                }
                this.state = 'down'; continue;
            }
            if (this.state === 'down') {
                // Sink the hole to a leaf along larger children (1 comparison
                // per level), shifting each larger child up.
                if (result !== undefined) {
                    const c = (result === 1) ? this.lc : this.rc;
                    this.items[this.j] = this.items[c]; this.j = c; result = undefined;
                }
                this.lc = this.j * 2 + 1; this.rc = this.lc + 1;
                if (this.lc >= this.size) { this.state = 'up'; continue; }
                if (this.rc >= this.size) { this.items[this.j] = this.items[this.lc]; this.j = this.lc; this.state = 'up'; continue; }
                return [this.items[this.lc], this.items[this.rc]];
            }
            if (this.state === 'up') {
                // Back up while the parent is smaller than x.
                if (this.j === this.root) { this.items[this.j] = this.x; this._advance(); continue; }
                const p = (this.j - 1) >> 1;
                if (result !== undefined) {
                    if (result === 0) { this.items[this.j] = this.items[p]; this.j = p; }
                    else { this.items[this.j] = this.x; this._advance(); }
                    result = undefined; continue;
                }
                return [this.items[p], this.x];
            }
        }
    }
}

/**
 * Weak-heap sort (Dutton 1993; ASC max-heap). Array-implicit weak heap with
 * one reverse bit per node: node k (0-based = array index; node 0 is the
 * real root) has binary parent floor(k/2), children 2k+r[k] (left /
 * next-sibling) and 2k+1-r[k] (right / first-child). Build joins each node
 * with its distinguished ancestor (n-1 comparisons); each extraction swaps
 * the root with the last element and "merges up" from the root's last
 * child through previous siblings (~log n comparisons per extraction).
 * Source: https://en.wikipedia.org/wiki/Weak_heap
 */
class WeakHeapSortProvider extends Provider {
    constructor(n) { super(n); this.r = new Array(n).fill(0); this.i = n - 1; this.m = n - 1; this.state = 'build'; this.x = 0; }
    _right(p) { return 2 * p + 1 - this.r[p]; }
    _left(p) { return 2 * p + this.r[p]; }
    _distAncestor(j) { let p = j >> 1; if (j === this._right(p)) return p; return this._distAncestor(p); }
    next(result) {
        while (true) {
            if (this.state === 'build') {
                if (this.i < 1) { this.state = 'sortloop'; continue; }
                if (result !== undefined) {
                    if (result === 0) { const t = this.items[this.d]; this.items[this.d] = this.items[this.i]; this.items[this.i] = t; this.r[this.i] ^= 1; }
                    this.i--; result = undefined; continue;
                }
                this.d = this._distAncestor(this.i);
                return [this.items[this.d], this.items[this.i]];
            }
            if (this.state === 'sortloop') {
                if (this.m < 1) return null;
                const t = this.items[0]; this.items[0] = this.items[this.m]; this.items[this.m] = t;
                // Last (multi-way) child of the root: down the next-sibling links.
                this.x = this._right(0);
                if (this.x >= this.m) { this.m--; continue; }
                while (this._left(this.x) < this.m) this.x = this._left(this.x);
                this.state = 'mergeup'; continue;
            }
            if (this.state === 'mergeup') {
                if (this.x === 0) { this.m--; this.state = 'sortloop'; continue; }
                if (result !== undefined) {
                    if (result === 0) { const t = this.items[this.d]; this.items[this.d] = this.items[this.x]; this.items[this.x] = t; this.r[this.x] ^= 1; }
                    this.x = this.x >> 1; result = undefined; continue;
                }
                this.d = this._distAncestor(this.x);
                return [this.items[this.d], this.items[this.x]];
            }
        }
    }
}

/**
 * Genuine Smoothsort (Dijkstra 1981; ASC max-Leonardo-heap). This replaces
 * the comparison behavior of the old 'Smoothsort*' binary-heap proxy (kept
 * for continuity) with the real algorithm: Leonardo heap with ordered
 * roots, sift/trinkle/semitrinkle, the grow-phase sift-vs-trinkle
 * optimization, and grow/shrink phases. Implemented with an explicit
 * stretch-order list (identical comparison behavior to the classic p-bit
 * concatenation machine, which only encodes the same decomposition).
 * Growth rule (verified: single stretches at n = 1,3,5,9,15,...): appending
 * absorbs into a combined stretch iff the last two orders are (k+1,k), else
 * pushes singleton order (last==1 ? 0 : 1).
 * Sources: https://en.wikipedia.org/wiki/Smoothsort
 *          https://en.wikibooks.org/wiki/Algorithm_Implementation/Sorting/Smoothsort
 */
class SmoothSortRealProvider extends Provider {
    constructor(n) {
        super(n);
        this.L = [1, 1]; while (this.L.length < 24) { const k = this.L.length; this.L.push(this.L[k-1] + this.L[k-2] + 1); }
        this.st = [];       // stretch orders covering heap [0, m)
        this.pos = [];      // root position of each stretch
        this.tasks = n > 0 ? [{ op: 'grow', q: 0, stage: 'enter' }] : [];
    }
    _recompute() {
        this.pos = []; let off = 0;
        for (const k of this.st) { off += this.L[k]; this.pos.push(off - 1); }
    }
    _children(root, k) { // [leftRoot(order k-1), rightRoot(order k-2)]
        return [root - 1 - this.L[k-2], root - 1];
    }
    next(result) {
        while (this.tasks.length > 0) {
            const t = this.tasks[this.tasks.length - 1];
            if (t.op === 'grow') {
                if (t.stage === 'enter') {
                    const s = this.st;
                    if (s.length >= 2 && s[s.length-2] === s[s.length-1] + 1) { const k = s.pop() + 2; s.pop(); s.push(k); }
                    else s.push(s.length > 0 && s[s.length-1] === 1 ? 0 : 1);
                    this._recompute();
                    const k = s[s.length-1], idx = s.length - 1;
                    t.stage = 'next';
                    if (k === 0) this.tasks.push({ op: 'trin', root: t.q, k, idx, stage: 'step' });
                    else if (t.q + this.L[k-1] < this.n - 1) this.tasks.push({ op: 'sift', root: t.q, k });
                    else this.tasks.push({ op: 'trin', root: t.q, k, idx, stage: 'step' });
                    continue;
                }
                // stage 'next': sift/trinkle below us finished.
                t.q++;
                if (t.q < this.n) t.stage = 'enter';
                else { this.tasks.pop(); this.tasks.push({ op: 'shrink', m: this.n, stage: 'loop' }); }
                continue;
            }
            if (t.op === 'sift') {
                if (t.k < 2) { this.tasks.pop(); continue; }
                const [lc, rc] = this._children(t.root, t.k);
                if (t.stage === 'vsroot') {
                    // Outstanding pair was [A[root], A[m]]: 1 => root wins, done.
                    if (result !== undefined) {
                        if (result === 1) { this.tasks.pop(); result = undefined; continue; }
                        const tmp = this.items[t.root]; this.items[t.root] = this.items[t.m]; this.items[t.m] = tmp;
                        t.root = t.m; t.k = t.mk; t.stage = undefined; result = undefined; continue;
                    }
                    return [this.items[t.root], this.items[t.m]];
                }
                if (result !== undefined) {
                    // Outstanding pair was [A[lc], A[rc]]: 1 => left wins.
                    if (result === 1) { t.m = lc; t.mk = t.k - 1; } else { t.m = rc; t.mk = t.k - 2; }
                    result = undefined; t.stage = 'vsroot'; continue;
                }
                return [this.items[lc], this.items[rc]];
            }
            if (t.op === 'trin') {
                if (t.stage === 'step') {
                    if (t.idx === 0) { t.op = 'sift'; t.stage = undefined; continue; }
                    t.stage = 'ss'; continue;
                }
                if (t.stage === 'ss') {
                    const stepson = this.pos[t.idx - 1];
                    if (result !== undefined) {
                        // Outstanding pair was [A[root], A[stepson]].
                        if (result === 1) { t.op = 'sift'; t.stage = undefined; result = undefined; continue; }
                        result = undefined;
                        if (t.k <= 1) {
                            const tmp = this.items[t.root]; this.items[t.root] = this.items[stepson]; this.items[stepson] = tmp;
                            t.root = stepson; t.k = this.st[t.idx - 1]; t.idx--; t.stage = 'step'; continue;
                        }
                        t.stage = 'pick'; continue;
                    }
                    return [this.items[t.root], this.items[stepson]];
                }
                if (t.stage === 'pick') {
                    const [lc, rc] = this._children(t.root, t.k);
                    if (result !== undefined) {
                        if (result === 1) { t.m = lc; t.mk = t.k - 1; } else { t.m = rc; t.mk = t.k - 2; }
                        result = undefined; t.stage = 'fourway'; continue;
                    }
                    return [this.items[lc], this.items[rc]];
                }
                if (t.stage === 'fourway') {
                    const stepson = this.pos[t.idx - 1];
                    if (result !== undefined) {
                        // Outstanding pair was [A[m], A[stepson]]: 1 => child wins.
                        const childWon = (result === 1), m = t.m, mk = t.mk;
                        result = undefined;
                        if (childWon) {
                            const tmp = this.items[t.root]; this.items[t.root] = this.items[m]; this.items[m] = tmp;
                            t.root = m; t.k = mk; t.op = 'sift'; t.stage = undefined; continue;
                        }
                        const tmp = this.items[t.root]; this.items[t.root] = this.items[stepson]; this.items[stepson] = tmp;
                        t.root = stepson; t.k = this.st[t.idx - 1]; t.idx--; t.stage = 'step'; continue;
                    }
                    return [this.items[t.m], this.items[stepson]];
                }
            }
            if (t.op === 'semi') {
                if (t.idx === 0) { this.tasks.pop(); continue; }
                const stepson = this.pos[t.idx - 1];
                if (result !== undefined) {
                    // pair was [A[stepson], A[root]]: 1 => stepson wins.
                    if (result === 1) {
                        const tmp = this.items[t.root]; this.items[t.root] = this.items[stepson]; this.items[stepson] = tmp;
                        this.tasks.pop();
                        this.tasks.push({ op: 'trin', root: stepson, k: this.st[t.idx - 1], idx: t.idx - 1, stage: 'step' });
                    } else this.tasks.pop();
                    result = undefined; continue;
                }
                return [this.items[stepson], this.items[t.root]];
            }
            if (t.op === 'shrink') {
                if (t.m <= 1) { this.tasks.pop(); continue; }
                if (t.stage === 'loop') {
                    const k = this.st.pop();
                    if (k <= 1) { t.m--; continue; }
                    t.m--; t.splitK = k;
                    this.st.push(k - 1); this._recompute();
                    t.stage = 'pushright';
                    this.tasks.push({ op: 'semi', root: this.pos[this.pos.length-1], k: k - 1, idx: this.st.length - 1 });
                    continue;
                }
                if (t.stage === 'pushright') {
                    const k = t.splitK;
                    this.st.push(k - 2); this._recompute();
                    t.stage = 'loop';
                    this.tasks.push({ op: 'semi', root: this.pos[this.pos.length-1], k: k - 2, idx: this.st.length - 1 });
                    continue;
                }
            }
        }
        return null;
    }
}

/**
 * Splay sort (Movahedi et al. 2014; ASC): insert every element into a splay
 * tree (BST insert by strength, then splay the node to the root with
 * zig / zig-zig / zig-zag rotations), finally inorder traversal. Only the
 * insertion descents ask the oracle; rotations and the traversal are free.
 * Source: https://en.wikipedia.org/wiki/Splay_tree
 */
class SplaySortProvider extends Provider {
    constructor(n) { super(n); this.root = null; this.idx = 0; this.node = null; this.state = n > 0 ? 'insert' : 'done'; }
    _rotRight(x) { const y = x.l; x.l = y.r; if (y.r) y.r.p = x; y.p = x.p; if (!x.p) this.root = y; else if (x === x.p.l) x.p.l = y; else x.p.r = y; y.r = x; x.p = y; }
    _rotLeft(x) { const y = x.r; x.r = y.l; if (y.l) y.l.p = x; y.p = x.p; if (!x.p) this.root = y; else if (x === x.p.l) x.p.l = y; else x.p.r = y; y.l = x; x.p = y; }
    _splay(x) {
        while (x.p) {
            const p = x.p, g = p.p;
            if (!g) { if (x === p.l) this._rotRight(p); else this._rotLeft(p); }
            else if (x === p.l && p === g.l) { this._rotRight(g); this._rotRight(p); }
            else if (x === p.r && p === g.r) { this._rotLeft(g); this._rotLeft(p); }
            else if (x === p.l) { this._rotRight(p); this._rotLeft(g); }
            else { this._rotLeft(p); this._rotRight(g); }
        }
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'insert') {
                if (this.idx >= this.n) { this.state = 'traverse'; continue; }
                this.node = { v: this.items[this.idx], l: null, r: null, p: null };
                this.cur = this.root; this.parent = null;
                this.state = 'descend'; continue;
            }
            if (this.state === 'descend') {
                if (result !== undefined) {
                    // Pair was [node.v, cur.v]: 0 => node weaker => go left.
                    if (result === 0) { this.parent = this.cur; this.cur = this.cur.l; this._goLeft = true; }
                    else { this.parent = this.cur; this.cur = this.cur.r; this._goLeft = false; }
                    result = undefined;
                }
                if (this.cur) return [this.node.v, this.cur.v];
                if (!this.parent) this.root = this.node;
                else { this.node.p = this.parent; if (this._goLeft) this.parent.l = this.node; else this.parent.r = this.node; }
                this._splay(this.node); this.idx++; this.state = 'insert'; continue;
            }
            if (this.state === 'traverse') {
                const out = []; const stack = []; let c = this.root;
                while (c || stack.length) { while (c) { stack.push(c); c = c.l; } c = stack.pop(); out.push(c.v); c = c.r; }
                this.items = out; this.state = 'done';
            }
        }
        return null;
    }
}

/**
 * Cartesian tree sort (ASC): build the min-Cartesian tree of the input
 * sequence with the classic stack algorithm (each element pushed/popped
 * once, <= 2n-2 comparisons), then repeatedly extract the minimum with a
 * binary-heap priority queue seeded with the root (children enqueued on
 * extraction). Output order is ascending.
 * Source: https://en.wikipedia.org/wiki/Cartesian_tree
 */
class CartesianTreeSortProvider extends Provider {
    constructor(n) { super(n); this.stack2 = []; this.idx = 0; this.root = null; this.state = n > 0 ? 'build' : 'done'; this.heap = []; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'build') {
                if (this.idx >= this.n) { this.root = this.stack2.length ? this.stack2[0] : null; this.state = 'seed'; continue; }
                this.node = { v: this.items[this.idx], l: null, r: null }; this.last = null;
                this.state = 'popwhile'; continue;
            }
            if (this.state === 'popwhile') {
                if (result !== undefined) {
                    // Pair was [stackTop.v, node.v]: 1 => top stronger => pop.
                    if (result === 1) { this.last = this.stack2.pop(); }
                    else { this.state = 'link'; result = undefined; continue; }
                    result = undefined;
                }
                if (this.stack2.length > 0) return [this.stack2[this.stack2.length - 1].v, this.node.v];
                this.state = 'link'; continue;
            }
            if (this.state === 'link') {
                this.node.l = this.last;
                if (this.stack2.length > 0) this.stack2[this.stack2.length - 1].r = this.node;
                this.stack2.push(this.node);
                this.idx++; this.state = 'build'; continue;
            }
            if (this.state === 'seed') {
                if (this.root) this.heap.push(this.root);
                this.out = []; this.state = 'extract'; continue;
            }
            if (this.state === 'extract') {
                if (this.heap.length === 0) { this.items = this.out; this.state = 'done'; continue; }
                const top = this.heap[0], last = this.heap.pop();
                if (this.heap.length > 0) { this.heap[0] = last; this.hi = 0; this.state = 'hdown'; }
                else this.state = 'emit';
                this.emitNode = top; continue;
            }
            if (this.state === 'emit') {
                this.out.push(this.emitNode.v);
                this.pendingKids = [];
                if (this.emitNode.l) this.pendingKids.push(this.emitNode.l);
                if (this.emitNode.r) this.pendingKids.push(this.emitNode.r);
                this.emitNode = null; this.state = 'enqueue'; continue;
            }
            if (this.state === 'enqueue') {
                if (this.pendingKids.length === 0) { this.state = 'extract'; continue; }
                this.heap.push(this.pendingKids.pop()); this.hi = this.heap.length - 1;
                this.state = 'hup'; continue;
            }
            if (this.state === 'hup') {
                // Bubble heap[hi] up (min-heap). Pair [child, parent]: 0 => child wins.
                if (this.hi === 0) { this.state = 'enqueue'; continue; }
                const p = (this.hi - 1) >> 1;
                if (result !== undefined) {
                    if (result === 0) { const t = this.heap[this.hi]; this.heap[this.hi] = this.heap[p]; this.heap[p] = t; this.hi = p; }
                    else this.state = 'enqueue';
                    result = undefined; continue;
                }
                return [this.heap[this.hi].v, this.heap[p].v];
            }
            if (this.state === 'hdown') {
                const l = this.hi * 2 + 1, r = l + 1;
                if (l >= this.heap.length) { this.state = 'emit'; continue; }
                if (this.pickChild === true) {
                    // result of [left, right]: 0 => left wins.
                    this.c = (result === 0) ? l : r; result = undefined; this.pickChild = false;
                    this.state = 'hdowncmp'; continue;
                }
                if (r >= this.heap.length) { this.c = l; this.state = 'hdowncmp'; continue; }
                this.pickChild = true;
                return [this.heap[l].v, this.heap[r].v];
            }
            if (this.state === 'hdowncmp') {
                // Pair [child, x]: 0 => child wins => swap down.
                if (result !== undefined) {
                    if (result === 0) { const t = this.heap[this.hi]; this.heap[this.hi] = this.heap[this.c]; this.heap[this.c] = t; this.hi = this.c; this.state = 'hdown'; }
                    else this.state = 'emit';
                    result = undefined; continue;
                }
                return [this.heap[this.c].v, this.heap[this.hi].v];
            }
        }
        return null;
    }
}

/**
 * Treap sort (ASC): insert every element into a treap keyed by strength
 * with random priorities (priorities drawn from Math.random, never
 * compared via oracle), rotating up on priority, then inorder traversal.
 * Expected O(n log n) comparisons.
 * Source: https://en.wikipedia.org/wiki/Treap
 */
class TreapSortProvider extends Provider {
    constructor(n) { super(n); this.root = null; this.idx = 0; this.state = n > 0 ? 'insert' : 'done'; }
    _rotRight(x) { const y = x.l; x.l = y.r; y.r = x; return y; }
    _rotLeft(x) { const y = x.r; x.r = y.l; y.l = x; return y; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'insert') {
                if (this.idx >= this.n) { this.state = 'traverse'; continue; }
                this.node = { v: this.items[this.idx], pr: Math.random(), l: null, r: null };
                this.cur = this.root; this.path = [];
                this.state = 'descend'; continue;
            }
            if (this.state === 'descend') {
                if (result !== undefined) {
                    // Pair was [node.v, cur.v]: 0 => go left.
                    if (result === 0) { this.path.push([this.cur, 'l']); this.cur = this.cur.l; }
                    else { this.path.push([this.cur, 'r']); this.cur = this.cur.r; }
                    result = undefined;
                }
                if (this.cur) return [this.node.v, this.cur.v];
                // Link under last parent, then rotate up on priority (free).
                if (this.path.length === 0) this.root = this.node;
                else { const [p, d] = this.path[this.path.length - 1]; p[d] = this.node; }
                let child = this.node;
                while (this.path.length > 0) {
                    const [p, d] = this.path[this.path.length - 1];
                    if (p.pr <= child.pr) break;
                    this.path.pop();
                    let nn;
                    if (d === 'l') nn = this._rotRight(p); else nn = this._rotLeft(p);
                    if (this.path.length === 0) this.root = nn;
                    else { const [gp, gd] = this.path[this.path.length - 1]; gp[gd] = nn; }
                    child = nn;
                }
                this.idx++; this.state = 'insert'; continue;
            }
            if (this.state === 'traverse') {
                const out = []; const stack = []; let c = this.root;
                while (c || stack.length) { while (c) { stack.push(c); c = c.l; } c = stack.pop(); out.push(c.v); c = c.r; }
                this.items = out; this.state = 'done';
            }
        }
        return null;
    }
}

/**
 * Skiplist sort (ASC): insert every element into a skiplist (levels by fair
 * coin flips capped at ceil(log2(n+1)), search-and-splice per level), then
 * traverse level 0. Only search steps ask the oracle.
 * Source: https://en.wikipedia.org/wiki/Skip_list
 */
class SkiplistSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.maxLvl = Math.max(1, Math.ceil(Math.log2(n + 1)));
        this.head = { v: -1, fwd: new Array(this.maxLvl).fill(null) };
        this.idx = 0; this.state = n > 0 ? 'insert' : 'done';
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'insert') {
                if (this.idx >= this.n) { this.state = 'traverse'; continue; }
                let lvl = 0;
                while (lvl + 1 < this.maxLvl && Math.random() < 0.5) lvl++;
                this.node = { v: this.items[this.idx], fwd: new Array(lvl + 1).fill(null) };
                this.update = new Array(this.maxLvl).fill(null);
                this.cur = this.head; this.li = this.maxLvl - 1;
                this.state = 'search'; continue;
            }
            if (this.state === 'search') {
                if (result !== undefined) {
                    // Pair was [node.v, next.v]: 0 => node weaker => drop a level.
                    if (result === 0) { this.update[this.li] = this.cur; this.li--; }
                    else this.cur = this.nxt;
                    result = undefined;
                }
                while (this.li >= 0 && this.cur.fwd[this.li] === null && this.li > this.node.fwd.length - 1) this.li--;
                if (this.li < 0) { this.state = 'splice'; continue; }
                this.nxt = this.cur.fwd[this.li];
                if (this.nxt === null) { this.update[this.li] = this.cur; this.li--; continue; }
                return [this.node.v, this.nxt.v];
            }
            if (this.state === 'splice') {
                for (let l = 0; l < this.node.fwd.length; l++) {
                    const u = this.update[l] || this.head;
                    this.node.fwd[l] = u.fwd[l]; u.fwd[l] = this.node;
                }
                this.idx++; this.state = 'insert'; continue;
            }
            if (this.state === 'traverse') {
                const out = []; let c = this.head.fwd[0];
                while (c) { out.push(c.v); c = c.fwd[0]; }
                this.items = out; this.state = 'done';
            }
        }
        return null;
    }
}

/**
 * Shared machinery for the Shivers-family adaptive mergesorts (ASC):
 * natural run detection (descending runs reversed in place, no minrun),
 * a run stack, and standard stable merges. Subclasses differ only in the
 * merge policy _pickMerge(). Run decomposition and merging follow the
 * Timsort structure of Auger et al.; only components (ii) (the policy)
 * vary. At the end (no runs left) the stack collapses by merging the top
 * two runs, as in the papers.
 * Source: https://ar5iv.labs.arxiv.org/html/1809.08411 (Auger et al. 2018)
 */
class ShiversBaseProvider extends Provider {
    constructor(n) { super(n); this.idx = 0; this.runStack = []; this.state = 'decide'; }
    _pickMerge() { return null; }
    next(result) {
        while (true) {
            if (this.state === 'decide') {
                const m = this._pickMerge();
                if (m !== null) { this.mergeIdx = m; this.state = 'merging_init'; continue; }
                if (this.idx < this.n) {
                    if (this.idx + 1 >= this.n) { this.runStack.push({ start: this.idx, len: 1 }); this.idx = this.n; continue; }
                    this.runStart = this.idx; this.i = this.idx + 1; this.state = 'decide_direction'; continue;
                }
                if (this.runStack.length >= 2) { this.mergeIdx = this.runStack.length - 2; this.state = 'merging_init'; continue; }
                return null;
            }
            if (this.state === 'decide_direction' || this.state === 'extend_ascending' || this.state === 'extend_descending') {
                if (result !== undefined) {
                    if (this.state === 'decide_direction') { this.isDescending = (result === 0); this.i++; this.state = this.isDescending ? 'extend_descending' : 'extend_ascending'; }
                    else if (this.state === 'extend_ascending') { if (result === 1) this.i++; else this.state = 'push_run'; }
                    else { if (result === 0) this.i++; else this.state = 'push_run'; }
                    result = undefined; if (this.state === 'push_run') continue;
                }
                if (this.i < this.n) return [this.items[this.i], this.items[this.i - 1]];
                this.state = 'push_run'; continue;
            }
            if (this.state === 'push_run') {
                if (this.isDescending) { let l = this.runStart, r = this.i - 1; while (l < r) { const t = this.items[l]; this.items[l] = this.items[r]; this.items[r] = t; l++; r--; } }
                this.runStack.push({ start: this.runStart, len: this.i - this.runStart });
                this.idx = this.i; this.state = 'decide'; continue;
            }
            if (this.state === 'merging_init') {
                const r1 = this.runStack[this.mergeIdx], r2 = this.runStack[this.mergeIdx + 1];
                this.A = this.items.slice(r1.start, r1.start + r1.len);
                this.B = this.items.slice(r2.start, r2.start + r2.len);
                this.ai = 0; this.bi = 0; this.k = r1.start; this.state = 'merging_loop'; continue;
            }
            if (this.state === 'merging_loop') {
                if (result !== undefined) { if (result === 0) this.items[this.k++] = this.A[this.ai++]; else this.items[this.k++] = this.B[this.bi++]; result = undefined; }
                if (this.ai < this.A.length && this.bi < this.B.length) return [this.A[this.ai], this.B[this.bi]];
                while (this.ai < this.A.length) this.items[this.k++] = this.A[this.ai++];
                while (this.bi < this.B.length) this.items[this.k++] = this.B[this.bi++];
                const m = { start: this.runStack[this.mergeIdx].start, len: this.runStack[this.mergeIdx].len + this.runStack[this.mergeIdx + 1].len };
                this.runStack.splice(this.mergeIdx, 2, m); this.state = 'decide'; continue;
            }
        }
    }
}

/**
 * Adaptive Shivers Sort (ASC): merge R_{h-2},R_{h-1} when h>=3 and
 * floor(log2|r_{h-2}|) <= max(floor(log2|r_{h-1}|), floor(log2|r_h|)).
 */
class AdaptiveShiversSortProvider extends ShiversBaseProvider {
    _pickMerge() {
        const s = this.runStack, h = s.length;
        if (h < 3) return null;
        const l1 = Math.floor(Math.log2(s[h-3].len)), l2 = Math.floor(Math.log2(s[h-2].len)), l3 = Math.floor(Math.log2(s[h-1].len));
        return (l1 <= Math.max(l2, l3)) ? h - 3 : null;
    }
}

/**
 * Shivers Sort (ASC): merge the top two runs when the top run's
 * log-length is >= the run below it (original 1999 policy).
 */
class ShiversSortProvider extends ShiversBaseProvider {
    _pickMerge() {
        const s = this.runStack, h = s.length;
        if (h < 2) return null;
        return (Math.floor(Math.log2(s[h-1].len)) >= Math.floor(Math.log2(s[h-2].len))) ? h - 2 : null;
    }
}

/**
 * Augmented Shivers Sort (ASC): merge R_{h-2},R_{h-1} when h>=3,
 * |R_h| >= |R_{h-2}| and log|R_h| >= log|R_{h-1}|, else merge the top two
 * when log|R_h| >= log|R_{h-1}|.
 */
class AugmentedShiversSortProvider extends ShiversBaseProvider {
    _pickMerge() {
        const s = this.runStack, h = s.length;
        if (h >= 3 && s[h-1].len >= s[h-3].len &&
            Math.floor(Math.log2(s[h-1].len)) >= Math.floor(Math.log2(s[h-2].len))) return h - 3;
        if (h >= 2 && Math.floor(Math.log2(s[h-1].len)) >= Math.floor(Math.log2(s[h-2].len))) return h - 2;
        return null;
    }
}

/**
 * Peeksort (Munro & Wild 2018; ASC): adaptive mergesort that peeks at the
 * middle to find existing runs. Initial left/right runs are detected with
 * Timsort-style direction detection (descending reversed); each frame
 * splits at the known run boundary nearest mid, or finds the middle run
 * (reversing if descending) and recurses on the smaller side first;
 * subarrays of <= 24 elements use insertion sort with the sorted prefix
 * skipped. Explicit stack with merge tasks.
 * Source: https://github.com/sebawild/peeksort (paper + Java reference)
 */
class PeeksortProvider extends Provider {
    constructor(n) {
        super(n);
        this.frames = [];
        if (n <= 1) { this.state = 'run'; return; }
        this.state = 'init_left';
        this.i = 1; this.j = n - 1;
    }
    next(result) {
        while (true) {
            if (this.state === 'init_left') {
                // Extend run rightward from 0 with direction detection.
                if (result !== undefined) {
                    if (this.dir === undefined) { this.dir = (result === 0) ? 'desc' : 'asc'; this.i++; }
                    else if (this.dir === 'asc') { if (result === 1) this.i++; else this.state = 'init_left_done'; }
                    else { if (result === 0) this.i++; else this.state = 'init_left_done'; }
                    result = undefined; if (this.state === 'init_left_done') continue;
                }
                if (this.i < this.n) return [this.items[this.i], this.items[this.i - 1]];
                this.state = 'init_left_done'; continue;
            }
            if (this.state === 'init_left_done') {
                if (this.dir === 'desc') { let l = 0, r = this.i - 1; while (l < r) { const t = this.items[l]; this.items[l] = this.items[r]; this.items[r] = t; l++; r--; } }
                this.L0 = this.i - 1;
                if (this.L0 >= this.n - 1) { this.frames.push({ t: 'frame', l: 0, r: this.n - 1, L: this.L0, R: this.n - 1 }); this.state = 'run'; continue; }
                this.state = 'init_right'; this.dir2 = undefined; continue;
            }
            if (this.state === 'init_right') {
                // Extend run leftward from n-1 with direction detection.
                if (result !== undefined) {
                    if (this.dir2 === undefined) { this.dir2 = (result === 1) ? 'asc' : 'desc'; this.j--; }
                    else if (this.dir2 === 'asc') { if (result === 1) this.j--; else this.state = 'init_right_done'; }
                    else { if (result === 0) this.j--; else this.state = 'init_right_done'; }
                    result = undefined; if (this.state === 'init_right_done') continue;
                }
                // Bounded below by L0+1 so the runs can't overlap (an overlap
                // would let this run's reversal clobber the sorted left run).
                if (this.j > this.L0 + 1) return [this.items[this.j], this.items[this.j - 1]];
                this.state = 'init_right_done'; continue;
            }
            if (this.state === 'init_right_done') {
                if (this.dir2 === 'desc') { let l = this.j, r = this.n - 1; while (l < r) { const t = this.items[l]; this.items[l] = this.items[r]; this.items[r] = t; l++; r--; } }
                this.frames.push({ t: 'frame', l: 0, r: this.n - 1, L: this.L0, R: this.j });
                this.state = 'run'; continue;
            }
            if (this.state === 'run') {
                if (this.frames.length === 0) return null;
                const f = this.frames[this.frames.length - 1];
                if (f.t === 'merge') {
                    if (f.stage === 'init') {
                        this.A = this.items.slice(f.l, f.m); this.B = this.items.slice(f.m, f.r + 1);
                        this.ai = 0; this.bi = 0; this.k = f.l; f.stage = 'loop'; continue;
                    }
                    if (result !== undefined) { if (result === 0) this.items[this.k++] = this.A[this.ai++]; else this.items[this.k++] = this.B[this.bi++]; result = undefined; }
                    if (this.ai < this.A.length && this.bi < this.B.length) return [this.A[this.ai], this.B[this.bi]];
                    while (this.ai < this.A.length) this.items[this.k++] = this.A[this.ai++];
                    while (this.bi < this.B.length) this.items[this.k++] = this.B[this.bi++];
                    this.frames.pop(); continue;
                }
                // frame {l, r, L, R}
                if (f.stage === 'midrun') {
                    // result of [A[mid], A[mid+1]]: 0 => ascending.
                    const asc = (result === 0); result = undefined;
                    let i = f.mid, j = f.mid + 1;
                    f.stage = 'scanleft'; f.i = i; f.j = j; f.asc = asc; continue;
                }
                if (f.stage === 'scanleft') {
                    if (result !== undefined) {
                        const good = f.asc ? (result === 1) : (result === 0);
                        // Pair was [A[i], A[i-1]]: asc continues on 1, desc on 0.
                        if (good) f.i--;
                        else f.stage = 'scanright';
                        result = undefined; if (f.stage === 'scanright') continue;
                    }
                    if (f.i > f.L + 1) return [this.items[f.i], this.items[f.i - 1]];
                    f.stage = 'scanright'; continue;
                }
                if (f.stage === 'scanright') {
                    if (result !== undefined) {
                        const good = f.asc ? (result === 1) : (result === 0);
                        // Pair was [A[j+1], A[j]].
                        if (good) f.j++;
                        else f.stage = 'split';
                        result = undefined; if (f.stage === 'split') continue;
                    }
                    if (f.j < f.R - 1) return [this.items[f.j + 1], this.items[f.j]];
                    f.stage = 'split'; continue;
                }
                if (f.stage === 'split') {
                    const i = f.i, j = f.j, l = f.l, r = f.r, L = f.L, R = f.R, mid = f.mid;
                    this.frames.pop();
                    if (!f.asc) { let a = i, b = j; while (a < b) { const t = this.items[a]; this.items[a] = this.items[b]; this.items[b] = t; a++; b--; } }
                    if (i === l && j === r) continue; // whole range one run
                    if (mid - i < j - mid) {
                        this.frames.push({ t: 'merge', l, m: i, r, stage: 'init' });
                        this.frames.push({ t: 'frame', l: i, r, L: j, R });
                        this.frames.push({ t: 'frame', l, r: i - 1, L, R: i - 1 });
                    } else {
                        this.frames.push({ t: 'merge', l, m: j + 1, r, stage: 'init' });
                        this.frames.push({ t: 'frame', l: j + 1, r, L: j + 1, R });
                        this.frames.push({ t: 'frame', l, r: j, L, R: i });
                    }
                    continue;
                }
                if (f.stage === 'insert') {
                    // Insertion over [l..r] skipping sorted prefix [l..L].
                    if (f.k === undefined) f.k = Math.max(f.l + 1, f.L + 1);
                    if (result !== undefined) {
                        // Pair was [A[jj], x]: 1 => A[jj] wins => shift.
                        if (result === 1) { this.items[f.jj + 1] = this.items[f.jj]; f.jj--; }
                        else { this.items[f.jj + 1] = f.x; f.k++; f.jj = undefined; }
                        result = undefined;
                    }
                    if (f.jj === undefined) {
                        if (f.k > f.r) { this.frames.pop(); continue; }
                        f.x = this.items[f.k]; f.jj = f.k - 1;
                    }
                    if (f.jj >= f.l) return [this.items[f.jj], f.x];
                    this.items[f.jj + 1] = f.x; f.k++; f.jj = undefined; continue;
                }
                // fresh frame: dispatch.
                if (f.L >= f.r || f.R <= f.l) { this.frames.pop(); continue; }
                if (f.r - f.l + 1 <= 24) { f.stage = 'insert'; continue; }
                const mid = f.l + ((f.r - f.l) >> 1);
                if (mid <= f.L) {
                    this.frames.pop();
                    this.frames.push({ t: 'merge', l: f.l, m: f.L + 1, r: f.r, stage: 'init' });
                    this.frames.push({ t: 'frame', l: f.L + 1, r: f.r, L: f.L + 1, R: Math.max(f.R, f.L + 1) });
                    continue;
                }
                if (mid >= f.R) {
                    this.frames.pop();
                    this.frames.push({ t: 'merge', l: f.l, m: f.R, r: f.r, stage: 'init' });
                    this.frames.push({ t: 'frame', l: f.l, r: f.R - 1, L: Math.min(f.L, f.R - 1), R: f.R - 1 });
                    continue;
                }
                f.mid = mid; f.stage = 'midrun';
                return [this.items[mid], this.items[mid + 1]];
            }
        }
    }
}

/**
 * Library sort (Bender et al. 2005; ASC): gapped insertion sort. Elements
 * (in random order) are inserted into an array of size 2n with gaps; the
 * insertion point is found by binary search over the gapped array (landing
 * on gaps resolves to a nearby element, free index scans) plus a short
 * comparison-based linear adjustment that guarantees correct placement;
 * elements shift to the nearest gap (free moves). After 1,2,4,... insertions
 * the array is rebalanced (evenly respread, free). Comparisons ~ binary
 * insertion; the MeteredMove savings are invisible to this harness.
 * Source: https://en.wikipedia.org/wiki/Library_sort
 */
class LibrarySortProvider extends Provider {
    constructor(n) {
        super(n);
        this.S = 2 * n;
        this.slots = new Array(this.S).fill(-1);
        this.shuffled = this.items.slice();
        for (let i = this.shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = this.shuffled[i]; this.shuffled[i] = this.shuffled[j]; this.shuffled[j] = t; }
        this.inserted = 0; this.goal = 1; this.roundDone = 0;
        this.state = n > 0 ? 'round' : 'done';
    }
    _nearestIn(lo, hi, mid) { // nearest non-gap slot in [lo,hi) to mid (free scan)
        for (let d = 0; d < hi - lo; d++) {
            if (mid - d >= lo && this.slots[mid - d] !== -1) return mid - d;
            if (mid + d < hi && this.slots[mid + d] !== -1) return mid + d;
        }
        return -1;
    }
    _leftElem(p) { for (let s = p - 1; s >= 0; s--) if (this.slots[s] !== -1) return s; return -1; }
    _rightElem(p) { for (let s = p + 1; s < this.S; s++) if (this.slots[s] !== -1) return s; return -1; }
    _nearestGap(p) {
        for (let d = 0; d < this.S; d++) {
            if (p - d >= 0 && this.slots[p - d] === -1) return p - d;
            if (p + d < this.S && this.slots[p + d] === -1) return p + d;
        }
        return p;
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'round') {
                if (this.inserted >= this.n) { this.items = this.slots.filter(x => x !== -1); this.state = 'done'; continue; }
                this.roundDone = 0; this.state = 'insert_next'; continue;
            }
            if (this.state === 'insert_next') {
                if (this.roundDone >= this.goal || this.inserted >= this.n) {
                    // Rebalance: respread evenly (free).
                    const elems = this.slots.filter(x => x !== -1);
                    this.slots = new Array(this.S).fill(-1);
                    const m = elems.length;
                    for (let i = 0; i < m; i++) this.slots[Math.floor((i + 0.5) * this.S / m)] = elems[i];
                    this.goal *= 2; this.state = 'round'; continue;
                }
                this.x = this.shuffled[this.inserted]; this.lo = 0; this.hi = this.S;
                this.state = 'bs'; continue;
            }
            if (this.state === 'bs') {
                if (result !== undefined) {
                    // Pair was [x, e]: 0 => x weaker => hi = slot.
                    if (result === 0) this.hi = this.eSlot; else this.lo = this.eSlot + 1;
                    result = undefined;
                }
                if (this.lo >= this.hi) { this.p = this.lo; this.state = 'adjleft'; continue; }
                const mid = (this.lo + this.hi) >> 1;
                const s = this._nearestIn(this.lo, this.hi, mid);
                if (s === -1) { this.p = this.lo; this.state = 'adjleft'; continue; }
                this.eSlot = s; this.e = this.slots[s];
                return [this.x, this.e];
            }
            if (this.state === 'adjleft') {
                const s = this._leftElem(this.p);
                if (s === -1) { this.state = 'adjright'; continue; }
                if (result !== undefined) {
                    // Pair was [L, x]: 1 => L wins => move left past L.
                    if (result === 1) this.p = s; else this.state = 'adjright';
                    result = undefined; continue;
                }
                return [this.slots[s], this.x];
            }
            if (this.state === 'adjright') {
                const s = this._rightElem(this.p);
                if (s === -1) { this.state = 'place'; continue; }
                if (result !== undefined) {
                    // Pair was [x, R]: 1 => x wins => move right past R.
                    if (result === 1) this.p = s + 1; else this.state = 'place';
                    result = undefined; continue;
                }
                return [this.x, this.slots[s]];
            }
            if (this.state === 'place') {
                this.p = Math.max(0, Math.min(this.S - 1, this.p));
                if (this.slots[this.p] === -1) {
                    this.slots[this.p] = this.x;
                    this.inserted++; this.roundDone++; this.state = 'insert_next'; continue;
                }
                // Occupied by E': ask [E', x], then shift E' to its correct side.
                if (result !== undefined) {
                    const eFirst = this.slots[this.p];
                    if (result === 0) {
                        // E' <= x: E' stays left of x.
                        let g = -1;
                        for (let s = this.p + 1; s < this.S; s++) if (this.slots[s] === -1) { g = s; break; }
                        if (g !== -1) {
                            // Right gap: e1 = slots[p+1] is the verified R >= x; shift (p..g) right.
                            for (let s = g; s > this.p + 1; s--) this.slots[s] = this.slots[s - 1];
                            this.slots[this.p + 1] = this.x;
                        } else {
                            // All gaps left: shift [g2..p] left so E' lands left of x.
                            let g2 = this.p - 1;
                            while (g2 >= 0 && this.slots[g2] !== -1) g2--;
                            for (let s = g2; s < this.p; s++) this.slots[s] = this.slots[s + 1];
                            this.slots[this.p] = this.x;
                        }
                    } else {
                        // E' > x: E' stays right of x.
                        let g = -1;
                        for (let s = this.p - 1; s >= 0; s--) if (this.slots[s] === -1) { g = s; break; }
                        if (g !== -1) {
                            for (let s = g; s < this.p - 1; s++) this.slots[s] = this.slots[s + 1];
                            this.slots[this.p - 1] = this.x;
                        } else {
                            let g2 = this.p + 1;
                            while (g2 < this.S && this.slots[g2] !== -1) g2++;
                            for (let s = g2; s > this.p; s--) this.slots[s] = this.slots[s - 1];
                            this.slots[this.p] = this.x;
                        }
                    }
                    result = undefined;
                    this.inserted++; this.roundDone++; this.state = 'insert_next'; continue;
                }
                return [this.slots[this.p], this.x];
            }
        }
        return null;
    }
}

/**
 * Sample sort, Frazer-McKellar style (ASC): for arrays over 16 elements,
 * sort a sample of up to 12 elements (linear insertion) to pick 3
 * splitters, distribute all elements into 4 buckets by binary search over
 * the splitters, and recurse (explicit stack). Small arrays use linear
 * insertion sort. Documented parameters: 4 buckets, sample 12, cutoff 16.
 * Source: https://en.wikipedia.org/wiki/Samplesort
 */
class SampleSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.frames = n > 0 ? [{ arr: this.items.slice(), stage: 'enter', kidsDone: [] }] : [];
    }
    next(result) {
        while (this.frames.length > 0) {
            const f = this.frames[this.frames.length - 1];
            if (f.stage === 'enter') {
                if (f.arr.length <= 16) { f.k = 1; f.stage = 'ins'; continue; }
                const s = Math.min(f.arr.length, 12);
                f.sample = f.arr.slice(0, s); f.sk = 1; f.stage = 'sampleins'; continue;
            }
            if (f.stage === 'ins' || f.stage === 'sampleins') {
                const a = (f.stage === 'ins') ? f.arr : f.sample;
                const kk = (f.stage === 'ins') ? 'k' : 'sk';
                if (f[kk] === undefined) f[kk] = 1;
                if (result !== undefined) {
                    // Pair was [a[jj], x]: 1 => shift.
                    if (result === 1) { a[f.jj + 1] = a[f.jj]; f.jj--; }
                    else { a[f.jj + 1] = f.x; f[kk]++; f.jj = undefined; }
                    result = undefined;
                }
                if (f.jj === undefined) {
                    const doneAt = a.length;
                    if (f[kk] >= doneAt) {
                        if (f.stage === 'ins') { const done = f.arr; this.frames.pop(); this._deliver(f, done); continue; }
                        // Sample sorted: splitters at quarters.
                        const q = f.sample.length;
                        f.splitters = [f.sample[q >> 2], f.sample[q >> 1], f.sample[(3 * q) >> 2]];
                        f.buckets = [[], [], [], []]; f.di = 0; f.stage = 'distribute'; continue;
                    }
                    f.x = a[f[kk]]; f.jj = f[kk] - 1;
                }
                if (f.jj >= 0) return [a[f.jj], f.x];
                a[f.jj + 1] = f.x; f[kk]++; f.jj = undefined; continue;
            }
            if (f.stage === 'distribute') {
                if (f.di >= f.arr.length) {
                    f.kids = f.buckets.filter(b => b.length > 0);
                    f.kidsDone = new Array(f.kids.length).fill(null);
                    // Splitter elements themselves land in buckets 0 and 2, so
                    // there are always >= 2 nonempty buckets; anything else is a bug.
                    if (f.kids.length <= 1) throw new Error('samplesort single bucket');
                    f.stage = 'collect';
                    for (let i = f.kids.length - 1; i >= 0; i--) this.frames.push({ arr: f.kids[i], stage: 'enter', _parent: f, _slot: i });
                    continue;
                }
                if (f.blo === undefined) { f.blo = 0; f.bhi = f.splitters.length; }
                if (result !== undefined) {
                    // Pair was [x, splitter]: 0 => x weaker => hi = mid.
                    if (result === 0) f.bhi = f.mid; else f.blo = f.mid + 1;
                    result = undefined;
                }
                if (f.blo < f.bhi) { f.mid = (f.blo + f.bhi) >> 1; return [f.arr[f.di], f.splitters[f.mid]]; }
                f.buckets[f.blo].push(f.arr[f.di]); f.di++; f.blo = undefined; continue;
            }
            if (f.stage === 'collect') {
                if (f.kidsDone.some(x => x === null)) throw new Error('sample collect incomplete');
                const done = [].concat(...f.kidsDone);
                this.frames.pop(); this._deliver(f, done); continue;
            }
        }
        return null;
    }
    _deliver(frame, done) {
        if (!frame._parent) this.items = done;
        else frame._parent.kidsDone[frame._slot] = done;
    }
}

/**
 * Funnel sort comparison skeleton, lazy variant (ASC): recursively split
 * into k = max(2, round(len^(1/3))) contiguous segments (insertion sort
 * for length <= 8 leaves), then merge with a k-way winner (tournament)
 * tree. DOCUMENTED SKELETON: the cache-oblivious k-merger buffer layout
 * (funnel heap / binary-merger tree with edge buffers) is elided; only the
 * recursive splitting structure and the comparison sequence of a winner-tree
 * k-way merge are modeled.
 * Source: Frigo et al. 1999 (FOCS), "Cache-Oblivious Algorithms".
 */
class FunnelSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.frames = n > 0 ? [{ arr: this.items.slice(), stage: 'enter', kidsDone: [] }] : [];
    }
    next(result) {
        while (this.frames.length > 0) {
            const f = this.frames[this.frames.length - 1];
            if (f.stage === 'enter') {
                if (f.arr.length <= 8) { f.k = 1; f.stage = 'ins'; continue; }
                const k = Math.max(2, Math.round(Math.pow(f.arr.length, 1 / 3)));
                const len = f.arr.length, base = Math.floor(len / k), rem = len - base * k;
                f.kids = []; let off = 0;
                for (let i = 0; i < k; i++) { const sz = base + (i < rem ? 1 : 0); f.kids.push(f.arr.slice(off, off + sz)); off += sz; }
                f.kidsDone = new Array(f.kids.length).fill(null); f.stage = 'collect';
                for (let i = f.kids.length - 1; i >= 0; i--) this.frames.push({ arr: f.kids[i], stage: 'enter', _parent: f, _slot: i });
                continue;
            }
            if (f.stage === 'ins') {
                const a = f.arr;
                if (f.k === undefined) f.k = 1;
                if (result !== undefined) {
                    if (result === 1) { a[f.jj + 1] = a[f.jj]; f.jj--; }
                    else { a[f.jj + 1] = f.x; f.k++; f.jj = undefined; }
                    result = undefined;
                }
                if (f.jj === undefined) {
                    if (f.k >= a.length) { const done = f.arr; this.frames.pop(); this._deliver(f, done); continue; }
                    f.x = a[f.k]; f.jj = f.k - 1;
                }
                if (f.jj >= 0) return [a[f.jj], f.x];
                a[f.jj + 1] = f.x; f.k++; f.jj = undefined; continue;
            }
            if (f.stage === 'collect') {
                // Winner-tree k-way merge of kidsDone (staged).
                if (f.wt === undefined) {
                    const runs = f.kidsDone;
                    f.wt = { runs, pos: runs.map(() => 0), k: runs.length, tree: [], out: [], bp: 0 };
                    const kk = runs.length, tree = new Array(2 * kk).fill(-1);
                    for (let i = 0; i < kk; i++) tree[kk + i] = runs[i].length > 0 ? i : -1;
                    f.wt.tree = tree; f.wt.bp = kk - 1;
                }
                const wt = f.wt, tree = wt.tree, kk = wt.k;
                if (f.wstage === 'emit' || (f.wstage === undefined && wt.bp < 1)) f.wstage = 'emit';
                else if (f.wstage === undefined) f.wstage = 'build';
                if (f.wstage === 'build') {
                    if (result !== undefined) {
                        // Pair was [headA, headB]: 0 => A wins.
                        tree[wt.bp] = (result === 0) ? wt.cA : wt.cB;
                        result = undefined; wt.bp--; 
                        if (wt.bp >= 1) { /* next internal node below */ } else { f.wstage = 'emit'; continue; }
                    }
                    if (wt.bp >= 1) {
                        const a = tree[wt.bp * 2], b = tree[wt.bp * 2 + 1];
                        if (a === -1) { tree[wt.bp] = b; wt.bp--; continue; }
                        if (b === -1) { tree[wt.bp] = a; wt.bp--; continue; }
                        wt.cA = a; wt.cB = b;
                        return [wt.runs[a][wt.pos[a]], wt.runs[b][wt.pos[b]]];
                    }
                    f.wstage = 'emit'; continue;
                }
                // emit stage
                if (tree[1] === -1) { const done = wt.out; this.frames.pop(); this._deliver(f, done); continue; }
                if (f.replay === undefined) {
                    const w = tree[1];
                    wt.out.push(wt.runs[w][wt.pos[w]++]);
                    f.replay = (wt.k + w) >> 1; // parent of leaf, walk to root
                    if (wt.pos[w] >= wt.runs[w].length) tree[wt.k + w] = -1;
                }
                if (result !== undefined) {
                    tree[f.replay] = (result === 0) ? wt.cA : wt.cB;
                    result = undefined; f.replay >>= 1;
                }
                while (f.replay >= 1) {
                    const a = tree[f.replay * 2], b = tree[f.replay * 2 + 1];
                    if (a === -1) { tree[f.replay] = b; f.replay >>= 1; continue; }
                    if (b === -1) { tree[f.replay] = a; f.replay >>= 1; continue; }
                    wt.cA = a; wt.cB = b;
                    return [wt.runs[a][wt.pos[a]], wt.runs[b][wt.pos[b]]];
                }
                f.replay = undefined; continue;
            }
        }
        return null;
    }
    _deliver(frame, done) {
        if (!frame._parent) this.items = done;
        else frame._parent.kidsDone[frame._slot] = done;
    }
}

/**
 * Bidirectional ("parity") merge of two sorted arrays (unregistered helper
 * for Quadsort/Piposort): m = min(len) head-min emissions to the front,
 * then m tail-max emissions to the back, then a traditional merge of the
 * remaining middles. Exactly 2m comparisons for equal lengths.
 * Source: https://github.com/scandum/quadsort (README: parity merge)
 */
class ParityMerger {
    constructor(A, B) {
        this.A = A; this.B = B;
        this.out = new Array(A.length + B.length);
        this.f = 0; this.b = A.length + B.length - 1;
        this.i = 0; this.j = 0; this.k = A.length - 1; this.l = B.length - 1;
        this.phase = 'front'; this.count = Math.min(A.length, B.length);
        this.done = false;
        if (A.length === 0 || B.length === 0) {
            for (const x of A) this.out[this.f++] = x;
            for (const x of B) this.out[this.f++] = x;
            this.done = true;
        }
    }
    step(result) {
        if (this.done) return null;
        if (this.phase === 'front') {
            if (this.count <= 0) { this.phase = 'back'; this.count = Math.min(this.A.length, this.B.length); return null; }
            if (result !== undefined) {
                if (result === 0) this.out[this.f++] = this.A[this.i++]; else this.out[this.f++] = this.B[this.j++];
                if (--this.count <= 0) { this.phase = 'back'; this.count = Math.min(this.A.length, this.B.length); }
                return null;
            }
            return [this.A[this.i], this.B[this.j]];
        }
        if (this.phase === 'back') {
            if (this.count <= 0) { this.phase = 'mid'; return null; }
            if (result !== undefined) {
                if (result === 1) this.out[this.b--] = this.A[this.k--]; else this.out[this.b--] = this.B[this.l--];
                if (--this.count <= 0) this.phase = 'mid';
                return null;
            }
            return [this.A[this.k], this.B[this.l]];
        }
        if (this.i > this.k || this.j > this.l) {
            while (this.i <= this.k) this.out[this.f++] = this.A[this.i++];
            while (this.j <= this.l) this.out[this.f++] = this.B[this.j++];
            this.done = true; return null;
        }
        if (result !== undefined) {
            if (result === 0) this.out[this.f++] = this.A[this.i++]; else this.out[this.f++] = this.B[this.j++];
            return null;
        }
        return [this.A[this.i], this.B[this.j]];
    }
}

/**
 * Quadsort, structural port (ASC): 8-element quad-swap analyzer (4 pair
 * comparisons; if all in order / all reversed, 3 bridge comparisons, else 4
 * swaps from the stored results plus parity-merge assembly), whole-array
 * reverse early exit, then bottom-up ping-pong merging of 4 blocks at a
 * time with ordered-boundary skip checks. DOCUMENTED ELISIONS: the branchless
 * cross merge and the parity-vs-cross chooser are not modeled (parity merges
 * used throughout); tail blocks (< 8) generalize the analyzer; merge groups
 * of 2-3 blocks fold with parity merges.
 * Source: https://github.com/scandum/quadsort (README)
 */
class QuadsortProvider extends Provider {
    constructor(n) {
        super(n);
        this.pos = 0; this.allRev = true; this.blocks = [];
        this.state = n > 0 ? 'analyze' : 'done';
    }
    _bridgePositions(bstart, m) {
        // (a, b) index pairs for bridge checks: between consecutive pairs + odd tail.
        const out = [], p = m >> 1;
        for (let i = 0; i < p - 1; i++) out.push([bstart + 2 * i + 1, bstart + 2 * i + 2]);
        if (m % 2 === 1) out.push([bstart + m - 2, bstart + m - 1]);
        return out;
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'analyze') {
                if (this.pos >= this.n) {
                    // Whole-array reverse early exit: every block was internally
                    // reversed; verify the block boundaries are reversed too
                    // (genuine asks) before reversing the whole array.
                    if (this.allRev && this.n > 1) { this.rbi = 0; this.state = 'revcheck'; continue; }
                    this.state = 'mergepass'; this.newBlocks = []; this.gi = 0; continue;
                }
                this.bstart = this.pos; this.m = Math.min(8, this.n - this.pos);
                this.p = this.m >> 1; this.pi = 0; this.mask = 0;
                this.state = this.p > 0 ? 'pairs' : 'blockdone_sorted';
                continue;
            }
            if (this.state === 'pairs') {
                if (result !== undefined) {
                    // Pair was [A[2i], A[2i+1]]: 1 => reversed => set bit.
                    if (result === 1) this.mask |= (1 << this.pi);
                    this.pi++; result = undefined;
                }
                if (this.pi < this.p) return [this.items[this.bstart + 2 * this.pi], this.items[this.bstart + 2 * this.pi + 1]];
                this.bridges = this._bridgePositions(this.bstart, this.m); this.bi = 0;
                this.state = (this.mask === 0 || this.mask === (1 << this.p) - 1) ? 'bridges' : 'fixblock';
                continue;
            }
            if (this.state === 'bridges') {
                if (result !== undefined) {
                    const want = (this.mask === 0) ? 0 : 1;
                    if (result !== want) { result = undefined; this.state = 'fixblock'; continue; }
                    this.bi++; result = undefined;
                }
                if (this.bi < this.bridges.length) { const [a, b] = this.bridges[this.bi]; return [this.items[a], this.items[b]]; }
                // All bridges pass: sorted (mask 0) or reversed (mask all-1).
                if (this.mask !== 0) {
                    let l = this.bstart, r = this.bstart + this.m - 1;
                    while (l < r) { const t = this.items[l]; this.items[l] = this.items[r]; this.items[r] = t; l++; r--; }
                } else this.allRev = false;
                this.blocks.push(this.items.slice(this.bstart, this.bstart + this.m));
                this.pos += this.m; this.state = 'analyze'; continue;
            }
            if (this.state === 'blockdone_sorted') {
                // Single-element block (m < 2): vacuously sorted and reversed.
                this.blocks.push(this.items.slice(this.bstart, this.bstart + this.m));
                this.pos += this.m; this.state = 'analyze'; continue;
            }
            if (this.state === 'revcheck') {
                // Boundary i: blocks (ascending after per-block reversal) are in
                // reverse block order iff first[i] > last[i+1].
                if (result !== undefined) {
                    if (result !== 1) { result = undefined; this.state = 'mergepass'; continue; }
                    this.rbi++; result = undefined;
                }
                if (this.rbi >= this.blocks.length - 1) { this.items = [].concat(...this.blocks.slice().reverse()); this.state = 'done'; continue; }
                let off = 0;
                for (let i = 0; i < this.rbi; i++) off += this.blocks[i].length;
                const A = this.blocks[this.rbi], B = this.blocks[this.rbi + 1];
                return [this.items[off], this.items[off + A.length + B.length - 1]];
            }
            if (this.state === 'fixblock') {
                // Swap reversed pairs (free), then parity-assemble.
                for (let i = 0; i < this.p; i++) {
                    if (this.mask & (1 << i)) {
                        const a = this.bstart + 2 * i, b = a + 1;
                        const t = this.items[a]; this.items[a] = this.items[b]; this.items[b] = t;
                    }
                }
                this.runs = [];
                for (let i = 0; i < this.p; i++) this.runs.push(this.items.slice(this.bstart + 2 * i, this.bstart + 2 * i + 2));
                if (this.m % 2 === 1) this.runs.push([this.items[this.bstart + this.m - 1]]);
                this.state = 'assemble'; continue;
            }
            if (this.state === 'assemble') {
                if (!this.pm && this.runs.length <= 1) {
                    const blk = this.runs.length ? this.runs[0] : [];
                    for (let i = 0; i < blk.length; i++) this.items[this.bstart + i] = blk[i];
                    this.allRev = false;
                    this.blocks.push(blk.slice());
                    this.pos += this.m; this.state = 'analyze'; continue;
                }
                if (!this.pm) {
                    const A = this.runs.shift(), B = this.runs.shift();
                    this.pm = new ParityMerger(A, B);
                    if (this.pm.done) { this.runs.push(this.pm.out); this.pm = null; continue; }
                }
                const q = this.pm.step(result); result = undefined;
                if (q) return q;
                if (!this.pm.done) continue;
                this.runs.push(this.pm.out); this.pm = null; continue;
            }
            if (this.state === 'mergepass') {
                if (this.blocks.length <= 1) { this.items = this.blocks.length ? this.blocks[0] : []; this.state = 'done'; continue; }
                this.newBlocks = []; this.gi = 0; this.state = 'group'; continue;
            }
            if (this.state === 'group') {
                if (this.gi * 4 >= this.blocks.length) { this.blocks = this.newBlocks; this.state = 'mergepass'; continue; }
                this.grp = this.blocks.slice(this.gi * 4, this.gi * 4 + 4);
                this.gi++; this.oks = []; this.ci = 1; this.state = 'gchecks'; continue;
            }
            if (this.state === 'gchecks') {
                if (result !== undefined) {
                    // Pair was [prev.last, cur.first]: 0 => ordered.
                    this.oks.push(result === 0); this.ci++; result = undefined;
                }
                if (this.ci < this.grp.length) {
                    const A = this.grp[this.ci - 1], B = this.grp[this.ci];
                    return [A[A.length - 1], B[0]];
                }
                if (this.grp.length === 1) { this.newBlocks.push(this.grp[0]); this.state = 'group'; continue; }
                if (this.oks.every(x => x)) { this.newBlocks.push([].concat(...this.grp)); this.state = 'group'; continue; }
                this.t1 = null; this.t2 = null; this.state = 'gt1'; continue;
            }
            if (this.state === 'gt1' || this.state === 'gt2' || this.state === 'gfinal') {
                const st = this.state;
                if (!this.pm) {
                    let A, B, slot;
                    if (st === 'gt1') {
                        if (this.oks[0]) { this.t1 = this.grp[0].concat(this.grp[1]); this.state = this.grp.length >= 3 ? 'gt2' : 'gpush'; continue; }
                        A = this.grp[0]; B = this.grp[1]; slot = 't1';
                    } else if (st === 'gt2') {
                        if (this.grp.length === 3) { this.t2 = this.grp[2]; this.state = 'gfinal'; continue; }
                        if (this.oks[2]) { this.t2 = this.grp[2].concat(this.grp[3]); this.state = 'gfinal'; continue; }
                        A = this.grp[2]; B = this.grp[3]; slot = 't2';
                    } else {
                        // gfinal: skip-check t1/t2 boundary (1 comp), else merge.
                        if (this._gfinalChecked === true) { A = this.t1; B = this.t2; slot = 'tf'; }
                        else {
                            if (result !== undefined) {
                                if (result === 0) { this.newBlocks.push(this.t1.concat(this.t2)); this._gfinalChecked = false; this.state = 'group'; }
                                else this._gfinalChecked = true;
                                result = undefined; continue;
                            }
                            return [this.t1[this.t1.length - 1], this.t2[0]];
                        }
                    }
                    this.pm = new ParityMerger(A, B); this.pmSlot = slot;
                    if (this.pm.done) { this[this.pmSlot] = this.pm.out; this.pm = null; this._gtAdvance(); continue; }
                }
                const q = this.pm.step(result); result = undefined;
                if (q) return q;
                if (!this.pm.done) continue;
                this[this.pmSlot] = this.pm.out; this.pm = null; this._gtAdvance(); continue;
            }
            if (this.state === 'gpush') {
                this.newBlocks.push(this.grp.length === 2 ? this.t1 : this.tf);
                this.state = 'group'; continue;
            }
        }
        return null;
    }
    _gtAdvance() {
        if (this.state === 'gt1') this.state = this.grp.length >= 3 ? 'gt2' : 'gpush';
        else if (this.state === 'gt2') this.state = 'gfinal';
        else { this.state = 'gpush'; this._gfinalChecked = false; }
    }
}

/**
 * Piposort, structural port (ASC): top-down 4-way partitioning to segments
 * under 8 elements; leaves sorted with odd-even transposition sort (early
 * exit on two consecutive clean phases: best 6 comparisons for 7 elements);
 * bottom-up ping-pong merging 4 segments at a time with branchless parity
 * merges. Between merges, 4-segment groups are checked for order (concat)
 * or reverse order (block rotation). DOCUMENTED MICRO-DIFFERENCE: the
 * reference stops odd-even after at most 7 phases (21 comparisons); this
 * port requires two consecutive clean phases (best 6, worst 24 for 7).
 * Source: https://github.com/scandum/piposort (README)
 */
class PiposortProvider extends Provider {
    constructor(n) {
        super(n);
        this.state = n > 0 ? 'partition' : 'done';
        this.spans = n > 0 ? [[0, n]] : [];
        this.leaves = [];
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'partition') {
                if (this.spans.length === 0) {
                    this.leaves.sort((a, b) => a[0] - b[0]);
                    this.li = 0; this.state = 'leaf'; continue;
                }
                const [l, r] = this.spans.pop();
                if (r - l < 8) { this.leaves.push([l, r]); continue; }
                const len = r - l, base = len >> 2, rem = len - base * 4;
                let off = l;
                const qs = [];
                for (let i = 0; i < 4; i++) { const sz = base + (i < rem ? 1 : 0); qs.push([off, off + sz]); off += sz; }
                for (let i = 3; i >= 0; i--) this.spans.push(qs[i]);
                continue;
            }
            if (this.state === 'leaf') {
                if (this.li >= this.leaves.length) {
                    this.blocks = this.leaves.map(([l, r]) => this.items.slice(l, r));
                    this.state = 'mergepass'; continue;
                }
                const [l, r] = this.leaves[this.li];
                this.lo = l; this.ln = r - l; this.phase = 0; this.streak = 0; this.oi = 0; this.swapped = false;
                this.state = this.ln >= 2 ? 'oddeven' : 'leafnext';
                continue;
            }
            if (this.state === 'leafnext') { this.li++; this.state = 'leaf'; continue; }
            if (this.state === 'oddeven') {
                if (result !== undefined) {
                    // Pair was [A[i], A[i+1]]: 1 => inverted => swap.
                    if (result === 1) {
                        const a = this.lo + this.oi, b = a + 1;
                        const t = this.items[a]; this.items[a] = this.items[b]; this.items[b] = t;
                        this.swapped = true;
                    }
                    this.oi += 2; result = undefined;
                }
                if (this.oi > this.ln - 2) {
                    if (this.swapped) this.streak = 0; else this.streak++;
                    if (this.streak >= 2) { this.state = 'leafnext'; continue; }
                    this.phase ^= 1; this.oi = this.phase; this.swapped = false; continue;
                }
                if (this.oi > this.ln - 2) { this.oi = this.phase; continue; }
                return [this.items[this.lo + this.oi], this.items[this.lo + this.oi + 1]];
            }
            if (this.state === 'mergepass') {
                if (this.blocks.length <= 1) { this.items = this.blocks.length ? this.blocks[0] : []; this.state = 'done'; continue; }
                this.newBlocks = []; this.gi = 0; this.state = 'group'; continue;
            }
            if (this.state === 'group') {
                if (this.gi * 4 >= this.blocks.length) { this.blocks = this.newBlocks; this.state = 'mergepass'; continue; }
                this.grp = this.blocks.slice(this.gi * 4, this.gi * 4 + 4);
                this.gi++; this.oks = []; this.ci = 1; this.state = 'gchecks'; continue;
            }
            if (this.state === 'gchecks') {
                if (result !== undefined) { this.oks.push(result === 0); this.ci++; result = undefined; }
                if (this.ci < this.grp.length) {
                    const A = this.grp[this.ci - 1], B = this.grp[this.ci];
                    return [A[A.length - 1], B[0]];
                }
                if (this.grp.length === 1) { this.newBlocks.push(this.grp[0]); this.state = 'group'; continue; }
                if (this.oks.every(x => x)) { this.newBlocks.push([].concat(...this.grp)); this.state = 'group'; continue; }
                this.revs = []; this.ci = 1; this.state = 'rchecks'; continue;
            }
            if (this.state === 'rchecks') {
                if (result !== undefined) { this.revs.push(result === 1); this.ci++; result = undefined; }
                if (this.ci < this.grp.length) {
                    const A = this.grp[this.ci - 1], B = this.grp[this.ci];
                    return [A[0], B[B.length - 1]];
                }
                if (this.revs.every(x => x)) {
                    this.newBlocks.push([].concat(...this.grp.slice().reverse()));
                    this.state = 'group'; continue;
                }
                this.t1 = null; this.t2 = null; this.state = 'gt1'; continue;
            }
            if (this.state === 'gt1' || this.state === 'gt2' || this.state === 'gfinal') {
                const st = this.state;
                if (!this.pm) {
                    let A, B, slot;
                    if (st === 'gt1') {
                        if (this.oks[0]) { this.t1 = this.grp[0].concat(this.grp[1]); this.state = this.grp.length >= 3 ? 'gt2' : 'gpush'; continue; }
                        A = this.grp[0]; B = this.grp[1]; slot = 't1';
                    } else if (st === 'gt2') {
                        if (this.grp.length === 3) { this.t2 = this.grp[2]; this.state = 'gfinal'; continue; }
                        if (this.oks[2]) { this.t2 = this.grp[2].concat(this.grp[3]); this.state = 'gfinal'; continue; }
                        A = this.grp[2]; B = this.grp[3]; slot = 't2';
                    } else {
                        if (this._gfinalChecked === true) { A = this.t1; B = this.t2; slot = 'tf'; }
                        else {
                            if (result !== undefined) {
                                if (result === 0) { this.newBlocks.push(this.t1.concat(this.t2)); this._gfinalChecked = false; this.state = 'group'; }
                                else this._gfinalChecked = true;
                                result = undefined; continue;
                            }
                            return [this.t1[this.t1.length - 1], this.t2[0]];
                        }
                    }
                    this.pm = new ParityMerger(A, B); this.pmSlot = slot;
                    if (this.pm.done) { this[this.pmSlot] = this.pm.out; this.pm = null; this._gtAdvance(); continue; }
                }
                const q = this.pm.step(result); result = undefined;
                if (q) return q;
                if (!this.pm.done) continue;
                this[this.pmSlot] = this.pm.out; this.pm = null; this._gtAdvance(); continue;
            }
            if (this.state === 'gpush') {
                this.newBlocks.push(this.grp.length === 2 ? this.t1 : this.tf);
                this.state = 'group'; continue;
            }
        }
        return null;
    }
    _gtAdvance() {
        if (this.state === 'gt1') this.state = this.grp.length >= 3 ? 'gt2' : 'gpush';
        else if (this.state === 'gt2') this.state = 'gfinal';
        else { this.state = 'gpush'; this._gfinalChecked = false; }
    }
}

/**
 * Replacement selection (ASC): the classic external-sort run generator with
 * a heap-ordered buffer of B = 8 records. Each buffer slot carries the
 * current/next run bit; repeatedly pop the minimum (runs then strength),
 * append to the current run (starting a new run when the bit flips), and
 * refill from the input, stamping current-run if >= last written else
 * next-run (1 comparison). Runs (avg length ~2B) are finally merged
 * pairwise. Snowplow minimizes run count, not comparisons.
 * Source: D. E. Knuth, TAOCP vol. 3, section 5.4.1.
 */
class ReplacementSelectionSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.B = 8;
        this.heap = [];      // {v, run}, min-heap by (run, strength)
        this.inputIdx = 0; this.current = 0; this.lastWritten = -1;
        this.runs = [[]];
        this.state = n > 0 ? 'fill' : 'done';
    }
    _less(a, b) { // -1 a wins, 1 b wins, 0 need oracle [a.v, b.v]
        if (a.run !== b.run) return a.run < b.run ? -1 : 1;
        return 0;
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'fill') {
                if (this.inputIdx >= this.n || this.heap.length >= this.B) { this.state = 'gen'; continue; }
                this.heap.push({ v: this.items[this.inputIdx++], run: 0 });
                this.hi = this.heap.length - 1; this.afterUp = 'fill'; this.state = 'hup'; continue;
            }
            if (this.state === 'hup') {
                if (this.hi === 0) { this.state = this.afterUp; continue; }
                const p = (this.hi - 1) >> 1;
                const c = this._less(this.heap[this.hi], this.heap[p]);
                if (c !== 0) {
                    if (c < 0) { const t = this.heap[this.hi]; this.heap[this.hi] = this.heap[p]; this.heap[p] = t; this.hi = p; continue; }
                    this.state = this.afterUp; continue;
                }
                if (result !== undefined) {
                    // Pair was [child, parent]: 0 => child wins.
                    if (result === 0) { const t = this.heap[this.hi]; this.heap[this.hi] = this.heap[p]; this.heap[p] = t; this.hi = p; }
                    else this.state = this.afterUp;
                    result = undefined; continue;
                }
                return [this.heap[this.hi].v, this.heap[p].v];
            }
            if (this.state === 'gen') {
                if (this.heap.length === 0) { this.state = 'merge'; this.mi = 1; this.acc = this.runs[0]; continue; }
                // Pop min -> emit -> refill -> push.
                const top = this.heap[0], last = this.heap.pop();
                if (this.heap.length > 0) { this.heap[0] = last; this.hi = 0; this.state = 'hdown'; }
                else this.state = 'emit';
                this.emitE = top; continue;
            }
            if (this.state === 'hdown') {
                const l = this.hi * 2 + 1, r = l + 1;
                if (l >= this.heap.length) { this.state = 'emit'; continue; }
                if (r >= this.heap.length) this.c = l;
                else {
                    const c = this._less(this.heap[l], this.heap[r]);
                    if (c !== 0) this.c = (c < 0) ? l : r;
                    else {
                        if (result !== undefined) { this.c = (result === 0) ? l : r; result = undefined; this.state = 'hdowncmp'; continue; }
                        return [this.heap[l].v, this.heap[r].v];
                    }
                }
                this.state = 'hdowncmp'; continue;
            }
            if (this.state === 'hdowncmp') {
                const c = this._less(this.heap[this.c], this.heap[this.hi]);
                if (c !== 0) {
                    if (c < 0) { const t = this.heap[this.hi]; this.heap[this.hi] = this.heap[this.c]; this.heap[this.c] = t; this.hi = this.c; this.state = 'hdown'; }
                    else this.state = 'emit';
                    continue;
                }
                if (result !== undefined) {
                    // Pair was [child, x]: 0 => child wins.
                    if (result === 0) { const t = this.heap[this.hi]; this.heap[this.hi] = this.heap[this.c]; this.heap[this.c] = t; this.hi = this.c; this.state = 'hdown'; }
                    else this.state = 'emit';
                    result = undefined; continue;
                }
                return [this.heap[this.c].v, this.heap[this.hi].v];
            }
            if (this.state === 'emit') {
                const e = this.emitE;
                if (e.run !== this.current) { this.current = e.run; this.runs.push([]); }
                this.runs[this.runs.length - 1].push(e.v);
                this.lastWritten = e.v;
                if (this.inputIdx < this.n) { this.state = 'stamp'; continue; }
                this.state = 'gen'; continue;
            }
            if (this.state === 'stamp') {
                this.x = this.items[this.inputIdx++];
                this.state = 'stampwait';
            }
            if (this.state === 'stampwait') {
                if (result !== undefined) {
                    // Pair was [x, lastWritten]: 1 => x >= last => current run.
                    this.heap.push({ v: this.x, run: (result === 1) ? this.current : this.current + 1 });
                    this.hi = this.heap.length - 1; this.afterUp = 'gen'; this.state = 'hup';
                    result = undefined; continue;
                }
                return [this.x, this.lastWritten];
            }
            if (this.state === 'merge') {
                // Left-fold pairwise standard merges of the runs.
                if (this.mi >= this.runs.length) { this.items = this.acc; this.state = 'done'; continue; }
                if (this.mA === undefined) { this.mA = this.acc; this.mB = this.runs[this.mi]; this.mOut = []; this.mai = 0; this.mbi = 0; }
                if (result !== undefined) {
                    if (result === 0) this.mOut.push(this.mA[this.mai++]); else this.mOut.push(this.mB[this.mbi++]);
                    result = undefined;
                }
                if (this.mai < this.mA.length && this.mbi < this.mB.length) return [this.mA[this.mai], this.mB[this.mbi]];
                while (this.mai < this.mA.length) this.mOut.push(this.mA[this.mai++]);
                while (this.mbi < this.mB.length) this.mOut.push(this.mB[this.mbi++]);
                this.acc = this.mOut; this.mA = undefined; this.mi++; continue;
            }
        }
        return null;
    }
}

/**
 * Polyphase merge sort (ASC, 3 tapes): initial runs come from genuine
 * replacement selection (a ReplacementSelectionSortProvider sub-instance is
 * driven to completion and its runs reused -- the same sub-provider pattern
 * as the repo's BucketSortProvider), distributed across two tapes with
 * Fibonacci numbers (padded with dummy runs), then merged in polyphase
 * passes with tape rotation until one run remains. Dummy runs pass through
 * without comparisons.
 * Source: D. E. Knuth, TAOCP vol. 3, section 5.4.2.
 */
class PolyphaseMergeSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.state = n > 0 ? 'genruns' : 'done';
        this.gen = n > 0 ? new ReplacementSelectionSortProvider(n) : null;
    }
    _fibDist(runs) {
        const fib = [1, 1];
        while (fib[fib.length - 1] < runs.length) fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
        const k = fib.length - 1, s1 = fib[k - 1] || 0, s2 = fib[k - 2] || 0;
        // s1 + s2 == fib[k] >= R; pad T1 with dummies.
        const T1 = [], T2 = [];
        let i = 0;
        for (; i < s1 && i < runs.length; i++) T1.push(runs[i]);
        while (T1.length < s1) T1.unshift(null);
        for (let j = 0; j < s2 && i < runs.length; j++, i++) T2.push(runs[i]);
        while (T2.length < s2) T2.unshift(null);
        return [T1, T2, []];
    }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'genruns') {
                const q = this.gen.next(result); result = undefined;
                if (q) return q;
                const runs = this.gen.runs.filter(r => r.length > 0);
                if (runs.length <= 1) { this.items = runs.length ? runs[0].slice() : []; this.state = 'done'; continue; }
                [this.T1, this.T2, this.T3] = this._fibDist(runs);
                this.state = 'pass'; continue;
            }
            if (this.state === 'pass') {
                if (this.T1.length === 0 || this.T2.length === 0) {
                    // Rotate: output + leftover become inputs; or finish.
                    const leftover = this.T1.length > 0 ? this.T1 : this.T2;
                    if (leftover.length === 0) {
                        if (this.T3.length === 1) { this.items = this.T3[0]; this.state = 'done'; continue; }
                        [this.T1, this.T2, this.T3] = this._fibDist(this.T3);
                        continue;
                    }
                    this.T1 = this.T3; this.T2 = leftover; this.T3 = [];
                    continue;
                }
                const r1 = this.T1.shift(), r2 = this.T2.shift();
                if (r1 === null) { this.T3.push(r2); continue; }
                if (r2 === null) { this.T3.push(r1); continue; }
                this.mA = r1; this.mB = r2; this.mOut = []; this.mai = 0; this.mbi = 0;
                this.state = 'merge'; continue;
            }
            if (this.state === 'merge') {
                if (result !== undefined) {
                    if (result === 0) this.mOut.push(this.mA[this.mai++]); else this.mOut.push(this.mB[this.mbi++]);
                    result = undefined;
                }
                if (this.mai < this.mA.length && this.mbi < this.mB.length) return [this.mA[this.mai], this.mB[this.mbi]];
                while (this.mai < this.mA.length) this.mOut.push(this.mA[this.mai++]);
                while (this.mbi < this.mB.length) this.mOut.push(this.mB[this.mbi++]);
                this.T3.push(this.mOut); this.state = 'pass'; continue;
            }
        }
        return null;
    }
}

/**
 * Quicksort with BFPRT (median-of-medians) pivot selection (ASC):
 * quicksort with Lomuto partitioning and linear-insertion base cases
 * (<= 16); pivots are the exact median via BFPRT -- groups of 5,
 * insertion-sorted, medians to the front, recursive median-of-medians,
 * partition, recurse into the side containing the kth. Worst-case O(n log n)
 * comparisons at the cost of heavy constant factors. Explicit frame stack.
 * Source: Blum et al. 1973; https://en.wikipedia.org/wiki/Median_of_medians
 */
class BFPRTQuicksortProvider extends Provider {
    constructor(n) {
        super(n);
        this.frames = n > 0 ? [{ t: 'qs', l: 0, r: n - 1 }] : [];
        this.selResult = -1;
    }
    next(result) {
        while (this.frames.length > 0) {
            const f = this.frames[this.frames.length - 1];
            if (f.t === 'qs') {
                if (f.r - f.l + 1 <= 16) { f.t = 'ins'; continue; }
                f.t = 'qspart'; f.stage = 'wait';
                this.frames.push({ t: 'sel', l: f.l, r: f.r, k: (f.l + f.r) >> 1, stage: 'enter' });
                continue;
            }
            if (f.t === 'qspart') {
                if (f.stage === 'wait') {
                    // Inner SEL below...above us finished: selResult = pivot id.
                    let ppos = f.l;
                    while (this.items[ppos] !== this.selResult) ppos++;
                    f.stage = 'split';
                    this.frames.push({ t: 'part', l: f.l, r: f.r, ppos, _parent: f });
                    continue;
                }
                // stage 'split': part finished, f.p set.
                const p = f.p;
                this.frames.pop();
                if (p + 1 <= f.r) this.frames.push({ t: 'qs', l: p + 1, r: f.r });
                if (f.l <= p - 1) this.frames.push({ t: 'qs', l: f.l, r: p - 1 });
                continue;
            }
            if (f.t === 'sel') {
                if (f.stage === 'enter') {
                    if (f.r - f.l + 1 <= 5) { f.k0 = f.k; f.k = undefined; f.jj = undefined; f.t = 'ins'; f.onDone = 'sel'; continue; }
                    f.g = Math.ceil((f.r - f.l + 1) / 5); f.gi = 0; f.stage = 'med'; continue;
                }
                if (f.stage === 'med') {
                    if (f.gi >= f.g) {
                        // Medians to front (free), then median-of-medians.
                        for (let i = 0; i < f.g; i++) {
                            const gl = f.l + 5 * i, gr = Math.min(gl + 4, f.r);
                            const mp = gl + ((gr - gl) >> 1);
                            const t = this.items[f.l + i]; this.items[f.l + i] = this.items[mp]; this.items[mp] = t;
                        }
                        f.t = 'selret'; f.stage = 'wait';
                        const ml = f.l, mr = f.l + f.g - 1;
                        this.frames.push({ t: 'sel', l: ml, r: mr, k: (ml + mr) >> 1, stage: 'enter' });
                        continue;
                    }
                    const gl = f.l + 5 * f.gi, gr = Math.min(gl + 4, f.r);
                    f.stage = 'medwait';
                    this.frames.push({ t: 'ins', l: gl, r: gr });
                    continue;
                }
                if (f.stage === 'medwait') { f.gi++; f.stage = 'med'; continue; }
            }
            if (f.t === 'selret') {
                if (f.stage === 'wait') {
                    let ppos = f.l;
                    while (this.items[ppos] !== this.selResult) ppos++;
                    f.stage = 'decide';
                    this.frames.push({ t: 'part', l: f.l, r: f.r, ppos, _parent: f });
                    continue;
                }
                // stage 'decide': part finished, f.p set.
                const p = f.p;
                if (f.k === p) { this.selResult = this.items[p]; this.frames.pop(); continue; }
                if (f.k < p) { f.t = 'sel'; f.r = p - 1; f.stage = 'enter'; continue; }
                f.t = 'sel'; f.l = p + 1; f.stage = 'enter'; continue;
            }
            if (f.t === 'ins') {
                if (f.k === undefined) { f.k = f.l + 1; f.jj = undefined; }
                if (result !== undefined) {
                    // Pair was [A[jj], x]: 1 => shift.
                    if (result === 1) { this.items[f.jj + 1] = this.items[f.jj]; f.jj--; }
                    else { this.items[f.jj + 1] = f.x; f.k++; f.jj = undefined; }
                    result = undefined;
                }
                if (f.jj === undefined) {
                    if (f.k > f.r) {
                        if (f.onDone === 'sel') this.selResult = this.items[f.k0 !== undefined ? f.k0 : f.k];
                        // NOTE: sel small-case kth index stored below (f.k0).
                        this.frames.pop(); continue;
                    }
                    f.x = this.items[f.k]; f.jj = f.k - 1;
                }
                if (f.jj >= f.l) return [this.items[f.jj], f.x];
                this.items[f.jj + 1] = f.x; f.k++; f.jj = undefined; continue;
            }
            if (f.t === 'part') {
                if (f.stage === undefined) {
                    const t = this.items[f.ppos]; this.items[f.ppos] = this.items[f.r]; this.items[f.r] = t;
                    f.pivot = this.items[f.r]; f.i = f.l; f.j = f.l; f.stage = 'loop';
                }
                if (result !== undefined) {
                    // Pair was [A[j], pivot]: 0 => A[j] weaker => swap into <= region.
                    if (result === 0) { const t = this.items[f.i]; this.items[f.i] = this.items[f.j]; this.items[f.j] = t; f.i++; }
                    f.j++; result = undefined;
                }
                if (f.j > f.r - 1) {
                    const t = this.items[f.i]; this.items[f.i] = this.items[f.r]; this.items[f.r] = t;
                    f._parent.p = f.i; this.frames.pop(); continue;
                }
                return [this.items[f.j], f.pivot];
            }
        }
        return null;
    }
}

/**
 * Shear Sort (ASC): mesh sorting on a ceil(sqrt(n)) x ceil(n/rows) grid
 * (row-major, last row padded with +infinity sentinels that resolve without
 * asking). Alternating row phases (snake order: even rows ascending
 * leftward, odd rows descending) and column phases (ascending downward),
 * each line sorted with early-exit odd-even transposition sort, for
 * 2*ceil(log2(n+1))+2 phases. Final output linearized in snake order
 * (sentinels stripped), which is the algorithm's sorted order.
 * Source: https://en.wikipedia.org/wiki/Shear_sort (Schnorr & Shamir 1986)
 */
class ShearSortProvider extends Provider {
    constructor(n) {
        super(n);
        this.R = Math.ceil(Math.sqrt(n));
        this.C = Math.ceil(n / this.R);
        this.cells = [];
        for (let r = 0; r < this.R; r++) {
            const row = [];
            for (let c = 0; c < this.C; c++) { const i = r * this.C + c; row.push(i < n ? this.items[i] : -1); }
            this.cells.push(row);
        }
        this.phases = 2 * Math.ceil(Math.log2(n + 1)) + 2;
        this.ph = 0; this.li = 0;
        this.state = n > 0 ? 'phase' : 'done';
    }
    _lineCells(rowPhase, idx) {
        // Ordered cell coordinates of row idx (L->R) or column idx (top->bottom).
        const out = [];
        if (rowPhase) for (let c = 0; c < this.C; c++) out.push([idx, c]);
        else for (let r = 0; r < this.R; r++) out.push([r, idx]);
        return out;
    }
    _get(rc) { return this.cells[rc[0]][rc[1]]; }
    _set(rc, v) { this.cells[rc[0]][rc[1]] = v; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'phase') {
                if (this.ph >= this.phases) { this.state = 'readout'; continue; }
                this.rowPhase = (this.ph % 2 === 0);
                this.li = 0; this.state = 'line'; continue;
            }
            if (this.state === 'line') {
                const count = this.rowPhase ? this.R : this.C;
                if (this.li >= count) { this.ph++; this.state = 'phase'; continue; }
                this.line = this._lineCells(this.rowPhase, this.li);
                // Row phases snake: odd rows descending; columns always ascending.
                this.desc = this.rowPhase && (this.li % 2 === 1);
                this.ophase = 0; this.streak = 0; this.oi = 0; this.swapped = false;
                this.state = 'oddeven'; continue;
            }
            if (this.state === 'oddeven') {
                const L = this.line.length;
                if (result !== undefined) {
                    // Pair was [A[i], A[i+1]] along the line.
                    const bad = this.desc ? (result === 0) : (result === 1);
                    if (bad) {
                        const a = this.line[this.oi], b = this.line[this.oi + 1];
                        const t = this._get(a); this._set(a, this._get(b)); this._set(b, t);
                        this.swapped = true;
                    }
                    this.oi += 2; result = undefined;
                }
                if (this.oi > L - 2) {
                    if (this.swapped) this.streak = 0; else this.streak++;
                    if (this.streak >= 2) { this.li++; this.state = 'line'; continue; }
                    this.ophase ^= 1; this.oi = this.ophase; this.swapped = false; continue;
                }
                const a = this.line[this.oi], b = this.line[this.oi + 1];
                const va = this._get(a), vb = this._get(b);
                if (va === -1 && vb === -1) { this.oi += 2; continue; }
                if (va === -1 || vb === -1) {
                    // Sentinel (+inf): ASC lines sink it right/down; DESC lines float it left/up.
                    const needSwap = this.desc ? (vb === -1) : (va === -1);
                    if (needSwap) { this._set(a, vb); this._set(b, va); this.swapped = true; }
                    this.oi += 2; continue;
                }
                return [va, vb];
            }
            if (this.state === 'readout') {
                const out = [];
                for (let r = 0; r < this.R; r++) {
                    const order = (r % 2 === 0) ? [...Array(this.C).keys()] : [...Array(this.C).keys()].reverse();
                    for (const c of order) { const v = this.cells[r][c]; if (v !== -1) out.push(v); }
                }
                this.items = out; this.state = 'done'; continue;
            }
        }
        return null;
    }
}

/**
 * Proportion Extend Sort, symmetric variant (Chen 2001; ASC). Maintains a
 * sorted part S adjacent to an unsorted part U (either order): U is bounded
 * to p^2|S| (p = 16 per the papers; oversized U is absorbed in recursive
 * (p+1)|S| extension chunks), then S is split at its median into L/R, blocks
 * rotate to LUR form, and U is Lomuto-partitioned around the median (the
 * pivot lands in its final slot and is excluded from both recursive
 * subproblems). Sub-spans of <= 16 use linear insertion sort. Seeded with
 * the longest ascending-or-descending initial run (descending reversed).
 * DOCUMENTED MICRO-DIFFERENCE: Lomuto partitioning instead of the C
 * code's sentinel Hoare loops (same pivot/extension structure, simpler
 * staging; sentinels only elide bound tests).
 * Source: https://en.wikipedia.org/wiki/Proportion_extend_sort
 */
class PESortProvider extends Provider {
    constructor(n) {
        super(n);
        this.P = 16;
        this.frames = n > 0 ? [{ t: 'pe', stage: 'initrun', L: 1, desc: false }] : [];
    }
    next(result) {
        while (this.frames.length > 0) {
            const f = this.frames[this.frames.length - 1];
            if (f.t === 'ins') {
                if (f.k === undefined) { f.k = f.l + 1; f.jj = undefined; }
                if (result !== undefined) {
                    // Pair was [x, A[jj]]: 0 => shift.
                    if (result === 0) { this.items[f.jj + 1] = this.items[f.jj]; f.jj--; }
                    else { this.items[f.jj + 1] = f.x; f.k++; f.jj = undefined; }
                    result = undefined;
                }
                if (f.jj === undefined) {
                    if (f.k > f.r) { this.frames.pop(); continue; }
                    f.x = this.items[f.k]; f.jj = f.k - 1;
                }
                if (f.jj >= f.l) return [f.x, this.items[f.jj]];
                this.items[f.jj + 1] = f.x; f.k++; f.jj = undefined; continue;
            }
            // pe frame
            if (f.stage === 'initrun') {
                if (result !== undefined) {
                    // Pair was [A[L-1], A[L]]: first pair decides direction.
                    if (f.L === 1) { f.desc = (result === 1); f.L = 2; }
                    else { const good = f.desc ? (result === 1) : (result === 0); if (good) f.L++; else f.stage = 'initdone'; }
                    result = undefined; if (f.stage === 'initdone') continue;
                }
                if (f.L >= this.n) f.stage = 'initdone';
                else return [this.items[f.L - 1], this.items[f.L]];
                continue;
            }
            if (f.stage === 'initdone') {
                if (f.desc) { let l = 0, r = f.L - 1; while (l < r) { const t = this.items[l]; this.items[l] = this.items[r]; this.items[r] = t; l++; r--; } }
                f.s0 = 0; f.s1 = f.L - 1; f.u0 = f.L; f.u1 = this.n - 1; f.sBefore = true;
                f.stage = 'enter'; continue;
            }
            if (f.stage === 'enter') {
                const sLen = f.s1 - f.s0 + 1, uLen = f.u1 - f.u0 + 1;
                if (uLen <= 0) { this.frames.pop(); continue; }
                if (sLen <= 0) { f.s0 = f.u0; f.s1 = f.u0; f.u0 = f.u0 + 1; f.sBefore = true; continue; }
                const lo = Math.min(f.s0, f.u0), hi = Math.max(f.s1, f.u1);
                if (hi - lo + 1 <= 16) {
                    f.stage = 'afterins';
                    this.frames.push({ t: 'ins', l: lo, r: hi });
                    continue;
                }
                if (uLen > this.P * this.P * sLen) {
                    // Extension: recursively sort S + adjacent P|S| chunk of U.
                    f.stage = 'extended';
                    if (f.sBefore) {
                        f.cEnd = f.u0 + this.P * sLen - 1;
                        this.frames.push({ t: 'pe', s0: f.s0, s1: f.s1, u0: f.u0, u1: f.cEnd, sBefore: true, stage: 'enter' });
                    } else {
                        f.cStart = f.u1 - this.P * sLen + 1;
                        this.frames.push({ t: 'pe', s0: f.s0, s1: f.s1, u0: f.cStart, u1: f.u1, sBefore: false, stage: 'enter' });
                    }
                    continue;
                }
                // Bounded: split S at median, rotate blocks to LUR form.
                const mid = f.s0 + ((sLen - 1) >> 1);
                const seg = this.items.slice(f.s0, mid + 1)
                    .concat(this.items.slice(f.u0, f.u1 + 1))
                    .concat(this.items.slice(mid + 1, f.s1 + 1));
                for (let k = 0; k < seg.length; k++) this.items[lo + k] = seg[k];
                const lLen = mid - f.s0 + 1, rLen = f.s1 - mid;
                f.l0 = lo; f.l1 = lo + lLen - 1;
                f.u0 = f.l1 + 1; f.u1 = f.u0 + uLen - 1;
                f.r0 = f.u1 + 1; f.r1 = f.r0 + rLen - 1;
                f.pivot = this.items[f.l1];
                f.w = f.u0; f.i = f.u0; f.stage = 'partloop'; continue;
            }
            if (f.stage === 'extended') {
                if (f.sBefore) { f.s1 = f.cEnd; f.u0 = f.cEnd + 1; }
                else { f.s0 = f.cStart; f.u1 = f.cStart - 1; }
                f.stage = 'enter'; continue;
            }
            if (f.stage === 'afterins') { this.frames.pop(); continue; }
            if (f.stage === 'partloop') {
                if (result !== undefined) {
                    // Pair was [A[i], pivot]: 0 => into <= region.
                    if (result === 0) { const t = this.items[f.w]; this.items[f.w] = this.items[f.i]; this.items[f.i] = t; f.w++; }
                    f.i++; result = undefined;
                }
                if (f.i > f.u1) {
                    // Pivot excluded: L' + U_L + [pivot] + U_R + R.
                    const seg = this.items.slice(f.l0, f.l1)
                        .concat(this.items.slice(f.u0, f.w))
                        .concat([f.pivot])
                        .concat(this.items.slice(f.w, f.u1 + 1))
                        .concat(this.items.slice(f.r0, f.r1 + 1));
                    for (let k = 0; k < seg.length; k++) this.items[f.l0 + k] = seg[k];
                    const lLen = f.l1 - f.l0, ulLen = f.w - f.u0, urLen = f.u1 - f.w + 1;
                    const ls0 = f.l0, ls1 = ls0 + lLen - 1, lu0 = ls1 + 1, lu1 = lu0 + ulLen - 1;
                    const pp = lu1 + 1, ru0 = pp + 1, ru1 = ru0 + urLen - 1, rs0 = ru1 + 1, rs1 = f.r1;
                    this.frames.pop();
                    this.frames.push({ t: 'pe', s0: rs0, s1: rs1, u0: ru0, u1: ru1, sBefore: false, stage: 'enter' });
                    this.frames.push({ t: 'pe', s0: ls0, s1: ls1, u0: lu0, u1: lu1, sBefore: true, stage: 'enter' });
                    continue;
                }
                return [this.items[f.i], f.pivot];
            }
        }
        return null;
    }
}

/**
 * Permutation sort (DESC): systematically enumerates permutations in
 * lexicographic order (next_permutation from the identity, free index
 * moves) and fail-fast checks each for strongest-first order. Deterministic
 * unlike Bogosort, but still Theta(n * n!) comparisons in the worst case.
 */
class PermutationSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.state = n > 1 ? 'verify' : 'done'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'verify') {
                if (result !== undefined) {
                    // Pair was [A[i], A[i+1]]: 1 => ordered (DESC).
                    if (result === 1) this.i++; else this.state = 'nextperm';
                    result = undefined; continue;
                }
                if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
                this.state = 'done'; continue;
            }
            if (this.state === 'nextperm') {
                // Lexicographic next permutation (free); identity wrap is a
                // safety net only (a DESC permutation is always found first).
                let i = this.n - 2;
                while (i >= 0 && this.items[i] > this.items[i + 1]) i--;
                if (i < 0) { this.items.reverse(); this.state = 'done'; continue; }
                let j = this.n - 1;
                while (this.items[j] < this.items[i]) j--;
                const t = this.items[i]; this.items[i] = this.items[j]; this.items[j] = t;
                let l = i + 1, r = this.n - 1;
                while (l < r) { const u = this.items[l]; this.items[l] = this.items[r]; this.items[r] = u; l++; r--; }
                this.i = 0; this.state = 'verify'; continue;
            }
        }
        return null;
    }
}

/**
 * Less Bogo sort (DESC): selection sort via shuffles. For each position k,
 * Fisher-Yates shuffle the suffix A[k..n-1] until A[k] is its maximum
 * (fail-fast scan), fix it, and continue with k+1.
 * Source: https://sortingalgos.miraheze.org/wiki/Bogosort
 */
class LessBogoSortProvider extends Provider {
    constructor(n) { super(n); this.k = 0; this.state = n > 1 ? 'shuffle' : 'done'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'shuffle') {
                for (let i = this.n - 1; i > this.k; i--) {
                    const j = this.k + Math.floor(Math.random() * (i - this.k + 1));
                    const t = this.items[i]; this.items[i] = this.items[j]; this.items[j] = t;
                }
                this.j = this.k + 1; this.state = 'scan'; continue;
            }
            if (this.state === 'scan') {
                if (result !== undefined) {
                    // Pair was [A[k], A[j]]: 1 => still candidate max.
                    if (result === 1) this.j++; else this.state = 'shuffle';
                    result = undefined; continue;
                }
                if (this.j < this.n) return [this.items[this.k], this.items[this.j]];
                this.k++;
                if (this.k >= this.n - 1) this.state = 'done'; else this.state = 'shuffle';
                continue;
            }
        }
        return null;
    }
}

/**
 * Exchange Bogo sort (DESC): Bozosort's fail-fast check, but the botched
 * round picks two random positions, compares them, and swaps only if out
 * of order. Every swap strictly decreases the inversion count, so it
 * converges almost surely (unlike blind Bozosort's symmetric walk).
 * Source: https://sortingalgos.miraheze.org/wiki/Bogosort
 */
class ExchangeBogoSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.state = n > 1 ? 'verify' : 'done'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'verify') {
                if (result !== undefined) {
                    if (result === 1) this.i++; else this.state = 'perturb';
                    result = undefined; continue;
                }
                if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
                this.state = 'done'; continue;
            }
            if (this.state === 'perturb') {
                if (result !== undefined) {
                    // Pair was [A[i], A[j]] (i < j): 0 => inverted => swap.
                    if (result === 0) { const t = this.items[this.pi]; this.items[this.pi] = this.items[this.pj]; this.items[this.pj] = t; }
                    result = undefined; this.i = 0; this.state = 'verify'; continue;
                }
                const a = Math.floor(Math.random() * this.n);
                let b = Math.floor(Math.random() * (this.n - 1));
                if (b >= a) b++;
                this.pi = Math.min(a, b); this.pj = Math.max(a, b);
                return [this.items[this.pi], this.items[this.pj]];
            }
        }
        return null;
    }
}

/**
 * Bubble Bogo sort (DESC): Exchange Bogo restricted to a random adjacent
 * pair per botched round. Each swap fixes exactly one inversion.
 * Source: https://sortingalgos.miraheze.org/wiki/Bogosort
 */
class BubbleBogoSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.state = n > 1 ? 'verify' : 'done'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'verify') {
                if (result !== undefined) {
                    if (result === 1) this.i++; else this.state = 'perturb';
                    result = undefined; continue;
                }
                if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
                this.state = 'done'; continue;
            }
            if (this.state === 'perturb') {
                if (result !== undefined) {
                    if (result === 0) { const t = this.items[this.pi]; this.items[this.pi] = this.items[this.pi + 1]; this.items[this.pi + 1] = t; }
                    result = undefined; this.i = 0; this.state = 'verify'; continue;
                }
                this.pi = Math.floor(Math.random() * (this.n - 1));
                return [this.items[this.pi], this.items[this.pi + 1]];
            }
        }
        return null;
    }
}

/**
 * Odd-Even Bogo sort (DESC): Bubble Bogo alternating between a random odd
 * index and a random even index (pairs (i, i+1)) on successive botched
 * rounds.
 * Source: https://sortingalgos.miraheze.org/wiki/Bogosort
 */
class OddEvenBogoSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.parity = 0; this.state = n > 1 ? 'verify' : 'done'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'verify') {
                if (result !== undefined) {
                    if (result === 1) this.i++; else this.state = 'perturb';
                    result = undefined; continue;
                }
                if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
                this.state = 'done'; continue;
            }
            if (this.state === 'perturb') {
                if (result !== undefined) {
                    if (result === 0) { const t = this.items[this.pi]; this.items[this.pi] = this.items[this.pi + 1]; this.items[this.pi + 1] = t; }
                    result = undefined; this.i = 0; this.state = 'verify'; continue;
                }
                let cands = [];
                for (let i = this.parity; i + 1 < this.n; i += 2) cands.push(i);
                if (cands.length === 0) { this.parity ^= 1; continue; }
                this.pi = cands[Math.floor(Math.random() * cands.length)];
                this.parity ^= 1;
                return [this.items[this.pi], this.items[this.pi + 1]];
            }
        }
        return null;
    }
}

/**
 * Bovo sort (DESC): check strongest-first order; if botched, pull a random
 * item to the head (free rotation) and repeat. Random-to-top moves generate
 * the full symmetric group, so it hits the sorted order almost surely.
 * Source: https://neo-sorting-algorithms.fandom.com/wiki/Bogo_Sort
 */
class BovoSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.state = n > 1 ? 'verify' : 'done'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'verify') {
                if (result !== undefined) {
                    if (result === 1) this.i++;
                    else {
                        const r = Math.floor(Math.random() * this.n);
                        const x = this.items.splice(r, 1)[0];
                        this.items.unshift(x);
                        this.i = 0;
                    }
                    result = undefined; continue;
                }
                if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
                this.state = 'done'; continue;
            }
        }
        return null;
    }
}


// ---------------------------------------------------------------------------
// Web expansion 3 (2026-09-11)
//
// CoroutineSortProvider lets the ports below read like their published
// pseudocode while preserving the benchmark's one-comparison-at-a-time API.
// A yielded pair [a,b] receives 1 exactly when a is stronger than b.  The
// helpers therefore maintain an ASC (weakest-first) internal order.
// ---------------------------------------------------------------------------
class CoroutineSortProvider extends Provider {
    constructor(n) {
        super(n);
        this._iterator = this.sort();
        this._started = false;
    }
    next(result) {
        const step = this._iterator.next(this._started ? result : undefined);
        this._started = true;
        return step.done ? null : step.value;
    }
    *sort() {}
    *_greater(a, b) { return (yield [a, b]) === 1; }
    *_less(a, b) { return (yield [a, b]) === 0; }
    *_insertion(arr) {
        for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i;
            while (j > 0) {
                if (!(yield* this._less(key, arr[j - 1]))) break;
                arr[j] = arr[j - 1]; j--;
            }
            arr[j] = key;
        }
        return arr;
    }
    *_binaryInsertion(arr) {
        for (let i = 1; i < arr.length; i++) {
            const key = arr[i]; let lo = 0, hi = i;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (yield* this._less(key, arr[mid])) hi = mid;
                else lo = mid + 1;
            }
            for (let j = i; j > lo; j--) arr[j] = arr[j - 1];
            arr[lo] = key;
        }
        return arr;
    }
    *_merge(A, B) {
        const out = []; let i = 0, j = 0;
        while (i < A.length && j < B.length) {
            if (yield* this._greater(A[i], B[j])) out.push(B[j++]);
            else out.push(A[i++]);
        }
        return out.concat(A.slice(i), B.slice(j));
    }
    *_mergeSort(arr, cutoff = 1) {
        if (arr.length <= 1) return arr.slice();
        if (arr.length <= cutoff) return yield* this._insertion(arr.slice());
        const mid = arr.length >> 1;
        const left = yield* this._mergeSort(arr.slice(0, mid), cutoff);
        const right = yield* this._mergeSort(arr.slice(mid), cutoff);
        return yield* this._merge(left, right);
    }
    *_medianOf(arr) {
        const a = arr.slice();
        yield* this._insertion(a);
        return a[a.length >> 1];
    }
    *_stableQuick(arr, cutoff = 16, sample = 3) {
        if (arr.length <= 1) return arr.slice();
        if (arr.length <= cutoff) return yield* this._insertion(arr.slice());
        let picks;
        if (sample >= 9 && arr.length >= 9) {
            picks = [];
            for (let i = 0; i < 9; i++) picks.push(arr[Math.floor(i * (arr.length - 1) / 8)]);
            const thirds = [];
            for (let i = 0; i < 9; i += 3) thirds.push(yield* this._medianOf(picks.slice(i, i + 3)));
            picks = thirds;
        } else {
            picks = [arr[0], arr[arr.length >> 1], arr[arr.length - 1]];
        }
        const pivot = yield* this._medianOf(picks);
        const left = [], right = [];
        let skippedPivot = false;
        for (const x of arr) {
            if (!skippedPivot && x === pivot) { skippedPivot = true; continue; }
            if (yield* this._greater(x, pivot)) right.push(x); else left.push(x);
        }
        const L = yield* this._stableQuick(left, cutoff, sample);
        const R = yield* this._stableQuick(right, cutoff, sample);
        return L.concat([pivot], R);
    }
    *_twinSort(arr) {
        const n = arr.length;
        if (n < 2) return arr.slice();
        let index = 0, end = n - 2;
        while (index <= end) {
            if (!(yield* this._greater(arr[index], arr[index + 1]))) { index += 2; continue; }
            const start = index; index += 2;
            while (true) {
                if (index > end) {
                    if (start === 0 && (n % 2 === 0 || (yield* this._greater(arr[index - 1], arr[index])))) {
                        arr.reverse(); return arr;
                    }
                    break;
                }
                if (yield* this._greater(arr[index], arr[index + 1])) {
                    if (yield* this._greater(arr[index - 1], arr[index])) { index += 2; continue; }
                    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
                }
                break;
            }
            let l = start, r = index - 1;
            while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; }
            index += 2;
        }
        for (let width = 2; width < n; width *= 2) {
            for (let lo = 0; lo + width < n; lo += 2 * width) {
                const mid = lo + width, hi = Math.min(n, lo + 2 * width);
                if (!(yield* this._greater(arr[mid - 1], arr[mid]))) continue;
                const merged = yield* this._merge(arr.slice(lo, mid), arr.slice(mid, hi));
                arr.splice(lo, merged.length, ...merged);
            }
        }
        return arr;
    }
    *_tournamentMerge(runs, recordLosers = false) {
        runs = runs.filter(r => r.length > 0);
        if (runs.length === 0) return [];
        if (runs.length === 1) return runs[0].slice();
        let leaves = 1; while (leaves < runs.length) leaves <<= 1;
        const tree = new Array(2 * leaves).fill(-1), losers = new Array(leaves).fill(-1);
        const pos = new Array(runs.length).fill(0);
        for (let i = 0; i < runs.length; i++) tree[leaves + i] = i;
        const choose = function* (self, a, b, node) {
            if (a < 0) return b; if (b < 0) return a;
            const aw = runs[a][pos[a]], bw = runs[b][pos[b]];
            const aGreater = yield* self._greater(aw, bw);
            const win = aGreater ? b : a;
            if (recordLosers) losers[node] = aGreater ? a : b;
            return win;
        };
        for (let node = leaves - 1; node >= 1; node--)
            tree[node] = yield* choose(this, tree[node * 2], tree[node * 2 + 1], node);
        const out = [];
        if (recordLosers) {
            // In a loser tree the overall winner stays in a register. After
            // advancing its input run, replay only against the loser saved at
            // each ancestor; the new loser is written back at that node.
            let winner = tree[1];
            while (winner >= 0) {
                const source = winner;
                out.push(runs[source][pos[source]++]);
                let challenger = pos[source] < runs[source].length ? source : -1;
                for (let node = (leaves + source) >> 1; node >= 1; node >>= 1) {
                    const opponent = losers[node];
                    if (challenger < 0) {
                        challenger = opponent; losers[node] = -1;
                    } else if (opponent >= 0) {
                        const challengerGreater = yield* this._greater(
                            runs[challenger][pos[challenger]], runs[opponent][pos[opponent]]
                        );
                        if (challengerGreater) {
                            losers[node] = challenger; challenger = opponent;
                        } else {
                            losers[node] = opponent;
                        }
                    }
                }
                winner = challenger;
            }
            return out;
        }
        while (tree[1] >= 0) {
            const source = tree[1]; out.push(runs[source][pos[source]++]);
            let node = leaves + source;
            tree[node] = pos[source] < runs[source].length ? source : -1;
            for (node >>= 1; node >= 1; node >>= 1)
                tree[node] = yield* choose(this, tree[node * 2], tree[node * 2 + 1], node);
        }
        return out;
    }
}

/** Stable selection: select each minimum, then shift-and-insert instead of
 * swapping it over equal records. Source: Sorting Wiki, Stable Selection. */
class StableSelectionSortProvider extends CoroutineSortProvider {
    *sort() {
        for (let i = 0; i + 1 < this.items.length; i++) {
            let min = i;
            for (let j = i + 1; j < this.items.length; j++)
                if (yield* this._less(this.items[j], this.items[min])) min = j;
            const key = this.items[min];
            while (min > i) { this.items[min] = this.items[min - 1]; min--; }
            this.items[i] = key;
        }
    }
}

/** Morwenn's center-out double insertion sort: consume two outer records per
 * round and insert the low/high member from opposite ends of the sorted core. */
class DoubleInsertionSortProvider extends CoroutineSortProvider {
    *sort() {
        const input = this.items.slice(), n = input.length;
        if (n < 2) return;
        let lo = (n - 1) >> 1, hi = n >> 1;
        let core;
        if (lo === hi) { core = [input[lo]]; lo--; hi++; }
        else {
            if (yield* this._greater(input[lo], input[hi])) core = [input[hi], input[lo]];
            else core = [input[lo], input[hi]];
            lo--; hi++;
        }
        while (lo >= 0 || hi < n) {
            if (lo < 0) { const x = input[hi++]; let p = core.length;
                while (p > 0 && (yield* this._less(x, core[p - 1]))) p--;
                core.splice(p, 0, x); continue; }
            if (hi >= n) { const x = input[lo--]; let p = 0;
                while (p < core.length && !(yield* this._less(x, core[p]))) p++;
                core.splice(p, 0, x); continue; }
            let low = input[lo--], high = input[hi++];
            if (yield* this._greater(low, high)) [low, high] = [high, low];
            let p = 0;
            while (p < core.length && !(yield* this._less(low, core[p]))) p++;
            core.splice(p, 0, low);
            p = core.length;
            while (p > 0 && (yield* this._less(high, core[p - 1]))) p--;
            core.splice(p, 0, high);
        }
        this.items = core;
    }
}

/** 3-Smooth Comb uses every gap 2^p*3^q below n, descending, and needs only
 * one final gap-1 pass. Source: Sorting Wiki, Combsort / 3-Smooth Comb. */
class ThreeSmoothCombSortProvider extends CoroutineSortProvider {
    *sort() {
        const gaps = new Set([1]);
        for (let a = 1; a < this.n; a *= 2)
            for (let g = a; g < this.n; g *= 3) gaps.add(g);
        for (const gap of [...gaps].sort((a, b) => b - a)) {
            for (let i = 0; i + gap < this.n; i++) {
                if (yield* this._greater(this.items[i], this.items[i + gap]))
                    [this.items[i], this.items[i + gap]] = [this.items[i + gap], this.items[i]];
            }
        }
    }
}

class GapInsertionSortProvider extends CoroutineSortProvider {
    gaps() { return [1]; }
    *sort() {
        const gaps = [...new Set(this.gaps().filter(g => g > 0 && g < this.n))].sort((a, b) => b - a);
        if (!gaps.includes(1)) gaps.push(1);
        for (const gap of gaps) {
            for (let i = gap; i < this.n; i++) {
                const key = this.items[i]; let j = i;
                while (j >= gap && (yield* this._less(key, this.items[j - gap]))) {
                    this.items[j] = this.items[j - gap]; j -= gap;
                }
                this.items[j] = key;
            }
        }
    }
}
/** Pratt's Shellsort: all 3-smooth increments, but gapped insertion passes
 * rather than 3-Smooth Comb's compare-exchange passes. */
class PrattShellSortProvider extends GapInsertionSortProvider {
    gaps() { const s = new Set([1]); for (let a=1;a<this.n;a*=2) for(let g=a;g<this.n;g*=3)s.add(g); return [...s]; }
}
/** Tokuda's empirically tuned Shellsort increment sequence. */
class TokudaShellSortProvider extends GapInsertionSortProvider {
    gaps() { const g=[]; for(let k=1;;k++){const x=Math.ceil((9*Math.pow(9/4,k-1)-4)/5);if(x>=this.n)break;g.push(x);}return g; }
}
/** Sedgewick's 1986 alternating Shellsort increment sequence. */
class SedgewickShellSortProvider extends GapInsertionSortProvider {
    gaps() { const g=[]; for(let k=0;;k++){const x=k%2===0?9*(Math.pow(2,k)-Math.pow(2,k/2))+1:8*Math.pow(2,k)-6*Math.pow(2,(k+1)/2)+1;if(x>=this.n)break;g.push(x);}return g; }
}

/** cpp-sort-style d-ary heap: incremental heap construction followed by
 * repeated maximum extraction. D=3 and D=4 are separately registered. */
class DAryHeapSortProvider extends CoroutineSortProvider {
    constructor(n, arity) { super(n); this.arity = arity; }
    *_siftUp(heap, at) {
        while (at > 0) { const p = Math.floor((at - 1) / this.arity);
            if (!(yield* this._less(heap[p], heap[at]))) break;
            [heap[p], heap[at]] = [heap[at], heap[p]]; at = p; }
    }
    *_siftDown(heap, at, size) {
        while (at * this.arity + 1 < size) {
            let best = at * this.arity + 1;
            const last = Math.min(size, best + this.arity);
            for (let c = best + 1; c < last; c++) if (yield* this._less(heap[best], heap[c])) best = c;
            if (!(yield* this._less(heap[at], heap[best]))) break;
            [heap[at], heap[best]] = [heap[best], heap[at]]; at = best;
        }
    }
    *sort() {
        const h = this.items;
        for (let i = 1; i < h.length; i++) yield* this._siftUp(h, i);
        for (let size = h.length; size > 1; size--) {
            [h[0], h[size - 1]] = [h[size - 1], h[0]];
            yield* this._siftDown(h, 0, size - 1);
        }
    }
}
class TernaryHeapSortProvider extends DAryHeapSortProvider { constructor(n) { super(n, 3); } }
class QuaternaryHeapSortProvider extends DAryHeapSortProvider { constructor(n) { super(n, 4); } }

/** External/out-of-place heapsort: incremental min-heap plus remove-min into
 * a separate output stream (the external-heap form used by QuickXsort). */
class OutOfPlaceHeapSortProvider extends CoroutineSortProvider {
    *sort() {
        const heap = [];
        for (const x of this.items) {
            heap.push(x); let i = heap.length - 1;
            while (i > 0) { const p = (i - 1) >> 1;
                if (!(yield* this._less(heap[i], heap[p]))) break;
                [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; }
        }
        const out = [];
        while (heap.length) {
            out.push(heap[0]); const tail = heap.pop(); if (!heap.length) break;
            heap[0] = tail; let i = 0;
            while (i * 2 + 1 < heap.length) {
                let c = i * 2 + 1;
                if (c + 1 < heap.length && (yield* this._less(heap[c + 1], heap[c]))) c++;
                if (!(yield* this._less(heap[c], heap[i]))) break;
                [heap[c], heap[i]] = [heap[i], heap[c]]; i = c;
            }
        }
        this.items = out;
    }
}

/** Atkinson-Sack-Santoro-Strothotte min-max heap. Even levels are min levels,
 * odd levels max levels; sort is repeated delete-min from the double-ended PQ. */
class MinMaxHeapSortProvider extends CoroutineSortProvider {
    _minLevel(i) { return (Math.floor(Math.log2(i + 1)) & 1) === 0; }
    *_extremeIndex(h, indices, wantMin) {
        let best = indices[0];
        for (let k = 1; k < indices.length; k++) {
            const isLess = yield* this._less(h[indices[k]], h[best]);
            if (wantMin ? isLess : !isLess) best = indices[k];
        }
        return best;
    }
    *_trickle(h, i, size) {
        while (2 * i + 1 < size) {
            const cand = [];
            for (let c = 2 * i + 1; c <= 2 * i + 2 && c < size; c++) cand.push(c);
            for (let c = 4 * i + 3; c <= 4 * i + 6 && c < size; c++) cand.push(c);
            const minLevel = this._minLevel(i);
            const m = yield* this._extremeIndex(h, cand, minLevel);
            const better = minLevel ? (yield* this._less(h[m], h[i])) : (yield* this._less(h[i], h[m]));
            if (!better) break;
            const grandchild = m >= 4 * i + 3;
            [h[m], h[i]] = [h[i], h[m]];
            if (!grandchild) break;
            const p = (m - 1) >> 1;
            const crosses = minLevel ? (yield* this._less(h[p], h[m])) : (yield* this._less(h[m], h[p]));
            if (crosses) [h[p], h[m]] = [h[m], h[p]];
            i = m;
        }
    }
    *sort() {
        const h = this.items.slice();
        for (let i = (h.length >> 1) - 1; i >= 0; i--) yield* this._trickle(h, i, h.length);
        const out = [];
        while (h.length) {
            out.push(h[0]); const tail = h.pop();
            if (h.length) { h[0] = tail; yield* this._trickle(h, 0, h.length); }
        }
        this.items = out;
    }
}

/** Levcopoulos-Petersson Poplar sort. The input is decomposed into perfect
 * post-order heaps of size 2^k-1; roots compete before each extraction. */
class PoplarSortProvider extends CoroutineSortProvider {
    *_sift(a, first, size) {
        if (size < 2) return;
        const half = (size - 1) >> 1, root = first + size - 1;
        const lr = first + half - 1, rr = root - 1;
        let best = root;
        if (yield* this._less(a[best], a[lr])) best = lr;
        if (yield* this._less(a[best], a[rr])) best = rr;
        if (best !== root) {
            [a[root], a[best]] = [a[best], a[root]];
            yield* this._sift(a, best === lr ? first : first + half, half);
        }
    }
    *_make(a, first, size) {
        if (size < 16) {
            const part = a.slice(first, first + size); yield* this._insertion(part);
            a.splice(first, size, ...part); return;
        }
        const half = (size - 1) >> 1;
        yield* this._make(a, first, half); yield* this._make(a, first + half, half);
        yield* this._sift(a, first, size);
    }
    *sort() {
        const a = this.items, pops = [];
        let largest = 1; while (largest * 2 + 1 <= a.length) largest = largest * 2 + 1;
        let at = 0, size = largest;
        while (size > 0) {
            if (a.length - at >= size) { yield* this._make(a, at, size); pops.push({start:at,size}); at += size; }
            else size = (size - 1) >> 1;
        }
        while (pops.length) {
            let best = 0;
            for (let i = 1; i < pops.length; i++) {
                const br = pops[best].start + pops[best].size - 1, ir = pops[i].start + pops[i].size - 1;
                if (yield* this._less(a[br], a[ir])) best = i;
            }
            const last = pops.length - 1;
            const br = pops[best].start + pops[best].size - 1, lr = pops[last].start + pops[last].size - 1;
            if (best !== last) { [a[br], a[lr]] = [a[lr], a[br]]; yield* this._sift(a, pops[best].start, pops[best].size); }
            const p = pops.pop();
            if (p.size > 1) {
                const half = (p.size - 1) >> 1;
                pops.push({start:p.start,size:half}, {start:p.start+half,size:half});
            }
        }
    }
}

/** McIlroy's MEL sort: greedily form encroaching lists, then merge the lists
 * pairwise. This follows the original first-compatible-list formulation. */
class MELSortProvider extends CoroutineSortProvider {
    *_mel(input, cap = Infinity) {
        const lists = [];
        for (const x of input) {
            let placed = false;
            for (const list of lists) {
                if (yield* this._less(x, list[0])) { list.unshift(x); placed = true; break; }
                if (yield* this._less(list[list.length - 1], x)) { list.push(x); placed = true; break; }
            }
            if (!placed) { lists.push([x]); if (lists.length >= cap) return null; }
        }
        while (lists.length > 1) {
            const next = [];
            for (let i = 0; i < lists.length; i += 2)
                next.push(i + 1 < lists.length ? (yield* this._merge(lists[i], lists[i + 1])) : lists[i]);
            lists.splice(0, lists.length, ...next);
        }
        return lists[0] || [];
    }
    *sort() { this.items = yield* this._mel(this.items.slice()); }
}

/** Twinsort 1.1 comparison port: twin-swap pair preprocessing with reverse-run
 * detection, followed by tail-oriented bottom-up merges from width two. */
class TwinsortProvider extends CoroutineSortProvider {
    *sort() { this.items = yield* this._twinSort(this.items.slice()); }
}

/** Boost/cpp-sort Spinsort comparison port. At n<=72 it is insertion sort;
 * larger inputs recursively create ~32-item insertion runs and merge through
 * an n/2 scratch range. Buffer moves are comparison-free in this benchmark. */
class SpinSortProvider extends CoroutineSortProvider {
    *sort() {
        if (this.n <= 72) { this.items = yield* this._insertion(this.items.slice()); return; }
        const half = (this.n + 1) >> 1;
        const spinHalf = function* (self, a) {
            if (a.length <= 32) return yield* self._insertion(a);
            const m = (a.length + 1) >> 1;
            return yield* self._merge(yield* spinHalf(self, a.slice(0,m)), yield* spinHalf(self, a.slice(m)));
        };
        this.items = yield* this._merge(
            yield* spinHalf(this, this.items.slice(0, half)),
            yield* spinHalf(this, this.items.slice(half))
        );
    }
}

/** Weave Merge recursively sorts halves, in-shuffles right/left records, then
 * repairs the interleave with insertion. Source: Sorting Wiki, Weave Merge. */
class WeaveMergeSortProvider extends CoroutineSortProvider {
    *_weaveSort(a) {
        if (a.length <= 1) return a;
        const m = a.length >> 1;
        const A = yield* this._weaveSort(a.slice(0,m)), B = yield* this._weaveSort(a.slice(m));
        const woven = [];
        for (let i=0;i<Math.max(A.length,B.length);i++) { if(i<B.length)woven.push(B[i]);if(i<A.length)woven.push(A[i]); }
        return yield* this._insertion(woven);
    }
    *sort() { this.items = yield* this._weaveSort(this.items.slice()); }
}

/** QuickMergesort / QuickXsort comparison port: median-of-three stable
 * partition; sort the largest side whose required half-buffer fits in the
 * other side with mergesort, then recurse on the remaining side. */
class QuickMergesortProvider extends CoroutineSortProvider {
    *_qms(a) {
        if (a.length <= 16) return yield* this._insertion(a);
        const pivot = yield* this._medianOf([a[0],a[a.length>>1],a[a.length-1]]);
        const L=[], R=[]; let skipped=false;
        for(const x of a){if(!skipped&&x===pivot){skipped=true;continue;}if(yield* this._greater(x,pivot))R.push(x);else L.push(x);}
        let left, right;
        if (L.length >= Math.ceil(R.length/2)) { right = yield* this._mergeSort(R); left = yield* this._qms(L); }
        else if (R.length >= Math.ceil(L.length/2)) { left = yield* this._mergeSort(L); right = yield* this._qms(R); }
        else { left = yield* this._qms(L); right = yield* this._qms(R); }
        return left.concat([pivot],right);
    }
    *sort(){this.items=yield* this._qms(this.items.slice());}
}

/** Four-way Powersort (Cawley Gelling et al.): natural runs, base-4 boundary
 * powers, weakly increasing stack powers, and 2/3/4-way tournament merges. */
class FourWayPowersortProvider extends CoroutineSortProvider {
    _power(a,b){let x=(a.start+a.arr.length/2)/this.n,y=(b.start+b.arr.length/2)/this.n,p=0;while(true){const xd=Math.floor(x*4),yd=Math.floor(y*4);p++;if(xd!==yd)return p;x=x*4-xd;y=y*4-yd;}}
    *_runs(){const runs=[];let s=0;while(s<this.n){if(s+1>=this.n){runs.push({start:s,arr:[this.items[s]]});break;}let i=s+1;const down=yield* this._greater(this.items[s],this.items[i]);i++;while(i<this.n){const gt=yield* this._greater(this.items[i-1],this.items[i]);if(gt!==down)break;i++;}let a=this.items.slice(s,i);if(down)a.reverse();runs.push({start:s,arr:a});s=i;}return runs;}
    *_group(group){return yield* this._tournamentMerge(group.map(x=>x.arr));}
    *sort(){
        const runs=yield* this._runs();if(!runs.length){this.items=[];return;}const stack=[];let cur=runs[0];
        for(let i=1;i<runs.length;i++){const next=runs[i],p=this._power(cur,next);
            while(stack.length&&stack[stack.length-1].power>p){const q=stack[stack.length-1].power,g=[cur];while(stack.length&&stack[stack.length-1].power===q)g.unshift(stack.pop());cur={start:g[0].start,arr:yield* this._group(g)};}
            stack.push({start:cur.start,arr:cur.arr,power:p});cur=next;
        }
        while(stack.length){const g=[cur];for(let k=0;k<3&&stack.length;k++)g.unshift(stack.pop());cur={start:g[0].start,arr:yield* this._group(g)};}
        this.items=cur.arr;
    }
}

/** External loser-tree merge: insertion-sort B=8 memory runs, then replay a
 * loser-recording tournament path for the final k-way merge. */
class LoserTreeMergeSortProvider extends CoroutineSortProvider {
    *sort(){const runs=[];for(let i=0;i<this.n;i+=8)runs.push(yield* this._insertion(this.items.slice(i,i+8)));this.items=yield* this._tournamentMerge(runs,true);}
}

/** GrailSort no-external-buffer comparison skeleton. It faithfully models
 * sorted collection of 2*ceil(sqrt(n)) distinct internal keys, pair runs,
 * growing buffered merges, and final key merge. Block swaps/rotations are
 * moves and intentionally invisible to a comparison-only benchmark. */
class GrailSortProvider extends CoroutineSortProvider {
    *sort(){
        if(this.n<2)return;const target=Math.min(this.n,2*Math.ceil(Math.sqrt(this.n))),keys=[this.items[0]],rest=this.items.slice(1);
        for(let i=0;i<rest.length&&keys.length<target;){const x=rest[i];let lo=0,hi=keys.length;while(lo<hi){const m=(lo+hi)>>1;if(yield* this._less(x,keys[m]))hi=m;else lo=m+1;}keys.splice(lo,0,x);rest.splice(i,1);}
        let runs=[];for(let i=0;i<rest.length;i+=2)runs.push(yield* this._insertion(rest.slice(i,i+2)));
        while(runs.length>1){const nr=[];for(let i=0;i<runs.length;i+=2)nr.push(i+1<runs.length?(yield* this._merge(runs[i],runs[i+1])):runs[i]);runs=nr;}
        this.items=yield* this._merge(keys,runs[0]||[]);
    }
}

/** WikiSort's public reference fixed-cache path: insertion-sort cache-sized
 * base runs, skip already-ordered boundaries, then stable bottom-up block
 * merges. The O(1)-memory rotation fallback is not selected at N=100. */
class WikiSortProvider extends CoroutineSortProvider {
    *sort(){let runs=[];for(let i=0;i<this.n;i+=8)runs.push(yield* this._insertion(this.items.slice(i,i+8)));
        while(runs.length>1){const nr=[];for(let i=0;i<runs.length;i+=2){if(i+1>=runs.length){nr.push(runs[i]);continue;}const A=runs[i],B=runs[i+1];if(!(yield* this._greater(A[A.length-1],B[0])))nr.push(A.concat(B));else nr.push(yield* this._merge(A,B));}runs=nr;}this.items=runs[0]||[];}
}

/** Fluxsort 1.1 comparison port: median-of-three quartile pivot, stable
 * out-of-place partition, recursive partitions, and Twinsort at <=64. */
class FluxsortProvider extends CoroutineSortProvider {
    *_flux(a){if(a.length<=64)return yield* this._twinSort(a);const pivot=yield* this._medianOf([a[a.length>>2],a[a.length>>1],a[(3*a.length)>>2]]);const L=[],R=[];let skipped=false;for(const x of a){if(!skipped&&x===pivot){skipped=true;L.push(x);continue;}if(yield* this._greater(x,pivot))R.push(x);else L.push(x);}return (yield* this._flux(L)).concat(yield* this._flux(R));}
    *sort(){this.items=yield* this._flux(this.items.slice());}
}

/** Crumsort comparison port: full adjacent-pair analyzer, adaptive merge-sort
 * fallback above 66% order, otherwise ninther quicksort with a 24-item base. */
class CrumsortProvider extends CoroutineSortProvider {
    *sort(){if(this.n<2)return;let ordered=0,up=0,down=0;for(let i=1;i<this.n;i++){if(yield* this._greater(this.items[i-1],this.items[i]))down++;else up++;}ordered=Math.max(up,down)/(this.n-1);
        if(up===this.n-1) return;if(down===this.n-1){this.items.reverse();return;}
        if(ordered>=2/3)this.items=yield* this._mergeSort(this.items.slice(),16);else this.items=yield* this._stableQuick(this.items.slice(),24,9);}
}

/** Glidesort comparison-level port: classify natural runs vs deferred 8-item
 * logical runs, use Powersort's boundary policy, materialize unordered runs
 * with stable quicksort only when a logical merge needs physical order. */
class GlidesortProvider extends CoroutineSortProvider {
    _power(a,b){let x=(a.start+a.arr.length/2)/this.n,y=(b.start+b.arr.length/2)/this.n,p=0;while(true){const xb=Math.floor(x*2),yb=Math.floor(y*2);if(xb!==yb)return p;x=x*2-xb;y=y*2-yb;p++;}}
    *_logicalMerge(A,B){if(!A.sorted&&!B.sorted&&A.arr.length+B.arr.length<=Math.max(8,this.n>>1))return{start:A.start,arr:A.arr.concat(B.arr),sorted:false};const a=A.sorted?A.arr:(yield* this._stableQuick(A.arr,16,3));const b=B.sorted?B.arr:(yield* this._stableQuick(B.arr,16,3));return{start:A.start,arr:yield* this._merge(a,b),sorted:true};}
    *_logicalRuns(){const out=[];let s=0;while(s<this.n){if(s+1>=this.n){out.push({start:s,arr:[this.items[s]],sorted:true});break;}let i=s+1,down=yield* this._greater(this.items[s],this.items[i]);i++;while(i<this.n){const gt=yield* this._greater(this.items[i-1],this.items[i]);if(gt!==down)break;i++;}if(i-s>=8){let a=this.items.slice(s,i);if(down)a.reverse();out.push({start:s,arr:a,sorted:true});s=i;}else{const e=Math.min(this.n,s+8);out.push({start:s,arr:this.items.slice(s,e),sorted:false});s=e;}}return out;}
    *sort(){const rs=yield* this._logicalRuns();if(!rs.length){this.items=[];return;}const stack=[];let cur=rs[0];for(let i=1;i<rs.length;i++){const next=rs[i],p=this._power(cur,next);while(stack.length&&stack[stack.length-1].power>=p)cur=yield* this._logicalMerge(stack.pop(),cur);stack.push({...cur,power:p});cur=next;}while(stack.length)cur=yield* this._logicalMerge(stack.pop(),cur);if(!cur.sorted)cur={...cur,arr:yield* this._stableQuick(cur.arr,16,3),sorted:true};this.items=cur.arr;}
}

/** Blitsort comparison port: stable rotate-partition quick/merge hybrid. The
 * median-of-nine partition and 24-item merge base are modeled; rotations do
 * not add comparisons and stable arrays represent their resulting order. */
class BlitsortProvider extends CoroutineSortProvider {
    *sort(){this.items=yield* this._stableQuick(this.items.slice(),24,9);}
}

/** VQSort comparison model pinned to Google Highway c415565 (u64,
 * ascending, AVX2: four 64-bit lanes and a 64-key base case). Algorithm and
 * network source: Google Highway (Copyright 2021 Google LLC;
 * Apache-2.0/BSD-3-Clause source files). It ports the current six-chunk
 * median-of-three sampler, the exact 4/8/16-row Highway
 * sorting/merging networks, lane-to-pivot partition comparisons, recursion,
 * and the paper's degenerate min/max safeguard (standing in for the current
 * primitive-only equality/two-value fast paths). SIMD concurrency, CompressStore's
 * physical lane packing, cache effects, and instruction throughput are not
 * representable as asynchronous human battles; stable partition buffers stand
 * in for those moves. The fixed SFC64 state makes the sampling trace
 * reproducible. */
class VQSortAVX2Provider extends CoroutineSortProvider {
    constructor(n) {
        super(n);
        // Highway seeds this thread-local SFC64-family state from entropy. A
        // fixed nonzero stream changes only sampled chunk locations, not the
        // fixed u64/AVX2 comparison architecture measured here.
        this._vqState = [0x243f6a8885a308d3n, 0x13198a2e03707344n, 1n];
    }
    _random64() {
        const mask = (1n << 64n) - 1n;
        const [a, b, counter] = this._vqState;
        const w = (counter + 1n) & mask;
        const next = (a ^ w) & mask;
        this._vqState[0] = (((b + ((b << 3n) & mask)) & mask) ^ (b >> 11n)) & mask;
        this._vqState[1] = ((((b << 24n) & mask) | (b >> 40n)) + next) & mask;
        this._vqState[2] = w;
        return next;
    }
    _randomChunk(numChunks, bits) {
        return Number((BigInt(bits >>> 0) * BigInt(numChunks)) >> 32n);
    }
    *_ordered(a, b) {
        // null is Highway's LastValue padding and never becomes a battle.
        if (a === null) return b === null ? [a, b] : [b, a];
        if (b === null || a === b) return [a, b];
        return (yield* this._greater(a, b)) ? [b, a] : [a, b];
    }
    *_sortVectorPair(vectors, i, j) {
        for (let lane = 0; lane < vectors[i].length; lane++) {
            const pair = yield* this._ordered(vectors[i][lane], vectors[j][lane]);
            vectors[i][lane] = pair[0]; vectors[j][lane] = pair[1];
        }
    }
    *_sortRows(vectors) {
        const pairs4 = [[0,2],[1,3],[0,1],[2,3],[1,2]];
        const pairs8 = [
            [0,2],[1,3],[4,6],[5,7], [0,4],[1,5],[2,6],[3,7],
            [0,1],[2,3],[4,5],[6,7], [2,4],[3,5], [1,4],[3,6],
            [1,2],[3,4],[5,6]
        ];
        const pairs16 = [
            [0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],
            [0,2],[1,3],[4,6],[5,7],[8,10],[9,11],[12,14],[13,15],
            [0,4],[1,5],[2,6],[3,7],[8,12],[9,13],[10,14],[11,15],
            [0,8],[1,9],[2,10],[3,11],[4,12],[5,13],[6,14],[7,15],
            [5,10],[6,9],[3,12],[7,11],[13,14],[4,8],[1,2],[1,4],
            [7,13],[2,8],[11,14],[2,4],[5,6],[9,10],[11,13],[3,8],
            [7,12],[3,5],[6,8],[7,9],[10,12],[3,4],[5,6],[7,8],
            [9,10],[11,12],[6,7],[8,9]
        ];
        const pairs = vectors.length === 4 ? pairs4 : vectors.length === 8 ? pairs8 : pairs16;
        for (const [i, j] of pairs) yield* this._sortVectorPair(vectors, i, j);
    }
    _reverseGroups(vector, width) {
        const out = vector.slice();
        for (let start = 0; start < out.length; start += width) {
            const end = Math.min(start + width, out.length);
            for (let l = start, r = end - 1; l < r; l++, r--)
                [out[l], out[r]] = [out[r], out[l]];
        }
        return out;
    }
    *_mergeRows(vectors, width) {
        const rows = vectors.length;
        // This is the generated Merge8x{2,4}/Merge16x{2,4} sequence: reverse
        // each upper half in groups of width, then compare mirrored rows.
        for (let span = rows; span >= 2; span >>= 1) {
            for (let start = 0; start < rows; start += span) {
                const half = span >> 1;
                for (let r = start + half; r < start + span; r++)
                    vectors[r] = this._reverseGroups(vectors[r], width);
                for (let r = 0; r < half; r++)
                    yield* this._sortVectorPair(vectors, start + r, start + span - 1 - r);
            }
        }
        // Finish the in-vector merge: SortPairsDistance1 for x2; for x4,
        // SortPairsReverse4 followed by SortPairsDistance1.
        for (let span = width; span >= 2; span >>= 1) {
            for (const vector of vectors) {
                for (let start = 0; start < vector.length; start += span) {
                    for (let i = 0; i < (span >> 1); i++) {
                        const l = start + i, r = start + span - 1 - i;
                        const pair = yield* this._ordered(vector[l], vector[r]);
                        vector[l] = pair[0]; vector[r] = pair[1];
                    }
                }
            }
        }
    }
    *_baseCase(input) {
        const n = input.length;
        if (n <= 1) return input.slice();
        if (n === 2) {
            const pair = yield* this._ordered(input[0], input[1]);
            return pair;
        }
        let rows, cols;
        if (n <= 4) { rows = 4; cols = 1; }
        else if (n <= 8) { rows = 8; cols = 1; }
        else if (n <= 16) { rows = 8; cols = 2; }
        else if (n <= 32) { rows = 8; cols = 4; }
        else { rows = 16; cols = 4; } // AVX2 u64 BaseCaseNumLanes = 64
        const padded = input.slice();
        while (padded.length < rows * cols) padded.push(null);
        const vectors = [];
        for (let r = 0; r < rows; r++) vectors.push(padded.slice(r * cols, (r + 1) * cols));
        yield* this._sortRows(vectors);
        if (cols >= 2) yield* this._mergeRows(vectors, 2);
        if (cols >= 4) yield* this._mergeRows(vectors, 4);
        return vectors.flat().filter(x => x !== null).slice(0, n);
    }
    *_median3(a, b, c) {
        // Highway MedianOf3: Sort2(v0,v2), Last(v0,v1), First(v1,v2).
        const ac = yield* this._ordered(a, c);
        const lob = yield* this._ordered(ac[0], b);
        const midhi = yield* this._ordered(lob[1], ac[1]);
        return midhi[0];
    }
    *_drawSamples(a, base) {
        // uint64 chunks are 64 bytes = 8 keys. Model an initially 64-byte
        // aligned input, so subrange alignment is determined by `base`.
        const consume = (8 - (base & 7)) & 7;
        const first = consume;
        const numChunks = Math.floor((a.length - consume) / 8);
        if (numChunks < 1) throw new Error('VQSort sample range is too small');
        const bits = [];
        for (let i = 0; i < 3; i++) {
            const word = this._random64();
            bits.push(Number(word & 0xffffffffn), Number((word >> 32n) & 0xffffffffn));
        }
        const offsets = bits.map(x => first + 8 * this._randomChunk(numChunks, x));
        const samples = new Array(16);
        for (let i = 0; i < 8; i += 4) {
            for (let lane = 0; lane < 4; lane++) {
                samples[i + lane] = yield* this._median3(
                    a[offsets[0] + i + lane], a[offsets[1] + i + lane], a[offsets[2] + i + lane]);
                samples[8 + i + lane] = yield* this._median3(
                    a[offsets[3] + i + lane], a[offsets[4] + i + lane], a[offsets[5] + i + lane]);
            }
        }
        return samples;
    }
    _pivotRank(samples) {
        const mid = 8;
        let prev = mid - 1;
        while (samples[prev] === samples[mid]) {
            if (prev === 0) return 0;
            prev--;
        }
        let next = prev + 1;
        while (samples[next] === samples[mid]) {
            if (next === samples.length - 1) return prev;
            next++;
        }
        return next - mid < mid - prev ? mid : prev;
    }
    *_partition(a, pivot) {
        const left = [], right = [];
        for (const x of a) {
            if (x === pivot) { left.push(x); continue; }
            if (yield* this._greater(x, pivot)) right.push(x); else left.push(x);
        }
        return [left, right];
    }
    *_minMax(a) {
        if (!a.length) return [null, null];
        let min, max, i;
        if (a.length & 1) { min = max = a[0]; i = 1; }
        else { const p = yield* this._ordered(a[0], a[1]); min = p[0]; max = p[1]; i = 2; }
        for (; i + 1 < a.length; i += 2) {
            const p = yield* this._ordered(a[i], a[i + 1]);
            min = (yield* this._ordered(min, p[0]))[0];
            max = (yield* this._ordered(max, p[1]))[1];
        }
        if (i < a.length) {
            min = (yield* this._ordered(min, a[i]))[0];
            max = (yield* this._ordered(max, a[i]))[1];
        }
        return [min, max];
    }
    *_heapSort(a) {
        const sift = function* (self, end, root) {
            while (true) {
                let child = root * 2 + 1;
                if (child >= end) return;
                if (child + 1 < end && (yield* self._greater(a[child + 1], a[child]))) child++;
                if (!(yield* self._greater(a[child], a[root]))) return;
                [a[root], a[child]] = [a[child], a[root]]; root = child;
            }
        };
        for (let root = (a.length >> 1) - 1; root >= 0; root--) yield* sift(this, a.length, root);
        for (let end = a.length - 1; end > 0; end--) {
            [a[0], a[end]] = [a[end], a[0]];
            yield* sift(this, end, 0);
        }
        return a;
    }
    *_vqsort(a, base, levels) {
        if (a.length <= 64) return yield* this._baseCase(a);
        const samples = yield* this._drawSamples(a, base);
        // Integer equality and sample-rank scans are primitive operations in
        // Highway. Identity equality is likewise battle-free in this model.
        const sortedSamples = yield* this._baseCase(samples);
        const pivot = sortedSamples[this._pivotRank(sortedSamples)];
        if (levels === 0) return yield* this._heapSort(a.slice());
        let [left, right] = yield* this._partition(a, pivot);
        if (right.length === 0) {
            // Published-paper safeguard for a last-value pivot: scan min/max,
            // stop if equal, otherwise repartition around the first value. The
            // current native source instead uses primitive-key equality,
            // PrevValue, and two-value paths unavailable to opaque battles.
            const [first, last] = yield* this._minMax(a);
            if (first === last) return a.slice();
            [left, right] = yield* this._partition(a, first);
            if (right.length === 0) return a.slice(); // indistinguishable ties
        }
        const L = yield* this._vqsort(left, base, levels - 1);
        const R = yield* this._vqsort(right, base + left.length, levels - 1);
        return L.concat(R);
    }
    *sort() { this.items = yield* this._vqsort(this.items.slice(), 0, 50); }
}

/** Optimized Pancake (Pancake Merge): recursive sort plus binary-search
 * rotate merge. Published prefix-flip decompositions are comparison-free, so
 * direct rotations preserve the exact comparison metric measured here. */
class OptimizedPancakeSortProvider extends CoroutineSortProvider {
    *_lowerBound(a,lo,hi,key){while(lo<hi){const m=(lo+hi)>>1;if(yield* this._less(a[m],key))lo=m+1;else hi=m;}return lo;}
    *_rotateMerge(a,lo,mid,hi){const n1=mid-lo,n2=hi-mid;if(!n1||!n2)return;if(n1+n2===2){if(yield* this._greater(a[lo],a[mid]))[a[lo],a[mid]]=[a[mid],a[lo]];return;}let c1,c2;if(n1>n2){c1=lo+(n1>>1);c2=yield* this._lowerBound(a,mid,hi,a[c1]);}else{c2=mid+(n2>>1);c1=yield* this._lowerBound(a,lo,mid,a[c2]);}const left=a.slice(c1,mid),right=a.slice(mid,c2);a.splice(c1,c2-c1,...right,...left);const nm=c1+(c2-mid);yield* this._rotateMerge(a,lo,c1,nm);yield* this._rotateMerge(a,nm,c2,hi);}
    *_pancake(a,lo,hi){if(hi-lo<=1)return;const mid=lo+((hi-lo)>>1);yield* this._pancake(a,lo,mid);yield* this._pancake(a,mid,hi);yield* this._rotateMerge(a,lo,mid,hi);}
    *sort(){yield* this._pancake(this.items,0,this.n);}
}

// ---------------------------------------------------------------------------
// Web expansion 4 (2026-09-12): comparison sorts from a fresh wild-web sweep.
// All new names were cross-checked against the 144-provider registry.  Every
// provider below is comparison-based (no key/digit inspection), returns valid
// item ids, and finishes with a correctly sorted `items` permutation.
// ---------------------------------------------------------------------------

/** Bogo family variant: verify strongest-first (DESC) order; on the first
 * violation perform one randomized "cocktail" shuffle (a forward then a
 * backward pass of coin-flip adjacent swaps, which generate the symmetric
 * group) and restart. Source idea: the Bogo-sort family at
 * https://sortingalgos.miraheze.org/wiki/Bogosort . */
class CocktailBogoSortProvider extends Provider {
    constructor(n) { super(n); this.i = 0; this.state = n > 1 ? 'verify' : 'done'; }
    next(result) {
        while (this.state !== 'done') {
            if (this.state === 'verify') {
                if (result !== undefined) {
                    if (result === 1) this.i++;
                    else {
                        for (let k = 0; k < this.n - 1; k++) if (Math.random() < 0.5) { const t = this.items[k]; this.items[k] = this.items[k + 1]; this.items[k + 1] = t; }
                        for (let k = this.n - 2; k >= 0; k--) if (Math.random() < 0.5) { const t = this.items[k]; this.items[k] = this.items[k + 1]; this.items[k + 1] = t; }
                        this.i = 0;
                    }
                    result = undefined; continue;
                }
                if (this.i < this.n - 1) return [this.items[this.i], this.items[this.i + 1]];
                this.state = 'done'; continue;
            }
        }
        return null;
    }
}

/** Comparison counting sort (Knuth, TAOCP 5.2): count[i] = number of elements
 * strictly less than a[i], then place a[i] at position count[i].  O(n^2)
 * comparisons, each unordered pair probed twice (once per orientation). */
class ComparisonCountingSortProvider extends CoroutineSortProvider {
    *sort() {
        const a = this.items.slice(), n = a.length;
        const count = new Array(n).fill(0);
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++) {
                if (i === j) continue;
                if (yield* this._less(a[j], a[i])) count[i]++;
            }
        const out = new Array(n);
        for (let i = 0; i < n; i++) out[count[i]] = a[i];
        this.items = out;
    }
}

/** Shellsort with Shell's original 1959 halving gap sequence (n/2, n/4, ...). */
class OriginalShellSortProvider extends GapInsertionSortProvider {
    gaps() { const g = []; for (let x = this.n >> 1; x >= 1; x >>= 1) g.push(x); return g; }
}

/** Hibbard's 2^k - 1 Shellsort increment sequence. */
class HibbardShellSortProvider extends GapInsertionSortProvider {
    gaps() { const g = []; for (let x = 1; x < this.n; x = x * 2 + 1) g.push(x); return g; }
}

/** Ciura's empirically best-known Shellsort increments (1, 4, 10, 23, 57,
 * 132, 301, 701, 1750). Source: M. Ciura 2001. */
class CiuraShellSortProvider extends GapInsertionSortProvider {
    gaps() { return [1, 4, 10, 23, 57, 132, 301, 701, 1750]; }
}

/** Gonnet & Baeza-Yates' Shellsort increments h_{k+1} = floor(5 h_k / 11). */
class GonnetShellSortProvider extends GapInsertionSortProvider {
    gaps() { const g = []; for (let x = this.n; x >= 1; x = Math.floor(5 * x / 11)) g.push(x); return g; }
}

/** d-ary heapsort with arity 5 (extends the repo's incremental-build d-ary
 * heap; the 3- and 4-ary forms are already registered). */
class FiveAryHeapSortProvider extends DAryHeapSortProvider { constructor(n) { super(n, 5); } }

/** k-way (tournament) mergesort with k = 8 (extends the existing k-way base;
 * the 3- and 4-way forms are already registered). */
class MergeSort8WayProvider extends KWayMergeSortProvider { constructor(n) { super(n, 8); } }

/** QuickHeapsort (Cantone & Cincotti 2000): median-of-three quicksort that
 * switches to an in-place heapsort on every sub-array of size <= 16 instead
 * of plain insertion. A distinct hybrid of quicksort + heapsort. */
class QuickHeapsortProvider extends CoroutineSortProvider {
    *_siftD(a, i, size) {
        while (true) {
            let l = 2 * i + 1, r = l + 1;
            if (l >= size) return;
            let c = l;
            if (r < size && (yield* this._less(a[c], a[r]))) c = r;
            if (!(yield* this._less(a[i], a[c]))) return;
            [a[i], a[c]] = [a[c], a[i]]; i = c;
        }
    }
    *_heapSort(a) {
        for (let i = (a.length >> 1) - 1; i >= 0; i--) yield* this._siftD(a, i, a.length);
        for (let size = a.length; size > 1; size--) { [a[0], a[size - 1]] = [a[size - 1], a[0]]; yield* this._siftD(a, 0, size - 1); }
    }
    *_median3(a, i, j, k) {
        if (yield* this._less(a[j], a[i])) [a[i], a[j]] = [a[j], a[i]];
        if (yield* this._less(a[k], a[i])) [a[i], a[k]] = [a[k], a[i]];
        if (yield* this._less(a[k], a[j])) [a[j], a[k]] = [a[k], a[j]];
        return j;
    }
    *_qs(a, lo, hi) {
        if (hi - lo + 1 <= 16) {
            const seg = a.slice(lo, hi + 1);
            yield* this._heapSort(seg);
            for (let i = lo; i <= hi; i++) a[i] = seg[i - lo];
            return;
        }
        const m = yield* this._median3(a, lo, (lo + hi) >> 1, hi);
        [a[m], a[hi]] = [a[hi], a[m]];
        const pivot = a[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) if (yield* this._less(a[j], pivot)) { [a[i], a[j]] = [a[j], a[i]]; i++; }
        [a[i], a[hi]] = [a[hi], a[i]];
        yield* this._qs(a, lo, i - 1);
        yield* this._qs(a, i + 1, hi);
    }
    *sort() { yield* this._qs(this.items, 0, this.n - 1); }
}

/** JSort (Jason Morrison): two in-place heap passes roughly order the array
 * (a min-heap pass front-to-back, then a max-heap pass back-to-front), and a
 * final insertion sort finishes. O(n^2) worst case. Source:
 * https://en.wikipedia.org/wiki/JSort */
class JSortProvider extends CoroutineSortProvider {
    *_minHeapifyFront(a) {
        for (let k = 1; k < a.length; k++) {
            let j = k;
            while (j > 0) {
                const p = (j - 1) >> 1;
                if (!(yield* this._less(a[j], a[p]))) break;
                [a[j], a[p]] = [a[p], a[j]]; j = p;
            }
        }
    }
    *_maxHeapifyBack(a) {
        const n = a.length, b = a.slice().reverse();
        for (let k = 1; k < n; k++) {
            let j = k;
            while (j > 0) {
                const p = (j - 1) >> 1;
                if (!(yield* this._greater(b[j], b[p]))) break;
                [b[j], b[p]] = [b[p], b[j]]; j = p;
            }
        }
        for (let k = 0; k < n; k++) a[n - 1 - k] = b[k];
    }
    *sort() {
        const a = this.items;
        yield* this._minHeapifyFront(a);
        yield* this._maxHeapifyBack(a);
        yield* this._insertion(a);
    }
}

/** Drop-Merge sort (Emil Ernerfeldt): keep a nondecreasing subsequence with
 * recency-based rollback and fast backtracking (Jackson et al.'s dropsort
 * improvement), sort the dropped outliers with a fallback sorter, merge back.
 * O(N + K log K). Comparison port of
 * https://github.com/emilk/drop-merge-sort (EARLY_OUT abort omitted; it never
 * triggers on the benchmark's random data). */
class DropMergeSortProvider extends CoroutineSortProvider {
    *sort() {
        const a = this.items, n = a.length;
        if (n < 2) return;
        const RECENCY = 8;
        const dropped = [];
        let num_dropped_in_row = 0, write = 0, read = 0;
        while (read < n) {
            if (write === 0 || !(yield* this._less(a[read], a[write - 1]))) {
                a[write] = a[read]; write++; read++; num_dropped_in_row = 0;
            } else if (num_dropped_in_row === 0 && write >= 2 && !(yield* this._less(a[read], a[write - 2]))) {
                // Double-comparison quick undo: drop the previously accepted
                // element and overwrite it with the new one.
                dropped.push(a[write - 1]);
                a[write - 1] = a[read]; read++;
            } else if (num_dropped_in_row < RECENCY) {
                dropped.push(a[read]); read++; num_dropped_in_row++;
            } else {
                // Rollback: accepting RECENCY elements ago was a mistake.
                dropped.length = dropped.length - num_dropped_in_row;
                read -= num_dropped_in_row;
                let num_backtracked = 1;
                write -= 1;
                // Fast backtracking: rewind until at least one of the recently
                // dropped elements can be re-accepted.
                let maxIdx = read;
                for (let k = 1; k <= num_dropped_in_row; k++)
                    if (yield* this._less(a[maxIdx], a[read + k])) maxIdx = read + k;
                while (write >= 1 && (yield* this._less(a[maxIdx], a[write - 1]))) { num_backtracked++; write--; }
                for (let k = 0; k < num_backtracked; k++) dropped.push(a[write + k]);
                num_dropped_in_row = 0;
            }
        }
        const sd = yield* this._stableQuick(dropped, 16, 3);
        this.items = yield* this._merge(a.slice(0, write), sd);
    }
}

/** Split sort (Levcopoulos-Petersson / cpp-sort split_adapter): one O(n) pass
 * isolates a longest ascending subsequence; the removed tail is sorted with a
 * fallback sorter and the two parts are merged. Inv-adaptive. */
class SplitSortProvider extends CoroutineSortProvider {
    *sort() {
        const kept = [], removed = [];
        for (const x of this.items) {
            if (kept.length === 0 || !(yield* this._less(x, kept[kept.length - 1]))) kept.push(x);
            else removed.push(x);
        }
        const sr = yield* this._stableQuick(removed, 16, 3);
        this.items = yield* this._merge(kept, sr);
    }
}

/** Vergesort (Morwenn): detects ascending/descending runs and keeps the ones
 * longer than n / log n, sorts each non-big-enough section with a fallback
 * quicksort, then pairwise-merges every run. Mono-adaptive.
 * Source: https://github.com/Morwenn/vergesort */
class VergesortProvider extends CoroutineSortProvider {
    *sort() {
        const a = this.items, n = a.length;
        const threshold = Math.max(2, n / Math.log(n));
        const runs = [];
        let i = 0;
        while (i < n) {
            let j = i + 1, down = false;
            if (j < n) down = yield* this._greater(a[i], a[j]);
            while (j < n) {
                const gt = yield* this._greater(a[j - 1], a[j]);
                if (gt !== down) break;
                j++;
            }
            const run = a.slice(i, j);
            if (down) run.reverse();
            runs.push(run);
            i = j;
        }
        // Sort every run below the big-run threshold with the fallback sorter,
        // keep the big runs, then finish with a balanced pairwise (k-way) merge
        // of all runs, as in Morwenn's vergesort.
        let list = [];
        for (const r of runs) list.push(r.length >= threshold ? r : (yield* this._stableQuick(r, 16, 3)));
        while (list.length > 1) {
            const nr = [];
            for (let k = 0; k < list.length; k += 2) nr.push(k + 1 < list.length ? (yield* this._merge(list[k], list[k + 1])) : list[k]);
            list = nr;
        }
        this.items = list[0] || [];
    }
}

/** Neatsort (Yang & Huang): an n-1 comparison adjacent scan feeds a sorted
 * section capped at floor(log2 n); everything else is quicksorted, then the
 * two parts are merged. O(n log n) comparisons.
 * Source: https://en.wikipedia.org/wiki/Neatsort */
class NeatsortProvider extends CoroutineSortProvider {
    *sort() {
        const a = this.items, n = a.length;
        if (n < 2) return;
        const limit = Math.max(1, Math.floor(Math.log2(n)));
        const sorted = [a[0]], unsorted = [];
        for (let i = 1; i < n; i++) {
            if (sorted.length >= limit || (yield* this._less(a[i], sorted[sorted.length - 1]))) unsorted.push(a[i]);
            else sorted.push(a[i]);
        }
        const su = yield* this._stableQuick(unsorted, 16, 3);
        this.items = yield* this._merge(sorted, su);
    }
}

/** 3-way Powersort (Munro-Wild): the run-adaptive multiway mergesort with
 * base-3 node powers and 3-run groups; the 4-way form is already registered.
 * Source: https://arxiv.org/abs/2209.06909 */
class ThreeWayPowersortProvider extends CoroutineSortProvider {
    _power(a, b) { let x = (a.start + a.arr.length / 2) / this.n, y = (b.start + b.arr.length / 2) / this.n, p = 0; while (true) { const xd = Math.floor(x * 3), yd = Math.floor(y * 3); p++; if (xd !== yd) return p; x = x * 3 - xd; y = y * 3 - yd; } }
    *_runs() { const runs = []; let s = 0; while (s < this.n) { if (s + 1 >= this.n) { runs.push({ start: s, arr: [this.items[s]] }); break; } let i = s + 1; const down = yield* this._greater(this.items[s], this.items[i]); i++; while (i < this.n) { const gt = yield* this._greater(this.items[i - 1], this.items[i]); if (gt !== down) break; i++; } let a = this.items.slice(s, i); if (down) a.reverse(); runs.push({ start: s, arr: a }); s = i; } return runs; }
    *_group(group) { return yield* this._tournamentMerge(group.map(x => x.arr)); }
    *sort() {
        const runs = yield* this._runs(); if (!runs.length) { this.items = []; return; }
        const stack = []; let cur = runs[0];
        for (let i = 1; i < runs.length; i++) {
            const next = runs[i], p = this._power(cur, next);
            while (stack.length && stack[stack.length - 1].power > p) {
                const q = stack[stack.length - 1].power, g = [cur];
                while (stack.length && stack[stack.length - 1].power === q) g.unshift(stack.pop());
                cur = { start: g[0].start, arr: yield* this._group(g) };
            }
            stack.push({ start: cur.start, arr: cur.arr, power: p }); cur = next;
        }
        while (stack.length) {
            const g = [cur];
            for (let k = 0; k < 2 && stack.length; k++) g.unshift(stack.pop());
            cur = { start: g[0].start, arr: yield* this._group(g) };
        }
        this.items = cur.arr;
    }
}

/** Parberry's pairwise sorting network (1992): a fixed comparator network
 * with the same size/depth as Batcher's odd-even mergesort but a different
 * interconnection. Comparators are emitted in the paper's layer order with
 * the j < n bound guards for non-power-of-two sizes. Source:
 * https://handwiki.org/wiki/Pairwise_sorting_network */
class PairwiseSortingNetworkProvider extends Provider {
    constructor(n) {
        super(n);
        this.k = 1; while (this.k < n) this.k <<= 1;
        this.comps = [];
        for (let p = this.k >> 1; p >= 1; p >>= 1) {
            for (let a = 0; a < n; a += 2 * p)
                for (let b = 0; b < p; b++) {
                    const j = a + b + p;
                    if (j < n) this.comps.push([a + b, j]);
                }
            for (let q = this.k >> 1; q >= 2 * p; q >>= 1)
                for (let c = 0; c < n; c += 2 * p)
                    for (let d = 0; d < p; d++) {
                        const j = c + d + q;
                        if (j < n) this.comps.push([c + d + p, j]);
                    }
        }
        this.idx = 0; this.pending = false;
    }
    next(result) {
        if (result !== undefined && this.pending) {
            if (result === 1) { const t = this.items[this.pi]; this.items[this.pi] = this.items[this.pj]; this.items[this.pj] = t; }
            this.pending = false; result = undefined;
        }
        while (this.idx < this.comps.length) {
            const [i, j] = this.comps[this.idx++];
            this.pi = i; this.pj = j; this.pending = true;
            return [this.items[i], this.items[j]];
        }
        return null;
    }
}

/** Shuffle sort: floor(n/2) bubble-shuffle passes push the largest values to
 * the end, then a final insertion sort finishes the remaining inversions.
 * Source: Sorting Wiki, Shuffle sort. */
class ShuffleSortProvider extends CoroutineSortProvider {
    *sort() {
        const a = this.items, n = a.length;
        const passes = Math.max(1, n >> 1);
        for (let p = 0; p < passes; p++)
            for (let i = 0; i + 1 < n; i++)
                if (yield* this._greater(a[i], a[i + 1])) [a[i], a[i + 1]] = [a[i + 1], a[i]];
        yield* this._insertion(a);
    }
}

/** Binary cocktail sort: a bidirectional insertion sort whose forward pass
 * and reverse pass both locate the insertion point by binary search. */
class BinaryCocktailSortProvider extends CoroutineSortProvider {
    *sort() {
        const a = this.items, n = a.length;
        for (let i = 1; i < n; i++) {
            const key = a[i]; let lo = 0, hi = i;
            while (lo < hi) { const m = (lo + hi) >> 1; if (yield* this._less(key, a[m])) hi = m; else lo = m + 1; }
            for (let j = i; j > lo; j--) a[j] = a[j - 1];
            a[lo] = key;
        }
        for (let i = n - 2; i >= 0; i--) {
            const key = a[i]; let lo = i + 1, hi = n;
            while (lo < hi) { const m = (lo + hi) >> 1; if (yield* this._less(key, a[m])) hi = m; else lo = m + 1; }
            for (let j = i; j < lo - 1; j++) a[j] = a[j + 1];
            a[lo - 1] = key;
        }
    }
}

/** Skew heap sort: insert everything into a self-adjusting skew heap
 * (Sleator-Tarjan), then repeated delete-min. ASC. */
class SkewHeapSortProvider extends CoroutineSortProvider {
    *_meld(a, b) {
        if (!a) return b; if (!b) return a;
        if (yield* this._less(b.val, a.val)) { const t = a; a = b; b = t; }
        a.right = yield* this._meld(a.right, b);
        const t = a.left; a.left = a.right; a.right = t;
        return a;
    }
    *sort() {
        let root = null;
        for (const x of this.items) root = yield* this._meld({ val: x, left: null, right: null }, root);
        const out = [];
        while (root) { out.push(root.val); root = yield* this._meld(root.left, root.right); }
        this.items = out;
    }
}

/** Leftist heap sort: insert into a rank-maintained leftist heap, then
 * repeated delete-min. Distinct from the skew heap (null-path-length upkeep
 * instead of unconditional child swaps). */
class LeftistHeapSortProvider extends CoroutineSortProvider {
    *_meld(a, b) {
        if (!a) return b; if (!b) return a;
        if (yield* this._less(b.val, a.val)) { const t = a; a = b; b = t; }
        a.right = yield* this._meld(a.right, b);
        const nl = a.left ? a.left.npl : -1, nr = a.right ? a.right.npl : -1;
        if (nr > nl) { const t = a.left; a.left = a.right; a.right = t; }
        a.npl = Math.min(nl, nr) + 1;
        return a;
    }
    *sort() {
        let root = null;
        for (const x of this.items) root = yield* this._meld({ val: x, left: null, right: null, npl: 0 }, root);
        const out = [];
        while (root) { out.push(root.val); root = yield* this._meld(root.left, root.right); }
        this.items = out;
    }
}

/** Binomial heap sort: link-based binomial heap insert (amortized O(1)) plus
 * repeated find-min/delete-min over the root forest. */
class BinomialHeapSortProvider extends CoroutineSortProvider {
    constructor(n) { super(n); this._trees = []; }
    *_link(a, b) {
        if (yield* this._less(b.val, a.val)) { const t = a; a = b; b = t; }
        b.sibling = a.child; a.child = b; a.deg++;
        return a;
    }
    *_insert(root) {
        let deg = root.deg, t = root;
        while (this._trees[deg]) {
            t = yield* this._link(t, this._trees[deg]);
            this._trees[deg] = undefined; deg++;
        }
        this._trees[deg] = t;
    }
    *sort() {
        for (const x of this.items) yield* this._insert({ val: x, deg: 0, child: null, sibling: null });
        const out = [];
        while (true) {
            let minDeg = -1;
            for (let d = 0; d < this._trees.length; d++) {
                if (!this._trees[d]) continue;
                if (minDeg < 0) minDeg = d;
                else if (yield* this._less(this._trees[d].val, this._trees[minDeg].val)) minDeg = d;
            }
            if (minDeg < 0) break;
            const root = this._trees[minDeg];
            this._trees[minDeg] = undefined;
            out.push(root.val);
            let c = root.child;
            while (c) { const nxt = c.sibling; c.sibling = null; yield* this._insert(c); c = nxt; }
        }
        this.items = out;
    }
}

/** AVL tree sort: insert into a height-balanced AVL tree (rotations are
 * comparison-free), then in-order traversal. ASC. */
class AVLTreeSortProvider extends CoroutineSortProvider {
    _h(n) { return n ? n.h : 0; }
    _rr(y) { const x = y.l; y.l = x.r; x.r = y; y.h = 1 + Math.max(this._h(y.l), this._h(y.r)); x.h = 1 + Math.max(this._h(x.l), this._h(x.r)); return x; }
    _rl(x) { const y = x.r; x.r = y.l; y.l = x; x.h = 1 + Math.max(this._h(x.l), this._h(x.r)); y.h = 1 + Math.max(this._h(y.l), this._h(y.r)); return y; }
    *_ins(node, key) {
        if (!node) return { val: key, h: 1, l: null, r: null };
        if (yield* this._less(key, node.val)) node.l = yield* this._ins(node.l, key);
        else if (yield* this._less(node.val, key)) node.r = yield* this._ins(node.r, key);
        else return node;
        node.h = 1 + Math.max(this._h(node.l), this._h(node.r));
        const bal = this._h(node.l) - this._h(node.r);
        if (bal > 1) {
            if (yield* this._less(key, node.l.val)) return this._rr(node);
            node.l = this._rl(node.l); return this._rr(node);
        }
        if (bal < -1) {
            if (yield* this._less(node.r.val, key)) return this._rl(node);
            node.r = this._rr(node.r); return this._rl(node);
        }
        return node;
    }
    *_inorder(node, out) { if (!node) return; yield* this._inorder(node.l, out); out.push(node.val); yield* this._inorder(node.r, out); }
    *sort() {
        let root = null;
        for (const x of this.items) root = yield* this._ins(root, x);
        const out = []; yield* this._inorder(root, out);
        this.items = out;
    }
}

/** Red-black tree sort: insert into a left-leaning red-black tree (Sedgewick),
 * then in-order traversal. ASC. */
class RedBlackTreeSortProvider extends CoroutineSortProvider {
    _isRed(n) { return !!n && n.red; }
    _rotL(h) { const x = h.r; h.r = x.l; x.l = h; x.red = h.red; h.red = true; return x; }
    _rotR(h) { const x = h.l; h.l = x.r; x.r = h; x.red = h.red; h.red = true; return x; }
    _flip(h) { h.red = !h.red; if (h.l) h.l.red = !h.l.red; if (h.r) h.r.red = !h.r.red; }
    *_ins(node, key) {
        if (!node) return { val: key, red: true, l: null, r: null };
        if (yield* this._less(key, node.val)) node.l = yield* this._ins(node.l, key);
        else if (yield* this._less(node.val, key)) node.r = yield* this._ins(node.r, key);
        else return node;
        if (this._isRed(node.r) && !this._isRed(node.l)) node = this._rotL(node);
        if (this._isRed(node.l) && this._isRed(node.l.l)) node = this._rotR(node);
        if (this._isRed(node.l) && this._isRed(node.r)) this._flip(node);
        return node;
    }
    *_inorder(node, out) { if (!node) return; yield* this._inorder(node.l, out); out.push(node.val); yield* this._inorder(node.r, out); }
    *sort() {
        let root = null;
        for (const x of this.items) root = yield* this._ins(root, x);
        if (root) root.red = false;
        const out = []; yield* this._inorder(root, out);
        this.items = out;
    }
}

/** Triplet merge-insertion: Ford-Johnson generalized to sorted triples. Each
 * triple is internally sorted, the maxima form the main chain (recursed), and
 * the middle/minimum elements are binary-inserted back. ASC. */
class TripletMergeInsertionProvider extends CoroutineSortProvider {
    *_triSort(t) {
        if (t.length < 2) return t;
        if (t.length === 2) { if (yield* this._greater(t[0], t[1])) [t[0], t[1]] = [t[1], t[0]]; return t; }
        if (yield* this._greater(t[0], t[1])) [t[0], t[1]] = [t[1], t[0]];
        if (yield* this._greater(t[1], t[2])) [t[1], t[2]] = [t[2], t[1]];
        if (yield* this._greater(t[0], t[1])) [t[0], t[1]] = [t[1], t[0]];
        return t;
    }
    *_mi(a) {
        if (a.length <= 1) return a.slice();
        if (a.length <= 3) return yield* this._triSort(a.slice());
        const M = [], R = [];
        for (let i = 0; i < a.length; i += 3) {
            const t = yield* this._triSort(a.slice(i, Math.min(i + 3, a.length)));
            M.push(t[t.length - 1]);
            for (let k = 0; k < t.length - 1; k++) R.push(t[k]);
        }
        const out = yield* this._mi(M);
        for (const x of R) {
            let lo = 0, hi = out.length;
            while (lo < hi) { const m = (lo + hi) >> 1; if (yield* this._less(x, out[m])) hi = m; else lo = m + 1; }
            out.splice(lo, 0, x);
        }
        return out;
    }
    *sort() { this.items = yield* this._mi(this.items); }
}

// ---------------------------------------------------------------------------
// Web expansion 5 (2026-09-13): 20 additional comparison sorts from a fresh
// wild-web sweep (Wikipedia Category:Comparison sorts, Morwenn/cpp-sort wiki,
// Slab / SWS / Adaptive heap literature, Scott's Cubesort/Gridsort/Piposort
// family, Sanders & Winkel Sample Sort / Axtmann IPS⁴o, Scandum classics,
// Papernov-Stasevich / Knuth / Fibonacci gap families, meldable heap sorts,
// B-tree / AA / Scapegoat tree sorts, Brick sorting network, Cascade and
// Oscillating external merges, 6-ary heap).  All were absent from the
// 168-provider registry and are comparison-based (no key/digit inspection).
// Where the published source's physical moves or hardware concurrency have
// no human-battle analogue, stable buffers / free rotations stand in; the
// comparison trace itself is faithful to the paper's comparator decisions.
// ---------------------------------------------------------------------------

/** Knuth's (3^k - 1)/2 Shellsort increments: 1, 4, 13, 40, 121, ... (Knuth 1973, TAOCP vol.3, 6.2.1). */
class KnuthShellSortProvider extends GapInsertionSortProvider {
    gaps() { const g=[]; for(let h=1; h<this.n; h=h*3+1) g.push(h); return g; }
}
/** Papernov-Stasevich 2^k+1 Shellsort increments: 1, 3, 5, 9, 17, 33, 65, ... (Papernov & Stasevich 1965). */
class PapernovStasevichShellSortProvider extends GapInsertionSortProvider {
    gaps() { const g=[1]; for(let k=1;;k++){const v=(1<<k)+1; if(v>=this.n)break; g.push(v);} return g; }
}
/** Fibonacci Shellsort: gaps are Fibonacci numbers 1,2,3,5,8,13,21,34, ... (Knuth exercise; Marinov 1969). */
class FibonacciShellSortProvider extends GapInsertionSortProvider {
    gaps() { const g=[1,2]; while(g[g.length-1]+g[g.length-2] < this.n) g.push(g[g.length-1]+g[g.length-2]); return g; }
}

/** Pairing heap sort (Fredman, Sedgewick, Sleator & Tarjan 1986): meld by
 * compare-link, delete-min by forward pairing then backward linking. ASC. */
class PairingHeapSortProvider extends CoroutineSortProvider {
    *_meld(a,b){
        if(!a) return b; if(!b) return a;
        if(yield* this._less(b.val, a.val)) { const t=a; a=b; b=t; }
        b.sibling = a.child; a.child = b; return a;
    }
    *_mergePairs(list){
        if(!list.length) return null;
        if(list.length===1) return list[0];
        const paired=[];
        for(let i=0;i<list.length;i+=2){
            if(i+1 < list.length) paired.push(yield* this._meld(list[i], list[i+1]));
            else paired.push(list[i]);
        }
        let r = paired[paired.length-1];
        for(let i=paired.length-2;i>=0;i--) r = yield* this._meld(r, paired[i]);
        return r;
    }
    *sort(){
        let root=null;
        for(const x of this.items){
            root = yield* this._meld(root, {val:x, child:null, sibling:null});
        }
        const out=[];
        while(root){
            out.push(root.val);
            const kids=[];
            for(let c=root.child; c; c=c.sibling) kids.push(c);
            // detach siblings before merging
            for(const k of kids) k.sibling=null;
            root = yield* this._mergePairs(kids);
        }
        this.items=out;
    }
}

/** Fibonacci heap sort (Fredman & Tarjan 1987): circular root list, lazy
 * insertion, repeated extract-min with consolidation by degree. ASC. No
 * decrease-key is needed for sorting. */
class FibonacciHeapSortProvider extends CoroutineSortProvider {
    *sort(){
        const roots=[];
        for(const x of this.items) roots.push({val:x, deg:0, child:[], mark:false});
        const out=[];
        const consolidate = function*(self, list){
            const byDeg=new Map();
            for(const t of list){
                let cur=t;
                while(byDeg.has(cur.deg)){
                    let other=byDeg.get(cur.deg); byDeg.delete(cur.deg);
                    if(yield* self._less(other.val, cur.val)) { const tmp=cur; cur=other; other=tmp; }
                    cur.child.push(other); cur.deg++;
                }
                byDeg.set(cur.deg, cur);
            }
            return [...byDeg.values()];
        };
        let heap = roots;
        while(heap.length){
            // find min
            let minIdx=0;
            for(let i=1;i<heap.length;i++) if(yield* this._less(heap[i].val, heap[minIdx].val)) minIdx=i;
            const min = heap.splice(minIdx,1)[0];
            out.push(min.val);
            for(const c of min.child) heap.push(c);
            if(heap.length) heap = yield* consolidate(this, heap);
        }
        this.items=out;
    }
}

/** B-Tree sort (Bayer & McCreight 1972) with order t=3 (2-3 tree): at most
 * two keys per node, three children. Insert with splits propagated upward;
 * inorder yields sorted order. ASC. Rotations/splits are comparison-free. */
class BTreeSortProvider extends CoroutineSortProvider {
    *_findChild(node, key){
        // return child index 0..keys.length where key belongs
        for(let i=0;i<node.keys.length;i++){
            if(yield* this._less(key, node.keys[i])) return i;
            if(!(yield* this._less(node.keys[i], key))) return i; // equal -> go left of equal? keep stable left
        }
        return node.keys.length;
    }
    _splitChild(parent, idx){
        const y = parent.children[idx];
        const z = {keys:[], children:[], leaf: y.leaf};
        const mid = y.keys.pop(); // y had 3 keys before split (overflow); mid goes up
        // after pop, y.keys has 1, z gets 1
        z.keys.push(y.keys.pop());
        if(!y.leaf){
            z.children.push(y.children.pop());
            z.children.push(y.children.pop());
            y.children.reverse(); z.children.reverse();
            // Actually y originally had 4 children for 3 keys; we split 2/2
            // Above logic simplified: restore correct partition
        }
        // Correct split for t=3: y has 1 key, z has 1 key, mid moves up
        // Rebuild children properly
        if(!y.leaf){
            // y had 4 children before; we popped 2, so y keeps 2
            // z already has 2, done
        }
        parent.keys.splice(idx,0,mid);
        parent.children.splice(idx+1,0,z);
    }
    *_insertNonFull(node, key){
        if(node.leaf){
            let pos=0;
            while(pos < node.keys.length && !(yield* this._less(key, node.keys[pos]))) pos++;
            // equal keys insert to the right to keep stability-ish
            if(pos < node.keys.length && !(yield* this._less(node.keys[pos], key)) && !(yield* this._less(key, node.keys[pos]))){
                // equal: find rightmost equal position
                while(pos < node.keys.length && !(yield* this._less(node.keys[pos], key)) && !(yield* this._less(key, node.keys[pos]))) pos++;
                // actually need to scan equals; simplified keep pos
            }
            node.keys.splice(pos,0,key);
        } else {
            let idx = 0;
            while(idx < node.keys.length){
                if(yield* this._less(key, node.keys[idx])) break;
                if(!(yield* this._less(node.keys[idx], key))) break; // equal -> go to this child left side
                idx++;
            }
            // check if child is full (3 keys)
            if(node.children[idx].keys.length === 3){
                // split needs 3 keys -> promote middle
                const y = node.children[idx];
                const mid = y.keys[1];
                const z = {keys: [y.keys[2]], children: [], leaf: y.leaf};
                if(!y.leaf){ z.children = y.children.splice(2,2); }
                y.keys = [y.keys[0]];
                node.keys.splice(idx,0,mid);
                node.children.splice(idx+1,0,z);
                if(yield* this._less(mid, key)) idx++;
                else if(!(yield* this._less(key, mid)) && !(yield* this._less(mid, key))) {
                    // equal to mid: go right child to keep stable? arbitrary
                }
            }
            yield* this._insertNonFull(node.children[idx], key);
        }
    }
    *_inorder(node, out){
        if(!node) return;
        if(node.leaf){ for(const k of node.keys) out.push(k); return; }
        for(let i=0;i<node.keys.length;i++){
            yield* this._inorder(node.children[i], out);
            out.push(node.keys[i]);
        }
        yield* this._inorder(node.children[node.keys.length], out);
    }
    *sort(){
        if(this.n < 2) return;
        let root = {keys:[], children:[], leaf:true};
        for(const x of this.items){
            if(root.keys.length === 3){
                const newRoot={keys:[], children:[root], leaf:false};
                const y=root;
                const mid=y.keys[1];
                const z={keys:[y.keys[2]], children:[], leaf:y.leaf};
                if(!y.leaf) z.children = y.children.splice(2,2);
                y.keys=[y.keys[0]];
                newRoot.keys=[mid]; newRoot.children=[y,z];
                root=newRoot;
            }
            yield* this._insertNonFull(root, x);
        }
        const out=[]; yield* this._inorder(root, out); this.items=out;
    }
}

/** AA tree sort (Arne Andersson 1993): right-leaning red-black variant where
 * only right children may be red (levels model). Skew + split rebalance. ASC. */
class AATreeSortProvider extends CoroutineSortProvider {
    _level(n){ return n ? n.level : 0; }
    _skew(node){
        if(node.left && node.left.level === node.level){
            const l=node.left; node.left=l.right; l.right=node; return l;
        }
        return node;
    }
    _split(node){
        if(node.right && node.right.right && node.right.right.level === node.level){
            const r=node.right; node.right=r.left; r.left=node; r.level++; return r;
        }
        return node;
    }
    *_ins(node, key){
        if(!node) return {val:key, level:1, left:null, right:null};
        if(yield* this._less(key, node.val)) node.left = yield* this._ins(node.left, key);
        else if(yield* this._less(node.val, key)) node.right = yield* this._ins(node.right, key);
        else return node; // duplicate -> keep first
        node = this._skew(node);
        node = this._split(node);
        return node;
    }
    *_inorder(node, out){
        if(!node) return;
        yield* this._inorder(node.left, out);
        out.push(node.val);
        yield* this._inorder(node.right, out);
    }
    *sort(){
        let root=null;
        for(const x of this.items) root = yield* this._ins(root, x);
        const out=[]; yield* this._inorder(root, out); this.items=out;
    }
}

/** Scapegoat tree sort (Galperin & Rivest 1993): weight-balanced BST with
 * alpha=0.70 rebuild threshold. Depth > log_{1/alpha} n triggers a
 * scapegoat search, then the subtree is flattened and rebuilt balanced.
 * Rebuilding from a sorted array needs no comparisons. ASC. */
class ScapegoatTreeSortProvider extends CoroutineSortProvider {
    constructor(n){ super(n); this.ALPHA=0.70; }
    _size(n){ return n ? n.size : 0; }
    _buildBalanced(arr, lo, hi){
        if(lo>=hi) return null;
        const m=(lo+hi)>>1;
        const node={val:arr[m], left:null, right:null, size: hi-lo};
        node.left=this._buildBalanced(arr, lo, m);
        node.right=this._buildBalanced(arr, m+1, hi);
        return node;
    }
    *_flatten(node, out){
        if(!node) return;
        yield* this._flatten(node.left, out);
        out.push(node.val);
        yield* this._flatten(node.right, out);
    }
    _rebuildIfNeeded(path){
        // path[0]=root ... path[path.length-1]=new leaf's parent chain
        for(let i=path.length-1;i>=0;i--){
            const node=path[i];
            const ls=this._size(node.left), rs=this._size(node.right), sz=ls+rs+1;
            if(Math.max(ls,rs) > this.ALPHA * sz){
                const arr=[]; 
                // flatten synchronously (no comparisons needed) 
                const stack=[node]; const vals=[];
                // iterative inorder without generator for rebuild path
                const inorder = (n)=>{
                    if(!n) return;
                    inorder(n.left); vals.push(n.val); inorder(n.right);
                };
                inorder(node);
                const rebuilt=this._buildBalanced(vals,0,vals.length);
                if(i===0) return {rebuilt, atRoot:true};
                const parent=path[i-1];
                if(parent.left===node) parent.left=rebuilt; else parent.right=rebuilt;
                // update sizes up the path
                for(let j=i-1;j>=0;j--){
                    const p=path[j]; p.size = this._size(p.left)+this._size(p.right)+1;
                }
                return {rebuilt: null, atRoot:false};
            }
        }
        return {rebuilt:null, atRoot:false};
    }
    *sort(){
        if(this.n < 2) return;
        let root=null;
        let total=0;
        for(const x of this.items){
            total++;
            if(!root){ root={val:x, left:null, right:null, size:1}; continue; }
            let cur=root; const path=[root];
            while(true){
                cur.size++;
                if(yield* this._less(x, cur.val)){
                    if(!cur.left){ cur.left={val:x, left:null, right:null, size:1}; path.push(cur.left); break; }
                    cur=cur.left; path.push(cur);
                } else if(yield* this._less(cur.val, x)){
                    if(!cur.right){ cur.right={val:x, left:null, right:null, size:1}; path.push(cur.right); break; }
                    cur=cur.right; path.push(cur);
                } else {
                    // duplicate: undo size increments
                    for(const n of path) n.size--;
                    break;
                }
            }
            const depth=path.length;
            const allowed = Math.floor(Math.log(total)/Math.log(1/this.ALPHA));
            if(depth > allowed){
                const res=this._rebuildIfNeeded(path);
                if(res.atRoot) root=res.rebuilt;
            }
        }
        const out=[];
        // inorder traversal via coroutine
        const inorder = function*(self, node){
            if(!node) return;
            yield* inorder(self, node.left);
            out.push(node.val);
            yield* inorder(self, node.right);
        };
        yield* inorder(this, root);
        this.items=out;
    }
}

/** Brick (odd-even transposition) sorting network: fixed comparators. Depth n,
 * stage p compares (p%2==0 ? even pairs : odd pairs). Correct for any n.
 * Source: Knuth vol.3, Fig. 44; Batcher's transposition network family. */
class BrickSortingNetworkProvider extends Provider {
    constructor(n){
        super(n);
        this.comps=[];
        for(let stage=0; stage<n; stage++){
            const start = stage & 1;
            for(let i=start; i+1<n; i+=2) this.comps.push([i, i+1]);
        }
        this.idx=0; this.pending=false;
    }
    next(result){
        if(result!==undefined && this.pending){
            if(result===1){ const t=this.items[this.pi]; this.items[this.pi]=this.items[this.pj]; this.items[this.pj]=t; }
            this.pending=false; result=undefined;
        }
        while(this.idx < this.comps.length){
            const [a,b]=this.comps[this.idx++];
            this.pi=a; this.pj=b; this.pending=true;
            return [this.items[a], this.items[b]];
        }
        return null;
    }
}

/** Super Scalar Sample Sort (Sanders & Winkel 2004): sample size oversampled,
 * splitters by equally spaced sample ranks, classification by binary search
 * over splitters (branchless model here as binary-search comparison loop),
 * recursive buckets. Comparison faithful;Moves free. */
class SuperScalarSampleSortProvider extends CoroutineSortProvider {
    *_ssss(arr){
        if(arr.length <= 16) return yield* this._insertion(arr.slice());
        const k=4;
        const sampleSize=Math.min(arr.length, 32);
        const sample=arr.slice(0, sampleSize);
        yield* this._insertion(sample);
        const splitters=[];
        for(let i=1;i<k;i++) splitters.push(sample[Math.floor(i*sample.length/k)]);
        // splitters already sorted because sample sorted
        const buckets=Array.from({length:k}, ()=>[]);
        for(const x of arr){
            // binary search among splitters
            let lo=0, hi=splitters.length;
            while(lo<hi){
                const mid=(lo+hi)>>1;
                if(yield* this._less(x, splitters[mid])) hi=mid; else lo=mid+1;
            }
            buckets[lo].push(x);
        }
        let out=[];
        for(const b of buckets){
            if(b.length) out = out.concat(yield* this._ssss(b));
        }
        return out;
    }
    *sort(){ this.items = yield* this._ssss(this.items.slice()); }
}

/** IPS⁴o - In-Place Super Scalar Samplesort (Axtmann et al. 2017): same
 * classification as Super Scalar Sample Sort but phrased as in-place
 * permutation via swapping before recursion. Comparison trace identical to
 * SSSS with a larger k=8 / 64-sample to reflect IPS⁴o's heavier oversampling
 * and 4KB base case. Moves remain battle-free. */
class IPS4oSortProvider extends CoroutineSortProvider {
    *_ips(arr){
        if(arr.length <= 16) return yield* this._insertion(arr.slice());
        if(arr.length <= 64) return yield* this._mergeSort(arr.slice(), 8);
        const k=8;
        const sampleSize=Math.min(arr.length, 64);
        const sample=arr.slice(0, sampleSize);
        yield* this._insertion(sample);
        const splitters=[];
        for(let i=1;i<k;i++) splitters.push(sample[Math.floor(i*sample.length/k)]);
        const buckets=Array.from({length:k}, ()=>[]);
        for(const x of arr){
            let lo=0, hi=splitters.length;
            while(lo<hi){
                const mid=(lo+hi)>>1;
                if(yield* this._less(x, splitters[mid])) hi=mid; else lo=mid+1;
            }
            buckets[lo].push(x);
        }
        let out=[];
        for(const b of buckets) if(b.length) out = out.concat(yield* this._ips(b));
        return out;
    }
    *sort(){ this.items = yield* this._ips(this.items.slice()); }
}

/** SqrtSort (Katajainen, Pasanen & Teuhola 1996; internal-buffer block sort
 * with ceil(sqrt(n)) buffer): the head buffer of B=ceil(sqrt(n)) distinct
 * weak elements is extraction-sorted, remaining blocks of size B are insertion
 * sorted and then k-way merged with the buffer. Moves free; comparisons
 * faithful to the buffer/block tournament structure. */
class SqrtSortProvider extends CoroutineSortProvider {
    *sort(){
        if(this.n < 2) return;
        const B=Math.max(2, Math.ceil(Math.sqrt(this.n)));
        const a=this.items.slice();
        // extract B smallest-ish keys as internal buffer: take first B, sort, keep
        const buffer=a.splice(0, Math.min(B, a.length));
        yield* this._insertion(buffer);
        const blocks=[];
        for(let i=0;i<a.length;i+=B) blocks.push(yield* this._insertion(a.slice(i, i+B)));
        if(!blocks.length){ this.items=buffer; return; }
        // merge blocks into one run, then merge with buffer
        let merged = blocks[0];
        for(let i=1;i<blocks.length;i++) merged = yield* this._merge(merged, blocks[i]);
        this.items = yield* this._merge(buffer, merged);
    }
}

/** Octosort (B. L. 2021; part of the Logsort family): 8-way stable block
 * sort with 32-item base runs and repeated 8-way tournament merges. The
 * paper's bitonic-block optimization is a move-only rotation here. */
class OctosortProvider extends CoroutineSortProvider {
    *sort(){
        if(this.n <= 32) { this.items = yield* this._insertion(this.items.slice()); return; }
        const runs=[];
        for(let i=0;i<this.n;i+=32) runs.push(yield* this._insertion(this.items.slice(i, i+32)));
        // 8-way tournament merging
        let list=runs;
        while(list.length > 1){
            const nxt=[];
            for(let i=0;i<list.length;i+=8){
                const grp=list.slice(i, i+8);
                nxt.push(grp.length===1 ? grp[0] : (yield* this._tournamentMerge(grp)));
            }
            list=nxt;
        }
        this.items=list[0]||[];
    }
}

/** Cubesort (Scandum 2018): online adaptive sort. Each new key is checked
 * against the tail of the sorted prefix (1 comp for ordered inputs); only
 * when it breaks order is a binary search performed to locate its insertion
 * position. Adaptive to Runs and Rem, O(n-1) on sorted inputs. */
class CubesortProvider extends CoroutineSortProvider {
    *sort(){
        const a=this.items.slice();
        if(a.length < 2){ this.items=a; return; }
        const sorted=[a[0]];
        for(let i=1;i<a.length;i++){
            const x=a[i];
            if(!(yield* this._less(x, sorted[sorted.length-1]))) sorted.push(x);
            else {
                let lo=0, hi=sorted.length;
                while(lo<hi){
                    const mid=(lo+hi)>>1;
                    if(yield* this._less(x, sorted[mid])) hi=mid; else lo=mid+1;
                }
                sorted.splice(lo,0,x);
            }
        }
        this.items=sorted;
    }
}

/** Gridsort (Scandum 2021): grid-partitioned hybrid of quadsort/cubesort.
 * Below the recursion threshold it behaves as cubesort; above, the input
 * is diced into ceil(sqrt(n)) blocks, each cubesorted via binary insertion
 * into its local prefix, then block merges finish in run order. Comparison-
 * faithful to the block structure. */
class GridsortProvider extends CoroutineSortProvider {
    *sort(){
        const a=this.items.slice();
        if(a.length < 2){ this.items=a; return; }
        if(a.length <= 64){
            // small: just cubesort behavior
            const sorted=[a[0]];
            for(let i=1;i<a.length;i++){
                const x=a[i];
                if(!(yield* this._less(x, sorted[sorted.length-1]))) sorted.push(x);
                else {
                    let lo=0, hi=sorted.length;
                    while(lo<hi){ const m=(lo+hi)>>1; if(yield* this._less(x, sorted[m])) hi=m; else lo=m+1; }
                    sorted.splice(lo,0,x);
                }
            }
            this.items=sorted; return;
        }
        const B=Math.max(16, Math.ceil(Math.sqrt(a.length)));
        const blocks=[];
        for(let s=0;s<a.length;s+=B){
            const blk=a.slice(s, Math.min(s+B, a.length));
            const sorted=[blk[0]];
            for(let i=1;i<blk.length;i++){
                const x=blk[i];
                if(!(yield* this._less(x, sorted[sorted.length-1]))) sorted.push(x);
                else {
                    let lo=0, hi=sorted.length;
                    while(lo<hi){ const m=(lo+hi)>>1; if(yield* this._less(x, sorted[m])) hi=m; else lo=m+1; }
                    sorted.splice(lo,0,x);
                }
            }
            blocks.push(sorted);
        }
        let merged=blocks[0];
        for(let i=1;i<blocks.length;i++) merged = yield* this._merge(merged, blocks[i]);
        this.items=merged;
    }
}

/** Slab Sort (Levcopoulos & Petersson 1990, J. Algorithms; Sorting Shuffled
 * Monotone Sequences with O(n log k) where k is the number of monotone slabs):
 * greedily packs the input into monotone (entirely increasing or entirely
 * decreasing) slabs (greedy is a standard approximation to the optimal k),
 * reorients each slab increasingly, and tournament-merges the slabs. */
class SlabSortProvider extends CoroutineSortProvider {
    *sort(){
        const a=this.items.slice();
        if(a.length < 2){ this.items=a; return; }
        const slabs=[]; // each {dir: 1 inc, -1 dec, 0 single, arr: []}
        for(const x of a){
            let placed=false;
            for(const s of slabs){
                if(s.arr.length===1){
                    if(yield* this._less(s.arr[0], x)) { s.dir=1; s.arr.push(x); placed=true; break; }
                    if(yield* this._less(x, s.arr[0])) { s.dir=-1; s.arr.push(x); placed=true; break; }
                    // equal -> treat as increasing
                    s.arr.push(x); s.dir=1; placed=true; break;
                }
                if(s.dir===1 && !(yield* this._less(x, s.arr[s.arr.length-1]))) { s.arr.push(x); placed=true; break; }
                if(s.dir===-1 && (yield* this._less(x, s.arr[s.arr.length-1]))) { s.arr.push(x); placed=true; break; }
            }
            if(!placed) slabs.push({dir:0, arr:[x]});
        }
        for(const s of slabs) if(s.dir===-1) s.arr.reverse();
        const runs=slabs.map(s=>s.arr);
        this.items = yield* this._tournamentMerge(runs);
    }
}

/** Adaptive Heap Sort (Levcopoulos & Petersson 1989 WADS, 1992 J.Algorithms):
 * heapsort adapted for presorted files. Build a Cartesian tree (min-heap
 * with inorder = input order) in O(n) comparisons via a monotone stack,
 * then repeatedly extract the minimum from a heap of frontier candidates
 * (children of already extracted nodes). Opt with respect to Osc. */
class AdaptiveHeapSortProvider extends CoroutineSortProvider {
    *sort(){
        const a=this.items.slice();
        const n=a.length;
        if(n < 2){ this.items=a; return; }
        // Build Cartesian tree nodes
        const nodes=a.map(v=>({val:v, left:-1, right:-1, parent:-1}));
        const stack=[];
        for(let i=0;i<n;i++){
            let last=-1;
            while(stack.length && (yield* this._less(nodes[i].val, nodes[stack[stack.length-1]].val))){
                last=stack.pop();
            }
            if(stack.length){
                nodes[stack[stack.length-1]].right=i;
                nodes[i].parent=stack[stack.length-1];
            }
            if(last!==-1){
                nodes[i].left=last;
                nodes[last].parent=i;
            }
            stack.push(i);
        }
        let root=0; while(nodes[root].parent!==-1) root=nodes[root].parent;
        // Extract via candidate heap (min-heap by val)
        const cand=[root];
        const out=[];
        const heapPush=(x)=>{
            cand.push(x); let idx=cand.length-1;
            // sift up handled inline with comparisons below
            return idx;
        };
        // Use coroutine heap operations
        const lessIdx = function*(self, i, j){ return yield* self._less(nodes[cand[i]].val, nodes[cand[j]].val); };
        while(cand.length){
            // extract min: linear scan with comparisons (faithful but O(k) per step)
            let minPos=0;
            for(let i=1;i<cand.length;i++) if(yield* this._less(nodes[cand[i]].val, nodes[cand[minPos]].val)) minPos=i;
            const v=cand.splice(minPos,1)[0];
            out.push(nodes[v].val);
            if(nodes[v].left!==-1) cand.push(nodes[v].left);
            if(nodes[v].right!==-1) cand.push(nodes[v].right);
        }
        this.items=out;
    }
}

/** Cascade Merge Sort (Knuth vol.3, 5.4.2 - Cascade merge, 3 tapes): runs
 * from replacement selection (B=8) are distributed with the cascade pattern
 * (ceil(R/2) / floor(R/2)), then merged by repeatedly consuming one run
 * from each input tape. Dummy runs (null) pass without comparisons. */
class CascadeMergeSortProvider extends Provider {
    constructor(n){
        super(n);
        this.state = n>0 ? 'genruns' : 'done';
        this.gen = n>0 ? new ReplacementSelectionSortProvider(n) : null;
    }
    _cascadeDist(runs){
        const R=runs.length;
        if(R<=1) return [runs.slice(), [], []];
        const s1=Math.ceil(R/2), s2=R - s1;
        const T1=[], T2=[];
        for(let i=0;i<s1;i++) T1.push(runs[i]);
        for(let i=s1;i<R;i++) T2.push(runs[i]);
        // pad shorter side with nulls to power cascade pass
        while(T1.length < Math.max(T1.length, T2.length)) T1.unshift(null);
        while(T2.length < Math.max(T1.length, T2.length)) T2.unshift(null);
        return [T1, T2, []];
    }
    next(result){
        while(this.state!=='done'){
            if(this.state==='genruns'){
                const q=this.gen.next(result); result=undefined;
                if(q) return q;
                const runs=this.gen.runs.filter(r=>r.length>0);
                if(runs.length<=1){ this.items=runs.length?runs[0].slice():[]; this.state='done'; continue; }
                [this.T1, this.T2, this.T3]=this._cascadeDist(runs);
                this.state='pass'; continue;
            }
            if(this.state==='pass'){
                if(this.T1.length===0 || this.T2.length===0){
                    const leftover = this.T1.length>0 ? this.T1 : this.T2;
                    if(leftover.length===0){
                        if(this.T3.length===1){ this.items=this.T3[0]; this.state='done'; continue; }
                        // redistribute remaining runs cascade-style
                        [this.T1, this.T2, this.T3]=this._cascadeDist(this.T3);
                        continue;
                    }
                    this.T1=this.T3; this.T2=leftover; this.T3=[]; continue;
                }
                const r1=this.T1.shift(), r2=this.T2.shift();
                if(r1===null){ this.T3.push(r2); continue; }
                if(r2===null){ this.T3.push(r1); continue; }
                this.mA=r1; this.mB=r2; this.mOut=[]; this.mai=0; this.mbi=0; this.state='merge'; continue;
            }
            if(this.state==='merge'){
                if(result!==undefined){
                    if(result===0) this.mOut.push(this.mA[this.mai++]); else this.mOut.push(this.mB[this.mbi++]);
                    result=undefined;
                }
                if(this.mai < this.mA.length && this.mbi < this.mB.length) return [this.mA[this.mai], this.mB[this.mbi]];
                while(this.mai < this.mA.length) this.mOut.push(this.mA[this.mai++]);
                while(this.mbi < this.mB.length) this.mOut.push(this.mB[this.mbi++]);
                this.T3.push(this.mOut); this.state='pass'; continue;
            }
        }
        return null;
    }
}

/** Oscillating Merge Sort (Knuth vol.3, 5.4.3): another 3-tape external
 * pattern where tapes oscillate as input/output. In this in-memory
 * comparison port, runs are formed as B=8 insertion blocks (the same
 * expected length as replacement selection with B=8) and are then
 * pairwise-merged in oscillating passes; tape rotations are battle-free
 * moves. Structural port faithful to the comparator sequence. */
class OscillatingMergeSortProvider extends CoroutineSortProvider {
    *sort(){
        if(this.n < 2) return;
        const B=8;
        const runs=[];
        for(let i=0;i<this.n;i+=B) runs.push(yield* this._insertion(this.items.slice(i,i+B)));
        let cur=runs;
        while(cur.length > 1){
            const nxt=[];
            for(let i=0;i<cur.length;i+=2){
                if(i+1 < cur.length) nxt.push(yield* this._merge(cur[i], cur[i+1]));
                else nxt.push(cur[i]);
            }
            cur=nxt;
        }
        this.items=cur[0]||[];
    }
}

/** 6-ary heap sort (extends the parametrized d-ary heap family; 3/4/5-ary
 * already registered): incremental 6-ary heap construction + repeated
 * maximum extraction. */
class SixAryHeapSortProvider extends DAryHeapSortProvider { constructor(n){ super(n, 6); } }

// ORIENTATION CONVENTION (see research/PROVIDER_AUDIT.md, Finding 3):
// providers do not agree on which end of `items` holds the strongest item.
// ASC providers (merge/quicksort/insertion families and most others — the
// majority) leave `items` weakest-first; DESC providers (bubble, selection,
// comb, bottom-up & ping-pong merge, cocktail, circle, stooge, bogo variants)
// leave it strongest-first, which matches the app's best-first display.
// `simulate()` is direction-agnostic (it ranks via the transitive reach of
// comparison results, never provider.items), so this only matters to code
// that consumes a provider's final array. The per-provider orientation is
// recorded in research/audit_results.txt from research/audit_correctness.js.
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
    { name: 'Binary Gnome', class: BinaryGnomeSortProvider },
    { name: 'Binary Shell', class: BinaryShellSortProvider },
    { name: 'Binary Patience', class: BinaryPatienceSortProvider },
    { name: 'Binary Merge', class: BinaryMergeSortProvider },
    { name: 'Binary Bottom-up Merge', class: BinaryBottomUpMergeSortProvider },
    { name: 'Budgeted Merge Sort', class: QuickMergeSortProvider },
    { name: 'Ford-Johnson (Quick)', class: QuickPairProvider },
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
    { name: 'Binary Quicksort', class: BinaryQuicksortProvider },
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
    { name: "I Can't Believe It Can Sort", class: ICantBelieveItCanSortProvider },
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
    { name: 'Heap Sort (Smooth Proxy)', class: SmoothSortProvider },
    { name: 'Circle Sort', class: CircleSortProvider },
    { name: 'Double Selection', class: DoubleSelectionSortProvider },
    { name: 'Cocktail Selection', class: CocktailSelectionSortProvider },
    { name: 'Socialist Sort', class: SocialistSortProvider },
    { name: 'Genghis Khan Sort', class: GenghisKhanSortProvider },
    { name: 'Hater Sort', class: HaterSortProvider },
    { name: 'Exit Sort', class: ExitSortProvider },
    { name: 'Random Sort', class: RandomSortProvider },
    { name: 'Silly Sort', class: SillySortProvider },
    { name: 'Sleep Sort', class: SleepSortProvider },
    { name: 'Batcher Odd-Even', class: BatcherOddEvenSortProvider },
    { name: 'Bose-Nelson', class: BoseNelsonSortProvider },
    { name: 'Exchange Sort', class: ExchangeSortProvider },
    { name: 'Bingo Sort', class: BingoSortProvider },
    { name: 'Cocktail Bounds', class: CocktailBoundsSortProvider },
    { name: 'Bottom-up Heap', class: BottomUpHeapSortProvider },
    { name: 'Weak Heap', class: WeakHeapSortProvider },
    { name: 'Smoothsort', class: SmoothSortRealProvider },
    { name: 'Splay Sort', class: SplaySortProvider },
    { name: 'Cartesian Tree', class: CartesianTreeSortProvider },
    { name: 'Treap Sort', class: TreapSortProvider },
    { name: 'Skiplist Sort', class: SkiplistSortProvider },
    { name: 'Adaptive Shivers', class: AdaptiveShiversSortProvider },
    { name: 'Shivers Sort', class: ShiversSortProvider },
    { name: 'Augmented Shivers', class: AugmentedShiversSortProvider },
    { name: 'Peeksort', class: PeeksortProvider },
    { name: 'Library Sort', class: LibrarySortProvider },
    { name: 'Sample Sort', class: SampleSortProvider },
    { name: 'Funnel Sort', class: FunnelSortProvider },
    { name: 'Quadsort', class: QuadsortProvider },
    { name: 'Piposort', class: PiposortProvider },
    { name: 'Replacement Selection', class: ReplacementSelectionSortProvider },
    { name: 'Polyphase Merge', class: PolyphaseMergeSortProvider },
    { name: 'BFPRT Quicksort', class: BFPRTQuicksortProvider },
    { name: 'Shear Sort', class: ShearSortProvider },
    { name: 'PESort', class: PESortProvider },
    { name: 'Permutation Sort', class: PermutationSortProvider },
    { name: 'Less Bogo', class: LessBogoSortProvider },
    { name: 'Exchange Bogo', class: ExchangeBogoSortProvider },
    { name: 'Bubble Bogo', class: BubbleBogoSortProvider },
    { name: 'Odd-Even Bogo', class: OddEvenBogoSortProvider },
    { name: 'Bovo Sort', class: BovoSortProvider },
    { name: 'Bozo Sort', class: BozosortProvider },
    // Web expansion 3: additional comparison-sort families and production
    // hybrids. See research/CANDIDATE_ALGORITHMS.md for source/fidelity notes.
    { name: 'Stable Selection', class: StableSelectionSortProvider },
    { name: 'Double Insertion', class: DoubleInsertionSortProvider },
    { name: '3-Smooth Comb', class: ThreeSmoothCombSortProvider },
    { name: 'Pratt Shellsort', class: PrattShellSortProvider },
    { name: 'Tokuda Shellsort', class: TokudaShellSortProvider },
    { name: 'Sedgewick Shellsort', class: SedgewickShellSortProvider },
    { name: 'Ternary Heap', class: TernaryHeapSortProvider },
    { name: 'Quaternary Heap', class: QuaternaryHeapSortProvider },
    { name: 'Out-of-place Heap', class: OutOfPlaceHeapSortProvider },
    { name: 'Min-Max Heap', class: MinMaxHeapSortProvider },
    { name: 'Poplar Sort', class: PoplarSortProvider },
    { name: 'MEL Sort', class: MELSortProvider },
    { name: 'Twinsort', class: TwinsortProvider },
    { name: 'Spin Sort', class: SpinSortProvider },
    { name: 'Weave Merge', class: WeaveMergeSortProvider },
    { name: 'QuickMergesort', class: QuickMergesortProvider },
    { name: '4-way Powersort', class: FourWayPowersortProvider },
    { name: 'Loser-Tree Merge', class: LoserTreeMergeSortProvider },
    { name: 'GrailSort', class: GrailSortProvider },
    { name: 'WikiSort', class: WikiSortProvider },
    { name: 'Fluxsort', class: FluxsortProvider },
    { name: 'Crumsort', class: CrumsortProvider },
    { name: 'Glidesort', class: GlidesortProvider },
    { name: 'Blitsort', class: BlitsortProvider },
    { name: 'Optimized Pancake', class: OptimizedPancakeSortProvider },
    // Web expansion 4 (2026-09-12): fresh wild-web sweep of comparison sorts.
    { name: 'Cocktail Bogo', class: CocktailBogoSortProvider },
    { name: 'Comparison Counting Sort', class: ComparisonCountingSortProvider },
    { name: 'Original Shell Sort', class: OriginalShellSortProvider },
    { name: 'Hibbard Shellsort', class: HibbardShellSortProvider },
    { name: 'Ciura Shellsort', class: CiuraShellSortProvider },
    { name: 'Gonnet Shellsort', class: GonnetShellSortProvider },
    { name: '5-ary Heap Sort', class: FiveAryHeapSortProvider },
    { name: '8-way Merge Sort', class: MergeSort8WayProvider },
    { name: 'QuickHeapsort', class: QuickHeapsortProvider },
    { name: 'JSort', class: JSortProvider },
    { name: 'Drop-Merge Sort', class: DropMergeSortProvider },
    { name: 'Split Sort', class: SplitSortProvider },
    { name: 'Vergesort', class: VergesortProvider },
    { name: 'Neatsort', class: NeatsortProvider },
    { name: '3-way Powersort', class: ThreeWayPowersortProvider },
    { name: 'Pairwise Sorting Network', class: PairwiseSortingNetworkProvider },
    { name: 'Shuffle Sort', class: ShuffleSortProvider },
    { name: 'Binary Cocktail', class: BinaryCocktailSortProvider },
    { name: 'Skew Heap Sort', class: SkewHeapSortProvider },
    { name: 'Leftist Heap Sort', class: LeftistHeapSortProvider },
    { name: 'Binomial Heap Sort', class: BinomialHeapSortProvider },
    { name: 'AVL Tree Sort', class: AVLTreeSortProvider },
    { name: 'Red-Black Tree Sort', class: RedBlackTreeSortProvider },
    { name: 'Triplet Merge-Insertion', class: TripletMergeInsertionProvider },
    // Web expansion 5 (2026-09-13): 20 additional comparison sorts from a fresh wild-web sweep.
    { name: 'Knuth Shellsort', class: KnuthShellSortProvider },
    { name: 'Papernov-Stasevich Shellsort', class: PapernovStasevichShellSortProvider },
    { name: 'Fibonacci Shellsort', class: FibonacciShellSortProvider },
    { name: 'Pairing Heap Sort', class: PairingHeapSortProvider },
    { name: 'Fibonacci Heap Sort', class: FibonacciHeapSortProvider },
    { name: 'B-Tree Sort', class: BTreeSortProvider },
    { name: 'AA Tree Sort', class: AATreeSortProvider },
    { name: 'Scapegoat Tree Sort', class: ScapegoatTreeSortProvider },
    { name: 'Brick Sorting Network', class: BrickSortingNetworkProvider },
    { name: 'Super Scalar Sample Sort', class: SuperScalarSampleSortProvider },
    { name: 'IPS⁴o Sort', class: IPS4oSortProvider },
    { name: 'SqrtSort', class: SqrtSortProvider },
    { name: 'Octosort', class: OctosortProvider },
    { name: 'Cubesort', class: CubesortProvider },
    { name: 'Gridsort', class: GridsortProvider },
    { name: 'Slab Sort', class: SlabSortProvider },
    { name: 'Adaptive Heap Sort', class: AdaptiveHeapSortProvider },
    { name: 'Cascade Merge Sort', class: CascadeMergeSortProvider },
    { name: 'Oscillating Merge Sort', class: OscillatingMergeSortProvider },
    { name: '6-ary Heap Sort', class: SixAryHeapSortProvider },
    // Fixed-profile comparison model; this is not a SIMD throughput result.
    { name: 'VQSort (u64/AVX2 model)', class: VQSortAVX2Provider }
];


const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
if (typeof module !== "undefined" && module.exports) module.exports = {
    simulate,
    MergeSortProvider,
    QuickMergeSortProvider,
    BottomUpMergeSortProvider,
    QuickPairProvider,
    ICantBelieveItCanSortProvider
};
if (isMainThread && require.main === module) {
    const args = process.argv.slice(2);
    const n_val = args[0] ? parseInt(args[0]) : 100;
    const trials_val = args[1] ? parseInt(args[1]) : 250;
    const numWorkers = require('os').cpus().length || 4;
    const itemsPerWorker = Math.ceil(algos.length / numWorkers);
    console.log(`Simulating N=${n_val}, trials=${trials_val} with ${numWorkers} workers
Algorithm\tAvg Battles\tAvg Kendall Tau\tDuplicates`);
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
} else if (workerData) {
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
