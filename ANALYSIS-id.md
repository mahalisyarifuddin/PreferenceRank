# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis yang digunakan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 118 algoritma pengurutan yang berbeda. Pengujian ini menambahkan 32 provider yang baru diimplementasikan ditambah registrasi Bozo Sort yang sebelumnya belum terdaftar, mencakup sorting network, varian heap, tree sort, adaptive mergesort, distribution sort, mesh sort, dan keluarga bogo (lihat catatan uji ulang dan [research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)). Algoritma yang meminta pasangan duplikat diidentifikasi dan dikeluarkan dari analisis Pareto-optimal agar pilihan produksi mencerminkan keputusan manusia yang unik.

### Metodologi Tolok Ukur
- **Nilai N:** 100
- **Uji coba:** 250 per algoritma.
- **Perintah pengujian:** `node research/sort_analysis.js 100 250`
- **Metrik:** rata-rata jumlah pertempuran unik dan rata-rata Kendall Tau terhadap kekuatan sebenarnya yang dibuat secara acak.
- **Catatan uji ulang (2026-09-03):** audit ketepatan atas seluruh 85 provider ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md)) memperbaiki Intro Sort (orientasi perbandingan campuran), Tournament Sort (elemen terlemah terhapus), dan Hayate-Shiki (komparator penggabungan terbalik; Kendall Tau naik dari 0.8426 menjadi 1.0000). "Radix Sort" — yang bukan radix sort — diganti dengan **Binary Quicksort** yang setia, "Smooth Sort" diganti label menjadi **Heap Sort (Smooth Proxy)**, dan Silly Sort kini menjalankan rekursi silly yang sebenarnya. Baris keenam algoritma tersebut diukur ulang dengan protokol yang sama; baris lainnya dipertahankan dari run awal (setiap algoritma disimulasikan secara independen). Frontier Pareto dan titik lutut Ford-Johnson tidak berubah.
- **Catatan uji ulang (2026-09-11):** ekspansi batch-2 menjadi 118 provider (32 baru: Batcher Odd-Even, Bose-Nelson, Exchange, Bingo, Cocktail Bounds, Bottom-up Heap, Weak Heap, Smoothsort asli, Splay, Cartesian Tree, Treap, Skiplist, ketiga Shivers sort, Peeksort, Library, Sample, Funnel, Quadsort, Piposort, Replacement Selection, Polyphase Merge, BFPRT Quicksort, Shear Sort, PESort, Permutation Sort, Less/Exchange/Bubble/Odd-Even Bogo, Bovo Sort; ditambah registrasi Bozo Sort). Ini adalah run segar penuh: setiap baris diukur ulang dengan protokol yang sama, sehingga baris lama sedikit berbeda dari tabel 2026-09-03 (strength acak baru per trial, tipikal ±2 pertempuran). Seluruh 118 provider lolos audit ketepatan yang diperkeras ([research/PROVIDER_AUDIT.md](research/PROVIDER_AUDIT.md), adendum batch-2). Frontier Pareto yang bermakna (Budgeted Merge Sort → Ford-Johnson) dan titik lutut produksi tidak berubah; pergantian anggota di antara joke sort 0-pertempuran (Sleep Sort menggantikan Exit Sort / Quantum Bogo) murni noise pada nilai Tau yang mendekati nol (lihat di bawah).

### Hasil (N=100)

| Algoritme | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|------------------------|-----------------------|-----------|----------------|
| Exit Sort | 0.00 | -0.0013 | TIDAK | Terdominasi |
| Intelligent Design | 0.00 | -0.0016 | TIDAK | Terdominasi |
| Sleep Sort | 0.00 | 0.0054 | TIDAK | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0010 | TIDAK | Terdominasi |
| Permutation Sort | 1.74 | -0.0006 | YA | Terdominasi |
| Quantum Bogo | 1.74 | 0.0022 | TIDAK | Terdominasi |
| BogoBogoSort | 26.53 | 0.0139 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3444 | TIDAK | Terdominasi |
| Miracle Sort | 99.00 | 0.4935 | TIDAK | Pareto-optimal |
| Stalin Sort | 99.00 | 0.0444 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.4985 | YA | Terdominasi |
| Hater Sort | 187.88 | 0.5640 | YA | Terdominasi |
| Silly Sort | 202.04 | 0.1279 | YA | Terdominasi |
| Random Sort | 221.85 | 0.5770 | YA | Terdominasi |
| Budgeted Merge Sort | 520.00 | 0.9666 | TIDAK | Pareto-optimal |
| Ford-Johnson (Quick) | 526.83 | 1.0000 | TIDAK | **Titik pilihan produksi** |
| Binary Insertion | 530.27 | 1.0000 | TIDAK | Terdominasi |
| Binary Gnome | 531.10 | 1.0000 | TIDAK | Terdominasi |
| Recursive Binary Insertion | 531.10 | 1.0000 | TIDAK | Terdominasi |
| Timsort | 532.32 | 1.0000 | YA | Terdominasi |
| Library Sort | 537.90 | 1.0000 | YA | Terdominasi |
| In-place Merge Sort | 541.97 | 1.0000 | TIDAK | Terdominasi |
| Merge Sort | 542.17 | 1.0000 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.71 | 1.0000 | TIDAK | Terdominasi |
| Powersort | 558.03 | 1.0000 | YA | Terdominasi |
| Parallel Merge Sort | 558.33 | 1.0000 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.33 | 1.0000 | TIDAK | Terdominasi |
| Tournament Sort | 558.68 | 1.0000 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.79 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Ninther) | 563.19 | 1.0000 | YA | Terdominasi |
| 3-way Merge Sort | 568.56 | 1.0000 | TIDAK | Terdominasi |
| Quadsort | 571.38 | 1.0000 | YA | Terdominasi |
| Adaptive Shivers | 572.29 | 1.0000 | YA | Terdominasi |
| Natural Merge Sort | 573.88 | 1.0000 | YA | Terdominasi |
| Shivers Sort | 574.32 | 1.0000 | YA | Terdominasi |
| Augmented Shivers | 574.58 | 1.0000 | YA | Terdominasi |
| Weak Heap | 581.14 | 1.0000 | YA | Terdominasi |
| Funnel Sort | 582.40 | 1.0000 | TIDAK | Terdominasi |
| Slowsort | 588.77 | 0.9430 | YA | Terdominasi |
| Piposort | 599.32 | 1.0000 | YA | Terdominasi |
| Bottom-up Heap | 599.70 | 1.0000 | YA | Terdominasi |
| Triple-Pivot Quicksort | 604.28 | 1.0000 | YA | Terdominasi |
| Binary Patience | 613.18 | 1.0000 | YA | Terdominasi |
| Batcher Odd-Even | 626.10 | 1.0000 | YA | Terdominasi |
| Recursive Shellsort | 627.72 | 1.0000 | YA | Terdominasi |
| Shellsort | 630.09 | 1.0000 | YA | Terdominasi |
| Sample Sort | 640.46 | 1.0000 | YA | Terdominasi |
| Quicksort (RTL) | 645.00 | 1.0000 | TIDAK | Terdominasi |
| Cartesian Tree | 645.11 | 1.0000 | YA | Terdominasi |
| 3-Way Quicksort | 645.83 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Hoare) | 646.31 | 1.0000 | YA | Terdominasi |
| Quicksort (Middle) | 646.31 | 1.0000 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 647.59 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (LTR) | 647.62 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Random) | 647.93 | 1.0000 | TIDAK | Terdominasi |
| Tree Sort | 648.08 | 1.0000 | TIDAK | Terdominasi |
| Treap Sort | 648.41 | 1.0000 | TIDAK | Terdominasi |
| Parallel Quicksort | 649.76 | 1.0000 | TIDAK | Terdominasi |
| Binary Quicksort | 650.22 | 1.0000 | TIDAK | Terdominasi |
| Cycle Sort | 651.99 | 1.0000 | YA | Terdominasi |
| Stable Quicksort | 652.06 | 1.0000 | TIDAK | Terdominasi |
| Splay Sort | 667.68 | 1.0000 | TIDAK | Terdominasi |
| Binary Shell | 671.32 | 1.0000 | YA | Terdominasi |
| BFPRT Quicksort | 673.62 | 1.0000 | YA | Terdominasi |
| Skiplist Sort | 675.78 | 1.0000 | YA | Terdominasi |
| Circle Sort | 676.44 | 1.0000 | YA | Terdominasi |
| Quicksort (Mo3) | 680.80 | 1.0000 | YA | Terdominasi |
| Replacement Selection | 682.91 | 1.0000 | YA | Terdominasi |
| Polyphase Merge | 684.23 | 1.0000 | YA | Terdominasi |
| Stooge Sort | 686.78 | 1.0000 | YA | Terdominasi |
| Bose-Nelson | 694.25 | 1.0000 | YA | Terdominasi |
| PESort | 701.62 | 1.0000 | YA | Terdominasi |
| Rotation Merge Sort | 713.22 | 1.0000 | TIDAK | Terdominasi |
| Heap Sort (Smooth Proxy) | 716.69 | 1.0000 | YA | Terdominasi |
| Heap Sort | 717.39 | 1.0000 | YA | Terdominasi |
| BlockQuicksort | 717.82 | 1.0000 | TIDAK | Terdominasi |
| Peeksort | 718.55 | 1.0000 | YA | Terdominasi |
| Recursive Comb Sort | 718.62 | 1.0000 | YA | Terdominasi |
| Comb Sort | 718.82 | 1.0000 | YA | Terdominasi |
| Intro Sort | 720.58 | 1.0000 | TIDAK | Terdominasi |
| PDQSort | 729.60 | 1.0000 | YA | Terdominasi |
| Bitonic Sort | 759.95 | 1.0000 | YA | Terdominasi |
| Bucket Sort | 770.53 | 1.0000 | TIDAK | Terdominasi |
| Smoothsort | 775.66 | 1.0000 | YA | Terdominasi |
| Bozo Sort | 784.76 | 1.0000 | YA | Terdominasi |
| Binary Merge | 785.57 | 1.0000 | TIDAK | Terdominasi |
| Bovo Sort | 801.68 | 1.0000 | YA | Terdominasi |
| Exchange Bogo | 804.34 | 1.0000 | YA | Terdominasi |
| Full Rank | 806.34 | 1.0000 | TIDAK | Terdominasi |
| Bogosort | 806.66 | 1.0000 | YA | Terdominasi |
| Shear Sort | 806.85 | 1.0000 | YA | Terdominasi |
| Binary Bottom-up Merge | 835.62 | 1.0000 | TIDAK | Terdominasi |
| Less Bogo | 880.39 | 1.0000 | YA | Terdominasi |
| Patience Sort | 1007.38 | 1.0000 | YA | Terdominasi |
| Hayate-Shiki | 1022.55 | 1.0000 | YA | Terdominasi |
| Strand Sort | 1120.03 | 1.0000 | YA | Terdominasi |
| Pancake Sort | 1251.63 | 1.0000 | YA | Terdominasi |
| Cocktail Selection | 2119.07 | 1.0000 | YA | Terdominasi |
| Recursive Selection | 2200.96 | 1.0000 | YA | Terdominasi |
| Selection Sort | 2210.63 | 1.0000 | YA | Terdominasi |
| Bingo Sort | 2217.54 | 1.0000 | YA | Terdominasi |
| Double Selection | 2333.40 | 1.0000 | YA | Terdominasi |
| Recursive Double Selection | 2339.21 | 1.0000 | YA | Terdominasi |
| Recursive Cocktail | 2554.88 | 1.0000 | YA | Terdominasi |
| Gnome Sort | 2562.44 | 1.0000 | YA | Terdominasi |
| Recursive Insertion | 2562.93 | 1.0000 | TIDAK | Terdominasi |
| Cocktail Bounds | 2566.19 | 1.0000 | YA | Terdominasi |
| Insertion Sort | 2567.00 | 1.0000 | TIDAK | Terdominasi |
| I Can't Believe It Can Sort | 2567.80 | 1.0000 | YA | Terdominasi |
| Exchange Sort | 2570.02 | 1.0000 | YA | Terdominasi |
| Recursive Bubble | 2579.20 | 1.0000 | YA | Terdominasi |
| Bubble Sort | 2581.10 | 1.0000 | YA | Terdominasi |
| Cocktail Shaker | 2584.71 | 1.0000 | YA | Terdominasi |
| Recursive Gnome | 2592.81 | 1.0000 | YA | Terdominasi |
| Odd-Even Sort | 2599.20 | 1.0000 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2601.19 | 1.0000 | YA | Terdominasi |
| Bubble Bogo | 2618.13 | 1.0000 | YA | Terdominasi |
| Odd-Even Bogo | 2633.71 | 1.0000 | YA | Terdominasi |

### Interpretasi entri-entri baru

Ke-32 provider baru semuanya mengurutkan dengan benar (τ = 1,0000 di mana pun mereka selesai) tetapi tersebar di seluruh spektrum biaya, dan tidak satu pun menggeser Ford-Johnson pada garis depan tanpa duplikasi:

- **Dekat para pemimpin.** Library Sort (**537,90** pertempuran) berada tepat di belakang Timsort — insersi biner bergap berperilaku seperti insersi biner di sini. Keluarga Shivers (**572–575**) dan Quadsort (**571,38**) berada di samping Powersort/Natural Merge; Weak Heap (**581,14**), Funnel Sort (**582,40**, tanpa duplikasi — winner-tree merge-nya tidak pernah menanyakan ulang pasangan pada N=100), Piposort (**599,32**), dan Bottom-up Heap (**599,70**) berkelompok di dekatnya.
- **Papan tengah.** Sample Sort (**640,46**), Cartesian Tree (**645,11**), Treap Sort (**648,41**, tanpa duplikasi), dan Splay Sort (**667,68**, tanpa duplikasi) berperilaku seperti sort kelas-quicksort biasa. BFPRT Quicksort (**673,62**) membayar jaminan pivot waktu-liniernya; Replacement Selection (**682,91**) dan Polyphase Merge (**684,23**) saling berdekatan, sebagaimana mestinya — Polyphase memakai ulang run milik Replacement Selection dan hanya menggabungkannya kembali. Bose-Nelson (**694,25**), PESort (**701,62**), Peeksort (**718,55** — daun insersi-linier merugikannya pada data acak; ia menang pada input pra-urut), dan Smoothsort asli (**775,66**) melengkapi kelompok ini.
- **Network.** Batcher Odd-Even (**626,10**) mengeluarkan ~1792 komparator posisional pada N=100 tetapi hanya 626 pertempuran unik yang selamat dari keruntuhan transitif — efek yang sama yang menempatkan Bitonic pada 759,95.
- **Mesh.** Shear Sort (**806,85**) menyelesaikan 16 fase snake-nya dengan benar; baris odd-even menanyakan ulang pasangan, sehingga duplikasinya YA.
- **Keluarga bogo.** Varian inversion-descent selesai: Exchange Bogo (**804,34**), Bubble Bogo (**2618,13**), Odd-Even Bogo (**2633,71**), dan Less Bogo (**880,39**). Bozo Sort (**784,76**), Bogosort (**806,66**), dan Bovo Sort (**801,68**) tidak pernah selesai dalam batas 1 juta iterasi, namun melaporkan τ = 1,0000: begitu ~800 pertempuran unik menentukan urutan total, setiap pasangan berikutnya dijawab dari penutupan transitif dan hitungan unik membeku — mekanisme yang sama di balik 806,34 milik Full Rank (ia menanyakan seluruh 4950 pasangan, tetapi hanya ~806 yang benar-benar informasi *baru*). Permutation Sort (**1,74**, τ ≈ 0) adalah cerminannya: enumerasi leksikografis dari identitas menanyakan ulang pasangan kepala yang sama untuk ~98! permutasi pertamanya, sehingga nyaris tidak ada yang unik.
- **Kelompok seleksi/insersi.** Bingo Sort (**2217,54**) bergabung dengan para selection sort; Exchange Sort (**2570,02**) dan Cocktail Bounds (**2566,19**) bergabung dengan kelompok insersi/bubble, sesuai prediksi permintaan posisional Θ(n²) mereka. "I Can't Believe It Can Sort" karya Fung terukur ulang pada **2567,80**/1,0000/YA, konsisten dengan permintaan posisional N²-nya.

### Mengapa Ford-Johnson tetap menjadi Titik Lutut Produksi

Ford-Johnson tetap menjadi pilihan produksi karena merupakan titik praktis tanpa duplikasi pertama pada garis depan baru yang mencapai akurasi peringkat sempurna: **526,83 pertempuran** dan **Kendall Tau 1,0000**. Budgeted Merge Sort menggunakan sedikit lebih sedikit pertempuran (**520,00**), tetapi hanya mencapai **Tau 0,9666**. Dengan demikian, ke-33 algoritma yang baru diuji ini merupakan perbandingan yang berguna untuk kebenaran dan efisiensi, bukan pengganti Peringkat Cepat.

Analisis Pareto dapat dihitung ulang dengan `node research/pareto_analysis.js`; skrip tersebut membaca `results.txt` saat ini alih-alih menyimpan set hasil hard-code kedua. Garis depan tanpa duplikasi pada pengujian ini berisi Sleep Sort, Miracle Sort, Budgeted Merge Sort, dan Ford-Johnson. Ujung pertempuran-rendah berbeda dari garis depan 2026-09-03 (Exit Sort, Quantum Bogo, …) murni karena noise: semua joke sort 0-pertempuran memiliki Tau ≈ 0 ± 0,005, sehingga mana pun yang tertinggi (Sleep Sort pada 0,0054 kali ini) menjadi Pareto-optimal karena keberuntungan. Bagian garis depan yang bermakna — Budgeted Merge Sort → Ford-Johnson — tidak berubah antar run. Titik-titik dengan jumlah pertempuran rendah mengorbankan akurasi peringkat; Ford-Johnson dipilih sebagai titik lutut operasional karena merupakan entri garis depan pertama dengan akurasi 1,0000 sekaligus menghindari pertanyaan pengguna yang duplikat.

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
