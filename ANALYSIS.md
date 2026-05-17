# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank.

## 1. Sorting Algorithm Comparison (N=100)

We compared 45 sorting algorithms to determine the ultimate balance between user effort (battles) and ranking accuracy (Kendall Tau).

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 10 per algorithm.
- **Metric 1: Avg Battles:** The average number of comparisons generated.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores.

### Results (N=100)
The table is partitioned by Pareto status and sorted by Avg Battles (ascending), then Avg Kendall Tau (descending).

| Algorithm | Avg Battles | Avg Kendall Tau | Pareto Status |
| :--- | :--- | :--- | :--- |
| Socialist Sort | 0.00 | -0.0057 | Pareto-optimal |
| Quantum Bogo | 2.00 | 0.0227 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5333 | Pareto-optimal |
| Thanos Sort | 190.00 | 0.5457 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6632 | Pareto-optimal |
| Random Sort | 264.10 | 0.6943 | Pareto-optimal |
| Intro Sort | 423.00 | 0.8545 | Pareto-optimal |
| Ford-Johnson | 526.30 | 0.8876 | Pareto-optimal |
| Merge Sort | 542.00 | 0.9043 | Pareto-optimal |
| **Shellsort** | 733.00 | 0.9451 | **Production Knee Point** |
| Comb Sort | 1210.90 | 0.9904 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Exit Sort | 0.00 | -0.0146 | Dominated |
| Intelligent Design | 0.00 | -0.0098 | Dominated |
| Genghis Khan Sort | 99.00 | 0.2963 | Dominated |
| Stalin Sort | 99.00 | 0.0945 | Dominated |
| Sleep Sort | 100.00 | 0.0030 | Dominated |
| Heap Sort | 146.40 | 0.4752 | Dominated |
| Smooth Sort | 156.40 | 0.4898 | Dominated |
| Patience Sort | 255.50 | 0.4869 | Dominated |
| Dual-Pivot Quicksort | 527.90 | 0.8377 | Dominated |
| Binary Insertion | 529.40 | 0.8855 | Dominated |
| Tournament Sort | 561.00 | 0.8918 | Dominated |
| Quicksort | 642.60 | 0.8354 | Dominated |
| Tree Sort | 667.90 | 0.8363 | Dominated |
| Strand Sort | 709.70 | 0.8333 | Dominated |
| Hayate-Shiki | 965.50 | 0.7921 | Dominated |
| Bitonic Sort | 1334.00 | 0.9503 | Dominated |
| Circle Sort | 2180.40 | 0.9715 | Dominated |
| Insertion Sort | 2506.40 | 0.8046 | Dominated |
| Cocktail Shaker | 4022.50 | 0.9815 | Dominated |
| Odd-Even Sort | 4554.00 | 0.9855 | Dominated |
| Gnome Sort | 4844.00 | 0.9660 | Dominated |
| Bubble Sort | 4865.60 | 0.9743 | Dominated |
| BogoBogoSort | 4950.00 | 0.0848 | Dominated |
| Bogosort | 4950.00 | 0.9794 | Dominated |
| Bozosort | 4950.00 | 0.5606 | Dominated |
| Cocktail Selection | 4950.00 | 0.9472 | Dominated |
| Cycle Sort | 4950.00 | 0.1995 | Dominated |
| Double Selection | 4950.00 | 0.9378 | Dominated |
| Pancake Sort | 4950.00 | 0.9750 | Dominated |
| Selection Sort | 4950.00 | 0.9312 | Dominated |
| Silly Sort | 4950.00 | 0.1402 | Dominated |
| Slowsort | 4950.00 | 0.4629 | Dominated |
| Stooge Sort | 4950.00 | 0.2820 | Dominated |

### Pareto Frontier & Knee Point Analysis
The Pareto Frontier identifies algorithms where no other algorithm is both better at minimizing battles and better at maximizing accuracy.

- **Ford-Johnson**, **Intro Sort**, and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the optimal knee point for high-accuracy Quick Rank. It offers >94% accuracy for ~730 battles (an 85% reduction vs. Full Rank).
- **Full Rank** remains the gold standard for accuracy but at a massive cost of 4950 battles.

### Battle Count Estimate Regression
To provide accurate user expectations, we simulated Shellsort (Ciura's gaps) across N=5 to N=1000 (1000 trials per N) and derived an ultra-high-fidelity regression model.

- **Observation:** Growth is super-linear, accurately modeled by an ultra-refined power law.
- **Ultra-High-Fidelity Formula:** `Battles ≈ 0.457 * N * (log2(N))^1.46`
- **Accuracy:** This model achieves an RMS relative error of 0.93% across the entire range. It predicts 8 battles for N=5 (simulated ~8), 725 battles for N=100 (simulated ~734), and 13113 battles for N=1000 (simulated ~13047), providing an exceptionally precise estimate for the UI.

### Esoteric & Humorous Sorts: Quantitative Comedy
We included several "impossible" or "humorous" algorithms from SortPedia and Wikipedia to illustrate the range of sorting philosophy.

- **Socialist Sort:** Assumes all items are already equal and thus already sorted. It generates **0 battles**.
- **Quantum Bogo Sort:** Generates a random permutation and destroys the universe if it's not sorted. In our benchmark, it generates **~2 battles** because it terminates the moment it encounters a single out-of-order pair.
- **Thanos Sort:** Deletes half of the universe (data) to restore order. It shows surprisingly high accuracy for its low battle count (~190).
- **Miracle Sort:** Waits for a miracle to sort the data. In our benchmark, it performs a single pass (~99 battles) and then gives up.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
