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
| Exit Sort | 0.00 | 0.0042 | NO | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0185 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5443 | NO | Pareto-optimal |
| Ford-Johnson | 526.50 | 0.8883 | NO | Pareto-optimal |
| In-place Merge Sort | 541.92 | 0.9032 | NO | Pareto-optimal |
| **Merge Sort** | 542.40 | 0.9043 | NO | **Production Knee Point** |
| 4-way Merge Sort | 543.64 | 0.9049 | NO | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0002 | NO | Dominated |
| Socialist Sort | 0.00 | 0.0024 | NO | Dominated |
| BogoBogoSort | 44.38 | 0.0907 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3493 | NO | Dominated |
| Stalin Sort | 99.00 | 0.1004 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5477 | YES | Dominated |
| Heap Sort | 99.44 | 0.4757 | YES | Dominated |
| Smooth Sort | 99.90 | 0.4822 | YES | Dominated |
| Sleep Sort | 100.00 | -0.0018 | NO | Dominated |
| 3-Way Quicksort | 100.40 | 0.3553 | YES | Dominated |
| Silly Sort | 138.00 | 0.2414 | YES | Dominated |
| PDQSort | 193.24 | 0.5299 | YES | Dominated |
| Hater Sort | 196.16 | 0.6601 | YES | Dominated |
| Patience Sort | 197.36 | 0.4817 | YES | Dominated |
| Quicksort (Hoare) | 208.18 | 0.5422 | YES | Dominated |
| Random Sort | 225.15 | 0.6326 | YES | Dominated |
| Binary Insertion | 530.22 | 0.8863 | NO | Dominated |
| Triple-Pivot Quicksort | 530.84 | 0.8291 | YES | Dominated |
| Timsort | 532.74 | 0.8953 | YES | Dominated |
| Parallel Merge Sort | 558.11 | 0.8871 | NO | Dominated |
| Ping-pong Merge Sort | 558.48 | 0.8880 | NO | Dominated |
| Tournament Sort | 559.00 | 0.8879 | NO | Dominated |
| Bottom-up Merge Sort | 559.05 | 0.8872 | NO | Dominated |
| Powersort | 563.29 | 0.9088 | YES | Dominated |
| 3-way Merge Sort | 566.74 | 0.8792 | NO | Dominated |
| Natural Merge Sort | 577.60 | 0.8922 | YES | Dominated |
| Quicksort (Ninther) | 604.68 | 0.8421 | YES | Dominated |
| Quicksort (RTL) | 639.08 | 0.8365 | NO | Dominated |
| Cycle Sort | 640.01 | 0.4481 | YES | Dominated |
| Tree Sort | 643.25 | 0.8369 | NO | Dominated |
| Dual-Pivot Quicksort | 644.86 | 0.8368 | NO | Dominated |
| Quicksort (LTR) | 645.78 | 0.8362 | NO | Dominated |
| Parallel Quicksort | 646.52 | 0.8364 | NO | Dominated |
| Quicksort (Random) | 649.66 | 0.8369 | NO | Dominated |
| Quicksort (Middle) | 649.79 | 0.8366 | NO | Dominated |
| Stable Quicksort | 650.45 | 0.8371 | NO | Dominated |
| Shellsort | 669.64 | 0.9332 | YES | Dominated |
| Quicksort (Mo3) | 701.75 | 0.8280 | YES | Dominated |
| BlockQuicksort | 708.30 | 0.8067 | NO | Dominated |
| Intro Sort | 721.47 | 0.8077 | NO | Dominated |
| Strand Sort | 744.45 | 0.8175 | NO | Dominated |
| Bucket Sort | 766.32 | 0.7986 | NO | Dominated |
| Comb Sort | 851.28 | 0.9750 | YES | Dominated |
| Hayate-Shiki | 937.26 | 0.7811 | YES | Dominated |
| Bitonic Sort | 1038.31 | 0.9572 | YES | Dominated |
| Circle Sort | 1210.50 | 0.9690 | YES | Dominated |
| Slowsort | 1322.83 | 0.9473 | YES | Dominated |
| Insertion Sort | 2560.05 | 0.8001 | NO | Dominated |
| Gnome Sort | 2566.16 | 0.8022 | YES | Dominated |
| Cocktail Shaker | 2569.84 | 0.8066 | YES | Dominated |
| Bubble Sort | 2579.74 | 0.8028 | YES | Dominated |
| Odd-Even Sort | 2603.56 | 0.8050 | YES | Dominated |
| Selection Sort | 2745.33 | 0.8897 | YES | Dominated |
| Double Selection | 2756.29 | 0.9217 | YES | Dominated |
| Cocktail Selection | 2757.45 | 0.9232 | YES | Dominated |
| Stooge Sort | 2893.91 | 0.9900 | YES | Dominated |
| Pancake Sort | 3075.65 | 0.9684 | YES | Dominated |
| Radix Sort | 4537.68 | 0.9477 | YES | Dominated |
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
