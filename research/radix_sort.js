/**
 * LSD and MSD radix sort for signed 32-bit integers.
 *
 * These are TRUE radix sorts: they inspect key bytes/passes (key-inspecting),
 * never compare two keys, and therefore do not fit PreferenceRank's
 * comparison-battle model (unique human comparisons). See
 * research/RADIX_SORT_ANALYSIS.md for why they are benchmarked wall-clock
 * only and are excluded from the battle-count suite by the comparison-only
 * rule (research/PROVIDER_AUDIT.md, Finding 4).
 *
 * Sign handling: the top byte is XORed with 0x80 before bucketing so signed
 * integers order correctly (negatives first, then positives) without a
 * separate sign pass. All other bytes are used as unsigned.
 *
 * Base 256 (8 bits per pass) is used: LSD does exactly 4 stable counting
 * passes; MSD recurses over bytes most-significant first and falls back to
 * insertion sort for buckets of <= CUTOFF elements (the "MSD with cutoff"
 * strategy Sedgewick reports beating plain MSD by ~58x on long keys, see
 * research/RADIX_SORT_ANALYSIS.md references).
 *
 * Both functions are non-mutating: they return a fresh Int32Array.
 */
'use strict';

const COUNTING_BASE = 256;
const MSD_CUTOFF = 16;

function byteVal(v, shift) {
    let b = (v >>> shift) & 0xff;
    if (shift === 24) b ^= 0x80; // flip sign bit so negatives sort before positives
    return b;
}

function insertionSort(a, lo, hi) {
    for (let i = lo + 1; i < hi; i++) {
        const v = a[i];
        let j = i - 1;
        while (j >= lo && a[j] > v) { a[j + 1] = a[j]; j--; }
        a[j + 1] = v;
    }
}

/** LSD radix sort: least-significant byte first, stable counting passes. */
function lsdRadixSort(input) {
    const n = input.length;
    let src = Int32Array.from(input);
    if (n <= 1) return src;
    let buf = new Int32Array(n);
    const count = new Uint32Array(COUNTING_BASE);
    for (let shift = 0; shift < 32; shift += 8) {
        count.fill(0);
        for (let i = 0; i < n; i++) count[byteVal(src[i], shift)]++;
        let sum = 0;
        for (let b = 0; b < COUNTING_BASE; b++) { const c = count[b]; count[b] = sum; sum += c; }
        for (let i = 0; i < n; i++) { const b = byteVal(src[i], shift); buf[count[b]++] = src[i]; }
        const t = src; src = buf; buf = t; // ping-pong buffers
    }
    return src; // after 4 (even) passes the result is in `src`
}

/**
 * MSD radix sort: most-significant byte first, recursive bucket refinement.
 * Buckets with at most MSD_CUTOFF elements are finished with insertion sort;
 * buckets at the last byte (shift 0) contain fully-equal keys and stop.
 * Per-depth counter scratch is pooled across sibling buckets (depth <= 4) to
 * avoid tens of thousands of small typed-array allocations on large inputs.
 */
function msdRadixSort(input, cutoff = MSD_CUTOFF) {
    const n = input.length;
    const src = Int32Array.from(input);
    if (n <= 1) return src;
    const buf = new Int32Array(n);
    const pool = [];
    sortByteRange(src, buf, 0, n, 24, cutoff, pool);
    return src;
}

function sortByteRange(src, buf, lo, hi, shift, cutoff, pool) {
    const len = hi - lo;
    if (len <= 1) return;
    if (shift < 0 || len <= cutoff) { insertionSort(src, lo, hi); return; }

    const depth = (24 - shift) / 8;
    let sc = pool[depth];
    if (!sc) {
        sc = pool[depth] = { count: new Uint32Array(COUNTING_BASE), start: new Uint32Array(COUNTING_BASE), cursor: new Uint32Array(COUNTING_BASE) };
    } else {
        sc.count.fill(0);
    }
    const { count, start, cursor } = sc;
    for (let i = lo; i < hi; i++) count[byteVal(src[i], shift)]++;
    let sum = 0;
    for (let b = 0; b < COUNTING_BASE; b++) { start[b] = sum; sum += count[b]; }
    cursor.set(start);
    for (let i = lo; i < hi; i++) {
        const b = byteVal(src[i], shift);
        buf[lo + cursor[b]++] = src[i];
    }
    for (let i = lo; i < hi; i++) src[i] = buf[i];
    if (shift === 0) return; // buckets now contain fully-equal keys
    const nextShift = shift - 8;
    for (let b = 0; b < COUNTING_BASE; b++) {
        const s = lo + start[b];
        if (count[b] > 1) sortByteRange(src, buf, s, s + count[b], nextShift, cutoff, pool);
    }
}

module.exports = { lsdRadixSort, msdRadixSort, MSD_CUTOFF };

/* Self-test: node research/radix_sort.js */
if (require.main === module) {
    const native = (a) => Int32Array.from(Array.from(a).sort((x, y) => x - y));
    const cases = [];
    const rng = (() => { let s = 0x2f6e2b1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return s | 0; }; })();
    for (const size of [0, 1, 2, 3, 7, 16, 17, 255, 256, 1000, 4096]) {
        const arr = new Int32Array(size);
        for (let i = 0; i < size; i++) arr[i] = rng();
        cases.push(arr);
        cases.push(new Int32Array(size).fill(42));
        cases.push(new Int32Array(size).fill(-2147483648));
        const edge = new Int32Array(size);
        for (let i = 0; i < size; i++) edge[i] = i % 2 === 0 ? -2147483648 : 2147483647;
        cases.push(edge);
    }
    let fail = 0;
    for (let k = 0; k < cases.length; k++) {
        const expected = native(cases[k]);
        for (const [name, fn] of [['LSD', lsdRadixSort], ['MSD', msdRadixSort]]) {
            const got = fn(cases[k]);
            let ok = got.length === expected.length;
            if (ok) for (let i = 0; i < got.length; i++) if (got[i] !== expected[i]) { ok = false; break; }
            if (!ok) { fail++; console.log(`FAIL ${name} case ${k} (len=${cases[k].length})`); }
        }
    }
    // input immutability
    const orig = new Int32Array([5, -3, 7, -2147483648, 2147483647, 0]);
    const snapshot = Int32Array.from(orig);
    lsdRadixSort(orig); msdRadixSort(orig);
    for (let i = 0; i < orig.length; i++) if (orig[i] !== snapshot[i]) { fail++; console.log('FAIL input mutation'); break; }
    console.log(fail === 0 ? `ALL RADIX SELF-TESTS PASS (${cases.length * 2 + 1} checks)` : `${fail} FAILURES`);
    process.exit(fail === 0 ? 0 : 1);
}
