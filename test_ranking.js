
class PairProvider {
    constructor(count) {
        this.count = count;
        this.compared = new Set();
    }
    key([a,b]) {
        return a < b ? `${a}-${b}` : `${b}-${a}`;
    }
    mark(pair) {
        this.compared.add(this.key(pair));
    }
    unmark(pair) {
        this.compared.delete(this.key(pair));
    }
    getRanking(scores) {
        return [...scores.keys()].sort((a,b)=>scores[b] - scores[a]);
    }
}

class AdaptivePairProvider extends PairProvider {
    constructor(count) {
        super(count);
        this.totalEstimate = Math.round(count * Math.log2(count));
    }

    next(state) {
        const { scores, items } = state;
        const indices = Array.from({length: items.length}, (_, i) => i);

        // Sort indices by score descending.
        // Deterministic tie-break based on index.
        indices.sort((a, b) => (scores[b] - scores[a]) || (a - b));

        // console.log('Sorted indices:', indices);

        // Find first adjacent pair not compared
        for (let i = 0; i < indices.length - 1; i++) {
            const a = indices[i];
            const b = indices[i+1];

            if (!this.compared.has(this.key([a, b]))) {
                // console.log(`Comparing ${a} vs ${b} (Scores: ${scores[a]} vs ${scores[b]})`);
                return [a, b];
            }
        }
        return null;
    }
}

function recalculateScores(items, matches) {
    const steps = 5
      , scores = Array(items.length).fill(1000);
    const factor = Math.log(10) / 400
      , k = 32 / steps;
    for (let step = 0; step < steps; step++) {
        const deltas = Array(items.length).fill(0);
        matches.forEach(({a, b, result})=>{
            const expected = 1 / (1 + Math.exp((scores[b] - scores[a]) * factor));
            const change = k * (result - expected);
            deltas[a] += change;
            deltas[b] -= change;
        }
        );
        scores.forEach((_,i)=>scores[i] += deltas[i]);
    }
    return scores;
}

function simulate(n) {
    const items = Array.from({length: n}, (_, i) => i);
    const provider = new AdaptivePairProvider(n);
    const matches = [];
    let scores = Array(n).fill(1000);

    let step = 0;
    while(true) {
        const state = { scores, items, matches };
        const pair = provider.next(state);

        if (!pair) break;

        provider.mark(pair);
        const [a, b] = pair;
        const result = a < b ? 1 : 0;

        matches.push({a, b, result});
        scores = recalculateScores(items, matches);
        step++;

        if (step > 100) break; // Limit for debug
    }

    return { step, scores, matches };
}

const n = 5;
const { step } = simulate(n);
console.log(`N=${n}, Comparisons=${step}`);
