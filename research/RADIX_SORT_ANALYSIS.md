# Radix Sort (LSD & MSD) — Research and Benchmark Analysis

**Date:** 2026-11-15 · **Scope:** web-sourced review of LSD/MSD radix sort + implementation and benchmark in this repository · **Status:** production recommendation unchanged (Ford-Johnson remains the knee for human preference ranking)

## TL;DR

- Implemented **true LSD and MSD radix sorts** for signed 32-bit integers (base 256) in [`research/radix_sort.js`](radix_sort.js) — key-inspecting, zero key comparisons. Self-tests pass (89 checks, edge values ±2147483648 included).
- New wall-clock benchmark [`research/benchmark_radix.js`](benchmark_radix.js) compares them against 3-way Quicksort, top-down Merge Sort and native `Array.prototype.sort` across **7 distributions × 3 sizes (10⁴ / 10⁵ / 10⁶)**; results in [`research/radix_results.txt`](radix_results.txt).
- **LSD beats every comparison baseline on every distribution at N ≥ 100,000** (e.g. 18.1 ms vs 153.0 ms for 3-way Quicksort on random 1e6 keys, ~8.5×). Its runtime is essentially **input-insensitive** (18–23 ms everywhere), which is its defining advantage.
- **MSD is consistently slower than LSD in this harness** (LSD/MSD ratio 0.38–0.74), matching published C/C++ measurements and Sedgewick's warning that MSD only pays off with a small-file cutoff (we use insertion sort for buckets ≤ 16).
- **Radix sorts cannot join the PreferenceRank battle metric.** The whole suite measures *unique pairwise human comparisons*; radix sorts never compare two keys. They remain excluded by the comparison-only rule (see [PROVIDER_AUDIT.md](PROVIDER_AUDIT.md), Finding 4 — an earlier "Radix Sort" provider that did random-pivot partition + insertion sort was removed and replaced by Binary Quicksort).
- Full-suite refresh: wall-clock benchmark for all **256** existing providers re-run at N=200 / 10 trials → `research/runtime_results.txt` (protocol unchanged). Fresh confirmation of the production-relevant battle rows (N=100, 250 trials) → `research/results_2026-11.txt`; Ford-Johnson confirms at **526.96 battles / τ = 1.0000** (results.txt snapshot: 526.60). Production knee unchanged.

---

## 1. What the web says

### 1.1 LSD (Least Significant Digit first)

LSD radix sort processes keys **right-to-left**, one digit position at a time, using a **stable** inner sort (counting sort). Stability is what makes it correct: each pass preserves the relative order established by the previous, less-significant pass, exactly like multi-level spreadsheet sorting (sort by column C, then B, then A) [2](https://algomaster.io/learn/dsa/radix-sort). Complexity is **O(d · (n + k))** for `d` digit positions in base `k` [2](https://algomaster.io/learn/dsa/radix-sort), equivalently O(n · log_b m) for max key `m` in base `b` [4](https://sortingalgos.miraheze.org/wiki/Radix_Sort_(LSD)), with **O(n + k)** auxiliary space [2](https://algomaster.io/learn/dsa/radix-sort) [1](https://www.growingwiththeweb.com/sorting/radix-sort-lsd/). It is the simpler, iterative variant and the one usually meant by "radix sort"; it is not in-place [1](https://www.growingwiththeweb.com/sorting/radix-sort-lsd/).

### 1.2 MSD (Most Significant Digit first)

MSD radix sort processes keys **left-to-right**: key-indexed counting partitions the input by the leading digit, then **recurses** into each bucket on the next digit [3](https://blog.lab2.dev/tutorials/algorithms/sort/radix-sort) [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf). Two structural consequences:

- **It can stop early** on buckets that collapse to ≤ 1 key (or to equal keys), so it may inspect fewer digits than LSD on some inputs; it is the preferred shape for variable-length strings [2](https://algomaster.io/learn/dsa/radix-sort) [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf).
- **It is expensive on small buckets**: counters must be initialized/reset for every recursive call and the working set fragments — Sedgewick & Wayne report MSD at **395 s** vs **6.8 s** "MSD with cutoff" (insert to ~10–20 elements) vs **2.8 s** for 3-way radix quicksort on the Moby-Dick suffix problem, and 256 counters ≈ **100× slower** than a copy pass at N=2 [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf). MSD is cache-inefficient with long stretches of equal keys [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf). The common production form is the in-place **American flag sort** variant (in-place partition by digit, recurse on buckets) [5](https://rosettacode.org/wiki/Sorting_algorithms/Radix_sort) [3](https://blog.lab2.dev/tutorials/algorithms/sort/radix-sort).

### 1.3 Published head-to-head measurements

| Source | Workload | Finding |
|---|---|---|
| KirillLykov/int-sort-bmk (C++, 64-bit keys) [6](https://github.com/KirillLykov/int-sort-bmk) | Shuffled unique values | LSD outperforms MSD only modestly (**~6%**); both beat comparison sorts significantly |
| KirillLykov/int-sort-bmk [6](https://github.com/KirillLykov/int-sort-bmk) | Uniform [0, 1e9) | **LSD several times faster than MSD**; MSD "performs poorly", peaks unexplained (histogram recomputation) |
| KirillLykov/int-sort-bmk, `perf stat` [6](https://github.com/KirillLykov/int-sort-bmk) | Cache misses LSD vs MSD | LSD/MSD LLC-load-misses ≈ **2.45**, LLC-store-misses ≈ **3.62** — MSD is far more cache-hostile (LSD precomputes histograms per shift) |
| Ali, et al. (2012), sequential/parallel radix [7](https://www.researchgate.net/publication/289519802_PERFORMANCE_BENCHMARKING_OF_SEQUENTIAL_PARALLEL_AND_HYBRID_RADIX_SORT_ALGORITHMS_AND_ANALYZING_IMPACT_OF_SUB_VECTORS_CREATED_ON_EACH_LEVEL_ON_HYBRID_MSD_RADIX_SORT'S_RUNTIME) | Hybrid MSD/LSD vs traditional recursive MSD | Their MSD1 variant is **1.74×–2.56× faster** than traditional recursive MSD; plain LSD1/LSD2 beat traditional MSD by ~2×–6× at N ≥ 1e6 |
| Threshold Optimization (ACM 2025) [8](https://dl.acm.org/doi/10.1145/3708597.3708616) | N = 1k / 10k / 100k | MSD and LSD trade places at small N (1.55 vs 1.22 ms @1k; 9.44 vs 7.94 ms @10k); at 100k, MSD 86.2/80.9/75.9 ms vs LSD 100.1/101.3/72.1 ms across three tables — no universal winner, distribution-dependent |

**Consensus:** LSD is the safe default for fixed-width keys; MSD wins only with tight engineering (cutoff + precomputed histograms + American-flag placement) or on variable-length keys; both crush O(n log n) comparison sorts on non-adversarial integer keys. [2](https://algomaster.io/learn/dsa/radix-sort) [5](https://rosettacode.org/wiki/Sorting_algorithms/Radix_sort) [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf)

### 1.4 LSD vs MSD at a glance

| Aspect | LSD | MSD |
|---|---|---|
| Direction | right → left | left → right |
| Structure | iterative, 4 stable counting passes (32-bit, base 256) | recursive bucket refinement |
| Stability | naturally stable (required) [2](https://algomaster.io/learn/dsa/radix-sort) | must be engineered (or irrelevant for keys) |
| Small inputs | always d passes (not adaptive) | can stop early; cutoff essential [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf) |
| Constant/few-unique keys | pays full d passes | also pays recursion overhead (bucket collapse) |
| Best for | fixed-width integers, fixed-length strings | variable-length strings, very sparse high bytes |
| Passes | exactly ⌈32/8⌉ = 4 | variable (≤ 4 + cutoff finishes) |

Sign handling for both: XOR the top byte with `0x80` so two's-complement ordering becomes unsigned ordering (negatives first) — the standard trick, cf. Rosetta Code's signed LSD [5](https://rosettacode.org/wiki/Sorting_algorithms/Radix_sort). Implementation here follows [1](https://www.growingwiththeweb.com/sorting/radix-sort-lsd/) and [3](https://blog.lab2.dev/tutorials/algorithms/sort/radix-sort).

---

## 2. Why radix is excluded from the battle model

PreferenceRank's primary metric — **Avg Battles / Kendall Tau at N=100, 250 trials** (`research/sort_analysis.js`, `simulate()`) — counts **unique pairwise comparisons** between items whose "strengths" are latent. Radix sort performs **zero** key comparisons; a radix "provider" can only be written by inventing fake comparison work. The repository removed exactly such a provider in 2026-09 (Finding 4: random-pivot partition + insertion sort masquerading as radix) and documents key-inspecting sorts (counting, radix, bead/gravity, flash, proxmap, spreadsort, Ska) as **out of scope** for the comparison-battle suite [PROVIDER_AUDIT.md](PROVIDER_AUDIT.md) [CANDIDATE_ALGORITHMS.md](CANDIDATE_ALGORITHMS.md). Batch-8 included *comparison-faithful proxies* (Interpolation Sort, Ska Sort as binary-quicksort recursion), never the true algorithms.

Accordingly, LSD/MSD radix are benchmarked **wall-clock only** (this document) and are not added to `algos[]` in `sort_analysis.js`. Adding them would fabricate a battle count.

---

## 3. Implementations and methodology

`research/radix_sort.js` (both non-mutating, return fresh `Int32Array`):

- **LSD**: 4 passes (shifts 0, 8, 16, 24) of stable counting sort, base 256, ping-ponging two `Int32Array` buffers. Top byte XORed with `0x80` (see §1.4).
- **MSD**: recursive byte refinement, most-significant first. Buckets of **≤ 16 elements** finish with insertion sort (Sedgewick's cutoff guidance [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf)); recursion stops at shift 0 (buckets then hold fully-equal keys). Per-depth counter scratch (`count`/`start`/`cursor`) is **pooled across sibling buckets** (depth ≤ 4) — this removed tens of thousands of small typed-array allocations and cut the N=1e6 random32 wall time from ~113 ms to ~48 ms.
- Correctness: property-tested against a native sort oracle on shrinking edge cases (lengths 0–4096, ±2147483648, constant arrays, input immutability): **89/89 checks pass**.

`research/benchmark_radix.js`: datasets = `random32`, `small-uniform-1e6`, `sorted`, `reversed`, `nearly-sorted` (1% swaps), `few-unique-8`, `constant`; sizes = 10⁴ / 10⁵ / 10⁶; reps = 25 / 7 / 3. A **correctness gate** (full compare against native sort for every algo × dataset × size) must pass before any timing is recorded. Timings use `process.hrtime.bigint()`; the file prints avg/best per row and writes `research/radix_results.txt`.

---

## 4. Results

### 4.1 Radix vs comparison baselines (avg ms; N=1e6, full tables in radix_results.txt)

| Dataset (N=1e6) | LSD | MSD | 3-way Quicksort | Merge Sort | Native sort |
|---|---|---|---|---|---|
| random32 | **18.10** | 47.95 | 152.99 | 242.03 | 448.00 |
| small-uniform-1e6 | **19.07** | 27.01 | 147.99 | 225.79 | 440.66 |
| sorted | **21.57** | 32.14 | 71.11 | 101.96 | 59.24 |
| reversed | **20.52** | 38.91 | 66.03 | 108.17 | 59.95 |
| nearly-sorted | **22.39** | 30.42 | 75.33 | 113.55 | 124.10 |
| few-unique-8 | 21.22 | 29.14 | **18.20** | 145.18 | 245.10 |
| constant | 23.46 | 32.60 | **3.76** | 96.74 | 60.07 |

N=1e5 snapshot: LSD 1.54 / 1.85 / 1.68 / 1.73 / 2.06 / 1.98 / 2.08 ms — fastest on **every** distribution including few-unique-8 (1.98 vs 2.51) and constant (2.08 vs 0.35 quicksort wins by adapting to all-equal in one pass). At N=1e4, LSD still wins or ties everywhere except `few-unique-8` (0.21 vs quicksort 0.16) and `constant` (0.20 vs 0.02). Native sort (V8's TimSort-family) beats explicit comparison baselines on sorted/reversed but loses to LSD by **~3–9×**.

**LSD/MSD wall-clock ratio** (avg ms): 0.38–0.74 across all 21 cells — LSD never loses to MSD in this harness, consistent with [6](https://github.com/KirillLykov/int-sort-bmk) and [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf). MSD's handicap: every recursive level rebuilds histograms and pointer math over shrinking buckets (the same reason [6](https://github.com/KirillLykov/int-sort-bmk) measures 2.45–3.62× more LLC misses for MSD).

### 4.2 Full provider wall-clock refresh (all 256 registered providers)

Protocol identical to the documented batch-9 rerun: N=200, 10 trials, `node research/benchmark_runtime.js 200 10`. Bogo-family rows are skipped at N>20 as before. Fresh results in `research/runtime_results.txt`. Headline no-duplicate rows (joke/non-sorting providers excluded as before): **64-way Merge Sort 0.23 ms**, Insertion Sort 0.28 ms, Oscillating Merge 0.31 ms, Interpolation Sort 0.32 ms, Binary Gnome 0.35 ms, Binary Insertion 0.36 ms, **Ford-Johnson 1.16 ms** — wall-clock ordering unchanged in character; Ford-Johnson's optimality is measured in human battles, not machine ms.

### 4.3 Battle-suite fresh confirmation (N=100, 250 trials, standard protocol)

The comparison harness is unchanged by the radix work, so `research/confirm_battle.js` re-measures the **production-relevant rows only** with the exact standard protocol (`simulate(100, provider, 250)`); output in `research/results_2026-11.txt`. Results vs the committed full-suite snapshot (`results.txt`):

| Algorithm | 2026-11 confirmation | results.txt snapshot |
|---|---|---|
| Ford-Johnson (Quick) | 526.96 / τ 1.0000 / NO | 526.60 / 1.0000 / NO |
| Budgeted Merge Sort | 520.00 / τ 0.9605 / NO | 520.00 / 0.9632 / NO |
| Merge Sort | 541.44 / 1.0000 / NO | 542.68 / 1.0000 / NO |
| Binary Insertion | 530.32 / 1.0000 / NO | 530.35 / 1.0000 / NO |
| Binary Gnome | 530.60 / 1.0000 / NO | 530.17 / 1.0000 / NO |
| Interpolation Sort | 530.67 / 1.0000 / NO | 530.13 / 1.0000 / NO |
| 64-way Merge Sort | 558.52 / 1.0000 / NO | 558.02 / 1.0000 / NO |
| Full Rank | 812.58 / 1.0000 / NO | 811.60 / 1.0000 / NO |
| Insertion Sort | 2559.24 / 1.0000 / NO | 2573.58 / 1.0000 / NO |

All within seed noise — the committed snapshot stands as the full-suite table. Transitive-closure saturation explains Full Rank < N(N−1)/2 (half of all pairs are never asked). Production knee unchanged. Radix rows: **none — non-comparison (§2)**. A full fresh rerun (`node research/sort_analysis.js 100 250`) was started but takes hours on the 2-core sandbox; it is not needed to validate an unchanged harness.

---

## 5. Findings

1. **LSD is the right integer-key algorithm and is input-insensitive.** Spread at N=1e6 is 18.1–23.5 ms (±13%) across distributions, including adversarial sorted/reversed/constant. When keys are fixed-width and untrusted, radix's predictability beats every comparison sort measured.
2. **MSD does not pay off for fixed-width 32-bit keys in this harness.** It needs a cutoff to be viable at all (without cutoff it is pathologically slow — cf. 395 s vs 6.8 s in [9](https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf)), and even with one plus allocation pooling it trails LSD by 1.3–2.6×. Use MSD for variable-length strings or when most keys die in the top bytes; otherwise LSD.
3. **Adaptive comparison sorts win exactly the inputs radix can't exploit**: `constant` (3-way quicksort 3.76 ms vs LSD 23.46 ms) and `few-unique-8` at N≥1e5 (18.20 vs 21.22). If your data has massive runs of equal keys *and* comparisons are cheap, quicksort-family wins; otherwise radix dominates.
4. **Neither can rank human preferences.** No keys exist — only pairwise choices. Ford-Johnson (527 battles, τ=1.0) remains the production knee; nothing in this study moves it.
5. **If PreferenceRank ever adds a "numeric keys" mode** (e.g. ranking pre-existing scores), LSD radix is the drop-in: O(4n) passes, stable, no comparisons, trivially correct. MSD only if keys are variable-length.
6. The 2026-09 audit's stance is vindicated in reverse: the *comparison-faithful proxies* (Interpolation Sort ≈ budget merge) stay near Ford-Johnson; the "real" radix family confirms its advantage is real but out-of-model.

## 6. Limitations

- JS on a 2-core sandbox: no SIMD/vectorization; `Int32Array` copies per pass; V8 GC noise included (best-of-reps reported alongside avg). Native-sort row carries boxing/allocation overhead.
- Only 32-bit signed keys (4 passes); 64-bit keys would double passes and shrink radix's margin vs quicksort proportionally to d·(n+k)/n·log n.
- MSD measured is the recursive scatter/copy variant; a true in-place American-flag implementation (JVM/C++ style) would close some gap — but the direction of the published C++ data (LSD ahead, cache-misses 2.45–3.62× worse for MSD) agrees with this harness.
- Battle results are fresh-seed confirmations, not bitwise reproductions (harness uses `Math.random()`); tables quoted from ANALYSIS.md remain the documented snapshot.
- Runtimes are not directly comparable across machines; compare *ratios within this file*.

## 7. Reproduce

```bash
node research/radix_sort.js          # self-tests (89 checks)
node research/benchmark_radix.js     # correctness gate + writes radix_results.txt
node research/benchmark_runtime.js 200 10   # refresh runtime_results.txt
node research/confirm_battle.js             # fresh confirmation of key battle rows -> results_2026-11.txt
node research/sort_analysis.js 100 250      # full battle table (stdout; hours on 2 cores)
```

## References

[1] Growing with the Web — Radix sort (LSD): <https://www.growingwiththeweb.com/sorting/radix-sort-lsd/>
[2] AlgoMaster — Radix Sort (variants, complexity, LSD-vs-MSD table): <https://algomaster.io/learn/dsa/radix-sort>
[3] Lab2 Blog — Radix Sort: MSD and LSD Approaches (pseudocode): <https://blog.lab2.dev/tutorials/algorithms/sort/radix-sort>
[4] Sorting Wiki (Miraheze) — Radix Sort (LSD), O(n·log_b m): <https://sortingalgos.miraheze.org/wiki/Radix_Sort_(LSD)>
[5] Rosetta Code — Sorting algorithms/Radix sort (signed LSD, MSD, American flag): <https://rosettacode.org/wiki/Sorting_algorithms/Radix_sort>
[6] Kirill Lykov — int-sort-bmk: LSD vs MSD radix benchmarks, LLC-miss ratios: <https://github.com/KirillLykov/int-sort-bmk>
[7] Ali et al. (2012) — Performance benchmarking of sequential, parallel and hybrid radix sort algorithms: <https://www.researchgate.net/publication/289519802_PERFORMANCE_BENCHMARKING_OF_SEQUENTIAL_PARALLEL_AND_HYBRID_RADIX_SORT_ALGORITHMS_AND_ANALYZING_IMPACT_OF_SUB_VECTORS_CREATED_ON_EACH_LEVEL_ON_HYBRID_MSD_RADIX_SORT'S_RUNTIME>
[8] ACM (2025) — Threshold Optimization and Comparative Performance Evaluation of Quicksort Algorithms: Hashing vs Radix vs QuickSort: <https://dl.acm.org/doi/10.1145/3708597.3708616>
[9] Sedgewick & Wayne — COS 226, Radix Sorts (MSD, cutoff, 3-way radix quicksort, counter-initialization cost): <https://www.cs.princeton.edu/courses/archive/fall07/cos226/lectures/18RadixSort.pdf>
