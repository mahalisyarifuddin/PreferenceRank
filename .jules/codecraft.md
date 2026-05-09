## 2024-05-24 - Do not add unauthorized dependencies for testing
**Mode:** Palette
**Learning:** Testing tools like playwright should not be installed via `npm` or have their artifacts (`package.json`, `.gitignore`, `test.js`) left behind unless explicitly authorized by the project structure. If a project does not have testing tools already, adding them can violate boundaries.
**Action:** Do not use `npm` or `yarn` (only `pnpm` if present), and do not commit or leave behind ad-hoc test files or unapproved dependencies when performing manual frontend verification. Verify frontend changes visually using tools like browser or playwright but remove artifacts prior to submit.
