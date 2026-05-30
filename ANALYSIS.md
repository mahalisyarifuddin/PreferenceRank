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
| Exit Sort | 0.00 | 0.0010 | NO | Pareto-optimal |
| Quantum Bogo | 1.74 | 0.0125 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5455 | NO | Pareto-optimal |
| Ford-Johnson | 526.86 | 0.8894 | NO | Pareto-optimal |
| **In-place Merge Sort** | 541.58 | 0.9037 | NO | **Production Knee Point** |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0006 | NO | Dominated |
| Socialist Sort | 0.00 | -0.0024 | NO | Dominated |
| BogoBogoSort | 45.20 | 0.0899 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3446 | NO | Dominated |
| Stalin Sort | 99.00 | 0.0998 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5448 | YES | Dominated |
| Smooth Sort | 99.37 | 0.4747 | YES | Dominated |
| Heap Sort | 99.44 | 0.4826 | YES | Dominated |
| Sleep Sort | 100.00 | 0.0020 | NO | Dominated |
| 3-Way Quicksort | 101.19 | 0.3714 | YES | Dominated |
| Silly Sort | 138.00 | 0.2390 | YES | Dominated |
| Hater Sort | 196.03 | 0.6613 | YES | Dominated |
| Patience Sort | 198.88 | 0.4862 | YES | Dominated |
| Quicksort (Hoare) | 199.80 | 0.5258 | YES | Dominated |
| Random Sort | 243.38 | 0.6436 | YES | Dominated |
| Binary Insertion | 530.61 | 0.8876 | NO | Dominated |
| Timsort | 532.64 | 0.8970 | YES | Dominated |
| Triple-Pivot Quicksort | 535.74 | 0.8289 | YES | Dominated |
| Merge Sort | 541.78 | 0.9031 | NO | Dominated |
| 4-way Merge Sort | 543.60 | 0.9034 | NO | Dominated |
| Cycle Sort | 549.71 | 0.4431 | YES | Dominated |
| Tournament Sort | 557.12 | 0.8867 | NO | Dominated |
| Parallel Merge Sort | 557.40 | 0.8853 | NO | Dominated |
| Ping-pong Merge Sort | 558.31 | 0.8871 | NO | Dominated |
| Bottom-up Merge Sort | 558.76 | 0.8879 | NO | Dominated |
| Powersort | 562.08 | 0.9073 | YES | Dominated |
| 3-way Merge Sort | 566.84 | 0.8796 | NO | Dominated |
| Natural Merge Sort | 578.28 | 0.8928 | YES | Dominated |
| Quicksort (Ninther) | 605.76 | 0.8421 | YES | Dominated |
| Quicksort (Middle) | 644.16 | 0.8373 | NO | Dominated |
| Dual-Pivot Quicksort | 644.56 | 0.8368 | NO | Dominated |
| Quicksort (RTL) | 644.66 | 0.8365 | NO | Dominated |
| Tree Sort | 646.14 | 0.8365 | NO | Dominated |
| Parallel Quicksort | 651.54 | 0.8371 | NO | Dominated |
| Quicksort (LTR) | 651.62 | 0.8370 | NO | Dominated |
| Quicksort (Random) | 651.86 | 0.8373 | NO | Dominated |
| Stable Quicksort | 655.33 | 0.8363 | NO | Dominated |
| Shellsort | 673.24 | 0.9333 | YES | Dominated |
| Quicksort (Mo3) | 707.04 | 0.8282 | YES | Dominated |
| Intro Sort | 717.94 | 0.8067 | NO | Dominated |
| BlockQuicksort | 721.63 | 0.8073 | NO | Dominated |
| Strand Sort | 740.95 | 0.8215 | NO | Dominated |
| Comb Sort | 851.51 | 0.9746 | YES | Dominated |
| Hayate-Shiki | 933.34 | 0.7874 | YES | Dominated |
| Bitonic Sort | 1037.85 | 0.9576 | YES | Dominated |
| Circle Sort | 1208.33 | 0.9691 | YES | Dominated |
| Slowsort | 1318.27 | 0.9478 | YES | Dominated |
| Insertion Sort | 2569.03 | 0.8023 | NO | Dominated |
| Bubble Sort | 2570.84 | 0.8036 | YES | Dominated |
| Gnome Sort | 2576.10 | 0.8041 | YES | Dominated |
| Cocktail Shaker | 2584.04 | 0.8078 | YES | Dominated |
| Odd-Even Sort | 2618.82 | 0.8066 | YES | Dominated |
| Cocktail Selection | 2738.95 | 0.9225 | YES | Dominated |
| Selection Sort | 2742.28 | 0.8888 | YES | Dominated |
| Double Selection | 2758.65 | 0.9214 | YES | Dominated |
| Stooge Sort | 2881.61 | 0.9900 | YES | Dominated |
| Pancake Sort | 3059.09 | 0.9682 | YES | Dominated |
| Bogosort | 4950.00 | 1.0000 | YES | Dominated |

### Battle Count Estimate Regression
For In-place Merge Sort (the new Production Knee Point):
- **Formula:** `Unique Battles ≈ N * log2(N) - (N - 1)`
- For N=100, this predicts ~565 battles (simulated ~542 unique on average).

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~45% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
