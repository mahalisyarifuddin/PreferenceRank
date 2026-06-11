# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared 67 distinct sorting algorithms. A key requirement for production is the elimination of duplicate pairwise comparisons. Algorithms that request the same pair twice are now identified and excluded from the Pareto-optimal knee point analysis to ensure maximum user efficiency.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Metric 1: Avg Battles:** Total unique comparisons presented to the user.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores (BT).
- **Metric 3: Duplicates:** Indicates if the algorithm ever requests the same pair twice during a single sort.

### Results (N=100)
| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
| :--- | :--- | :--- | :--- | :--- |
| Exit Sort | 0.00 | 0.0108 | NO | Pareto-optimal |
| Quantum Bogo | 1.69 | 0.0135 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5480 | NO | Pareto-optimal |
| Ford-Johnson | 526.71 | 0.8880 | NO | Pareto-optimal |
| In-place Merge Sort | 541.60 | 0.9038 | NO | Pareto-optimal |
| **Merge Sort** | 541.74 | 0.9023 | NO | **Production Knee Point** |
| Bucket Sort | 757.80 | 0.8007 | NO | Dominated |
| Radix Sort | 4527.58 | 0.9458 | YES | Dominated |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0069 | NO | Dominated |
| Socialist Sort | 0.00 | -0.0056 | NO | Dominated |
| BogoBogoSort | 44.02 | 0.0863 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3686 | NO | Dominated |
| Stalin Sort | 99.00 | 0.1018 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5459 | YES | Dominated |
| Heap Sort | 99.67 | 0.4807 | YES | Dominated |
| Sleep Sort | 100.00 | -0.0034 | NO | Dominated |
| Smooth Sort | 100.24 | 0.4913 | YES | Dominated |
| 3-Way Quicksort | 102.38 | 0.3577 | YES | Dominated |
| Silly Sort | 138.00 | 0.2387 | YES | Dominated |
| Hater Sort | 196.06 | 0.6620 | YES | Dominated |
| PDQSort | 196.92 | 0.5634 | YES | Dominated |
| Patience Sort | 200.01 | 0.4884 | YES | Dominated |
| Quicksort (Hoare) | 204.74 | 0.5232 | YES | Dominated |
| Random Sort | 237.53 | 0.6367 | YES | Dominated |
| Cycle Sort | 454.58 | 0.4163 | YES | Dominated |
| Binary Insertion | 530.88 | 0.8870 | NO | Dominated |
| Timsort | 531.96 | 0.8968 | YES | Dominated |
| Triple-Pivot Quicksort | 536.18 | 0.8260 | YES | Dominated |
| 4-way Merge Sort | 543.80 | 0.9037 | NO | Dominated |
| Ping-pong Merge Sort | 558.32 | 0.8858 | NO | Dominated |
| Bottom-up Merge Sort | 558.52 | 0.8874 | NO | Dominated |
| Parallel Merge Sort | 558.52 | 0.8866 | NO | Dominated |
| Tournament Sort | 559.18 | 0.8869 | NO | Dominated |
| Powersort | 562.34 | 0.9084 | YES | Dominated |
| 3-way Merge Sort | 568.24 | 0.8797 | NO | Dominated |
| Natural Merge Sort | 577.01 | 0.8915 | YES | Dominated |
| Quicksort (Ninther) | 604.84 | 0.8421 | YES | Dominated |
| Tree Sort | 643.40 | 0.8367 | NO | Dominated |
| Quicksort (Random) | 643.62 | 0.8367 | NO | Dominated |
| Stable Quicksort | 644.48 | 0.8370 | NO | Dominated |
| Parallel Quicksort | 646.26 | 0.8369 | NO | Dominated |
| Quicksort (LTR) | 647.45 | 0.8372 | NO | Dominated |
| Quicksort (RTL) | 650.88 | 0.8370 | NO | Dominated |
| Dual-Pivot Quicksort | 651.85 | 0.8369 | NO | Dominated |
| Quicksort (Middle) | 654.45 | 0.8373 | NO | Dominated |
| Shellsort | 672.14 | 0.9322 | YES | Dominated |
| Quicksort (Mo3) | 717.40 | 0.8269 | YES | Dominated |
| BlockQuicksort | 720.58 | 0.8067 | NO | Dominated |
| Intro Sort | 727.61 | 0.8076 | NO | Dominated |
| Strand Sort | 744.26 | 0.8188 | NO | Dominated |
| Comb Sort | 851.56 | 0.9746 | YES | Dominated |
| Hayate-Shiki | 930.30 | 0.7827 | YES | Dominated |
| Bitonic Sort | 1035.41 | 0.9578 | YES | Dominated |
| Circle Sort | 1205.64 | 0.9688 | YES | Dominated |
| Slowsort | 1321.66 | 0.9486 | YES | Dominated |
| Bubble Sort | 2567.80 | 0.8012 | YES | Dominated |
| Cocktail Shaker | 2568.30 | 0.8049 | YES | Dominated |
| Gnome Sort | 2568.67 | 0.8027 | YES | Dominated |
| Insertion Sort | 2585.11 | 0.8046 | NO | Dominated |
| Odd-Even Sort | 2618.44 | 0.8069 | YES | Dominated |
| Selection Sort | 2732.37 | 0.8899 | YES | Dominated |
| Cocktail Selection | 2750.68 | 0.9219 | YES | Dominated |
| Double Selection | 2766.21 | 0.9219 | YES | Dominated |
| Stooge Sort | 2898.02 | 0.9900 | YES | Dominated |
| Pancake Sort | 3079.41 | 0.9686 | YES | Dominated |
| Bogosort | 4950.00 | 1.0000 | YES | Dominated |

### Battle Count Estimate Regression
For Merge Sort (the new Production Knee Point):
- **Formula:** `Unique Battles ≈ N * log2(N) - (N - 1)`
- For N=100, this predicts ~565 battles (simulated ~542 unique on average).

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~43% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).

## 3. Benchmark Stability and Trial Optimization

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
