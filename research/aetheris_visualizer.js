/**
 * Aetheris Sort: The Holy Grail of Preference Ranking
 * Synthesizes Binary Shellsort (Tokuda gaps) and Linear Shifting.
 * Optimized for the SortVisualizer.com API.
 */
async function aetherisSort(elements) {
    const n = elements.length;
    const gaps = [1747332, 776592, 345152, 153401, 68178, 30301, 13467, 5985, 2660, 1182, 525, 233, 103, 46, 20, 9, 4].filter(g => g < n);

    // Phase 1: Binary Shellsort (Tokuda Gaps)
    for (const gap of gaps) {
        for (let i = gap; i < n; i++) {
            let lo = 0;
            let hi = Math.floor(i / gap);
            const valI = getValue(elements[i]);

            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                const valMid = getValue(elements[mid * gap + (i % gap)]);
                await updateBox(elements, i, mid * gap + (i % gap));
                if (valI > valMid) {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }

            // Shift elements in the gap chain to make room
            for (let j = Math.floor(i / gap); j > lo; j--) {
                const idx1 = j * gap + (i % gap);
                const idx2 = (j - 1) * gap + (i % gap);
                await swap(idx1, idx2);
            }
        }
    }

    // Phase 2: Final Linear Shifting Pass (Gap = 1)
    // This handles local precision and ensures total order.
    for (let i = 1; i < n; i++) {
        let j = i;
        const valI = getValue(elements[i]);
        while (j > 0) {
            const valPrev = getValue(elements[j - 1]);
            await updateBox(elements, j, j - 1);
            if (valI < valPrev) {
                await swap(j, j - 1);
                j--;
            } else {
                break;
            }
        }
    }
}
