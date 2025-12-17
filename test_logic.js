const fs = require('fs');

// Read the HTML file
const html = fs.readFileSync('PreferenceRank.html', 'utf8');

// Extract the script
const scriptContent = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Mock DOM
const domElements = {};
const mockElement = (id, initialClasses = []) => {
    let classes = new Set(initialClasses);
    return {
        id,
        classList: {
            contains: (c) => classes.has(c),
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            toggle: (c, force) => {
                const has = classes.has(c);
                const shouldAdd = force !== undefined ? force : !has;
                if (shouldAdd) classes.add(c);
                else classes.delete(c);
                return shouldAdd;
            }
        },
        value: '',
        textContent: '',
        innerHTML: '',
        style: {},
        parentNode: { insertBefore: () => {} },
        firstElementChild: { prepend: () => {} },
        click: () => {},
        options: [{}, {}, {}]
    };
};

['inputSection', 'battleSection', 'results', 'tieWrap', 'restartWrap', 'tips',
 'start', 'cancel', 'left', 'right', 'tie', 'restartBattle', 'restartNew', 'undo',
 'toggle', 'language', 'theme', 'items', 'allowTies', 'quickRank', 'progress',
 'labelItems', 'labelTies', 'labelQuick', 'title'].forEach(id => {
    // Initial hidden state based on HTML
    const initialClasses = [];
    if (['undo', 'battleSection', 'tieWrap', 'results', 'restartWrap', 'tips'].includes(id)) {
        initialClasses.push('hidden');
    }
    domElements[id] = mockElement(id, initialClasses);
});

// Mock document and window
const dom = domElements;
const document = {
    documentElement: { className: '' },
    querySelectorAll: (selector) => {
        if (selector === '[id]') return Object.values(domElements);
        return [];
    },
    createElement: (tag) => ({ innerHTML: '', textContent: '' }),
    onkeydown: null,
    activeElement: { tagName: 'BODY' }
};
const window = {};
const navigator = { language: 'en-US' };
const alert = (msg) => console.log('Alert:', msg);

// Mock timeout
const setTimeout = (cb, ms) => cb();

// Evaluate the script
// Replace the instantiation to capture it
const modifiedScript = scriptContent.replace('new PreferenceRank();', 'global.app = new PreferenceRank();');
eval(modifiedScript);

// Test Simulation
console.log('Starting simulation...');

// Setup
dom.items.value = 'A\nB\nC\nD\nE';
dom.allowTies.checked = false;
dom.quickRank.checked = true;

// Trigger start
console.log('Clicking Start...');
global.app.start();

let steps = 0;
const maxSteps = 100;

while (!dom.battleSection.classList.contains('hidden') && steps < maxSteps) {
    steps++;
    const leftText = dom.left.textContent;
    const rightText = dom.right.textContent;

    // Deterministic choice: Alphabetical order wins
    let winner = 'left';
    if (leftText < rightText) {
        winner = 'left';
    } else {
        winner = 'right';
    }

    //console.log(`Step ${steps}: ${leftText} vs ${rightText} -> Winner: ${winner}`);
    global.app.choose(winner);
}

if (steps >= maxSteps) {
    console.error('Simulation timed out or stuck!');
    process.exit(1);
}

// Verify results
console.log('Ranking complete.');
if (global.app.provider.final) {
    const items = global.app.items;
    const rankedItems = global.app.provider.final.map(i => items[i]);
    console.log('Ranked Items:', rankedItems);

    const expected = ['A', 'B', 'C', 'D', 'E'];
    const isCorrect = JSON.stringify(rankedItems) === JSON.stringify(expected);
    if (isCorrect) {
        console.log('SUCCESS: Items correctly sorted.');
    } else {
        console.error('FAILURE: Items not sorted correctly.');
        console.error('Expected:', expected);
        console.error('Got:', rankedItems);
        process.exit(1);
    }
} else {
    console.log('No final results found (maybe Full mode does not have final?)');
    process.exit(1);
}
