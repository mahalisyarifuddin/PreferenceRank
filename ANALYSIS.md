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
| Intelligent Design | 0.00 | 0.0087 | NO | Pareto-optimal |
| Quantum Bogo | 1.81 | 0.0195 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5457 | NO | Pareto-optimal |
| Ford-Johnson | 526.81 | 0.8889 | NO | Pareto-optimal |
| **Merge Sort** | 541.71 | 0.9034 | NO | **Production Knee Point** |
| 4-way Merge Sort | 543.22 | 0.9048 | NO | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0012 | NO | Dominated |
| Exit Sort | 0.00 | -0.0062 | NO | Dominated |
| BogoBogoSort | 45.24 | 0.0887 | YES | Dominated |
| Smooth Sort | 98.11 | 0.4798 | YES | Dominated |
| Heap Sort | 98.82 | 0.4762 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3384 | NO | Dominated |
| Stalin Sort | 99.00 | 0.1016 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5472 | YES | Dominated |
| Sleep Sort | 100.00 | 0.0063 | NO | Dominated |
| 3-Way Quicksort | 100.00 | 0.3615 | YES | Dominated |
| Silly Sort | 138.00 | 0.2347 | YES | Dominated |
| Hater Sort | 196.23 | 0.6630 | YES | Dominated |
| Patience Sort | 198.57 | 0.4781 | YES | Dominated |
| Quicksort (Hoare) | 201.44 | 0.5138 | YES | Dominated |
| Random Sort | 236.68 | 0.6285 | YES | Dominated |
| Cycle Sort | 530.07 | 0.4391 | YES | Dominated |
| Binary Insertion | 530.67 | 0.8883 | NO | Dominated |
| Timsort | 532.40 | 0.8954 | YES | Dominated |
| Triple-Pivot Quicksort | 541.53 | 0.8277 | YES | Dominated |
| In-place Merge Sort | 542.07 | 0.9026 | NO | Dominated |
| Ping-pong Merge Sort | 557.90 | 0.8852 | NO | Dominated |
| Bottom-up Merge Sort | 558.21 | 0.8865 | NO | Dominated |
| Tournament Sort | 558.31 | 0.8867 | NO | Dominated |
| Parallel Merge Sort | 558.39 | 0.8864 | NO | Dominated |
| Powersort | 562.02 | 0.9085 | YES | Dominated |
| 3-way Merge Sort | 567.70 | 0.8803 | NO | Dominated |
| Natural Merge Sort | 578.31 | 0.8917 | YES | Dominated |
| Quicksort (Ninther) | 604.10 | 0.8419 | YES | Dominated |
| Quicksort (Random) | 641.35 | 0.8366 | NO | Dominated |
| Quicksort (Middle) | 643.60 | 0.8358 | NO | Dominated |
| Stable Quicksort | 645.40 | 0.8375 | NO | Dominated |
| Dual-Pivot Quicksort | 646.56 | 0.8364 | NO | Dominated |
| Tree Sort | 648.73 | 0.8366 | NO | Dominated |
| Parallel Quicksort | 648.84 | 0.8365 | NO | Dominated |
| Quicksort (LTR) | 649.12 | 0.8372 | NO | Dominated |
| Quicksort (RTL) | 650.60 | 0.8367 | NO | Dominated |
| Shellsort | 670.82 | 0.9314 | YES | Dominated |
| Quicksort (Mo3) | 702.53 | 0.8272 | YES | Dominated |
| Intro Sort | 715.22 | 0.8080 | NO | Dominated |
| BlockQuicksort | 725.04 | 0.8067 | NO | Dominated |
| Strand Sort | 737.73 | 0.8174 | NO | Dominated |
| Comb Sort | 851.63 | 0.9746 | YES | Dominated |
| Hayate-Shiki | 931.93 | 0.7823 | YES | Dominated |
| Bitonic Sort | 1036.71 | 0.9574 | YES | Dominated |
| Circle Sort | 1206.98 | 0.9694 | YES | Dominated |
| Slowsort | 1321.04 | 0.9481 | YES | Dominated |
| Cocktail Shaker | 2566.32 | 0.8045 | YES | Dominated |
| Bubble Sort | 2575.85 | 0.8013 | YES | Dominated |
| Insertion Sort | 2585.64 | 0.8038 | NO | Dominated |
| Gnome Sort | 2589.39 | 0.8043 | YES | Dominated |
| Odd-Even Sort | 2592.26 | 0.8038 | YES | Dominated |
| Selection Sort | 2750.68 | 0.8909 | YES | Dominated |
| Cocktail Selection | 2756.68 | 0.9228 | YES | Dominated |
| Double Selection | 2770.46 | 0.9216 | YES | Dominated |
| Stooge Sort | 2881.02 | 0.9901 | YES | Dominated |
| Pancake Sort | 3088.26 | 0.9686 | YES | Dominated |
| Bogosort | 4950.00 | 1.0000 | YES | Dominated |

### Battle Count Estimate Regression
For Merge Sort (the new Production Knee Point):
- **Formula:** `Unique Battles ≈ N * log2(N) - (N - 1)`
- For N=100, this predicts ~565 battles (simulated ~542 unique on average).

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
