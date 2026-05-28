# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank, focusing on **pure, non-duplicate comparisons** as the primary criterion for algorithm selection.

## 1. Sorting Algorithm Comparison (N=100)

We compared 48 sorting algorithms. A key requirement for production is the elimination of duplicate pairwise comparisons. Algorithms that request the same pair twice are now identified and excluded from the Pareto-optimal knee point analysis to ensure maximum user efficiency.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Metric 1: Avg Battles:** Total unique comparisons presented to the user.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores (BT).
- **Metric 3: Duplicates:** Indicates if the algorithm ever requests the same pair twice during a single sort.

### Results (N=100)
The table is partitioned by Pareto status (Optimal then Dominated) and sorted by Avg Battles (ascending).

| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
| :--- | :--- | :--- | :--- | :--- |
| Exit Sort | 0.00 | -0.0005 | NO | Pareto-optimal |
| Quantum Bogo | 1.62 | 0.0120 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5450 | NO | Pareto-optimal |
| Dual-Pivot Quicksort | 494.08 | 0.8364 | NO | Pareto-optimal |
| Ford-Johnson | 526.85 | 0.8886 | NO | Pareto-optimal |
| **Merge Sort** | 542.07 | 0.9032 | NO | **Production Knee Point** |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0069 | NO | Dominated |
| Socialist Sort | 0.00 | 0.0036 | NO | Dominated |
| BogoBogoSort | 44.46 | 0.0897 | YA | Dominated |
| Smooth Sort | 98.10 | 0.4813 | YA | Dominated |
| Heap Sort | 98.52 | 0.4865 | YA | Dominated |
| Stalin Sort | 99.00 | 0.0993 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5475 | YA | Dominated |
| Genghis Khan Sort | 99.00 | 0.3381 | NO | Dominated |
| Sleep Sort | 100.00 | -0.0022 | NO | Dominated |
| Silly Sort | 138.00 | 0.2391 | YA | Dominated |
| Hater Sort | 195.94 | 0.6643 | YA | Dominated |
| Patience Sort | 198.58 | 0.4921 | YA | Dominated |
| Random Sort | 255.21 | 0.6554 | YA | Dominated |
| Intro Sort | 409.05 | 0.8314 | YA | Dominated |
| Cycle Sort | 431.63 | 0.4313 | YA | Dominated |
| Binary Insertion | 530.42 | 0.8877 | NO | Dominated |
| Tournament Sort | 558.18 | 0.8860 | NO | Dominated |
| Parallel Merge Sort | 558.28 | 0.8861 | NO | Dominated |
| Quicksort (RTL) | 642.67 | 0.8369 | NO | Dominated |
| Quicksort (Random) | 644.90 | 0.8365 | NO | Dominated |
| Tree Sort | 648.08 | 0.8366 | NO | Dominated |
| Quicksort (LTR) | 654.10 | 0.8375 | NO | Dominated |
| Shellsort | 671.24 | 0.9330 | YA | Dominated |
| Strand Sort | 738.34 | 0.8200 | NO | Dominated |
| Comb Sort | 851.18 | 0.9745 | YA | Dominated |
| Hayate-Shiki | 937.24 | 0.7873 | YA | Dominated |
| Bitonic Sort | 1036.05 | 0.9574 | YA | Dominated |
| Circle Sort | 1213.04 | 0.9695 | YA | Dominated |
| Slowsort | 1323.12 | 0.9494 | YA | Dominated |
| Bubble Sort | 2565.62 | 0.8014 | YA | Dominated |
| Insertion Sort | 2568.34 | 0.8019 | NO | Dominated |
| Gnome Sort | 2569.91 | 0.8020 | YA | Dominated |
| Cocktail Shaker | 2578.76 | 0.8062 | YA | Dominated |
| Odd-Even Sort | 2610.81 | 0.8061 | YA | Dominated |
| Cocktail Selection | 2753.86 | 0.9209 | YA | Dominated |
| Double Selection | 2754.74 | 0.9215 | YA | Dominated |
| Selection Sort | 2756.40 | 0.8908 | YA | Dominated |
| Stooge Sort | 2881.16 | 0.9901 | YA | Dominated |
| Pancake Sort | 3083.59 | 0.9684 | YA | Dominated |
| Bozosort | 4946.49 | 1.0000 | YA | Dominated |
| Bogosort | 4950.00 | 1.0000 | YA | Dominated |

### Pareto Frontier & Knee Point Analysis
With the new "Pure Comparison" constraint (No Duplicates):

- **Merge Sort** emerges as the primary **Production Knee Point**. It is Pareto-optimal and achieves the highest accuracy among all "Pure" algorithms before reaching the extreme cost of Full Rank.
- **Ford-Johnson** and **Dual-Pivot Quicksort** remain excellent Pareto-optimal choices for mid-range effort without duplicates.
- **Shellsort**, while highly accurate, is now categorized as dominated because it inherently produces duplicate comparisons (in its current gap-based implementation), which violates the new efficiency requirement.

### Battle Count Estimate Regression
For Merge Sort (the new Production Knee Point):
- **Formula:** `Unique Battles ≈ N * log2(N) - (N - 1)`
- For N=100, this predicts ~565 battles (simulated ~542 unique on average).

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
