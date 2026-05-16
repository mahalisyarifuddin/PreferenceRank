# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank.

## 1. Sorting Algorithm Comparison (N=100)

We compared 33 sorting algorithms to determine the ultimate balance between user effort (battles) and ranking accuracy (Kendall Tau).

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 10 per algorithm.
- **Metric 1: Avg Battles:** The average number of comparisons generated.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores.

### Results (N=100)
The table is partitioned by Pareto status and sorted by Avg Battles (ascending), then Avg Kendall Tau (descending).

| Algorithm | Avg Battles | Avg Kendall Tau | Pareto Status |
| :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | -0.0056 | Pareto-optimal |
| Quantum Bogo | 1.62 | 0.0078 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5464 | Pareto-optimal |
| Intro Sort | 420.16 | 0.8498 | Pareto-optimal |
| Ford-Johnson | 526.98 | 0.8885 | Pareto-optimal |
| Merge Sort | 542.62 | 0.9043 | Pareto-optimal |
| **Shellsort** | 728.94 | 0.9414 | **Production Knee Point** |
| Comb Sort | 1234.66 | 0.9902 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Stalin Sort | 99.00 | 0.0701 | Dominated |
| Smooth Sort | 152.42 | 0.4740 | Dominated |
| Heap Sort | 152.94 | 0.4841 | Dominated |
| Thanos Sort | 190.00 | 0.5322 | Dominated |
| Patience Sort | 251.70 | 0.4875 | Dominated |
| Binary Insertion | 531.08 | 0.8875 | Dominated |
| Tournament Sort | 561.58 | 0.8872 | Dominated |
| Tree Sort | 649.72 | 0.8375 | Dominated |
| Quicksort | 650.62 | 0.8369 | Dominated |
| Strand Sort | 753.62 | 0.8169 | Dominated |
| Hayate-Shiki | 932.42 | 0.7835 | Dominated |
| Bitonic Sort | 1334.00 | 0.9487 | Dominated |
| Insertion Sort | 2619.90 | 0.8068 | Dominated |
| Cocktail Shaker | 3868.36 | 0.9778 | Dominated |
| Odd-Even Sort | 4658.94 | 0.9881 | Dominated |
| Gnome Sort | 4859.46 | 0.9623 | Dominated |
| Bubble Sort | 4896.92 | 0.9723 | Dominated |
| Bogosort | 4950.00 | 0.9784 | Dominated |
| Pancake Sort | 4950.00 | 0.9757 | Dominated |
| Selection Sort | 4950.00 | 0.9331 | Dominated |
| Bozosort | 4950.00 | 0.5856 | Dominated |
| Cycle Sort | 4950.00 | 0.4677 | Dominated |
| Slowsort | 4950.00 | 0.4627 | Dominated |
| Stooge Sort | 4950.00 | 0.2843 | Dominated |
| BogoBogoSort | 4950.00 | 0.0518 | Dominated |

### Pareto Frontier & Knee Point Analysis
The Pareto Frontier identifies algorithms where no other algorithm is both better at minimizing battles and better at maximizing accuracy.

- **Ford-Johnson**, **Binary Insertion**, and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the optimal knee point for high-accuracy Quick Rank. It offers >94% accuracy for ~720 battles (an 85% reduction vs. Full Rank).
- **Full Rank** remains the gold standard for accuracy but at a massive cost of 4950 battles.

### Battle Count Estimate Regression
To provide accurate user expectations, we simulated Shellsort (Ciura's gaps) across N=5 to N=1000 (1000 trials per N) and derived an ultra-high-fidelity regression model.

- **Observation:** Growth is super-linear, accurately modeled by an ultra-refined power law.
- **Ultra-High-Fidelity Formula:** `Battles ≈ 0.457 * N * (log2(N))^1.46`
- **Accuracy:** This model achieves an RMS relative error of 0.93% across the entire range. It predicts 8 battles for N=5 (simulated ~8), 725 battles for N=100 (simulated ~734), and 13113 battles for N=1000 (simulated ~13047), providing an exceptionally precise estimate for the UI.

### Esoteric & Humorous Sorts: Quantitative Comedy
We included several "impossible" or "humorous" algorithms from SortPedia and Wikipedia to illustrate the range of sorting philosophy.

- **Intelligent Design Sort:** Assumes the Creator already sorted the list. It generates **0 battles** because it immediately terminates, yielding zero information gain.
- **Quantum Bogo Sort:** Generates a random permutation and destroys the universe if it's not sorted. In our benchmark, it generates **~1.5 battles** because it terminates (destroys the universe) the moment it encounters a single out-of-order pair, which happens almost immediately in a random list.
- **Thanos Sort:** Deletes half of the universe (data) to restore order. It shows surprisingly high accuracy for its low battle count (~190), but at the cost of permanently losing half of the items.
- **Miracle Sort:** Waits for a miracle to sort the data. In our benchmark, it performs a single pass (~99 battles) and then gives up on the miracle.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
