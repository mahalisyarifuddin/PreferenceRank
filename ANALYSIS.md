# Analysis of Sorting Algorithms and Convergence in PreferenceRank

This document summarizes the extensive benchmarking and analysis performed to optimize the pair generation and scoring system in PreferenceRank.

## 1. Sorting Algorithm Comparison (N=100)

We compared 23 sorting algorithms to determine the ultimate balance between user effort (battles) and ranking accuracy (Kendall Tau).

### Benchmarking Methodology
- **N Value:** 100
- **Trials:** 1-10 per algorithm.
- **Metric 1: Avg Battles:** The average number of comparisons generated.
- **Metric 2: Avg Kendall Tau:** Rank correlation between true hidden strengths and estimated scores.

### Results (N=100)
The table is partitioned by Pareto status and sorted primarily by **Average Battles** (ascending) to emphasize user effort.

| Algorithm | Avg Battles | Avg Kendall Tau | Pareto Status |
| :--- | :--- | :--- | :--- |
| Tournament Sort | 1.00 | 0.00 | Pareto-optimal |
| Heap Sort | 168.00 | 0.59 | Pareto-optimal |
| **Ford-Johnson** | **524.00** | **0.89** | **Pareto-optimal** |
| Merge Sort | 535.00 | 0.90 | Pareto-optimal |
| **Shellsort** | **713.00** | **0.95** | **Knee Point** |
| Comb Sort | 1201.00 | 0.99 | Pareto-optimal |
| Odd-Even Sort | 4554.00 | 0.99 | Pareto-optimal |
| Full Rank | 4950.00 | 1.00 | Pareto-optimal |
| Binary Insertion | 536.00 | 0.89 | Dominated |
| Tree Sort | 582.00 | 0.84 | Dominated |
| Quicksort | 601.00 | 0.84 | Dominated |
| Bogosort | 4950.00 | 0.98 | Dominated |
| Bitonic Sort | 1334.00 | 0.95 | Dominated |
| Insertion Sort | 2676.00 | 0.83 | Dominated |
| Cocktail Shaker | 3915.00 | 0.97 | Dominated |
| Bubble Sort | 4914.00 | 0.97 | Dominated |
| Selection Sort | 4950.00 | 0.93 | Dominated |
| Gnome Sort | 4950.00 | 0.95 | Dominated |
| Stooge Sort | 4950.00 | 0.27 | Dominated |
| Cycle Sort | 4950.00 | 0.78 | Dominated |
| Slowsort | 4950.00 | 0.50 | Dominated |
| Pancake Sort | 4950.00 | 0.97 | Dominated |
| Bozosort | 4950.00 | 0.56 | Dominated |

### Pareto Frontier & Knee Point Analysis
The **Pareto Frontier** identifies algorithms where no other algorithm is both better at minimizing battles and better at maximizing accuracy.

- **Ford-Johnson** and **Merge Sort** provide an exceptional accuracy-to-battle ratio for mid-range effort.
- **Shellsort** is identified as the **mathematical knee point** for N=100. It offers 95% accuracy for 713 battles (an 85% reduction vs. Full Rank).
- **Full Rank** remains the gold standard for accuracy but at a massive cost of 4950 battles.

### Bogosort: A Quantitative Comedy
Bogosort is the "jester" of sorting algorithms. Its methodology—shuffling the entire list randomly until it happens to be sorted—is intentionally absurd.

- **Complexity:** $O(N \cdot N!)$. For $N=100$, the expected number of shuffles is approximately $9.3 \times 10^{157}$.
- **Comedy in Numbers:** To sort 100 items, Bogosort would likely need more shuffles than there are atoms in the observable universe. If every atom in the universe were a computer performing a billion shuffles per second, Bogosort would still not be finished by the time the last star in the universe burns out.
- **Efficiency:** In our benchmark, Bogosort was capped at the Round Robin battle count (4950). It achieved ~0.98 accuracy. While this seems high, it is simply because it performed a massive number of random comparisons, which the Bradley-Terry model used to extract information. Its efficiency ($ \tau / \text{Battles} $) is astronomically lower than rational algorithms.

**Conclusion:** **Shellsort** is used for "Quick Rank" as it represents the optimal mathematical knee point for information density vs. user effort.

---

## 2. Bradley-Terry Convergence Analysis

We analyzed the Minorization-Maximization (MM) algorithm's convergence and identified **1e-7** as the knee point threshold. This optimization saves **~47%** of iterations while maintaining a maximum score error of <0.001 (negligible for integer-rounded scores).
