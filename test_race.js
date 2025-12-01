const fs = require('fs');

/**
 * test_race.js
 *
 * This test verifies the fix for a race condition where clicking 'Cancel'
 * during a vote transition (timeout) would incorrectly show the Results screen
 * instead of remaining on the Input screen.
 */

// Mock DOM environment minimally required for the script
const mockDom = () => {
    global.document = {
        querySelectorAll: (sel) => {
            if (sel === '[id]') {
                const ids = ['inputSection', 'battleSection', 'results', 'restartContainer', 'undo', 'battle', 'tieContainer', 'progress', 'shortcutTip', 'cancel', 'shortcutToggle', 'language', 'theme', 'items', 'allowTies', 'quickRank', 'start', 'left', 'right', 'tie', 'restartBattle', 'restartNew', 'title', 'labelItems', 'labelTies', 'labelQuick'];
                return ids.map(id => {
                    return {
                        id,
                        classList: {
                            _classes: new Set(),
                            add: function(c) { this._classes.add(c); },
                            remove: function(c) { this._classes.delete(c); },
                            toggle: function(c, force) {
                                if (force === undefined) {
                                    if (this._classes.has(c)) this._classes.delete(c);
                                    else this._classes.add(c);
                                } else {
                                    if (force) this._classes.add(c);
                                    else this._classes.delete(c);
                                }
                            },
                            contains: function(c) { return this._classes.has(c); }
                        },
                        options: [{}, {}, {}],
                        style: {},
                        textContent: '',
                        value: '',
                        checked: false,
                        click: function() { if (this.onclick) this.onclick(); },
                        firstElementChild: { prepend: () => {} },
                        parentNode: { insertBefore: () => {} }
                    };
                });
            }
            return [];
        },
        createElement: () => ({ innerHTML: '' }),
        documentElement: { className: '' },
        onkeydown: null,
        activeElement: { tagName: 'BODY' }
    };
    global.window = {};
    global.navigator = { language: 'en' };
    global.alert = console.log;
};

const loadCode = () => {
    const html = fs.readFileSync('PreferenceRank.html', 'utf8');
    const scriptContent = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    return scriptContent;
};

const run = () => {
    mockDom();
    const code = loadCode();
    // Prevent auto-initialization
    const codeWithoutRun = code.replace('new PreferenceRank();', '');

    // Test logic injected into the context
    const testScript = `
        dom.items.value = "A\\nB";
        dom.quickRank.checked = true;

        // Hide sections initially (mimic CSS)
        dom.battleSection.classList.add('hidden');
        dom.results.classList.add('hidden');
        dom.inputSection.classList.remove('hidden');

        const app = new PreferenceRank();
        app.start();

        // Capture the timeout callback so we can control it
        let timeoutCallback = null;
        const originalSetTimeout = global.setTimeout;
        global.setTimeout = (fn, delay) => {
            timeoutCallback = fn;
        };

        // Vote Left (This is the last pair for 2 items)
        app.choose('left');

        // Simulate user clicking 'Cancel' BEFORE timeout fires
        dom.cancel.click();

        // Verify we are back to Input and Battle is hidden
        if (!dom.battleSection.classList.contains('hidden')) {
            console.error("FAIL: Battle section should be hidden after Cancel.");
            process.exit(1);
        }

        // Now simulate the timeout firing (delayed action from choose)
        if (timeoutCallback) {
            timeoutCallback();
        } else {
            console.error("FAIL: Timeout callback was not set.");
            process.exit(1);
        }

        // Check if Results are incorrectly shown
        const resultsVisible = !dom.results.classList.contains('hidden');

        if (resultsVisible) {
            console.error("FAIL: Results shown after Cancel! Race condition bug present.");
            process.exit(1);
        } else {
            console.log("SUCCESS: Results not shown. Fix verified.");
        }
    `;

    // Execute the combined code
    eval(codeWithoutRun + testScript);
};

run();
