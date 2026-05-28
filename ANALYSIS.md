# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank, now including comparison deduplication to minimize user effort.

## 1. Sorting Algorithm Comparison (N=100)

We compared 48 sorting algorithms to determine the ultimate balance between user effort (unique battles) and ranking accuracy (Kendall Tau). Deduplication is applied: if an algorithm requests a comparison between the same pair twice, the previous result is automatically reused.

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Metric 1: Avg Battles:** The average number of unique comparisons presented to the user.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores.

### Results (N=100)
The table is partitioned by Pareto status and sorted by Avg Battles (ascending), then Avg Kendall Tau (descending).

| Algorithm | Avg Battles | Avg Kendall Tau | Pareto Status |
| :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | 0.0029 | Pareto-optimal |
| Quantum Bogo | 1.69 | 0.0226 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5477 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6613 | Pareto-optimal |
| Intro Sort | 394.94 | 0.8264 | Pareto-optimal |
| Dual-Pivot Quicksort | 481.17 | 0.8337 | Pareto-optimal |
| Ford-Johnson | 526.80 | 0.8894 | Pareto-optimal |
| Merge Sort | 541.12 | 0.9036 | Pareto-optimal |
| **Shellsort** | 671.55 | 0.9421 | **Production Knee Point** |
| Comb Sort | 1237.83 | 0.9903 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Exit Sort | 0.00 | 0.0005 | Dominated |
| Socialist Sort | 0.00 | -0.0054 | Dominated |
| Genghis Khan Sort | 99.00 | 0.3273 | Dominated |
| Stalin Sort | 99.00 | 0.1063 | Dominated |
| Sleep Sort | 100.00 | -0.0004 | Dominated |
| Heap Sort | 150.40 | 0.4761 | Dominated |
| Smooth Sort | 150.96 | 0.4736 | Dominated |
| Thanos Sort | 189.99 | 0.5353 | Dominated |
| Patience Sort | 249.74 | 0.4767 | Dominated |
| Random Sort | 259.77 | 0.6564 | Dominated |
| Binary Insertion | 530.20 | 0.8865 | Dominated |
| Parallel Merge Sort | 558.52 | 0.8870 | Dominated |
| Tournament Sort | 558.97 | 0.8853 | Dominated |
| Quicksort (Random) | 642.78 | 0.8363 | Dominated |
| Quicksort (LTR) | 643.28 | 0.8361 | Dominated |
| Tree Sort | 643.57 | 0.8367 | Dominated |
| Quicksort (RTL) | 646.11 | 0.8354 | Dominated |
| Strand Sort | 743.60 | 0.8212 | Dominated |
| Hayate-Shiki | 932.10 | 0.7852 | Dominated |
| Bitonic Sort | 1334.00 | 0.9497 | Dominated |
| Circle Sort | 2180.40 | 0.9743 | Dominated |
| Insertion Sort | 2565.64 | 0.8023 | Dominated |
| Cocktail Shaker | 3871.29 | 0.9770 | Dominated |
| Odd-Even Sort | 4667.26 | 0.9878 | Dominated |
| Gnome Sort | 4845.45 | 0.9625 | Dominated |
| Bubble Sort | 4874.80 | 0.9727 | Dominated |
| Bogosort | 4950.00 | 0.9790 | Dominated |
| Pancake Sort | 4950.00 | 0.9758 | Dominated |
| Cocktail Selection | 4950.00 | 0.9474 | Dominated |
| Double Selection | 4950.00 | 0.9422 | Dominated |
| Selection Sort | 4950.00 | 0.9339 | Dominated |
| Bozosort | 4950.00 | 0.5822 | Dominated |
| Cycle Sort | 4950.00 | 0.4701 | Dominated |
| Slowsort | 4950.00 | 0.4615 | Dominated |
| Stooge Sort | 4950.00 | 0.2910 | Dominated |
| Silly Sort | 4950.00 | 0.1260 | Dominated |
| BogoBogoSort | 4950.00 | 0.0636 | Dominated |
| Sleep Sort | 100.00 | -0.0004 | Dominated |

### Pareto Frontier & Knee Point Analysis
The Pareto Frontier identifies algorithms where no other algorithm is both better at minimizing unique battles and better at maximizing accuracy.

- **Ford-Johnson**, **Intro Sort**, and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the ultimate "knee point" for production. Following deduplication, it offers >94% accuracy for ~672 unique battles (an 86% reduction vs. Full Rank). Verification using both the Kneedle method and Maximum Perpendicular Distance confirms Shellsort as the optimal trade-off point.
- **Full Rank** remains the gold standard for accuracy but at a massive cost of 4950 battles.

### Battle Count Estimate Regression
To provide accurate user expectations, we simulated Shellsort (Ciura's gaps) with comparison deduplication across N=5 to N=1000 and derived an updated ultra-high-fidelity regression model.

- **Observation:** Growth remains super-linear, but the effective constant is lower due to deduplication.
- **Ultra-High-Fidelity Formula:** `Unique Battles ≈ 0.428 * N * (log2(N))^1.458`
- **Accuracy:** This model achieves an RMS relative error of <1% across the entire range. It predicts 672 battles for N=100 (simulated ~671) and 12226 battles for N=1000 (simulated ~12269), providing an exceptionally precise estimate for the UI.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
