# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the benchmarking and analysis used to optimize the pair-generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared **241 registered sorting providers**. The suite includes the 25-algorithm third web expansion, a fixed-profile **VQSort (u64/AVX2 model)** provider, a 24-algorithm fourth web expansion, a 20-algorithm fifth web expansion, a 17-algorithm sixth web expansion (Wave Sort, co-ranking mergesort, Bentley-McIlroy quicksort, length-adaptive Shivers, Rouge, adaptive binary insertion, 11 Shell gaps), a 4-algorithm seventh expansion (Multizip, Modified Bitonic, Link, Stable Cyclesort), and a **32-algorithm eighth expansion** (7/8/16-ary heaps, 16/32-way merges, 4-pivot/Lomuto/Yaroslavskiy quicksorts, winner-tree/unbalanced merges, α-stack/α-merge, Sedgewick 1973/Pratt 2x3x5 shells, optimal/insertion/selection networks, Worst/Spaghetti/Bead/Flash/Proxmap/Interpolation/Ska/Spreadsort ports, Flansort/True Flansort/Logsort/Creasesort/Foldsort/Soheil/Corsort). VQSort is deliberately measured only at the comparison level; this is not a SIMD-throughput benchmark. The source and fidelity matrix is in [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md), with correctness details in [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md) and runtime in [research/runtime_results.txt](research/runtime_results.txt). Algorithms that request duplicate pairs are identified and excluded from the Pareto-optimal analysis so that the production choice reflects unique human decisions.

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

### Results (N=100)

| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
|-----------|-------------|-----------------|------------|---------------|
| Intelligent Design | 0.00 | 0.0028 | NO | Pareto-optimal |
| Socialist Sort | 0.00 | -0.0010 | NO | Dominated |
| Exit Sort | 0.00 | -0.0017 | NO | Pareto-optimal |
| Sleep Sort | 0.00 | -0.0012 | NO | Dominated |
| Quantum Bogo | 1.68 | 0.0040 | NO | Pareto-optimal |
| Permutation Sort | 1.69 | -0.0010 | YES | Dominated |
| BogoBogoSort | 25.97 | 0.0057 | YES | Pareto-optimal |
| Stalin Sort | 99.00 | 0.0300 | NO | Pareto-optimal |
| Thanos Sort | 99.00 | 0.4923 | YES | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5012 | NO | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3305 | NO | Dominated |
| Hater Sort | 187.70 | 0.5634 | YES | Pareto-optimal |
| Silly Sort | 200.60 | 0.1296 | YES | Dominated |
| Random Sort | 220.83 | 0.5740 | YES | Pareto-optimal |
| Budgeted Merge Sort | 520.00 | 0.9626 | NO | Pareto-optimal |
| Ford-Johnson (Quick) | 526.62 | 1.0000 | NO | **Production knee** |
| Binary Gnome | 530.09 | 1.0000 | NO | Dominated |
| Binary Insertion | 530.57 | 1.0000 | NO | Dominated |
| Recursive Binary Insertion | 530.90 | 1.0000 | NO | Dominated |
| Interpolation Sort | 531.02 | 1.0000 | NO | Dominated |
| Binary Cocktail | 531.30 | 1.0000 | YES | Dominated |
| Timsort | 532.10 | 1.0000 | YES | Dominated |
| AVL Tree Sort | 538.40 | 1.0000 | YES | Dominated |
| Library Sort | 538.72 | 1.0000 | YES | Dominated |
| Merge Sort | 541.90 | 1.0000 | NO | Dominated |
| In-place Merge Sort | 542.57 | 1.0000 | NO | Dominated |
| 4-way Merge Sort | 543.28 | 1.0000 | NO | Dominated |
| Red-Black Tree Sort | 544.35 | 1.0000 | YES | Dominated |
| AA Tree Sort | 544.36 | 1.0000 | YES | Dominated |
| B-Tree Sort | 545.23 | 1.0000 | YES | Dominated |
| 8-way Merge Sort | 546.97 | 1.0000 | NO | Dominated |
| 16-way Merge Sort | 548.52 | 1.0000 | NO | Dominated |
| Flansort | 549.28 | 1.0000 | YES | Dominated |
| Wave Sort | 553.79 | 1.0000 | NO | Dominated |
| Multizip Sort | 557.88 | 1.0000 | NO | Dominated |
| Powersort | 558.05 | 1.0000 | YES | Dominated |
| Parallel Merge Sort | 558.05 | 1.0000 | NO | Dominated |
| 32-way Merge Sort | 558.37 | 1.0000 | NO | Dominated |
| Tournament Sort | 558.42 | 1.0000 | NO | Dominated |
| Ping-pong Merge Sort | 558.53 | 1.0000 | NO | Dominated |
| Bottom-up Merge Sort | 558.94 | 1.0000 | NO | Dominated |
| Quicksort (Ninther) | 563.54 | 1.0000 | YES | Dominated |
| Optimized Pancake | 564.16 | 1.0000 | YES | Dominated |
| 3-way Merge Sort | 567.57 | 1.0000 | NO | Dominated |
| 4-way Powersort | 568.80 | 1.0000 | YES | Dominated |
| Shivers Sort (length-adaptive) | 569.62 | 1.0000 | YES | Dominated |
| Bentley-McIlroy Quicksort | 571.35 | 1.0000 | YES | Dominated |
| Quadsort | 571.43 | 1.0000 | YES | Dominated |
| Adaptive Shivers | 573.38 | 1.0000 | YES | Dominated |
| Augmented Shivers | 574.31 | 1.0000 | YES | Dominated |
| Natural Merge Sort | 574.54 | 1.0000 | YES | Dominated |
| Shivers Sort | 574.99 | 1.0000 | YES | Dominated |
| Vergesort | 580.23 | 1.0000 | YES | Dominated |
| QuickMergesort | 580.72 | 1.0000 | YES | Dominated |
| Funnel Sort | 580.83 | 1.0000 | NO | Dominated |
| Weak Heap | 581.17 | 1.0000 | YES | Dominated |
| α-Stack Sort (α=2) | 584.79 | 1.0000 | YES | Dominated |
| GrailSort | 584.95 | 1.0000 | NO | Dominated |
| 3-way Powersort | 585.04 | 1.0000 | YES | Dominated |
| Slowsort | 585.78 | 0.9449 | YES | Dominated |
| Triplet Merge-Insertion | 591.84 | 1.0000 | YES | Dominated |
| Binomial Heap Sort | 594.02 | 1.0000 | YES | Dominated |
| Twinsort | 594.31 | 1.0000 | YES | Dominated |
| QuickHeapsort | 597.25 | 1.0000 | YES | Dominated |
| Oscillating Merge Sort | 599.30 | 1.0000 | NO | Dominated |
| Loser-Tree Merge | 599.75 | 1.0000 | NO | Dominated |
| Piposort | 600.35 | 1.0000 | YES | Dominated |
| Bottom-up Heap | 600.47 | 1.0000 | YES | Dominated |
| Winner-Tree Merge Sort | 601.01 | 1.0000 | NO | Dominated |
| Fluxsort | 601.14 | 1.0000 | YES | Dominated |
| Triple-Pivot Quicksort | 604.52 | 1.0000 | YES | Dominated |
| Binary Patience | 610.37 | 1.0000 | YES | Dominated |
| Adaptive Binary Insertion | 610.38 | 1.0000 | YES | Dominated |
| Cubesort | 610.40 | 1.0000 | YES | Dominated |
| WikiSort | 611.88 | 1.0000 | YES | Dominated |
| Scapegoat Tree Sort | 620.34 | 1.0000 | YES | Dominated |
| Batcher Odd-Even | 627.78 | 1.0000 | YES | Dominated |
| Lee Improved Tokuda Shellsort | 628.81 | 1.0000 | YES | Dominated |
| ORLP25 Shellsort | 629.75 | 1.0000 | YES | Dominated |
| Gonnet Shellsort | 629.82 | 1.0000 | YES | Dominated |
| Shellsort | 630.18 | 1.0000 | YES | Dominated |
| Extended Ciura Shellsort | 630.61 | 1.0000 | YES | Dominated |
| Ciura Shellsort | 630.97 | 1.0000 | YES | Dominated |
| Sedgewick 1973 Shellsort | 631.00 | 1.0000 | YES | Dominated |
| Recursive Shellsort | 631.13 | 1.0000 | YES | Dominated |
| Fibonacci Shellsort | 631.73 | 1.0000 | YES | Dominated |
| Tokuda Shellsort | 631.74 | 1.0000 | YES | Dominated |
| Tokuda Good Gaps Shellsort | 632.04 | 1.0000 | YES | Dominated |
| Incerpi-Sedgewick Shellsort | 632.17 | 1.0000 | YES | Dominated |
| Split Ratio Shellsort | 632.74 | 1.0000 | YES | Dominated |
| Frank-Lazarus Shellsort | 633.79 | 1.0000 | YES | Dominated |
| Hibbard Shellsort | 638.45 | 1.0000 | YES | Dominated |
| Sample Sort | 638.86 | 1.0000 | YES | Dominated |
| Glidesort | 640.54 | 1.0000 | YES | Dominated |
| Stable Cyclesort | 641.12 | 1.0000 | YES | Dominated |
| Parallel Quicksort | 641.64 | 1.0000 | NO | Dominated |
| Knuth Shellsort | 641.86 | 1.0000 | YES | Dominated |
| 3-Way Quicksort | 644.08 | 1.0000 | NO | Dominated |
| Cartesian Tree | 645.87 | 1.0000 | YES | Dominated |
| Treap Sort | 647.26 | 1.0000 | NO | Dominated |
| Bead (Gravity) Sort | 647.97 | 1.0000 | YES | Dominated |
| Quicksort (LTR) | 648.82 | 1.0000 | NO | Dominated |
| Stable Quicksort | 649.11 | 1.0000 | NO | Dominated |
| Tree Sort | 649.50 | 1.0000 | NO | Dominated |
| Binary Quicksort | 649.52 | 1.0000 | NO | Dominated |
| Dual-Pivot Quicksort | 649.82 | 1.0000 | NO | Dominated |
| Quicksort (RTL) | 650.03 | 1.0000 | NO | Dominated |
| Cycle Sort | 650.04 | 1.0000 | YES | Dominated |
| Quicksort (Middle) | 650.05 | 1.0000 | NO | Dominated |
| Original Shell Sort | 650.91 | 1.0000 | YES | Dominated |
| Quicksort (Random) | 651.11 | 1.0000 | NO | Dominated |
| Comparison Counting Sort | 651.36 | 1.0000 | YES | Dominated |
| Quicksort (Hoare) | 652.50 | 1.0000 | YES | Dominated |
| Pratt 5x8 Shellsort | 653.34 | 1.0000 | YES | Dominated |
| VQSort (u64/AVX2 model) | 655.28 | 1.0000 | YES | Dominated |
| 4-Pivot Quicksort | 656.26 | 1.0000 | NO | Dominated |
| Papernov-Stasevich Shellsort | 659.70 | 1.0000 | YES | Dominated |
| Sedgewick Shellsort | 662.75 | 1.0000 | YES | Dominated |
| Ska Sort | 667.93 | 1.0000 | YES | Dominated |
| Splay Sort | 669.67 | 1.0000 | NO | Dominated |
| BFPRT Quicksort | 670.76 | 1.0000 | YES | Dominated |
| Binary Shell | 672.04 | 1.0000 | YES | Dominated |
| Circle Sort | 674.82 | 1.0000 | YES | Dominated |
| Yaroslavskiy Quicksort | 675.27 | 1.0000 | YES | Dominated |
| Skiplist Sort | 675.66 | 1.0000 | YES | Dominated |
| Quicksort (Mo3) | 676.49 | 1.0000 | YES | Dominated |
| Fibonacci Heap Sort | 677.91 | 1.0000 | YES | Dominated |
| Cascade Merge Sort | 681.23 | 1.0000 | YES | Dominated |
| Replacement Selection | 683.88 | 1.0000 | YES | Dominated |
| Polyphase Merge | 684.90 | 1.0000 | YES | Dominated |
| Out-of-place Heap | 686.40 | 1.0000 | YES | Dominated |
| Stooge Sort | 688.60 | 1.0000 | YES | Dominated |
| Bose-Nelson | 688.78 | 1.0000 | YES | Dominated |
| Cocktail Bogo | 694.85 | 1.0000 | YES | Dominated |
| Ternary Heap | 696.83 | 1.0000 | YES | Dominated |
| Gridsort | 701.95 | 1.0000 | YES | Dominated |
| Weave Merge | 703.10 | 1.0000 | YES | Dominated |
| True Flansort | 708.53 | 1.0000 | NO | Dominated |
| PESort | 710.82 | 1.0000 | YES | Dominated |
| Pairwise Sorting Network | 711.79 | 1.0000 | YES | Dominated |
| Rotation Merge Sort | 712.82 | 1.0000 | NO | Dominated |
| Lomuto Quicksort | 713.10 | 1.0000 | NO | Dominated |
| Quaternary Heap | 714.54 | 1.0000 | YES | Dominated |
| Heap Sort (Smooth Proxy) | 715.15 | 1.0000 | YES | Dominated |
| Heap Sort | 716.56 | 1.0000 | YES | Dominated |
| Peeksort | 719.67 | 1.0000 | YES | Dominated |
| Intro Sort | 720.00 | 1.0000 | NO | Dominated |
| Co-ranking In-place Mergesort | 720.17 | 1.0000 | YES | Dominated |
| Comb Sort | 721.15 | 1.0000 | YES | Dominated |
| Blitsort | 721.99 | 1.0000 | YES | Dominated |
| Recursive Comb Sort | 722.06 | 1.0000 | YES | Dominated |
| BlockQuicksort | 722.13 | 1.0000 | NO | Dominated |
| Sedgewick 1982 Shellsort | 723.26 | 1.0000 | YES | Dominated |
| PDQSort | 728.98 | 1.0000 | YES | Dominated |
| Crumsort | 739.28 | 1.0000 | YES | Dominated |
| Min-Max Heap | 742.02 | 1.0000 | YES | Dominated |
| Pairing Heap Sort | 744.41 | 1.0000 | NO | Dominated |
| Neatsort | 745.00 | 1.0000 | YES | Dominated |
| Bucket Sort | 757.56 | 1.0000 | NO | Dominated |
| Split Sort | 758.41 | 1.0000 | YES | Dominated |
| Poplar Sort | 760.32 | 1.0000 | YES | Dominated |
| Foldsort | 761.40 | 1.0000 | YES | Dominated |
| Drop-Merge Sort | 761.52 | 1.0000 | YES | Dominated |
| Bitonic Sort | 761.66 | 1.0000 | YES | Dominated |
| Creasesort | 762.76 | 1.0000 | YES | Dominated |
| Modified Bitonic Sort | 763.33 | 1.0000 | YES | Dominated |
| 5-ary Heap Sort | 771.75 | 1.0000 | YES | Dominated |
| C16/3+1 Shellsort | 774.18 | 1.0000 | YES | Dominated |
| Smoothsort | 774.96 | 1.0000 | YES | Dominated |
| JSort | 777.31 | 1.0000 | YES | Dominated |
| Pardons 2009 Shellsort | 779.80 | 1.0000 | YES | Dominated |
| Bozo Sort | 784.29 | 1.0000 | YES | Dominated |
| Leftist Heap Sort | 784.77 | 1.0000 | NO | Dominated |
| Binary Merge | 788.27 | 1.0000 | NO | Dominated |
| SqrtSort | 791.47 | 1.0000 | NO | Dominated |
| Bovo Sort | 799.19 | 1.0000 | YES | Dominated |
| Shear Sort | 804.21 | 1.0000 | YES | Dominated |
| Proxmap Sort | 806.43 | 1.0000 | YES | Dominated |
| Skew Heap Sort | 809.09 | 1.0000 | NO | Dominated |
| Full Rank | 809.52 | 1.0000 | NO | Dominated |
| Bogosort | 810.63 | 1.0000 | YES | Dominated |
| Exchange Bogo | 811.54 | 1.0000 | YES | Dominated |
| Spreadsort | 819.82 | 1.0000 | YES | Dominated |
| 6-ary Heap Sort | 821.47 | 1.0000 | YES | Dominated |
| Unbalanced Merge Sort | 823.94 | 1.0000 | NO | Dominated |
| Pratt Shellsort | 828.96 | 1.0000 | YES | Dominated |
| 3-Smooth Comb | 830.40 | 1.0000 | YES | Dominated |
| Binary Bottom-up Merge | 837.49 | 1.0000 | NO | Dominated |
| Logsort | 842.65 | 1.0000 | YES | Dominated |
| 7-ary Heap Sort | 848.22 | 1.0000 | YES | Dominated |
| Flashsort | 851.71 | 1.0000 | YES | Dominated |
| Less Bogo | 871.90 | 1.0000 | YES | Dominated |
| Spin Sort | 884.02 | 1.0000 | NO | Dominated |
| 8-ary Heap Sort (2) | 886.78 | 1.0000 | YES | Dominated |
| Pratt 2x3x5 Shellsort | 986.09 | 1.0000 | YES | Dominated |
| Super Scalar Sample Sort | 1008.22 | 1.0000 | YES | Dominated |
| Patience Sort | 1010.81 | 1.0000 | YES | Dominated |
| Octosort | 1013.97 | 1.0000 | NO | Dominated |
| Hayate-Shiki | 1025.62 | 1.0000 | YES | Dominated |
| Adaptive Heap Sort | 1081.63 | 1.0000 | YES | Dominated |
| Slab Sort | 1117.51 | 1.0000 | YES | Dominated |
| Strand Sort | 1126.37 | 1.0000 | YES | Dominated |
| MEL Sort | 1177.42 | 1.0000 | YES | Dominated |
| Pancake Sort | 1252.49 | 1.0000 | YES | Dominated |
| IPS⁴o Sort | 1369.91 | 1.0000 | YES | Dominated |
| 16-ary Heap Sort | 1457.23 | 1.0000 | YES | Dominated |
| α-Merge Sort (α=2) | 1517.33 | 1.0000 | YES | Dominated |
| Double Insertion | 1784.50 | 1.0000 | YES | Dominated |
| Cocktail Selection | 2108.24 | 1.0000 | YES | Dominated |
| Recursive Selection | 2210.72 | 1.0000 | YES | Dominated |
| Selection Sort | 2211.11 | 1.0000 | YES | Dominated |
| Bingo Sort | 2214.52 | 1.0000 | YES | Dominated |
| Double Selection | 2363.52 | 1.0000 | YES | Dominated |
| Recursive Double Selection | 2366.52 | 1.0000 | YES | Dominated |
| Rouge Sort | 2480.71 | 1.0000 | YES | Dominated |
| Stable Selection | 2555.98 | 1.0000 | YES | Dominated |
| Recursive Bubble | 2562.00 | 1.0000 | YES | Dominated |
| I Can't Believe It Can Sort | 2564.63 | 1.0000 | YES | Dominated |
| Insertion Sorting Network | 2564.66 | 1.0000 | YES | Dominated |
| Spaghetti (Poll) Sort | 2565.61 | 1.0000 | YES | Dominated |
| Recursive Insertion | 2565.96 | 1.0000 | NO | Dominated |
| Recursive Gnome | 2568.50 | 1.0000 | YES | Dominated |
| Exchange Sort | 2569.20 | 1.0000 | YES | Dominated |
| Shuffle Sort | 2570.30 | 1.0000 | YES | Dominated |
| Worst Sort | 2570.42 | 1.0000 | NO | Dominated |
| Gnome Sort | 2571.72 | 1.0000 | YES | Dominated |
| Cocktail Bounds | 2575.45 | 1.0000 | YES | Dominated |
| Recursive Cocktail | 2575.82 | 1.0000 | YES | Dominated |
| Insertion Sort | 2575.98 | 1.0000 | NO | Dominated |
| Bubble Sort | 2576.65 | 1.0000 | YES | Dominated |
| Link Sort | 2576.84 | 1.0000 | YES | Dominated |
| Cocktail Shaker | 2577.85 | 1.0000 | YES | Dominated |
| Selection Sorting Network | 2581.53 | 1.0000 | YES | Dominated |
| Optimal Sorting Network | 2589.00 | 1.0000 | YES | Dominated |
| Soheil Sort | 2589.38 | 1.0000 | YES | Dominated |
| Corsort | 2594.54 | 1.0000 | YES | Dominated |
| Recursive Odd-Even Sort | 2596.10 | 1.0000 | YES | Dominated |
| Brick Sorting Network | 2598.44 | 1.0000 | YES | Dominated |
| Odd-Even Sort | 2606.72 | 1.0000 | YES | Dominated |
| Odd-Even Bogo | 2630.72 | 1.0000 | YES | Dominated |
| Bubble Bogo | 2643.88 | 1.0000 | YES | Dominated |

### Key Insights
- **Best no-duplicate sorting:** Ford-Johnson (Quick) at ~527 battles remains the production knee, with τ=1.0 and no duplicate pairs.
- **Best new no-duplicate (batch 8):** Interpolation Sort at 531.02 (just above Binary Insertion 530.51), then 16-way Merge at 548.52 and 32-way Merge at 558.37.
- **Heap arities:** 7-ary 848.22, 8-ary 886.78, 16-ary 1457.23 show increasing comparisons with arity in this model.
- **Sorting networks:** Optimal 2589, Insertion 2564, Selection 2581, Spaghetti 2565, Worst 2570, Brick 2598, Soheil 2589, Corsort 2594 all cluster at ~2.5k battles, as expected for O(n²) fixed networks at n=100.
- **Flansort family:** Flansort 549.28 (duplicates YES) is best new adaptive but repeats pairs; True Flansort 708.53 no-duplicate.
- **Distribution ports:** Bead 647.97, Flashsort 851.71, Proxmap 806.43, Ska 667.93, Spreadsort 819.82, SqrtSort 791.47 etc. show distribution sorts pay overhead on random data.
- **Pareto frontier:** Exit Sort (0 battles, τ~0.006), Miracle Sort (99 battles, τ~0.5), Budgeted Merge (520 battles, τ~0.96), Ford-Johnson (527 battles, τ=1.0) remain the frontier.
- **Runtime vs battles:** Runtime benchmark (research/benchmark_runtime.js, N=200) shows wall-clock fastest no-duplicate are Interpolation Sort (0.22 ms), α-Stack (0.25 ms), Winner-Tree (0.29 ms), 16-way (0.67 ms) — similar ordering to battles but with different constants due to generator overhead.

## 2. Convergence / Bradley-Terry analysis
- Same as previous: BT with prior 0.5, scale 400/log(10), transitive reachability via bitsets, duplicate detection via matchesMap.
- All 241 providers terminate within step cap for N=100, 250 trials.

## 3. Wall-clock benchmark
- **Command:** `node research/benchmark_runtime.js 200 10`
- **Metric:** average ms to drive provider to completion with random oracle, N=200, 10 trials.
- **Result file:** research/runtime_results.txt
- **Top 10 fastest no-duplicate for N=200 (excluding joke non-sorting):** Interpolation Sort 0.22 ms, α-Stack 0.25 ms, Winner-Tree 0.29 ms, Oscillating Merge 0.29 ms, Cubesort 0.30 ms, Multizip 0.32 ms, Vergesort 0.33 ms, Adaptive Heap? actually 1.99 ms, etc. Full list in runtime_results.txt.

