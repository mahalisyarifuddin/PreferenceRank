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
Sorted by Duplicates (NO first), then Avg Battles (ascending).

| Algorithm | Avg Battles | Avg Kendall Tau | Duplicates | Pareto Status |
| :--- | :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | -0.0018 | NO | Dominated |
| Socialist Sort | 0.00 | 0.0032 | NO | Dominated |
| Exit Sort | 0.00 | -0.0009 | NO | Pareto-optimal |
| Quantum Bogo | 1.68 | 0.0149 | NO | Pareto-optimal |
| Stalin Sort | 99.00 | 0.1036 | NO | Dominated |
| Miracle Sort | 99.00 | 0.5451 | NO | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3520 | NO | Dominated |
| Sleep Sort | 100.00 | 0.0061 | NO | Dominated |
| Dual-Pivot Quicksort | 491.07 | 0.8372 | NO | Pareto-optimal |
| Ford-Johnson | 526.79 | 0.8883 | NO | Pareto-optimal |
| Binary Insertion | 530.46 | 0.8863 | NO | Dominated |
| **Merge Sort** | 542.10 | 0.9065 | NO | **Production Knee Point** |
| Parallel Merge Sort | 558.40 | 0.8863 | NO | Dominated |
| Tournament Sort | 559.13 | 0.8856 | NO | Dominated |
| Quicksort (Random) | 639.13 | 0.8357 | NO | Dominated |
| Quicksort (LTR) | 643.12 | 0.8378 | NO | Dominated |
| Tree Sort | 647.83 | 0.8372 | NO | Dominated |
| Quicksort (RTL) | 653.42 | 0.8366 | NO | Dominated |
| Strand Sort | 737.76 | 0.8209 | NO | Dominated |
| Insertion Sort | 2568.57 | 0.8034 | NO | Dominated |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| BogoBogoSort | 44.32 | 0.0913 | YES | Dominated |
| Smooth Sort | 98.70 | 0.4807 | YES | Dominated |
| Thanos Sort | 99.00 | 0.5466 | YES | Dominated |
| Heap Sort | 99.60 | 0.4817 | YES | Dominated |
| Silly Sort | 138.00 | 0.2391 | YES | Dominated |
| Hater Sort | 196.36 | 0.6615 | YES | Dominated |
| Patience Sort | 198.62 | 0.4767 | YES | Dominated |
| Random Sort | 226.55 | 0.6278 | YES | Dominated |
| Intro Sort | 396.89 | 0.8376 | YES | Dominated |
| Cycle Sort | 498.38 | 0.4252 | YES | Dominated |
| Shellsort | 671.59 | 0.9324 | YES | Dominated |
| Comb Sort | 852.69 | 0.9742 | YES | Dominated |
| Hayate-Shiki | 932.92 | 0.7833 | YES | Dominated |
| Bitonic Sort | 1034.54 | 0.9581 | YES | Dominated |
| Circle Sort | 1217.37 | 0.9693 | YES | Dominated |
| Slowsort | 1321.35 | 0.9477 | YES | Dominated |
| Bubble Sort | 2558.94 | 0.8010 | YES | Dominated |
| Gnome Sort | 2566.00 | 0.8027 | YES | Dominated |
| Cocktail Shaker | 2582.08 | 0.8071 | YES | Dominated |
| Odd-Even Sort | 2632.06 | 0.8081 | YES | Dominated |
| Double Selection | 2755.02 | 0.9205 | YES | Dominated |
| Cocktail Selection | 2762.89 | 0.9215 | YES | Dominated |
| Selection Sort | 2767.50 | 0.8909 | YES | Dominated |
| Stooge Sort | 2888.75 | 0.9901 | YES | Dominated |
| Pancake Sort | 3103.72 | 0.9691 | YES | Dominated |
| Bozosort | 4946.40 | 1.0000 | YES | Dominated |
| Bogosort | 4950.00 | 1.0000 | YES | Dominated |

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
