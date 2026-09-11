# Correctness Audit of the State-Machine Sorting Providers

**Date:** 2026-09-03 (batch-2 addendum 2026-09-11 below)
**Scope:** all 85 sorting providers registered in [`research/sort_analysis.js`](sort_analysis.js) at the time of the original audit (the interactive `next()`/`next(result)` state machines used by the PreferenceRank benchmarks). The [batch-2 addendum](#batch-2-addendum-2026-09-11-33-newly-registered-providers) extends coverage to all 118 providers.

**Method.** Every provider was audited two ways:

1. **Web verification** — each implementation was compared against the canonical published definition of its algorithm (papers, reference implementations, and standard references; links inline below).
2. **Automated differential testing** — the new harness [`research/audit_correctness.js`](audit_correctness.js) drives every provider with a deterministic comparison oracle (`result = 1` iff the first item's strength is greater — the exact convention of `simulate()` in `sort_analysis.js`), over N ∈ {2…128} with up to 40 seeds per N (~490 runs per provider; raw output in [`audit_results.txt`](audit_results.txt)). It verifies termination, valid pair requests, and sortedness of the final `items` array, and records the sort direction and duplicate-pair behavior.

> **Remediation status (2026-09-03): all recommendations implemented and re-verified — see the [Remediation log](#remediation-log-implemented-2026-09-03).** During remediation the harness was hardened (non-monotonic strengths) and unmasked one additional genuine bug the original run had missed: **Hayate-Shiki's merge comparator was inverted** (previously masked because the original harness's test inputs were pre-sorted — Hayate-Shiki's best case). It is fixed; the original "✅ faithful" verdict for Hayate-Shiki below is superseded. Final state: **85/85 providers verified correct** (Slowsort times out only at N ≥ 127, which is inherent; the benchmark caps it identically).

---

## Verdict legend

| Verdict | Meaning |
|---|---|
| ✅ Faithful | Matches the canonical published algorithm (structure *and* key constants); empirically sorts |
| ✅ Faithful (variant) | Correct algorithm with documented simplifications/tuning deviations; empirically sorts |
| ⚠️ Adapted | Sorting *works*, but the implementation is an adaptation rather than the named algorithm |
| ❌ Unfaithful | Sorts, but does not implement the algorithm it is named after |
| 🔴 Broken | Does **not** produce a sorted array (real implementation bug) |
| 🃏 Joke | Intentionally non-sorting (or lossy) gag algorithm — assessed against the joke definition |

**Orientation convention.** In this framework `result = 1` means the *first* item is stronger, and the app displays best-first, so the de-facto house convention is **strongest-first (DESC)**. Providers are flagged **ASC** when they sort weakest-first. Both directions "sort", but a consumer reading `provider.items` as a ranking would get ASC providers *reversed* — see Finding 2.

## Summary counts (85 providers)

| Result | Count | Providers |
|---|---|---|
| Sorts, strongest-first (house convention) | 20 | Bubble, Recursive Bubble, Selection, Recursive Selection, Recursive Cocktail, Recursive Double Selection, Recursive Comb, Recursive Odd-Even, Bottom-up Merge, Ping-pong Merge, Budgeted Merge*, Comb, Odd-Even, Cocktail Shaker, Stooge, Circle, Double Selection, Cocktail Selection, Bogosort, BogoBogoSort |
| Sorts, weakest-first (inverted vs. house convention) | 49 | Insertion family, all merge sorts except bottom-up/ping-pong, all quicksorts, Timsort, Powersort, Hayate-Shiki, Shellsort, Ford-Johnson, Bitonic, Heap, Pancake, Tree, Strand, Patience, Bucket, Radix*, Smooth*, Fung's, Cycle, … |
| 🔴 Broken (bug) | 2 | **Intro Sort** (n ≥ 31), **Tournament Sort** (drops last element) |
| Correct but inherently times out | 1 | Slowsort (n ≥ 127 exceeds the 5M-step cap; expected) |
| 🃏 Lossy but sorted | 3 | Stalin (ASC), Thanos, Genghis Khan |
| 🃏 Non-sorting by design | 9 | Miracle, Intelligent Design, Quantum Bogo, Socialist, Hater, Exit, Random, Silly, Sleep |
| Pair enumerator (no array output) | 1 | Full Rank |

\* see Unfaithful/adapted findings below.

---

## Key findings

### 🔴 Finding 1 — Intro Sort does not sort for n ≥ 31 (real bug, invisible to the benchmark)
`IntroSortProvider` mixes comparison directions: its Lomuto partition moves *stronger* items to the **front** (`if (result === 1) { p_i++; swap }` → DESC-oriented), while its insertion-sort branch (`if (result === 0) shift…`) and heapsort fallback (max extracted to the **end**) are ASC-oriented. For `n ≤ 17` the whole array is handled by insertion sort and sorts (ASC); for `n ≥ 31` partitions execute and the mixed orientations corrupt the array. **All 89 harness runs with n ≥ 31 failed**; e.g. n=31 reverse-ordered input yields `[30,29,28,27,26, 4,5,…,25, 3,2,1,0]` — neither order.

The depth-limit itself is right — Musser's introsort uses exactly `2·⌊log₂(n)⌋` with heapsort fallback and an insertion-sort threshold ([OpenGenus introsort pseudocode](https://iq.opengenus.org/intro-sort/amp/), [Musser's choice of 2⌊log₂n⌋](https://tvd.win.tue.nl/posts/sorting-3-introsort/)) — the bug is purely the inconsistent win/lose interpretation between the three sub-algorithms.

**Why ANALYSIS.md still reports Kendall τ = 1.0000 for Intro Sort:** `simulate()` never reads `provider.items`; it reconstructs the order from the transitive closure of the comparison results. The comparisons themselves are answered by the oracle, so the *pair coverage* metric stays perfect even though the provider's own array is garbage. Same for Tournament Sort below. The published table is therefore not *wrong*, but "it sorts correctly" cannot be inferred from τ alone for these two providers.

### 🔴 Finding 2 — Tournament Sort drops the final (weakest) element
In `TournamentSortProvider`, the `'rebuild'` state executes `this.sortedCount++; if (this.sortedCount === this.n) break;` **before** pushing the last winner, so the run terminates one element early: for n=5 the output is `[4,3,2,1]` (length 4). All harness runs failed the length check. The winner-tree mechanics themselves (build max-tree, replace winner leaf, replay path) match the standard tournament-selection sort; only the loop-exit bookkeeping is off by one. Note the inline copies inside Patience/Binary-Patience do *not* share this bug — they push before checking, and sort correctly.

### ⚠️ Finding 3 — Orientation inconsistency across the suite (49 ASC vs 20 DESC)
Providers interpret "the first item won" in opposite ways, so half the suite ends up weakest-first. Even within one family: `BottomUpMergeSortProvider`/`PingPongMergeSortProvider` take the **winner** first (DESC), while `MergeSortProvider`, natural/k-way/binary/in-place/rotation merge sorts take the **loser** first (ASC). Benchmarks are unaffected (see Finding 1), but any future code that consumes `provider.items` as a best-first ranking will be silently reversed for the ASC camp. The production path (Ford-Johnson in `PreferenceRank.html`) is ASC, and the HTML reverses for display, so this is a latent hazard rather than a live defect.

### ❌ Finding 4 — "Radix Sort" is not radix sort
Canonical radix sort is **non-comparative**: it bucket-stabilizes by successive digits (LSD) or partitions recursively on digit prefixes (MSD), never comparing two keys ([radix sort definition](https://www.altcademy.com/blog/radix-sort/), [non-comparison rationale](https://cusack.hope.edu/Algorithms/Content/Algorithms/Space-Time%20Tradeoff/Radix%20Sort.html?path=Algorithms/Counting+Sort)). The provider instead performs `⌈log₂(n)⌉` passes of *random-pivot two-way partitioning by comparison* and then — the only reason it sorts at all — runs a full insertion sort over the whole array at the end. It is a randomized binary quicksort + safety net, not a radix sort (bit-inspecting MSD radix a.k.a. radix-exchange exists as a comparison-style variant, but it partitions on key *bits*, not random pivots — cf. [Rosetta Code radix sort](https://rosettacode.org/wiki/Sorting_algorithms/Radix_sort)).

### ❌ Finding 5 — "Smooth Sort" is plain heapsort
`SmoothSortProvider` simply proxies `HeapSortProvider`. Dijkstra's smoothsort is an adaptive heapsort variant over a forest of Leonardo-number-sized heaps with O(n) best case on presorted input ([smoothsort overview](https://grokipedia.com/page/Smoothsort), [Leonardo heaps](https://sortingalgos.miraheze.org/wiki/Smoothsort)). The proxy sorts (and the benchmark honestly measures heapsort's comparison count), but the row labeled "Smooth Sort" in ANALYSIS.md is heapsort.

### 🃏 Finding 6 — Joke-sort fidelity
Assessed against the published gag definitions:
- **Stalin Sort** — "purge any unsorted elements": keeps an element only if it beats the previous kept element → lossy sorted (ASC). ✅ ([definition](https://github.com/harrycraft44/storting_algo))
- **Thanos Sort** — delete half until sorted: ✅ (repeatedly halves; result trivially sorted).
- **Genghis Khan Sort** — canonical form is "delete all elements except the first, repopulate with successors of the first" ([source](https://github.com/harrycraft44/storting_algo)); the provider deletes all but the first but never repopulates — faithful-in-spirit, single-element output.
- **Miracle Sort** — canonical: keep re-checking until a miracle sorts the array ([description](https://vinodhgowda.medium.com/the-worst-ways-to-sort-a-comedic-crash-course-in-inefficiency-010d22e139f8)); the provider does **one** scan then gives up (returns null even when unsorted) — a non-blocking deviation; output is unsorted by design.
- **Sleep Sort** — emit elements after delays proportional to value ([source](https://github.com/harrycraft44/storting_algo)); not expressible with comparisons, so the provider emits n self-pairs and changes nothing. Placeholder, as expected.
- **Quantum Bogo** — shuffle, check, "destroy the universe" if unsorted ([jargon-file variant](http://www.catb.org/jargon/html/B/Bogo-sort.html), [Wikipedia description](https://wiki2.org/en/Bogosort)): the provider checks and quits at the first inversion (the "destroyed universe" branch); expected output unsorted. ✅-ish adaptation.
- **Intelligent Design / Socialist / Exit / Hater / Random / Silly** — meme algorithms with no canonical sorting definition found; all intentionally terminate without sorting ("the array is obviously sorted by design" humor, cf. [the sorting-algorithm iceberg](https://www.reddit.com/r/ProgrammerHumor/comments/mzq8kk/sorting_algorithm_iceberg/)). **Silly Sort** deserves a flag: its stack-based recursion requests up to 10,000 pairs but *ignores every result* (no swap logic), so it is a comparison loop, not the known recursive "sillysort"; it can never sort.

### ⚠️ Finding 7 — Duplicate-comparison accounting
Duplicate pairs are inherent to several algorithms (Fung's compares every position pair twice, bitonic/heap/tournament/treesort re-compare after swaps, Hayate-Shiki and radix exchange revisit pairs). ANALYSIS.md's per-algorithm `Duplicates YES/NO` flags match the harness counts. Two measurement nuances worth knowing: `simulate()` answers repeated/self pairs from the reachability matrix (so Fung's `i == j` self-comparisons don't inflate "unique battles"), and it stops a provider once `uniqueBattles ≥ N(N−1)/2`.

---

## Per-family fidelity vs. canonical definitions

### Verified faithful (✅) — implementation matches the published algorithm
| Provider | Canonical source & verified details |
|---|---|
| **I Can't Believe It Can Sort** | Fung, [*Is this the simplest (and most surprising) sorting algorithm ever?*](https://ar5iv.labs.arxiv.org/html/2110.01111) (arXiv:2110.01111). Algorithm 1 is `for i = 1 to n: for j = 1 to n: if A[i] < A[j] swap` — both loops over the *full* range. The provider reproduces exactly this (0-based, swap on `result === 0` ⇔ `A[i] < A[j]`), including the N² positional requests (with N self-comparisons). ASC, Θ(n²), duplicate requests — all as the paper states. The in-code comment and ANALYSIS.md's description are accurate. |
| **Ford-Johnson (Quick)** | Merge-insertion sort: pair off, recursively sort winners, insert losers via binary search bounded by their winner, in Jacobsthal-derived group order 1; 3, 2; 5, 4; 11, 10…6; 21, 20… ([Jacobsthal insertion order](https://github.com/decidedlyso/merge-insertion-sort)). The `QuickPairProvider` state machine implements precisely this (groups via `jA=1, jB=3, jB+2·jA → 3,5,11,21…`, descending k within each group, `hi = posMap[winner_k]`). Worst case per Knuth is F(n) = Σ⌈log₂(3k/4)⌉, giving F(100) = **534** (info-theoretic lower bound ⌈log₂ 100!⌉ = 525); the benchmark's 526.64 average unique battles sits exactly in the plausible band. |
| **Stooge Sort** | Matches the standard pseudocode exactly: compare/swap ends, then `t=⌊len/3⌋`, sort `l..h−t`, `l+t..h`, `l..h−t` ([GeeksforGeeks](https://www.geeksforgeeks.org/dsa/stooge-sort/)). |
| **Slowsort** | "Multiply and surrender": sort left half, right half, swap max to end, re-sort `i..j−1` — matches ([related-algorithms section](https://wiki2.org/en/Bogosort) and standard references). Correct for all tested n; expectedly exceeds 5M steps at n ≥ 127 (the repo's own benchmark caps at 1M iterations, hence its truncated τ). |
| **Timsort** (variant) | `calcMinRun` is *character-for-character* the canonical `r=0; while n≥64: r|=n&1, n>>=1; minrun=n+r` ([minrun derivation](https://grokipedia.com/page/Timsort), [reference walkthrough](https://vladris.com/blog/2021/12/30/timsort.html)); descending-run detection + reversal + binary-insertion extension to minrun ✓; merge-collapse implements the standard invariants (merge `n−3` vs `n−2` when `len[n−3] ≤ len[n−2]+len[n−1]`, choosing the smaller neighbor, else `n−2` vs `n−1`) ✓. **Simplification:** no galloping mode (plain merges); merges copy to temp arrays. |
| **Powersort** (variant) | Merge policy matches Munro & Wild's powersort: run stack, merge the two topmost runs whenever the new boundary's power is no larger than the power on top, keeping boundary powers strictly increasing ([official powersort page](https://powersort.github.io/)). The `power()` function computes the common-prefix length of the binary encodings of the two run midpoints (normalized by n) — the node-power definition — using floats instead of CPython's integer bit tricks (fine at benchmark sizes). **Simplification:** no minrun forcing (natural runs only) and no galloping. |
| **PDQSort** (variant) | Key constants match Orson Peters' [`pdqsort.h`](https://raw.githubusercontent.com/orlp/pdqsort/master/pdqsort.h) exactly: `insertion_sort_threshold = 24`, ninther above 128 elements, `partial_insertion_sort_limit = 8`, `bad_allowed = ⌊log₂ n⌋`, heapsort breakaway on `badAllowed` exhaustion, "already partitioned" → partial insertion sort, quarter-position swaps for unbalanced sides ≥ 24. Omissions: the branchless block partition (block_size 64) and randomized `break_patterns` swaps — the comparison *sequence* semantics are preserved. |
| **Bitonic Sort** | Iterative Batcher network `for k = 2,4,…; for j = k/2,…,1; compare i vs i⊕j, ascending iff `(i & k) == 0` — matches the standard form ([example](https://sortingalgos.miraheze.org/wiki/Bitonic_Sort)). Non-power-of-two N handled by padding with −∞-style sentinels (−1 ids) with correct direction-aware pad handling; pads sort to the front. ASC output. |
| **Circle Sort** | Halver (compare first/last inward) + recursive halves, repeat passes until no swap; includes the common odd-length middle-vs-next comparison ([Rosetta Code](https://rosettacode.org/wiki/Sorting_Algorithms/Circle_Sort), [pseudocode variant](https://neo-sorting-algorithms.fandom.com/wiki/Circle_sort)). |
| **Strand Sort** | Pull ascending strand from front (compare `A[i]` vs strand tail), merge strand into sorted output, repeat ([Rosetta Code](https://rosettacode.org/wiki/Sorting_algorithms/Strand_sort), [description](http://research.omicsgroup.org/index.php/Strand_sort)). |
| **Patience Sort** | Deal each card on the leftmost pile whose top it does not beat, else new pile; then repeatedly output the smallest pile top via a k-way tournament ([dealing rule](https://rosettacode.org/wiki/Sorting_algorithms/Patience_sort), [overview](https://every-algorithm.github.io/2023/11/22/patience_sorting.html)). The merge uses a min-winner tree (the standalone Tournament provider uses a max-tree — see orientation note). |
| **Binary Patience** | Same dealing rule via binary search over pile tops (the standard O(n log n) LIS-style patience), tournament merge. ✓ |
| **Comb Sort** | Shrink factor 1.3 as recommended by Lacey & Box ([history & factor](https://www.owlapps.net/owlapps_apps/articles?id=159439&lang=en), [Byte 1991 background](https://buffered.io/posts/sorting-algorithms-the-comb-sort/)); gap shrinks before each pass, terminates when gap = 1 and a clean pass. The optional "rule of 11" (bump gap 9/10 → 11) is *not* implemented — a known legitimate variant. |
| **Shellsort / Binary Shell / Recursive Shellsort** | Ciura's empirically-best gap sequence 1, 4, 10, 23, 57, 132, 301, 701 ([sequence source](https://www.dev-toolbox.tech/tools/sorting-visualizer/examples/shell-sort-gap-sequences), [Ciura 2001 note](http://taggedwiki.zubiaga.org/new_content/d4bd056e7de121075145fe27c43a0fb3)); gaps filtered to `< n` (safe: 1 always retained for n ≥ 2). Gapped insertion semantics standard. |
| **Quicksort (Hoare)** | Faithful Hoare partition with first-element pivot: scan j down while `A[j] > pivot`, i up while `A[i] < pivot`, swap, recurse `(l, j)` and `(j+1, r)` without re-placing the pivot — the defining Hoare property ([partition-scheme overview](https://en.wikipedia.org/wiki/Quicksort)). Pivot self-comparisons short-circuited via `pIdx` tracking. |
| **Quicksort (Ninther)** | Tukey ninther = median-of-3 of medians-of-3 at ninth-spaced samples (`s = n/8`, groups at `lo, lo+s, lo+2s | mid−s, mid, mid+s | hi−2s, hi−s, hi`), 12 comparisons, then Lomuto ([Bentley & McIlroy, *Engineering a sort function*](https://gallium.inria.fr/~maranget/X/421/09/bentley93engineering.pdf), [Princeton QuickBentleyMcIlroy](https://algs4.cs.princeton.edu/23quicksort/QuickBentleyMcIlroy.java)). Sample positions match B-M up to the lo+8d vs hi rounding of floor. |
| **Quicksort (RTL / LTR / Middle / Mo3 / Random)** | Lomuto partition with last-element pivot (RTL); LTR swaps the first element to the pivot slot (first-element pivot); middle/Mo3/random are standard pivot pre-selections (Mo3 = 3-comparison sorting network of lo/mid/hi, median to `hi`, then Lomuto ✓). |
| **Dual-Pivot Quicksort** | Yaroslavskiy-style: pivots at both ends (ordered by an initial compare), `lt`/`gt` pointers, compare vs p1 then p2, pivot swap-back, three subranges ([Yaroslavskiy/Bentley/Bloch lineage](https://kanwei.github.io/algorithms/classes/Algorithms/Sort.html), [structure](https://javanexus.com/blog/mastering-dual-pivot-quicksort)). No insertion cutoff (tuning omission, not an error). |
| **Triple-Pivot Quicksort** | 3-pivot scheme per Kushagra et al.: three sorted pivots p<q<r, each element compared with the *middle* pivot first, then routed to one of four buckets ([paper](https://cs.uwaterloo.ca/~skushagr/multipivotQuicksort.pdf)). Uses buffer arrays instead of the paper's in-place 4-pointer partition — simplification. |
| **3-Way Quicksort** | Dijkstra/Bentley-McIlroy Dutch-flag partition (`lt/eq/gt`, pivot = first element) ✓. |
| **Heap Sort** | Standard Floyd heapsort: build by sifting from `⌊n/2⌋−1`, extract max to end, sift root; two comparisons per level (larger child, then parent). ✓ |
| **BlockQuicksort** | ⚠️ **Sorts, but is not BlockQuicksort.** Edelkamp & Weiß's algorithm partitions via two offset buffers filled block-wise (B = 128 in the ESA 2016 paper) to avoid branch mispredictions ([paper](https://kclpure.kcl.ac.uk/ws/portalfiles/portal/123577916/BlockQuicksort_Avoiding_Branch_Mispredictions_EDELKAMP_PublishedAugust2016_VoR_CC_BY_.pdf)). The provider is a plain two-index (Hoare-style) partition with first-element pivot plus insertion below 16 — none of the block machinery. Reclassify as "quicksort (Hoare, first-element pivot, ins<16)". |
| **Hayate-Shiki** | 🔧 **Fixed during remediation** (originally mis-cleared as faithful). The part-construction logic is a faithful adaptation of 颯式 ([EmuraDaisuke/SortingAlgorithm.HayateShiki](https://github.com/EmuraDaisuke/SortingAlgorithm.HayateShiki)): comparison-based stable merge sort, N-sized external band with a descending column placed from the far end, part closure on `min ≤ v < max`, insertion (`cnIns = 32`) to secure part length, and carry-triggered sequential merges (the `(n^(n+1))&n` trailing-ones trick) instead of recursion — matching the documented "merge parts; merge sequentially to avoid recursion". But the **part-merge comparator was inverted** (`result === 1` emitted `u1` on "u1 stronger" → strongest-first merging into an ascending pipeline), corrupting output whenever two or more parts formed (N ≥ 33 on random inputs; the first audit's monotonic test strengths were pre-sorted and masked it). Fixed to emit the weaker item first; benchmark Kendall Tau moved 0.8426 → 1.0000. Deviation (unchanged): the ascending column stays in the main array rather than the external band. |
| **Bogosort / Bozosort / BogoBogoSort** | Bogosort = generate-and-test; the provider shuffles at the first detected inversion and rescans — semantically equivalent, expected ~(e−1)·n! comparisons ([running-time analysis](https://www.wikiwand.com/en/articles/Bogosort)). Bozosort = swap two random elements until sorted ✓. Bogobogosort follows the recursive prefix-restart definition (verify growing prefix, shuffle the copy and restart on failure) ✓ ([definition](https://wiki2.org/en/Bogosort)). All three verified to actually sort for n ≤ 5/5/7 within the step cap; they are infeasible by design at benchmark N — hence their truncated τ in ANALYSIS.md. |
| **Pancake, Cycle, Gnome, Cocktail Shaker, Cocktail/Double Selection, Odd-Even, Bubble, Selection, Insertion, Binary Insertion, Tree, Tournament (mechanics), Natural Merge, K-way/3-way/4-way Merge, In-place Merge, Rotation Merge, Ping-pong Merge, Parallel Merge/Quicksort (sequentialized), Stable Quicksort, Bucket (see below)** | Textbook-standard state-machine encodings; all empirically sort. Specifics: Cycle sort counts rank by linear scan and rotates cycles ✓; Pancake finds max by comparisons and flips (flips free — correct adaptation for a comparison benchmark); Rotation merge = standard in-place merge via binary search + rotation recursion with 16-block insertion pre-pass; In-place merge uses the O(n²)-move shift merge (comparisons stay n log n); ping-pong alternates src/dst each width pass ✓; k-way merges use winner trees ✓; Bucket sort is a comparison-based adaptation (sample pivots → binary-search distribution → insertion-sorted buckets), legitimate given there are no keys, but "bucket sort" canonically assumes uniform-distribution keys — ⚠️ adapted. |
| **Budgeted Merge Sort** | App-specific (not an external algorithm): bottom-up merge sort truncated at `budget = round(n·log₂n − 1.44n)` comparisons (520 at N=100 — matches README). Verified: stops at budget; sorts whenever the budget suffices (the 40 "unsorted" harness rows are all budget-exhausted runs — by design). The class name `QuickMergeSortProvider` is a misnomer (it is not Dalkhov's QuickMergesort), but ANALYSIS.md labels it "Budgeted Merge Sort", which is accurate. |
| **Full Rank** | App-defined: shuffled round-robin of all N(N−1)/2 pairs ✓ exactly as README describes. |

### Duplicate-implementation note
`BinaryGnomeSortProvider` is line-for-line identical to `BinaryInsertionSortProvider` (only a state label differs) — "binary gnome sort" as sometimes described (gnome sort with binary search) reduces to exactly binary insertion sort, but the benchmark is effectively measuring the same code twice under two names.

---

## Cross-check against the repo's published claims

| Claim (ANALYSIS.md / README) | Audit result |
|---|---|
| Fung's algorithm "compares every pair of positions… N² positional requests, sorts correctly, duplicates YES, excluded from production" | ✅ Accurate; implementation is an exact port of the paper's Algorithm 1 |
| Ford-Johnson avg 526.64 battles, τ 1.0000 at N=100 | ✅ Consistent with F(100) = 534 worst case and the ⌈log₂ 100!⌉ = 525 lower bound; Jacobsthal insertion order verified |
| Budgeted Merge Sort 520.00 (τ 0.9631) | ✅ Budget formula and behavior verified |
| "85 distinct sorting algorithms" | ✅ 85 registered providers (with the caveat that Binary Gnome = Binary Insertion, Smooth = Heap, and several are adapted/mislabeled — so fewer than 85 *distinct* algorithms in the strict sense) |
| Intro Sort τ 1.0000 / Smooth 716.61 / Radix 878.08 battles etc. | ⚠️ Numbers are reproducible under the reach-based metric, but "Intro Sort" did not actually sort at n ≥ 31, "Smooth Sort" *is* Heap Sort, and "Radix Sort" was a random-pivot quicksort + insertion sort. *(All three remediated on 2026-09-03 — see the [Remediation log](#remediation-log-implemented-2026-09-03).)* |

## Recommendations (optional fixes)

> All five recommendations were implemented on 2026-09-03 — see the [Remediation log](#remediation-log-implemented-2026-09-03). The list below is retained for the record.

1. **Intro Sort**: make the insertion branch and heap fallback interpret results the same way as the partition (or invert the partition) — one-line semantic fix; then re-verify.
2. **Tournament Sort**: move the `sortedCount === n` check *after* the final `out.push(winner)`.
3. **Rename or reimplement** "Radix Sort" (e.g., "Binary Quicksort (random pivot)") and "Smooth Sort" (either implement Leonardo heaps or relabel "Heap Sort (proxy)").
4. **Normalize orientation** (pick strongest-first to match the app) or document the convention per provider.
5. **Silly Sort**: either add its swap logic or replace with a meme provider that declares its non-functioning nature (e.g., document alongside Exit/Random sort).

## Remediation log (implemented 2026-09-03)

All changes live in [`research/sort_analysis.js`](sort_analysis.js); every provider was re-verified with the (hardened) harness afterwards.

### Code fixes

| # | Provider | Change | Re-audit result |
|---|---|---|---|
| 1 | `IntroSortProvider` | Partition now swaps on `result === 0` (Lomuto-ASC), matching the already-ASC insertion and heapsort branches — a one-token orientation fix. | SORTED_ASC, 489/489 runs (previously failed all n ≥ 31) |
| 2 | `TournamentSortProvider` | The final winner is pushed **before** the completion break (the old code broke one push early and dropped the weakest element). | SORTED_DESC, full length, 489/489 runs |
| 3 | `HayateShikiProvider` *(new finding)* | Part-merge comparator un-inverted: `result === 0` (u1 weaker) now emits `u1` first, consistent with the ascending part construction. Unmasked by the hardened harness (see below). | SORTED_ASC, 489/489 runs; benchmark τ 0.8426 → 1.0000 |
| 4 | `RadixSortProvider` → `BinaryQuicksortProvider` | The mislabeled "Radix Sort" (fixed ⌈log₂n⌉ random-pivot passes + full insertion sort) was replaced by a genuine **Binary Quicksort**: recursive two-bucket partition around a random pivot value, pivot placed between buckets, each element compared once per level → zero duplicate pairs. | SORTED_ASC, 489/489 runs, 0 duplicate-pair runs |
| 5 | `SmoothSortProvider` | Relabeled **"Heap Sort (Smooth Proxy)"** in the registry (it delegates to heapsort; implementing Dijkstra's Leonardo-heap smoothsort was judged out of scope for a benchmark row). Proxy behavior now stated in a code comment. | SORTED_ASC, 489/489 runs |
| 6 | `SillySortProvider` | Now implements the classic silly recursion (compare/swap endpoints of `[i,j]`, then sort `[i+1,j]` and `[i,j-1]` — correct by induction, Θ(2ⁿ) comparisons). The old provider ignored every comparison result and could never sort. No canonical definition exists; the definition used is documented in the class comment. | SORTED_ASC, 139/139 runs at n ≤ 14 (exponential → capped, like the bogo family) |
| 7 | Orientation convention | Documented in a header comment above the `algos` registry in `sort_analysis.js` (21 strongest-first vs 51 weakest-first providers, and why `simulate()` is direction-agnostic). Per-provider orientation is recorded in `audit_results.txt`. Flipping 51 providers' semantics was rejected as unjustifiable churn/risk for a research script. | n/a (documentation) |

### Harness hardening

`audit_correctness.js` now generates **non-monotonic** item strengths (the identity permutation is no longer sorted in either direction). The original harness's monotonic strengths made any pre-sorted-input pass trivially for ASC providers — which is exactly how the Hayate-Shiki merge bug escaped the first audit (its parts pipeline is adaptive, so pre-sorted input never formed a second part).

### Benchmark refresh (`node research/sort_analysis.js 100 250`)

Rows for the six affected algorithms were re-measured and merged into `results.txt`, `ANALYSIS.md`, and `ANALYSIS-id.md` (other rows retained; each algorithm is an independent experiment):

| Algorithm | Before | After |
|---|---|---|
| Intro Sort | 716.90 battles / τ 1.0000 / NO dups *(array unsorted at n ≥ 31)* | **724.86 / 1.0000 / NO** *(now actually sorts)* |
| Tournament Sort | 558.46 / 1.0000 / NO *(dropped last element)* | **558.27 / 1.0000 / NO** *(comparison sequence unchanged, as predicted)* |
| Hayate-Shiki | 844.89 / **0.8426** / YES *(broken merges)* | **1024.12 / 1.0000** / YES |
| Radix Sort → Binary Quicksort | 878.08 / 1.0000 / YES | **646.49 / 1.0000 / NO** |
| Smooth Sort → Heap Sort (Smooth Proxy) | 716.61 / 1.0000 / YES | **716.96 / 1.0000 / YES** (heapsort numbers, as expected) |
| Silly Sort | 71.65 / 0.1126 / YES *(ignored results)* | **202.56 / 0.1266 / YES** *(real work until the 1M-iteration cap)* |

The Pareto frontier and the Ford-Johnson production knee point are unchanged (`research/pareto_analysis.js` output identical); README claims (Budgeted 520.00, Ford-Johnson 526.64, ~89% battle reduction) are unaffected.

### Final verification

```bash
node research/audit_correctness.js   # 85/85 correct: 51 ASC + 21 DESC + 1 enumerator
                                      # + 3 lossy jokes + 8 non-sorting jokes + Slowsort (inherent timeout at n ≥ 127)
```

## Reproducing

```bash
node research/audit_correctness.js     # ~10 s; writes research/audit_results.txt
node research/sort_analysis.js 100 250 # full 118-algorithm benchmark
```

---

# Batch-2 addendum (2026-09-11): 33 newly registered providers

**Scope delta:** 32 newly implemented providers plus the registration of the previously unregistered `BozosortProvider` — the registry grows from 85 to **118 providers**. Every new provider was web-verified against its canonical definition (links inline) and passes the hardened harness (`audit_correctness.js`, non-monotonic strengths, N ∈ {2…128}); the full suite is **118/118 correct** (Slowsort's N ≥ 127 timeout is pre-existing and inherent).

**Orientation delta:** +23 weakest-first (ASC), +10 strongest-first (DESC). New totals: **74 ASC + 31 DESC** + 1 enumerator + 3 lossy jokes + 8 non-sorting jokes (+ Slowsort, ASC with inherent timeouts). New DESC providers: Exchange Sort, Bingo Sort, Cocktail Bounds, Permutation Sort, Less/Exchange/Bubble/Odd-Even Bogo, Bovo Sort, Bozo Sort. All other new providers are ASC.

**Harness delta:** `BOGOLIKE` caps extended — Permutation Sort: 8 (deterministic n!), Bovo Sort: 5 (factorial hitting time), Exchange/Bubble/Odd-Even Bogo: 17 (expected-polynomial inversion descent, capped for audit speed). Less Bogo is uncapped (expected ~1.5n² comparisons, light tails) and passes all 489 runs.

## Batch-2 per-provider fidelity

| Provider | Canonical source & verified details |
|---|---|
| **Batcher Odd-Even** | Batcher 1968 sorting network ([Wikipedia](https://en.wikipedia.org/wiki/Batcher_odd%E2%80%93even_mergesort)): recursive odd-even merge comparators over the next power of two, +∞ sentinel padding exactly like the repo's Bitonic provider. Non-adaptive, Θ(S log² S) positional comparators. ✅ |
| **Bose-Nelson** | Bose & Nelson 1962 network ([bose-nelson.c recurrences](https://github.com/atinm/bose-nelson)): Pstar half-sorting + Pbracket merge cascade, ported to 0-based indices; works for any n with no padding. ✅ |
| **Exchange Sort** | [Wikipedia](https://en.wikipedia.org/wiki/Exchange_sort): compare A[i] against every later A[j], eager swap on inversion. DESC to match the repo's selection sorts. ✅ |
| **Bingo Sort** | [Wikipedia](https://en.wikipedia.org/wiki/Bingo_sort) maximal selection, DESC variant (repeatedly finds the minimum, pulls copies to the end). ✅ |
| **Cocktail Bounds** | Cocktail shaker with shifting bounds ([Rosetta Code](https://rosettacode.org/wiki/Sorting_algorithms/Cocktail_sort)): last-swap position shrinks the window each pass. DESC. ✅ |
| **Bottom-up Heap** | Wegener 1993 variant ([Wikipedia](https://en.wikipedia.org/wiki/Heapsort#Bottom-up_heapsort)): sift-down to a leaf comparing only children (1 comp/level), displaced value sifts back up. ✅ |
| **Weak Heap** | Dutton 1993 ([Wikipedia](https://en.wikipedia.org/wiki/Weak_heap)): reverse-bit array, distinguished-ancestor joins for build (n−1 comps), merge-up extraction. ✅ |
| **Smoothsort** | Genuine Dijkstra 1981 ([Wikipedia](https://en.wikipedia.org/wiki/Smoothsort)): Leonardo-heap forest, sift/trinkle/semitrinkle, grow-phase sift-vs-trinkle optimization, grow+shrink phases; stretch-order list encodes the same decomposition as the classic p-bit machine. The old "Heap Sort (Smooth Proxy)" row is retained for continuity. ✅ |
| **Splay Sort** | Movahedi et al. 2014 ([Splay tree](https://en.wikipedia.org/wiki/Splay_tree)): BST insert + splay-to-root (zig/zig-zig/zig-zag), inorder traversal. ✅ |
| **Cartesian Tree** | Min-Cartesian tree via the classic stack algorithm (≤ 2n−2 comps), then repeated min-extraction with a binary heap ([Wikipedia](https://en.wikipedia.org/wiki/Cartesian_tree)). ✅ |
| **Treap Sort** | BST insert by strength with `Math.random` priorities (never oracle-compared), rotate-up on priority, inorder traversal ([Wikipedia](https://en.wikipedia.org/wiki/Treap)). ✅ |
| **Skiplist Sort** | Fair-coin levels capped at ⌈log₂(n+1)⌉, search-and-splice per level, level-0 traversal ([Wikipedia](https://en.wikipedia.org/wiki/Skip_list)). ✅ |
| **Shivers / Adaptive Shivers / Augmented Shivers** | Auger et al. 2018 merge policies ([arXiv:1809.08411](https://ar5iv.labs.arxiv.org/html/1809.08411)) on a shared Timsort-structured base (natural runs, descending reversed, run stack, stable merges, top-two collapse): Shivers merges top-two when log-lengths don't decrease; Adaptive uses the h−2/h−1/h log rule; Augmented adds the size-guard rule. ✅ |
| **Peeksort** | Munro & Wild 2018 ([reference](https://github.com/sebawild/peeksort)): mid-run peeking with run-boundary-aware splits, insertion (≤ 24) with sorted-prefix skip. ✅ |
| **Library Sort** | Bender et al. 2005 ([Wikipedia](https://en.wikipedia.org/wiki/Library_sort)): gapped insertion into a 2n array, binary search over gaps + comparison-based linear adjustment with verified neighbors, rebalance after 1,2,4,… insertions. ✅ |
| **Sample Sort** | Frazer–McKellar style ([Wikipedia](https://en.wikipedia.org/wiki/Samplesort)): sample ≤ 12 → 3 quartile splitters → 4 buckets by binary search, linear-insertion cutoff 16, explicit frame stack. Documented parameters in code. ✅ |
| **Funnel Sort** | ⚠️ **Documented skeleton.** Recursive cube-root splitting (k = max(2, round(len^⅓)), insertion ≤ 8) with a winner-tree k-way merge faithfully models the splitting structure and merge comparison sequence of Frigo et al. 1999, but the cache-oblivious k-merger buffer layout is elided (stated in the class comment). |
| **Quadsort** | Structural port of [scandum/quadsort](https://github.com/scandum/quadsort): 8-element quad-swap analyzer (4 pair comps + 3 bridge comps), whole-reverse early exit, bottom-up 4-block parity-merge passes with ordered-boundary skips. **Elisions (documented):** branchless cross merge and the parity-vs-cross chooser (parity merges throughout); tail blocks generalize the analyzer. ✅ (variant) |
| **Piposort** | Structural port of [scandum/piposort](https://github.com/scandum/piposort): top-down 4-way partition to < 8, odd-even leaves, parity-merge passes with in-order skip and reverse-order rotation. **Micro-difference (documented):** leaves run to two consecutive clean phases (best 6 / worst 24 on 7 elements) instead of the reference's ≤ 7 phases (best 6 / worst 21). ✅ (variant) |
| **Replacement Selection** | Knuth TAOCP 5.4.1: heap-ordered buffer (B = 8) with current/next run bits, refill stamped by one comparison against last-written, pairwise run merge. ✅ |
| **Polyphase Merge** | Knuth TAOCP 5.4.2, 3 tapes: initial runs from genuine replacement selection (a `ReplacementSelectionSortProvider` sub-instance driven to completion — the same sub-provider pattern as the repo's Bucket sort), Fibonacci distribution with dummy pass-through, tape rotation. ✅ |
| **BFPRT Quicksort** | Quicksort with Blum et al. 1973 median-of-medians pivots ([Wikipedia](https://en.wikipedia.org/wiki/Median_of_medians)): groups of 5, medians to front, recursive MoM, Lomuto partition, insertion ≤ 16. Worst-case O(n log n). ✅ |
| **Shear Sort** | Schnorr & Shamir 1986 ([Wikipedia](https://en.wikipedia.org/wiki/Shear_sort)): alternating snake-order row phases and column phases of odd-even transposition sort on a ⌈√n⌉ grid with +∞ sentinels, snake-order readout. ✅ |
| **PESort** | Proportion Extend Sort, symmetric variant (Chen 2001, [Wikipedia](https://en.wikipedia.org/wiki/Proportion_extend_sort)): sorted part S adjacent to bounded unsorted part U (p = 16, extension chunks (p+1)\|S\|), median-split LUR partition with pivot exclusion, insertion ≤ 16, longest-monotonic-run seeding. Note: the first draft implemented a different adaptive algorithm under this name; it was replaced with the real Chen 2001 algorithm after a source check. ✅ |
| **Permutation Sort** | Systematic lexicographic enumeration (next_permutation from identity, free moves) with a fail-fast DESC check per permutation. Deterministic; Θ(n·n!) worst case. ✅ |
| **Less Bogo** | Selection sort via shuffles ([Sorting Wiki](https://sortingalgos.miraheze.org/wiki/Bogosort)): shuffle suffix until position k holds its maximum, fix, continue. ✅ |
| **Exchange Bogo** | Bozo-style check, but a botched round compares two random positions and swaps only if inverted ([Sorting Wiki](https://sortingalgos.miraheze.org/wiki/Bogosort)). Every swap strictly decreases the inversion count → converges a.s. ✅ |
| **Bubble Bogo** | Exchange Bogo restricted to one random adjacent pair per botched round ([Sorting Wiki](https://sortingalgos.miraheze.org/wiki/Bogosort)). ✅ |
| **Odd-Even Bogo** | Bubble Bogo alternating odd/even random indices per botched round ([Sorting Wiki](https://sortingalgos.miraheze.org/wiki/Bogosort)). ✅ |
| **Bovo Sort** | Check DESC; if botched, pull a random item to the head ([definition](https://neo-sorting-algorithms.fandom.com/wiki/Bogo_Sort)). Random-to-top moves generate the full symmetric group → hits sorted order a.s. ✅ |
| **Bozo Sort** | Pre-existing provider, newly registered: swap two random elements until sorted ([Sorting Wiki](https://sortingalgos.miraheze.org/wiki/Bogosort)). ✅ |

## Batch-2 bug log (all found by differential smoke tests, fixed, re-verified)

| # | Provider | Bug | Fix |
|---|---|---|---|
| B1 | Quadsort | Block-assembly guard `runs.length <= 1` fired mid-merge (after shifts emptied the list) → empty blocks and downstream `null.length` throws | Guard assembly completion with `!this.pm && runs.length <= 1` |
| B2 | Quadsort | Whole-reverse path reversed the concatenated items instead of the block order after per-block reversals | Concatenate `blocks.slice().reverse()` |
| B3 | Smoothsort | Grow-phase stepson check used `< n` with a 0-based cursor (the C++ reference's `q` is a 1-based count) → skipped trinkles, wrong extractions at n = 7, 17, 32, 63 | Threshold `q + L[k-1] < n - 1` |
| B4 | Peeksort | Unbounded initial right-run scan/reversal overlapped and clobbered a sorted left-run tail (failed at n = 4, 5) | Bound the scan below by L0+1; skip when L0 ≥ n−1 |
| B5 | Sample/Funnel Sort | Multi-child frames delivered results to the stack top instead of the child's parent slot | Indexed `{_parent, _slot}` delivery for all multi-child frames |
| B6 | Replacement Selection | The refill-stamp state re-read the input on resume, double-incrementing `inputIdx` → `undefined` ids in pairs for n > 8 | Split capture (`stamp`) from wait (`stampwait`) |
| B7 | BFPRT Quicksort | Small-case selection mutated into an insertion frame that overwrote the wanted index `k` with its own cursor | Preserve `k0` across the mutation |
| B8 | Library Sort | Occupied-slot placement put the element on the wrong side of the blocking element | Ask `[E′, x]` and shift directionally with verified neighbors |

Final verification: `node research/audit_correctness.js` → 118/118 providers correct (74 ASC + 31 DESC + 1 enumerator + 3 lossy + 8 non-sorting + Slowsort inherent-timeout).
