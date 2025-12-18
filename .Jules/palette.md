## 2024-05-22 - Focus Management in Vanilla JS
**Learning:** When toggling `display: none` classes, vanilla JS `focus()` calls often fail if executed immediately because the browser hasn't repainted.
**Action:** Use `setTimeout(..., 0)` or `requestAnimationFrame` when moving focus to a newly revealed element to ensure it's interactable.
