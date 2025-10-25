**English** | [Bahasa Indonesia](https://github.com/mahalisyarifuddin/PreferenceRank/blob/main/README-id.md)

# PreferenceRank
Sorting made better, powered by science.

## Introduction
PreferenceRank is a versatile and scientific tool for ranking anything you like, inspired by viral character/bias sorters but enhanced with a more rigorous approach. Rank your favorite characters, foods, movies, or travel destinations with precision and fun.

## How It Works
PreferenceRank sorts your items by comparing them in pairs. It uses the **Bradley-Terry Elo rating system** to assign a score to each item based on your choices, providing a transparent and relative ranking. See the "Ranking Modes" section for more details on the comparison methods.

## Ranking Modes
PreferenceRank offers two distinct modes to sort your items:

- **Full Rank (Default):** This mode uses a comprehensive round-robin tournament system where every item is compared against every other item. This method is thorough and guarantees the most accurate representation of your preferences but can be time-consuming for large lists.

- **Quick Rank:** This mode uses an intelligent active learning algorithm to reduce the number of comparisons. It prioritizes matchups between items with similar scores, efficiently refining the ranking. Our tests show that Quick Rank can be significantly faster (over 30% reduction in time for a list of 10 items) while maintaining a very high level of accuracy. This is the recommended mode for large lists or when you need a good ranking quickly.

## Quick Start
1. Download the `PreferenceRank.html` file from the repository.
2. Open the file in any modern web browser.
3. Start ranking your preferences!

## Key Features
- **Flexible Input**: Rank anything—characters, foods, movies, destinations, and more.
- **Two Ranking Modes**: Choose between a comprehensive "Full Rank" or an intelligent "Quick Rank" (see details above).
- **Scientific Scoring**: Utilizes the Bradley-Terry Elo rating system for accurate results.
- **Undo and Ties**: Easily undo your last choice or allow for ties in the rankings.
- **Lightweight**: A single HTML file with no external dependencies, making it portable and fast.
- **Theme Options**: Choose between light, dark, or auto themes for a personalized experience.
- **Keyboard Shortcuts**: Use keyboard shortcuts for quicker selections during ranking.
- **Multi-language Support**: Available in English and Bahasa Indonesia.

## Customization
PreferenceRank is open source, allowing you to modify and adapt it as needed. Tweak the algorithm, redesign the UI, or add new functionality—it's all up to you.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributions
Contributions are welcome! Feel free to fork the repository and submit a pull request. For major changes, please open an issue first to discuss your ideas.

## Feedback
If you have any feedback or suggestions, please reach out via the Issues section of the repository.
