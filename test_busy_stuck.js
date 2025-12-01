
const fs = require('fs');

/**
 * test_busy_stuck.js
 *
 * This test verifies a bug where the 'busy' flag remains true if a user
 * cancels a battle immediately after voting (during the timeout transition).
 * This prevents any further interaction if the user restarts the battle.
 */

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
    const codeWithoutRun = code.replace('new PreferenceRank();', '');

    const testScript = `
        dom.items.value = "A\\nB";
        dom.quickRank.checked = true;

        dom.battleSection.classList.add('hidden');
        dom.results.classList.add('hidden');
        dom.inputSection.classList.remove('hidden');

        const app = new PreferenceRank();
        app.start();

        // Capture timeout
        let timeoutCallback = null;
        const originalSetTimeout = global.setTimeout;
        global.setTimeout = (fn, delay) => {
            timeoutCallback = fn;
        };

        // 1. Vote Left
        app.choose('left');

        // Assert busy is true immediately after vote
        if (!app.busy) {
             console.error("FAIL: App should be busy after choosing.");
             process.exit(1);
        }

        // 2. Cancel immediately (before timeout)
        dom.cancel.click();

        // Battle is hidden
        if (!dom.battleSection.classList.contains('hidden')) {
            console.error("FAIL: Battle section should be hidden.");
            process.exit(1);
        }

        // 3. Timeout fires
        if (timeoutCallback) {
            timeoutCallback();
        } else {
            console.error("FAIL: Timeout callback was not set.");
            process.exit(1);
        }

        // At this point, app.busy might be true (buggy) or false (fixed in loop, but loop skipped).
        // The fix we implemented resets busy in start().

        // 4. Restart Battle
        // dom.start is the button to start.
        dom.start.click();

        // Battle should be visible
        if (dom.battleSection.classList.contains('hidden')) {
            console.error("FAIL: Battle section should be visible after restart.");
            process.exit(1);
        }

        // 5. Try to vote again
        timeoutCallback = null;
        app.choose('left');

        if (!timeoutCallback) {
            console.error("FAIL: Vote was ignored! The app is stuck in busy state.");
            process.exit(1);
        } else {
            console.log("SUCCESS: Vote processed. Bug is fixed.");
        }
    `;

    eval(codeWithoutRun + testScript);
};

run();
