# Web Candidate and Implementation Log

This file records the comparison-sort web sweeps behind the benchmark. The
original 2026-09-11 sweep started from 85 providers and produced the 118-provider
batch-2 suite described later in this file. A third sweep on the same date
searched the wider Sorting Wiki taxonomy, current research papers, and reference
implementations from cpp-sort, scandum, Glidesort, GrailSort, and WikiSort. It
added **25 more providers**, bringing that suite to **143**. The 2026-09-12
VQSort addendum below brings the live registry to **144**. A fourth sweep on
2026-09-12 (Shell/insertion/network variants, adaptive sorts from emilk and
cpp-sort, JSort, QuickHeapsort, tree and meldable-heap sorts, and merge-insertion
generalizations) added **24 more providers**, bringing the live registry to
**168** (see the Batch-4 section). A fifth sweep on 2026-09-13
(knuth/Papernov-Stasevich/Fibonacci gap families, pairing/Fibonacci heaps,
B-tree/AA/scapegoat trees, brick network, Super Scalar & IPS⁴o sample sorts,
Sqrt/Octosort, cubesort/gridsort, slab & adaptive-heap sorts, cascade &
oscillating external merges, and 6-ary heap) added **20 more providers**,
bringing the live registry to **188**. A sixth sweep on 2026-09-13
(Wave Sort, co-ranking in-place mergesort, the Bentley–McIlroy
"Engineering a Sort Function" quicksort, length-adaptive Shivers, Rouge Sort,
adaptive binary insertion, and eleven further Shellsort gap families) added
**17 more providers**, bringing the live registry to **205** (see the
Batch-6 section).

Only comparison-based algorithms can become PreferenceRank `Provider`s. Sorts
that inspect numeric keys (counting, radix, bead/gravity, flash, proxmap,
spreadsort, burstsort, American flag, pigeonhole, postman's, interpolation, and
Topswops) remain excluded: a human preference item has no sortable digit/key.
Likewise, parallelism, branchlessness, cache traffic, and data moves are not
battles; this benchmark measures only item-to-item comparisons. The VQSort row
therefore scalarizes SIMD lane comparisons and must not be read as a speed test.
Where a modern algorithm's defining engineering is not comparison-observable,
the provider and
audit explicitly call the implementation a comparison port or structural
skeleton rather than claiming a byte-for-byte port.

## Batch 3 — implemented and benchmarked (25)

Fresh protocol: `node research/sort_analysis.js 100 250`, N=100, 250 trials.
All 25 pass `research/audit_correctness.js` over 489 runs per provider against
deterministic non-monotonic comparison oracles and finish with a correctly
sorted `items` permutation. `Duplicates` means that the provider asks the same
unordered pair more than once in at least one N=100 benchmark trial; repeated
and transitively implied pairs do not count
as new human battles.

| Algorithm | Family / source idea | Fidelity in this benchmark | Battles | Duplicates |
|---|---|---|---:|:---:|
| Optimized Pancake | Prefix-flip rotate mergesort | Binary-search rotate-merge comparison port; flip decomposition is comparison-free | 562.74 | YES |
| 4-way Powersort | Run-adaptive multiway merge | Natural runs, base-4 node powers, weak stack invariant, tournament 2/3/4-way merge | 569.20 | YES |
| QuickMergesort | QuickXsort with mergesort as X | Median-of-three partition and half-buffer eligibility; buffer swaps elided | 579.34 | YES |
| GrailSort | Stable in-place block merge | **Structural skeleton:** 2√n key collection, pair runs, buffered merge levels, key cleanup; block moves elided | 585.11 | NO |
| Twinsort | Adaptive twin-swap + tail merge | Comparison port of the public C reference | 593.20 | YES |
| Fluxsort | Stable quicksort/quadsort hybrid | Quartile median-of-three stable partition and Twinsort ≤64 comparison port | 595.77 | YES |
| Loser-Tree Merge | External k-way merge | B=8 internal runs and loser-recording tournament replay | 600.69 | NO |
| WikiSort | Stable block merge | Public fixed-cache path at N=100; O(1)-memory fallback not selected | 614.78 | YES |
| Tokuda Shellsort | Shellsort gap variant | Faithful Tokuda increments and gapped insertion | 632.70 | YES |
| Glidesort | Powersort + deferred stable quicksort | **Comparison-level adaptation:** logical sorted/unsorted runs and deferred materialization | 638.73 | YES |
| Sedgewick Shellsort | Shellsort gap variant | Faithful 1986 alternating increments | 659.90 | YES |
| Out-of-place Heap | External heapsort | Incremental min-heap and streamed remove-min | 686.58 | YES |
| Ternary Heap | d-ary heapsort, d=3 | cpp-sort incremental-build formulation | 696.26 | YES |
| Weave Merge | Recursive in-shuffle + insertion | Faithful comparison/movement structure | 698.86 | YES |
| Quaternary Heap | d-ary heapsort, d=4 | cpp-sort incremental-build formulation | 714.11 | YES |
| Blitsort | Stable rotate quick/merge | **Comparison port:** ninther stable partition, 24-item merge base; rotations elided | 720.38 | YES |
| Crumsort | Adaptive quick/merge hybrid | Analyzer, 66% merge fallback, ninther partition, 24-item base comparison port | 739.52 | YES |
| Min-Max Heap | Double-ended priority queue | Atkinson et al. alternating-level heap, repeated delete-min | 740.66 | YES |
| Poplar Sort | Forest of 2^k−1 post-order heaps | Port based on cpp-sort/Morwenn's implementation | 760.14 | YES |
| 3-Smooth Comb | All 2^p3^q comb gaps | Faithful compare-exchange passes and one final gap-1 pass | 827.94 | YES |
| Pratt Shellsort | All 3-smooth Shell increments | Faithful gapped insertion variant | 831.47 | YES |
| Spin Sort | Stable half-buffer mergesort | cpp-sort cutoffs and recursive merge comparison port | 875.36 | NO |
| MEL Sort | Encroaching-list sort | Original first-compatible-list construction plus pairwise merges | 1184.09 | YES |
| Double Insertion | Center-out insertion | Morwenn's two-ended insertion structure | 1780.33 | YES |
| Stable Selection | Shift-instead-of-swap selection | Faithful stable variant | 2580.41 | YES |

The strongest batch-3 result is Optimized Pancake at 562.74 battles, but it
repeats pairs. The first new no-duplicate result is the GrailSort skeleton at
585.11, well behind Ford-Johnson's 526.94. Therefore no batch-3 entry changes the
meaningful no-duplicate frontier or the production choice.

### Batch-3 primary sources

- Sorting Wiki comprehensive taxonomy and individual pages (3-Smooth Comb,
  Stable Selection, Weave Merge, Optimized Pancake, block-merge families):
  <https://sortingalgos.miraheze.org/wiki/Sorting_algorithm>
- cpp-sort authoritative implementations (d-ary heap, Poplar, MEL, Spin,
  Grail/Wiki/QuickMerge context): <https://github.com/Morwenn/cpp-sort>
- Double insertion reference by Morwenn:
  <https://gist.github.com/Morwenn/13a314b501f18eb3dba0dad7540ef8f4>
- Atkinson et al., *Min-Max Heaps and Generalized Priority Queues* (1986):
  <http://webhotel4.ruc.dk/~keld/teaching/algoritmedesign_f08/Artikler/02/Atkinson86.pdf>
- Poplar heap/sort reference: <https://github.com/Morwenn/poplar-heap>
- MEL pseudocode discussion:
  <https://codereview.stackexchange.com/questions/124980/melsort-sorting-with-encroaching-lists>
- Twinsort and Fluxsort references: <https://github.com/scandum/twinsort>
- QuickXsort / QuickMergesort paper and code:
  <https://www.wild-inter.net/publications/edelkamp-weiss-wild-2019.pdf>,
  <https://github.com/weissan/QuickXsort>
- Cawley Gelling et al., *Multiway Powersort*:
  <https://arxiv.org/abs/2209.06909>
- External loser-tree merge overview:
  <https://www.ahl27.com/posts/2024/12/loser-trees-io/>
- GrailSort readable reference: <https://github.com/HolyGrailSortProject/Rewritten-Grailsort>
- WikiSort reference: <https://github.com/BonzaiThePenguin/WikiSort>
- Glidesort design and source: <https://github.com/orlp/glidesort>
- Scandum hybrid family (Flux/Blit/Crum):
  <https://github.com/scandum/quadsort>,
  <https://github.com/scandum/blitsort>,
  <https://github.com/scandum/crumsort>


## VQSort addendum — implemented and benchmarked (2026-09-12)

`VQSort (u64/AVX2 model)` is now the 144th registered provider. This is a
**fixed-profile comparison model**, not a JavaScript port that can preserve
VQSort's hardware performance:

- **Pinned profile/source:** ascending `uint64_t`, AVX2 (256-bit vectors, four
  64-bit lanes), initially 64-byte-aligned input, based on Google Highway commit
  [`c415565`](https://github.com/google/highway/tree/c415565a31ba7d532559edf67bc2171f4fe50c4f/hwy/contrib/sort).
- **Comparison-visible structure:** the current six-random-64-byte-chunk sampler,
  lane-wise median-of-three reductions, 16-sample sorting network and pivot-rank
  rule, lane-to-pivot partition decisions, recursive partitions, the 50-level
  heap fallback, and the paper's degenerate min/max safeguard all become
  coroutine comparisons. The latter substitutes for the current C++ source's
  primitive-key equality, `PrevValue`, and two-value fast paths, which an
  opaque binary human comparator cannot reproduce.
- **Architecture-selected base case:** four u64 lanes imply
  `BaseCaseNumLanes = 16 × 4 = 64`. The provider ports Highway's exact dispatch
  and comparator sequences for 2, 3–4, 8×1, 8×2, 8×4, and 16×4 networks,
  including the generated row-merging networks and neutral padding.
- **Reproducibility choices:** Highway seeds its thread-local SFC64-family RNG
  from entropy; the provider uses a fixed nonzero state but the same bounded
  chunk-index mapping. Padding, repeated identities, equality/rank scans, and
  moves do not ask a human to compare an item with itself.
- **Unrepresentable hardware behavior:** SIMD concurrency, `CompressStore` and
  table-driven lane packing, exact in-place partition layout, prefetch/cache
  effects, branch prediction, and instruction throughput are omitted. Stable
  left/right arrays stand in for partition movement. This can change later
  sample locations versus native VQSort, so the row is an architecture-informed
  comparison model rather than an exact native comparison trace.

The hardened audit exercises all base-case boundaries and recursive sizes up to
128: VQSort completed **489/489** runs, requested valid item ids, retained every
item once, and finished `SORTED_ASC`. The fresh N=100/250-trial benchmark reports
**656.02 unique battles, τ=1.0000, duplicates YES**. It is dominated by
Ford-Johnson (**526.94**, no duplicates), so the production provider remains
unchanged.

Primary references:

- Blacher et al., *Vectorized and performance-portable Quicksort*:
  <https://arxiv.org/abs/2205.05982>
- Pinned Highway recursion, sampler, partition, and base-case source:
  <https://github.com/google/highway/blob/c415565a31ba7d532559edf67bc2171f4fe50c4f/hwy/contrib/sort/vqsort-inl.h>
- Pinned Highway sorting/merging networks:
  <https://github.com/google/highway/blob/c415565a31ba7d532559edf67bc2171f4fe50c4f/hwy/contrib/sort/sorting_networks-inl.h>
- Pinned vector-width/base-case constants:
  <https://github.com/google/highway/blob/c415565a31ba7d532559edf67bc2171f4fe50c4f/hwy/contrib/sort/shared-inl.h>

## Batch 4 — implemented and benchmarked (2026-09-12, 24 providers)

Fresh protocol: `node research/sort_analysis.js 100 250`, N=100, 250 trials;
`node research/audit_correctness.js` over 489 runs per provider. All 24 pass the
audit and finish with a correctly sorted `items` permutation. `Duplicates` means
the provider repeats an unordered pair in at least one benchmark trial.

| Algorithm | Family / source idea | Fidelity in this benchmark | Battles | Duplicates |
|---|---|---|---:|---:|
| Binary Cocktail | Bidirectional binary-insertion sort | Forward + reverse passes, both binary-searched | 530.62 | YES |
| AVL Tree Sort | Height-balanced BST insert + inorder | Faithful AVL rotations (comparison-free) | 538.12 | YES |
| Red-Black Tree Sort | LLRB insert + inorder | Sedgewick left-leaning red-black rules | 544.32 | YES |
| 8-way Merge Sort | k-way tournament mergesort, k=8 | Extends the repo's existing k-way base | 547.73 | NO |
| Vergesort | Adaptive big-run sort | Runs > n/log n kept; sub-threshold runs quicksorted; balanced pairwise k-way merge | 579.73 | YES |
| 3-way Powersort | Run-adaptive multiway merge | Base-3 node powers, 3-run groups | 584.67 | YES |
| Triplet Merge-Insertion | Ford-Johnson with sorted triples | Maxima recursed; mids/mins binary-inserted | 592.18 | YES |
| Binomial Heap Sort | Binomial-heap insert + delete-min | Faithful link/carry forest | 593.74 | YES |
| QuickHeapsort | Quicksort switching to heapsort ≤16 | Median-of-3 partition + in-place heapsort base | 595.52 | YES |
| Ciura Shellsort | Empirically best Shell increments | Ciura 2001 sequence (1,4,10,23,57,…) | 630.29 | YES |
| Gonnet Shellsort | Shell increments ×5/11 | Gonnet–Baeza-Yates recurrence | 630.53 | YES |
| Hibbard Shellsort | Shell increments 2^k−1 | Faithful Hibbard sequence | 639.28 | YES |
| Comparison Counting Sort | Count smaller elements, place by count | Knuth 5.2; each pair probed twice | 648.02 | YES |
| Original Shell Sort | Shell's 1959 halving gaps | n/2, n/4, … 1 | 649.23 | YES |
| Cocktail Bogo | Bogo family + cocktail shuffle | Random adjacent-swap shuffle, DESC verify | 695.88 | YES |
| Pairwise Sorting Network | Parberry 1992 comparator network | Paper's layer order + j<n guards | 711.54 | YES |
| Neatsort | Adjacent scan → cap-log-n sorted part | Sorted section ≤ floor(log2 n), rest quicksorted | 732.82 | YES |
| Drop-Merge Sort | Adaptive LNS + drop + merge | emilk rollback/backtracking port; EARLY_OUT omitted | 758.84 | YES |
| Split Sort | Isolate LNS, sort rest, merge | split_adapter single-scan port | 764.63 | YES |
| 5-ary Heap Sort | d-ary heapsort, d=5 | Extends the repo's d-ary base | 774.25 | YES |
| JSort | Two heap passes + insertion | Morrison's min-heap front / max-heap back | 780.07 | YES |
| Leftist Heap Sort | Leftist-heap insert + delete-min | Null-path-length meld | 788.74 | NO |
| Skew Heap Sort | Self-adjusting heap insert + delete-min | Sleator-Tarjan meld | 808.02 | NO |
| Shuffle Sort | Bubble-shuffle passes + insertion | n/2 shuffle passes then insertion cleanup | 2566.38 | YES |

The strongest new no-duplicate result is 8-way Merge Sort at **547.73**, still
behind Ford-Johnson's 527.02, so the production knee is unchanged. Candidates
that were found in the sweep but *not* implemented (already present or
unportable as comparison battles): Wegener bottom-up heapsort and Cartesian-tree
sort (= the existing Bottom-up Heap / Cartesian Tree rows), rotation merge
(= Rotation Merge Sort), scandum's cubesort/gridsort and binary-cube family
(their bucketing is numeric-key lookup, invisible to an opaque human
comparator), walksort and Katajainen's Ultimate Heapsort (no implementable
published structure surfaced), and key-inspecting sorts (radix/counting/bead/
flash/proxmap/spreadsort/burstsort/…), which stay excluded by the
comparison-only rule.

## Batch 4 sources

- Drop-Merge sort (emilk), incl. rollback/backtracking reference:
  <https://github.com/emilk/drop-merge-sort>
- cpp-sort split_adapter / vergesort semantics:
  <https://github.com/Morwenn/cpp-sort/wiki/Sorter-adapters>
- Vergesort standalone: <https://github.com/Morwenn/vergesort>
- Neatsort: <https://en.wikipedia.org/wiki/Neatsort>
- Pairwise sorting network (Parberry 1992) + pseudocode:
  <https://handwiki.org/wiki/Pairwise_sorting_network>
  and <https://ianparberry.com/pubs/pairwise.pdf>
- 3-way/multiway Powersort: <https://arxiv.org/abs/2209.06909>
- JSort (Jason Morrison):
  <https://en.wikipedia.org/wiki/JSort>
- QuickHeapsort (Cantone & Cincotti): *QuickHeapsort, an efficient mix of
  classical sorting algorithms*, 2000
- Shellsort gap sequences (Original/Hibbard/Ciura/Gonnet): Sorting Wiki and
  standard references
- Skew heap (Sleator-Tarjan), leftist heap (Crane), binomial heap (Vuillemin):
  standard data-structure references
- Comparison counting sort: Knuth, TAOCP vol. 3, §5.2


## Batch 5 — implemented and benchmarked (2026-09-13, 20 providers)

Fresh protocol: `node research/sort_analysis.js 100 250`, N=100, 250 trials;
`node research/audit_correctness.js` over 489 runs per provider. All 20 pass the
audit and finish with a correctly sorted `items` permutation. `Duplicates` means
the provider repeats an unordered pair in at least one benchmark trial.

| Algorithm | Family / source idea | Fidelity in this benchmark | Battles | Duplicates |
|---|---|---|---:|---:|
| Knuth Shellsort | Shell gaps (3^k−1)/2 (Knuth 1973) | Faithful Knuth increments and gapped insertion | 638.69 | YES |
| Papernov-Stasevich Shellsort | Shell gaps 2^k+1 (Papernov & Stasevich 1965) | Faithful 2^k+1 sequence | 658.44 | YES |
| Fibonacci Shellsort | Shell gaps Fibonacci numbers | Fibonacci increments | 632.23 | YES |
| Pairing Heap Sort | Meldable heap (Fredman et al. 1986) | Compare-link meld, two-pass delete-min | 745.90 | NO |
| Fibonacci Heap Sort | Meldable heap (Fredman & Tarjan 1987) | Circular root list, degree consolidation | 676.14 | YES |
| B-Tree Sort | B-tree (Bayer & McCreight 1972), t=3 | 2-3 tree insert + inorder | 544.06 | YES |
| AA Tree Sort | AA tree (Andersson 1993) | Skew/split rebalance, right-leaning only | 543.66 | YES |
| Scapegoat Tree Sort | Scapegoat tree (Galperin & Rivest 1993) | α=0.70 weight trigger, flatten & rebuild | 618.75 | YES |
| Brick Sorting Network | Odd-even transposition network (Knuth vol.3) | Fixed n-stage comparator list | 2611.54 | YES |
| Super Scalar Sample Sort | Sample sort (Sanders & Winkel 2004) | 32-sample, 3 splitters, binary-search classification, recursive buckets | 1006.21 | YES |
| IPS⁴o Sort | In-place super scalar samplesort (Axtmann et al. 2017) | 64-sample, 7 splitters, in-place classification modeled as stable buckets | 1370.36 | YES |
| SqrtSort | Block sort with √n buffer (Katajainen et al. 1996) | √n internal buffer, B-sized blocks, tournament merge | 793.64 | NO |
| Octosort | 8-way block sort (Logsort family, aphitorite 2021) | 32-item blocks, repeated 8-way tournament merges | 1023.36 | NO |
| Cubesort | Adaptive binary-search sort (Scandum 2018) | Tail-check + binary insertion into sorted prefix | 609.85 | YES |
| Gridsort | Grid hybrid of cubesort/quadsort (Scandum 2021) | √n blocks, per-block cubesort, tournament merge | 701.02 | YES |
| Slab Sort | Shuffled monotone sequences (Levcopoulos & Petersson 1990) | Greedy monotone slabs, reorient, tournament merge | 1117.81 | YES |
| Adaptive Heap Sort | Heapsort adapted for presorted files (Levcopoulos & Petersson 1989/1992) | Cartesian-tree build via monotone stack, frontier-heap extraction (Osc-optimal) | 1091.88 | YES |
| Cascade Merge Sort | 3-tape cascade merge (Knuth 5.4.2) | B=8 replacement-selection runs, cascade distribution, pairwise merges | 681.00 | YES |
| Oscillating Merge Sort | 3-tape oscillating merge (Knuth 5.4.3) | B=8 insertion runs, round-robin then oscillating pairwise merges | 600.28 | NO |
| 6-ary Heap Sort | d-ary heapsort, d=6 | Extends the repo's incremental-build d-ary base | 821.64 | YES |

The strongest new no-duplicate result is **Oscillating Merge Sort at 600.28**, followed by **SqrtSort at 793.64** and **Pairing Heap Sort at 745.90** — all still behind Ford-Johnson's 527.02 and the existing 8-way Merge's 547.73, so the production knee remains unchanged. The shell-gap variants (Knuth 638.69, Papernov-Stasevich 658.44, Fibonacci 632.23) bracket the existing Shell rows, while B-Tree (544.06) and AA Tree (543.66) are the closest new rows overall but repeat pairs. Adaptive Heap Sort (1091.88) and Slab Sort (1117.81) show that presortedness-adaptive heap/slab strategies pay their structural overhead on uniformly random input. Candidates that were found in the sweep but *not* implemented (already present or unportable as comparison battles): Hibbard (already registered), Weak Heap (already), Splay Tree Sort (already), Block sort's key-buffer extraction (moves only), IPS⁴o's branchless classification primitives, and key-inspecting sorts (radix/counting/flash/etc.), which stay excluded by the comparison-only rule.

## Batch 5 sources

- Shellsort gap families (Knuth 1973, Papernov & Stasevich 1965, Hibbard/Fibonacci variants): <https://en.wikipedia.org/wiki/Shellsort> and Knuth TAOCP vol.3 §6.2.1
- Pairing heap (Fredman, Sedgewick, Sleator & Tarjan 1986): <https://en.wikipedia.org/wiki/Pairing_heap>
- Fibonacci heap (Fredman & Tarjan 1987): <https://en.wikipedia.org/wiki/Fibonacci_heap>
- B-tree (Bayer & McCreight 1972): <https://en.wikipedia.org/wiki/B-tree>
- AA tree (Andersson 1993): <https://en.wikipedia.org/wiki/AA_tree>
- Scapegoat tree (Galperin & Rivest 1993): <https://en.wikipedia.org/wiki/Scapegoat_tree>
- Brick / odd-even transposition network: Knuth vol.3 Fig.44; <https://en.wikipedia.org/wiki/Odd%E2%80%93even_sort>
- Super Scalar Sample Sort (Sanders & Winkel 2004): <https://ae.iti.kit.edu/documents/people/sanders/papers/ssss.pdf>
- IPS⁴o (Axtmann et al. 2017): <https://arxiv.org/abs/1705.08768>
- SqrtSort / Octosort / Logsort family: <https://github.com/aphitorite/Logsort>
- Cubesort / Gridsort / Piposort family (Scandum): <https://github.com/scandum/piposort> and <https://github.com/scandum/cubesort>
- Slab Sort / Sorting Shuffled Monotone Sequences (Levcopoulos & Petersson 1990): <https://link.springer.com/chapter/10.1007/3-540-52846-6_88>
- Adaptive Heap Sort (Levcopoulos & Petersson 1989 WADS / 1992 J.Algorithms): <https://en.wikipedia.org/wiki/Adaptive_heap_sort> and <https://link.springer.com/content/pdf/10.1007/3-540-51542-9_41.pdf>
- Cascade & Oscillating Merge (Knuth vol.3 §§5.4.2–5.4.3): <https://en.wikipedia.org/wiki/Polyphase_merge_sort>
- 6-ary heap as d-ary generalization: standard heap literature (cpp-sort d-ary base)

## Batch 6 — implemented and benchmarked (2026-09-13, 17 providers)

Fresh protocol: `node research/sort_analysis.js 100 250`, N=100, 250 trials;
`node research/audit_correctness.js` over 489 runs per provider. All 17 pass the
audit and finish with a correctly sorted `items` permutation. `Duplicates` means
the provider repeats an unordered pair in at least one benchmark trial.

| Algorithm | Family / source idea | Fidelity in this benchmark | Battles | Duplicates |
|---|---|---|---:|---:|
| Wave Sort (W-Sort) | Dynamic-pivot in-place D&C (arXiv 2505.13552, 2025) | Faithful port of the v3 basic reference: up-wave growth, down-wave partition vs. sorted-region median, comparison-free block-swap re-layout; explicit task stack for the up/downwave recursion | 553.42 | NO |
| Co-ranking In-place Mergesort | In-place merging via co-ranking (arXiv 2509.24540, Siebert 2025) | Faithful: Co_rank binary-search-like descent (O(log n) comparisons), optimal juggling rotation, two recursive merges; top-down | 720.78 | YES |
| Bentley-McIlroy Quicksort | "Engineering a Sort Function" (Bentley & McIlroy 1993; musl qsort.c) | Faithful: n<7 adjacent-compare insertion, med3-of-med3 sampling (n/8 spread for n>40), fat three-way partition, vecswap on both ends, recurse-smaller/iterate-larger; swap_cnt==0 falls back to insertion as in the reference | 573.22 | YES |
| Shivers Sort (length-adaptive) | c-adaptive Shivers (Jugé et al., arXiv 1809.08411) | Same run-detection/merge base as the registered Shivers variants, with ℓ = floor(log2(len/c)) and c = n+1 | 570.34 | YES |
| Rouge Sort | Every-gap comb (Sorting Wiki Combsort page) | Faithful: one compare-exchange pass per gap n-1, n-2, …, 1 — O(n²) by design | 2474.23 | YES |
| Adaptive Binary Insertion | Neighbor-check fast path over binary insertion | One predecessor comparison before binary-searching each key into the sorted prefix | 610.25 | YES |
| ORLP25 Shellsort | Shell gaps A_k·A_{k+1}, A: 1,1,2, A_k=2A_{k-2}+1 | Faithful gap recurrence; gapped insertion base | 629.81 | YES |
| Sedgewick 1982 Shellsort | Shell gaps 4^k + 3·2^(k-1) + 1 (1982 paper) | Faithful 1982 sequence (distinct from the registered 1986 provider) | 721.74 | YES |
| Pardons 2009 Shellsort | Shell gaps floor(F_k^(1+√5)), F: 1,2,3,5,8,… | Faithful gap formula | 787.98 | YES |
| C16/3+1 Shellsort | aphitorite "16/3" family | h_k = ceil(16/3·h_{k-1}) + 1 | 768.42 | YES |
| Lee Improved Tokuda Shellsort | Lee's refinement of Tokuda (γ = 2.243609061420001) | h_k = ceil((γ^k−1)/(γ−1)) | 630.81 | YES |
| Tokuda Good Gaps Shellsort | "Tokuda's good gaps" (Sorting Wiki; OEIS A108870) | h_k = ceil(0.8·(2.25^k−1)); distinct from the registered Tokuda sequence | 631.88 | YES |
| Extended Ciura Shellsort | machoota's 2025 extension of Ciura's empirical gaps | 1,4,10,23,57,132,301,701,1504 then floor(2.22·h); only gaps < n affect a run of size n | 630.04 | YES |
| Pratt 5x8 Shellsort | machoota's 2026 "Pratt 5x8" family | All increments 5^p·8^q < n (the registered "Pratt Shellsort" is the 2^a·3^b family) | 651.98 | YES |
| Incerpi-Sedgewick Shellsort | Incerpi & Sedgewick (1985) gap sequence | Literature prefix 1,3,7,21,48,112,336,861,2289,5860 (only the first few gaps matter at N=100; the wiki's closed form was not fully reconciled) | 633.06 | YES |
| Frank-Lazarus Shellsort | Frank & Lazarus (1960) | Gaps 2·⌊n/2^(j+1)⌋ + 1, j = 1,2,… (51,25,13,7,3,1 at n=100) | 633.25 | YES |
| Split Ratio Shellsort | aphitorite split-ratio family | h_k = ceil(2.4(h+1))−1 while h < 167, then ceil(2.22972(h−1)) | 632.18 | YES |

The strongest new no-duplicate result is **Wave Sort at 553.42** — the best
new row overall and the only new no-duplicate provider — but it stays behind
Ford-Johnson (Quick) at 526.84 and the existing 8-way Merge at 546.97, so the
production knee is unchanged. Bentley-McIlroy (573.22) and length-adaptive
Shivers (570.34) land mid-pack among the established quick/merge rows
(Binary Cocktail 530.96, 8-way Merge 546.97, Vergesort 581.12, 3-way Powersort
584.35). Co-ranking In-place Mergesort (720.78) confirms the paper's
comparison overhead relative to the classic merge rows (~542) at N=100. The
eleven new gap families cluster tightly in 629–788: ORLP25 (629.81) is the
best new shell row, sitting between Gonnet (628.83) and Extended Ciura
(630.04), with Lee (630.81), Tokuda-good (631.88), Split Ratio (632.18),
Incerpi-Sedgewick (633.06) and Frank-Lazarus (633.25) all within ~3.5 battles
of that cluster, while Pratt 5x8 (651.98), Sedgewick 1982 (721.74), C16/3+1
(768.42) and Pardons 2009 (787.98) are the slower families. Rouge Sort
(2474.23) is, as expected, an O(n²) curiosity that costs ~4.7× Ford-Johnson.
Candidates found in this sweep but *not* implemented: C2.36, C2.36010 and
C2.14399+1 (three near-duplicate aphitorite C-family gap sequences that would
only re-shuffle the 700–780 cluster), Xu & Chick's "ordered set" sort
(arXiv 2607.27040 — randomized theoretical structure whose comparison pattern
is indistinguishable from the registered Binary Insertion in this model),
Leapfrog Sort and Odd-Even Comb (Sorting Wiki headers with no published
specification), Duality Sort (no source found in any catalog), Towersort
(an Android game), Spider Sort (zero web hits), Double Gnome (no results),
Cleaner Sort (does not sort), Block Tim/Pache/Kita/Kota/Log Merge (named
without implementations), Lazy-Heap/Hyper-Stooge (page titles without
content), α-merge/α-stack (not in arXiv 1809.08411), Boost spreadsort
(key-inspecting, excluded by the comparison-only rule), and Boost
flat_stable_sort (a spinsort derivative already covered by Spinsort).

## Batch 6 sources

- Wave Sort (W-Sort): <https://arxiv.org/abs/2505.13552> (v3, 2026-01-04; basic reference listing, Appendix A)
- Co-ranking in-place merging (Siebert 2025): <https://arxiv.org/abs/2509.24540>
- Bentley & McIlroy, "Engineering a Sort Function" (Software: Practice & Experience 23(11), 1993) — reference source as maintained in musl: <https://www.cs.cmu.edu/~410-f08/update/proj3/410kern/stdlib/qsort.c>
- c-adaptive Shivers Sort (Jugé et al. 2018, c = n+1): <https://arxiv.org/abs/1809.08411>
- Rouge Sort (every-gap comb): <https://sortingalgos.miraheze.org/wiki/Combsort>
- Adaptive Binary Insertion (predecessor check before binary insertion): <https://sortingalgos.miraheze.org/wiki/Binary_Insertion_Sort>
- Shellsort gap families (ORLP25, Sedgewick 1982, Pardons 2009, C16/3+1, Lee improved Tokuda, Tokuda good gaps, Extended Ciura, Pratt 5x8, Incerpi-Sedgewick 1985, Frank & Lazarus 1960, split ratio): <https://sortingalgos.miraheze.org/wiki/Shellsort>
- Frank & Lazarus (1960) "Shellsort: A sorting algorithm using generalized binary search": as listed on the Sorting Wiki Shellsort page above
- Tokuda good gaps: OEIS A108870 (via the Sorting Wiki Shellsort page)
- Xu & Chick (found, not implemented): <https://arxiv.org/abs/2607.27040>
- morwenn/cpp-sort develop tree re-checked (2026-09-13): sorter list identical to the 1.17.3 set already covered
- Rosetta Code comparison-sorts category re-checked (2026-09-13): all 47 pages already covered by the 188-row registry


## Batch 7 — implemented and benchmarked (2026-09-13, 4 providers)

Fresh protocol: `node research/sort_analysis.js 100 250`, **N=100, 250
trials, all 209 registered providers**. The independent audit was then run with
`node research/audit_correctness.js` over 489 deterministic runs per provider.
All four additions requested valid item ids and retained every item; the audit
reported no bad pairs, timeouts, or unsorted outputs. As elsewhere in this
file, `Duplicates` means that an unordered pair was requested more than once in
at least one trial.

| Algorithm | Family / source idea | Fidelity in this benchmark | Battles | Duplicates |
|---|---|---|---:|:---:|
| Multizip Sort | IJCAI 2024 anytime bottom-up multi-merge schedule | Comparison-level multizip schedule; same observable merge trace as the registered bottom-up merge at this profile | 559.43 | NO |
| Modified Bitonic Sort | Sorting Wiki modified bitonic merge network | Comparison-network provider with arbitrary-N sentinel padding | 761.55 | YES |
| Stable Cyclesort | Sorting Wiki stable cycle-sort variant | Distinct-item comparison port; stable equal-key bookkeeping is not observable with opaque human preferences | 648.09 | YES |
| Link Sort | Sorting Wiki adjacent compare-exchange sort | Faithful sorted-flag adjacent-pass state machine | 2555.86 | YES |

Multizip is the strongest new no-duplicate row, but it is not a new
comparison frontier: its comparison-level trace is the same as bottom-up merge
in this N=100 model and Ford-Johnson remains the production choice. Modified
Bitonic, Stable Cyclesort, and Link Sort all sort correctly but add no
production advantage. Stable Cyclesort's stability claim is intentionally
qualified because PreferenceRank items are opaque and normally distinct; tie
identity/order cannot be inferred from the human comparator.

### Batch-7 sources

- Caizergues, Durand & Mathieu, *Anytime Sorting Algorithms*, IJCAI 2024:
  <https://www.ijcai.org/proceedings/2024/0785> (multizip and Corsort)
- Sorting Wiki, modified bitonic sort and comparison-sort taxonomy:
  <https://sortingalgos.miraheze.org/wiki/Sorting_algorithm>
- Sorting Wiki, Link Sort:
  <https://sortingalgos.miraheze.org/wiki/Link_Sort>
- Sorting Wiki, Stable Cyclesort:
  <https://sortingalgos.miraheze.org/wiki/Stable_Cyclesort>


## Batch 2 planning record

The sections below are retained as the planning record for algorithms that were
not among the original 85 providers. Entries implemented in batch 2 or batch 3
are superseded by the live registry and the audit addenda.

Difficulty = the original estimated effort to write a correct state-machine
`Provider`.

## Tier 1 — high value, easy/medium to implement (~21)

### Sorting networks (fixed comparator lists — easiest providers of all)

| Algorithm | What it is | Why benchmark | Difficulty |
|---|---|---|---|
| Batcher's Odd-Even Mergesort | The 1964 fixed sorting network, O(n log²n) comparators; recursively merges odd/even subsequences + cleanup pass. **Distinct from** the repo's Odd-Even *transposition* sort. | Direct rival to Bitonic Sort (759 battles); fixed structure = reproducible pair stream. | Easy |
| Bose-Nelson network | Recursive sorting-network construction (Bose-Nelson problem); simple to generate for arbitrary n. | Another fixed-network data point; few-vs-many comparator tradeoff vs Batcher. | Easy |

### Run-adaptive mergesorts (the Timsort family beyond Timsort/Powersort)

| Algorithm | What it is | Why benchmark | Difficulty |
|---|---|---|---|
| Peeksort (Munro & Wild 2018) | Top-down "peeking" run-adaptive mergesort; optimal merge cost n·H+O(n). | Near-optimal policy; tests whether smarter run handling beats Ford-Johnson on random data. | Medium |
| Adaptive Shivers Sort (Auger et al. 2018) | Stable blend of Timsort + Shivers Sort; Timsort-like policy, optimal cost, "a dozen lines" diff from Timsort. | Same question as Peeksort, different policy; likely no-duplicate. | Medium |
| Shivers / α-Stack / α-Merge Sort | Sibling policies from the same papers (k-aware stack rules). | Cheap batch once one stack-policy harness exists. | Medium |

### Heapsorts (repo has 1 + a proxy — the family is under-covered)

| Algorithm | What it is | Why benchmark | Difficulty |
|---|---|---|---|
| Smoothsort (real, Dijkstra 1981) | Leonardo-heap heapsort; O(n) best case, adaptive. Repo only has "Heap Sort (Smooth Proxy)". | Honesty fix: replace/extend the proxy with the real algorithm. | Medium-Hard |
| Bottom-up Heapsort (Wegener) | Sift-down-to-leaf then back-up; fewer comparisons than classic heapsort on average. | Direct comparison-count rival to Heap Sort (715 battles). | Easy-Medium |
| Weak Heapsort (Dutton) | Relaxed heap with only n-1 extra bits; ~n·log n comparisons, few moves. | Distinct comparison profile in the same family. | Medium |

### Tree sorts (repo has only plain Tree Sort)

| Algorithm | What it is | Why benchmark | Difficulty |
|---|---|---|---|
| Splaysort (Moffat et al.) | Insert-all into a splay tree, inorder traversal; adaptive to inversions/runs. | The classic adaptive tree sort; random-data constant vs quicksort is the question. | Medium |
| Cartesian Tree Sort / Cartesort (Levcopoulos-Petersson) | Build min-Cartesian tree in O(n), extract via candidate priority queue. Adaptive; O(n) best. | Pairs with Splaysort as the two famous adaptive sorts. | Medium |
| Treap Sort | Insert with random priorities + rotations, inorder traversal. (≡ random-order BST insertion.) | Cheap; bridges Tree Sort and Quicksort (Random). | Easy-Medium |
| Skiplist Sort | Insert-all into a skip list (random levels), traverse level 0. | Fun distinct mechanics, same comparison class. | Easy-Medium |

### O(n²) classics still missing

| Algorithm | What it is | Why benchmark | Difficulty |
|---|---|---|---|
| Exchange Sort | Double loop that eagerly swaps A[i],A[j] whenever out of order (selection's eager twin). | Same positional count as Selection but different unique-battle profile — good methodology check. | Easy |
| Bingo Sort (Black) | Selection variant that sweeps max values to the end per distinct value; shines with duplicates. | Only duplicate-exploiting selection in the set. | Easy |
| Cocktail Shaker w/ shifting bounds | Cocktail sort that tracks last-swap index to shrink bounds each pass (Rosetta task). | Tests whether the bound trick saves *unique* battles, not just positional scans. | Easy |
| Library Sort (Bender et al. 2004/06) | Gapped insertion sort: binary-search positions in a sparse array, periodic rebalances. | Comparisons ≈ Binary Insertion (~531)? Could sit right at the knee — must measure. | Medium |

### External / tape sorts (a whole uncovered family)

| Algorithm | What it is | Why benchmark | Difficulty |
|---|---|---|---|
| Replacement Selection | Run generation with a selection buffer (avg run length 2× buffer; huge on presorted runs). | Adaptive run generation is alien to the current set. | Easy-Medium |
| Polyphase Merge Sort | Fibonacci-distributed k-tape merging of runs. | The classic external merge; pairs naturally with Replacement Selection (one "External Sort" provider or two). | Medium |

### Divide-and-conquer gaps

| Algorithm | What it is | Why benchmark | Difficulty |
|---|---|---|---|
| Sample Sort (Frazer & McKellar) | Sample → sort sample → splitters → binary-search distribution → recurse. | Comparison-based distribution sort; distinct from Bucket Sort's one-shot pivots. | Medium |
| Quicksort (Median-of-Medians / BFPRT) | Deterministic linear-time pivot selection, then standard partition. | Only deterministic-pivot quicksort missing (repo has random/middle/Mo3/ninther). Expect overhead vs Mo3. | Easy-Medium |
| Shear Sort | 2-D mesh sort: alternate snake-row and column phases (≤2·log n+1 phases) with odd-even transposition per line. | Completely different comparison geometry; great outlier data point. | Easy-Medium |

### Joke sorts (classic, distinct mechanics from existing bogo family)

| Algorithm | What it is | Why benchmark | Difficulty |
|---|---|---|---|
| Bozosort | If unsorted, swap two *random* elements (vs Bogosort's full shuffle). | The canonical bogo variant; will ride the harness caps like Bogosort. | Easy |
| Permutation Sort | Deterministically enumerate permutations (lexicographic/next-permutation) until sorted. | Deterministic bogo — same fate, no randomness. Rosetta task. | Easy |

## Tier 2 — medium value or harder (~18)

| Algorithm | What it is | Why / why Tier 2 |
|---|---|---|
| GrailSort / WikiSort (Block Sort) | In-place stable block merge sorts (Kim–Kutzner merging). | Real-world relevant, but very intricate providers; comparison counts likely 600–900. |
| Sqrtsort / Octosort / Blitsort / Logsort | Modern block-sort family (aphitorite, scandum): √N-aux, optimized Wiki, rotate-merge, in-place stable quicksort. | Same family as above; batch them if one gets built. |
| Quadsort / Piposort (scandum) | Branchless stable adaptive mergesort (quad swaps + parity merge); Piposort is the simplified portable version. | Implement Piposort first as the cheap entry to the family. |
| Fluxsort / Crumsort (scandum) | Stable / unstable quicksort↔quadsort hybrids; on Wikipedia's comparison table. | Follow-ups to Quadsort. |
| Cubesort | Adaptive sort (binary-search based); n−1 compares on sorted input; on Wikipedia's table. | Need to read the spec; mechanics less documented. |
| Gridsort (scandum) | Online cubesort/quadsort hybrid for very large arrays. | "Online" angle is interesting for streaming preference input, but complex. |
| Proportion Extend Sort (Chen 2001) / Symmetry Partition Sort (2007) | In-place quicksort improvement via bounded sorted-prefix partitioning. | Genuinely exotic-real, but intricate; papers needed. |
| Funnel Sort / Lazy Funnel Sort (Frigo et al.) | Cache-oblivious k-funnel merging. | Simplified provider ≈ √n-way merge — overlaps 3/4-way Merge; value is coverage, not novelty. |
| SplitSort / SlabSort (Levcopoulos-Petersson) | Adaptive sorts for presorted/shuffled-monotone inputs (in cpp-sort). | Papers needed; overlap with Splaysort/Cartesort story. |
| Less Bogo / Exchange Bogo / Bubble Bogo / Bovosort | Bogo family variants (fix prefix incrementally; random compare-swaps; pull-to-head). | Cheap batch with Bozosort, but all collapse onto the same capped frontier point. |

## Tier 3 — deliberately skipped

- **JortSort** — satire that just checks sortedness (≈ Miracle/Exit point, no signal).
- **AKS sorting network** — optimal asymptotically, astronomically impractical constants.
- **IPS⁴o / Super Scalar Sample Sort** — branchless/parallel engineering; comparison stream ≈ Sample Sort with unimplementable-as-provider micro-structure.
- **Key-needing sorts** — counting, radix, bead/gravity, spaghetti, flash, proxmap, spreadsort, burstsort, American flag, pigeonhole, postman's, interpolation, Topswops, tag sort (not comparison-distinct), topological sort (needs a DAG).
- **Micro-variants** — shell-gap sequences (Ciura/Tokuda/Sedgewick), comb shrink factors, AVL/RB-tree sort: diminishing returns, revisit only for a "variants" sweep.

## Sources

- Wikipedia comparison-sort table (Block, Smooth, Cubesort, Fluxsort, Crumsort, Library entries):
  <https://en.wikipedia.org/wiki/Sorting_algorithm>
- Rosetta Code sorting category (Permutation sort, Cocktail w/ shifting bounds, JortSort):
  <https://rosettacode.org/wiki/Category:Sorting_Algorithms>
- Batcher network construction + arbitrary-n code:
  <https://stackoverflow.com/questions/33320414/optimal-batcher-odd-even-merge-networks-for-sizes-different-than-2n>
- Bose-Nelson network generation:
  <https://stackoverflow.com/questions/19790522/very-fast-sorting-of-fixed-length-arrays-using-comparator-networks>
- Adaptive Shivers Sort paper + algorithm comparison table (Peeksort, α-Stack, Shivers):
  <https://arxiv.org/pdf/1809.08411>
- WikiSort (block merge sort): <https://github.com/desktopqa/WikiSort>
- GrailSort/Octosort/Sqrtsort/Blitsort/Logsort family: <https://github.com/aphitorite/Logsort>
- Quadsort + variants (blit/crum/flux/grid): <https://github.com/scandum/quadsort>
- Fluxsort + Piposort: <https://github.com/scandum/fluxsort>
- Crumsort vs Fluxsort: <https://www.libhunt.com/compare-crumsort-vs-fluxsort>
- Shearsort phases: <https://pages.cs.wisc.edu/~tvrdik/15/html/Section15.html>
- Splaysort: <https://handwiki.org/wiki/Splaysort>
- Cartesian tree sorting: <https://iq.opengenus.org/cartesian-tree-sorting/>
- SplitSort/SlabSort (cpp-sort wiki): <https://github.com/Morwenn/cpp-sort/wiki/sorters>
- Exchange vs Selection: <https://cs.stackexchange.com/questions/151297/number-of-inversions-found-in-selection-sort-vs-exchange-sort>
- Bingo sort (Wikipedia): <https://en.wikipedia.org/wiki/Selection_sort>
- Library sort paper: <https://www3.cs.stonybrook.edu/~bender/newpub/BenderFaMo06-librarysort.pdf>
- Polyphase merge + replacement selection: <http://profesores.elo.utfsm.cl/~agv/elo320/PLDS210/niemann/s_ext.htm>
- Proportion Extend Sort: <https://en.wikipedia.org/wiki/Proportion_extend_sort>
- Smoothsort/Weak/Bottom-up heapsort: <https://grokipedia.com/page/Heapsort>
- Funnel sort: <https://ac.informatik.uni-freiburg.de/lak_teaching/ss_08/homework/16_07_08_Cache-Blinde_Algorithmen.pdf>
- Sample sort: <https://ae.iti.kit.edu/documents/people/sanders/papers/ssss.pdf>
- Treaps: <https://courses.grainger.illinois.edu/cs473/sp2017/notes/03-treaps.pdf>
- Bozosort/Bovosort/Less-Bogo/Exchange-Bogo: <https://sortingalgos.miraheze.org/wiki/Bogosort>
- JortSort satire note: <https://rosettacode.org/wiki/JortSort>
