# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared 64 sorting algorithms. A key requirement for production is the elimination of duplicate pairwise comparisons. Algorithms that request the same pair twice are now identified and excluded from the Pareto-optimal knee point analysis to ensure maximum user efficiency.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Metric 1: Avg Battles:** Total unique comparisons presented to the user.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores (BT).
- **Metric 3: Duplicates:** Indicates if the algorithm ever requests the same pair twice during a single sort.

### Results (N=100)
| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
| :--- | :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | -0.0009 | NO | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0240 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5505 | NO | Pareto-optimal |
| Ford-Johnson | 526.97 | 0.8898 | NO | Pareto-optimal |
| In-place Merge Sort | 541.85 | 0.9034 | NO | Pareto-optimal |
| **Merge Sort** | 542.26 | 0.9054 | NO | **Production Knee Point** |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Socialist Sort | 0.00 | -0.0093 | NO | Dominated |
| Exit Sort | 0.00 | -0.0048 | NO | Dominated |
| BogoBogoSort | 44.56 | 0.0895 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3484 | NO | Dominated |
| Stalin Sort | 99.00 | 0.1069 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5452 | YES | Dominated |
| Smooth Sort | 99.36 | 0.4767 | YES | Dominated |
| Sleep Sort | 100.00 | -0.0061 | NO | Dominated |
| 3-Way Quicksort | 100.40 | 0.3414 | YES | Dominated |
| Heap Sort | 100.81 | 0.4841 | YES | Dominated |
| Silly Sort | 138.00 | 0.2431 | YES | Dominated |
| Hater Sort | 196.19 | 0.6643 | YES | Dominated |
| Patience Sort | 197.99 | 0.4822 | YES | Dominated |
| Quicksort (Hoare) | 201.05 | 0.5212 | YES | Dominated |
| Random Sort | 257.53 | 0.6674 | YES | Dominated |
| Cycle Sort | 497.28 | 0.4095 | YES | Dominated |
| Binary Insertion | 530.80 | 0.8870 | NO | Dominated |
| Triple-Pivot Quicksort | 531.33 | 0.8274 | YES | Dominated |
| Timsort | 532.33 | 0.8962 | YES | Dominated |
| 4-way Merge Sort | 543.62 | 0.9022 | NO | Dominated |
| Ping-pong Merge Sort | 558.20 | 0.8853 | NO | Dominated |
| Tournament Sort | 558.21 | 0.8880 | NO | Dominated |
| Bottom-up Merge Sort | 558.40 | 0.8873 | NO | Dominated |
| Parallel Merge Sort | 558.61 | 0.8868 | NO | Dominated |
| Powersort | 562.91 | 0.9079 | YES | Dominated |
| 3-way Merge Sort | 567.90 | 0.8802 | NO | Dominated |
| Natural Merge Sort | 577.77 | 0.8929 | YES | Dominated |
| Quicksort (Ninther) | 603.94 | 0.8414 | YES | Dominated |
| Tree Sort | 642.21 | 0.8362 | NO | Dominated |
| Dual-Pivot Quicksort | 644.26 | 0.8367 | NO | Dominated |
| Parallel Quicksort | 645.48 | 0.8366 | NO | Dominated |
| Quicksort (Random) | 645.84 | 0.8370 | NO | Dominated |
| Quicksort (LTR) | 647.63 | 0.8376 | NO | Dominated |
| Quicksort (RTL) | 650.37 | 0.8380 | NO | Dominated |
| Stable Quicksort | 651.68 | 0.8365 | NO | Dominated |
| Quicksort (Middle) | 654.52 | 0.8368 | NO | Dominated |
| Shellsort | 669.93 | 0.9326 | YES | Dominated |
| BlockQuicksort | 714.08 | 0.8067 | NO | Dominated |
| Quicksort (Mo3) | 715.34 | 0.8278 | YES | Dominated |
| Intro Sort | 717.42 | 0.8066 | NO | Dominated |
| Strand Sort | 742.84 | 0.8196 | NO | Dominated |
| Comb Sort | 851.79 | 0.9747 | YES | Dominated |
| Hayate-Shiki | 934.54 | 0.7830 | YES | Dominated |
| Bitonic Sort | 1036.58 | 0.9567 | YES | Dominated |
| Circle Sort | 1212.30 | 0.9692 | YES | Dominated |
| Slowsort | 1320.97 | 0.9486 | YES | Dominated |
| Bubble Sort | 2553.59 | 0.8007 | YES | Dominated |
| Gnome Sort | 2568.57 | 0.8019 | YES | Dominated |
| Insertion Sort | 2570.98 | 0.8043 | NO | Dominated |
| Cocktail Shaker | 2588.40 | 0.8078 | YES | Dominated |
| Odd-Even Sort | 2609.19 | 0.8049 | YES | Dominated |
| Cocktail Selection | 2745.26 | 0.9233 | YES | Dominated |
| Selection Sort | 2752.82 | 0.8899 | YES | Dominated |
| Double Selection | 2756.60 | 0.9234 | YES | Dominated |
| Stooge Sort | 2889.56 | 0.9902 | YES | Dominated |
| Pancake Sort | 3110.75 | 0.9698 | YES | Dominated |
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
