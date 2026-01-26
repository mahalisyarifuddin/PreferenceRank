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
