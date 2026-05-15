
function estimate_old(n) {
    const gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n);
    let battles = 0;
    for (const gap of gaps) {
        for (let i = gap; i < n; i++) {
            let j = i;
            while (j >= gap) {
                battles++;
                j -= gap;
            }
        }
    }
    return Math.round(battles * 0.4);
}

function shellsort_battles(n) {
    let items = Array.from({length: n}, (_, i) => i);
    let battles = 0;
    const gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n);
    for (const gap of gaps) {
        for (let i = gap; i < n; i++) {
            let temp = items[i];
            let j = i;
            while (j >= gap) {
                battles++;
                if (items[j - gap] > temp) {
                    items[j] = items[j - gap];
                    j -= gap;
                } else {
                    break;
                }
            }
            items[j] = temp;
        }
    }
    return battles;
}

[20, 50, 100, 200, 500].forEach(n => {
    let sum = 0;
    for(let i=0; i<100; i++) sum += shellsort_battles(n);
    console.log(`N=${n}: Avg=${(sum/100).toFixed(1)}, EstimateOld=${estimate_old(n)}`);
});
