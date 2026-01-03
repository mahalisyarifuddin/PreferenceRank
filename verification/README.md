# Verification Results: Monte Carlo Simulations

This directory contains `simulate_monte_carlo.js`, a script used to verify the scoring system of PreferenceRank.

## Summary of Findings

We performed Monte Carlo simulations with 100 items to verify if the scoring system adheres to the "400 point rule" (where a 400 point difference implies a 10:1 odds ratio in win rate).

### 1. Full Pairwise Comparisons (Ground Truth)
- **Comparisons:** 4950 (All vs All)
- **Slope:** ~1.00 (Perfect adherence)
- **Correlation:** >0.99
- **Conclusion:** The underlying Bradley-Terry implementation and the score conversion formula `1000 + 400 * log10(p)` are mathematically correct and adhere strictly to the 400 point rule when data is sufficient.

### 2. Quick Rank (Ford-Johnson Algorithm) - Ties Disabled
- **Comparisons:** ~500 (Sparse)
- **Slope:** ~1.20 (Scores slightly expanded)
- **Correlation:** ~0.85
- **Conclusion:** With sparse data, the model tends to slightly overestimate the spread of skills (Slope > 1.0) because the Ford-Johnson algorithm prioritizes establishing order rather than measuring precise differences between close items. This is an expected trade-off for speed (10x fewer comparisons).

### 3. Quick Rank - Ties Enabled
- **Comparisons:** ~500
- **Slope:** ~0.85 (Scores slightly compressed)
- **Correlation:** ~0.91
- **Conclusion:** Enabling ties (simulated by forcing a tie when true skill difference is small) effectively compresses the scores (Slope < 1.0) because ties act as evidence of equality. However, it improves the correlation with true ranks.

## How to Run
```bash
node verification/simulate_monte_carlo.js
```

Note: You may need to edit the `main()` function in the script to toggle between different regularization constants or test parameters.
