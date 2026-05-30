import re
import collections

class BenchTool:
    def __init__(self, filepath='research/sort_analysis.js'):
        self.filepath = filepath
        self.header = "const Math_log10 = Math.log(10);\nconst SCALE = 400 / Math_log10;"
        self.utils = {}
        self.providers = {}
        self.algos = []
        self.simulation_logic = ""
        self.main_block = ""

    def add_provider(self, name, code):
        parent = None
        match = re.search(r'class \w+(?: extends (\w+))?', code)
        if match and match.group(1): parent = match.group(1)
        self.providers[name] = {'text': code.strip(), 'parent': parent}

    def set_utils(self, run_bt, kendall_tau):
        self.utils['runBT'] = run_bt.strip()
        self.utils['kendallTau'] = kendall_tau.strip()

    def set_simulation(self, code):
        self.simulation_logic = code.strip()

    def add_algo(self, name, class_name):
        self.algos.append((name, class_name))

    def build(self):
        parts = [self.header, self.utils.get('runBT', ''), self.utils.get('kendallTau', ''), self.simulation_logic]
        adj = collections.defaultdict(list)
        in_degree = collections.defaultdict(int)
        names = set(self.providers.keys())
        for name, info in self.providers.items():
            p = info['parent']
            if p and p in names:
                adj[p].append(name)
                in_degree[name] += 1
            else: in_degree[name] = 0
        queue = collections.deque(sorted([n for n in names if in_degree[n] == 0]))
        sorted_names = []
        while queue:
            u = queue.popleft()
            sorted_names.append(u)
            for v in sorted(adj[u]):
                in_degree[v] -= 1
                if in_degree[v] == 0: queue.append(v)
        for name in sorted_names: parts.append(self.providers[name]['text'])
        algos_str = "const algos = [\n" + ",\n".join([f"    {{ name: '{n}', class: {c} }}" for n, c in self.algos]) + "\n];"
        parts.append(algos_str)
        parts.append(self.main_block)
        return "\n\n".join([p for p in parts if p])

    def save(self):
        with open(self.filepath, 'w') as f:
            f.write(self.build())
            f.write("\n")

bt = BenchTool()
bt.set_utils("""
function runBT(n, wins, adj, threshold = 1e-7, maxIter = 1000) {
    const PRIOR = 0.5, W = new Float64Array(n); for (let i = 0; i < n; i++) W[i] = wins[i] + PRIOR;
    const s = new Float64Array(n).fill(1.0), currentLogs = new Float64Array(n), prevLogS = new Float64Array(n), RENORM = 16;
    for (let iter = 0; iter < maxIter; iter++) {
        let maxDelta = 0; for (let i = 0; i < n; i++) {
            const si = s[i]; let denom = 1 / (si + 1) + 1e-12; const row = adj[i];
            for (let k = 0, len = row.length; k < len; k += 2) denom += row[k + 1] / (si + s[row[k]]);
            s[i] = W[i] / denom;
        }
        if ((iter & (RENORM - 1)) === RENORM - 1 || iter === maxIter - 1) {
            let lsum = 0; for (let i = 0; i < n; i++) { const l = Math.log(s[i]); currentLogs[i] = l; lsum += l; }
            const sc = lsum / n, scale = Math.exp(sc);
            for (let i = 0; i < n; i++) { s[i] /= scale; const curLog = currentLogs[i] - sc; const delta = Math.abs(curLog - prevLogS[i]); if (delta > maxDelta) maxDelta = delta; prevLogS[i] = curLog; }
            if (iter > 0 && maxDelta < threshold) break;
        }
    }
    const rawScores = new Float64Array(n); for (let i = 0; i < n; i++) rawScores[i] = 1000 + Math.log(s[i]) * SCALE; return rawScores;
}""", """
function kendallTau(arr1, arr2) {
    let n = arr1.length, concordant = 0, discordant = 0;
    for (let i = 0; i < n; i++) {
        const a1 = arr1[i], a2 = arr2[i];
        for (let j = i + 1; j < n; j++) {
            if ((a1 < arr1[j]) === (a2 < arr2[j])) concordant++; else discordant++;
        }
    }
    return (concordant - discordant) / (n * (n - 1) / 2);
}""")
bt.set_simulation("""
function simulate(n, ProviderClass, trials = 250) {
    let totalComps = 0, totalTau = 0, maxUniqueBattles = n * (n - 1) / 2, hasDuplicates = false;
    const trueStrengths = new Float64Array(n);
    const wins = new Float64Array(n);
    const adjMaps = Array.from({ length: n }, () => new Map());
    for (let t = 0; t < trials; t++) {
        for (let i = 0; i < n; i++) trueStrengths[i] = Math.random() * 2000;
        const provider = new ProviderClass(n);
        wins.fill(0); for (let i = 0; i < n; i++) adjMaps[i].clear();
        const matchesMap = new Map();
        let pair = provider.next(), uniqueBattles = 0, totalIterations = 0;
        while (pair && totalIterations < 1000000) {
            totalIterations++;
            const [a, b] = pair;
            const pairKey = a < b ? (a << 16) | b : (b << 16) | a;
            const matchResult = matchesMap.get(pairKey);
            let res;
            if (matchResult !== undefined) {
                hasDuplicates = true;
                res = matchResult.a === a ? matchResult.res : 1 - matchResult.res;
            } else {
                uniqueBattles++;
                res = trueStrengths[a] > trueStrengths[b] ? 1 : 0;
                matchesMap.set(pairKey, { a, res });
                wins[a] += res; wins[b] += 1 - res;
                adjMaps[a].set(b, (adjMaps[a].get(b) || 0) + 1);
                adjMaps[b].set(a, (adjMaps[b].get(a) || 0) + 1);
            }
            pair = provider.next(res); if (uniqueBattles >= maxUniqueBattles) break;
        }
        const adj = adjMaps.map(m => { const row = new Int32Array(m.size * 2); let k = 0; for (const [j, c] of m) { row[k++] = j; row[k++] = c; } return row; });
        totalComps += uniqueBattles; totalTau += kendallTau(trueStrengths, runBT(n, wins, adj));
    }
    return { avgComps: totalComps / trials, avgTau: totalTau / trials, hasDuplicates };
}""")

# EXTRACT ALL CLASSES FROM sort_analysis.js
with open('research/sort_analysis.js', 'r') as f:
    orig = f.read()
class_pattern = re.compile(r'^class (\w+)(?: extends (\w+))? \{', re.MULTILINE)
for match in class_pattern.finditer(orig):
    name = match.group(1)
    start = match.start()
    count = 0
    in_str = False
    quote = None
    for i in range(start, len(orig)):
        if orig[i] in ['"', "'", "`"] and (i == 0 or orig[i-1] != "\\"):
            if not in_str: in_str = True; quote = orig[i]
            elif orig[i] == quote: in_str = False
        if not in_str:
            if orig[i] == '{': count += 1
            elif orig[i] == '}':
                count -= 1
                if count == 0:
                    bt.add_provider(name, orig[start:i+1])
                    break

# APPLY FIXES
bt.add_provider('QuicksortHoareProvider', """
class QuicksortHoareProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') {
                if (this.stack.length === 0) { this.state = 'done'; return null; }
                [this.l, this.r] = this.stack.pop();
                if (this.l < this.r) {
                    this.pVal = this.items[this.l + Math.floor((this.r - this.l)/2)];
                    this.i = this.l - 1; this.j = this.r + 1;
                    this.state = 'i_loop'; this.sub = undefined;
                } else continue;
            }
            if (this.state === 'i_loop') {
                if (result !== undefined) {
                    if (result === 0) { this.i++; result = undefined; }
                    else { this.state = 'j_loop'; result = undefined; }
                }
                if (this.state === 'i_loop') {
                    this.i++;
                    if (this.i < this.n) return [this.items[this.i], this.pVal];
                    else { this.state = 'j_loop'; }
                }
            }
            if (this.state === 'j_loop') {
                if (result !== undefined) {
                    if (result === 1) { this.j--; result = undefined; }
                    else { this.state = 'swap'; result = undefined; }
                }
                if (this.state === 'j_loop') {
                    this.j--;
                    if (this.j >= 0) return [this.items[this.j], this.pVal];
                    else { this.state = 'swap'; }
                }
            }
            if (this.state === 'swap') {
                if (this.i >= this.j) {
                    this.stack.push([this.j + 1, this.r], [this.l, this.j]);
                    this.state = 'start';
                } else {
                    [this.items[this.i], this.items[this.j]] = [this.items[this.j], this.items[this.i]];
                    this.state = 'i_loop';
                }
                result = undefined;
                continue;
            }
        } return null;
    }
}""")

bt.add_provider('DualPivotQuicksortProvider', """
class DualPivotQuicksortProvider extends Provider {
    constructor(n) { super(n); this.stack = [[0, n - 1]]; this.state = 'start'; }
    next(result) {
        while (this.stack.length > 0 || this.state !== 'done') {
            if (this.state === 'start') {
                if (this.stack.length === 0) { this.state = 'done'; return null; }
                [this.l, this.r] = this.stack.pop();
                if (this.r - this.l < 1) continue;
                this.state = 'pivots';
            }
            if (this.state === 'pivots') {
                if (result !== undefined) {
                    if (result === 1) [this.items[this.l], this.items[this.r]] = [this.items[this.r], this.items[this.l]];
                    this.p1 = this.items[this.l]; this.p2 = this.items[this.r];
                    this.lt = this.l + 1; this.gt = this.r - 1; this.k = this.l + 1;
                    this.state = 'partition'; this.sub = undefined; result = undefined;
                } else return [this.items[this.l], this.items[this.r]];
            }
            if (this.state === 'partition') {
                if (this.k <= this.gt) {
                    if (this.sub === undefined) {
                        if (result !== undefined) {
                            if (result === 0) { [this.items[this.k], this.items[this.lt]] = [this.items[this.lt], this.items[this.k]]; this.lt++; this.k++; result = undefined; }
                            else { this.sub = 'p2'; result = undefined; }
                        } else return [this.items[this.k], this.p1];
                    }
                    if (this.sub === 'p2') {
                        if (result !== undefined) {
                            if (result === 1) { [this.items[this.k], this.items[this.gt]] = [this.items[this.gt], this.items[this.k]]; this.gt--; this.sub = undefined; }
                            else { this.k++; this.sub = undefined; }
                            result = undefined; continue;
                        } else return [this.items[this.k], this.p2];
                    }
                    continue;
                }
                this.lt--; this.gt++;
                [this.items[this.l], this.items[this.lt]] = [this.items[this.lt], this.items[this.l]];
                [this.items[this.r], this.items[this.gt]] = [this.items[this.gt], this.items[this.r]];
                this.stack.push([this.gt + 1, this.r], [this.lt + 1, this.gt - 1], [this.l, this.lt - 1]);
                this.state = 'start'; this.sub = undefined;
            }
        } return null;
    }
}""")

bt.add_provider('TimsortProvider', """
class TimsortProvider extends Provider {
    constructor(n) { super(n); this.minRun = n < 64 ? n : 32; this.runs = []; this.idx = 0; this.state = 'next_run'; }
    next(result) {
        while (true) {
            if (this.state === 'next_run') { if (this.idx < this.n) { this.runStart = this.idx; this.i = this.idx + 1; this.state = 'extend_run'; } else { this.state = 'merge_loop'; continue; } }
            if (this.state === 'extend_run') {
                if (this.i < this.n) {
                   if (result !== undefined) {
                       if (result === 0) { this.i++; result = undefined; }
                       else { this.runs.push(this.items.slice(this.runStart, this.i)); this.idx = this.i; this.state = 'next_run'; result = undefined; continue; }
                   } else return [this.items[this.i], this.items[this.i-1]];
                } else { this.runs.push(this.items.slice(this.runStart, this.i)); this.idx = this.i; this.state = 'merge_loop'; continue; }
            }
            if (this.state === 'merge_loop') {
                if (this.runs.length > 1) { this.A = this.runs.pop(); this.B = this.runs.pop(); this.ai = 0; this.bi = 0; this.res = []; this.state = 'merging'; }
                else { if (this.runs.length === 1) this.items = this.runs[0]; return null; }
            }
            if (this.state === 'merging') {
                if (result !== undefined) { if (result === 0) this.res.push(this.A[this.ai++]); else this.res.push(this.B[this.bi++]); result = undefined; }
                if (this.ai < this.A.length && this.bi < this.B.length) return [this.A[this.ai], this.B[this.bi]];
                while (this.ai < this.A.length) this.res.push(this.A[this.ai++]); while (this.bi < this.B.length) this.res.push(this.B[this.bi++]);
                this.runs.push(this.res); this.state = 'merge_loop';
            }
        }
    }
}""")

bt.main_block = """
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
if (isMainThread) {
    const args = process.argv.slice(2);
    const n_val = args[0] ? parseInt(args[0]) : 100;
    const trials_val = args[1] ? parseInt(args[1]) : 250;
    const numWorkers = require('os').cpus().length || 4;
    const itemsPerWorker = Math.ceil(algos.length / numWorkers);
    console.log(`Simulating N=${n_val}, trials=${trials_val} with ${numWorkers} workers\\nAlgorithm\\tAvg Battles\\tAvg Kendall Tau\\tDuplicates`);
    let completed = 0;
    for (let i = 0; i < numWorkers; i++) {
        const start = i * itemsPerWorker;
        const end = Math.min(start + itemsPerWorker, algos.length);
        if (start >= end) continue;
        const workerAlgos = algos.slice(start, end).map(a => ({ name: a.name, className: a.class.name }));
        const worker = new Worker(__filename, { workerData: { workerAlgos, n: n_val, trials: trials_val } });
        worker.on('message', (res) => {
            console.log(`${res.name}\\t${res.avgComps.toFixed(2)}\\t${res.avgTau.toFixed(4)}\\t${res.hasDuplicates ? "YES" : "NO"}`);
        });
        worker.on('exit', () => {
            completed++;
            if (completed === numWorkers) process.exit(0);
        });
    }
} else {
    const { workerAlgos, n, trials } = workerData;
    for (const algo of workerAlgos) {
        try {
            const Cls = eval(algo.className);
            const res = simulate(n, Cls, trials);
            parentPort.postMessage({ name: algo.name, ...res });
        } catch (e) {
            parentPort.postMessage({ name: algo.name, avgComps: 0, avgTau: 0, hasDuplicates: false, error: e.message });
        }
    }
}"""

algos = [
    ('Ford-Johnson', 'FJProvider'), ('Merge Sort', 'MergeSortProvider'),
    ('Bottom-up Merge Sort', 'BottomUpMergeSortProvider'), ('Natural Merge Sort', 'NaturalMergeSortProvider'),
    ('Ping-pong Merge Sort', 'PingPongMergeSortProvider'), ('3-way Merge Sort', 'MergeSort3WayProvider'),
    ('4-way Merge Sort', 'MergeSort4WayProvider'), ('In-place Merge Sort', 'InPlaceMergeSortProvider'),
    ('Timsort', 'TimsortProvider'), ('Powersort', 'PowersortProvider'),
    ('Parallel Merge Sort', 'ParallelMergeSortProvider'), ('Hayate-Shiki', 'HayateShikiProvider'),
    ('Shellsort', 'ShellSortProvider'), ('Quicksort (RTL)', 'QuicksortRTLProvider'),
    ('Quicksort (LTR)', 'QuicksortLTRProvider'), ('Quicksort (Random)', 'QuicksortRandomProvider'),
    ('Quicksort (Middle)', 'QuicksortMiddleProvider'), ('Quicksort (Mo3)', 'QuicksortMo3Provider'),
    ('Quicksort (Ninther)', 'QuicksortNintherProvider'), ('Quicksort (Hoare)', 'QuicksortHoareProvider'),
    ('3-Way Quicksort', 'Quicksort3WayProvider'), ('Dual-Pivot Quicksort', 'DualPivotQuicksortProvider'),
    ('Triple-Pivot Quicksort', 'TriplePivotQuicksortProvider'), ('Stable Quicksort', 'StableQuicksortProvider'),
    ('BlockQuicksort', 'BlockQuicksortProvider'), ('Parallel Quicksort', 'ParallelQuicksortProvider'),
    ('Bubble Sort', 'BubbleSortProvider'), ('Selection Sort', 'SelectionSortProvider'),
    ('Insertion Sort', 'InsertionSortProvider'), ('Binary Insertion', 'BinaryInsertionSortProvider'),
    ('Gnome Sort', 'GnomeSortProvider'), ('Stooge Sort', 'StoogeSortProvider'),
    ('Bogosort', 'BogosortProvider'), ('Full Rank', 'FullRankProvider'),
    ('Cycle Sort', 'CycleSortProvider'), ('Bitonic Sort', 'BitonicSortProvider'),
    ('Heap Sort', 'HeapSortProvider'), ('Comb Sort', 'CombSortProvider'),
    ('Tournament Sort', 'TournamentSortProvider'), ('Odd-Even Sort', 'OddEvenSortProvider'),
    ('Slowsort', 'SlowsortProvider'), ('Pancake Sort', 'PancakeSortProvider'),
    ('Cocktail Shaker', 'CocktailShakerProvider'), ('Tree Sort', 'TreeSortProvider'),
    ('BogoBogoSort', 'BogoBogoSortProvider'), ('Stalin Sort', 'StalinSortProvider'),
    ('Thanos Sort', 'ThanosSortProvider'), ('Miracle Sort', 'MiracleSortProvider'),
    ('Intelligent Design', 'IntelligentDesignSortProvider'), ('Quantum Bogo', 'QuantumBogoSortProvider'),
    ('Intro Sort', 'IntroSortProvider'), ('Strand Sort', 'StrandSortProvider'),
    ('Patience Sort', 'PatienceSortProvider'), ('Smooth Sort', 'SmoothSortProvider'),
    ('Circle Sort', 'CircleSortProvider'), ('Double Selection', 'DoubleSelectionSortProvider'),
    ('Cocktail Selection', 'CocktailSelectionSortProvider'), ('Socialist Sort', 'SocialistSortProvider'),
    ('Genghis Khan Sort', 'GenghisKhanSortProvider'), ('Hater Sort', 'HaterSortProvider'),
    ('Exit Sort', 'ExitSortProvider'), ('Random Sort', 'RandomSortProvider'),
    ('Silly Sort', 'SillySortProvider'), ('Sleep Sort', 'SleepSortProvider')
]
bt.algos = []
for n, c in algos:
    if c in bt.providers: bt.add_algo(n, c)
bt.save()
