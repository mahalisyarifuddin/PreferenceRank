# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the benchmarking and analysis used to optimize the pair-generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared 118 distinct sorting algorithms. This run adds 32 newly implemented providers plus the registration of the previously unregistered Bozo Sort, covering sorting networks, heap variants, tree sorts, adaptive mergesorts, distribution sorts, mesh sorts, and the bogo family (see the rerun note and [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)). Algorithms that request duplicate pairs are identified and excluded from the Pareto-optimal analysis so that the production choice reflects unique human decisions.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Run command:** `node research/sort_analysis.js 100 250`
- **Metric:** average number of unique battles and average Kendall Tau against randomly generated ground-truth strengths.
- **Rerun note (2026-09-03):** a correctness audit of all 85 providers ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)) fixed Intro Sort (mixed comparison orientations between its partition/insertion/heapsort branches), Tournament Sort (dropped the weakest element), and Hayate-Shiki (inverted merge comparator; Kendall Tau improves from 0.8426 to 1.0000). "Radix Sort" — which was not a radix sort — was replaced by a faithful **Binary Quicksort**, "Smooth Sort" was relabeled **Heap Sort (Smooth Proxy)**, and Silly Sort now performs the actual silly recursion. Rows for these six algorithms were re-measured with the same protocol; all other rows are retained from the original run (each algorithm is simulated independently). The Pareto frontier and the Ford-Johnson knee point are unchanged.
- **Rerun note (2026-09-11):** batch-2 expansion to 118 providers (32 new: Batcher Odd-Even, Bose-Nelson, Exchange, Bingo, Cocktail Bounds, Bottom-up Heap, Weak Heap, genuine Smoothsort, Splay, Cartesian Tree, Treap, Skiplist, the three Shivers sorts, Peeksort, Library, Sample, Funnel, Quadsort, Piposort, Replacement Selection, Polyphase Merge, BFPRT Quicksort, Shear Sort, PESort, Permutation Sort, Less/Exchange/Bubble/Odd-Even Bogo, Bovo Sort; plus Bozo Sort registration). This is a full fresh run: every row was re-measured with the same protocol, so retained rows differ slightly from the 2026-09-03 table (fresh random strengths per trial, ±2 battles typical). All 118 providers pass the hardened correctness audit ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md), batch-2 addendum). The meaningful Pareto frontier (Budgeted Merge Sort → Ford-Johnson) and the production knee are unchanged; membership churn among the 0-battle joke sorts (Sleep Sort displacing Exit Sort / Quantum Bogo) is pure noise in near-zero Tau values (see below).

### Results (N=100)

| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
|-----------|-------------|-----------------|------------|---------------|
| Exit Sort | 0.00 | -0.0013 | NO | Dominated |
| Intelligent Design | 0.00 | -0.0016 | NO | Dominated |
| Sleep Sort | 0.00 | 0.0054 | NO | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0010 | NO | Dominated |
| Permutation Sort | 1.74 | -0.0006 | YES | Dominated |
| Quantum Bogo | 1.74 | 0.0022 | NO | Dominated |
| BogoBogoSort | 26.53 | 0.0139 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3444 | NO | Dominated |
| Miracle Sort | 99.00 | 0.4935 | NO | Pareto-optimal |
| Stalin Sort | 99.00 | 0.0444 | NO | Dominated |
| Thanos Sort | 99.00 | 0.4985 | YES | Dominated |
| Hater Sort | 187.88 | 0.5640 | YES | Dominated |
| Silly Sort | 202.04 | 0.1279 | YES | Dominated |
| Random Sort | 221.85 | 0.5770 | YES | Dominated |
| Budgeted Merge Sort | 520.00 | 0.9666 | NO | Pareto-optimal |
| Ford-Johnson (Quick) | 526.83 | 1.0000 | NO | **Production knee** |
| Binary Insertion | 530.27 | 1.0000 | NO | Dominated |
| Binary Gnome | 531.10 | 1.0000 | NO | Dominated |
| Recursive Binary Insertion | 531.10 | 1.0000 | NO | Dominated |
| Timsort | 532.32 | 1.0000 | YES | Dominated |
| Library Sort | 537.90 | 1.0000 | YES | Dominated |
| In-place Merge Sort | 541.97 | 1.0000 | NO | Dominated |
| Merge Sort | 542.17 | 1.0000 | NO | Dominated |
| 4-way Merge Sort | 543.71 | 1.0000 | NO | Dominated |
| Powersort | 558.03 | 1.0000 | YES | Dominated |
| Parallel Merge Sort | 558.33 | 1.0000 | NO | Dominated |
| Ping-pong Merge Sort | 558.33 | 1.0000 | NO | Dominated |
| Tournament Sort | 558.68 | 1.0000 | NO | Dominated |
| Bottom-up Merge Sort | 558.79 | 1.0000 | NO | Dominated |
| Quicksort (Ninther) | 563.19 | 1.0000 | YES | Dominated |
| 3-way Merge Sort | 568.56 | 1.0000 | NO | Dominated |
| Quadsort | 571.38 | 1.0000 | YES | Dominated |
| Adaptive Shivers | 572.29 | 1.0000 | YES | Dominated |
| Natural Merge Sort | 573.88 | 1.0000 | YES | Dominated |
| Shivers Sort | 574.32 | 1.0000 | YES | Dominated |
| Augmented Shivers | 574.58 | 1.0000 | YES | Dominated |
| Weak Heap | 581.14 | 1.0000 | YES | Dominated |
| Funnel Sort | 582.40 | 1.0000 | NO | Dominated |
| Slowsort | 588.77 | 0.9430 | YES | Dominated |
| Piposort | 599.32 | 1.0000 | YES | Dominated |
| Bottom-up Heap | 599.70 | 1.0000 | YES | Dominated |
| Triple-Pivot Quicksort | 604.28 | 1.0000 | YES | Dominated |
| Binary Patience | 613.18 | 1.0000 | YES | Dominated |
| Batcher Odd-Even | 626.10 | 1.0000 | YES | Dominated |
| Recursive Shellsort | 627.72 | 1.0000 | YES | Dominated |
| Shellsort | 630.09 | 1.0000 | YES | Dominated |
| Sample Sort | 640.46 | 1.0000 | YES | Dominated |
| Quicksort (RTL) | 645.00 | 1.0000 | NO | Dominated |
| Cartesian Tree | 645.11 | 1.0000 | YES | Dominated |
| 3-Way Quicksort | 645.83 | 1.0000 | NO | Dominated |
| Quicksort (Hoare) | 646.31 | 1.0000 | YES | Dominated |
| Quicksort (Middle) | 646.31 | 1.0000 | NO | Dominated |
| Dual-Pivot Quicksort | 647.59 | 1.0000 | NO | Dominated |
| Quicksort (LTR) | 647.62 | 1.0000 | NO | Dominated |
| Quicksort (Random) | 647.93 | 1.0000 | NO | Dominated |
| Tree Sort | 648.08 | 1.0000 | NO | Dominated |
| Treap Sort | 648.41 | 1.0000 | NO | Dominated |
| Parallel Quicksort | 649.76 | 1.0000 | NO | Dominated |
| Binary Quicksort | 650.22 | 1.0000 | NO | Dominated |
| Cycle Sort | 651.99 | 1.0000 | YES | Dominated |
| Stable Quicksort | 652.06 | 1.0000 | NO | Dominated |
| Splay Sort | 667.68 | 1.0000 | NO | Dominated |
| Binary Shell | 671.32 | 1.0000 | YES | Dominated |
| BFPRT Quicksort | 673.62 | 1.0000 | YES | Dominated |
| Skiplist Sort | 675.78 | 1.0000 | YES | Dominated |
| Circle Sort | 676.44 | 1.0000 | YES | Dominated |
| Quicksort (Mo3) | 680.80 | 1.0000 | YES | Dominated |
| Replacement Selection | 682.91 | 1.0000 | YES | Dominated |
| Polyphase Merge | 684.23 | 1.0000 | YES | Dominated |
| Stooge Sort | 686.78 | 1.0000 | YES | Dominated |
| Bose-Nelson | 694.25 | 1.0000 | YES | Dominated |
| PESort | 701.62 | 1.0000 | YES | Dominated |
| Rotation Merge Sort | 713.22 | 1.0000 | NO | Dominated |
| Heap Sort (Smooth Proxy) | 716.69 | 1.0000 | YES | Dominated |
| Heap Sort | 717.39 | 1.0000 | YES | Dominated |
| BlockQuicksort | 717.82 | 1.0000 | NO | Dominated |
| Peeksort | 718.55 | 1.0000 | YES | Dominated |
| Recursive Comb Sort | 718.62 | 1.0000 | YES | Dominated |
| Comb Sort | 718.82 | 1.0000 | YES | Dominated |
| Intro Sort | 720.58 | 1.0000 | NO | Dominated |
| PDQSort | 729.60 | 1.0000 | YES | Dominated |
| Bitonic Sort | 759.95 | 1.0000 | YES | Dominated |
| Bucket Sort | 770.53 | 1.0000 | NO | Dominated |
| Smoothsort | 775.66 | 1.0000 | YES | Dominated |
| Bozo Sort | 784.76 | 1.0000 | YES | Dominated |
| Binary Merge | 785.57 | 1.0000 | NO | Dominated |
| Bovo Sort | 801.68 | 1.0000 | YES | Dominated |
| Exchange Bogo | 804.34 | 1.0000 | YES | Dominated |
| Full Rank | 806.34 | 1.0000 | NO | Dominated |
| Bogosort | 806.66 | 1.0000 | YES | Dominated |
| Shear Sort | 806.85 | 1.0000 | YES | Dominated |
| Binary Bottom-up Merge | 835.62 | 1.0000 | NO | Dominated |
| Less Bogo | 880.39 | 1.0000 | YES | Dominated |
| Patience Sort | 1007.38 | 1.0000 | YES | Dominated |
| Hayate-Shiki | 1022.55 | 1.0000 | YES | Dominated |
| Strand Sort | 1120.03 | 1.0000 | YES | Dominated |
| Pancake Sort | 1251.63 | 1.0000 | YES | Dominated |
| Cocktail Selection | 2119.07 | 1.0000 | YES | Dominated |
| Recursive Selection | 2200.96 | 1.0000 | YES | Dominated |
| Selection Sort | 2210.63 | 1.0000 | YES | Dominated |
| Bingo Sort | 2217.54 | 1.0000 | YES | Dominated |
| Double Selection | 2333.40 | 1.0000 | YES | Dominated |
| Recursive Double Selection | 2339.21 | 1.0000 | YES | Dominated |
| Recursive Cocktail | 2554.88 | 1.0000 | YES | Dominated |
| Gnome Sort | 2562.44 | 1.0000 | YES | Dominated |
| Recursive Insertion | 2562.93 | 1.0000 | NO | Dominated |
| Cocktail Bounds | 2566.19 | 1.0000 | YES | Dominated |
| Insertion Sort | 2567.00 | 1.0000 | NO | Dominated |
| I Can't Believe It Can Sort | 2567.80 | 1.0000 | YES | Dominated |
| Exchange Sort | 2570.02 | 1.0000 | YES | Dominated |
| Recursive Bubble | 2579.20 | 1.0000 | YES | Dominated |
| Bubble Sort | 2581.10 | 1.0000 | YES | Dominated |
| Cocktail Shaker | 2584.71 | 1.0000 | YES | Dominated |
| Recursive Gnome | 2592.81 | 1.0000 | YES | Dominated |
| Odd-Even Sort | 2599.20 | 1.0000 | YES | Dominated |
| Recursive Odd-Even Sort | 2601.19 | 1.0000 | YES | Dominated |
| Bubble Bogo | 2618.13 | 1.0000 | YES | Dominated |
| Odd-Even Bogo | 2633.71 | 1.0000 | YES | Dominated |

### Interpretation of the new entries

The 32 new providers all sort correctly (τ = 1.0000 wherever they complete) but land across the cost spectrum, and none displaces Ford-Johnson on the no-duplicate frontier:

- **Near the leaders.** Library Sort (**537.90** battles) slots in just behind Timsort — gapped binary insertion behaves like binary insertion here. The Shivers family (**572–575**) and Quadsort (**571.38**) sit beside Powersort/Natural Merge; Weak Heap (**581.14**), Funnel Sort (**582.40**, no duplicates — its winner-tree merge never re-asks a pair at N=100), Piposort (**599.32**), and Bottom-up Heap (**599.70**) cluster nearby.
- **Mid-table.** Sample Sort (**640.46**), Cartesian Tree (**645.11**), Treap Sort (**648.41**, no duplicates), and Splay Sort (**667.68**, no duplicates) behave like ordinary quicksort-class sorts. BFPRT Quicksort (**673.62**) pays for its linear-time pivot guarantees; Replacement Selection (**682.91**) and Polyphase Merge (**684.23**) track each other closely, as they should — Polyphase reuses Replacement Selection's runs and only re-merges them. Bose-Nelson (**694.25**), PESort (**701.62**), Peeksort (**718.55** — linear-insertion leaves hurt it on random data; it wins on presorted inputs), and genuine Smoothsort (**775.66**) round out the band.
- **Networks.** Batcher Odd-Even (**626.10**) issues ~1792 positional comparators at N=100 but only 626 unique battles survive transitive collapse — the same effect that puts Bitonic at 759.95.
- **Mesh.** Shear Sort (**806.85**) completes its 16 snake phases correctly; odd-even lines re-ask pairs, hence duplicates YES.
- **Bogo family.** The inversion-descent variants finish: Exchange Bogo (**804.34**), Bubble Bogo (**2618.13**), Odd-Even Bogo (**2633.71**), and Less Bogo (**880.39**). Bozo Sort (**784.76**), Bogosort (**806.66**), and Bovo Sort (**801.68**) never finish within the 1M-iteration cap, yet report τ = 1.0000: once ~800 unique battles determine the total order, every further pair is answered from transitive closure and the unique count freezes — the same mechanism behind Full Rank's 806.34 (it asks all 4950 pairs, but only ~806 are ever *new* information). Permutation Sort (**1.74**, τ ≈ 0) is the mirror image: lexicographic enumeration from the identity re-asks the same head pairs for its first ~98! permutations, so almost nothing is unique.
- **Selection/insertion band.** Bingo Sort (**2217.54**) joins the selection sorts; Exchange Sort (**2570.02**) and Cocktail Bounds (**2566.19**) join the insertion/bubble band, as their Θ(n²) positional requests predict. Fung's "I Can't Believe It Can Sort" re-measures at **2567.80**/1.0000/YES, consistent with its N² positional requests.

### Why Ford-Johnson remains the Production Knee Point

Ford-Johnson remains the production choice because it is the first practical no-duplicate point in the fresh frontier to reach perfect ranking accuracy: **526.83 battles** and **1.0000 Kendall Tau**. Budgeted Merge Sort uses slightly fewer battles (**520.00**) but reaches only **0.9666 Tau**. The 33 newly benchmarked algorithms are therefore useful correctness and efficiency comparisons, not replacements for Quick Rank.

The Pareto analysis can be recomputed with `node research/pareto_analysis.js`; it reads the current `results.txt` rather than maintaining a second hard-coded result set. The no-duplicate frontier for this run contains Sleep Sort, Miracle Sort, Budgeted Merge Sort, and Ford-Johnson. The low-battle end differs from the 2026-09-03 frontier (Exit Sort, Quantum Bogo, …) purely by noise: the 0-battle jokes all have Tau ≈ 0 ± 0.005, so whichever lands highest (Sleep Sort at 0.0054 this time) is Pareto-optimal by luck. The meaningful part of the frontier — Budgeted Merge Sort → Ford-Johnson — is unchanged across runs. The low-battle points trade away ranking accuracy; Ford-Johnson is the selected operational knee because it is the first frontier entry at the 1.0000 accuracy ceiling while still avoiding duplicate user questions.

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
