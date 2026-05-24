# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank.

## 1. Sorting Algorithm Comparison (N=100)

We compared 47 sorting algorithms to determine the ultimate balance between user effort (battles) and ranking accuracy (Kendall Tau).

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 10 per algorithm.
- **Metric 1: Avg Battles:** The average number of comparisons generated.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores.

### Results (N=100)
The table is partitioned by Pareto status and sorted by Avg Battles (ascending), then Avg Kendall Tau (descending).

| Algorithm | Avg Battles | Avg Kendall Tau | Pareto Status |
| :--- | :--- | :--- | :--- |
| Exit Sort | 0.00 | 0.0190 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5403 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6535 | Pareto-optimal |
| Random Sort | 286.90 | 0.7137 | Pareto-optimal |
| Intro Sort | 411.80 | 0.8641 | Pareto-optimal |
| Ford-Johnson | 526.90 | 0.8851 | Pareto-optimal |
| Binary Insertion | 532.50 | 0.8864 | Pareto-optimal |
| Merge Sort | 541.10 | 0.9081 | Pareto-optimal |
| **Shellsort** | 727.40 | 0.9398 | **Production Knee Point** |
| Comb Sort | 1240.60 | 0.9908 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0053 | Dominated |
| Socialist Sort | 0.00 | -0.0166 | Dominated |
| Quantum Bogo | 1.50 | -0.0172 | Dominated |
| Genghis Khan Sort | 99.00 | 0.3038 | Dominated |
| Stalin Sort | 99.00 | 0.0893 | Dominated |
| Sleep Sort | 100.00 | 0.0259 | Dominated |
| Heap Sort | 143.10 | 0.4577 | Dominated |
| Smooth Sort | 144.80 | 0.4684 | Dominated |
| Thanos Sort | 190.00 | 0.5385 | Dominated |
| Patience Sort | 243.20 | 0.4531 | Dominated |
| Dual-Pivot Quicksort | 500.80 | 0.8404 | Dominated |
| Tournament Sort | 558.80 | 0.8796 | Dominated |
| Quicksort | 612.70 | 0.8364 | Dominated |
| Quicksort (LTR) | 624.10 | 0.8321 | Dominated |
| Quicksort (Random) | 655.60 | 0.8362 | Dominated |
| Tree Sort | 663.10 | 0.8354 | Dominated |
| Strand Sort | 702.60 | 0.8137 | Dominated |
| Hayate-Shiki | 944.90 | 0.7791 | Dominated |
| Bitonic Sort | 1334.00 | 0.9505 | Dominated |
| Circle Sort | 2148.80 | 0.9726 | Dominated |
| Insertion Sort | 2551.10 | 0.8021 | Dominated |
| Cocktail Shaker | 3974.00 | 0.9808 | Dominated |
| Odd-Even Sort | 4653.00 | 0.9892 | Dominated |
| Bubble Sort | 4888.50 | 0.9727 | Dominated |
| Gnome Sort | 4915.10 | 0.9570 | Dominated |
| BogoBogoSort | 4950.00 | 0.1042 | Dominated |
| Bogosort | 4950.00 | 0.9758 | Dominated |
| Bozosort | 4950.00 | 0.6042 | Dominated |
| Cocktail Selection | 4950.00 | 0.9463 | Dominated |
| Cycle Sort | 4950.00 | 0.3718 | Dominated |
| Double Selection | 4950.00 | 0.9434 | Dominated |
| Pancake Sort | 4950.00 | 0.9750 | Dominated |
| Selection Sort | 4950.00 | 0.9323 | Dominated |
| Silly Sort | 4950.00 | 0.0821 | Dominated |
| Slowsort | 4950.00 | 0.4644 | Dominated |
| Stooge Sort | 4950.00 | 0.2665 | Dominated |

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
