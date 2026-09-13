# Wild Web Sorting Benchmark — 256 Providers (N=100, 250 trials + Runtime N=200)

This report expands the PreferenceRank sorting benchmark beyond 241 providers to **256 providers** by sweeping the wild web for sorting algorithms from:

- Classic literature (Knuth, Sedgewick, Papernov-Stasevich, Hibbard, Pratt, etc.)
- Esoteric sorts (Bogosort family, Stalin/Thanos/Sleep/Solar Bitflip, Spaghetti Poll, Bead Gravity, Worst Sort, etc.)
- Modern adaptive (quadsort, fluxsort, crumsort, glidesort, blitsort, grailsort, wikisort, sqrt/octosort, cubesort/gridsort, VQSort model, wave sort, co-ranking mergesort, multizip, etc.)
- 2024-2026 papers (Wave Sort arXiv 2505.13552, Co-ranking arXiv 2509.24540, Corsort IJCAI 2024, etc.)
- Distribution ports (Flashsort, Proxmap, Interpolation, Ska, Spreadsort, SqrtSort, etc.)
- Heap arity variants (3-ary to 32-ary)
- K-way merges (3-way to 64-way)
- Shell gap families (Original, Hibbard, Ciura, Gonnet, Knuth, Papernov-Stasevich, Fibonacci, Tokuda, Sedgewick 1973/1982/1986, ORLP25, Pardons 2009, C16/3+1, Lee Improved Tokuda, Tokuda Good Gaps, Extended Ciura, Pratt 2^a3^b, Pratt 5x8, Pratt 2x3x5, Incerpi-Sedgewick, Frank-Lazarus, Split Ratio, 3/4 Enhanced-Gap)
- Sorting networks (Bitonic, Modified Bitonic, Brick, Pairwise, Insertion, Selection, Optimal 3-10, Bose-Nelson, Batcher Odd-Even)
- Tree sorts (Tree, Cartesian, Treap, Splay, AVL, Red-Black, B-Tree, AA, Scapegoat, Skew Heap, Leftist Heap, Binomial, Pairing, Fibonacci, Adaptive Heap, Weight-Balanced)
- Quicksort variants (RTL, LTR, Middle, Mo3, Ninther, Recursive Ninther, Hoare, 3-way, Dual-pivot, Triple-pivot, Stable, BlockQuicksort, PDQSort, Lomuto, Yaroslavskiy, 4-pivot, 9-pivot, Bentley-McIlroy, Binary Quicksort)
- Merge variants (Merge, Bottom-up, Natural, Ping-pong, 3/4/8/16/32/64-way, Rotation, In-place, Weave, QuickMerge, Powersort 3/4-way, Loser/Winner-tree, Grail, Wiki, Oscillating, Cascade, Polyphase, Drop-Merge, Split, Vergesort, Neatsort, Slab, Co-rank, Wave, Multizip, Unbalanced, α-stack, α-merge, Shivers length-adaptive, Pythonsort galloping, Java TimSort, etc.)

## Methodology

- **Battle benchmark:** `node research/sort_analysis.js 100 250` — average unique battles (non-duplicate, non-transitive) and Kendall Tau vs random ground truth strengths, 250 trials per provider. Duplicates = provider asks same unordered pair >1 in at least one trial.
- **Correctness audit:** `node research/audit_correctness.js` — 489 deterministic runs per provider over N=2,3,4,5,7,8,9,15,16,17,31,32,33,50,63,64,65,100,127,128 with non-monotonic distinct strengths, checking valid pairs, termination within 5e6 steps, and sorted output (bogo-family rows capped at tiny N).
- **Runtime benchmark:** `node research/benchmark_runtime.js 200 10` — wall-clock ms to drive provider to completion with random oracle, N=200, 10 trials.

## Results Summary (N=100, 250 trials) — Sorted by Battles

See `research/results.txt` for full 256 rows and `ANALYSIS.md` for Pareto analysis. Key new rows (Batch 9):

| Algorithm | Battles | Tau | Dup | Runtime N=200 ms | Notes |
|---|---|---|---|---|---|
| Pythonsort | 537.83 | 1.0000 | YES | 0.66 | CPython timsort with galloping merge |
| Java TimSort | 554.25 | 1.0000 | YES | 0.65 | JDK timsort, minRun 25, gallop trims + mergeLo/Hi |
| 9-Pivot Quicksort | 682.05 | 1.0000 | NO | 0.59 | 9 pivots, 10 buckets, binary classification |
| Quicksort (Recursive Ninther) | 645.39 | 1.0000 | YES | 1.33 | Pivot = median of three recursive ninthers |
| 32-ary Heap Sort | 2184.15 | 1.0000 | YES | 1.45 | d=32, continues the arity trend |
| 64-way Merge Sort | 558.02 | 1.0000 | NO | 0.23 | k=64 tournament, batch runtime leader |
| 3/4 Enhanced-Gap Shellsort | 770.28 | 1.0000 | YES | 0.49 | IJARCS enhanced gap sequence 3g/4 |
| Weight-Balanced Tree Sort | 540.78 | 1.0000 | YES | 1.22 | Baer 1973 WBT, Δ=1+√2, Γ=2 |
| Baka Sort | 668.89 | 1.0000 | YES | skip | Bogo family: swap random item to head |
| Nibi Sort | 786.13 | 0.9995 | YES | skip | Bogo family: swap random item to tail |
| Slice Bogo Sort | 802.06 | 1.0000 | YES | skip | Bogo family: shuffle a random sub-slice |
| Boto Sort | 806.85 | 1.0000 | YES | skip | Bogo family: reverse a random sub-slice |
| True Pancake Bogo Sort | 817.75 | 1.0000 | YES | skip | Bogo family: flip a random prefix |
| Bowo Sort | 801.04 | 1.0000 | YES | skip | Bogo family: rotate a random prefix |
| Pancake Bogosort | 657.42 | 1.0000 | YES | skip | Flanlaina's deterministic pancake bogo |

## Production Knee Still Unchanged

- **Ford-Johnson (Quick)** at 526.95 battles, τ=1.0, NO duplicates remains best no-duplicate.
- **64-way Merge Sort** at 558.02 is the best new no-duplicate row, next to 8-way Merge (547.04) and 16-way Merge (548.75) in the k-way family.
- **9-Pivot Quicksort** at 682.05 is the best new no-duplicate quicksort.
- The timsort family (Timsort 532.54, Pythonsort 537.83, Java TimSort 554.25 — all with duplicates) shows galloping and the JDK's trims cost comparisons in the pure-comparison model.
- The seven new bogo variants land at 657.42–817.75 battles with τ≈1.0 like the registered bogo family (random comparisons saturate the transitive closure before the iteration cap).
- Runtime benchmark (N=200): 64-way Merge (0.23 ms) leads the no-duplicate rows, followed by Insertion (0.26 ms), Binary Gnome (0.29 ms), Binary Insertion (0.31 ms), Tree Sort (0.32 ms).

## Files

- `research/sort_analysis.js` — 256 providers, simulate() with transitive reachability
- `research/results.txt` — N=100, 250 trials battle benchmark (fresh run 2026-09-13 batch 9)
- `research/audit_results.txt` — 489 runs per provider correctness audit (256 providers, all pass except pre-existing Slowsort timeout at N=127)
- `research/runtime_results.txt` — N=200, 10 trials wall-clock (bogo rows skipped for N>20)
- `research/benchmark_runtime.js` — runtime harness
- `ANALYSIS.md` — Pareto table, methodology, rerun notes
- `research/CANDIDATE_ALGORITHMS.md` — fidelity notes, sources, and rejections per batch

## Reproducibility

```bash
node research/sort_analysis.js 100 250 > research/results.txt
node research/audit_correctness.js > research/audit_results.txt
node research/benchmark_runtime.js 200 10 > research/runtime_results.txt
```

All providers are comparison-based (no key/digit inspection). Where hardware or distribution logic has no battle analogue, stable buffers / free rotations stand in; comparison trace is faithful to comparator decisions.
