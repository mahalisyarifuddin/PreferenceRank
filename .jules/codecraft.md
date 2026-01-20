## 2024-05-22 - Single-file Architecture Constraints
**Mode:** Palette
**Learning:** This repository consists of a standalone HTML file with no `package.json`, making standard `pnpm` commands impossible.
**Action:** Rely on custom verification scripts (Playwright) and manual code inspection instead of standard lint/test scripts.

## 2024-05-22 - Copy functionality vs Visual Sort
**Mode:** Palette
**Learning:** Users expect "Copy Results" to match the visual sort order of the table, not the underlying rank order. Decoupling display sort from export logic leads to confusion.
**Action:** Always store the sorted dataset state (`currentRanking`) when rendering sortable tables so it can be reused by export actions.
