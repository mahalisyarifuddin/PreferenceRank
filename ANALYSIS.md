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
| 3-Way Quicksort | 101.58 | 0.3620 | YES | Dominated |
| 3-way Merge Sort | 566.94 | 0.8808 | NO | Dominated |
| 4-way Merge Sort | 543.44 | 0.9024 | NO | Dominated |
| Binary Insertion | 530.61 | 0.8867 | NO | Dominated |
| Bitonic Sort | 1037.33 | 0.9574 | YES | Dominated |
| BlockQuicksort | 717.95 | 0.8064 | NO | Dominated |
| BogoBogoSort | 44.81 | 0.0927 | YES | Dominated |
| Bogosort | 4950.00 | 1.0000 | YES | Dominated |
| Bottom-up Merge Sort | 558.57 | 0.8874 | NO | Dominated |
| Bubble Sort | 2589.34 | 0.8044 | YES | Dominated |
| Circle Sort | 1211.16 | 0.9693 | YES | Dominated |
| Cocktail Selection | 2749.38 | 0.9220 | YES | Dominated |
| Cocktail Shaker | 2579.46 | 0.8076 | YES | Dominated |
| Comb Sort | 850.95 | 0.9747 | YES | Dominated |
| Cycle Sort | 528.88 | 0.4202 | YES | Dominated |
| Double Selection | 2774.61 | 0.9227 | YES | Dominated |
| Dual-Pivot Quicksort | 645.06 | 0.8370 | NO | Dominated |
| Exit Sort | 0.00 | 0.0015 | NO | Dominated |
| Ford-Johnson | 526.51 | 0.8880 | NO | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3201 | NO | Dominated |
| Gnome Sort | 2578.87 | 0.8033 | YES | Dominated |
| Hater Sort | 195.97 | 0.6639 | YES | Dominated |
| Hayate-Shiki | 930.57 | 0.7832 | YES | Dominated |
| Heap Sort | 98.08 | 0.4785 | YES | Dominated |
| In-place Merge Sort | 541.82 | 0.9029 | NO | Pareto-optimal |
| Insertion Sort | 2565.09 | 0.8018 | NO | Dominated |
| Intelligent Design | 0.00 | 0.0027 | NO | Dominated |
| Intro Sort | 723.25 | 0.8063 | NO | Dominated |
| **Merge Sort** | 542.16 | 0.9041 | NO | **Production Knee Point** |
| Miracle Sort | 99.00 | 0.5424 | NO | Pareto-optimal |
| Natural Merge Sort | 577.58 | 0.8924 | YES | Dominated |
| Odd-Even Sort | 2605.79 | 0.8053 | YES | Dominated |
| Pancake Sort | 3079.14 | 0.9688 | YES | Dominated |
| Parallel Merge Sort | 558.04 | 0.8872 | NO | Dominated |
| Parallel Quicksort | 645.14 | 0.8367 | NO | Dominated |
| Patience Sort | 198.50 | 0.4866 | YES | Dominated |
| Ping-pong Merge Sort | 558.58 | 0.8879 | NO | Dominated |
| Powersort | 562.51 | 0.9071 | YES | Dominated |
| Quantum Bogo | 1.73 | 0.0121 | NO | Pareto-optimal |
| Quicksort (Hoare) | 207.09 | 0.5238 | YES | Dominated |
| Quicksort (LTR) | 650.76 | 0.8371 | NO | Dominated |
| Quicksort (Middle) | 647.08 | 0.8371 | NO | Dominated |
| Quicksort (Mo3) | 710.38 | 0.8278 | YES | Dominated |
| Quicksort (Ninther) | 604.40 | 0.8427 | YES | Dominated |
| Quicksort (RTL) | 643.33 | 0.8364 | NO | Dominated |
| Quicksort (Random) | 650.54 | 0.8371 | NO | Dominated |
| Random Sort | 244.41 | 0.6469 | YES | Dominated |
| Selection Sort | 2759.44 | 0.8890 | YES | Dominated |
| Shellsort | 670.58 | 0.9323 | YES | Dominated |
| Silly Sort | 138.00 | 0.2385 | YES | Dominated |
| Sleep Sort | 100.00 | -0.0047 | NO | Dominated |
| Slowsort | 1324.76 | 0.9496 | YES | Dominated |
| Smooth Sort | 100.12 | 0.4848 | YES | Dominated |
| Socialist Sort | 0.00 | 0.0035 | NO | Pareto-optimal |
| Stable Quicksort | 654.62 | 0.8372 | NO | Dominated |
| Stalin Sort | 99.00 | 0.0983 | NO | Dominated |
| Stooge Sort | 2893.43 | 0.9900 | YES | Dominated |
| Strand Sort | 743.92 | 0.8188 | NO | Dominated |
| Thanos Sort | 99.00 | 0.5451 | YES | Dominated |
| Timsort | 532.34 | 0.8957 | YES | Dominated |
| Tournament Sort | 558.63 | 0.8875 | NO | Dominated |
| Tree Sort | 650.24 | 0.8374 | NO | Dominated |
| Triple-Pivot Quicksort | 532.48 | 0.8292 | YES | Dominated |

### Battle Count Estimate Regression
For Merge Sort (the new Production Knee Point):
- **Formula:** `Unique Battles ≈ N * log2(N) - (N - 1)`
- For N=100, this predicts ~565 battles (simulated ~542 unique on average).

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~45% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
