## 2024-04-04 - State Deadlock from UI Coupling
**Mode:** Medic
**Learning:** Checking UI visibility (`!elements.battleSection.classList.contains('hidden')`) inside an asynchronous callback (`setTimeout`) to gate core state updates can cause deadlocks if the UI state changes (e.g., user cancels) before the timeout executes.
**Action:** Always decouple core business logic and state flags (like `this.busy = false`) from UI visibility checks in delayed execution paths.
## 2026-04-11 - Array Filtering and Short-Circuiting in Headers Generation
**Mode:** Razor
**Learning:** Using `[..., condition && 'value', ...].filter(Boolean)` is a much more concise and robust pattern for generating conditional lists compared to deeply nested ternary operators.
**Action:** Use this pattern whenever building arrays of strings or conditionally including elements to avoid nested ternaries and duplicated values.
