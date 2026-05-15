
const fs = require('fs');

class QuickPairProvider {
    static estimate(n) {
        return n <= 1 ? 0 : Math.ceil(n * Math.log2(n) - 1.411 * n + 2.9);
    }
    constructor(count) {
        this.count = count;
        this.reset();
    }
    reset() {
        this.stack = [{ items: Array.from({ length: this.count }, (_, i) => i), state: 0 }];
    }
    next(_, result) {
        while (this.stack.length > 0) {
            const frame = this.stack[this.stack.length - 1];
            if (frame.state === 0) {
                if (frame.items.length <= 1) {
                    this.pop(frame.items); continue;
                }
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

function measure(n) {
    const trials = 1000;
    let totalComp = 0;
    for (let t = 0; t < trials; t++) {
        const order = Array.from({ length: n }, () => Math.random());
        const provider = new QuickPairProvider(n);
        let pair = provider.next(null);
        let comps = 0;
        while (pair) {
            comps++;
            const [a, b] = pair;
            const res = order[a] < order[b] ? 1 : 0;
            pair = provider.next(null, res);
        }
        totalComp += comps;
    }
    return totalComp / trials;
}

const ns = [2, 5, 10, 20, 50, 100, 200, 500, 1000];
console.log("n,actual,estimate");
for (let n of ns) {
    const act = measure(n);
    const est = QuickPairProvider.estimate(n);
    console.log(`${n},${act.toFixed(3)},${est}`);
}
