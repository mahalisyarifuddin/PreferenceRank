/**
 * PrismChain.js
 *
 * An optimized, stable iterative Merge Sort implementation.
 * PrismChain is designed for maximal information gain with minimal unique comparisons.
 * In ranking applications, it represents the "Mathematical Knee Point" where accuracy
 * and user effort are perfectly balanced.
 *
 * This version is implemented for the Sort Visualizer API.
 *
 * Author: PreferenceRank Project
 * License: MIT
 */

/**
 * Main entry point for sortvisualizer.com
 * @param {Array} elements - The array of DOM elements to sort.
 */
async function prismChainSort(elements) {
    const n = elements.length;
    if (n <= 1) return;

    // Iterative bottom-up merge sort.
    // This approach is stable and avoids recursive overhead.
    for (let width = 1; width < n; width *= 2) {
        for (let start = 0; start < n; start += 2 * width) {
            const mid = Math.min(start + width, n);
            const end = Math.min(start + 2 * width, n);

            if (mid < end) {
                await prismMerge(elements, start, mid, end);
            }
        }
    }
}

/**
 * Merges two sorted runs within the elements array.
 * @param {Array} elements - The main array being sorted.
 * @param {number} start - Start index of the first run.
 * @param {number} mid - Start index of the second run.
 * @param {number} end - End index of the merge operation.
 */
async function prismMerge(elements, start, mid, end) {
    // Slice subarrays to use as source buffers.
    const leftBuffer = elements.slice(start, mid);
    const rightBuffer = elements.slice(mid, end);

    let l = 0; // Index for leftBuffer
    let r = 0; // Index for rightBuffer
    let k = start; // Index for writing back to elements

    while (l < leftBuffer.length && r < rightBuffer.length) {
        // Visualization: highlight the two elements currently being compared.
        // We use 'mid + r' to point to the current element in the right run of the main array.
        await updateBox(elements, k, mid + r);

        if (getValue(leftBuffer[l]) <= getValue(rightBuffer[r])) {
            elements[k] = leftBuffer[l];
            l++;
        } else {
            elements[k] = rightBuffer[r];
            r++;
        }

        // Highlight the newly placed element.
        await updateBox(elements, k);
        k++;
    }

    // Append remaining elements from the left buffer.
    while (l < leftBuffer.length) {
        elements[k] = leftBuffer[l];
        l++;
        await updateBox(elements, k);
        k++;
    }

    // Append remaining elements from the right buffer.
    while (r < rightBuffer.length) {
        elements[k] = rightBuffer[r];
        r++;
        await updateBox(elements, k);
        k++;
    }
}
