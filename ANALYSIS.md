# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank.

## 1. Sorting Algorithm Comparison (N=100)

We compared 48 sorting algorithms to determine the ultimate balance between user effort (battles) and ranking accuracy (Kendall Tau).

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 10 per algorithm.
- **Metric 1: Avg Battles:** The average number of comparisons generated.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores.

### Results (N=100)
The table is partitioned by Pareto status and sorted by Avg Battles (ascending), then Avg Kendall Tau (descending).

| Algorithm | Avg Battles | Avg Kendall Tau | Pareto Status |
| :--- | :--- | :--- | :--- |
| Socialist Sort | 0.00 | 0.0077 | Pareto-optimal |
| Quantum Bogo | 1.78 | 0.0082 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5423 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6613 | Pareto-optimal |
| Intro Sort | 393.40 | 0.8071 | Pareto-optimal |
| Dual-Pivot Quicksort | 481.19 | 0.8348 | Pareto-optimal |
| Ford-Johnson | 527.05 | 0.8877 | Pareto-optimal |
| Binary Insertion | 530.07 | 0.8889 | Pareto-optimal |
| Merge Sort | 541.53 | 0.9037 | Pareto-optimal |
| **Shellsort** | 734.36 | 0.9432 | **Production Knee Point** |
| Comb Sort | 1242.58 | 0.9904 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Exit Sort | 0.00 | 0.0040 | Dominated |
| Intelligent Design | 0.00 | -0.0024 | Dominated |
| Genghis Khan Sort | 99.00 | 0.3556 | Dominated |
| Stalin Sort | 99.00 | 0.0933 | Dominated |
| Sleep Sort | 100.00 | 0.0106 | Dominated |
| Heap Sort | 150.66 | 0.4814 | Dominated |
| Smooth Sort | 151.44 | 0.4853 | Dominated |
| Thanos Sort | 190.00 | 0.5373 | Dominated |
| Patience Sort | 248.23 | 0.4662 | Dominated |
| Random Sort | 264.94 | 0.6487 | Dominated |
| Tournament Sort | 557.57 | 0.8872 | Dominated |
| Parallel Merge Sort | 559.65 | 0.8862 | Dominated |
| Tree Sort | 641.35 | 0.8379 | Dominated |
| Quicksort (LTR) | 643.17 | 0.8373 | Dominated |
| Quicksort (Random) | 645.64 | 0.8365 | Dominated |
| Quicksort (RTL) | 648.81 | 0.8380 | Dominated |
| Strand Sort | 747.55 | 0.8199 | Dominated |
| Hayate-Shiki | 951.19 | 0.7884 | Dominated |
| Bitonic Sort | 1334.00 | 0.9496 | Dominated |
| Circle Sort | 2221.48 | 0.9743 | Dominated |
| Insertion Sort | 2558.51 | 0.8016 | Dominated |
| Cocktail Shaker | 3888.84 | 0.9779 | Dominated |
| Odd-Even Sort | 4712.40 | 0.9892 | Dominated |
| Gnome Sort | 4847.01 | 0.9597 | Dominated |
| Bubble Sort | 4890.31 | 0.9721 | Dominated |
| Bogosort | 4950.00 | 0.9789 | Dominated |
| Pancake Sort | 4950.00 | 0.9760 | Dominated |
| Cocktail Selection | 4950.00 | 0.9479 | Dominated |
| Double Selection | 4950.00 | 0.9417 | Dominated |
| Selection Sort | 4950.00 | 0.9336 | Dominated |
| Bozosort | 4950.00 | 0.5866 | Dominated |
| Cycle Sort | 4950.00 | 0.4901 | Dominated |
| Slowsort | 4950.00 | 0.4634 | Dominated |
| Stooge Sort | 4950.00 | 0.2942 | Dominated |
| Silly Sort | 4950.00 | 0.1270 | Dominated |
| BogoBogoSort | 4950.00 | 0.0677 | Dominated |

### Pareto Frontier & Knee Point Analysis
The Pareto Frontier identifies algorithms where no other algorithm is both better at minimizing battles and better at maximizing accuracy.

- **Ford-Johnson**, **Intro Sort**, and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the optimal knee point for high-accuracy Quick Rank. It offers >93% accuracy for ~727 battles (an 85% reduction vs. Full Rank).
- **Full Rank** remains the gold standard for accuracy but at a massive cost of 4950 battles.

### Battle Count Estimate Regression
To provide accurate user expectations, we simulated Shellsort (Ciura's gaps) across N=5 to N=1000 (1000 trials per N) and derived an ultra-high-fidelity regression model.

- **Observation:** Growth is super-linear, accurately modeled by an ultra-refined power law.
- **Ultra-High-Fidelity Formula:** `Battles ≈ 0.457 * N * (log2(N))^1.46`
- **Accuracy:** This model achieves an RMS relative error of 0.93% across the entire range. It predicts 8 battles for N=5 (simulated ~8), 725 battles for N=100 (simulated ~734), and 13113 battles for N=1000 (simulated ~13047), providing an exceptionally precise estimate for the UI.

### Esoteric & Humorous Sorts: Quantitative Comedy
We included several "impossible" or "humorous" algorithms from SortPedia and Wikipedia to illustrate the range of sorting philosophy.

- **Socialist Sort:** Assumes all items are already equal and thus already sorted. It generates **0 battles**.
- **Quantum Bogo Sort:** Generates a random permutation and destroys the universe if it's not sorted. In our benchmark, it generates **~1.5 battles** because it terminates the moment it encounters a single out-of-order pair.
- **Thanos Sort:** Deletes half of the universe (data) to restore order. It shows surprisingly high accuracy for its low battle count (~190).
- **Miracle Sort:** Waits for a miracle to sort the data. In our benchmark, it performs a single pass (~99 battles) and then gives up.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
