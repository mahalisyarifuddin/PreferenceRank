
const getKey = ([a,b])=>a < b ? `${a}-${b}` : `${b}-${a}`;

class FullPairProvider {
    constructor(count) {
        this.pairs = [];
        for (let i = 0; i < count - 1; i++)
            for (let j = i + 1; j < count; j++)
                this.pairs.push([i, j]);
        for (let i = this.pairs.length; i--; ) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.pairs[i],this.pairs[j]] = [this.pairs[j], this.pairs[i]];
        }
    }
    next(state) {
        return this.pairs[state.step]
    }
    getProgress(state) {
        return `${state}/${this.pairs.length}`
    }
}

class QuickPairProvider {
    constructor(count) {
        this.count = count;
        this.compared = new Set;
        this.stack = [{
            state: 'init',
            items: [...Array(count).keys()]
        }];
        this.history = [];
        this.pending = this.final = null;
        this.refine = {
            pass: 0,
            index: 0,
            swapped: false
        };
        this.jacobsthal = [0, 1];
        while (this.jacobsthal.at(-1) < count)
            this.jacobsthal.push(this.jacobsthal.at(-1) + 2 * this.jacobsthal.at(-2));
    }
    snap() {
        return structuredClone({
            stack: this.stack,
            pending: this.pending,
            final: this.final,
            refine: this.refine
        })
    }
    restore(snapshot) {
        Object.assign(this, structuredClone(snapshot))
    }
    unmark(pair) {
        this.pending && this.history.length && this.history.pop();
        this.history.length && this.restore(this.history.at(-1));
        this.compared.delete(getKey(pair))
    }
    mark(pair) {
        this.compared.add(getKey(pair))
    }
    next(state, result) {
        this.pending && this.handlePending(state, result);
        while (this.stack.length) {
            const output = this[this.stack.at(-1).state](this.stack.at(-1));
            if (output)
                return output;
        }
        return this.final ? this.handleRefine() : null;
    }
    handlePending(state, result) {
        const [a,b] = this.pending;
        const winner = result === 0.5 ? (state.swapped ? b : a) : result === 1 ? a : b;
        this.stack.at(-1) && (this.stack.at(-1).lastWinner = winner);
        this.final && this.handleRefineSwap(a, b, winner);
        this.pending = null;
    }
    handleRefineSwap(a, b, winner) {
        winner === b && ([this.final[this.refine.index],this.final[this.refine.index + 1]] = [b, a],
        this.refine.swapped = true);
        this.refine.index++;
    }
    init(frame) {
        return frame.items.length < 2 ? this.return(frame.items) : (frame.pairs = Array.from({
            length: frame.items.length >> 1
        }, (_,i)=>[frame.items[2 * i], frame.items[2 * i + 1]]),
        frame.odd = frame.items.length % 2 ? frame.items.at(-1) : null,
        Object.assign(frame, {
            winners: [],
            losers: [],
            pairIndex: 0,
            state: 'compare'
        }),
        null);
    }
    compare(frame) {
        return frame.pairIndex >= frame.pairs.length ? (frame.state = 'recurse',
        this.stack.push({
            state: 'init',
            items: [...frame.winners]
        }),
        null) : frame.lastWinner !== undefined ? (frame.winners.push(frame.lastWinner),
        frame.losers.push(frame.pairs[frame.pairIndex][frame.lastWinner === frame.pairs[frame.pairIndex][0] ? 1 : 0]),
        delete frame.lastWinner,
        frame.pairIndex++,
        null) : (this.pending = frame.pairs[frame.pairIndex],
        this.history.push(this.snap()),
        this.pending);
    }
    recurse(frame) {
        return frame.subresult ? (frame.main = frame.subresult,
        delete frame.subresult,
        frame.map = {},
        frame.winners.forEach((w,i)=>frame.map[w] = frame.losers[i]),
        frame.main.unshift(frame.map[frame.main[0]]),
        frame.insertions = [],
        frame.main.slice(1).forEach((w,i)=>i > 0 && frame.insertions.push({
            item: frame.map[w],
            bound: w
        })),
        frame.odd !== null && frame.insertions.push({
            item: frame.odd,
            bound: null
        }),
        frame.jacobIndex = 2,
        frame.group = [],
        frame.state = 'group',
        null) : null;
    }
    group(frame) {
        !frame.group.length && (this.jacobsthal[frame.jacobIndex - 1] - 1 >= frame.insertions.length ? this.return(frame.main) : (((start,end)=>{
            frame.group.push(...frame.insertions.slice(start, end + 1).reverse())
        }
        )(this.jacobsthal[frame.jacobIndex - 1] - 1, Math.min(this.jacobsthal[frame.jacobIndex] - 2, frame.insertions.length - 1)),
        frame.jacobIndex++));
        return frame.main === this.final ? null : (frame.group.length && (frame.current = frame.group.shift(),
        frame.state = 'insert',
        frame.binarySearch = {
            min: 0,
            max: frame.current.bound !== null ? frame.main.indexOf(frame.current.bound) : frame.main.length,
            target: frame.current.item
        }),
        null);
    }
    insert(frame) {
        const {min, max, target} = frame.binarySearch;
        return min >= max ? (frame.main.splice(min, 0, target),
        frame.state = 'group',
        null) : frame.lastWinner !== undefined ? (frame.lastWinner === target ? frame.binarySearch.min = frame.binarySearch.mid + 1 : frame.binarySearch.max = frame.binarySearch.mid,
        delete frame.lastWinner,
        null) : (frame.binarySearch.mid = (min + max) >> 1,
        this.pending = [target, frame.main[frame.binarySearch.mid]],
        this.history.push(this.snap()),
        this.pending);
    }
    handleRefine() {
        return null;
    }
    return(result) {
        this.stack.pop();
        this.stack.length ? this.stack.at(-1).subresult = result : this.final = result.reverse()
    }
    getProgress(state) {
        return `${state}/~${Math.max(state, Math.round(this.count * Math.log2(this.count) - 1.44 * this.count + 3.3))}`
    }
}

class Simulator {
    constructor(itemCount, allowTies, tieThreshold = 40, regularization = 1.0) {
        this.itemCount = itemCount;
        this.items = Array.from({length: itemCount}, (_, i) => i);
        this.trueScores = this.items.map(i => i * 10);
        this.matches = [];
        this.allowTies = allowTies;
        this.tieThreshold = tieThreshold;
        this.provider = new QuickPairProvider(itemCount);
        this.scores = new Float64Array(itemCount).fill(1000);
        this.regularization = regularization;
        this.step = 0;
    }

    run() {
        let pair = this.provider.next(this);
        while (pair) {
            const [a, b] = pair;
            const scoreA = this.trueScores[a];
            const scoreB = this.trueScores[b];
            const probA = 1 / (1 + Math.pow(10, (scoreB - scoreA) / 400));

            let result;
            if (this.allowTies && Math.abs(scoreA - scoreB) < this.tieThreshold) {
                 result = 0.5;
            } else {
                 const rand = Math.random();
                 result = rand < probA ? 1 : 0;
            }
            this.matches.push({a, b, result});
            pair = this.provider.next(this, result);
            this.step++;
        }
        this.recalculateScores();
    }

    recalculateScores() {
        const N = this.items.length;
        const p = new Float64Array(N).fill(1.0);
        const wins = new Float64Array(N);
        const neighbors = Array.from({length: N}, ()=>[]);
        this.matches.forEach(({a, b, result})=>{
            wins[a] += result;
            wins[b] += 1 - result;
            neighbors[a].push(b);
            neighbors[b].push(a)
        });

        const reg = this.regularization;
        for (let iter = 0; iter < 100; iter++) {
            let maxDiff = 0;
            const nextP = p.map((pi, i) => {
                const denom = neighbors[i].reduce((sum, j) => sum + 1 / (pi + p[j]), 0) + reg / (pi + 1);
                const newVal = denom > 0 ? (wins[i] + 0.5 * reg) / denom : pi;
                maxDiff = Math.max(maxDiff, Math.abs(pi - newVal));
                return newVal;
            });
            p.set(nextP);
            if (maxDiff < 1e-9) break
        }
        const raw = p.map(v => 1000 + 400 * Math.log10(v));
        const avg = raw.reduce((a, b) => a + b, 0) / N;
        this.scores = raw.map(v => v + 1000 - avg)
    }
}

async function main() {
    console.log("Running Simulations with 100 items...");

    // Test with Higher Regularization
    const reg = 2.0;
    console.log(`\n--- Simulation: Ties Disabled, Reg=${reg} ---`);
    const simNoTies = new Simulator(100, false, 0, reg);
    simNoTies.run();
    analyzeResults(simNoTies);

    console.log(`\n--- Simulation: Ties Enabled (40), Reg=${reg} ---`);
    const simTies = new Simulator(100, true, 40, reg);
    simTies.run();
    analyzeResults(simTies);

    // Check FullPairProvider behavior with Reg=2.0
    console.log(`\n--- Simulation: FullPairProvider (Reg=${reg}, No Ties) ---`);
    const simFull = new Simulator(100, false, 0, reg);
    simFull.provider = new FullPairProvider(100);
    simFull.run();
    analyzeResults(simFull);
}

function analyzeResults(sim) {
    console.log(`Total comparisons: ${sim.matches.length}`);

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
    const n = sim.itemCount;

    for(let i=0; i<n; i++) {
        const x = sim.trueScores[i];
        const y = sim.scores[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
        sumYY += y * y;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const rNum = (n * sumXY - sumX * sumY);
    const rDen = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const r = rNum / rDen;

    console.log(`Slope: ${slope.toFixed(4)}`);
    console.log(`Correlation (R): ${r.toFixed(4)}`);
}

main();
