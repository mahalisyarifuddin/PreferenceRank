
const getKey = ([a,b])=>a < b ? `${a}-${b}` : `${b}-${a}`;

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
        return `${state}/~${Math.round(0.78 * this.count * Math.log2(this.count))}`
    }
}

// Simulation Logic
function simulate(N, allowTies, iterations = 1000) {
    let totalComparisons = 0;

    for (let i = 0; i < iterations; i++) {
        // Create a random permutation for ground truth
        const truth = Array.from({length: N}, (_, i) => i);
        // Shuffle truth
        for (let j = N - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [truth[j], truth[k]] = [truth[k], truth[j]];
        }

        // Map Item -> Strength (Index in truth)
        // If index(A) > index(B), A beats B.
        const strength = new Map();
        truth.forEach((item, idx) => strength.set(item, idx));

        const provider = new QuickPairProvider(N);
        const state = { swapped: false }; // Mock state
        let comparisons = 0;

        let nextPair = provider.next(state, null);

        while(nextPair) {
            comparisons++;
            const [a, b] = nextPair;

            let result;
            if (allowTies && Math.random() < 0.1) { // 10% tie probability
                result = 0.5;
            } else {
                // Deterministic win based on strength
                // Tie-break if equal? (Not possible with distinct items)
                const sA = strength.get(a);
                const sB = strength.get(b);
                result = sA > sB ? 1 : 0;
            }

            // Note: handleRefine logic handles swapped state
            // If result 0.5, provider picks random winner effectively.

            // Mock random swap for next
            state.swapped = Math.random() < 0.5;

            provider.mark(nextPair);
            nextPair = provider.next(state, result);
        }
        totalComparisons += comparisons;
    }

    return totalComparisons / iterations;
}

console.log("N,NoTie,Tie");
for (let n = 5; n <= 100; n += 5) {
    const noTie = simulate(n, false, 1000);
    const tie = simulate(n, true, 1000); // 10% ties
    console.log(`${n},${noTie.toFixed(2)},${tie.toFixed(2)}`);
}
