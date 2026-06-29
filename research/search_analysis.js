/**
 * research/search_analysis.js
 *
 * Performance analysis of Linear Search vs Binary Search in terms of "battles" (comparisons).
 * Consistent with the state-machine pattern used in sort_analysis.js.
 */

class LinearSearchProvider {
    constructor(n) {
        this.n = n;
        this.i = 0;
    }

    /**
     * @param {number} result - 0.5 if found, 0 if target < item, 1 if target > item
     */
    next(result) {
        if (result === 0.5) return null;
        if (this.i < this.n) {
            return ['target', this.i++];
        }
        return null;
    }
}

class BinarySearchProvider {
    constructor(n) {
        this.n = n;
        this.lo = 0;
        this.hi = n - 1;
    }

    next(result) {
        if (result === 0.5) return null;
        if (result !== undefined) {
            if (result === 1) {
                this.lo = this.mid + 1;
            } else {
                this.hi = this.mid - 1;
            }
        }
        if (this.lo <= this.hi) {
            this.mid = Math.floor((this.lo + this.hi) / 2);
            return ['target', this.mid];
        }
        return null;
    }
}

function simulate(n, ProviderClass, trials = 10000) {
    let totalComps = 0;
    for (let t = 0; t < trials; t++) {
        // target index in [0, n-1].
        // For simplicity, we assume the target is always in the array for these basic tests.
        // The GFG article mentions searching for a target element.
        const targetIdx = Math.floor(Math.random() * n);
        const provider = new ProviderClass(n);
        let result;
        let pair = provider.next();
        let comps = 0;
        while (pair) {
            comps++;
            const [target, arrayIdx] = pair;
            if (targetIdx === arrayIdx) {
                result = 0.5; // Found
            } else if (targetIdx > arrayIdx) {
                result = 1;
            } else {
                result = 0;
            }
            pair = provider.next(result);
        }
        totalComps += comps;
    }
    return totalComps / trials;
}

const sizes = [10, 100, 1000];
console.log("N\tLinear Search\tBinary Search");
for (const n of sizes) {
    const avgLinear = simulate(n, LinearSearchProvider);
    const avgBinary = simulate(n, BinarySearchProvider);
    console.log(`${n}\t${avgLinear.toFixed(2)}\t\t${avgBinary.toFixed(2)}`);
}
