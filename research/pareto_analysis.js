const fs = require('fs');
const path = require('path');

// Keep the Pareto analysis tied to the benchmark artifact instead of copying
// a second, eventually stale set of measurements into this script.
const resultPath = path.join(__dirname, '..', 'results.txt');
const lines = fs.readFileSync(resultPath, 'utf8').trim().split(/\r?\n/);
const rows = lines.slice(2).filter(Boolean).map((line, index) => {
    const fields = line.split('\t');
    if (fields.length < 4) throw new Error(`Malformed result row ${index + 3}: ${line}`);
    return {
        name: fields[0],
        battles: Number(fields[1]),
        tau: Number(fields[2]),
        duplicates: fields[3] === 'YES'
    };
});

if (rows.length === 0 || rows.some(row => !Number.isFinite(row.battles) || !Number.isFinite(row.tau))) {
    throw new Error(`No valid benchmark rows found in ${resultPath}`);
}

function paretoMask(points) {
    const mask = new Array(points.length).fill(true);
    for (let i = 0; i < points.length; i++) {
        if (points[i].duplicates) {
            mask[i] = false;
            continue;
        }
        for (let j = 0; j < points.length; j++) {
            if (i === j || points[j].duplicates) continue;
            const noMoreBattles = points[j].battles <= points[i].battles;
            const noLessAccuracy = points[j].tau >= points[i].tau;
            const strictlyBetter = points[j].battles < points[i].battles || points[j].tau > points[i].tau;
            if (noMoreBattles && noLessAccuracy && strictlyBetter) {
                mask[i] = false;
                break;
            }
        }
    }
    return mask;
}

const mask = paretoMask(rows);
const paretoPoints = rows
    .map((point, index) => ({ ...point, pareto: mask[index] }))
    .filter(point => point.pareto)
    .sort((a, b) => a.battles - b.battles || b.tau - a.tau || a.name.localeCompare(b.name));

const x = paretoPoints.map(point => Math.log10(point.battles + 1));
const y = paretoPoints.map(point => point.tau);
const xMin = Math.min(...x), xMax = Math.max(...x);
const yMin = Math.min(...y), yMax = Math.max(...y);
const xSpan = xMax - xMin || 1;
const ySpan = yMax - yMin || 1;
const xNorm = x.map(value => (value - xMin) / xSpan);
const yNorm = y.map(value => (value - yMin) / ySpan);

// Method 1: maximum perpendicular distance from the endpoint chord.
let maxDistance = -1;
let perpendicularKneeIndex = 0;
const x1 = xNorm[0], y1 = yNorm[0];
const x2 = xNorm[xNorm.length - 1], y2 = yNorm[yNorm.length - 1];
const denominator = Math.hypot(y2 - y1, x2 - x1) || 1;
for (let i = 0; i < xNorm.length; i++) {
    const numerator = Math.abs(
        (y2 - y1) * xNorm[i] - (x2 - x1) * yNorm[i] + x2 * y1 - y2 * x1
    );
    const distance = numerator / denominator;
    if (distance > maxDistance) {
        maxDistance = distance;
        perpendicularKneeIndex = i;
    }
}

// Method 2: Kneedle's normalized difference curve.
let maxDifference = -Infinity;
let kneedleIndex = 0;
for (let i = 0; i < xNorm.length; i++) {
    const difference = yNorm[i] - xNorm[i];
    if (difference > maxDifference) {
        maxDifference = difference;
        kneedleIndex = i;
    }
}

const perpendicularKnee = paretoPoints[perpendicularKneeIndex];
const kneedleKnee = paretoPoints[kneedleIndex];

console.log(`Benchmark rows: ${rows.length}`);
console.log(`Pareto-optimal algorithms (N=100, NO DUPLICATES ONLY):`);
for (const point of paretoPoints) {
    const markers = [
        point.name === perpendicularKnee.name ? 'MAX PERP KNEE' : '',
        point.name === kneedleKnee.name ? 'KNEEDLE KNEE' : ''
    ].filter(Boolean);
    console.log(
        `  ${point.name.padEnd(36)} battles=${point.battles.toFixed(2).padStart(8)} ` +
        `tau=${point.tau.toFixed(4)}${markers.length ? `  <-- ${markers.join(' / ')}` : ''}`
    );
}

console.log('\nDominated algorithms (or Duplicates):');
rows
    .map((point, index) => ({ ...point, pareto: mask[index] }))
    .filter(point => !point.pareto)
    .sort((a, b) => a.battles - b.battles || a.name.localeCompare(b.name))
    .forEach(point => {
        console.log(
            `  ${point.name.padEnd(36)} battles=${point.battles.toFixed(2).padStart(8)} ` +
            `tau=${point.tau.toFixed(4)}${point.duplicates ? ' [DUP]' : ''}`
        );
    });

console.log(`\nPerpendicular-distance knee: ${perpendicularKnee.name}`);
console.log(`Kneedle knee: ${kneedleKnee.name}`);
