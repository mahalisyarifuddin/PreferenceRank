# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the benchmarking and analysis used to optimize the pair-generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared **144 registered sorting providers**. The suite includes the 25-algorithm third web expansion plus a fixed-profile **VQSort (u64/AVX2 model)** provider. VQSort is deliberately measured only at the comparison level; this is not a SIMD-throughput benchmark. The source and fidelity matrix is in [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md), with correctness details in [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md). Algorithms that request duplicate pairs are identified and excluded from the Pareto-optimal analysis so that the production choice reflects unique human decisions.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Run command:** `node research/sort_analysis.js 100 250`
- **Metric:** average number of unique battles and average Kendall Tau against randomly generated ground-truth strengths.
- **Rerun note (2026-09-03):** a correctness audit of all 85 providers ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)) fixed Intro Sort (mixed comparison orientations between its partition/insertion/heapsort branches), Tournament Sort (dropped the weakest element), and Hayate-Shiki (inverted merge comparator; Kendall Tau improves from 0.8426 to 1.0000). "Radix Sort" — which was not a radix sort — was replaced by a faithful **Binary Quicksort**, "Smooth Sort" was relabeled **Heap Sort (Smooth Proxy)**, and Silly Sort now performs the actual silly recursion. Rows for these six algorithms were re-measured with the same protocol; all other rows are retained from the original run (each algorithm is simulated independently). The Pareto frontier and the Ford-Johnson knee point are unchanged.
- **Rerun note (2026-09-11, batch 2):** expansion to 118 providers (32 implementations plus Bozo registration). See the retained batch-2 addendum in [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md) for the complete list and fidelity audit.
- **Rerun note (2026-09-11, batch 3):** another broad web sweep added 25 providers: Stable Selection, Double Insertion, 3-Smooth Comb, three Shell gap sequences, four heap-family sorts plus Poplar, MEL, Twinsort, Spin, Weave Merge, QuickMergesort, 4-way Powersort, Loser-Tree Merge, GrailSort, WikiSort, Fluxsort, Crumsort, Glidesort, Blitsort, and Optimized Pancake. All additions sort correctly in 489/489 differential-audit runs. Modern algorithms whose branchless moves, cache layout, or rotations are not battle-observable are explicitly labeled comparison ports/skeletons in the research docs.
- **Rerun note (2026-09-12, VQSort; current table):** added `VQSort (u64/AVX2 model)` and freshly re-measured all **144** rows. The provider fixes the profile to 64-bit keys and four AVX2 lanes, exposing Highway's six-chunk pivot sampler, exact architecture-selected sorting networks, lane-to-pivot decisions, recursion, and the paper's degenerate safeguard as serial battles. It cannot reproduce SIMD concurrency, `CompressStore`, cache behavior, or instruction throughput. VQSort passed 489/489 audit runs and measured **656.02 battles, τ=1.0000, duplicates YES**. The meaningful frontier and Ford-Johnson production knee remain unchanged.

### Results (N=100)

| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
|-----------|-------------|-----------------|------------|---------------|
| Exit Sort | 0.00 | -0.0031 | NO | Dominated |
| Socialist Sort | 0.00 | 0.0015 | NO | Dominated |
| Intelligent Design | 0.00 | 0.0021 | NO | Dominated |
| Sleep Sort | 0.00 | 0.0033 | NO | Pareto-optimal |
| Quantum Bogo | 1.70 | -0.0016 | NO | Dominated |
| Permutation Sort | 1.85 | 0.0020 | YES | Dominated |
| BogoBogoSort | 26.08 | 0.0190 | YES | Dominated |
| Stalin Sort | 99.00 | 0.0365 | NO | Dominated |
| Genghis Khan Sort | 99.00 | 0.3452 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5001 | YES | Dominated |
| Miracle Sort | 99.00 | 0.5030 | NO | Pareto-optimal |
| Hater Sort | 187.76 | 0.5617 | YES | Dominated |
| Silly Sort | 201.14 | 0.1260 | YES | Dominated |
| Random Sort | 215.26 | 0.5555 | YES | Dominated |
| Budgeted Merge Sort | 520.00 | 0.9631 | NO | Pareto-optimal |
| Ford-Johnson (Quick) | 526.94 | 1.0000 | NO | **Production knee** |
| Binary Insertion | 530.64 | 1.0000 | NO | Dominated |
| Recursive Binary Insertion | 530.68 | 1.0000 | NO | Dominated |
| Binary Gnome | 530.71 | 1.0000 | NO | Dominated |
| Timsort | 532.11 | 1.0000 | YES | Dominated |
| Library Sort | 539.02 | 1.0000 | YES | Dominated |
| In-place Merge Sort | 541.71 | 1.0000 | NO | Dominated |
| Merge Sort | 541.98 | 1.0000 | NO | Dominated |
| 4-way Merge Sort | 543.17 | 1.0000 | NO | Dominated |
| Powersort | 557.60 | 1.0000 | YES | Dominated |
| Parallel Merge Sort | 558.09 | 1.0000 | NO | Dominated |
| Bottom-up Merge Sort | 558.36 | 1.0000 | NO | Dominated |
| Tournament Sort | 558.76 | 1.0000 | NO | Dominated |
| Ping-pong Merge Sort | 559.09 | 1.0000 | NO | Dominated |
| Optimized Pancake | 562.74 | 1.0000 | YES | Dominated |
| Quicksort (Ninther) | 563.74 | 1.0000 | YES | Dominated |
| 3-way Merge Sort | 568.86 | 1.0000 | NO | Dominated |
| 4-way Powersort | 569.20 | 1.0000 | YES | Dominated |
| Quadsort | 571.02 | 1.0000 | YES | Dominated |
| Natural Merge Sort | 572.60 | 1.0000 | YES | Dominated |
| Adaptive Shivers | 573.93 | 1.0000 | YES | Dominated |
| Shivers Sort | 574.34 | 1.0000 | YES | Dominated |
| Augmented Shivers | 575.00 | 1.0000 | YES | Dominated |
| QuickMergesort | 579.34 | 1.0000 | YES | Dominated |
| Weak Heap | 580.81 | 1.0000 | YES | Dominated |
| Funnel Sort | 581.96 | 1.0000 | NO | Dominated |
| GrailSort | 585.11 | 1.0000 | NO | Dominated |
| Slowsort | 588.16 | 0.9455 | YES | Dominated |
| Twinsort | 593.20 | 1.0000 | YES | Dominated |
| Fluxsort | 595.77 | 1.0000 | YES | Dominated |
| Piposort | 599.51 | 1.0000 | YES | Dominated |
| Bottom-up Heap | 599.69 | 1.0000 | YES | Dominated |
| Loser-Tree Merge | 600.69 | 1.0000 | NO | Dominated |
| Triple-Pivot Quicksort | 603.95 | 1.0000 | YES | Dominated |
| Binary Patience | 610.96 | 1.0000 | YES | Dominated |
| WikiSort | 614.78 | 1.0000 | YES | Dominated |
| Batcher Odd-Even | 625.13 | 1.0000 | YES | Dominated |
| Recursive Shellsort | 629.71 | 1.0000 | YES | Dominated |
| Shellsort | 631.66 | 1.0000 | YES | Dominated |
| Tokuda Shellsort | 632.70 | 1.0000 | YES | Dominated |
| Sample Sort | 636.36 | 1.0000 | YES | Dominated |
| Glidesort | 638.73 | 1.0000 | YES | Dominated |
| Quicksort (Random) | 644.18 | 1.0000 | NO | Dominated |
| Cartesian Tree | 644.80 | 1.0000 | YES | Dominated |
| Quicksort (Middle) | 644.80 | 1.0000 | NO | Dominated |
| Quicksort (Hoare) | 645.55 | 1.0000 | YES | Dominated |
| Dual-Pivot Quicksort | 645.86 | 1.0000 | NO | Dominated |
| Binary Quicksort | 647.42 | 1.0000 | NO | Dominated |
| 3-Way Quicksort | 647.73 | 1.0000 | NO | Dominated |
| Quicksort (RTL) | 648.17 | 1.0000 | NO | Dominated |
| Treap Sort | 648.24 | 1.0000 | NO | Dominated |
| Quicksort (LTR) | 650.24 | 1.0000 | NO | Dominated |
| Parallel Quicksort | 654.13 | 1.0000 | NO | Dominated |
| Tree Sort | 654.48 | 1.0000 | NO | Dominated |
| Cycle Sort | 654.64 | 1.0000 | YES | Dominated |
| VQSort (u64/AVX2 model) | 656.02 | 1.0000 | YES | Dominated |
| Stable Quicksort | 656.50 | 1.0000 | NO | Dominated |
| Sedgewick Shellsort | 659.90 | 1.0000 | YES | Dominated |
| Quicksort (Mo3) | 669.36 | 1.0000 | YES | Dominated |
| Splay Sort | 669.43 | 1.0000 | NO | Dominated |
| BFPRT Quicksort | 670.50 | 1.0000 | YES | Dominated |
| Binary Shell | 671.06 | 1.0000 | YES | Dominated |
| Skiplist Sort | 674.03 | 1.0000 | YES | Dominated |
| Circle Sort | 675.10 | 1.0000 | YES | Dominated |
| Polyphase Merge | 683.06 | 1.0000 | YES | Dominated |
| Replacement Selection | 683.96 | 1.0000 | YES | Dominated |
| Stooge Sort | 684.86 | 1.0000 | YES | Dominated |
| Out-of-place Heap | 686.58 | 1.0000 | YES | Dominated |
| Bose-Nelson | 690.35 | 1.0000 | YES | Dominated |
| Ternary Heap | 696.26 | 1.0000 | YES | Dominated |
| Weave Merge | 698.86 | 1.0000 | YES | Dominated |
| PESort | 708.32 | 1.0000 | YES | Dominated |
| Rotation Merge Sort | 712.98 | 1.0000 | NO | Dominated |
| Quaternary Heap | 714.11 | 1.0000 | YES | Dominated |
| Heap Sort | 716.56 | 1.0000 | YES | Dominated |
| Heap Sort (Smooth Proxy) | 716.70 | 1.0000 | YES | Dominated |
| Peeksort | 718.18 | 1.0000 | YES | Dominated |
| Blitsort | 720.38 | 1.0000 | YES | Dominated |
| Comb Sort | 722.10 | 1.0000 | YES | Dominated |
| Recursive Comb Sort | 722.79 | 1.0000 | YES | Dominated |
| BlockQuicksort | 723.28 | 1.0000 | NO | Dominated |
| Intro Sort | 724.03 | 1.0000 | NO | Dominated |
| PDQSort | 732.41 | 1.0000 | YES | Dominated |
| Crumsort | 739.52 | 1.0000 | YES | Dominated |
| Min-Max Heap | 740.66 | 1.0000 | YES | Dominated |
| Poplar Sort | 760.14 | 1.0000 | YES | Dominated |
| Bitonic Sort | 761.16 | 1.0000 | YES | Dominated |
| Bucket Sort | 764.12 | 1.0000 | NO | Dominated |
| Smoothsort | 773.35 | 1.0000 | YES | Dominated |
| Binary Merge | 786.92 | 1.0000 | NO | Dominated |
| Bozo Sort | 787.13 | 1.0000 | YES | Dominated |
| Bovo Sort | 798.77 | 1.0000 | YES | Dominated |
| Shear Sort | 802.26 | 1.0000 | YES | Dominated |
| Bogosort | 805.90 | 1.0000 | YES | Dominated |
| Exchange Bogo | 806.65 | 1.0000 | YES | Dominated |
| Full Rank | 807.74 | 1.0000 | NO | Dominated |
| 3-Smooth Comb | 827.94 | 1.0000 | YES | Dominated |
| Pratt Shellsort | 831.47 | 1.0000 | YES | Dominated |
| Binary Bottom-up Merge | 840.17 | 1.0000 | NO | Dominated |
| Less Bogo | 873.95 | 1.0000 | YES | Dominated |
| Spin Sort | 875.36 | 1.0000 | NO | Dominated |
| Patience Sort | 1007.42 | 1.0000 | YES | Dominated |
| Hayate-Shiki | 1026.15 | 1.0000 | YES | Dominated |
| Strand Sort | 1136.78 | 1.0000 | YES | Dominated |
| MEL Sort | 1184.09 | 1.0000 | YES | Dominated |
| Pancake Sort | 1250.75 | 1.0000 | YES | Dominated |
| Double Insertion | 1780.33 | 1.0000 | YES | Dominated |
| Cocktail Selection | 2101.26 | 1.0000 | YES | Dominated |
| Bingo Sort | 2192.77 | 1.0000 | YES | Dominated |
| Selection Sort | 2216.85 | 1.0000 | YES | Dominated |
| Recursive Selection | 2229.07 | 1.0000 | YES | Dominated |
| Recursive Double Selection | 2357.44 | 1.0000 | YES | Dominated |
| Double Selection | 2358.34 | 1.0000 | YES | Dominated |
| Recursive Insertion | 2560.34 | 1.0000 | NO | Dominated |
| Gnome Sort | 2563.90 | 1.0000 | YES | Dominated |
| Insertion Sort | 2573.30 | 1.0000 | NO | Dominated |
| Recursive Gnome | 2574.60 | 1.0000 | YES | Dominated |
| Bubble Sort | 2576.76 | 1.0000 | YES | Dominated |
| I Can't Believe It Can Sort | 2577.97 | 1.0000 | YES | Dominated |
| Exchange Sort | 2578.18 | 1.0000 | YES | Dominated |
| Stable Selection | 2580.41 | 1.0000 | YES | Dominated |
| Recursive Bubble | 2580.53 | 1.0000 | YES | Dominated |
| Cocktail Bounds | 2589.15 | 1.0000 | YES | Dominated |
| Cocktail Shaker | 2592.43 | 1.0000 | YES | Dominated |
| Recursive Cocktail | 2593.47 | 1.0000 | YES | Dominated |
| Odd-Even Sort | 2611.78 | 1.0000 | YES | Dominated |
| Odd-Even Bogo | 2612.23 | 1.0000 | YES | Dominated |
| Recursive Odd-Even Sort | 2613.96 | 1.0000 | YES | Dominated |
| Bubble Bogo | 2635.79 | 1.0000 | YES | Dominated |
### Interpretation of the web expansion and VQSort addendum

All 25 batch-3 providers and the VQSort addition sort correctly and reach τ=1.0000. Their comparison costs cover a wide range:

- **Closest new challengers.** Optimized Pancake is the lowest-battle batch-3 addition at **562.74**, followed by 4-way Powersort (**569.20**) and QuickMergesort (**579.34**); all three repeat at least one unordered pair. GrailSort's comparison skeleton is the best new no-duplicate row at **585.11**, still 58.17 battles behind Ford-Johnson.
- **Modern hybrids and block/external merges.** Twinsort (**593.20**), Fluxsort (**595.77**), Loser-Tree Merge (**600.69**, no duplicates), WikiSort (**614.78**, duplicates), Glidesort (**638.73**), Blitsort (**720.38**), and Crumsort (**739.52**) show that engineering for cache locality, branchlessness, stability, and data movement does not automatically minimize human comparisons. The Grail, Wiki, and Glide rows are explicitly documented comparison-level skeleton/configuration measurements, not CPU-speed claims about their production libraries.
- **Heap and gap families.** Out-of-place Heap (**686.58**) leads the new heaps, ahead of Ternary (**696.26**), Quaternary (**714.11**), Min-Max (**740.66**), and Poplar (**760.14**). Tokuda is the strongest added Shell sequence at **632.70**; Sedgewick reaches **659.90**, while 3-Smooth Comb (**827.94**) and Pratt Shellsort (**831.47**) are close despite using the same gaps with different passes.
- **Specialized constructions.** Weave Merge uses **698.86** battles, Spin Sort uses **875.36** without duplicates, MEL Sort pays **1184.09** for its encroaching lists on random input, Double Insertion uses **1780.33**, and Stable Selection lands in the quadratic cluster at **2580.41**.
- **VQSort fixed profile.** The u64/AVX2 comparison model uses **656.02** unique battles and repeats pairs. This row reflects scalarized comparator work, not VQSort's defining SIMD speed: four lane comparisons that execute concurrently in hardware are four potential human decisions here, while vector packing and memory optimizations add no battles.

The full implementation/source/fidelity matrix is in [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md). The raw benchmark output remains in `results.txt`; `research/audit_results.txt` independently records termination, valid pairs, sortedness, orientation, and duplicate behavior.

### Why Ford-Johnson remains the Production Knee Point

Ford-Johnson remains the production choice because it is the first practical no-duplicate point in the fresh frontier to reach perfect ranking accuracy: **526.94 battles** and **1.0000 Kendall Tau**. Budgeted Merge Sort uses slightly fewer battles (**520.00**) but reaches only **0.9631 Tau**. The 26 additional algorithms, including VQSort, are useful coverage and audit comparisons, not replacements for Quick Rank.

`node research/pareto_analysis.js` recomputes the no-duplicate frontier from `results.txt`. This run contains Sleep Sort, Miracle Sort, Budgeted Merge Sort, and Ford-Johnson. The joke-sort points below 100 battles have Tau near zero and their membership changes with random noise; they are not viable ranking methods. The meaningful frontier is still **Budgeted Merge Sort → Ford-Johnson**. Ford-Johnson is the operational knee because it is the first frontier entry at the 1.0000 accuracy ceiling while avoiding duplicate user questions.

#### The "No Duplicates" Constraint

PreferenceRank prioritizes user efficiency by excluding any algorithm that produces duplicate comparisons. Many high-performance algorithms (Timsort, Quicksort, Shellsort) are optimized for computer memory access patterns rather than minimizing unique human decisions. Ford-Johnson is a "Pure Unique" algorithm, ensuring every battle provides fresh data to the scoring model.

#### Shadow Wins and Transitive Closure

Ford-Johnson achieves its superior performance by applying a **shadow transitive closure** on the results of the partial merge spine. This allows the Bradley-Terry model to utilize inferred wins without requiring additional user battles, maximizing the information extracted from every decision.

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
