## 2024-05-22 - Accessibility & Testability in Single-File Projects
**Mode:** Palette / Medic
**Learning:** In a single-file HTML project without `package.json`, standard `pnpm test` workflows are impossible. Verification requires manual extraction of JS and mocking the DOM in a standalone Node.js script.
**Action:** When working on similar projects, immediately verify if standard tooling exists. If not, plan to write custom verification scripts that handle `document` and `window` mocking.
**Learning:** The initial implementation of `updateProgress` had a subtle bug where it relied on `progressText` being splittable and having a second part, which failed for the default '0'.
**Action:** Always check default values and initialization paths for UI components.

## 2024-05-22 - Contrast Ratios
**Mode:** Palette
**Learning:** `#0070ea` passes AA on white (4.65:1) but fails on off-white `#f9f9ff` (4.38:1).
**Action:** Verify contrast against the *actual* background color defined in CSS variables, not just assumed white/black.
**Details:**
- Light Mode New Primary: `#0060c9` on `#f9f9ff` -> 5.7:1 (Passes AA)
- Dark Mode New Primary: `#3395ff` on `#10131b` -> 5.6:1 (Passes AA)
