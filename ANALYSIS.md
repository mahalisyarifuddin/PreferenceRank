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
| Exit Sort | 0.00 | -0.0013 | NO | Pareto-optimal |
| Quantum Bogo | 1.75 | 0.0096 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5428 | NO | Pareto-optimal |
| Ford-Johnson | 526.99 | 0.8892 | NO | Pareto-optimal |
| In-place Merge Sort | 541.74 | 0.9031 | NO | Pareto-optimal |
| **Merge Sort** | 541.99 | 0.9040 | NO | **Production Knee Point** |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0038 | NO | Dominated |
| Socialist Sort | 0.00 | -0.0071 | NO | Dominated |
| BogoBogoSort | 44.12 | 0.0840 | YES | Dominated |
| Heap Sort | 97.42 | 0.4792 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3497 | NO | Dominated |
| Stalin Sort | 99.00 | 0.0983 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5440 | YES | Dominated |
| Sleep Sort | 100.00 | 0.0036 | NO | Dominated |
| Smooth Sort | 100.25 | 0.4827 | YES | Dominated |
| 3-Way Quicksort | 101.48 | 0.3641 | YES | Dominated |
| Silly Sort | 138.00 | 0.2403 | YES | Dominated |
| Hater Sort | 195.91 | 0.6646 | YES | Dominated |
| Patience Sort | 198.22 | 0.4732 | YES | Dominated |
| Quicksort (Hoare) | 205.33 | 0.5223 | YES | Dominated |
| Random Sort | 233.29 | 0.6401 | YES | Dominated |
| Cycle Sort | 517.46 | 0.4358 | YES | Dominated |
| Triple-Pivot Quicksort | 531.03 | 0.8292 | YES | Dominated |
| Binary Insertion | 531.08 | 0.8867 | NO | Dominated |
| Timsort | 533.38 | 0.8971 | YES | Dominated |
| 4-way Merge Sort | 543.63 | 0.9025 | NO | Dominated |
| Tournament Sort | 557.73 | 0.8874 | NO | Dominated |
| Parallel Merge Sort | 557.78 | 0.8865 | NO | Dominated |
| Ping-pong Merge Sort | 558.46 | 0.8866 | NO | Dominated |
| Bottom-up Merge Sort | 559.50 | 0.8868 | NO | Dominated |
| Powersort | 562.72 | 0.9088 | YES | Dominated |
| 3-way Merge Sort | 568.17 | 0.8801 | NO | Dominated |
| Natural Merge Sort | 576.67 | 0.8919 | YES | Dominated |
| Quicksort (Ninther) | 604.30 | 0.8418 | YES | Dominated |
| Quicksort (Random) | 641.96 | 0.8365 | NO | Dominated |
| Dual-Pivot Quicksort | 643.67 | 0.8368 | NO | Dominated |
| Quicksort (LTR) | 645.79 | 0.8374 | NO | Dominated |
| Quicksort (Middle) | 647.15 | 0.8375 | NO | Dominated |
| Quicksort (RTL) | 647.97 | 0.8381 | NO | Dominated |
| Parallel Quicksort | 648.99 | 0.8373 | NO | Dominated |
| Tree Sort | 651.63 | 0.8371 | NO | Dominated |
| Stable Quicksort | 655.29 | 0.8366 | NO | Dominated |
| Shellsort | 670.18 | 0.9319 | YES | Dominated |
| Quicksort (Mo3) | 701.46 | 0.8277 | YES | Dominated |
| Intro Sort | 719.22 | 0.8067 | NO | Dominated |
| BlockQuicksort | 719.53 | 0.8080 | NO | Dominated |
| Strand Sort | 746.43 | 0.8230 | NO | Dominated |
| Comb Sort | 851.18 | 0.9745 | YES | Dominated |
| Hayate-Shiki | 939.88 | 0.7841 | YES | Dominated |
| Bitonic Sort | 1037.29 | 0.9574 | YES | Dominated |
| Circle Sort | 1212.07 | 0.9696 | YES | Dominated |
| Slowsort | 1324.86 | 0.9484 | YES | Dominated |
| Insertion Sort | 2554.97 | 0.8004 | NO | Dominated |
| Bubble Sort | 2573.69 | 0.8029 | YES | Dominated |
| Gnome Sort | 2580.36 | 0.8029 | YES | Dominated |
| Cocktail Shaker | 2596.14 | 0.8081 | YES | Dominated |
| Odd-Even Sort | 2612.70 | 0.8065 | YES | Dominated |
| Selection Sort | 2737.31 | 0.8909 | YES | Dominated |
| Cocktail Selection | 2770.76 | 0.9227 | YES | Dominated |
| Double Selection | 2782.18 | 0.9229 | YES | Dominated |
| Stooge Sort | 2875.11 | 0.9900 | YES | Dominated |
| Pancake Sort | 3078.48 | 0.9684 | YES | Dominated |
| Bogosort | 4950.00 | 1.0000 | YES | Dominated |

### Battle Count Estimate Regression
For Merge Sort (the new Production Knee Point):
- **Formula:** `Unique Battles ≈ N * log2(N) - (N - 1)`
- For N=100, this predicts ~565 battles (simulated ~542 unique on average).

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~41% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).

## 3. Benchmark Stability and Trial Optimization

To ensure the reliability of our rankings, we analyzed the impact of trial counts on benchmark stability. The optimal trial count was identified as **300** using a log-scale knee point analysis of the standard error of the mean (SEM).

```
Trials	Vanilla_Tau	Vanilla_SEM	InPlace_Tau	InPlace_SEM	Mean_Diff	SEM_Diff	Total_SEM
50	0.90562	0.00165	0.90562	0.00165	0.000000	0.000000	0.003298
100	0.90306	0.00104	0.90306	0.00104	0.000000	0.000000	0.002088
150	0.90413	0.00102	0.90413	0.00102	0.000000	0.000000	0.002041
200	0.90489	0.00089	0.90489	0.00089	0.000000	0.000000	0.001782
250	0.90314	0.00076	0.90314	0.00076	0.000000	0.000000	0.001522
300	0.90416	0.00073	0.90416	0.00073	0.000000	0.000000	0.001463
350	0.90372	0.00065	0.90372	0.00065	0.000000	0.000000	0.001295
400	0.90312	0.00063	0.90312	0.00063	0.000000	0.000000	0.001254
450	0.90370	0.00058	0.90370	0.00058	0.000000	0.000000	0.001158
500	0.90370	0.00055	0.90370	0.00055	0.000000	0.000000	0.001102
550	0.90369	0.00050	0.90369	0.00050	0.000000	0.000000	0.001005
600	0.90441	0.00048	0.90441	0.00048	0.000000	0.000000	0.000958
650	0.90356	0.00047	0.90356	0.00047	0.000000	0.000000	0.000933
700	0.90316	0.00046	0.90316	0.00046	0.000000	0.000000	0.000922
750	0.90293	0.00045	0.90293	0.00045	0.000000	0.000000	0.000897
800	0.90428	0.00042	0.90428	0.00042	0.000000	0.000000	0.000849
850	0.90353	0.00042	0.90353	0.00042	0.000000	0.000000	0.000840
900	0.90390	0.00038	0.90390	0.00038	0.000000	0.000000	0.000762
950	0.90334	0.00039	0.90334	0.00039	0.000000	0.000000	0.000789
1000	0.90395	0.00038	0.90395	0.00038	0.000000	0.000000	0.000768
```
