# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared 68 distinct sorting algorithms. A key requirement for production is the elimination of duplicate pairwise comparisons. Algorithms that request the same pair twice are now identified and excluded from the Pareto-optimal knee point analysis (using a log-scale axis for unique battle counts) to ensure maximum user efficiency.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.

### Results (N=100)
| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
|-----------|-------------|-----------------|------------|---------------|
| Socialist Sort | 0.00 | 0.0051 | NO | Pareto-optimal |
| Quantum Bogo | 1.66 | 0.0150 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5443 | NO | Pareto-optimal |
| Ford-Johnson | 527.00 | 0.8881 | NO | Pareto-optimal |
| In-place Merge Sort | 541.79 | 0.9037 | NO | Pareto-optimal |
| **Merge Sort** | 542.10 | 0.9047 | NO | **Production Knee Point** |
| Rotation Merge Sort | 719.14 | 0.9162 | NO | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| BogoBogoSort | 45.08 | 0.0897 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3413 | NO | Dominated |
| Stalin Sort | 99.00 | 0.0962 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5432 | YES | Dominated |
| Smooth Sort | 99.10 | 0.4819 | YES | Dominated |
| Heap Sort | 99.63 | 0.4831 | YES | Dominated |
| Sleep Sort | 100.00 | 0.0042 | NO | Dominated |
| 3-Way Quicksort | 100.40 | 0.3521 | YES | Dominated |
| Silly Sort | 138.00 | 0.2409 | YES | Dominated |
| PDQSort | 194.04 | 0.5397 | YES | Dominated |
| Hater Sort | 195.92 | 0.6617 | YES | Dominated |
| Patience Sort | 198.63 | 0.4815 | YES | Dominated |
| Quicksort (Hoare) | 202.81 | 0.5319 | YES | Dominated |
| Random Sort | 227.79 | 0.6268 | YES | Dominated |
| Cycle Sort | 493.04 | 0.4458 | YES | Dominated |
| Binary Insertion | 530.58 | 0.8876 | NO | Dominated |
| Timsort | 532.86 | 0.8958 | YES | Dominated |
| Triple-Pivot Quicksort | 534.81 | 0.8273 | YES | Dominated |
| 4-way Merge Sort | 543.85 | 0.9035 | NO | Dominated |
| Ping-pong Merge Sort | 558.01 | 0.8861 | NO | Dominated |
| Tournament Sort | 558.23 | 0.8862 | NO | Dominated |
| Parallel Merge Sort | 558.36 | 0.8869 | NO | Dominated |
| Bottom-up Merge Sort | 558.58 | 0.8872 | NO | Dominated |
| Powersort | 562.20 | 0.9067 | YES | Dominated |
| 3-way Merge Sort | 567.92 | 0.8801 | NO | Dominated |
| Natural Merge Sort | 576.91 | 0.8936 | YES | Dominated |
| Quicksort (Ninther) | 605.08 | 0.8424 | YES | Dominated |
| Parallel Quicksort | 640.13 | 0.8366 | NO | Dominated |
| Quicksort (Random) | 644.97 | 0.8364 | NO | Dominated |
| Quicksort (LTR) | 645.43 | 0.8367 | NO | Dominated |
| Tree Sort | 650.48 | 0.8373 | NO | Dominated |
| Quicksort (Middle) | 651.15 | 0.8371 | NO | Dominated |
| Dual-Pivot Quicksort | 651.60 | 0.8368 | NO | Dominated |
| Stable Quicksort | 651.68 | 0.8371 | NO | Dominated |
| Quicksort (RTL) | 652.68 | 0.8365 | NO | Dominated |
| Shellsort | 670.90 | 0.9323 | YES | Dominated |
| BlockQuicksort | 712.38 | 0.8074 | NO | Dominated |
| Quicksort (Mo3) | 714.68 | 0.8273 | YES | Dominated |
| Intro Sort | 722.48 | 0.8080 | NO | Dominated |
| Strand Sort | 752.38 | 0.8175 | NO | Dominated |
| Bucket Sort | 777.16 | 0.7984 | NO | Dominated |
| Comb Sort | 852.84 | 0.9747 | YES | Dominated |
| Hayate-Shiki | 930.26 | 0.7829 | YES | Dominated |
| Bitonic Sort | 1036.59 | 0.9578 | YES | Dominated |
| Circle Sort | 1205.53 | 0.9689 | YES | Dominated |
| Slowsort | 1323.76 | 0.9483 | YES | Dominated |
| Gnome Sort | 2559.98 | 0.8021 | YES | Dominated |
| Insertion Sort | 2569.62 | 0.8023 | NO | Dominated |
| Bubble Sort | 2571.98 | 0.8024 | YES | Dominated |
| Odd-Even Sort | 2585.90 | 0.8037 | YES | Dominated |
| Cocktail Shaker | 2591.84 | 0.8087 | YES | Dominated |
| Selection Sort | 2757.05 | 0.8894 | YES | Dominated |
| Cocktail Selection | 2769.04 | 0.9232 | YES | Dominated |
| Double Selection | 2778.82 | 0.9220 | YES | Dominated |
| Stooge Sort | 2889.10 | 0.9900 | YES | Dominated |
| Pancake Sort | 3083.51 | 0.9688 | YES | Dominated |
| Radix Sort | 4555.54 | 0.9493 | YES | Dominated |
| Bogosort | 4950.00 | 1.0000 | YES | Dominated |
## 2. In-place and Block Merge Sort Comparison

The following sections detail the trade-offs between vanilla merge sort, basic in-place merge sort, and block merge sort variants.

### Memory Usage

* **Vanilla Merge Sort:** Requires O(n) auxiliary space. It allocates a secondary scratchpad array of identical size to the input to handle data blending.
* **In-Place Merge Sort:** Requires O(1) auxiliary space for iterative variants, or $O(\log n)$ space for recursive versions to manage the call stack. No secondary data buffer is generated.

### Time Complexity and Performance

* **Vanilla Merge Sort:** Guarantees a strict $O(n \log n)$ time complexity across best, worst, and average cases. It is fast in practice because elements are copied sequentially, which maximizes CPU cache efficiency.
* **In-Place Merge Sort:** Often degrades in speed. Basic implementations drop to O(n²) time due to frequent internal element shifts (similar to insertion sort mechanics). Rotation-based in-place merge (like `Rotation Merge Sort`) achieves $O(n \log^2 n)$ but runs significantly slower due to intense pointer swap overhead and poor CPU cache locality. Highly optimized block merge sorts achieve $O(n \log n)$ but are extremely complex to implement.

### Algorithmic Stability

* **Vanilla Merge Sort:** Inherently stable. It naturally preserves the original relative order of duplicate elements because it merges left-to-right from distinct arrays.
* **In-Place Merge Sort:** Frequently unstable. To avoid allocating memory, most versions must pass elements around via complex data rotations or internal swaps, which typically destroys the relative ordering of identical keys.
* **Block Merge Sort:** A highly complex variant that achieves stable $O(n \log n)$ sorting with O(1) auxiliary space by using an internal buffer extracted from the data itself.

### Structural Comparison

| Feature | Vanilla Merge Sort | In-Place (Rotation) | Block Merge Sort |
| :--- | :--- | :--- | :--- |
| Time Complexity | $O(n \log n)$ | $O(n \log^2 n)$ | $O(n \log n)$ |
| Auxiliary Space | O(n) | O(1) or $O(\log n)$ | O(1) |
| Stability | Stable | Unstable | Stable |
| Implementation Complexity | Simple | Moderate | Very High |

### Battle Count Estimate Regression
For Merge Sort (the new Production Knee Point):
- **Formula:** `Unique Battles ≈ N * log2(N) - (N - 1)`
- For N=100, this predicts ~565 battles (simulated ~542 unique on average).

---

## 3. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~43% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).

## 4. Benchmark Stability and Trial Optimization

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
