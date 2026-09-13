# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the benchmarking and analysis used to optimize the pair-generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared **256 registered sorting providers**. The suite includes the 25-algorithm third web expansion, a fixed-profile **VQSort (u64/AVX2 model)** provider, a 24-algorithm fourth web expansion, a 20-algorithm fifth web expansion, a 17-algorithm sixth web expansion (Wave Sort, co-ranking mergesort, Bentley-McIlroy quicksort, length-adaptive Shivers, Rouge, adaptive binary insertion, 11 Shell gaps), a 4-algorithm seventh expansion (Multizip, Modified Bitonic, Link, Stable Cyclesort), a 32-algorithm eighth expansion (7/8/16-ary heaps, 16/32-way merges, 4-pivot/Lomuto/Yaroslavskiy quicksorts, winner-tree/unbalanced merges, α-stack/α-merge, Sedgewick 1973/Pratt 2x3x5 shells, optimal/insertion/selection networks, Worst/Spaghetti/Bead/Flash/Proxmap/Interpolation/Ska/Spreadsort ports, Flansort/True Flansort/Logsort/Creasesort/Foldsort/Soheil/Corsort), and a **15-algorithm ninth expansion** (Pythonsort, Java TimSort, 9-Pivot Quicksort, Quicksort (Recursive Ninther), 32-ary Heap Sort, 64-way Merge Sort, 3/4 Enhanced-Gap Shellsort, Weight-Balanced Tree Sort, and the bogo family Baka/Nibi/Slice Bogo/Boto/True Pancake Bogo/Bowo/Pancake Bogosort). VQSort is deliberately measured only at the comparison level; this is not a SIMD-throughput benchmark. The source and fidelity matrix is in [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md), with correctness details in [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md) and runtime in [research/runtime_results.txt](research/runtime_results.txt). Algorithms that request duplicate pairs are identified and excluded from the Pareto-optimal analysis so that the production choice reflects unique human decisions.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Run command:** `node research/sort_analysis.js 100 250`
- **Metric:** average number of unique battles and average Kendall Tau against randomly generated ground-truth strengths.
- **Rerun note (2026-09-03):** a correctness audit of all 85 providers ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)) fixed Intro Sort (mixed comparison orientations between its partition/insertion/heapsort branches), Tournament Sort (dropped the weakest element), and Hayate-Shiki (inverted merge comparator; Kendall Tau improves from 0.8426 to 1.0000). "Radix Sort" — which was not a radix sort — was replaced by a faithful **Binary Quicksort**, "Smooth Sort" was relabeled **Heap Sort (Smooth Proxy)**, and Silly Sort now performs the actual silly recursion. Rows for these six algorithms were re-measured with the same protocol; all other rows are retained from the original run (each algorithm is simulated independently). The Pareto frontier and the Ford-Johnson knee point are unchanged.
- **Rerun note (2026-09-11, batch 2):** expansion to 118 providers (32 implementations plus Bozo registration). See the retained batch-2 addendum in [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md) for the complete list and fidelity audit.
- **Rerun note (2026-09-11, batch 3):** another broad web sweep added 25 providers: Stable Selection, Double Insertion, 3-Smooth Comb, three Shell gap sequences, four heap-family sorts plus Poplar, MEL, Twinsort, Spin, Weave Merge, QuickMergesort, 4-way Powersort, Loser-Tree Merge, GrailSort, WikiSort, Fluxsort, Crumsort, Glidesort, Blitsort, and Optimized Pancake. All additions sort correctly in 489/489 differential-audit runs. Modern algorithms whose branchless moves, cache layout, or rotations are not battle-observable are explicitly labeled comparison ports/skeletons in the research docs.
- **Rerun note (2026-09-12, VQSort):** added `VQSort (u64/AVX2 model)`. The provider fixes the profile to 64-bit keys and four AVX2 lanes, exposing Highway's six-chunk pivot sampler, exact architecture-selected sorting networks, lane-to-pivot decisions, recursion, and the paper's degenerate safeguard as serial battles. It cannot reproduce SIMD concurrency, `CompressStore`, cache behavior, or instruction throughput. VQSort passed 489/489 audit runs and measured 656.02 battles, τ=1.0000, duplicates YES.
- **Rerun note (2026-09-12, batch 4):** a fourth wild-web sweep added **24** providers — Cocktail Bogo, Comparison Counting Sort, four more Shell gap sequences (Original, Hibbard, Ciura, Gonnet), 5-ary Heap, 8-way Merge, QuickHeapsort, JSort, Drop-Merge Sort, Split Sort, Vergesort, Neatsort, 3-way Powersort, the Pairwise Sorting Network, Shuffle Sort, Binary Cocktail, Skew/Leftist/Binomial Heap sorts, AVL/Red-Black Tree sorts, and Triplet Merge-Insertion — and freshly re-measured all 168 rows. All 24 pass the 489/489 differential audit (Cocktail Bogo capped at N ≤ 5 like the other bogo rows). The best new no-duplicate row is 8-way Merge Sort at 547.73, still behind Ford-Johnson, so the Pareto frontier and the Ford-Johnson knee point are unchanged.
- **Rerun note (2026-09-13, batch 5; current table):** a fifth wild-web sweep added **20** providers — Knuth, Papernov-Stasevich and Fibonacci Shellsorts, Pairing and Fibonacci Heaps, B-Tree, AA Tree and Scapegoat Tree sorts, Brick Sorting Network, Super Scalar Sample Sort and IPS⁴o, SqrtSort, Octosort, Cubesort, Gridsort, Slab Sort, Adaptive Heap Sort, Cascade and Oscillating Merge sorts, and 6-ary Heap Sort — and freshly re-measured all **188** rows. All 20 pass the 489/489 differential audit. The best new no-duplicate rows are Oscillating Merge Sort at **600.28**, Pairing Heap at **745.90** and SqrtSort at **793.64**, all still behind Ford-Johnson, so the Pareto frontier and production knee remain unchanged.
- **Rerun note (2026-09-13, batch 6):** a sixth sweep added **17** providers — Wave Sort, Co-ranking In-place Mergesort, Bentley-McIlroy Quicksort, length-adaptive Shivers Sort, Rouge Sort, Adaptive Binary Insertion, and 11 new Shellsort gap families (ORLP25, Sedgewick 1982, Pardons 2009, C16/3+1, Lee Improved Tokuda, Tokuda Good Gaps, Extended Ciura, Pratt 5x8, Incerpi-Sedgewick, Frank-Lazarus, Split Ratio) — and freshly re-measured all **205** rows. All 17 pass the 489/489 audit. Best new no-duplicate is Wave Sort at 553.42.
- **Rerun note (2026-09-13, batch 7):** a seventh sweep added **4** providers — Multizip Sort, Modified Bitonic Sort, Link Sort, Stable Cyclesort — bringing total to **209**. All 4 pass audit.
- **Rerun note (2026-09-13, batch 8; current table):** an eighth wild-web sweep added **32** providers — 7/8/16-ary heaps, 16/32-way merges, 4-pivot/Lomuto/Yaroslavskiy quicksorts, winner-tree/unbalanced merges, α-stack/α-merge, Sedgewick 1973/Pratt 2x3x5 shells, optimal/insertion/selection networks, Worst/Spaghetti/Bead/Flash/Proxmap/Interpolation/Ska/Spreadsort ports, Flansort/True Flansort/Logsort/Creasesort/Foldsort/Soheil/Corsort — and freshly re-measured all **241** rows. All 32 pass the 489/489 differential audit. Best new no-duplicate rows are **Interpolation Sort at 531.02**, **16-way Merge at 548.52**, **32-way Merge at 558.37**, **Winner-Tree Merge at 601.01**, **4-Pivot at 656.26**, and **True Flansort at 708.53** — all still behind Ford-Johnson at 527.02, so production knee unchanged. Runtime benchmark (N=200, 10 trials) in research/runtime_results.txt shows interpolation and 16-way among fastest wall-clock no-duplicate merges.
- **Rerun note (2026-09-13, batch 9; current table):** a ninth wild-web sweep added **15** providers — Pythonsort (CPython's galloping timsort), Java TimSort (JDK timsort), 9-Pivot Quicksort, Quicksort (Recursive Ninther), 32-ary Heap Sort, 64-way Merge Sort, 3/4 Enhanced-Gap Shellsort, Weight-Balanced Tree Sort, and seven neo-sorting-wiki bogo variants (Baka, Nibi, Slice Bogo, Boto, True Pancake Bogo, Bowo, Pancake Bogosort) — and freshly re-measured all **256** rows. All 15 pass the 489/489 differential audit (bogo rows capped at N ≤ 8 / N ≤ 6 like their registered cousins). Best new no-duplicate rows are **64-way Merge Sort at 558.02** and **9-Pivot Quicksort at 682.05**, both still behind Ford-Johnson at 526.95, so the production knee is unchanged. Pythonsort (537.83, duplicates YES) sits just above the plain registered Timsort — galloping trades moves for comparisons, which costs battles in this pure-comparison model. Runtime benchmark (N=200, 10 trials) in research/runtime_results.txt shows 64-way Merge (0.23 ms) among the fastest wall-clock no-duplicate rows.

### Results (N=100)

| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
|-----------|-------------|-----------------|------------|---------------|
| Intelligent Design | 0.00 | 0.0014 | NO | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0038 | NO | Dominated |
| Exit Sort | 0.00 | -0.0001 | NO | Pareto-optimal |
| Sleep Sort | 0.00 | -0.0046 | NO | Dominated |
| Permutation Sort | 1.68 | 0.0081 | YES | Dominated |
| Quantum Bogo | 1.81 | -0.0004 | NO | Pareto-optimal |
| BogoBogoSort | 26.25 | 0.0080 | YES | Pareto-optimal |
| Stalin Sort | 99.00 | 0.0384 | NO | Pareto-optimal |
| Thanos Sort | 99.00 | 0.5015 | YES | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5005 | NO | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3520 | NO | Dominated |
| Hater Sort | 187.88 | 0.5602 | YES | Pareto-optimal |
| Silly Sort | 201.17 | 0.1162 | YES | Dominated |
| Random Sort | 214.56 | 0.5630 | YES | Pareto-optimal |
| Budgeted Merge Sort | 520.00 | 0.9643 | NO | Pareto-optimal |
| Ford-Johnson (Quick) | 526.95 | 1.0000 | NO | **Production knee** |
| Interpolation Sort | 530.13 | 1.0000 | NO | Dominated |
| Binary Insertion | 530.28 | 1.0000 | NO | Dominated |
| Binary Gnome | 530.34 | 1.0000 | NO | Dominated |
| Recursive Binary Insertion | 530.36 | 1.0000 | NO | Dominated |
| Binary Cocktail | 530.50 | 1.0000 | YES | Dominated |
| Timsort | 532.54 | 1.0000 | YES | Dominated |
| Pythonsort | 537.83 | 1.0000 | YES | Dominated |
| AVL Tree Sort | 537.98 | 1.0000 | YES | Dominated |
| Library Sort | 538.53 | 1.0000 | YES | Dominated |
| Weight-Balanced Tree Sort | 540.78 | 1.0000 | YES | Dominated |
| Merge Sort | 541.77 | 1.0000 | NO | Dominated |
| In-place Merge Sort | 541.96 | 1.0000 | NO | Dominated |
| AA Tree Sort | 543.74 | 1.0000 | YES | Dominated |
| 4-way Merge Sort | 543.84 | 1.0000 | NO | Dominated |
| Red-Black Tree Sort | 544.00 | 1.0000 | YES | Dominated |
| B-Tree Sort | 544.45 | 1.0000 | YES | Dominated |
| 8-way Merge Sort | 547.04 | 1.0000 | NO | Dominated |
| 16-way Merge Sort | 548.75 | 1.0000 | NO | Dominated |
| Flansort | 550.04 | 1.0000 | YES | Dominated |
| Java TimSort | 554.25 | 1.0000 | YES | Dominated |
| Wave Sort | 554.28 | 1.0000 | NO | Dominated |
| Tournament Sort | 557.62 | 1.0000 | NO | Dominated |
| Powersort | 557.64 | 1.0000 | YES | Dominated |
| Bottom-up Merge Sort | 557.88 | 1.0000 | NO | Dominated |
| 32-way Merge Sort | 557.98 | 1.0000 | NO | Dominated |
| 64-way Merge Sort | 558.02 | 1.0000 | NO | Dominated |
| Parallel Merge Sort | 558.30 | 1.0000 | NO | Dominated |
| Multizip Sort | 558.62 | 1.0000 | NO | Dominated |
| Ping-pong Merge Sort | 558.68 | 1.0000 | NO | Dominated |
| Optimized Pancake | 561.88 | 1.0000 | YES | Dominated |
| Quicksort (Ninther) | 562.52 | 1.0000 | YES | Dominated |
| 3-way Merge Sort | 567.00 | 1.0000 | NO | Dominated |
| Bentley-McIlroy Quicksort | 568.75 | 1.0000 | YES | Dominated |
| Shivers Sort (length-adaptive) | 569.90 | 1.0000 | YES | Dominated |
| 4-way Powersort | 570.60 | 1.0000 | YES | Dominated |
| Quadsort | 571.32 | 1.0000 | YES | Dominated |
| Adaptive Shivers | 572.53 | 1.0000 | YES | Dominated |
| Augmented Shivers | 574.07 | 1.0000 | YES | Dominated |
| Natural Merge Sort | 574.86 | 1.0000 | YES | Dominated |
| Shivers Sort | 575.23 | 1.0000 | YES | Dominated |
| Vergesort | 580.65 | 1.0000 | YES | Dominated |
| QuickMergesort | 580.69 | 1.0000 | YES | Dominated |
| Weak Heap | 580.92 | 1.0000 | YES | Dominated |
| Funnel Sort | 582.19 | 1.0000 | NO | Dominated |
| α-Stack Sort (α=2) | 584.17 | 1.0000 | YES | Dominated |
| GrailSort | 584.57 | 1.0000 | NO | Dominated |
| Slowsort | 585.36 | 0.9431 | YES | Dominated |
| 3-way Powersort | 585.48 | 1.0000 | YES | Dominated |
| Triplet Merge-Insertion | 591.56 | 1.0000 | YES | Dominated |
| QuickHeapsort | 591.58 | 1.0000 | YES | Dominated |
| Binomial Heap Sort | 593.14 | 1.0000 | YES | Dominated |
| Twinsort | 593.30 | 1.0000 | YES | Dominated |
| Piposort | 599.75 | 1.0000 | YES | Dominated |
| Bottom-up Heap | 600.34 | 1.0000 | YES | Dominated |
| Loser-Tree Merge | 600.81 | 1.0000 | NO | Dominated |
| Winner-Tree Merge Sort | 601.30 | 1.0000 | NO | Dominated |
| Oscillating Merge Sort | 601.68 | 1.0000 | NO | Dominated |
| Fluxsort | 602.18 | 1.0000 | YES | Dominated |
| Triple-Pivot Quicksort | 603.26 | 1.0000 | YES | Dominated |
| Adaptive Binary Insertion | 610.80 | 1.0000 | YES | Dominated |
| Cubesort | 610.83 | 1.0000 | YES | Dominated |
| WikiSort | 613.16 | 1.0000 | YES | Dominated |
| Binary Patience | 613.52 | 1.0000 | YES | Dominated |
| Scapegoat Tree Sort | 617.72 | 1.0000 | YES | Dominated |
| ORLP25 Shellsort | 627.53 | 1.0000 | YES | Dominated |
| Batcher Odd-Even | 627.73 | 1.0000 | YES | Dominated |
| Extended Ciura Shellsort | 629.25 | 1.0000 | YES | Dominated |
| Incerpi-Sedgewick Shellsort | 629.53 | 1.0000 | YES | Dominated |
| Lee Improved Tokuda Shellsort | 629.67 | 1.0000 | YES | Dominated |
| Shellsort | 630.62 | 1.0000 | YES | Dominated |
| Ciura Shellsort | 630.68 | 1.0000 | YES | Dominated |
| Fibonacci Shellsort | 631.26 | 1.0000 | YES | Dominated |
| Recursive Shellsort | 631.46 | 1.0000 | YES | Dominated |
| Tokuda Shellsort | 631.58 | 1.0000 | YES | Dominated |
| Gonnet Shellsort | 631.83 | 1.0000 | YES | Dominated |
| Sedgewick 1973 Shellsort | 631.90 | 1.0000 | YES | Dominated |
| Split Ratio Shellsort | 632.14 | 1.0000 | YES | Dominated |
| Tokuda Good Gaps Shellsort | 632.45 | 1.0000 | YES | Dominated |
| Frank-Lazarus Shellsort | 635.12 | 1.0000 | YES | Dominated |
| Glidesort | 637.78 | 1.0000 | YES | Dominated |
| Hibbard Shellsort | 638.52 | 1.0000 | YES | Dominated |
| Knuth Shellsort | 638.71 | 1.0000 | YES | Dominated |
| Sample Sort | 639.29 | 1.0000 | YES | Dominated |
| Stable Quicksort | 641.88 | 1.0000 | NO | Dominated |
| Bead (Gravity) Sort | 642.62 | 1.0000 | YES | Dominated |
| Quicksort (Middle) | 643.54 | 1.0000 | NO | Dominated |
| Quicksort (LTR) | 644.98 | 1.0000 | NO | Dominated |
| 3-Way Quicksort | 645.32 | 1.0000 | NO | Dominated |
| Quicksort (Recursive Ninther) | 645.39 | 1.0000 | YES | Dominated |
| Cartesian Tree | 646.88 | 1.0000 | YES | Dominated |
| Quicksort (Random) | 646.97 | 1.0000 | NO | Dominated |
| Comparison Counting Sort | 647.12 | 1.0000 | YES | Dominated |
| Original Shell Sort | 647.18 | 1.0000 | YES | Dominated |
| Tree Sort | 648.07 | 1.0000 | NO | Dominated |
| Dual-Pivot Quicksort | 649.17 | 1.0000 | NO | Dominated |
| Treap Sort | 649.81 | 1.0000 | NO | Dominated |
| Cycle Sort | 649.84 | 1.0000 | YES | Dominated |
| Stable Cyclesort | 650.18 | 1.0000 | YES | Dominated |
| Binary Quicksort | 650.59 | 1.0000 | NO | Dominated |
| Quicksort (Hoare) | 651.53 | 1.0000 | YES | Dominated |
| 4-Pivot Quicksort | 651.62 | 1.0000 | NO | Dominated |
| Quicksort (RTL) | 653.20 | 1.0000 | NO | Dominated |
| Parallel Quicksort | 654.03 | 1.0000 | NO | Dominated |
| Pratt 5x8 Shellsort | 654.60 | 1.0000 | YES | Dominated |
| VQSort (u64/AVX2 model) | 656.48 | 1.0000 | YES | Dominated |
| Pancake Bogosort | 657.42 | 1.0000 | YES | Dominated |
| Papernov-Stasevich Shellsort | 657.86 | 1.0000 | YES | Dominated |
| Sedgewick Shellsort | 659.71 | 1.0000 | YES | Dominated |
| Ska Sort | 666.81 | 1.0000 | YES | Dominated |
| Baka Sort | 668.89 | 1.0000 | YES | Dominated |
| Splay Sort | 670.16 | 1.0000 | NO | Dominated |
| Binary Shell | 672.44 | 1.0000 | YES | Dominated |
| BFPRT Quicksort | 674.70 | 1.0000 | YES | Dominated |
| Quicksort (Mo3) | 675.41 | 1.0000 | YES | Dominated |
| Circle Sort | 676.64 | 1.0000 | YES | Dominated |
| Yaroslavskiy Quicksort | 677.28 | 1.0000 | YES | Dominated |
| Fibonacci Heap Sort | 677.51 | 1.0000 | YES | Dominated |
| Replacement Selection | 681.32 | 1.0000 | YES | Dominated |
| 9-Pivot Quicksort | 682.05 | 1.0000 | NO | Dominated |
| Polyphase Merge | 684.07 | 1.0000 | YES | Dominated |
| Cascade Merge Sort | 684.67 | 1.0000 | YES | Dominated |
| Skiplist Sort | 685.46 | 1.0000 | YES | Dominated |
| Out-of-place Heap | 686.88 | 1.0000 | YES | Dominated |
| Stooge Sort | 689.08 | 1.0000 | YES | Dominated |
| Cocktail Bogo | 692.98 | 1.0000 | YES | Dominated |
| Bose-Nelson | 693.17 | 1.0000 | YES | Dominated |
| Ternary Heap | 694.28 | 1.0000 | YES | Dominated |
| Weave Merge | 698.93 | 1.0000 | YES | Dominated |
| Gridsort | 700.24 | 1.0000 | YES | Dominated |
| PESort | 701.96 | 1.0000 | YES | Dominated |
| Lomuto Quicksort | 707.02 | 1.0000 | NO | Dominated |
| True Flansort | 709.82 | 1.0000 | NO | Dominated |
| Pairwise Sorting Network | 712.54 | 1.0000 | YES | Dominated |
| Quaternary Heap | 713.71 | 1.0000 | YES | Dominated |
| Rotation Merge Sort | 715.24 | 1.0000 | NO | Dominated |
| Heap Sort (Smooth Proxy) | 716.77 | 1.0000 | YES | Dominated |
| Heap Sort | 717.08 | 1.0000 | YES | Dominated |
| Peeksort | 718.89 | 1.0000 | YES | Dominated |
| BlockQuicksort | 720.66 | 1.0000 | NO | Dominated |
| Recursive Comb Sort | 721.11 | 1.0000 | YES | Dominated |
| Comb Sort | 721.42 | 1.0000 | YES | Dominated |
| Intro Sort | 721.50 | 1.0000 | NO | Dominated |
| Sedgewick 1982 Shellsort | 722.50 | 1.0000 | YES | Dominated |
| Co-ranking In-place Mergesort | 723.10 | 1.0000 | YES | Dominated |
| Blitsort | 723.32 | 1.0000 | YES | Dominated |
| PDQSort | 732.97 | 1.0000 | YES | Dominated |
| Neatsort | 733.86 | 1.0000 | YES | Dominated |
| Crumsort | 736.06 | 1.0000 | YES | Dominated |
| Min-Max Heap | 744.61 | 1.0000 | YES | Dominated |
| Pairing Heap Sort | 745.07 | 1.0000 | NO | Dominated |
| Split Sort | 758.96 | 1.0000 | YES | Dominated |
| Poplar Sort | 759.89 | 1.0000 | YES | Dominated |
| Bucket Sort | 761.03 | 1.0000 | NO | Dominated |
| Creasesort | 761.31 | 1.0000 | YES | Dominated |
| Drop-Merge Sort | 761.52 | 1.0000 | YES | Dominated |
| Modified Bitonic Sort | 762.44 | 1.0000 | YES | Dominated |
| Foldsort | 763.21 | 1.0000 | YES | Dominated |
| Bitonic Sort | 764.70 | 1.0000 | YES | Dominated |
| 3/4 Enhanced-Gap Shellsort | 770.28 | 1.0000 | YES | Dominated |
| Smoothsort | 773.85 | 1.0000 | YES | Dominated |
| C16/3+1 Shellsort | 775.90 | 1.0000 | YES | Dominated |
| 5-ary Heap Sort | 776.18 | 1.0000 | YES | Dominated |
| JSort | 780.93 | 1.0000 | YES | Dominated |
| Bozo Sort | 785.74 | 1.0000 | YES | Dominated |
| Leftist Heap Sort | 786.08 | 1.0000 | NO | Dominated |
| Pardons 2009 Shellsort | 786.09 | 1.0000 | YES | Dominated |
| Nibi Sort | 786.13 | 0.9995 | YES | Dominated |
| Binary Merge | 788.94 | 1.0000 | NO | Dominated |
| SqrtSort | 794.62 | 1.0000 | NO | Dominated |
| Bovo Sort | 797.18 | 1.0000 | YES | Dominated |
| Proxmap Sort | 800.92 | 1.0000 | YES | Dominated |
| Bowo Sort | 801.04 | 1.0000 | YES | Dominated |
| Slice Bogo Sort | 802.06 | 1.0000 | YES | Dominated |
| Exchange Bogo | 805.66 | 1.0000 | YES | Dominated |
| Shear Sort | 806.62 | 1.0000 | YES | Dominated |
| Boto Sort | 806.85 | 1.0000 | YES | Dominated |
| Bogosort | 808.55 | 1.0000 | YES | Dominated |
| Full Rank | 808.72 | 1.0000 | NO | Dominated |
| Skew Heap Sort | 809.82 | 1.0000 | NO | Dominated |
| True Pancake Bogo Sort | 817.75 | 1.0000 | YES | Dominated |
| Spreadsort | 818.22 | 1.0000 | YES | Dominated |
| 6-ary Heap Sort | 819.12 | 1.0000 | YES | Dominated |
| Unbalanced Merge Sort | 821.35 | 1.0000 | NO | Dominated |
| Pratt Shellsort | 828.10 | 1.0000 | YES | Dominated |
| 3-Smooth Comb | 831.52 | 1.0000 | YES | Dominated |
| Binary Bottom-up Merge | 841.08 | 1.0000 | NO | Dominated |
| Logsort | 843.50 | 1.0000 | YES | Dominated |
| 7-ary Heap Sort | 851.75 | 1.0000 | YES | Dominated |
| Flashsort | 853.30 | 1.0000 | YES | Dominated |
| Less Bogo | 879.46 | 1.0000 | YES | Dominated |
| Spin Sort | 883.12 | 1.0000 | NO | Dominated |
| 8-ary Heap Sort (2) | 883.94 | 1.0000 | YES | Dominated |
| Pratt 2x3x5 Shellsort | 992.30 | 1.0000 | YES | Dominated |
| Patience Sort | 1008.30 | 1.0000 | YES | Dominated |
| Super Scalar Sample Sort | 1017.06 | 1.0000 | YES | Dominated |
| Hayate-Shiki | 1018.95 | 1.0000 | YES | Dominated |
| Octosort | 1021.70 | 1.0000 | NO | Dominated |
| Adaptive Heap Sort | 1101.25 | 1.0000 | YES | Dominated |
| Slab Sort | 1115.42 | 1.0000 | YES | Dominated |
| Strand Sort | 1125.92 | 1.0000 | YES | Dominated |
| MEL Sort | 1173.06 | 1.0000 | YES | Dominated |
| Pancake Sort | 1258.51 | 1.0000 | YES | Dominated |
| IPS⁴o Sort | 1360.56 | 1.0000 | YES | Dominated |
| 16-ary Heap Sort | 1447.08 | 1.0000 | YES | Dominated |
| α-Merge Sort (α=2) | 1509.41 | 1.0000 | YES | Dominated |
| Double Insertion | 1774.56 | 1.0000 | YES | Dominated |
| Cocktail Selection | 2108.56 | 1.0000 | YES | Dominated |
| 32-ary Heap Sort | 2184.15 | 1.0000 | YES | Dominated |
| Selection Sort | 2203.70 | 1.0000 | YES | Dominated |
| Bingo Sort | 2220.66 | 1.0000 | YES | Dominated |
| Recursive Selection | 2223.32 | 1.0000 | YES | Dominated |
| Recursive Double Selection | 2336.46 | 1.0000 | YES | Dominated |
| Double Selection | 2354.86 | 1.0000 | YES | Dominated |
| Rouge Sort | 2471.16 | 1.0000 | YES | Dominated |
| Recursive Insertion | 2552.85 | 1.0000 | NO | Dominated |
| Recursive Bubble | 2553.14 | 1.0000 | YES | Dominated |
| Exchange Sort | 2558.33 | 1.0000 | YES | Dominated |
| Shuffle Sort | 2560.74 | 1.0000 | YES | Dominated |
| Spaghetti (Poll) Sort | 2561.24 | 1.0000 | YES | Dominated |
| Link Sort | 2563.58 | 1.0000 | YES | Dominated |
| Soheil Sort | 2564.72 | 1.0000 | YES | Dominated |
| Optimal Sorting Network | 2566.68 | 1.0000 | YES | Dominated |
| Bubble Sort | 2568.80 | 1.0000 | YES | Dominated |
| Recursive Gnome | 2569.03 | 1.0000 | YES | Dominated |
| Selection Sorting Network | 2569.11 | 1.0000 | YES | Dominated |
| Stable Selection | 2569.83 | 1.0000 | YES | Dominated |
| Cocktail Bounds | 2570.04 | 1.0000 | YES | Dominated |
| Gnome Sort | 2571.88 | 1.0000 | YES | Dominated |
| Worst Sort | 2573.32 | 1.0000 | NO | Dominated |
| Insertion Sort | 2575.45 | 1.0000 | NO | Dominated |
| Insertion Sorting Network | 2577.30 | 1.0000 | YES | Dominated |
| Corsort | 2579.53 | 1.0000 | YES | Dominated |
| I Can't Believe It Can Sort | 2586.46 | 1.0000 | YES | Dominated |
| Cocktail Shaker | 2591.82 | 1.0000 | YES | Dominated |
| Recursive Cocktail | 2598.18 | 1.0000 | YES | Dominated |
| Brick Sorting Network | 2607.39 | 1.0000 | YES | Dominated |
| Odd-Even Sort | 2616.16 | 1.0000 | YES | Dominated |
| Recursive Odd-Even Sort | 2627.32 | 1.0000 | YES | Dominated |
| Odd-Even Bogo | 2627.67 | 1.0000 | YES | Dominated |
| Bubble Bogo | 2634.65 | 1.0000 | YES | Dominated |

### Key Insights
- **Best no-duplicate sorting:** Ford-Johnson (Quick) at 526.95 battles remains the production knee, with τ=1.0 and no duplicate pairs.
- **Best new no-duplicate (batch 9):** 64-way Merge Sort at 558.02 (next to 16-way 548.75 and 32-way 557.98 in the k-way family), then 9-Pivot Quicksort at 682.05 — all still behind Ford-Johnson.
- **Timsort family:** Pythonsort 537.83 (YES) vs Java TimSort 554.25 (YES) vs plain registered Timsort 532.54 (YES): galloping (CPython) and the JDK's gallop trims + directional merges add comparisons over the plain two-way merge in this pure-comparison model, while Java's shorter minRun (25 vs 50 at n=100) costs a further ~16 battles.
- **Heap arities:** 7-ary 851.75, 8-ary 883.94, 16-ary 1447.08, 32-ary 2184.15 show increasing comparisons with arity in this model.
- **Sorting networks:** Optimal 2566.68, Insertion 2577.30, Selection 2569.11, Spaghetti 2561.24, Worst 2573.32, Brick 2607.39, Soheil 2564.72, Corsort 2579.53 all cluster at ~2.5k battles, as expected for O(n²) fixed networks at n=100.
- **Flansort family:** Flansort 550.04 (duplicates YES) is best new adaptive but repeats pairs; True Flansort 709.82 no-duplicate.
- **Distribution ports:** Bead 642.62, Flashsort 853.30, Proxmap 800.92, Ska 666.81, Spreadsort 818.22, SqrtSort 794.62 etc. show distribution sorts pay overhead on random data.
- **New bogo family:** the seven neo-wiki variants (Baka 668.89, Pancake Bogosort 657.42, Nibi 786.13, Slice Bogo 802.06, Bowo 801.04, Boto 806.85, True Pancake Bogo 817.75) cluster with the registered bogo rows at ~650-820 battles with τ≈1.0 — their random comparisons saturate the transitive closure before the iteration cap, so the benchmark credits them for full knowledge while their items array is left unsorted.
- **Pareto frontier:** Exit Sort (0 battles, τ~0.001), Miracle Sort (99 battles, τ~0.5), Budgeted Merge (520 battles, τ~0.96), Ford-Johnson (526.95 battles, τ=1.0) remain the frontier.
- **Runtime vs battles:** Runtime benchmark (research/benchmark_runtime.js, N=200) shows wall-clock fastest no-duplicate are 64-way Merge (0.23 ms), Insertion (0.26 ms), Binary Gnome (0.29 ms), Binary Insertion (0.31 ms), Tree Sort (0.32 ms) — 64-way Merge is the batch-9 runtime leader, consistent with its k-way merge structure.

## 2. Convergence / Bradley-Terry analysis
- Same as previous: BT with prior 0.5, scale 400/log(10), transitive reachability via bitsets, duplicate detection via matchesMap.
- All 256 providers terminate within step cap for N=100, 250 trials (bogo-family rows end via the unique-battle saturation / iteration cap, as in all previous batches).

## 3. Wall-clock benchmark
- **Command:** `node research/benchmark_runtime.js 200 10`
- **Metric:** average ms to drive provider to completion with random oracle, N=200, 10 trials.
- **Result file:** research/runtime_results.txt
- **Top 10 fastest no-duplicate for N=200 (excluding joke non-sorting, batch-9 rerun):** 64-way Merge Sort 0.23 ms, Insertion Sort 0.26 ms, Binary Gnome 0.29 ms, Binary Insertion 0.31 ms, Tree Sort 0.32 ms, Oscillating Merge 0.34 ms, Interpolation Sort 0.35 ms, Multizip 0.43 ms, Tournament Sort 0.43 ms, Recursive Binary Insertion 0.43 ms. Full list in runtime_results.txt (bogo-family rows skipped for N=200 as in previous batches).

