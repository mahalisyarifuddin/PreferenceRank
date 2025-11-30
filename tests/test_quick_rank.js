
const assert = require('assert');

// Mock PairProvider and QuickPairProvider for testing logic without browser environment
class PairProvider {
    constructor(count) {
        this.count = count;
        this.compared = new Set();
    }
    key([a,b]) {
        return `${Math.min(a, b)}-${Math.max(a, b)}`;
    }
    mark(pair) {
        this.compared.add(this.key(pair));
    }
    unmark(pair) {
        this.compared.delete(this.key(pair));
    }
    has(pair) {
        return this.compared.has(this.key(pair));
    }
    getResults(items, scores) {
        return items.map((item,i)=>({
            item,
            score: scores[i]
        })).sort((a,b)=>b.score - a.score);
    }
    getProgressText(step) {
        return `${step}`;
    }
}

class QuickPairProvider extends PairProvider {
    constructor(count) {
        super(count);
        this.items = Array.from({
            length: count
        }, (_,i)=>i);
        this.stack = [{
            stage: 0,
            items: [...this.items],
            left: null,
            right: null
        }];
        this.historyStack = [];
        this.pendingPair = null;
        this.previousScores = null;
        this.finalResult = null;
        this.refinePass = 0;
        this.refineIndex = 0;
        this.refineSwapped = false;
        this.maxRefinePasses = 3;
    }

    snapshot() {
        return JSON.stringify({
            stack: this.stack,
            pendingPair: this.pendingPair,
            previousScores: this.previousScores,
            compared: Array.from(this.compared),
            finalResult: this.finalResult,
            refinePass: this.refinePass,
            refineIndex: this.refineIndex,
            refineSwapped: this.refineSwapped
        });
    }

    restore(json) {
        const data = JSON.parse(json);
        this.stack = data.stack;
        this.pendingPair = data.pendingPair;
        this.previousScores = data.previousScores;
        this.compared = new Set(data.compared);
        this.finalResult = data.finalResult || null;
        this.refinePass = data.refinePass || 0;
        this.refineIndex = data.refineIndex || 0;
        this.refineSwapped = data.refineSwapped || false;
    }

    unmark(pair) {
        if (this.pendingPair && this.historyStack.length > 0)
            this.historyStack.pop();

        if (this.historyStack.length > 0) {
            const last = this.historyStack[this.historyStack.length - 1];
            this.restore(last);
            this.pendingPair = pair;
        }
        super.unmark(pair);
    }

    next(state) {
        if (!this.previousScores)
            this.previousScores = [...state.scores];
        if (this.pendingPair) {
            const [a,b] = this.pendingPair;
            const change = state.scores[a] - this.previousScores[a];
            const expected = 1 / (1 + 10 ** ((this.previousScores[b] - this.previousScores[a]) / 400));
            const result = (change / 32) + expected;
            const winnerId = Math.abs(result - 0.5) < 0.01 ? a : result > 0.75 ? a : b;

            this.stack.length > 0 && this.stack[this.stack.length - 1].mergeResult.push((winnerId === a ? this.stack[this.stack.length - 1].left : this.stack[this.stack.length - 1].right).shift());

            this.finalResult && winnerId === b && ([this.finalResult[this.refineIndex],this.finalResult[this.refineIndex + 1]] = [this.finalResult[this.refineIndex + 1], this.finalResult[this.refineIndex]],
            this.refineSwapped = true);
            this.finalResult && this.refineIndex++;

            this.pendingPair = null;
            this.previousScores = [...state.scores];
        }

        while (this.stack.length > 0) {
            const frame = this.stack[this.stack.length - 1];
            if (frame.stage === 0) {
                if (frame.items.length <= 1) {
                    frame.result = frame.items;
                    this.popAndPass(frame.result);
                    continue;
                }
                const mid = Math.floor(frame.items.length / 2);
                frame.stage = 1;
                frame.leftItems = frame.items.slice(0, mid);
                frame.rightItems = frame.items.slice(mid);
                this.stack.push({
                    stage: 0,
                    items: frame.leftItems,
                    left: null,
                    right: null
                });
                continue;
            }
            if (frame.stage === 1) {
                frame.stage = 2;
                this.stack.push({
                    stage: 0,
                    items: frame.rightItems,
                    left: null,
                    right: null
                });
                continue;
            }
            if (frame.stage === 2) {
                if (!frame.mergeResult) {
                    frame.mergeResult = [];
                    frame.left = [...frame.leftResult];
                    frame.right = [...frame.rightResult];
                }
                while (frame.left.length > 0 && frame.right.length > 0) {
                    const pair = [frame.left[0], frame.right[0]];
                    this.historyStack.push(this.snapshot());
                    this.pendingPair = pair;
                    return pair;
                }
                frame.mergeResult.push(...frame.left, ...frame.right);
                this.popAndPass(frame.mergeResult);
                continue;
            }
        }

        if (this.finalResult) {
            while (true) {
                if (this.refinePass >= this.maxRefinePasses)
                    return null;

                if (this.refineIndex >= this.finalResult.length - 1) {
                    if (!this.refineSwapped)
                        return null;
                    this.refinePass++;
                    this.refineIndex = 0;
                    this.refineSwapped = false;
                    continue;
                }

                const a = this.finalResult[this.refineIndex];
                const b = this.finalResult[this.refineIndex + 1];

                // FIX: Check for duplicate comparison
                if (this.has([a, b])) {
                    this.refineIndex++;
                    continue;
                }

                this.historyStack.push(this.snapshot());
                this.pendingPair = [a, b];
                return [a, b];
            }
        }

        return null;
    }

    popAndPass(result) {
        this.stack.pop();
        const parent = this.stack[this.stack.length - 1];
        this.stack.length > 0 ? (parent.stage === 1 ? parent.leftResult = result : parent.rightResult = result) : this.finalResult = result;
    }

    getResults(items, scores) {
        if (!this.finalResult)
            return super.getResults(items, scores);
        const sortedScores = [...scores].sort((a,b)=>b - a);
        return this.finalResult.map((index,i)=>({
            item: items[index],
            score: sortedScores[i]
        }));
    }
}

// TEST CASES
console.log('Running Tests...');

// Test 1: Verify 2 items (shortest path)
try {
    const count = 2;
    const provider = new QuickPairProvider(count);
    const state = {
        scores: Array(count).fill(1000)
    };

    let step = 0;
    let pair;

    while (pair = provider.next(state)) {
        step++;
        const [a, b] = pair;

        if (provider.has(pair)) {
            throw new Error(`Test 1 Failed: Duplicate comparison detected: ${a} vs ${b}`);
        }
        provider.mark(pair);

        const change = 16;
        state.scores[a] += change;
        state.scores[b] -= change;
    }
    console.log('Test 1 Passed: 2 items.');
} catch (e) {
    console.error(e.message);
    process.exit(1);
}

// Test 2: Verify 4 items
try {
    const count = 4;
    const provider = new QuickPairProvider(count);
    const state = {
        scores: Array(count).fill(1000)
    };

    let step = 0;
    let pair;

    while (pair = provider.next(state)) {
        step++;
        const [a, b] = pair;

        if (provider.has(pair)) {
            throw new Error(`Test 2 Failed: Duplicate comparison detected: ${a} vs ${b}`);
        }
        provider.mark(pair);

        // Always pick 'a' to simulate deterministic flow
        const change = 16;
        state.scores[a] += change;
        state.scores[b] -= change;
    }
    console.log('Test 2 Passed: 4 items.');
} catch (e) {
    console.error(e.message);
    process.exit(1);
}

console.log('All tests passed.');
