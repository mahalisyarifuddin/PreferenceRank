**English** | [Bahasa Indonesia](README-id.md)

# PreferenceRank
Sorting made better, powered by science.

## Introduction
PreferenceRank is a versatile and scientific tool for ranking anything you like, inspired by viral character/bias sorters but enhanced with a more rigorous approach. Rank your favorite characters, foods, movies, or travel destinations with precision and fun.

## How It Works
PreferenceRank sorts your items by comparing them in pairs. It uses an **Elo rating system**, inspired by the Bradley-Terry model, to assign a score to each item based on your choices. This provides a transparent and relative ranking that adapts with every decision you make. See the "Ranking Modes" section for more details on the comparison methods.

## Ranking Modes
PreferenceRank offers two distinct modes to sort your items:

- **Full Rank (Default):** Uses a comprehensive round-robin system (Battles = N(N-1)/2). Guarantees the most accurate preferences but grows quadratically. Best for small lists (<20 items).

- **Quick Rank:** Uses the **Ford-Johnson Algorithm** (Merge-Insertion Sort) for efficient pair generation, combined with **pure Bradley-Terry scoring** for accurate representation. This optimized approach minimizes comparisons (Battles ≈ N log₂ N - 1.44 N + 3.3) by skipping redundant refinement steps while maintaining statistical ranking quality.
    - *Example:* For 50 items, Quick Rank uses ~215 battles vs. 1225 for Full Rank (~80% reduction).

## Technical Details
PreferenceRank uses the **Newton-Raphson algorithm** to find the Maximum Likelihood Estimate (MLE) for the Bradley-Terry model. Compared to the standard MM (Minorization-Maximization) algorithm, Newton-Raphson offers quadratic convergence, typically reaching high precision in fewer than 10 iterations, ensuring rapid and accurate score calculations even for larger datasets.

## Quick Start
1. Download the `PreferenceRank.html` file from the repository.
2. Open the file in any modern web browser.
3. Start ranking your preferences!

## Key Features
- **Flexible Input**: Rank anything—characters, foods, movies, destinations, and more.
- **Two Ranking Modes**: Choose between a comprehensive "Full Rank" or an intelligent "Quick Rank" (see details above).
- **Scientific Scoring**: Utilizes the Bradley-Terry Elo rating system for accurate results.
- **Uncertainty Estimates**: Visualizes ranking confidence with "Rank Spread" and "Confidence Interval (CI)" details, available in both **Quick Rank** and **Full Rank** modes.
- **Matches Count**: View the number of battles each item participated in for deeper insights.
- **Undo and Ties**: Easily undo your last choice or allow for ties in the rankings.
- **Lightweight**: A single HTML file with no external dependencies, making it portable and fast.
- **Theme Options**: Choose between light, dark, or auto themes for a personalized experience.
- **Keyboard Shortcuts**: Use keyboard shortcuts for quicker selections during ranking.
- **Session Persistence**: Your progress is automatically saved to your browser's local storage, allowing you to resume ranking sessions anytime.
- **Copy Results**: Easily copy your final ranking table to the clipboard with a single click.
- **Multi-language Support**: Available in English and Bahasa Indonesia.

## Customization
PreferenceRank is open source, allowing you to modify and adapt it as needed. Tweak the algorithm, redesign the UI, or add new functionality—it's all up to you.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributions
Contributions are welcome! Feel free to fork the repository and submit a pull request. For major changes, please open an issue first to discuss your ideas.

## Feedback
If you have any feedback or suggestions, please reach out via the Issues section of the repository.
