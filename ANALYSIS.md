# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the benchmarking and analysis used to optimize the pair-generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared **188 registered sorting providers**. The suite includes the 25-algorithm third web expansion, a fixed-profile **VQSort (u64/AVX2 model)** provider, a 24-algorithm fourth web expansion, and a 20-algorithm fifth web expansion. VQSort is deliberately measured only at the comparison level; this is not a SIMD-throughput benchmark. The source and fidelity matrix is in [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md), with correctness details in [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md). Algorithms that request duplicate pairs are identified and excluded from the Pareto-optimal analysis so that the production choice reflects unique human decisions.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Run command:** `node research/sort_analysis.js 100 250`
- **Metric:** average number of unique battles and average Kendall Tau against randomly generated ground-truth strengths.
- **Rerun note (2026-09-03):** a correctness audit of all 85 providers ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)) fixed Intro Sort (mixed comparison orientations between its partition/insertion/heapsort branches), Tournament Sort (dropped the weakest element), and Hayate-Shiki (inverted merge comparator; Kendall Tau improves from 0.8426 to 1.0000). "Radix Sort" — which was not a radix sort — was replaced by a faithful **Binary Quicksort**, "Smooth Sort" was relabeled **Heap Sort (Smooth Proxy)**, and Silly Sort now performs the actual silly recursion. Rows for these six algorithms were re-measured with the same protocol; all other rows are retained from the original run (each algorithm is simulated independently). The Pareto frontier and the Ford-Johnson knee point are unchanged.
- **Rerun note (2026-09-11, batch 2):** expansion to 118 providers (32 implementations plus Bozo registration). See the retained batch-2 addendum in [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md) for the complete list and fidelity audit.
- **Rerun note (2026-09-11, batch 3):** another broad web sweep added 25 providers: Stable Selection, Double Insertion, 3-Smooth Comb, three Shell gap sequences, four heap-family sorts plus Poplar, MEL, Twinsort, Spin, Weave Merge, QuickMergesort, 4-way Powersort, Loser-Tree Merge, GrailSort, WikiSort, Fluxsort, Crumsort, Glidesort, Blitsort, and Optimized Pancake. All additions sort correctly in 489/489 differential-audit runs. Modern algorithms whose branchless moves, cache layout, or rotations are not battle-observable are explicitly labeled comparison ports/skeletons in the research docs.
- **Rerun note (2026-09-12, VQSort):** added `VQSort (u64/AVX2 model)`. The provider fixes the profile to 64-bit keys and four AVX2 lanes, exposing Highway's six-chunk pivot sampler, exact architecture-selected sorting networks, lane-to-pivot decisions, recursion, and the paper's degenerate safeguard as serial battles. It cannot reproduce SIMD concurrency, `CompressStore`, cache behavior, or instruction throughput. VQSort passed 489/489 audit runs and measured 656.02 battles, τ=1.0000, duplicates YES.
- **Rerun note (2026-09-12, batch 4):** a fourth wild-web sweep added **24** providers — Cocktail Bogo, Comparison Counting Sort, four more Shell gap sequences (Original, Hibbard, Ciura, Gonnet), 5-ary Heap, 8-way Merge, QuickHeapsort, JSort, Drop-Merge Sort, Split Sort, Vergesort, Neatsort, 3-way Powersort, the Pairwise Sorting Network, Shuffle Sort, Binary Cocktail, Skew/Leftist/Binomial Heap sorts, AVL/Red-Black Tree sorts, and Triplet Merge-Insertion — and freshly re-measured all 168 rows. All 24 pass the 489/489 differential audit (Cocktail Bogo capped at N ≤ 5 like the other bogo rows). The best new no-duplicate row is 8-way Merge Sort at 547.73, still behind Ford-Johnson, so the Pareto frontier and production knee are unchanged.
- **Rerun note (2026-09-13, batch 5; current table):** a fifth wild-web sweep added **20** providers — Knuth, Papernov-Stasevich and Fibonacci Shellsorts, Pairing and Fibonacci Heaps, B-Tree, AA Tree and Scapegoat Tree sorts, Brick Sorting Network, Super Scalar Sample Sort and IPS⁴o, SqrtSort, Octosort, Cubesort, Gridsort, Slab Sort, Adaptive Heap Sort, Cascade and Oscillating Merge sorts, and 6-ary Heap Sort — and freshly re-measured all **188** rows. All 20 pass the 489/489 differential audit. The best new no-duplicate rows are Oscillating Merge Sort at **600.28**, Pairing Heap at **745.90** and SqrtSort at **793.64**, all still behind Ford-Johnson, so the Pareto frontier and production knee remain unchanged.

### Results (N=100)

| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
|-----------|-------------|-----------------|------------|---------------|
| Exit Sort | 0.00 | 0.0060 | NO | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0055 | NO | Dominated |
| Socialist Sort | 0.00 | 0.0026 | NO | Dominated |
| Sleep Sort | 0.00 | -0.0036 | NO | Dominated |
| Quantum Bogo | 1.68 | -0.0045 | NO | Dominated |
| Permutation Sort | 1.82 | -0.0013 | YES | Dominated |
| BogoBogoSort | 26.49 | 0.0067 | YES | Dominated |
| Thanos Sort | 99.00 | 0.5044 | YES | Dominated |
| Miracle Sort | 99.00 | 0.5033 | NO | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3418 | NO | Dominated |
| Stalin Sort | 99.00 | 0.0291 | NO | Dominated |
| Hater Sort | 188.10 | 0.5618 | YES | Dominated |
| Silly Sort | 200.97 | 0.1223 | YES | Dominated |
| Random Sort | 210.76 | 0.5532 | YES | Dominated |
| Budgeted Merge Sort | 520.00 | 0.9619 | NO | Pareto-optimal |
| Ford-Johnson (Quick) | 527.02 | 1.0000 | NO | **Production knee** |
| Binary Insertion | 530.51 | 1.0000 | NO | Dominated |
| Binary Gnome | 530.60 | 1.0000 | NO | Dominated |
| Binary Cocktail | 530.62 | 1.0000 | YES | Dominated |
| Recursive Binary Insertion | 530.99 | 1.0000 | NO | Dominated |
| Timsort | 532.45 | 1.0000 | YES | Dominated |
| AVL Tree Sort | 538.12 | 1.0000 | YES | Dominated |
| Library Sort | 538.16 | 1.0000 | YES | Dominated |
| In-place Merge Sort | 541.60 | 1.0000 | NO | Dominated |
| Merge Sort | 541.98 | 1.0000 | NO | Dominated |
| 4-way Merge Sort | 543.06 | 1.0000 | NO | Dominated |
| Red-Black Tree Sort | 544.32 | 1.0000 | YES | Dominated |
| 8-way Merge Sort | 547.73 | 1.0000 | NO | Dominated |
| Powersort | 557.31 | 1.0000 | YES | Dominated |
| Parallel Merge Sort | 557.53 | 1.0000 | NO | Dominated |
| Bottom-up Merge Sort | 557.99 | 1.0000 | NO | Dominated |
| Ping-pong Merge Sort | 558.40 | 1.0000 | NO | Dominated |
| Tournament Sort | 558.89 | 1.0000 | NO | Dominated |
| Optimized Pancake | 563.38 | 1.0000 | YES | Dominated |
| Quicksort (Ninther) | 563.65 | 1.0000 | YES | Dominated |
| 3-way Merge Sort | 567.52 | 1.0000 | NO | Dominated |
| Quadsort | 570.18 | 1.0000 | YES | Dominated |
| 4-way Powersort | 570.57 | 1.0000 | YES | Dominated |
| Adaptive Shivers | 573.83 | 1.0000 | YES | Dominated |
| Shivers Sort | 574.37 | 1.0000 | YES | Dominated |
| Natural Merge Sort | 574.39 | 1.0000 | YES | Dominated |
| Augmented Shivers | 574.58 | 1.0000 | YES | Dominated |
| QuickMergesort | 576.22 | 1.0000 | YES | Dominated |
| Vergesort | 579.73 | 1.0000 | YES | Dominated |
| Weak Heap | 580.16 | 1.0000 | YES | Dominated |
| Funnel Sort | 581.09 | 1.0000 | NO | Dominated |
| Slowsort | 583.10 | 0.9450 | YES | Dominated |
| GrailSort | 584.61 | 1.0000 | NO | Dominated |
| 3-way Powersort | 584.67 | 1.0000 | YES | Dominated |
| Triplet Merge-Insertion | 592.18 | 1.0000 | YES | Dominated |
| Binomial Heap Sort | 593.74 | 1.0000 | YES | Dominated |
| Twinsort | 594.60 | 1.0000 | YES | Dominated |
| QuickHeapsort | 595.52 | 1.0000 | YES | Dominated |
| Bottom-up Heap | 599.16 | 1.0000 | YES | Dominated |
| Piposort | 600.13 | 1.0000 | YES | Dominated |
| Fluxsort | 600.40 | 1.0000 | YES | Dominated |
| Loser-Tree Merge | 601.10 | 1.0000 | NO | Dominated |
| Triple-Pivot Quicksort | 602.54 | 1.0000 | YES | Dominated |
| Binary Patience | 612.56 | 1.0000 | YES | Dominated |
| WikiSort | 613.49 | 1.0000 | NO | Dominated |
| Batcher Odd-Even | 623.74 | 1.0000 | YES | Dominated |
| Shellsort | 630.01 | 1.0000 | YES | Dominated |
| Ciura Shellsort | 630.29 | 1.0000 | YES | Dominated |
| Gonnet Shellsort | 630.53 | 1.0000 | YES | Dominated |
| Recursive Shellsort | 631.26 | 1.0000 | YES | Dominated |
| Tokuda Shellsort | 632.63 | 1.0000 | YES | Dominated |
| Sample Sort | 637.66 | 1.0000 | YES | Dominated |
| Glidesort | 638.55 | 1.0000 | YES | Dominated |
| Hibbard Shellsort | 639.28 | 1.0000 | YES | Dominated |
| Quicksort (LTR) | 640.79 | 1.0000 | NO | Dominated |
| Stable Quicksort | 642.34 | 1.0000 | NO | Dominated |
| Quicksort (RTL) | 643.11 | 1.0000 | NO | Dominated |
| Tree Sort | 645.64 | 1.0000 | NO | Dominated |
| Cartesian Tree | 645.66 | 1.0000 | YES | Dominated |
| Quicksort (Hoare) | 646.10 | 1.0000 | YES | Dominated |
| Dual-Pivot Quicksort | 647.08 | 1.0000 | NO | Dominated |
| Comparison Counting Sort | 648.02 | 1.0000 | YES | Dominated |
| Quicksort (Random) | 648.86 | 1.0000 | NO | Dominated |
| Quicksort (Middle) | 648.96 | 1.0000 | NO | Dominated |
| Original Shell Sort | 649.23 | 1.0000 | YES | Dominated |
| 3-Way Quicksort | 649.78 | 1.0000 | NO | Dominated |
| Treap Sort | 650.80 | 1.0000 | NO | Dominated |
| Parallel Quicksort | 651.88 | 1.0000 | NO | Dominated |
| Binary Quicksort | 651.96 | 1.0000 | NO | Dominated |
| VQSort (u64/AVX2 model) | 655.74 | 1.0000 | YES | Dominated |
| Cycle Sort | 656.43 | 1.0000 | YES | Dominated |
| Sedgewick Shellsort | 659.48 | 1.0000 | YES | Dominated |
| Splay Sort | 667.70 | 1.0000 | NO | Dominated |
| Binary Shell | 671.32 | 1.0000 | YES | Dominated |
| Quicksort (Mo3) | 671.85 | 1.0000 | YES | Dominated |
| BFPRT Quicksort | 673.24 | 1.0000 | YES | Dominated |
| Circle Sort | 678.84 | 1.0000 | YES | Dominated |
| Skiplist Sort | 679.20 | 1.0000 | YES | Dominated |
| Polyphase Merge | 681.93 | 1.0000 | YES | Dominated |
| Replacement Selection | 682.98 | 1.0000 | YES | Dominated |
| Out-of-place Heap | 686.61 | 1.0000 | YES | Dominated |
| Stooge Sort | 688.93 | 1.0000 | YES | Dominated |
| Bose-Nelson | 689.12 | 1.0000 | YES | Dominated |
| Ternary Heap | 695.30 | 1.0000 | YES | Dominated |
| Cocktail Bogo | 695.88 | 1.0000 | YES | Dominated |
| PESort | 699.49 | 1.0000 | YES | Dominated |
| Weave Merge | 701.24 | 1.0000 | YES | Dominated |
| Pairwise Sorting Network | 711.54 | 1.0000 | YES | Dominated |
| Quaternary Heap | 712.30 | 1.0000 | YES | Dominated |
| Intro Sort | 714.68 | 1.0000 | NO | Dominated |
| Heap Sort (Smooth Proxy) | 715.13 | 1.0000 | YES | Dominated |
| Blitsort | 715.16 | 1.0000 | YES | Dominated |
| Heap Sort | 716.02 | 1.0000 | YES | Dominated |
| Rotation Merge Sort | 717.39 | 1.0000 | NO | Dominated |
| Peeksort | 717.64 | 1.0000 | YES | Dominated |
| Comb Sort | 717.83 | 1.0000 | YES | Dominated |
| Recursive Comb Sort | 722.58 | 1.0000 | YES | Dominated |
| BlockQuicksort | 725.74 | 1.0000 | NO | Dominated |
| Neatsort | 732.82 | 1.0000 | YES | Dominated |
| PDQSort | 734.01 | 1.0000 | YES | Dominated |
| Min-Max Heap | 739.54 | 1.0000 | YES | Dominated |
| Crumsort | 740.36 | 1.0000 | YES | Dominated |
| Drop-Merge Sort | 758.84 | 1.0000 | YES | Dominated |
| Poplar Sort | 762.45 | 1.0000 | YES | Dominated |
| Bitonic Sort | 763.48 | 1.0000 | YES | Dominated |
| Split Sort | 764.63 | 1.0000 | YES | Dominated |
| Smoothsort | 771.33 | 1.0000 | YES | Dominated |
| 5-ary Heap Sort | 774.25 | 1.0000 | YES | Dominated |
| Bucket Sort | 776.21 | 1.0000 | NO | Dominated |
| JSort | 780.07 | 1.0000 | YES | Dominated |
| Leftist Heap Sort | 788.74 | 1.0000 | NO | Dominated |
| Binary Merge | 788.84 | 1.0000 | NO | Dominated |
| Bozo Sort | 790.44 | 1.0000 | YES | Dominated |
| Bovo Sort | 802.00 | 1.0000 | YES | Dominated |
| Shear Sort | 803.64 | 1.0000 | YES | Dominated |
| Skew Heap Sort | 808.02 | 1.0000 | NO | Dominated |
| Bogosort | 808.42 | 1.0000 | YES | Dominated |
| Full Rank | 811.78 | 1.0000 | NO | Dominated |
| Exchange Bogo | 811.83 | 1.0000 | YES | Dominated |
| 3-Smooth Comb | 829.10 | 1.0000 | YES | Dominated |
| Pratt Shellsort | 829.47 | 1.0000 | YES | Dominated |
| Binary Bottom-up Merge | 839.92 | 1.0000 | NO | Dominated |
| Spin Sort | 877.79 | 1.0000 | NO | Dominated |
| Less Bogo | 880.29 | 1.0000 | YES | Dominated |
| Patience Sort | 1012.12 | 1.0000 | YES | Dominated |
| Hayate-Shiki | 1027.34 | 1.0000 | YES | Dominated |
| Strand Sort | 1122.68 | 1.0000 | YES | Dominated |
| MEL Sort | 1175.63 | 1.0000 | YES | Dominated |
| Pancake Sort | 1250.24 | 1.0000 | YES | Dominated |
| Double Insertion | 1782.82 | 1.0000 | YES | Dominated |
| Cocktail Selection | 2119.18 | 1.0000 | YES | Dominated |
| Selection Sort | 2205.78 | 1.0000 | YES | Dominated |
| Bingo Sort | 2221.52 | 1.0000 | YES | Dominated |
| Recursive Selection | 2223.11 | 1.0000 | YES | Dominated |
| Double Selection | 2345.37 | 1.0000 | YES | Dominated |
| Recursive Double Selection | 2345.88 | 1.0000 | YES | Dominated |
| I Can't Believe It Can Sort | 2553.69 | 1.0000 | YES | Dominated |
| Insertion Sort | 2558.62 | 1.0000 | NO | Dominated |
| Gnome Sort | 2561.13 | 1.0000 | YES | Dominated |
| Stable Selection | 2565.34 | 1.0000 | YES | Dominated |
| Shuffle Sort | 2566.38 | 1.0000 | YES | Dominated |
| Bubble Sort | 2567.90 | 1.0000 | YES | Dominated |
| Exchange Sort | 2569.05 | 1.0000 | YES | Dominated |
| Cocktail Shaker | 2570.14 | 1.0000 | YES | Dominated |
| Recursive Insertion | 2570.79 | 1.0000 | NO | Dominated |
| Recursive Cocktail | 2583.15 | 1.0000 | YES | Dominated |
| Recursive Gnome | 2586.05 | 1.0000 | YES | Dominated |
| Cocktail Bounds | 2586.23 | 1.0000 | YES | Dominated |
| Recursive Bubble | 2597.45 | 1.0000 | YES | Dominated |
| Recursive Odd-Even Sort | 2602.19 | 1.0000 | YES | Dominated |
| Odd-Even Sort | 2617.22 | 1.0000 | YES | Dominated |
| Odd-Even Bogo | 2622.77 | 1.0000 | YES | Dominated |
| Bubble Bogo | 2623.92 | 1.0000 | YES | Dominated |

### Interpretation of the web expansion and VQSort addendum

All 25 batch-3 providers and the VQSort addition sort correctly and reach τ=1.0000. Their comparison costs cover a wide range:

- **Closest new challengers.** Optimized Pancake is the lowest-battle batch-3 addition at **562.74**, followed by 4-way Powersort (**569.20**) and QuickMergesort (**579.34**); all three repeat at least one unordered pair. GrailSort's comparison skeleton is the best new no-duplicate row at **585.11**, still 58.17 battles behind Ford-Johnson.
- **Modern hybrids and block/external merges.** Twinsort (**593.20**), Fluxsort (**595.77**), Loser-Tree Merge (**600.69**, no duplicates), WikiSort (**614.78**, duplicates), Glidesort (**638.73**), Blitsort (**720.38**), and Crumsort (**739.52**) show that engineering for cache locality, branchlessness, stability, and data movement does not automatically minimize human comparisons. The Grail, Wiki, and Glide rows are explicitly documented comparison-level skeleton/configuration measurements, not CPU-speed claims about their production libraries.
- **Heap and gap families.** Out-of-place Heap (**686.58**) leads the new heaps, ahead of Ternary (**696.26**), Quaternary (**714.11**), Min-Max (**740.66**), and Poplar (**760.14**). Tokuda is the strongest added Shell sequence at **632.70**; Sedgewick reaches **659.90**, while 3-Smooth Comb (**827.94**) and Pratt Shellsort (**831.47**) are close despite using the same gaps with different passes.
- **Specialized constructions.** Weave Merge uses **698.86** battles, Spin Sort uses **875.36** without duplicates, MEL Sort pays **1184.09** for its encroaching lists on random input, Double Insertion uses **1780.33**, and Stable Selection lands in the quadratic cluster at **2580.41**.
- **VQSort fixed profile.** The u64/AVX2 comparison model uses **656.02** unique battles and repeats pairs. This row reflects scalarized comparator work, not VQSort's defining SIMD speed: four lane comparisons that execute concurrently in hardware are four potential human decisions here, while vector packing and memory optimizations add no battles.
- **Batch 4 (2026-09-12).** The 24 new providers all reach τ=1.0000. The closest new rows are the binary-search/tree family — Binary Cocktail (**530.62**, duplicates), AVL Tree Sort (**538.12**, duplicates), and Red-Black Tree Sort (**544.32**, duplicates) — followed by **8-way Merge Sort at 547.73 with no duplicates**, the best new no-duplicate result and the only batch-4 merge variant that stays within ~20 battles of Ford-Johnson. Vergesort (**579.73**), 3-way Powersort (**584.67**), Triplet Merge-Insertion (**592.18**), Binomial Heap Sort (**593.74**), and QuickHeapsort (**595.52**) land in the dense n·log n cluster. The four new Shell sequences (Ciura **630.29**, Gonnet **630.53**, Hibbard **639.28**, Original **649.23**) bracket the existing Shellsort rows. The adaptive Drop-Merge (**758.84**), Split (**764.63**), Neatsort (**732.82**), and Vergesort rows show that presortedness-adaptive algorithms pay their run-detection overhead on uniformly random input. Skew (**808.02**) and Leftist (**788.74**) heap sorts are the only other batch-4 no-duplicate rows, and Shuffle Sort's n/2 pre-pass pushes it into the quadratic cluster at **2566.38**. Comparison Counting Sort (**648.02**) and the Pairwise Sorting Network (**711.54**) sit where their Θ(n²) and Θ(n log² n) comparison counts predict.
- **Batch 5 (2026-09-13).** The 20 new providers all reach τ=1.0000. The closest new rows overall are AA Tree Sort (**543.66**, duplicates) and B-Tree Sort (**544.06**, duplicates), essentially tied with the existing 8-way Merge frontier but repeating pairs. The best new no-duplicate rows are **Oscillating Merge Sort (600.28)**, **Pairing Heap Sort (745.90)** and **SqrtSort (793.64)** — all still ~70–260 battles behind Ford-Johnson. The three new Shell gaps (Knuth **638.69**, Fibonacci **632.23**, Papernov-Stasevich **658.44**) sit with the existing Shell cluster (630–650). Slab Sort (**1117.81**) and Adaptive Heap Sort (**1091.88**) pay their shuffled-monotone / Osc-optimal bookkeeping on random input, while Super Scalar Sample Sort (**1006.21**) and IPS⁴o (**1370.36**) show the oversampling cost when samples are small relative to n=100. The fixed Brick network (**2611.54**, Θ(n²) comparators) lands in the quadratic cluster as expected, and 6-ary Heap (**821.64**) is the expected step up from 5-ary.

The full implementation/source/fidelity matrix is in [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md). The raw benchmark output remains in `results.txt`; `research/audit_results.txt` independently records termination, valid pairs, sortedness, orientation, and duplicate behavior.

### Why Ford-Johnson remains the Production Knee Point

"Quick Rank" is **Ford–Johnson merge-insertion sort** (Knuth, *TAOCP* vol. 3, §5.3.1) — the classic algorithm constructed specifically to minimize the number of comparisons, which is exactly the currency PreferenceRank optimizes: a human battle is the only real cost, while item moves are free. Its dominance here is structural, not an empirical quirk of one 250-trial run.

**It operates at the information-theoretic floor.** Ordering *n* items is worth log₂(*n*!) bits, because there are *n*! possible orderings and each pairwise comparison reveals at most one bit. No algorithm — with or without transitive shortcuts — can fully order 100 items in fewer than ⌈log₂ 100!⌉ = **525** battles. Ford–Johnson's worst case is S(100) = Σ ⌈log₂(3j/4)⌉ = **534**, only 1.7% above the floor, and its measured average over random inputs is **527.02** — about two battles, or 0.4%, above the absolute minimum. Every battle converts essentially a full bit of ordering information.

**The mechanism: no comparison is ever wasted.** Two ideas do all the work:

- **Pairwise elimination.** ⌊n/2⌋ battles pair the elements off. Only the winners enter the recursive "main-chain" sort; a loser never competes against another loser, because it can only ever be ranked against the elements *before* its own winner. The elements that must be repeatedly examined are thereby halved, and the losers' order is recovered purely by positioning each one relative to the already-sorted chain.
- **Jacobsthal-ordered reinsertion into exactly-sized windows.** Losers are reinserted in batches indexed by the Jacobsthal numbers **1, 3, 5, 11, 21, 43, …** — the provider's `jA = 1, jB = 3` recurrence is literally `jB ← jB + 2·jA`. This ordering keeps every binary-search window exactly **2^k − 1** elements long, the size at which each comparison is a perfect 50/50 split of the remaining candidates. A comparison is never used to re-derive a relation the algorithm already knows.

Together these yield the worst-case total S(n) = n·log₂ n − (3 − log₂ 3)·n + O(log n) ≈ n·log₂ n − **1.415 n**, against the information bound n·log₂ n − 1.443 n — a waste of only ≈ 0.028 n comparisons. (For scale, merge-insertion achieves the *provably minimum* number of comparisons for every n ≤ 15; at n = 15 it needs 42, where even the ⌈log₂ 15!⌉ = 41 bound is unattainable.)

**Why its neighbors lose at n = 100.** The other algorithms in the same battle-count band fall behind for information-theoretic reasons, not noise:

- **Binary insertion** has worst case Σ ⌈log₂(j+1)⌉ = **573** — identical to top-down merge sort — 39 battles above Ford–Johnson's 534. Its random-input average (530.51) only *looks* close because random keys make its binary searches terminate early; it has neither pair-elimination nor window sizing to protect its worst case.
- **Merge sorts** pay the weaker n·log₂ n − n linear term: 8-way merge (547.73), merge (541.98), and 4-way (543.06) all give back the ≈0.415 n comparisons that Ford–Johnson's pair-elimination saves, and their ⌈log₂ n⌉ merge passes compare across runs whose internal order the recursion already established.
- **Heapsort and quicksort** are asymptotically worse still (roughly 2 n·log₂ n and ≈1.39 n·log₂ n with no compensating negative linear term), so they are never in contention on this axis.

**The knee is a consequence of the floor, not of the table.** Budgeted Merge Sort "wins" on raw battle count (520.00) but sits *below* the 525-bit floor, so it is information-theoretically incapable of encoding a complete ordering — which is why it measures τ = 0.9619 rather than 1.0000. Ford–Johnson is the cheapest frontier method that actually reaches the floor and can therefore recover the *entire* order: 527 battles against a hard 525-battle minimum, with no duplicate questions. That is why it is the production knee point — and why no further web sweep has displaced it.

`node research/pareto_analysis.js` recomputes the no-duplicate frontier from `results.txt`. This run contains Sleep Sort, Miracle Sort, Budgeted Merge Sort, and Ford-Johnson. The joke-sort points below 100 battles have Tau near zero and their membership changes with random noise; they are not viable ranking methods. The meaningful frontier is still **Budgeted Merge Sort → Ford-Johnson**.

#### The "No Duplicates" Constraint

PreferenceRank prioritizes user efficiency by excluding any algorithm that produces duplicate comparisons. Many high-performance algorithms (Timsort, Quicksort, Shellsort) are optimized for computer memory access patterns rather than minimizing unique human decisions. Ford-Johnson is a "Pure Unique" algorithm, ensuring every battle provides fresh data to the scoring model.

#### Shadow Wins and Transitive Closure

Ford–Johnson's comparison efficiency is a property of the algorithm itself (above). Quick Rank layers a **shadow transitive closure** on top of it: whenever a battle result transitively implies further win/loss relations, those are recorded as inferred wins without asking the user, so each answered battle contributes extra evidence to the Bradley–Terry fit. The closure is a scoring-layer accelerator — it never changes which pairs Ford–Johnson requests (the algorithm already avoids duplicate or implied pairs); it only lets every answered battle count for more in the rating estimate.

## 2. In-place and Block Merge Sort Comparison

The following sections detail the trade-offs between vanilla merge sort, basic in-place merge sort, and block merge sort variants.

### Memory Usage

* **Vanilla Merge Sort:** Requires O(n) auxiliary space. It allocates a secondary scratchpad array of identical size to the input to handle data blending.
* **In-Place Merge Sort:** Requires O(1) auxiliary space for iterative variants, or O(log n) space for recursive versions to manage the call stack. No secondary data buffer is generated.

### Time Complexity and Performance

* **Vanilla Merge Sort:** Guarantees a strict O(n log n) time complexity across best, worst, and average cases. It is fast in practice because elements are copied sequentially, which maximizes CPU cache efficiency.
* **In-Place Merge Sort:** Often degrades in speed. Basic implementations drop to O(n^2) time due to frequent internal element shifts (similar to insertion sort mechanics). Rotation-based in-place merge (like `Rotation Merge Sort`) achieves O(n log^2 n) but runs significantly slower due to intense pointer swap overhead and poor CPU cache locality. Highly optimized block merge sorts achieve O(n log n) but are extremely complex to implement.

### Algorithmic Stability

* **Vanilla Merge Sort:** Inherently stable. It naturally preserves the original relative order of duplicate elements because it merges left-to-right from distinct arrays.
* **In-Place Merge Sort:** Frequently unstable. To avoid allocating memory, most versions must pass elements around via complex data rotations or internal swaps, which typically destroys the relative ordering of identical keys.
* **Block Merge Sort:** A highly complex variant that achieves stable O(n log n) sorting with O(1) auxiliary space by using an internal buffer extracted from the data itself.

### Structural Comparison

| Feature | Vanilla Merge Sort | In-Place (Rotation) | Block Merge Sort |
| :--- | :--- | :--- | :--- |
| Time Complexity | O(n log n) | O(n log^2 n) | O(n log n) |
| Auxiliary Space | O(n) | O(1) or O(log n) | O(1) |
| Stability | Stable | Unstable | Stable |
| Implementation Complexity | Simple | Moderate | Very High |

### Battle Count Estimate Regression
For Ford-Johnson (the production knee point):
- **Formula:** Unique Battles ~ N * log2(N) - 1.408 * N + 3
- For N=100, this predicts 527 battles (matching simulation average).

---

## 3. Search Algorithm Analysis

While PreferenceRank focuses on ranking, the underlying sorting algorithms frequently utilize search techniques to place items. We compared Linear Search and Binary Search to quantify their efficiency in terms of unique comparisons ("battles").

### Results (Average Battles)
| N | Linear Search | Binary Search | Efficiency Gain |
|---|---|---|---|
| 10 | 5.51 | 2.89 | ~47% |
| 100 | 50.24 | 5.80 | ~88% |
| 1000 | 499.94 | 8.99 | ~98% |

### Analysis
Binary search demonstrates logarithmic efficiency (O(log N)), drastically reducing the number of comparisons as the list size grows. This efficiency is directly reflected in sorting performance; for example, **Binary Insertion Sort** (~531 battles at N=100) significantly outperforms vanilla **Insertion Sort** (~2547 battles at N=100) by utilizing binary search for element placement.

---

## 4. Binary-Augmentation Trade-offs

Binary-augmentation involves replacing linear scans (O(N)) with binary search ($O(\log N)$) during insertion or merging phases.

- **Winning Scenarios**: Algorithms like **Gnome Sort** and **Shellsort** see dramatic efficiency gains (e.g., Gnome Sort dropping from ~2566 to ~531 battles) because they transition from $O(N^2)$ to $O(N \log N)$ comparison complexity.
- **Losing Scenarios**: For already efficient algorithms like **Merge Sort**, binary-augmentation actually increases the total number of unique battles. While binary search minimizes comparisons for a single element insertion, standard Merge Sort's linear merge is already optimal ($O(N)$ comparisons per level) because it utilizes the sorted property of both halves simultaneously. Binary-augmentation forces $O(\log N)$ comparisons per element even when a single linear comparison would suffice.

---

## 5. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~43% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).

## 6. Benchmark Stability and Trial Optimization

To ensure the reliability of our rankings, we analyzed the impact of trial counts on benchmark stability. The optimal trial count was identified as **200** using a log-scale knee point analysis of the standard error of the mean (SEM).

```
Trials	Vanilla_Tau	Vanilla_SEM	InPlace_Tau	InPlace_SEM	Mean_Diff	SEM_Diff	Total_SEM
50	0.90587	0.00165	0.90587	0.00165	0.000000	0.000000	0.003295
100	0.90251	0.00123	0.90251	0.00123	0.000000	0.000000	0.002466
150	0.90353	0.00092	0.90353	0.00092	0.000000	0.000000	0.001846
200	0.90395	0.00091	0.90395	0.00091	0.000000	0.000000	0.001820
250	0.90384	0.00078	0.90384	0.00078	0.000000	0.000000	0.001559
300	0.90461	0.00064	0.90461	0.00064	0.000000	0.000000	0.001275
350	0.90414	0.00067	0.90414	0.00067	0.000000	0.000000	0.001344
400	0.90346	0.00059	0.90346	0.00059	0.000000	0.000000	0.001188
450	0.90284	0.00054	0.90284	0.00054	0.000000	0.000000	0.001071
500	0.90409	0.00053	0.90409	0.00053	0.000000	0.000000	0.001066
550	0.90418	0.00051	0.90418	0.00051	0.000000	0.000000	0.001014
600	0.90382	0.00051	0.90382	0.00051	0.000000	0.000000	0.001024
650	0.90386	0.00047	0.90386	0.00047	0.000000	0.000000	0.000937
700	0.90370	0.00045	0.90370	0.00045	0.000000	0.000000	0.000903
750	0.90388	0.00043	0.90388	0.00043	0.000000	0.000000	0.000850
800	0.90396	0.00041	0.90396	0.00041	0.000000	0.000000	0.000825
850	0.90455	0.00040	0.90455	0.00040	0.000000	0.000000	0.000798
900	0.90359	0.00042	0.90359	0.00042	0.000000	0.000000	0.000842
950	0.90324	0.00038	0.90324	0.00038	0.000000	0.000000	0.000760
1000	0.90410	0.00038	0.90410	0.00038	0.000000	0.000000	0.000766
```
