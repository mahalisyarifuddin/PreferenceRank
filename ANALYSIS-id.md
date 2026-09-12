# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis yang digunakan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan **168 provider pengurutan yang terdaftar**. Suite ini mencakup 25 algoritma dari ekspansi web ketiga, provider profil tetap **VQSort (model u64/AVX2)**, dan 24 algoritma dari ekspansi web keempat. VQSort sengaja diukur hanya pada tingkat perbandingan; hasil ini bukan tolok ukur throughput SIMD. Matriks sumber dan fidelitas tersedia di [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md), dengan rincian ketepatan di [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md). Algoritma yang meminta pasangan duplikat diidentifikasi dan dikeluarkan dari analisis Pareto-optimal agar pilihan produksi mencerminkan keputusan manusia yang unik.

### Metodologi Tolok Ukur
- **Nilai N:** 100
- **Uji coba:** 250 per algoritma.
- **Perintah pengujian:** `node research/sort_analysis.js 100 250`
- **Metrik:** rata-rata jumlah pertempuran unik dan rata-rata Kendall Tau terhadap kekuatan sebenarnya yang dibuat secara acak.
- **Catatan uji ulang (2026-09-03):** audit ketepatan atas seluruh 85 provider ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)) memperbaiki Intro Sort (orientasi perbandingan campuran), Tournament Sort (elemen terlemah terhapus), dan Hayate-Shiki (komparator penggabungan terbalik; Kendall Tau naik dari 0.8426 menjadi 1.0000). "Radix Sort" — yang bukan radix sort — diganti dengan **Binary Quicksort** yang setia, "Smooth Sort" diganti label menjadi **Heap Sort (Smooth Proxy)**, dan Silly Sort kini menjalankan rekursi silly yang sebenarnya. Baris keenam algoritma tersebut diukur ulang dengan protokol yang sama; baris lainnya dipertahankan dari run awal (setiap algoritma disimulasikan secara independen). Frontier Pareto dan titik lutut Ford-Johnson tidak berubah.
- **Catatan uji ulang (2026-09-11, batch 2):** ekspansi menjadi 118 provider (32 implementasi ditambah registrasi Bozo). Lihat adendum batch-2 yang dipertahankan di [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md) untuk daftar lengkap dan audit fidelitas.
- **Catatan uji ulang (2026-09-11, batch 3):** sapuan web luas lainnya menambahkan 25 provider: Stable Selection, Double Insertion, 3-Smooth Comb, tiga urutan gap Shell, empat sort keluarga heap ditambah Poplar, MEL, Twinsort, Spin, Weave Merge, QuickMergesort, 4-way Powersort, Loser-Tree Merge, GrailSort, WikiSort, Fluxsort, Crumsort, Glidesort, Blitsort, dan Optimized Pancake. Semua tambahan mengurutkan dengan benar pada 489/489 run audit diferensial. Algoritma modern yang gerakan branchless, tata letak cache, atau rotasinya tidak terlihat sebagai pertempuran diberi label eksplisit sebagai port/skeleton perbandingan dalam dokumen riset.
- **Catatan uji ulang (2026-09-12, VQSort):** menambahkan `VQSort (u64/AVX2 model)`. Provider menetapkan profil kunci 64-bit dan empat lane AVX2, lalu mengekspos sampler pivot enam chunk milik Highway, sorting network yang dipilih arsitektur secara tepat, keputusan lane-terhadap-pivot, rekursi, dan pengaman degenerat dari makalah sebagai pertempuran serial. Provider ini tidak dapat mereproduksi konkurensi SIMD, `CompressStore`, perilaku cache, atau throughput instruksi. VQSort lolos 489/489 run audit dan memperoleh 656,02 pertempuran, τ=1,0000, duplikasi YA.
- **Catatan uji ulang (2026-09-12, batch 4; tabel saat ini):** sapuan web keempat menambahkan **24** provider — Cocktail Bogo, Comparison Counting Sort, empat barisan celah Shellsort lagi (Original, Hibbard, Ciura, Gonnet), 5-ary Heap, 8-way Merge, QuickHeapsort, JSort, Drop-Merge Sort, Split Sort, Vergesort, Neatsort, 3-way Powersort, Pairwise Sorting Network, Shuffle Sort, Binary Cocktail, pengurutan Skew/Leftist/Binomial Heap, pengurutan AVL/Red-Black Tree, dan Triplet Merge-Insertion — lalu mengukur ulang seluruh **168** baris. Ke-24-nya lolos audit diferensial 489/489 (Cocktail Bogo dibatasi N ≤ 5 seperti baris bogo lainnya). Baris tanpa duplikasi terbaik adalah 8-way Merge Sort pada **547,73**, masih di bawah Ford-Johnson, sehingga frontier Pareto dan titik lutut produksi tidak berubah.

### Hasil (N=100)

| Algoritme | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|------------------------|-----------------------|-----------|----------------|
| Exit Sort | 0.00 | 0.0060 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0055 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | 0.0026 | TIDAK | Terdominasi |
| Sleep Sort | 0.00 | -0.0036 | TIDAK | Terdominasi |
| Quantum Bogo | 1.68 | -0.0045 | TIDAK | Terdominasi |
| Permutation Sort | 1.82 | -0.0013 | YA | Terdominasi |
| BogoBogoSort | 26.49 | 0.0067 | YA | Terdominasi |
| Thanos Sort | 99.00 | 0.5044 | YA | Terdominasi |
| Miracle Sort | 99.00 | 0.5033 | TIDAK | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3418 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.0291 | TIDAK | Terdominasi |
| Hater Sort | 188.10 | 0.5618 | YA | Terdominasi |
| Silly Sort | 200.97 | 0.1223 | YA | Terdominasi |
| Random Sort | 210.76 | 0.5532 | YA | Terdominasi |
| Budgeted Merge Sort | 520.00 | 0.9619 | TIDAK | Pareto-optimal |
| Ford-Johnson (Quick) | 527.02 | 1.0000 | TIDAK | **Titik pilihan produksi** |
| Binary Insertion | 530.51 | 1.0000 | TIDAK | Terdominasi |
| Binary Gnome | 530.60 | 1.0000 | TIDAK | Terdominasi |
| Binary Cocktail | 530.62 | 1.0000 | YA | Terdominasi |
| Recursive Binary Insertion | 530.99 | 1.0000 | TIDAK | Terdominasi |
| Timsort | 532.45 | 1.0000 | YA | Terdominasi |
| AVL Tree Sort | 538.12 | 1.0000 | YA | Terdominasi |
| Library Sort | 538.16 | 1.0000 | YA | Terdominasi |
| In-place Merge Sort | 541.60 | 1.0000 | TIDAK | Terdominasi |
| Merge Sort | 541.98 | 1.0000 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.06 | 1.0000 | TIDAK | Terdominasi |
| Red-Black Tree Sort | 544.32 | 1.0000 | YA | Terdominasi |
| 8-way Merge Sort | 547.73 | 1.0000 | TIDAK | Terdominasi |
| Powersort | 557.31 | 1.0000 | YA | Terdominasi |
| Parallel Merge Sort | 557.53 | 1.0000 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 557.99 | 1.0000 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.40 | 1.0000 | TIDAK | Terdominasi |
| Tournament Sort | 558.89 | 1.0000 | TIDAK | Terdominasi |
| Optimized Pancake | 563.38 | 1.0000 | YA | Terdominasi |
| Quicksort (Ninther) | 563.65 | 1.0000 | YA | Terdominasi |
| 3-way Merge Sort | 567.52 | 1.0000 | TIDAK | Terdominasi |
| Quadsort | 570.18 | 1.0000 | YA | Terdominasi |
| 4-way Powersort | 570.57 | 1.0000 | YA | Terdominasi |
| Adaptive Shivers | 573.83 | 1.0000 | YA | Terdominasi |
| Shivers Sort | 574.37 | 1.0000 | YA | Terdominasi |
| Natural Merge Sort | 574.39 | 1.0000 | YA | Terdominasi |
| Augmented Shivers | 574.58 | 1.0000 | YA | Terdominasi |
| QuickMergesort | 576.22 | 1.0000 | YA | Terdominasi |
| Vergesort | 579.73 | 1.0000 | YA | Terdominasi |
| Weak Heap | 580.16 | 1.0000 | YA | Terdominasi |
| Funnel Sort | 581.09 | 1.0000 | TIDAK | Terdominasi |
| Slowsort | 583.10 | 0.9450 | YA | Terdominasi |
| GrailSort | 584.61 | 1.0000 | TIDAK | Terdominasi |
| 3-way Powersort | 584.67 | 1.0000 | YA | Terdominasi |
| Triplet Merge-Insertion | 592.18 | 1.0000 | YA | Terdominasi |
| Binomial Heap Sort | 593.74 | 1.0000 | YA | Terdominasi |
| Twinsort | 594.60 | 1.0000 | YA | Terdominasi |
| QuickHeapsort | 595.52 | 1.0000 | YA | Terdominasi |
| Bottom-up Heap | 599.16 | 1.0000 | YA | Terdominasi |
| Piposort | 600.13 | 1.0000 | YA | Terdominasi |
| Fluxsort | 600.40 | 1.0000 | YA | Terdominasi |
| Loser-Tree Merge | 601.10 | 1.0000 | TIDAK | Terdominasi |
| Triple-Pivot Quicksort | 602.54 | 1.0000 | YA | Terdominasi |
| Binary Patience | 612.56 | 1.0000 | YA | Terdominasi |
| WikiSort | 613.49 | 1.0000 | TIDAK | Terdominasi |
| Batcher Odd-Even | 623.74 | 1.0000 | YA | Terdominasi |
| Shellsort | 630.01 | 1.0000 | YA | Terdominasi |
| Ciura Shellsort | 630.29 | 1.0000 | YA | Terdominasi |
| Gonnet Shellsort | 630.53 | 1.0000 | YA | Terdominasi |
| Recursive Shellsort | 631.26 | 1.0000 | YA | Terdominasi |
| Tokuda Shellsort | 632.63 | 1.0000 | YA | Terdominasi |
| Sample Sort | 637.66 | 1.0000 | YA | Terdominasi |
| Glidesort | 638.55 | 1.0000 | YA | Terdominasi |
| Hibbard Shellsort | 639.28 | 1.0000 | YA | Terdominasi |
| Quicksort (LTR) | 640.79 | 1.0000 | TIDAK | Terdominasi |
| Stable Quicksort | 642.34 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (RTL) | 643.11 | 1.0000 | TIDAK | Terdominasi |
| Tree Sort | 645.64 | 1.0000 | TIDAK | Terdominasi |
| Cartesian Tree | 645.66 | 1.0000 | YA | Terdominasi |
| Quicksort (Hoare) | 646.10 | 1.0000 | YA | Terdominasi |
| Dual-Pivot Quicksort | 647.08 | 1.0000 | TIDAK | Terdominasi |
| Comparison Counting Sort | 648.02 | 1.0000 | YA | Terdominasi |
| Quicksort (Random) | 648.86 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Middle) | 648.96 | 1.0000 | TIDAK | Terdominasi |
| Original Shell Sort | 649.23 | 1.0000 | YA | Terdominasi |
| 3-Way Quicksort | 649.78 | 1.0000 | TIDAK | Terdominasi |
| Treap Sort | 650.80 | 1.0000 | TIDAK | Terdominasi |
| Parallel Quicksort | 651.88 | 1.0000 | TIDAK | Terdominasi |
| Binary Quicksort | 651.96 | 1.0000 | TIDAK | Terdominasi |
| VQSort (u64/AVX2 model) | 655.74 | 1.0000 | YA | Terdominasi |
| Cycle Sort | 656.43 | 1.0000 | YA | Terdominasi |
| Sedgewick Shellsort | 659.48 | 1.0000 | YA | Terdominasi |
| Splay Sort | 667.70 | 1.0000 | TIDAK | Terdominasi |
| Binary Shell | 671.32 | 1.0000 | YA | Terdominasi |
| Quicksort (Mo3) | 671.85 | 1.0000 | YA | Terdominasi |
| BFPRT Quicksort | 673.24 | 1.0000 | YA | Terdominasi |
| Circle Sort | 678.84 | 1.0000 | YA | Terdominasi |
| Skiplist Sort | 679.20 | 1.0000 | YA | Terdominasi |
| Polyphase Merge | 681.93 | 1.0000 | YA | Terdominasi |
| Replacement Selection | 682.98 | 1.0000 | YA | Terdominasi |
| Out-of-place Heap | 686.61 | 1.0000 | YA | Terdominasi |
| Stooge Sort | 688.93 | 1.0000 | YA | Terdominasi |
| Bose-Nelson | 689.12 | 1.0000 | YA | Terdominasi |
| Ternary Heap | 695.30 | 1.0000 | YA | Terdominasi |
| Cocktail Bogo | 695.88 | 1.0000 | YA | Terdominasi |
| PESort | 699.49 | 1.0000 | YA | Terdominasi |
| Weave Merge | 701.24 | 1.0000 | YA | Terdominasi |
| Pairwise Sorting Network | 711.54 | 1.0000 | YA | Terdominasi |
| Quaternary Heap | 712.30 | 1.0000 | YA | Terdominasi |
| Intro Sort | 714.68 | 1.0000 | TIDAK | Terdominasi |
| Heap Sort (Smooth Proxy) | 715.13 | 1.0000 | YA | Terdominasi |
| Blitsort | 715.16 | 1.0000 | YA | Terdominasi |
| Heap Sort | 716.02 | 1.0000 | YA | Terdominasi |
| Rotation Merge Sort | 717.39 | 1.0000 | TIDAK | Terdominasi |
| Peeksort | 717.64 | 1.0000 | YA | Terdominasi |
| Comb Sort | 717.83 | 1.0000 | YA | Terdominasi |
| Recursive Comb Sort | 722.58 | 1.0000 | YA | Terdominasi |
| BlockQuicksort | 725.74 | 1.0000 | TIDAK | Terdominasi |
| Neatsort | 732.82 | 1.0000 | YA | Terdominasi |
| PDQSort | 734.01 | 1.0000 | YA | Terdominasi |
| Min-Max Heap | 739.54 | 1.0000 | YA | Terdominasi |
| Crumsort | 740.36 | 1.0000 | YA | Terdominasi |
| Drop-Merge Sort | 758.84 | 1.0000 | YA | Terdominasi |
| Poplar Sort | 762.45 | 1.0000 | YA | Terdominasi |
| Bitonic Sort | 763.48 | 1.0000 | YA | Terdominasi |
| Split Sort | 764.63 | 1.0000 | YA | Terdominasi |
| Smoothsort | 771.33 | 1.0000 | YA | Terdominasi |
| 5-ary Heap Sort | 774.25 | 1.0000 | YA | Terdominasi |
| Bucket Sort | 776.21 | 1.0000 | TIDAK | Terdominasi |
| JSort | 780.07 | 1.0000 | YA | Terdominasi |
| Leftist Heap Sort | 788.74 | 1.0000 | TIDAK | Terdominasi |
| Binary Merge | 788.84 | 1.0000 | TIDAK | Terdominasi |
| Bozo Sort | 790.44 | 1.0000 | YA | Terdominasi |
| Bovo Sort | 802.00 | 1.0000 | YA | Terdominasi |
| Shear Sort | 803.64 | 1.0000 | YA | Terdominasi |
| Skew Heap Sort | 808.02 | 1.0000 | TIDAK | Terdominasi |
| Bogosort | 808.42 | 1.0000 | YA | Terdominasi |
| Full Rank | 811.78 | 1.0000 | TIDAK | Terdominasi |
| Exchange Bogo | 811.83 | 1.0000 | YA | Terdominasi |
| 3-Smooth Comb | 829.10 | 1.0000 | YA | Terdominasi |
| Pratt Shellsort | 829.47 | 1.0000 | YA | Terdominasi |
| Binary Bottom-up Merge | 839.92 | 1.0000 | TIDAK | Terdominasi |
| Spin Sort | 877.79 | 1.0000 | TIDAK | Terdominasi |
| Less Bogo | 880.29 | 1.0000 | YA | Terdominasi |
| Patience Sort | 1012.12 | 1.0000 | YA | Terdominasi |
| Hayate-Shiki | 1027.34 | 1.0000 | YA | Terdominasi |
| Strand Sort | 1122.68 | 1.0000 | YA | Terdominasi |
| MEL Sort | 1175.63 | 1.0000 | YA | Terdominasi |
| Pancake Sort | 1250.24 | 1.0000 | YA | Terdominasi |
| Double Insertion | 1782.82 | 1.0000 | YA | Terdominasi |
| Cocktail Selection | 2119.18 | 1.0000 | YA | Terdominasi |
| Selection Sort | 2205.78 | 1.0000 | YA | Terdominasi |
| Bingo Sort | 2221.52 | 1.0000 | YA | Terdominasi |
| Recursive Selection | 2223.11 | 1.0000 | YA | Terdominasi |
| Double Selection | 2345.37 | 1.0000 | YA | Terdominasi |
| Recursive Double Selection | 2345.88 | 1.0000 | YA | Terdominasi |
| I Can't Believe It Can Sort | 2553.69 | 1.0000 | YA | Terdominasi |
| Insertion Sort | 2558.62 | 1.0000 | TIDAK | Terdominasi |
| Gnome Sort | 2561.13 | 1.0000 | YA | Terdominasi |
| Stable Selection | 2565.34 | 1.0000 | YA | Terdominasi |
| Shuffle Sort | 2566.38 | 1.0000 | YA | Terdominasi |
| Bubble Sort | 2567.90 | 1.0000 | YA | Terdominasi |
| Exchange Sort | 2569.05 | 1.0000 | YA | Terdominasi |
| Cocktail Shaker | 2570.14 | 1.0000 | YA | Terdominasi |
| Recursive Insertion | 2570.79 | 1.0000 | TIDAK | Terdominasi |
| Recursive Cocktail | 2583.15 | 1.0000 | YA | Terdominasi |
| Recursive Gnome | 2586.05 | 1.0000 | YA | Terdominasi |
| Cocktail Bounds | 2586.23 | 1.0000 | YA | Terdominasi |
| Recursive Bubble | 2597.45 | 1.0000 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2602.19 | 1.0000 | YA | Terdominasi |
| Odd-Even Sort | 2617.22 | 1.0000 | YA | Terdominasi |
| Odd-Even Bogo | 2622.77 | 1.0000 | YA | Terdominasi |
| Bubble Bogo | 2623.92 | 1.0000 | YA | Terdominasi |

### Interpretasi ekspansi web dan adendum VQSort

Seluruh 25 provider batch 3 dan tambahan VQSort mengurutkan dengan benar dan mencapai τ=1,0000. Biaya perbandingannya mencakup rentang yang luas:

- **Penantang baru terdekat.** Optimized Pancake adalah tambahan batch 3 dengan pertempuran terendah pada **562,74**, diikuti 4-way Powersort (**569,20**) dan QuickMergesort (**579,34**); ketiganya mengulang sedikitnya satu pasangan tak berurutan. Skeleton perbandingan GrailSort merupakan baris baru tanpa duplikasi terbaik pada **585,11**, masih 58,17 pertempuran di belakang Ford-Johnson.
- **Hibrida modern dan block/external merge.** Twinsort (**593,20**), Fluxsort (**595,77**), Loser-Tree Merge (**600,69**, tanpa duplikasi), WikiSort (**614,78**, dengan duplikasi), Glidesort (**638,73**), Blitsort (**720,38**), dan Crumsort (**739,52**) menunjukkan bahwa rekayasa untuk lokalitas cache, operasi branchless, stabilitas, dan perpindahan data tidak otomatis meminimalkan perbandingan manusia. Baris Grail, Wiki, dan Glide didokumentasikan secara eksplisit sebagai pengukuran skeleton/konfigurasi tingkat perbandingan, bukan klaim kecepatan CPU tentang library produksinya.
- **Keluarga heap dan gap.** Out-of-place Heap (**686,58**) memimpin heap baru, di depan Ternary (**696,26**), Quaternary (**714,11**), Min-Max (**740,66**), dan Poplar (**760,14**). Tokuda adalah urutan Shell tambahan terkuat pada **632,70**; Sedgewick mencapai **659,90**, sedangkan 3-Smooth Comb (**827,94**) dan Pratt Shellsort (**831,47**) berdekatan meskipun menggunakan gap yang sama dengan jenis pass berbeda.
- **Konstruksi khusus.** Weave Merge memakai **698,86** pertempuran, Spin Sort memakai **875,36** tanpa duplikasi, MEL Sort membayar **1184,09** untuk encroaching list pada input acak, Double Insertion memakai **1780,33**, dan Stable Selection masuk kelompok kuadratik pada **2580,41**.
- **Profil tetap VQSort.** Model perbandingan u64/AVX2 menggunakan **656,02** pertempuran unik dan mengulang pasangan. Baris ini mencerminkan kerja komparator yang diserialkan, bukan kecepatan SIMD yang menjadi keunggulan utama VQSort: empat perbandingan lane yang berjalan serentak di perangkat keras menjadi empat keputusan manusia potensial di sini, sedangkan optimasi pengemasan vektor dan memori tidak menambah pertempuran.
- **Batch 4 (2026-09-12).** Ke-24 provider baru semuanya mencapai τ=1,0000. Baris baru terdekat berasal dari keluarga pencarian biner/pohon — Binary Cocktail (**530,62**, duplikasi), AVL Tree Sort (**538,12**, duplikasi), dan Red-Black Tree Sort (**544,32**, duplikasi) — diikuti **8-way Merge Sort pada 547,73 tanpa duplikasi**, hasil tanpa-duplikasi terbaik dan satu-satunya varian merge batch 4 yang berada dalam ~20 pertempuran dari Ford-Johnson. Vergesort (**579,73**), 3-way Powersort (**584,67**), Triplet Merge-Insertion (**592,18**), Binomial Heap Sort (**593,74**), dan QuickHeapsort (**595,52**) berada di klaster padat n·log n. Empat barisan Shell baru (Ciura **630,29**, Gonnet **630,53**, Hibbard **639,28**, Original **649,23**) mengapit baris Shellsort yang sudah ada. Baris adaptif Drop-Merge (**758,84**), Split (**764,63**), Neatsort (**732,82**), dan Vergesort menunjukkan bahwa algoritme adaptif-presorted membayar biaya deteksi run pada input acak seragam. Skew (**808,02**) dan Leftist (**788,74**) heap sort adalah satu-satunya baris batch-4 tanpa duplikasi lainnya, sedangkan pra-pass n/2 Shuffle Sort mendorongnya ke klaster kuadratik pada **2566,38**. Comparison Counting Sort (**648,02**) dan Pairwise Sorting Network (**711,54**) berada persis seperti prediksi jumlah perbandingan Θ(n²) dan Θ(n log² n)-nya.

Matriks implementasi/sumber/fidelitas lengkap tersedia di [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md). Output tolok ukur mentah tetap berada di `results.txt`; `research/audit_results.txt` secara independen mencatat terminasi, validitas pasangan, keterurutan, orientasi, dan perilaku duplikasi.

### Mengapa Ford-Johnson tetap menjadi Titik Lutut Produksi

"Peringkat Cepat" adalah **pengurutan merge-insertion Ford–Johnson** (Knuth, *TAOCP* vol. 3, §5.3.1) — algoritma klasik yang dirancang khusus untuk meminimalkan jumlah perbandingan, yang persis merupakan mata uang yang dioptimalkan PreferenceRank: pertempuran manusia adalah satu-satunya biaya nyata, sedangkan perpindahan item gratis. Dominasinya di sini bersifat struktural, bukan kebetulan empiris dari satu run 250 percobaan.

**Ia bekerja pada batas bawah informasi-teoretis.** Mengurutkan *n* item bernilai log₂(*n*!) bit, karena ada *n*! urutan yang mungkin dan setiap perbandingan berpasangan mengungkapkan paling banyak satu bit. Tidak ada algoritma — dengan atau tanpa jalan pintas transitif — yang dapat mengurutkan 100 item secara penuh dalam kurang dari ⌈log₂ 100!⌉ = **525** pertempuran. Kasus terburuk Ford–Johnson adalah S(100) = Σ ⌈log₂(3j/4)⌉ = **534**, hanya 1,7% di atas batas bawah, dan rata-rata terukurnya pada input acak adalah **527,02** — sekitar dua pertempuran, atau 0,4%, di atas minimum absolut. Setiap pertempuran mengonversi pada dasarnya satu bit penuh informasi urutan.

**Mekanismenya: tidak ada perbandingan yang terbuang.** Dua gagasan melakukan semua pekerjaan:

- **Eliminasi berpasangan.** ⌊n/2⌋ pertempuran memasangkan elemen-elemen. Hanya para pemenang yang masuk ke pengurutan rekursif "rantai utama"; seorang pecundang tidak pernah bertanding melawan pecundang lain, karena ia hanya dapat diperingkatkan terhadap elemen-elemen yang berada *sebelum* pemenangnya sendiri. Elemen yang harus diperiksa berulang kali dengan demikian terbagi dua, dan urutan para pecundang dipulihkan murni dengan menempatkan masing-masing relatif terhadap rantai yang sudah terurut.
- **Penyisipan kembali berurut Jacobsthal ke dalam jendela berukuran tepat.** Para pecundang disisipkan kembali dalam kelompok yang diindeks oleh bilangan Jacobsthal **1, 3, 5, 11, 21, 43, …** — rekurensi `jA = 1, jB = 3` milik provider secara harfiah adalah `jB ← jB + 2·jA`. Urutan ini menjaga setiap jendela pencarian biner tetap sepanjang tepat **2^k − 1** elemen, ukuran di mana setiap perbandingan menjadi pemecah 50/50 sempurna dari kandidat yang tersisa. Sebuah perbandingan tidak pernah dipakai untuk menurunkan ulang relasi yang sudah diketahui algoritma.

Gabungan keduanya menghasilkan total kasus terburuk S(n) = n·log₂ n − (3 − log₂ 3)·n + O(log n) ≈ n·log₂ n − **1,415 n**, berhadapan dengan batas informasi n·log₂ n − 1,443 n — pemborosan hanya ≈ 0,028 n perbandingan. (Sebagai skala, merge-insertion mencapai jumlah perbandingan *minimum yang terbukti* untuk setiap n ≤ 15; pada n = 15 ia butuh 42, di mana bahkan batas ⌈log₂ 15!⌉ = 41 tidak dapat dicapai.)

**Mengapa tetangga-tetangganya kalah pada n = 100.** Algoritma lain di rentang jumlah pertempuran yang sama tertinggal karena alasan informasi-teoretis, bukan noise:

- **Binary insertion** memiliki kasus terburuk Σ ⌈log₂(j+1)⌉ = **573** — identik dengan top-down merge sort — 39 pertempuran di atas 534 milik Ford–Johnson. Rata-rata input acaknya (530,51) hanya *terlihat* dekat karena kunci acak membuat pencarian binernya berhenti lebih awal; ia tidak punya eliminasi berpasangan maupun penentuan ukuran jendela untuk melindungi kasus terburuknya.
- **Merge sort** membayar suku linear yang lebih lemah n·log₂ n − n: merge 8-arah (547,73), merge (541,98), dan merge 4-arah (543,06) semuanya mengembalikan ≈0,415 n perbandingan yang dihemat eliminasi berpasangan Ford–Johnson, dan pass merge ⌈log₂ n⌉-nya membandingkan lintas run yang urutan internalnya sudah ditetapkan oleh rekursi.
- **Heapsort dan quicksort** secara asimtotik lebih buruk lagi (kira-kira 2 n·log₂ n dan ≈1,39 n·log₂ n tanpa suku linear negatif pengimbang), sehingga tidak pernah menjadi pesaing pada sumbu ini.

**Titik lutut adalah konsekuensi batas bawah, bukan konsekuensi tabel.** Budgeted Merge Sort "menang" pada jumlah pertempuran mentah (520,00) tetapi duduk *di bawah* batas bawah 525 bit, sehingga secara informasi-teoretis ia tidak mampu menyandikan urutan lengkap — itulah sebabnya ia mengukur τ = 0,9619, bukan 1,0000. Ford–Johnson adalah metode frontier termurah yang benar-benar mencapai batas bawah dan karenanya dapat memulihkan *seluruh* urutan: 527 pertempuran melawan minimum keras 525 pertempuran, tanpa pertanyaan duplikat. Itulah mengapa ia menjadi titik lutut produksi — dan mengapa tak ada sapuan web lanjutan yang menggusurnya.

`node research/pareto_analysis.js` menghitung ulang frontier tanpa duplikasi dari `results.txt`. Run ini memuat Sleep Sort, Miracle Sort, Budgeted Merge Sort, dan Ford-Johnson. Titik joke sort di bawah 100 pertempuran memiliki Tau mendekati nol dan keanggotaannya berubah akibat noise acak; semuanya bukan metode pemeringkatan yang layak. Frontier yang bermakna tetap **Budgeted Merge Sort → Ford-Johnson**.

#### Batasan "Tanpa Duplikasi"

PreferenceRank memprioritaskan efisiensi pengguna dengan mengecualikan algoritma apa pun yang menghasilkan perbandingan duplikat. Banyak algoritma berkinerja tinggi (Timsort, Quicksort, Shellsort) dioptimalkan untuk pola akses memori komputer, bukan untuk meminimalkan keputusan manusia yang unik. Ford-Johnson adalah algoritma "Murni Unik", memastikan setiap pertempuran memberikan data segar ke model penilaian.

#### Kemenangan Bayangan dan Penutupan Transitif

Efisiensi perbandingan Ford–Johnson adalah milik algoritma itu sendiri (di atas). Peringkat Cepat melapisi **penutupan transitif bayangan** di atasnya: setiap kali hasil pertempuran secara transitif menyiratkan relasi menang/kalah lebih lanjut, relasi tersebut dicatat sebagai kemenangan tersimpul tanpa bertanya kepada pengguna, sehingga setiap pertempuran yang dijawab menyumbang bukti ekstra bagi kecocokan Bradley–Terry. Penutupan ini adalah akselerator lapisan penilaian — ia tidak pernah mengubah pasangan mana yang diminta Ford–Johnson (algoritma ini sudah menghindari pasangan duplikat atau yang tersirat); ia hanya membuat setiap pertempuran yang dijawab dihitung lebih banyak dalam estimasi peringkat.

Bagian berikut merinci trade-off antara vanilla merge sort, basic in-place merge sort, dan varian block merge sort.

### Penggunaan Memori

* **Vanilla Merge Sort:** Memerlukan ruang tambahan O(n). Ini mengalokasikan array scratchpad sekunder dengan ukuran yang sama dengan input untuk menangani pencampuran data.
* **In-Place Merge Sort:** Memerlukan ruang tambahan O(1) untuk varian iteratif, atau O(log n) untuk versi rekursif untuk mengelola tumpukan panggilan. Tidak ada buffer data sekunder yang dihasilkan.

### Kompleksitas Waktu dan Performa

* **Vanilla Merge Sort:** Menjamin kompleksitas waktu O(n log n) yang ketat di kasus terbaik, terburuk, dan rata-rata. Ini cepat dalam praktiknya karena elemen disalin secara berurutan, yang memaksimalkan efisiensi cache CPU.
* **In-Place Merge Sort:** Seringkali mengalami penurunan kecepatan. Implementasi dasar turun ke waktu O(n^2) karena pergeseran elemen internal yang sering (mirip dengan mekanika insertion sort). Penggabungan in-place berbasis rotasi (seperti `Rotation Merge Sort`) mencapai O(n log^2 n) tetapi berjalan jauh lebih lambat karena overhead swap pointer yang intens dan lokalitas cache CPU yang buruk. Varian block merge sort yang sangat dioptimalkan mencapai O(n log n) tetapi sangat kompleks untuk diimplementasikan.

### Stabilitas Algoritma

* **Vanilla Merge Sort:** Inheren stabil. Secara alami mempertahankan urutan relatif asli dari elemen duplikat karena menggabungkan dari kiri ke kanan dari array yang berbeda.
* **In-Place Merge Sort:** Seringkali tidak stabil. Untuk menghindari alokasi memori, sebagian besar versi harus memindahkan elemen melalui rotasi data yang kompleks atau swap internal, yang biasanya merusak urutan relatif dari kunci yang identik.
* **Block Merge Sort:** Varian yang sangat kompleks yang mencapai pengurutan O(n log n) yang stabil dengan ruang tambahan O(1) dengan menggunakan buffer internal yang diekstraksi dari data itu sendiri.

### Perbandingan Struktural

| Fitur | Vanilla Merge Sort | In-Place (Rotasi) | Block Merge Sort |
| :--- | :--- | :--- | :--- |
| Kompleksitas Waktu | O(n log n) | O(n log^2 n) | O(n log n) |
| Ruang Tambahan | O(n) | O(1) atau O(log n) | O(1) |
| Stabilitas | Stabil | Tidak Stabil | Stabil |
| Kompleksitas Implementasi | Sederhana | Sedang | Sangat Tinggi |

### Regresi Estimasi Jumlah Pertempuran
Untuk Ford-Johnson (titik lutut produksi):
- **Formula:** Pertempuran Unik ~ N * log2(N) - 1.408 * N + 3
- Untuk N=100, ini memprediksi 527 pertempuran (sesuai rata-rata simulasi).

---

## 3. Analisis Algoritma Pencarian

Meskipun PreferenceRank berfokus pada pemeringkatan, algoritma pengurutan yang mendasarinya sering kali menggunakan teknik pencarian untuk menempatkan item. Kami membandingkan Pencarian Linear (Linear Search) dan Pencarian Biner (Binary Search) untuk mengukur efisiensinya dalam hal perbandingan unik ("pertempuran").

### Hasil (Rata-rata Pertempuran)
| N | Pencarian Linear | Pencarian Biner | Keuntungan Efisiensi |
|---|---|---|---|
| 10 | 5.51 | 2.89 | ~47% |
| 100 | 50.24 | 5.80 | ~88% |
| 1000 | 499.94 | 8.99 | ~98% |

### Analisis
Pencarian biner menunjukkan efisiensi logaritmik (O(log N)), yang secara drastis mengurangi jumlah perbandingan seiring bertambahnya ukuran daftar. Efisiensi ini tercermin langsung dalam kinerja pengurutan; misalnya, **Binary Insertion Sort** (~531 pertempuran pada N=100) secara signifikan mengungguli **Insertion Sort** standar (~2547 pertempuran pada N=100) dengan memanfaatkan pencarian biner untuk penempatan elemen.

---

## 4. Trade-off Augmentasi Biner

Augmentasi biner melibatkan penggantian pemindaian linear (O(N)) dengan pencarian biner ($O(\log N)$) selama fase penyisipan atau penggabungan.

- **Skenario Kemenangan**: Algoritma seperti **Gnome Sort** dan **Shellsort** melihat peningkatan efisiensi yang dramatis (misalnya, Gnome Sort turun dari ~2566 ke ~531 pertempuran) karena mereka beralih dari kompleksitas perbandingan $O(N^2)$ ke $O(N \log N)$.
- **Skenario Kekalahan**: Untuk algoritma yang sudah efisien seperti **Merge Sort**, augmentasi biner justru meningkatkan jumlah total pertempuran unik. Meskipun pencarian biner meminimalkan perbandingan untuk penyisipan satu elemen, penggabungan linear Merge Sort standar sudah optimal ($O(N)$ perbandingan per level) karena memanfaatkan sifat terurut dari kedua bagian secara bersamaan. Augmentasi biner memaksa $O(\log N)$ perbandingan per elemen bahkan ketika satu perbandingan linear sudah cukup.

---

## 5. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~43% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).

## 6. Stabilitas Tolok Ukur dan Optimasi Uji Coba

Untuk memastikan keandalan peringkat kami, kami menganalisis dampak jumlah uji coba terhadap stabilitas tolok ukur. Jumlah uji coba optimal diidentifikasi sebagai **200** menggunakan analisis titik lutut skala log dari kesalahan standar rata-rata (SEM).

```
Trials	Vanilla_Tau	Vanilla_SEM	InPlace_Tau	InPlace_SEM	Mean_Diff	SEM_Diff	Total_SEM
50	0.90587	0.00165	0.90587	0.00165	0.000000	0.000000	0.003295
100	0.90251	0.00123	0.90251	0.00123	0.000000	0.000000	0.002466
150	0.90353	0.00092	0.90353	0.00092	0.000000	0.000000	0.001846
200	0.90395	0.00091	0.90395	0.00091	0.000000	0.000000	0.001820
250	0.90384	0.00078	0.90384	0.00078	0.000000	0.000000	0.001559
300	0.90461	0.00064	0.90461	0.00064	0.000000	0.000000	0.001275
350	0.90414	0.00067	0.90414	0.00067	0.000000	0.000000	0.001344
400	0.90346	0.00059	0.90346	0.00059	0.000000	0.000000	0.001188
450	0.90284	0.00054	0.90284	0.00054	0.000000	0.000000	0.001071
500	0.90409	0.00053	0.90409	0.00053	0.000000	0.000000	0.001066
550	0.90418	0.00051	0.90418	0.00051	0.000000	0.000000	0.001014
600	0.90382	0.00051	0.90382	0.00051	0.000000	0.000000	0.001024
650	0.90386	0.00047	0.90386	0.00047	0.000000	0.000000	0.000937
700	0.90370	0.00045	0.90370	0.00045	0.000000	0.000000	0.000903
750	0.90388	0.00043	0.90388	0.00043	0.000000	0.000000	0.000850
800	0.90396	0.00041	0.90396	0.00041	0.000000	0.000000	0.000825
850	0.90455	0.00040	0.90455	0.00040	0.000000	0.000000	0.000798
900	0.90359	0.00042	0.90359	0.00042	0.000000	0.000000	0.000842
950	0.90324	0.00038	0.90324	0.00038	0.000000	0.000000	0.000760
1000	0.90410	0.00038	0.90410	0.00038	0.000000	0.000000	0.000766
```
