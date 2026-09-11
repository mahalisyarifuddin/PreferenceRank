# Web Candidate and Implementation Log

This file records the comparison-sort web sweeps behind the benchmark. The
original 2026-09-11 sweep started from 85 providers and produced the 118-provider
batch-2 suite described later in this file. A third sweep on the same date
searched the wider Sorting Wiki taxonomy, current research papers, and reference
implementations from cpp-sort, scandum, Glidesort, GrailSort, and WikiSort. It
added **25 more providers**, bringing that suite to **143**. The 2026-09-12
VQSort addendum below brings the live registry to **144**.

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
