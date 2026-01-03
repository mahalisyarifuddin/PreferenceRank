# Monte Carlo Simulation Summary

## Methodology
We conducted Monte Carlo simulations to estimate the average number of comparisons required by the "Quick Mode" (Ford-Johnson / Merge Insertion Sort) algorithm.

- **Range:** N = 5 to 100, increment 5.
- **Iterations:** 1000 per N.
- **Conditions:**
    - **No Ties:** Strict deterministic outcome based on ground truth strength.
    - **Ties:** 10% probability of a tie (resolved randomly as per algorithm logic).

## Results

| N   | No Tie (Avg) | Tie (Avg) |
|-----|--------------|-----------|
| 5   | 6.93         | 6.92      |
| 10  | 21.86        | 21.81     |
| 15  | 40.67        | 40.50     |
| 20  | 61.37        | 61.17     |
| 25  | 84.17        | 83.74     |
| 30  | 108.54       | 108.02    |
| 35  | 133.78       | 133.03    |
| 40  | 159.75       | 159.21    |
| 45  | 186.87       | 186.33    |
| 50  | 215.13       | 214.29    |
| 55  | 244.25       | 242.74    |
| 60  | 273.86       | 272.06    |
| 65  | 303.77       | 301.82    |
| 70  | 334.26       | 331.75    |
| 75  | 365.04       | 362.64    |
| 80  | 396.13       | 394.21    |
| 85  | 427.50       | 426.15    |
| 90  | 460.27       | 458.41    |
| 95  | 493.30       | 491.22    |
| 100 | 526.99       | 524.09    |

## Inference
The presence of ties (handled as random wins) had a negligible impact on the comparison count (< 1% difference).

The previous estimation formula `0.78 * N * log2(N)` underestimated comparisons for larger N (e.g., N=100 est 518 vs act 527) and overestimated for small N (e.g., N=20 est 67 vs act 61).

A new linear regression model based on the form $C = N \log_2 N - k N$ was fitted.
For $N=100$: $100 \log_2 100 - C \approx 527 \Rightarrow 664 - C = 527 \Rightarrow C = 137$. $k \approx 1.37$.
For $N=50$: $50 \log_2 50 - C \approx 215 \Rightarrow 282 - C = 215 \Rightarrow C = 67$. $k \approx 1.34$.
For $N=20$: $20 \log_2 20 - C \approx 61 \Rightarrow 86 - C = 61 \Rightarrow C = 25$. $k \approx 1.25$.

We selected **$C \approx N (\log_2 N - 1.35)$** as a robust estimator for the typical range ($N > 10$), providing better accuracy for progress bar estimation.
