# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank.

## 1. Sorting Algorithm Comparison (N=100)

We compared 24 sorting algorithms to determine the ultimate balance between user effort (battles) and ranking accuracy (Kendall Tau).

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 10 per algorithm.
- **Metric 1: Avg Battles:** The average number of comparisons generated.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores.

### Results (N=100)
The table is partitioned by Pareto status and sorted by Avg Battles (ascending), then Avg Kendall Tau (descending).

| Algorithm | Avg Battles | Avg Kendall Tau | Pareto Status |
| :--- | :--- | :--- | :--- |
| Heap Sort | 165.00 | 0.4856 | Pareto-optimal |
| Ford-Johnson | 527.20 | 0.8865 | Pareto-optimal |
| Binary Insertion | 532.30 | 0.8884 | Pareto-optimal |
| Merge Sort | 543.10 | 0.9078 | Pareto-optimal |
| **Shellsort** | **722.10** | **0.9458** | **Production Knee Point** |
| Comb Sort | 1260.40 | 0.9913 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Tournament Sort | 556.30 | 0.8870 | Dominated |
| Tree Sort | 627.40 | 0.8405 | Dominated |
| Quicksort | 652.40 | 0.8307 | Dominated |
| Bitonic Sort | 1334.00 | 0.9463 | Dominated |
| Insertion Sort | 2592.70 | 0.8085 | Dominated |
| Cocktail Shaker | 4003.40 | 0.9788 | Dominated |
| Odd-Even Sort | 4573.80 | 0.9877 | Dominated |
| Bubble Sort | 4887.60 | 0.9728 | Dominated |
| Gnome Sort | 4923.60 | 0.9557 | Dominated |
| Bogosort | 4950.00 | 0.9798 | Dominated |
| Pancake Sort | 4950.00 | 0.9758 | Dominated |
| Selection Sort | 4950.00 | 0.9330 | Dominated |
| Bozosort | 4950.00 | 0.5752 | Dominated |
| Slowsort | 4950.00 | 0.4656 | Dominated |
| Stooge Sort | 4950.00 | 0.2841 | Dominated |
| Cycle Sort | 4950.00 | 0.2279 | Dominated |
| BogoBogoSort | 4950.00 | 0.0487 | Dominated |

### Pareto Frontier & Knee Point Analysis
The Pareto Frontier identifies algorithms where no other algorithm is both better at minimizing battles and better at maximizing accuracy.

- **Ford-Johnson**, **Binary Insertion**, and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the optimal knee point for high-accuracy Quick Rank. It offers >94% accuracy for ~722 battles (an 85% reduction vs. Full Rank).
- **Full Rank** remains the gold standard for accuracy but at a massive cost of 4950 battles.

### Bogosort & BogoBogoSort: Quantitative Comedy
Bogosort and its "evil" twin BogoBogoSort represent the pinnacle of computational absurdity.

- **Bogosort:** Shuffles the entire list randomly until sorted. For N=100, the expected shuffles exceed 10^157.
- **BogoBogoSort:** Recursively Bogosorts prefixes. It is so inefficient that it makes Bogosort look like Quicksort in comparison.
- **In Our Benchmark:** Both were capped at 4950 battles. Their accuracy is merely a byproduct of the Bradley-Terry model extracting sparse information from random noise.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified 1e-7 as the knee point threshold. This optimization saves ~47% of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
