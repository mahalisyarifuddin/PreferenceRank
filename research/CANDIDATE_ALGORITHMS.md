# Candidate Sorting Algorithms for Future Benchmarks

Research sweep (2026-09-11) for algorithms **not** among the 85 already in
`research/sort_analysis.js`. Every candidate below is comparison-based and can be
implemented as a `Provider` (pairwise battle generator). Key-dependent sorts
(counting, radix, bead/gravity, flash, proxmap, spreadsort, burstsort, American
flag, pigeonhole, postman's, interpolation, Topswops) are excluded on principle:
there are no keys in PreferenceRank — see the counting-sort discussion.

Difficulty = estimated effort to write a correct state-machine `Provider`.

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
