## 2024-05-24 - Do not add unauthorized dependencies for testing
**Mode:** Palette
**Learning:** Testing tools like playwright should not be installed via `npm` or have their artifacts (`package.json`, `.gitignore`, `test.js`) left behind unless explicitly authorized by the project structure. If a project does not have testing tools already, adding them can violate boundaries.
**Action:** Do not use `npm` or `yarn` (only `pnpm` if present), and do not commit or leave behind ad-hoc test files or unapproved dependencies when performing manual frontend verification. Verify frontend changes visually using tools like browser or playwright but remove artifacts prior to submit.

## 2024-05-24 - Do not inject user input into innerHTML without sanitization
**Mode:** Medic
**Learning:** In vanilla JS projects, interpolating user inputs into an `innerHTML` string (e.g. `div.innerHTML = "<input value='" + userInput + "'>"`) exposes an XSS vulnerability.
**Action:** When dynamically constructing HTML nodes that require user input values, either create the node with `innerHTML` lacking the value and then explicitly set `element.value = userInput`, or use proper DOM element creation techniques (e.g., `document.createElement`). Ensure no ad-hoc tests (like JS files or `package.json` configurations generated for verifying the XSS fix) are left behind.
