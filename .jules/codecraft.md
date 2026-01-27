## 2024-05-22 - Single-file Architecture Constraints
**Mode:** Palette
**Learning:** This repository consists of a standalone HTML file with no `package.json`, making standard `pnpm` commands impossible.
**Action:** Rely on custom verification scripts (Playwright) and manual code inspection instead of standard lint/test scripts.

## 2024-05-22 - Copy functionality vs Visual Sort
**Mode:** Palette
**Learning:** Users expect "Copy Results" to match the visual sort order of the table, not the underlying rank order. Decoupling display sort from export logic leads to confusion.
**Action:** Always store the sorted dataset state (`currentRanking`) when rendering sortable tables so it can be reused by export actions.

## 2024-05-24 - Input Parsing Redundancy
**Mode:** Bolt
**Learning:** In simple "reactive" UI setups (via `oninput`), separate method calls (`check`, `updateCount`) often duplicate expensive parsing logic (`getItems`), leading to O(N) operations running multiple times per event.
**Action:** Centralize state updates into a single method (like `updateInputState`) that computes derived state once and passes it to consumers.

## 2024-05-25 - Verification of Single-file Apps
**Mode:** Palette
**Learning:** Verifying logic inside a single HTML file is challenging without a build step.
**Action:** Extract the JS content using regex/sed and run it in a Node.js environment with a mock DOM (`document`, `window`, etc.) to verify logic without a browser.

## 2024-05-25 - Math.log2 Edge Cases
**Mode:** Medic
**Learning:** `Math.log2(0)` returns `-Infinity`, which can propagate to `NaN` in mathematical formulas like comparisons estimates. Formulas derived for large N often fail for N=0 or N=1.
**Action:** Always include guard clauses (e.g., `if (n <= 1) return 0`) when implementing statistical estimation formulas to handle empty or trivial inputs gracefully.
