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
| Intelligent Design | 0.00 | 0.0331 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5165 | Pareto-optimal |
| Thanos Sort | 190.00 | 0.5265 | Pareto-optimal |
| Intro Sort | 445.40 | 0.8566 | Pareto-optimal |
| Ford-Johnson | 525.70 | 0.8937 | Pareto-optimal |
| Binary Insertion | 529.90 | 0.8953 | Pareto-optimal |
| Merge Sort | 543.80 | 0.9049 | Pareto-optimal |
| **Shellsort** | **719.50** | **0.9446** | **Production Knee Point** |
| Comb Sort | 1201.00 | 0.9897 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Quantum Bogo | 1.40 | -0.0349 | Dominated |
| Stalin Sort | 99.00 | 0.1055 | Dominated |
| Smooth Sort | 147.00 | 0.4847 | Dominated |
| Heap Sort | 147.20 | 0.4650 | Dominated |
| Patience Sort | 243.70 | 0.4525 | Dominated |
| Tournament Sort | 556.40 | 0.8895 | Dominated |
| Tree Sort | 598.10 | 0.8354 | Dominated |
| Quicksort | 647.20 | 0.8359 | Dominated |
| Strand Sort | 705.50 | 0.8321 | Dominated |
| Bitonic Sort | 1334.00 | 0.9477 | Dominated |
| Insertion Sort | 2581.00 | 0.8063 | Dominated |
| Cocktail Shaker | 4011.00 | 0.9802 | Dominated |
| Odd-Even Sort | 4682.70 | 0.9896 | Dominated |
| Bubble Sort | 4884.40 | 0.9709 | Dominated |
| Gnome Sort | 4895.60 | 0.9660 | Dominated |
| Selection Sort | 4950.00 | 0.9339 | Dominated |
| Bogosort | 4950.00 | 0.9789 | Dominated |
| Pancake Sort | 4950.00 | 0.9762 | Dominated |
| Bozosort | 4950.00 | 0.5992 | Dominated |
| Slowsort | 4950.00 | 0.4645 | Dominated |
| Cycle Sort | 4950.00 | 0.3362 | Dominated |
| Stooge Sort | 4950.00 | 0.3124 | Dominated |
| BogoBogoSort | 4950.00 | 0.0487 | Dominated |

### Pareto Frontier & Knee Point Analysis
The Pareto Frontier identifies algorithms where no other algorithm is both better at minimizing battles and better at maximizing accuracy.

- **Ford-Johnson**, **Binary Insertion**, and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the optimal knee point for high-accuracy Quick Rank. It offers >94% accuracy for ~720 battles (an 85% reduction vs. Full Rank).
- **Full Rank** remains the gold standard for accuracy but at a massive cost of 4950 battles.

### Esoteric & Humorous Sorts: Quantitative Comedy
We included several "impossible" or "humorous" algorithms from SortPedia and Wikipedia to illustrate the range of sorting philosophy.

- **Intelligent Design Sort:** Assumes the Creator already sorted the list. $O(1)$ time, but zero information gained if it wasn't already sorted.
- **Thanos Sort:** Deletes half of the universe (data) to restore order. Surprisingly high accuracy for its low battle count, at the cost of losing half your data.
- **Miracle Sort:** Waits for a miracle to sort the data.
- **Quantum Bogo Sort:** Generates a random permutation and destroys the universe if it's not sorted.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
