# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis yang digunakan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan **144 provider pengurutan yang terdaftar**. Suite ini mencakup 25 algoritma dari ekspansi web ketiga serta provider profil tetap **VQSort (model u64/AVX2)**. VQSort sengaja diukur hanya pada tingkat perbandingan; hasil ini bukan tolok ukur throughput SIMD. Matriks sumber dan fidelitas tersedia di [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md), dengan rincian ketepatan di [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md). Algoritma yang meminta pasangan duplikat diidentifikasi dan dikeluarkan dari analisis Pareto-optimal agar pilihan produksi mencerminkan keputusan manusia yang unik.

### Metodologi Tolok Ukur
- **Nilai N:** 100
- **Uji coba:** 250 per algoritma.
- **Perintah pengujian:** `node research/sort_analysis.js 100 250`
- **Metrik:** rata-rata jumlah pertempuran unik dan rata-rata Kendall Tau terhadap kekuatan sebenarnya yang dibuat secara acak.
- **Catatan uji ulang (2026-09-03):** audit ketepatan atas seluruh 85 provider ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)) memperbaiki Intro Sort (orientasi perbandingan campuran), Tournament Sort (elemen terlemah terhapus), dan Hayate-Shiki (komparator penggabungan terbalik; Kendall Tau naik dari 0.8426 menjadi 1.0000). "Radix Sort" — yang bukan radix sort — diganti dengan **Binary Quicksort** yang setia, "Smooth Sort" diganti label menjadi **Heap Sort (Smooth Proxy)**, dan Silly Sort kini menjalankan rekursi silly yang sebenarnya. Baris keenam algoritma tersebut diukur ulang dengan protokol yang sama; baris lainnya dipertahankan dari run awal (setiap algoritma disimulasikan secara independen). Frontier Pareto dan titik lutut Ford-Johnson tidak berubah.
- **Catatan uji ulang (2026-09-11, batch 2):** ekspansi menjadi 118 provider (32 implementasi ditambah registrasi Bozo). Lihat adendum batch-2 yang dipertahankan di [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md) untuk daftar lengkap dan audit fidelitas.
- **Catatan uji ulang (2026-09-11, batch 3):** sapuan web luas lainnya menambahkan 25 provider: Stable Selection, Double Insertion, 3-Smooth Comb, tiga urutan gap Shell, empat sort keluarga heap ditambah Poplar, MEL, Twinsort, Spin, Weave Merge, QuickMergesort, 4-way Powersort, Loser-Tree Merge, GrailSort, WikiSort, Fluxsort, Crumsort, Glidesort, Blitsort, dan Optimized Pancake. Semua tambahan mengurutkan dengan benar pada 489/489 run audit diferensial. Algoritma modern yang gerakan branchless, tata letak cache, atau rotasinya tidak terlihat sebagai pertempuran diberi label eksplisit sebagai port/skeleton perbandingan dalam dokumen riset.
- **Catatan uji ulang (2026-09-12, VQSort; tabel saat ini):** menambahkan `VQSort (u64/AVX2 model)` dan mengukur ulang seluruh **144** baris. Provider menetapkan profil kunci 64-bit dan empat lane AVX2, lalu mengekspos sampler pivot enam chunk milik Highway, sorting network yang dipilih arsitektur secara tepat, keputusan lane-terhadap-pivot, rekursi, dan pengaman degenerat dari makalah sebagai pertempuran serial. Provider ini tidak dapat mereproduksi konkurensi SIMD, `CompressStore`, perilaku cache, atau throughput instruksi. VQSort lolos 489/489 run audit dan memperoleh **656,02 pertempuran, τ=1,0000, duplikasi YA**. Frontier yang bermakna dan titik lutut produksi Ford-Johnson tetap tidak berubah.

### Hasil (N=100)

| Algoritme | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|------------------------|-----------------------|-----------|----------------|
| Exit Sort | 0.00 | -0.0031 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | 0.0015 | TIDAK | Terdominasi |
| Intelligent Design | 0.00 | 0.0021 | TIDAK | Terdominasi |
| Sleep Sort | 0.00 | 0.0033 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.70 | -0.0016 | TIDAK | Terdominasi |
| Permutation Sort | 1.85 | 0.0020 | YA | Terdominasi |
| BogoBogoSort | 26.08 | 0.0190 | YA | Terdominasi |
| Stalin Sort | 99.00 | 0.0365 | TIDAK | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3452 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5001 | YA | Terdominasi |
| Miracle Sort | 99.00 | 0.5030 | TIDAK | Pareto-optimal |
| Hater Sort | 187.76 | 0.5617 | YA | Terdominasi |
| Silly Sort | 201.14 | 0.1260 | YA | Terdominasi |
| Random Sort | 215.26 | 0.5555 | YA | Terdominasi |
| Budgeted Merge Sort | 520.00 | 0.9631 | TIDAK | Pareto-optimal |
| Ford-Johnson (Quick) | 526.94 | 1.0000 | TIDAK | **Titik pilihan produksi** |
| Binary Insertion | 530.64 | 1.0000 | TIDAK | Terdominasi |
| Recursive Binary Insertion | 530.68 | 1.0000 | TIDAK | Terdominasi |
| Binary Gnome | 530.71 | 1.0000 | TIDAK | Terdominasi |
| Timsort | 532.11 | 1.0000 | YA | Terdominasi |
| Library Sort | 539.02 | 1.0000 | YA | Terdominasi |
| In-place Merge Sort | 541.71 | 1.0000 | TIDAK | Terdominasi |
| Merge Sort | 541.98 | 1.0000 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.17 | 1.0000 | TIDAK | Terdominasi |
| Powersort | 557.60 | 1.0000 | YA | Terdominasi |
| Parallel Merge Sort | 558.09 | 1.0000 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.36 | 1.0000 | TIDAK | Terdominasi |
| Tournament Sort | 558.76 | 1.0000 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 559.09 | 1.0000 | TIDAK | Terdominasi |
| Optimized Pancake | 562.74 | 1.0000 | YA | Terdominasi |
| Quicksort (Ninther) | 563.74 | 1.0000 | YA | Terdominasi |
| 3-way Merge Sort | 568.86 | 1.0000 | TIDAK | Terdominasi |
| 4-way Powersort | 569.20 | 1.0000 | YA | Terdominasi |
| Quadsort | 571.02 | 1.0000 | YA | Terdominasi |
| Natural Merge Sort | 572.60 | 1.0000 | YA | Terdominasi |
| Adaptive Shivers | 573.93 | 1.0000 | YA | Terdominasi |
| Shivers Sort | 574.34 | 1.0000 | YA | Terdominasi |
| Augmented Shivers | 575.00 | 1.0000 | YA | Terdominasi |
| QuickMergesort | 579.34 | 1.0000 | YA | Terdominasi |
| Weak Heap | 580.81 | 1.0000 | YA | Terdominasi |
| Funnel Sort | 581.96 | 1.0000 | TIDAK | Terdominasi |
| GrailSort | 585.11 | 1.0000 | TIDAK | Terdominasi |
| Slowsort | 588.16 | 0.9455 | YA | Terdominasi |
| Twinsort | 593.20 | 1.0000 | YA | Terdominasi |
| Fluxsort | 595.77 | 1.0000 | YA | Terdominasi |
| Piposort | 599.51 | 1.0000 | YA | Terdominasi |
| Bottom-up Heap | 599.69 | 1.0000 | YA | Terdominasi |
| Loser-Tree Merge | 600.69 | 1.0000 | TIDAK | Terdominasi |
| Triple-Pivot Quicksort | 603.95 | 1.0000 | YA | Terdominasi |
| Binary Patience | 610.96 | 1.0000 | YA | Terdominasi |
| WikiSort | 614.78 | 1.0000 | YA | Terdominasi |
| Batcher Odd-Even | 625.13 | 1.0000 | YA | Terdominasi |
| Recursive Shellsort | 629.71 | 1.0000 | YA | Terdominasi |
| Shellsort | 631.66 | 1.0000 | YA | Terdominasi |
| Tokuda Shellsort | 632.70 | 1.0000 | YA | Terdominasi |
| Sample Sort | 636.36 | 1.0000 | YA | Terdominasi |
| Glidesort | 638.73 | 1.0000 | YA | Terdominasi |
| Quicksort (Random) | 644.18 | 1.0000 | TIDAK | Terdominasi |
| Cartesian Tree | 644.80 | 1.0000 | YA | Terdominasi |
| Quicksort (Middle) | 644.80 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Hoare) | 645.55 | 1.0000 | YA | Terdominasi |
| Dual-Pivot Quicksort | 645.86 | 1.0000 | TIDAK | Terdominasi |
| Binary Quicksort | 647.42 | 1.0000 | TIDAK | Terdominasi |
| 3-Way Quicksort | 647.73 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (RTL) | 648.17 | 1.0000 | TIDAK | Terdominasi |
| Treap Sort | 648.24 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (LTR) | 650.24 | 1.0000 | TIDAK | Terdominasi |
| Parallel Quicksort | 654.13 | 1.0000 | TIDAK | Terdominasi |
| Tree Sort | 654.48 | 1.0000 | TIDAK | Terdominasi |
| Cycle Sort | 654.64 | 1.0000 | YA | Terdominasi |
| VQSort (u64/AVX2 model) | 656.02 | 1.0000 | YA | Terdominasi |
| Stable Quicksort | 656.50 | 1.0000 | TIDAK | Terdominasi |
| Sedgewick Shellsort | 659.90 | 1.0000 | YA | Terdominasi |
| Quicksort (Mo3) | 669.36 | 1.0000 | YA | Terdominasi |
| Splay Sort | 669.43 | 1.0000 | TIDAK | Terdominasi |
| BFPRT Quicksort | 670.50 | 1.0000 | YA | Terdominasi |
| Binary Shell | 671.06 | 1.0000 | YA | Terdominasi |
| Skiplist Sort | 674.03 | 1.0000 | YA | Terdominasi |
| Circle Sort | 675.10 | 1.0000 | YA | Terdominasi |
| Polyphase Merge | 683.06 | 1.0000 | YA | Terdominasi |
| Replacement Selection | 683.96 | 1.0000 | YA | Terdominasi |
| Stooge Sort | 684.86 | 1.0000 | YA | Terdominasi |
| Out-of-place Heap | 686.58 | 1.0000 | YA | Terdominasi |
| Bose-Nelson | 690.35 | 1.0000 | YA | Terdominasi |
| Ternary Heap | 696.26 | 1.0000 | YA | Terdominasi |
| Weave Merge | 698.86 | 1.0000 | YA | Terdominasi |
| PESort | 708.32 | 1.0000 | YA | Terdominasi |
| Rotation Merge Sort | 712.98 | 1.0000 | TIDAK | Terdominasi |
| Quaternary Heap | 714.11 | 1.0000 | YA | Terdominasi |
| Heap Sort | 716.56 | 1.0000 | YA | Terdominasi |
| Heap Sort (Smooth Proxy) | 716.70 | 1.0000 | YA | Terdominasi |
| Peeksort | 718.18 | 1.0000 | YA | Terdominasi |
| Blitsort | 720.38 | 1.0000 | YA | Terdominasi |
| Comb Sort | 722.10 | 1.0000 | YA | Terdominasi |
| Recursive Comb Sort | 722.79 | 1.0000 | YA | Terdominasi |
| BlockQuicksort | 723.28 | 1.0000 | TIDAK | Terdominasi |
| Intro Sort | 724.03 | 1.0000 | TIDAK | Terdominasi |
| PDQSort | 732.41 | 1.0000 | YA | Terdominasi |
| Crumsort | 739.52 | 1.0000 | YA | Terdominasi |
| Min-Max Heap | 740.66 | 1.0000 | YA | Terdominasi |
| Poplar Sort | 760.14 | 1.0000 | YA | Terdominasi |
| Bitonic Sort | 761.16 | 1.0000 | YA | Terdominasi |
| Bucket Sort | 764.12 | 1.0000 | TIDAK | Terdominasi |
| Smoothsort | 773.35 | 1.0000 | YA | Terdominasi |
| Binary Merge | 786.92 | 1.0000 | TIDAK | Terdominasi |
| Bozo Sort | 787.13 | 1.0000 | YA | Terdominasi |
| Bovo Sort | 798.77 | 1.0000 | YA | Terdominasi |
| Shear Sort | 802.26 | 1.0000 | YA | Terdominasi |
| Bogosort | 805.90 | 1.0000 | YA | Terdominasi |
| Exchange Bogo | 806.65 | 1.0000 | YA | Terdominasi |
| Full Rank | 807.74 | 1.0000 | TIDAK | Terdominasi |
| 3-Smooth Comb | 827.94 | 1.0000 | YA | Terdominasi |
| Pratt Shellsort | 831.47 | 1.0000 | YA | Terdominasi |
| Binary Bottom-up Merge | 840.17 | 1.0000 | TIDAK | Terdominasi |
| Less Bogo | 873.95 | 1.0000 | YA | Terdominasi |
| Spin Sort | 875.36 | 1.0000 | TIDAK | Terdominasi |
| Patience Sort | 1007.42 | 1.0000 | YA | Terdominasi |
| Hayate-Shiki | 1026.15 | 1.0000 | YA | Terdominasi |
| Strand Sort | 1136.78 | 1.0000 | YA | Terdominasi |
| MEL Sort | 1184.09 | 1.0000 | YA | Terdominasi |
| Pancake Sort | 1250.75 | 1.0000 | YA | Terdominasi |
| Double Insertion | 1780.33 | 1.0000 | YA | Terdominasi |
| Cocktail Selection | 2101.26 | 1.0000 | YA | Terdominasi |
| Bingo Sort | 2192.77 | 1.0000 | YA | Terdominasi |
| Selection Sort | 2216.85 | 1.0000 | YA | Terdominasi |
| Recursive Selection | 2229.07 | 1.0000 | YA | Terdominasi |
| Recursive Double Selection | 2357.44 | 1.0000 | YA | Terdominasi |
| Double Selection | 2358.34 | 1.0000 | YA | Terdominasi |
| Recursive Insertion | 2560.34 | 1.0000 | TIDAK | Terdominasi |
| Gnome Sort | 2563.90 | 1.0000 | YA | Terdominasi |
| Insertion Sort | 2573.30 | 1.0000 | TIDAK | Terdominasi |
| Recursive Gnome | 2574.60 | 1.0000 | YA | Terdominasi |
| Bubble Sort | 2576.76 | 1.0000 | YA | Terdominasi |
| I Can't Believe It Can Sort | 2577.97 | 1.0000 | YA | Terdominasi |
| Exchange Sort | 2578.18 | 1.0000 | YA | Terdominasi |
| Stable Selection | 2580.41 | 1.0000 | YA | Terdominasi |
| Recursive Bubble | 2580.53 | 1.0000 | YA | Terdominasi |
| Cocktail Bounds | 2589.15 | 1.0000 | YA | Terdominasi |
| Cocktail Shaker | 2592.43 | 1.0000 | YA | Terdominasi |
| Recursive Cocktail | 2593.47 | 1.0000 | YA | Terdominasi |
| Odd-Even Sort | 2611.78 | 1.0000 | YA | Terdominasi |
| Odd-Even Bogo | 2612.23 | 1.0000 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2613.96 | 1.0000 | YA | Terdominasi |
| Bubble Bogo | 2635.79 | 1.0000 | YA | Terdominasi |
### Interpretasi ekspansi web dan adendum VQSort

Seluruh 25 provider batch 3 dan tambahan VQSort mengurutkan dengan benar dan mencapai τ=1,0000. Biaya perbandingannya mencakup rentang yang luas:

- **Penantang baru terdekat.** Optimized Pancake adalah tambahan batch 3 dengan pertempuran terendah pada **562,74**, diikuti 4-way Powersort (**569,20**) dan QuickMergesort (**579,34**); ketiganya mengulang sedikitnya satu pasangan tak berurutan. Skeleton perbandingan GrailSort merupakan baris baru tanpa duplikasi terbaik pada **585,11**, masih 58,17 pertempuran di belakang Ford-Johnson.
- **Hibrida modern dan block/external merge.** Twinsort (**593,20**), Fluxsort (**595,77**), Loser-Tree Merge (**600,69**, tanpa duplikasi), WikiSort (**614,78**, dengan duplikasi), Glidesort (**638,73**), Blitsort (**720,38**), dan Crumsort (**739,52**) menunjukkan bahwa rekayasa untuk lokalitas cache, operasi branchless, stabilitas, dan perpindahan data tidak otomatis meminimalkan perbandingan manusia. Baris Grail, Wiki, dan Glide didokumentasikan secara eksplisit sebagai pengukuran skeleton/konfigurasi tingkat perbandingan, bukan klaim kecepatan CPU tentang library produksinya.
- **Keluarga heap dan gap.** Out-of-place Heap (**686,58**) memimpin heap baru, di depan Ternary (**696,26**), Quaternary (**714,11**), Min-Max (**740,66**), dan Poplar (**760,14**). Tokuda adalah urutan Shell tambahan terkuat pada **632,70**; Sedgewick mencapai **659,90**, sedangkan 3-Smooth Comb (**827,94**) dan Pratt Shellsort (**831,47**) berdekatan meskipun menggunakan gap yang sama dengan jenis pass berbeda.
- **Konstruksi khusus.** Weave Merge memakai **698,86** pertempuran, Spin Sort memakai **875,36** tanpa duplikasi, MEL Sort membayar **1184,09** untuk encroaching list pada input acak, Double Insertion memakai **1780,33**, dan Stable Selection masuk kelompok kuadratik pada **2580,41**.
- **Profil tetap VQSort.** Model perbandingan u64/AVX2 menggunakan **656,02** pertempuran unik dan mengulang pasangan. Baris ini mencerminkan kerja komparator yang diserialkan, bukan kecepatan SIMD yang menjadi keunggulan utama VQSort: empat perbandingan lane yang berjalan serentak di perangkat keras menjadi empat keputusan manusia potensial di sini, sedangkan optimasi pengemasan vektor dan memori tidak menambah pertempuran.

Matriks implementasi/sumber/fidelitas lengkap tersedia di [research/CANDIDATE_ALGORITHMS.md](research/CANDIDATE_ALGORITHMS.md). Output tolok ukur mentah tetap berada di `results.txt`; `research/audit_results.txt` secara independen mencatat terminasi, validitas pasangan, keterurutan, orientasi, dan perilaku duplikasi.

### Mengapa Ford-Johnson tetap menjadi Titik Lutut Produksi

Ford-Johnson tetap menjadi pilihan produksi karena merupakan titik praktis tanpa duplikasi pertama pada frontier baru yang mencapai akurasi peringkat sempurna: **526,94 pertempuran** dan **Kendall Tau 1,0000**. Budgeted Merge Sort menggunakan sedikit lebih sedikit pertempuran (**520,00**), tetapi hanya mencapai **Tau 0,9631**. Ke-26 algoritma tambahan, termasuk VQSort, memperluas cakupan dan perbandingan audit, bukan menggantikan Peringkat Cepat.

`node research/pareto_analysis.js` menghitung ulang frontier tanpa duplikasi dari `results.txt`. Run ini memuat Sleep Sort, Miracle Sort, Budgeted Merge Sort, dan Ford-Johnson. Titik joke sort di bawah 100 pertempuran memiliki Tau mendekati nol dan keanggotaannya berubah akibat noise acak; semuanya bukan metode pemeringkatan yang layak. Frontier yang bermakna tetap **Budgeted Merge Sort → Ford-Johnson**. Ford-Johnson dipilih sebagai titik lutut operasional karena merupakan entri frontier pertama pada batas akurasi 1,0000 sekaligus menghindari pertanyaan pengguna yang duplikat.

#### Batasan "Tanpa Duplikasi"

PreferenceRank memprioritaskan efisiensi pengguna dengan mengecualikan algoritma apa pun yang menghasilkan perbandingan duplikat. Banyak algoritma berkinerja tinggi (Timsort, Quicksort, Shellsort) dioptimalkan untuk pola akses memori komputer, bukan untuk meminimalkan keputusan manusia yang unik. Ford-Johnson adalah algoritma "Murni Unik", memastikan setiap pertempuran memberikan data segar ke model penilaian.

#### Kemenangan Bayangan dan Penutupan Transitif

Ford-Johnson mencapai kinerja unggulnya dengan menerapkan **penutupan transitif bayangan** pada hasil tulang punggung penggabungan parsial. Hal ini memungkinkan model Bradley-Terry memanfaatkan kemenangan yang disimpulkan tanpa memerlukan pertempuran pengguna tambahan, memaksimalkan informasi yang diekstraksi dari setiap keputusan.

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
