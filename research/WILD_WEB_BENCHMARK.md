# Wild Web Sorting Benchmark — 241 Providers (N=100, 250 trials + Runtime N=200)

This report expands the PreferenceRank sorting benchmark beyond 209 providers to **241 providers** by sweeping the wild web for sorting algorithms from:

- Classic literature (Knuth, Sedgewick, Papernov-Stasevich, Hibbard, Pratt, etc.)
- Esoteric sorts (Bogosort family, Stalin/Thanos/Sleep/Solar Bitflip, Spaghetti Poll, Bead Gravity, Worst Sort, etc.)
- Modern adaptive (quadsort, fluxsort, crumsort, glidesort, blitsort, grailsort, wikisort, sqrt/octosort, cubesort/gridsort, VQSort model, wave sort, co-ranking mergesort, multizip, etc.)
- 2024-2026 papers (Wave Sort arXiv 2505.13552, Co-ranking arXiv 2509.24540, Corsort IJCAI 2024, etc.)
- Distribution ports (Flashsort, Proxmap, Interpolation, Ska, Spreadsort, SqrtSort, etc.)
- Heap arity variants (3-ary to 16-ary)
- K-way merges (3-way to 32-way)
- Shell gap families (Original, Hibbard, Ciura, Gonnet, Knuth, Papernov-Stasevich, Fibonacci, Tokuda, Sedgewick 1973/1982/1986, ORLP25, Pardons 2009, C16/3+1, Lee Improved Tokuda, Tokuda Good Gaps, Extended Ciura, Pratt 2^a3^b, Pratt 5x8, Pratt 2x3x5, Incerpi-Sedgewick, Frank-Lazarus, Split Ratio)
- Sorting networks (Bitonic, Modified Bitonic, Brick, Pairwise, Insertion, Selection, Optimal 3-10, Bose-Nelson, Batcher Odd-Even)
- Tree sorts (Tree, Cartesian, Treap, Splay, AVL, Red-Black, B-Tree, AA, Scapegoat, Skew Heap, Leftist Heap, Binomial, Pairing, Fibonacci, Adaptive Heap)
- Quicksort variants (RTL, LTR, Middle, Mo3, Ninther, Hoare, 3-way, Dual-pivot, Triple-pivot, Stable, BlockQuicksort, PDQSort, Lomuto, Yaroslavskiy, 4-pivot, Bentley-McIlroy, Binary Quicksort)
- Merge variants (Merge, Bottom-up, Natural, Ping-pong, 3/4/8/16/32-way, Rotation, In-place, Weave, QuickMerge, Powersort 3/4-way, Loser/Winner-tree, Grail, Wiki, Oscillating, Cascade, Polyphase, Drop-Merge, Split, Vergesort, Neatsort, Slab, Co-rank, Wave, Multizip, Unbalanced, α-stack, α-merge, Shivers length-adaptive, etc.)

## Methodology

- **Battle benchmark:** `node research/sort_analysis.js 100 250` — average unique battles (non-duplicate, non-transitive) and Kendall Tau vs random ground truth strengths, 250 trials per provider. Duplicates = provider asks same unordered pair >1 in at least one trial.
- **Correctness audit:** `node research/audit_correctness.js` — 489 deterministic runs per provider over N=2,3,4,5,7,8,9,15,16,17,31,32,33,50,63,64,65,100,127,128 with non-monotonic distinct strengths, checking valid pairs, termination within 5e6 steps, and sorted output.
- **Runtime benchmark:** `node research/benchmark_runtime.js 200 10` — wall-clock ms to drive provider to completion with random oracle, N=200, 10 trials.

## Results Summary (N=100, 250 trials) — Sorted by Battles

See `research/results.txt` for full 241 rows and `ANALYSIS.md` for Pareto analysis. Key new rows (Batch 8):

| Algorithm | Battles | Tau | Dup | Runtime N=200 ms | Notes |
|---|---|---|---|---|---|
| Interpolation Sort | 531.02 | 1.0000 | NO | 0.22 | Best new no-dup, binary-search insertion |
| 16-way Merge Sort | 548.52 | 1.0000 | NO | 0.67 | k=16 tournament |
| Flansort | 549.28 | 1.0000 | YES | 0.42 | Probabilistic O(n) moves, shuffle + library sort |
| 32-way Merge Sort | 558.37 | 1.0000 | NO | 0.74 | k=32 |
| α-Stack Sort (α=2) | 584.79 | 1.0000 | YES | 0.25 | α=2 stack invariant |
| Winner-Tree Merge Sort | 601.01 | 1.0000 | NO | 0.29 | Winner vs loser tree |
| Sedgewick 1973 Shellsort | 631.00 | 1.0000 | YES | 0.23 | Gaps 1,3,7,21,48... |
| Bead (Gravity) Sort | 647.97 | 1.0000 | YES | 3.13 | Comparison counting port |
| 4-Pivot Quicksort | 656.26 | 1.0000 | NO | 0.45 | 4 pivots, 5 buckets |
| Ska Sort | 667.93 | 1.0000 | YES | 0.98 | Radix hybrid port |
| Yaroslavskiy Quicksort | 675.27 | 1.0000 | YES | 0.52 | Java dual-pivot |
| True Flansort | 708.53 | 1.0000 | NO | 0.64 | No 3-way comps |
| Lomuto Quicksort | 713.10 | 1.0000 | NO | 0.69 | Lomuto partition |
| Creasesort | 762.76 | 1.0000 | YES | 0.57 | Sorting network same size as bitonic |
| Foldsort | 761.40 | 1.0000 | YES | 0.51 | Folded network |
| Proxmap Sort | 806.43 | 1.0000 | YES | 0.41 | Distribution port |
| Spreadsort | 819.82 | 1.0000 | YES | 0.55 | Hybrid radix port |
| Unbalanced Merge Sort | 823.94 | 1.0000 | NO | 0.62 | Sequential accumulation |
| Logsort | 842.65 | 1.0000 | YES | 1.41 | In-place stable quicksort |
| 7-ary Heap Sort | 848.22 | 1.0000 | YES | 0.72 | d=7 |
| Flashsort | 851.71 | 1.0000 | YES | 0.60 | Distribution |
| 8-ary Heap Sort (2) | 886.78 | 1.0000 | YES | 0.50 | d=8 |
| Pratt 2x3x5 Shellsort | 986.09 | 1.0000 | YES | 0.86 | 2^a3^b5^c |
| 16-ary Heap Sort | 1457.23 | 1.0000 | YES | 0.56 | d=16 |
| α-Merge Sort (α=2) | 1517.33 | 1.0000 | YES | 1.40 | α-merge |
| Insertion Sorting Network | 2564.66 | 1.0000 | YES | 1.36 | Fixed network |
| Spaghetti (Poll) Sort | 2565.61 | 1.0000 | YES | 1.61 | Analog poll |
| Worst Sort | 2570.42 | 1.0000 | NO | 1.10 | Pessimal, perms for n<=6 |
| Selection Sorting Network | 2581.53 | 1.0000 | YES | 1.33 | Fixed network |
| Optimal Sorting Network | 2589.00 | 1.0000 | YES | 1.29 | Insertion fallback |
| Soheil Sort | 2589.38 | 1.0000 | YES | 1.14 | Early-exit insertion |
| Corsort | 2594.54 | 1.0000 | YES | 2.26 | Anytime, most-informative pair |

## Production Knee Still Unchanged

- **Ford-Johnson (Quick)** at 527.02 battles, τ=1.0, NO duplicates remains best no-duplicate.
- **Interpolation Sort** at 531.02 is closest new no-duplicate, just above Binary Insertion 530.51.
- **8-way Merge** at 546.97 and **16-way Merge** at 548.52 are next best no-duplicate merges.
- All sorting networks and esoteric sorts cluster at ~2.5k battles (O(n²) at n=100) or higher, as expected.
- Runtime benchmark shows similar ordering: interpolation, α-stack, winner-tree, oscillating merge are fastest wall-clock no-duplicate for N=200.

## Files

- `research/sort_analysis.js` — 241 providers, simulate() with transitive reachability
- `research/results.txt` — N=100, 250 trials battle benchmark (fresh run 2026-09-13 batch 8)
- `research/audit_results.txt` — 489 runs per provider correctness audit (241 providers, all pass except pre-existing Slowsort timeout at N=127)
- `research/runtime_results.txt` — N=200, 10 trials wall-clock
- `research/benchmark_runtime.js` — runtime harness
- `ANALYSIS.md` — Pareto table, methodology, rerun notes
- `research/CANDIDATE_ALGORITHMS.md` — fidelity notes, sources per batch

## Reproducibility

```bash
node research/sort_analysis.js 100 250 > research/results.txt
node research/audit_correctness.js > research/audit_results.txt
node research/benchmark_runtime.js 200 10 > research/runtime_results.txt
```

All providers are comparison-based (no key/digit inspection). Where hardware or distribution logic has no battle analogue, stable buffers / free rotations stand in; comparison trace is faithful to comparator decisions.
