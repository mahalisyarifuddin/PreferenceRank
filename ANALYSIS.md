# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the benchmarking and analysis used to optimize the pair-generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared 85 distinct sorting algorithms. This run adds Stanley P. Y. Fung's ["I Can't Believe It Can Sort"](https://arxiv.org/abs/2110.01111) algorithm. Algorithms that request duplicate pairs are identified and excluded from the Pareto-optimal analysis so that the production choice reflects unique human decisions.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Run command:** `node research/sort_analysis.js 100 250`
- **Metric:** average number of unique battles and average Kendall Tau against randomly generated ground-truth strengths.

### Results (N=100)

| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
|-----------|-------------|-----------------|------------|---------------|
| Exit Sort | 0.00 | 0.0014 | NO | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0008 | NO | Dominated |
| Socialist Sort | 0.00 | -0.0016 | NO | Dominated |
| Sleep Sort | 0.00 | -0.0051 | NO | Dominated |
| Quantum Bogo | 1.65 | 0.0020 | NO | Pareto-optimal |
| BogoBogoSort | 26.63 | 0.0068 | YES | Dominated |
| Silly Sort | 71.65 | 0.1126 | YES | Dominated |
| Thanos Sort | 99.00 | 0.4994 | YES | Dominated |
| Miracle Sort | 99.00 | 0.4991 | NO | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3576 | NO | Dominated |
| Stalin Sort | 99.00 | 0.0340 | NO | Dominated |
| Hater Sort | 188.08 | 0.5638 | YES | Dominated |
| Random Sort | 209.52 | 0.5567 | YES | Dominated |
| Budgeted Merge Sort | 520.00 | 0.9631 | NO | Pareto-optimal |
| Ford-Johnson (Quick) | 526.64 | 1.0000 | NO | **Production knee** |
| Recursive Binary Insertion | 530.59 | 1.0000 | NO | Dominated |
| Binary Gnome | 531.26 | 1.0000 | NO | Dominated |
| Binary Insertion | 531.37 | 1.0000 | NO | Dominated |
| Timsort | 532.77 | 1.0000 | YES | Dominated |
| Merge Sort | 542.27 | 1.0000 | NO | Dominated |
| In-place Merge Sort | 542.29 | 1.0000 | NO | Dominated |
| 4-way Merge Sort | 543.93 | 1.0000 | NO | Dominated |
| Powersort | 557.14 | 1.0000 | YES | Dominated |
| Ping-pong Merge Sort | 558.13 | 1.0000 | NO | Dominated |
| Tournament Sort | 558.46 | 1.0000 | NO | Dominated |
| Bottom-up Merge Sort | 558.53 | 1.0000 | NO | Dominated |
| Parallel Merge Sort | 558.88 | 1.0000 | NO | Dominated |
| Quicksort (Ninther) | 562.76 | 1.0000 | YES | Dominated |
| 3-way Merge Sort | 567.70 | 1.0000 | NO | Dominated |
| Natural Merge Sort | 573.28 | 1.0000 | YES | Dominated |
| Slowsort | 580.84 | 0.9465 | YES | Dominated |
| Triple-Pivot Quicksort | 607.78 | 1.0000 | YES | Dominated |
| Binary Patience | 612.35 | 1.0000 | YES | Dominated |
| Shellsort | 629.84 | 1.0000 | YES | Dominated |
| Recursive Shellsort | 630.39 | 1.0000 | YES | Dominated |
| Cycle Sort | 642.53 | 1.0000 | YES | Dominated |
| Tree Sort | 643.05 | 1.0000 | NO | Dominated |
| Quicksort (RTL) | 643.28 | 1.0000 | NO | Dominated |
| Dual-Pivot Quicksort | 646.42 | 1.0000 | NO | Dominated |
| 3-Way Quicksort | 647.17 | 1.0000 | NO | Dominated |
| Parallel Quicksort | 648.95 | 1.0000 | NO | Dominated |
| Quicksort (Middle) | 650.32 | 1.0000 | NO | Dominated |
| Stable Quicksort | 651.65 | 1.0000 | NO | Dominated |
| Quicksort (LTR) | 652.04 | 1.0000 | NO | Dominated |
| Quicksort (Hoare) | 652.35 | 1.0000 | YES | Dominated |
| Quicksort (Random) | 652.83 | 1.0000 | NO | Dominated |
| Binary Shell | 672.12 | 1.0000 | YES | Dominated |
| Quicksort (Mo3) | 675.50 | 1.0000 | YES | Dominated |
| Circle Sort | 676.34 | 1.0000 | YES | Dominated |
| Stooge Sort | 686.91 | 1.0000 | YES | Dominated |
| Rotation Merge Sort | 714.30 | 1.0000 | NO | Dominated |
| Heap Sort | 715.19 | 1.0000 | YES | Dominated |
| Smooth Sort | 716.61 | 1.0000 | YES | Dominated |
| Intro Sort | 716.90 | 1.0000 | NO | Dominated |
| BlockQuicksort | 717.91 | 1.0000 | NO | Dominated |
| Comb Sort | 718.41 | 1.0000 | YES | Dominated |
| Recursive Comb Sort | 721.14 | 1.0000 | YES | Dominated |
| PDQSort | 728.18 | 1.0000 | YES | Dominated |
| Bitonic Sort | 759.97 | 1.0000 | YES | Dominated |
| Bucket Sort | 766.26 | 1.0000 | NO | Dominated |
| Binary Merge | 786.55 | 1.0000 | NO | Dominated |
| Full Rank | 810.80 | 1.0000 | NO | Dominated |
| Bogosort | 810.89 | 1.0000 | YES | Dominated |
| Binary Bottom-up Merge | 836.42 | 1.0000 | NO | Dominated |
| Hayate-Shiki | 844.89 | 0.8426 | YES | Dominated |
| Radix Sort | 878.08 | 1.0000 | YES | Dominated |
| Patience Sort | 1006.82 | 1.0000 | YES | Dominated |
| Strand Sort | 1116.82 | 1.0000 | YES | Dominated |
| Pancake Sort | 1251.65 | 1.0000 | YES | Dominated |
| Cocktail Selection | 2105.65 | 1.0000 | YES | Dominated |
| Recursive Selection | 2213.13 | 1.0000 | YES | Dominated |
| Selection Sort | 2217.96 | 1.0000 | YES | Dominated |
| Double Selection | 2331.02 | 1.0000 | YES | Dominated |
| Recursive Double Selection | 2348.08 | 1.0000 | YES | Dominated |
| Recursive Gnome | 2556.46 | 1.0000 | YES | Dominated |
| Recursive Insertion | 2568.33 | 1.0000 | NO | Dominated |
| Bubble Sort | 2569.73 | 1.0000 | YES | Dominated |
| Gnome Sort | 2576.56 | 1.0000 | YES | Dominated |
| Insertion Sort | 2577.76 | 1.0000 | NO | Dominated |
| I Can't Believe It Can Sort | 2577.82 | 1.0000 | YES | Dominated |
| Cocktail Shaker | 2578.00 | 1.0000 | YES | Dominated |
| Recursive Bubble | 2578.36 | 1.0000 | YES | Dominated |
| Recursive Cocktail | 2597.78 | 1.0000 | YES | Dominated |
| Odd-Even Sort | 2601.10 | 1.0000 | YES | Dominated |
| Recursive Odd-Even Sort | 2608.76 | 1.0000 | YES | Dominated |

### Interpretation of the new entry

Fung's algorithm is implemented as the two nested loops from the paper: every position `i` is compared with every position `j`, swapping when `A[i] < A[j]`. The state-machine provider preserves that order and therefore makes **N² positional comparison requests**. At N=100, the rerun measured **2,577.82 unique battles**, a **1.0000 Kendall Tau**, and **duplicate requests: YES**. The duplicate flag is expected: the algorithm deliberately revisits pairs as the array changes. It sorts correctly, but is excluded from the production frontier under PreferenceRank's no-duplicate constraint.

### Why Ford-Johnson remains the Production Knee Point

Ford-Johnson remains the production choice because it is the first practical no-duplicate point in the fresh frontier to reach perfect ranking accuracy: **526.64 battles** and **1.0000 Kendall Tau**. Budgeted Merge Sort uses slightly fewer battles (**520.00**) but reaches only **0.9631 Tau**. The newly benchmarked algorithm is therefore a useful correctness and efficiency comparison, not a replacement for Quick Rank.

The Pareto analysis can be recomputed with `node research/pareto_analysis.js`; it reads the current `results.txt` rather than maintaining a second hard-coded result set. The no-duplicate frontier for this run contains Exit Sort, Quantum Bogo, Miracle Sort, Budgeted Merge Sort, and Ford-Johnson. The low-battle points trade away ranking accuracy; Ford-Johnson is the selected operational knee because it is the first frontier entry at the 1.0000 accuracy ceiling while still avoiding duplicate user questions.

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
