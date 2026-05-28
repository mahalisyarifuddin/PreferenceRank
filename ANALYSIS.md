# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank, using "Pure Unique" comparisons to measure true information efficiency.

## 1. Sorting Algorithm Comparison (N=100)

We compared 48 sorting algorithms to determine the ultimate balance between user effort (unique battles) and ranking accuracy (Kendall Tau). Deduplication is applied: redundant comparisons are resolved silently, so "Avg Battles" represents only unique user interactions.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Metric 1: Avg Battles:** The average number of unique comparisons presented to the user.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores (BT).

### Results (N=100)
The table is partitioned by Pareto status and sorted by Avg Battles (ascending), then Avg Kendall Tau (descending).

| Algorithm | Avg Battles | Avg Kendall Tau | Pareto Status |
| :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | 0.0070 | Pareto-optimal |
| Quantum Bogo | 1.80 | 0.0192 | Pareto-optimal |
| BogoBogoSort | 44.94 | 0.0942 | Pareto-optimal |
| Smooth Sort | 98.62 | 0.4751 | Pareto-optimal |
| Thanos Sort | 99.00 | 0.5460 | Pareto-optimal |
| Hater Sort | 196.04 | 0.6651 | Pareto-optimal |
| Intro Sort | 406.79 | 0.8356 | Pareto-optimal |
| Dual-Pivot Quicksort | 488.27 | 0.8365 | Pareto-optimal |
| Ford-Johnson | 526.84 | 0.8899 | Pareto-optimal |
| Merge Sort | 541.17 | 0.9034 | Pareto-optimal |
| **Shellsort** | 670.38 | 0.9318 | **Production Knee Point** |
| Comb Sort | 852.90 | 0.9747 | Pareto-optimal |
| Stooge Sort | 2889.84 | 0.9900 | Pareto-optimal |
| Bozosort | 4946.48 | 1.0000 | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0048 | Dominated |
| Exit Sort | 0.00 | -0.0004 | Dominated |
| Miracle Sort | 99.00 | 0.5458 | Dominated |
| Genghis Khan Sort | 99.00 | 0.3516 | Dominated |
| Stalin Sort | 99.00 | 0.1050 | Dominated |
| Sleep Sort | 100.00 | -0.0095 | Dominated |
| Heap Sort | 101.23 | 0.4863 | Dominated |
| Silly Sort | 138.00 | 0.2444 | Dominated |
| Patience Sort | 197.99 | 0.4769 | Dominated |
| Random Sort | 251.25 | 0.6493 | Dominated |
| Cycle Sort | 500.50 | 0.4591 | Dominated |
| Binary Insertion | 530.58 | 0.8868 | Dominated |
| Parallel Merge Sort | 557.96 | 0.8870 | Dominated |
| Tournament Sort | 558.04 | 0.8877 | Dominated |
| Quicksort (Random) | 645.54 | 0.8361 | Dominated |
| Quicksort (LTR) | 648.94 | 0.8371 | Dominated |
| Tree Sort | 649.52 | 0.8359 | Dominated |
| Quicksort (RTL) | 651.76 | 0.8374 | Dominated |
| Strand Sort | 751.27 | 0.8192 | Dominated |
| Hayate-Shiki | 928.67 | 0.7838 | Dominated |
| Bitonic Sort | 1038.89 | 0.9576 | Dominated |
| Circle Sort | 1207.89 | 0.9697 | Dominated |
| Slowsort | 1321.99 | 0.9467 | Dominated |
| Gnome Sort | 2548.66 | 0.8015 | Dominated |
| Bubble Sort | 2570.82 | 0.8033 | Dominated |
| Insertion Sort | 2593.32 | 0.8044 | Dominated |
| Odd-Even Sort | 2615.69 | 0.8058 | Dominated |
| Cocktail Selection | 2749.14 | 0.9233 | Dominated |
| Selection Sort | 2758.31 | 0.8910 | Dominated |
| Double Selection | 2766.07 | 0.9222 | Dominated |
| Cocktail Shaker | 2586.94 | 0.8063 | Dominated |
| Pancake Sort | 3092.15 | 0.9695 | Dominated |
| Bogosort | 4950.00 | 1.0000 | Dominated |
| Full Rank | 4950.00 | 1.0000 | Dominated |

### Pareto Frontier & Knee Point Analysis
The Pareto Frontier identifies algorithms where no other algorithm is both better at minimizing unique battles and better at maximizing accuracy.

- **Ford-Johnson**, **Intro Sort**, and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the optimal "knee point" for production. Under the "Pure Unique" model, it offers >93% accuracy for ~670 unique battles (an 86% reduction vs. Full Rank). It remains the most mathematically sound trade-off for human preference ranking.
- **Full Rank** (and eventually Bogosort/Bozosort) achieve a perfect 1.000 Tau but at an enormous cost of ~4950 battles.

### Battle Count Estimate Regression
To provide accurate user expectations, we simulated Shellsort (Ciura's gaps) with full comparison deduplication and derived an ultra-high-fidelity regression model.

- **Observation:** Growth remains super-linear, but unique counts are ~8.5% lower than raw algorithmic comparisons.
- **Ultra-High-Fidelity Formula:** `Unique Battles ≈ 0.428 * N * (log2(N))^1.458`
- **Accuracy:** This model achieves an RMS relative error of <1% across the entire range. It predicts ~671 battles for N=100 (simulated ~670), providing a precise estimate for the UI.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
