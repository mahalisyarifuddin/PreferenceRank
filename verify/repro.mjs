#!/usr/bin/env node
/**
 * PreferenceRank — no-browser reproduction & verification harness.
 *
 * Reproduces the score-collapse defect in PreferenceRank.recalculateScores()
 * (weak items clamped to score 0, collapsing the bottom of the ranking into
 * input order) and verifies the invariants any fix must keep:
 *
 *   1. Injective — distinct displayed scores == distinct MLE strengths.
 *   2. Monotone  — ordering by `scores` matches ordering by `_rawScores`.
 *   3. True ties stay tied (equal strengths ⇒ equal scores).
 *   4. Mean score stays 1000 (getGrade() thresholds keep their meaning).
 *   5. The scale is never widened.
 *   6. `_rawScores` is left untouched (Stats depends on the raw Elo values).
 *   7. Deterministic, no new runtime dependencies.
 *
 * Runs the real PreferenceRank.html under jsdom. Every session is driven by a
 * seeded PRNG, so the numbers are reproducible run to run.
 *
 *   cd verify
 *   npm ci
 *   npm run verify
 *
 * Exit code 0 when every check passes, 1 when the defect (or a regression of
 * any invariant) is present.
 */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const HTML = readFileSync(new URL('../PreferenceRank.html', import.meta.url), 'utf8');
const ITEM = i => `Item ${String(i + 1).padStart(2, '0')}`;
const itemList = n => Array.from({ length: n }, (_, i) => ITEM(i));

/* ------------------------------------------------------------------ *
 *  Seeded PRNG (mulberry32) — drives shuffles, swaps, Stats and picks *
 * ------------------------------------------------------------------ */
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/* ------------------------------------------------------------------ *
 *  Boot the real app inside jsdom                                     *
 * ------------------------------------------------------------------ */
function boot(seed, savedSession = null, configure = () => {}) {
	const rng = mulberry32(seed);
	const clipboard = { text: null };
	const dom = new JSDOM(HTML, {
		url: 'https://preferencerank.test/',
		runScripts: 'dangerously',
		pretendToBeVisual: true,
		beforeParse(window) {
			const schedule = window.setTimeout.bind(window);
			window.setTimeout = (fn, ms, ...args) => ms === 150 ? (window.finishVote = fn, 0) : schedule(fn, ms, ...args);
			window.Math.random = rng;
			window.matchMedia ??= query => ({
				matches: false,
				media: query,
				onchange: null,
				addListener() {},
				removeListener() {},
				addEventListener() {},
				removeEventListener() {},
				dispatchEvent: () => false
			});
			Object.defineProperty(window.navigator, 'clipboard', {
				configurable: true,
				value: { writeText: t => (clipboard.text = t, Promise.resolve()) }
			});
			configure(window);
			if (savedSession !== null)
				window.localStorage.setItem('preferenceRankData', savedSession);
		}
	});
	windows.set(dom.window.app, dom.window);
	return { window: dom.window, rng, clipboard };
}

/* ------------------------------------------------------------------ *
 * Drive the real controls; release the vote debounce without sleeping.
 * ------------------------------------------------------------------ */
const windows = new WeakMap();
function driveSteps(app, decide, maxSteps) {
	const window = windows.get(app);
	let steps = 0;
	while (app.pair && steps < maxSteps) {
		const result = decide(...app.pair);
		const button = result === .5 ? 'tie' : Boolean(result) !== app.swapped ? 'left' : 'right';
		window.document.getElementById(button).click();
		window.finishVote?.();
		steps++;
	}
	return steps;
}

function runSession(booted, { items, quick, ties, decide, pauseAfter = Infinity }) {
	const { window } = booted;
	const { document } = window;
	const app = window.app;
	document.getElementById('items').value = items.join('\n');
	document.getElementById('quickRank').checked = quick;
	document.getElementById('allowTies').checked = ties;
	app.start();
	driveSteps(app, decide, pauseAfter);
	if (app.pair) return app; // paused mid-session
	const finished = driveSteps(app, decide, 1e6);
	if (app.pair) throw new Error('session did not terminate');
	return app;
}

/* ------------------------------------------------------------------ *
 *  Metrics & invariant checks                                        *
 * ------------------------------------------------------------------ */
function metrics(app) {
	const n = app.items.length;
	const scores = app.scores;
	const raw = app._rawScores;
	const byScore = [...scores.keys()].sort((a, b) => scores[b] - scores[a]);
	const byRaw = [...raw.keys()].sort((a, b) => raw[b] - raw[a]);
	let mono = true;
	for (let k = 1; k < n; k++) {
		if (raw[byScore[k]] > raw[byScore[k - 1]]) mono = false;
		if (scores[byRaw[k]] > scores[byRaw[k - 1]]) mono = false;
	}
	let injective = new Set(scores).size === new Set(raw).size;
	if (injective)
		outer: for (let i = 0; i < n; i++)
			for (let j = i + 1; j < n; j++)
				if ((scores[i] === scores[j]) !== (raw[i] === raw[j])) {
					injective = false;
					break outer;
				}
	let mean = 0, min = Infinity, max = -Infinity, rawMin = Infinity, rawMax = -Infinity, zeros = 0;
	for (let i = 0; i < n; i++) {
		mean += scores[i];
		if (scores[i] < min) min = scores[i];
		if (scores[i] > max) max = scores[i];
		if (raw[i] < rawMin) rawMin = raw[i];
		if (raw[i] > rawMax) rawMax = raw[i];
		if (scores[i] === 0) zeros++;
	}
	mean /= n;
	return {
		n,
		byScore,
		distinct: new Set(scores).size,
		distinctRaw: new Set(raw).size,
		distinctShown: new Set(scores.map(Math.round)).size,
		zeros,
		mean,
		mono,
		injective,
		min, max, rawMin, rawMax,
		nan: scores.some(Number.isNaN) || raw.some(Number.isNaN)
	};
}

let failures = 0;
function check(ok, label, detail = '') {
	console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
	if (!ok) failures++;
}

/** Invariants that must hold for ANY n >= 2 and ANY set of comparisons. */
function checkInvariants(app, { maxZeros = 1 } = {}) {
	const m = metrics(app);
	check(!m.nan, 'no NaN in scores/_rawScores');
	check(m.mono, 'monotone: order by scores == order by _rawScores');
	check(m.injective, `injective: ${m.distinct} distinct scores == ${m.distinctRaw} distinct strengths`);
	check(Math.abs(m.mean - 1e3) < 1e-6, `mean stays 1000 (got ${m.mean.toFixed(9)})`);
	check(m.min >= m.rawMin - 1e-9 && m.max <= m.rawMax + 1e-9,
		`scale never widened (score ${m.min.toFixed(3)}..${m.max.toFixed(3)} within raw ${m.rawMin.toFixed(3)}..${m.rawMax.toFixed(3)})`);
	check(m.zeros <= maxZeros, `at most ${maxZeros} item(s) at score 0 (got ${m.zeros})`);
	return m;
}

/* ================================================================== */
async function main() {
	console.log('PreferenceRank score-calculation verification (jsdom, seeded)\n');
	let s1;

	/* ---- Scenario 1: 52 items, quick rank — the reported defect ------ */
	console.log('=== S1: 52 items, quick rank, no ties (seed 52) ===');
	{
		const booted = boot(52);
		const { rng } = booted;
		const strength = itemList(52).map((_, i) => Math.pow(1.34, i)); // ~2600-Elo-wide field
		const decide = (a, b) => rng() < strength[a] / (strength[a] + strength[b]) ? 1 : 0;
		const app = runSession(booted, { items: itemList(52), quick: true, ties: false, decide });
		const m = metrics(app);
		console.log('  +-------------------------+----------------+');
		console.log(`  | distinct scores         : ${String(`${m.distinct} / ${m.n}`).padEnd(15)}|`);
		console.log(`  | distinct shown (rounded): ${String(`${m.distinctShown} / ${m.n}`).padEnd(15)}|`);
		console.log(`  | items showing 0         : ${String(m.zeros).padEnd(15)}|`);
		console.log(`  | mean score              : ${m.mean.toFixed(3).padEnd(15)}|`);
		console.log(`  | monotone in raw         : ${String(m.mono).padEnd(15)}|`);
		console.log('  +-------------------------+----------------+');
		const raw = app._rawScores;
		console.log('  bottom 10 by displayed rank (rank / score / raw Elo / item):');
		for (let k = Math.max(0, m.n - 10); k < m.n; k++) {
			const x = m.byScore[k];
			console.log(`    ${String(k + 1).padStart(3)}   ${String(Math.round(app.scores[x])).padStart(6)}   ${raw[x].toFixed(1).padStart(8)}   ${app.items[x]}`);
		}
		check(m.distinct === m.n && m.distinctShown === m.n, `ACCEPT: all ${m.n} scores distinct (float and shown)`);
		checkInvariants(app);
		s1 = { booted, app, m };
	}

	/* ---- Scenario 2: minimal sizes (n = 2, n = 3) --------------------- */
	console.log('\n=== S2: minimal sessions (n=2 quick, n=3 full) ===');
	{
		const b2 = boot(2);
		const r2 = b2.rng;
		const app2 = runSession(b2, { items: itemList(2), quick: true, ties: false, decide: () => r2() < 0.5 ? 1 : 0 });
		checkInvariants(app2);
		const b3 = boot(3);
		const r3 = b3.rng;
		const str3 = [3, 1, 2];
		const app3 = runSession(b3, { items: itemList(3), quick: false, ties: false, decide: (a, b) => r3() < str3[a] / (str3[a] + str3[b]) ? 1 : 0 });
		checkInvariants(app3);
	}

	/* ---- Scenario 3: ties enabled ------------------------------------- */
	console.log('\n=== S3: 40 items, quick rank, #allowTies on (seed 7) ===');
	{
		const booted = boot(7);
		const { rng } = booted;
		const strength = itemList(40).map((_, i) => Math.pow(1.28, i));
		const decide = (a, b) => rng() < 0.2 ? 0.5 : (rng() < strength[a] / (strength[a] + strength[b]) ? 1 : 0);
		const app = runSession(booted, { items: itemList(40), quick: true, ties: true, decide });
		const ties = app.matches.filter(mt => mt.result === 0.5).length;
		check(ties > 0, `ties actually occurred (${ties} tied comparisons)`);
		const m = checkInvariants(app);
		// twin scores are legitimate ONLY when the MLE strengths themselves are twins
		let twinMismatch = 0;
		for (let i = 0; i < m.n; i++)
			for (let j = i + 1; j < m.n; j++)
				if (app.scores[i] === app.scores[j] && app._rawScores[i] !== app._rawScores[j]) twinMismatch++;
		check(twinMismatch === 0, `equal scores only where _rawScores equal (${twinMismatch} mismatches)`);
	}

	/* ---- Scenario 4: all-ties session --------------------------------- */
	console.log('\n=== S4: 10 items, quick rank, every comparison tied (seed 11) ===');
	{
		const booted = boot(11);
		const app = runSession(booted, { items: itemList(10), quick: true, ties: true, decide: () => 0.5 });
		check(app.matches.length > 0 && app.matches.every(mt => mt.result === 0.5),
			`session is all ties (${app.matches.length} comparisons)`);
		const allThousand = app.scores.every(v => Math.abs(v - 1e3) < 1e-4);
		check(allThousand, 'every score is 1000 (equal strengths)');
		check(app.scores.every(v => v !== 0), 'nobody shows score 0');
		checkInvariants(app);
	}

	/* ---- Scenario 5: full rank with circular/inconsistent choices ----- */
	console.log('\n=== S5: 12 items, FULL rank (#quickRank off), circular picks (seed 99) ===');
	{
		const booted = boot(99);
		const { rng } = booted;
		const n = 12;
		// a beats its next n/2 successors on the circle, plus 15% random upsets:
		// deliberately builds 3-cycles (e.g. 0 > 5 > 7 > 0), so the MLE has to
		// resolve a genuinely inconsistent comparison graph.
		const decide = (a, b) => {
			const d = (b - a + n) % n;
			let aWins = d >= 1 && d <= n >> 1;
			if (rng() < 0.15) aWins = !aWins;
			return aWins ? 1 : 0;
		};
		const app = runSession(booted, { items: itemList(n), quick: false, ties: false, decide });
		check(app.matches.length === n * (n - 1) / 2, `full rank ran all ${n * (n - 1) / 2} pairs`);
		checkInvariants(app);
	}

	/* ---- Scenario 6: UI surfaces — grades, clipboard, session restore - */
	console.log('\n=== S6: #showGrade column, copy-to-clipboard, localStorage restore ===');
	{
		const { booted, app, m } = s1;
		const { window, clipboard } = booted;
		const { document } = window;

		// grade column
		const gradeBox = document.getElementById('showGrade');
		gradeBox.checked = true;
		gradeBox.dispatchEvent(new window.Event('change'));
		check(app.showGrade === true, '#showGrade toggled on');
		const rows = [...document.querySelectorAll('.lb-row')];
		check(rows.length === m.n, `${rows.length} leaderboard rows rendered`);
		let gradeOK = rows.length > 0;
		for (const row of rows) {
			const cell = row.querySelector('.lb-col-grade');
			const score = Number(row.querySelector('.lb-col-score').firstChild.textContent);
			if (!cell || cell.textContent !== app.getGrade(score)) gradeOK = false;
		}
		check(gradeOK, 'grade column present and matches getGrade(rounded score)');

		// copy-to-clipboard
		app.copyResults();
		await new Promise(r => setTimeout(r, 0));
		check(typeof clipboard.text === 'string' && clipboard.text.includes('\n'), 'clipboard received results');
		const lines = clipboard.text.trim().split('\n');
		const headers = lines[0].split('\t');
		check(lines.length === m.n + 1, `${lines.length - 1} data rows copied`);
		const colScore = headers.findIndex(h => h === app.string('score'));
		const colRank = headers.findIndex(h => h === app.string('rank'));
		let copyOK = true, prev = Infinity;
		const seenRanks = new Set();
		for (const line of lines.slice(1)) {
			const cols = line.split('\t');
			const sc = Number(cols[colScore]);
			if (!(sc <= prev)) copyOK = false;
			prev = sc;
			seenRanks.add(Number(cols[colRank]));
		}
		check(copyOK, 'clipboard scores non-increasing down the table');
		check(seenRanks.size === m.n, `clipboard ranks are all distinct (1..${m.n})`);

		// finished-session restore from localStorage['preferenceRankData']
		const saved = window.localStorage.getItem('preferenceRankData');
		check(!!saved, 'session persisted to localStorage');
		const restored = boot(1234, saved);
		const app2 = restored.window.app;
		check(!app2.pair && app2.matches.length === app.matches.length, 'finished session restores straight into results');
		const sameScores = app2.scores.length === app.scores.length && app2.scores.every((v, i) => v === app.scores[i]);
		const sameRaw = app2._rawScores.length === app._rawScores.length && app2._rawScores.every((v, i) => v === app._rawScores[i]);
		check(sameScores, 'restored scores identical');
		check(sameRaw, 'restored _rawScores identical');
		checkInvariants(app2);
	}

	/* ---- Scenario 7: mid-session resume from localStorage -------------- */
	console.log('\n=== S7: resume an interrupted session from localStorage ===');
	{
		const booted = boot(4242);
		const { rng, window } = booted;
		const strength = itemList(52).map((_, i) => Math.pow(1.34, i));
		const decide = (a, b) => rng() < strength[a] / (strength[a] + strength[b]) ? 1 : 0;
		const app = runSession(booted, { items: itemList(52), quick: true, ties: false, decide, pauseAfter: 120 });
		check(!!app.pair, 'interrupted mid-session as planned');
		app.save();
		const saved = window.localStorage.getItem('preferenceRankData');
		const resumed = boot(5555, saved); // fresh window; constructor.load() finds the battle
		const app2 = resumed.window.app;
		check(!!app2.pending, 'resume prompt armed from saved session');
		app2.restoreSession();
		check(!!app2.pair && app2.matches.length === app.matches.length, 'battle state restored mid-session');
		const r2 = resumed.rng;
		const decide2 = (a, b) => r2() < strength[a] / (strength[a] + strength[b]) ? 1 : 0;
		const done = driveSteps(app2, decide2, 1e6);
		check(!app2.pair, `resumed session ran to completion (+${done} comparisons)`);
		checkInvariants(app2);
	}

	// Each pair is asked once, and the asymmetric cycle does not flatten all scores.
	for (const n of [4,5]) {
		const app = runSession(boot(18), {items:itemList(n), quick:false, ties:false,
			decide:(a,b) => +(a !== 0 || b !== 3)});
		check(new Set(app.matches.map(m => `${m.a}:${m.b}`)).size === n*(n-1)/2 && app.matches.length === n*(n-1)/2, `round robin covers all pairs (n=${n})`);
		check(app.scores[0] > app.scores[3], 'direct wins decide an asymmetric cycle');
	}
	for (const quick of [true,false]) {
		const {window} = boot(22), doc = window.document, el = id => doc.getElementById(id);
		const app = runSession({window}, {items:itemList(8), quick, ties:true, decide:()=>1, pauseAfter:4});
		app.cancel(); app.cancel();
		check(!el('resume').classList.contains('hidden'), 'matching session can resume');
		el('quickRank').click();
		check(el('resume').classList.contains('hidden'), 'different mode hides resume');
		el('quickRank').click(); el('items').value += '\nNew'; el('items').dispatchEvent(new window.Event('input'));
		check(el('resume').classList.contains('hidden'), 'different items hide resume');
		el('items').value = app.items.join('\n'); el('items').dispatchEvent(new window.Event('input')); el('resume').click();
		el('settingsDialog').setAttribute('open','');
		doc.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
		check(app.step === 4, 'settings suppresses battle shortcut'); el('settingsDialog').removeAttribute('open');
		const before = JSON.stringify(app.pair); el('tie').click(); el('left').click(); app.save();
		const after = JSON.stringify(app.pair);
		const resumed = boot(23,window.localStorage.getItem('preferenceRankData')).window;
		resumed.document.getElementById('sessionContinue').click(); const other = resumed.app;
		check(other.step === 5 && other.matches[4].result === .5 && !other.busy && JSON.stringify(other.pair) === after, 'reload during debounce keeps exactly one vote');
		resumed.document.getElementById('undo').click();
		check(JSON.stringify(other.pair) === before && other.step === 4, 'undo after reload restores prior pair');
		resumed.document.getElementById('tie').click();
		check(JSON.stringify(other.pair) === after, 'replaying undone tie gives same next pair');
	}
	{
		const booted = boot(44), {window} = booted;
		let warned = false;
		window.confirm = () => { warned = true; return false; };
		const input = window.document.getElementById('items');
		input.value = itemList(1000).join('\n');
		window.app.start();
		check(warned && !window.app.provider, 'declining large list starts no session');
		const app = runSession(booted, {items:itemList(65), quick:true, ties:false, decide:()=>1});
		check(!app.stats && app.scores.length === 65, 'large result available without uncertainty calculation');
		const button = [...window.document.querySelectorAll('#results button')].find(b => b.textContent === app.string('calcStats'));
		button.click();
		check(app.stats?.cis.length === 65, 'explicit request computes uncertainty estimates');
	}

	for (const denied of [true,false]) {
		const {window} = boot(12,null,w => {
			if (denied) Object.defineProperty(w,'localStorage',{get(){throw new Error('denied');}});
			else w.Storage.prototype.setItem = () => {throw new Error('quota');};
		});
		const app = runSession({window},{items:itemList(3), quick:false,ties:false,decide:()=>1});
		check(!app.pair && window.document.getElementById('saveStatus').textContent === app.string('unsaved'), 'storage failure: finish in memory with warning');
	}
	{
		const {window, clipboard} = s1.booted;
		for (const value of [undefined,{writeText:async()=>{throw new Error('denied');}}]) {
			Object.defineProperty(window.navigator,'clipboard',{configurable:true,value});
			await window.app.copyResults();
			check(window.document.querySelector('#manualCopy textarea')?.value === clipboard.text, 'manual copy contains identical TSV');
		}
	}

	console.log(failures ? `\nRESULT: ${failures} check(s) FAILED` : '\nRESULT: all checks passed');
	process.exit(failures ? 1 : 0);
}

main().catch(err => {
	console.error(err);
	process.exit(2);
});
