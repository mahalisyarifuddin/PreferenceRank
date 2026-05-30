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
| Exit Sort | 0.00 | 0.0054 | NO | Pareto-optimal |
| Quantum Bogo | 1.72 | 0.0170 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5475 | NO | Pareto-optimal |
| Ford-Johnson | 526.82 | 0.8890 | NO | Pareto-optimal |
| Merge Sort | 541.23 | 0.9039 | NO | Pareto-optimal |
| **In-place Merge Sort** | 541.76 | 0.9046 | NO | **Production Knee Point** |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0023 | NO | Dominated |
| Socialist Sort | 0.00 | -0.0025 | NO | Dominated |
| BogoBogoSort | 44.26 | 0.0893 | YES | Dominated |
| Genghis Khan Sort | 99.00 | 0.3630 | NO | Dominated |
| Stalin Sort | 99.00 | 0.0970 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5467 | YES | Dominated |
| Heap Sort | 99.56 | 0.4803 | YES | Dominated |
| Sleep Sort | 100.00 | -0.0059 | NO | Dominated |
| Smooth Sort | 100.80 | 0.4860 | YES | Dominated |
| 3-Way Quicksort | 101.58 | 0.3448 | YES | Dominated |
| Silly Sort | 138.00 | 0.2464 | YES | Dominated |
| Hater Sort | 196.09 | 0.6637 | YES | Dominated |
| Patience Sort | 199.25 | 0.4868 | YES | Dominated |
| Quicksort (Hoare) | 203.70 | 0.5313 | YES | Dominated |
| Random Sort | 254.65 | 0.6600 | YES | Dominated |
| Cycle Sort | 504.61 | 0.4230 | YES | Dominated |
| Binary Insertion | 530.44 | 0.8875 | NO | Dominated |
| Timsort | 532.38 | 0.8943 | YES | Dominated |
| Triple-Pivot Quicksort | 534.50 | 0.8286 | YES | Dominated |
| 4-way Merge Sort | 542.69 | 0.9023 | NO | Dominated |
| Ping-pong Merge Sort | 558.03 | 0.8863 | NO | Dominated |
| Bottom-up Merge Sort | 558.25 | 0.8873 | NO | Dominated |
| Parallel Merge Sort | 558.29 | 0.8862 | NO | Dominated |
| Tournament Sort | 558.73 | 0.8867 | NO | Dominated |
| Powersort | 562.54 | 0.9078 | YES | Dominated |
| 3-way Merge Sort | 568.33 | 0.8800 | NO | Dominated |
| Natural Merge Sort | 578.56 | 0.8935 | YES | Dominated |
| Quicksort (Ninther) | 602.87 | 0.8423 | YES | Dominated |
| Quicksort (LTR) | 637.28 | 0.8373 | NO | Dominated |
| Tree Sort | 644.16 | 0.8363 | NO | Dominated |
| Dual-Pivot Quicksort | 645.96 | 0.8372 | NO | Dominated |
| Quicksort (RTL) | 647.14 | 0.8377 | NO | Dominated |
| Quicksort (Random) | 647.97 | 0.8368 | NO | Dominated |
| Parallel Quicksort | 651.38 | 0.8369 | NO | Dominated |
| Stable Quicksort | 651.82 | 0.8362 | NO | Dominated |
| Quicksort (Middle) | 652.87 | 0.8361 | NO | Dominated |
| Shellsort | 671.36 | 0.9328 | YES | Dominated |
| Quicksort (Mo3) | 709.14 | 0.8277 | YES | Dominated |
| BlockQuicksort | 718.28 | 0.8073 | NO | Dominated |
| Intro Sort | 722.06 | 0.8072 | NO | Dominated |
| Strand Sort | 740.23 | 0.8193 | NO | Dominated |
| Comb Sort | 851.81 | 0.9747 | YES | Dominated |
| Hayate-Shiki | 932.18 | 0.7849 | YES | Dominated |
| Bitonic Sort | 1037.63 | 0.9577 | YES | Dominated |
| Circle Sort | 1210.62 | 0.9702 | YES | Dominated |
| Slowsort | 1320.52 | 0.9465 | YES | Dominated |
| Insertion Sort | 2568.90 | 0.8013 | NO | Dominated |
| Cocktail Shaker | 2569.86 | 0.8075 | YES | Dominated |
| Bubble Sort | 2580.12 | 0.8035 | YES | Dominated |
| Gnome Sort | 2588.91 | 0.8039 | YES | Dominated |
| Odd-Even Sort | 2600.93 | 0.8052 | YES | Dominated |
| Double Selection | 2743.44 | 0.9218 | YES | Dominated |
| Cocktail Selection | 2752.02 | 0.9223 | YES | Dominated |
| Selection Sort | 2766.80 | 0.8899 | YES | Dominated |
| Stooge Sort | 2877.99 | 0.9901 | YES | Dominated |
| Pancake Sort | 3076.83 | 0.9683 | YES | Dominated |
| Bogosort | 4950.00 | 1.0000 | YES | Dominated |

### Battle Count Estimate Regression
For In-place Merge Sort (the new Production Knee Point):
- **Formula:** `Unique Battles ≈ N * log2(N) - (N - 1)`
- For N=100, this predicts ~565 battles (simulated ~542 unique on average).

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~43% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
