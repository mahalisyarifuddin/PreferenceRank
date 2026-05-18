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
| Exit Sort | 0.00 | 0.0404 | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0516 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5541 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6513 | Pareto-optimal |
| Intro Sort | 407.70 | 0.8538 | Pareto-optimal |
| Ford-Johnson | 526.70 | 0.8925 | Pareto-optimal |
| Merge Sort | 542.90 | 0.9036 | Pareto-optimal |
| **Shellsort** | 744.40 | 0.9434 | **Production Knee Point** |
| Comb Sort | 1260.40 | 0.9906 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0036 | Dominated |
| Socialist Sort | 0.00 | -0.0389 | Dominated |
| Genghis Khan Sort | 99.00 | 0.3765 | Dominated |
| Stalin Sort | 99.00 | 0.1075 | Dominated |
| Sleep Sort | 100.00 | 0.0046 | Dominated |
| Smooth Sort | 141.80 | 0.4803 | Dominated |
| Heap Sort | 146.10 | 0.4937 | Dominated |
| Random Sort | 176.50 | 0.5124 | Dominated |
| Thanos Sort | 190.00 | 0.5288 | Dominated |
| Patience Sort | 250.70 | 0.5142 | Dominated |
| Dual-Pivot Quicksort | 484.60 | 0.8255 | Dominated |
| Binary Insertion | 530.20 | 0.8850 | Dominated |
| Tournament Sort | 552.70 | 0.8869 | Dominated |
| Quicksort | 637.60 | 0.8416 | Dominated |
| Tree Sort | 679.70 | 0.8392 | Dominated |
| Strand Sort | 736.80 | 0.8183 | Dominated |
| Hayate-Shiki | 928.50 | 0.7728 | Dominated |
| Bitonic Sort | 1334.00 | 0.9503 | Dominated |
| Circle Sort | 2148.80 | 0.9733 | Dominated |
| Insertion Sort | 2591.70 | 0.8034 | Dominated |
| Cocktail Shaker | 3942.20 | 0.9766 | Dominated |
| Odd-Even Sort | 4742.10 | 0.9874 | Dominated |
| Bubble Sort | 4886.70 | 0.9730 | Dominated |
| Gnome Sort | 4921.10 | 0.9517 | Dominated |
| BogoBogoSort | 4950.00 | 0.0391 | Dominated |
| Bogosort | 4950.00 | 0.9799 | Dominated |
| Bozosort | 4950.00 | 0.6008 | Dominated |
| Cocktail Selection | 4950.00 | 0.9460 | Dominated |
| Cycle Sort | 4950.00 | 0.3437 | Dominated |
| Double Selection | 4950.00 | 0.9410 | Dominated |
| Pancake Sort | 4950.00 | 0.9756 | Dominated |
| Selection Sort | 4950.00 | 0.9354 | Dominated |
| Silly Sort | 4950.00 | 0.1095 | Dominated |
| Slowsort | 4950.00 | 0.4712 | Dominated |
| Stooge Sort | 4950.00 | 0.2829 | Dominated |

### Pareto Frontier & Knee Point Analysis
The Pareto Frontier identifies algorithms where no other algorithm is both better at minimizing battles and better at maximizing accuracy.

- **Ford-Johnson**, **Intro Sort**, and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the optimal knee point for high-accuracy Quick Rank. It offers >94% accuracy for ~744 battles (an 85% reduction vs. Full Rank).
- **Full Rank** remains the gold standard for accuracy but at a massive cost of 4950 battles.

### Battle Count Estimate Regression
To provide accurate user expectations, we simulated Shellsort (Ciura's gaps) across N=5 to N=1000 (1000 trials per N) and derived an ultra-high-fidelity regression model.

- **Observation:** Growth is super-linear, accurately modeled by an ultra-refined power law.
- **Ultra-High-Fidelity Formula:** `Battles ≈ 0.457 * N * (log2(N))^1.46`
- **Accuracy:** This model achieves an RMS relative error of 0.93% across the entire range. It predicts 8 battles for N=5 (simulated ~8), 725 battles for N=100 (simulated ~734), and 13113 battles for N=1000 (simulated ~13047), providing an exceptionally precise estimate for the UI.

### Esoteric & Humorous Sorts: Quantitative Comedy
We included several "impossible" or "humorous" algorithms from SortPedia and Wikipedia to illustrate the range of sorting philosophy.

- **Socialist Sort:** Assumes all items are already equal and thus already sorted. It generates **0 battles**.
- **Quantum Bogo Sort:** Generates a random permutation and destroys the universe if it's not sorted. In our benchmark, it generates **~1.7 battles** because it terminates the moment it encounters a single out-of-order pair.
- **Thanos Sort:** Deletes half of the universe (data) to restore order. It shows surprisingly high accuracy for its low battle count (~190).
- **Miracle Sort:** Waits for a miracle to sort the data. In our benchmark, it performs a single pass (~99 battles) and then gives up.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
