
const Math_log10 = Math.log(10);
const SCALE = 400 / Math_log10;

function runBT(n, matches, threshold, maxIter = 20000) {
    const wins = new Float64Array(n);
    const adjMaps = Array.from({ length: n }, () => new Map());
    for (const { a, b, result } of matches) {
        const weight = 2;
        wins[a] += result * weight;
        wins[b] += (1 - result) * weight;
        adjMaps[a].set(b, (adjMaps[a].get(b) || 0) + weight);
        adjMaps[b].set(a, (adjMaps[b].get(a) || 0) + weight);
    }

    const adj = adjMaps.map(map => {
        const row = [];
        for (const [j, count] of map) row.push(j, count);
        return row;
    });

    const PRIOR = 0.02;
    const s = new Float64Array(n).fill(1.0);
    const adjustedWins = new Float64Array(n);
    for (let i = 0; i < n; i++) adjustedWins[i] = wins[i] + PRIOR;

    const prevLogS = new Float64Array(n);
    for (let i = 0; i < n; i++) prevLogS[i] = Math.log(s[i]);
    const logs = new Float64Array(n);
    const invN = 1 / n;

    const start = performance.now();
    let iterations = 0;
    for (let iter = 0; iter < maxIter; iter++) {
        iterations++;
        for (let i = 0; i < n; i++) {
            const row = adj[i];
            const si = s[i];
            let denom = 0.04 / (si + 1) + 1e-12;
            for (let k = 0, len = row.length; k < len; k += 2)
                denom += row[k + 1] / (si + s[row[k]]);
            s[i] = adjustedWins[i] / denom;
        }

        let sumLog = 0;
        for (let i = 0; i < n; i++) {
            const l = Math.log(s[i]);
            logs[i] = l;
            sumLog += l;
        }

        const logScale = sumLog * invN;
        const scale = Math.exp(logScale);
        let maxDelta = 0;
        for (let i = 0; i < n; i++) {
            s[i] /= scale;
            const currentLog = logs[i] - logScale;
            const d = Math.abs(currentLog - prevLogS[i]);
            if (d > maxDelta) maxDelta = d;
            prevLogS[i] = currentLog;
        }
        if (maxDelta < threshold) break;
    }
    const end = performance.now();

    const scores = Array.from(s, v => 1000 + Math.log(v) * SCALE);
    return { scores, iterations, time: end - start };
}

function generateMatches(n, matchCount) {
    const matches = [];
    for (let i = 0; i < matchCount; i++) {
        const a = Math.floor(Math.random() * n);
        let b = Math.floor(Math.random() * n);
        while (a === b) b = Math.floor(Math.random() * n);
        const result = Math.random() > 0.5 ? 1 : 0;
        matches.push({ a, b, result });
    }
    return matches;
}

const N_VALUES = [20, 100, 500, 1000];
const DENSITIES = [2, 10];
const THRESHOLDS = [1e-1, 1e-3, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-12];

console.log('N\tDensity\tThreshold\tIterations\tTime(ms)\tMaxError\tIterSaved%');

for (const n of N_VALUES) {
    for (const d of DENSITIES) {
        const matchCount = Math.floor(n * d);
        const matches = generateMatches(n, matchCount);
        const ref = runBT(n, matches, 1e-15, 30000);
        const base = runBT(n, matches, 1e-12, 30000);

        for (const t of THRESHOLDS) {
            const res = runBT(n, matches, t);
            let maxErr = 0;
            for (let i = 0; i < n; i++) maxErr = Math.max(maxErr, Math.abs(res.scores[i] - ref.scores[i]));
            const saved = ((base.iterations - res.iterations) / base.iterations * 100).toFixed(1);
            console.log(`${n}\t${d}\t${t.toExponential()}\t${res.iterations}\t${res.time.toFixed(3)}\t${maxErr.toExponential(4)}\t${saved}%`);
        }
    }
}
