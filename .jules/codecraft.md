## 2024-04-04 - State Deadlock from UI Coupling
**Mode:** Medic
**Learning:** Checking UI visibility (`!elements.battleSection.classList.contains('hidden')`) inside an asynchronous callback (`setTimeout`) to gate core state updates can cause deadlocks if the UI state changes (e.g., user cancels) before the timeout executes.
**Action:** Always decouple core business logic and state flags (like `this.busy = false`) from UI visibility checks in delayed execution paths.