## 2025-12-23 - Math.exp optimization
**Learning:** In tight loops, replacing `10 ** x` with `Math.exp(x * Math.log(10))` can yield significant performance improvements (approx 60% faster in this case).
**Action:** Always check for `Math.pow` or `**` in hot paths and consider converting to `Math.exp` if the base is constant.
