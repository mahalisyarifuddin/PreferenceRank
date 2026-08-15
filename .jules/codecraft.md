## YYYY-MM-DD - O(N^2) JSON stringification of reach matrix
**Mode:** Bolt
**Learning:** `JSON.stringify` converts typed arrays (like `Uint8Array`) into extremely massive dictionary objects (e.g. `{"0": 1, "1": 0, "2": 1, ...}`) rather than regular arrays. This bloats payload sizes factorially and causes massive lag in serializations. For `this.reach` at N=100 (10,000 values), this took ~400ms per save to serialize, freezing the UI.
**Action:** Exclude large `Uint8Array`s from local storage save payloads using object destructuring, and mathematically reconstruct them during restore via existing deterministic transaction logs (`matches`).
