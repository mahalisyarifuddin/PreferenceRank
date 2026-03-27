
const fs = require('fs');

class QuickPairProvider {
    static estimate(n) {
        return n <= 1 ? 0 : Math.ceil(n * Math.log2(n) - 1.3408 * n - 0.8812);
    }
    constructor(count) {
        this.count = count;
        this.state = 0;
        this.stack = [{ items: Array.from({ length: count }, (_, i) => i) }];
    }
    next(_, result) {
        while (this.stack.length > 0) {
            const frame = this.stack[this.stack.length - 1];
            if (this.state === 0) {
                if (!frame.winners) {
                    frame.winners = []; frame.losers = []; frame.pairIdx = 0;
                }
                if (result !== undefined && frame.pairIdx > 0) {
                    const i = 2 * (frame.pairIdx - 1);
                    result === 1 ? (frame.winners.push(frame.items[i]), frame.losers.push(frame.items[i+1])) : (frame.winners.push(frame.items[i+1]), frame.losers.push(frame.items[i]));
                    result = undefined;
                }
                if (frame.pairIdx < (frame.items.length >> 1)) {
                    const a = frame.items[2 * frame.pairIdx], b = frame.items[2 * frame.pairIdx + 1];
                    frame.pairIdx++; return [a, b];
                }
                if (frame.winners.length <= 1) {
                    frame.sorted = [...frame.winners];
                    this.state = 1;
                    continue;
                }
                this.stack.push({ items: frame.winners });
                this.state = 0;
                continue;
            }
            if (this.state === 1) {
                const child = this.stack.pop();
                if (this.stack.length === 0) return null;
                const parent = this.stack[this.stack.length - 1];
                parent.sorted = child.sorted;
                parent.loserOf = new Map(parent.winners.map((w, i) => [w, parent.losers[i]]));
                parent.chain = [parent.loserOf.get(parent.sorted[0]), ...parent.sorted];
                parent.posMap = new Map(parent.chain.map((it, idx) => [it, idx]));
                parent.m = parent.sorted.length;
                parent.jPrev = 1; parent.jA = 1; parent.jB = 3;
                this.state = 2;
                continue;
            }
            if (this.state === 2) {
                if (result !== undefined) {
                    result === 1 ? frame.lo = frame.mid + 1 : frame.hi = frame.mid;
                    result = undefined;
                }
                if (frame.lo < frame.hi) {
                    frame.mid = (frame.lo + frame.hi) >> 1;
                    return [frame.bk, frame.chain[frame.mid]];
                }
                if (frame.bk !== undefined) {
                    frame.chain.splice(frame.lo, 0, frame.bk);
                    for (let i = frame.lo; i < frame.chain.length; i++) frame.posMap.set(frame.chain[i], i);
                    frame.bk = undefined;
                }
                if (frame.jPrev < frame.m) {
                    if (frame.k === undefined) frame.k = Math.min(frame.jB, frame.m);
                    if (frame.k > frame.jPrev) {
                        frame.bk = frame.loserOf.get(frame.sorted[frame.k - 1]);
                        frame.lo = 0; frame.hi = frame.posMap.get(frame.sorted[frame.k - 1]);
                        frame.k--; continue;
                    }
                    frame.jPrev = Math.min(frame.jB, frame.m);
                    const nextJB = frame.jB + 2 * frame.jA;
                    frame.jA = frame.jB; frame.jB = nextJB;
                    frame.k = undefined;
                    continue;
                }
                if (frame.items.length & 1 && !frame.oddDone) {
                    frame.bk = frame.items[frame.items.length - 1];
                    frame.lo = 0; frame.hi = frame.chain.length;
                    frame.oddDone = true;
                    continue;
                }
                frame.sorted = frame.chain;
                this.state = 1;
                continue;
            }
        }
        return null;
    }
}

function measure(n) {
    const items = Array.from({ length: n }, (_, i) => i);
    const trials = 1000;
    let totalComp = 0;
    for (let t = 0; t < trials; t++) {
        const order = Array.from({ length: n }, (_, i) => i);
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }

        const provider = new QuickPairProvider(n);
        let pair = provider.next();
        let comps = 0;
        while (pair) {
            comps++;
            const [a, b] = pair;
            const res = order[a] < order[b] ? 1 : 0;
            pair = provider.next(undefined, res);
        }
        totalComp += comps;
    }
    return totalComp / trials;
}

const ns = [2, 5, 10, 20, 50, 100, 200, 500, 1000];
console.log("n,actual");
for (let n of ns) {
    console.log(`${n},${measure(n)}`);
}
