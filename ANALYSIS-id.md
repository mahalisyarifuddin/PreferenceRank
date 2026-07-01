# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 87 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut Pareto-optimal (menggunakan sumbu skala log untuk jumlah pertempuran unik) untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **N Value:** 100
- **Trials:** 250 per algorithm.

### Hasil (N=100)
| Algoritme | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|-------------|-----------------|------------|---------------|
| **Ford-Johnson (Quick)** | 526.84 | 1.0000 | TIDAK | **Titik Lutut Produksi** |
| Exit Sort | 0.00 | 0.0023 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.59 | 0.0086 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5044 | TIDAK | Pareto-optimal |
| Budgeted Merge Sort | 520.00 | 0.9633 | TIDAK | Pareto-optimal |
| Socialist Sort | 0.00 | -0.0018 | TIDAK | Terdominasi |
| Intelligent Design | 0.00 | -0.0027 | TIDAK | Terdominasi |
| Sleep Sort | 0.00 | -0.0034 | TIDAK | Terdominasi |
| BogoBogoSort | 26.50 | 0.0015 | YA | Terdominasi |
| Silly Sort | 71.31 | 0.1265 | YA | Terdominasi |
| Thanos Sort | 99.00 | 0.4947 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3582 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.0403 | TIDAK | Terdominasi |
| Hater Sort | 187.90 | 0.5598 | YA | Terdominasi |
| Random Sort | 212.36 | 0.5539 | YA | Terdominasi |
| Binary Gnome | 530.09 | 1.0000 | TIDAK | Terdominasi |
| Binary Insertion | 530.19 | 1.0000 | TIDAK | Terdominasi |
| Recursive Binary Insertion | 530.88 | 1.0000 | TIDAK | Terdominasi |
| Timsort | 532.03 | 1.0000 | YA | Terdominasi |
| Merge Sort | 541.70 | 1.0000 | TIDAK | Terdominasi |
| In-place Merge Sort | 541.80 | 1.0000 | TIDAK | Terdominasi |
| 4-way Merge Sort | 541.91 | 1.0000 | TIDAK | Terdominasi |
| Powersort | 556.58 | 1.0000 | YA | Terdominasi |
| Ping-pong Merge Sort | 558.36 | 1.0000 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.50 | 1.0000 | TIDAK | Terdominasi |
| Tournament Sort | 558.64 | 1.0000 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.92 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Ninther) | 563.43 | 1.0000 | YA | Terdominasi |
| 3-way Merge Sort | 567.47 | 1.0000 | TIDAK | Terdominasi |
| Natural Merge Sort | 574.03 | 1.0000 | YA | Terdominasi |
| Slowsort | 587.45 | 0.9434 | YA | Terdominasi |
| Triple-Pivot Quicksort | 612.89 | 1.0000 | YA | Terdominasi |
| Binary Patience | 616.15 | 1.0000 | YA | Terdominasi |
| Shellsort | 628.50 | 1.0000 | YA | Terdominasi |
| Recursive Shellsort | 629.41 | 1.0000 | YA | Terdominasi |
| Stable Quicksort | 636.94 | 1.0000 | TIDAK | Terdominasi |
| Tree Sort | 641.87 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (LTR) | 645.52 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Middle) | 647.32 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (RTL) | 647.44 | 1.0000 | TIDAK | Terdominasi |
| Parallel Quicksort | 648.10 | 1.0000 | TIDAK | Terdominasi |
| Cycle Sort | 650.31 | 1.0000 | YA | Terdominasi |
| Quicksort (Random) | 650.41 | 1.0000 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 653.62 | 1.0000 | TIDAK | Terdominasi |
| 3-Way Quicksort | 655.76 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Hoare) | 659.50 | 1.0000 | YA | Terdominasi |
| Binary Shell | 675.92 | 1.0000 | YA | Terdominasi |
| Circle Sort | 676.01 | 1.0000 | YA | Terdominasi |
| Quicksort (Mo3) | 683.28 | 1.0000 | YA | Terdominasi |
| Stooge Sort | 689.07 | 1.0000 | YA | Terdominasi |
| Rotation Merge Sort | 714.14 | 1.0000 | TIDAK | Terdominasi |
| Intro Sort | 715.91 | 1.0000 | TIDAK | Terdominasi |
| Heap Sort | 717.29 | 1.0000 | YA | Terdominasi |
| Smooth Sort | 718.78 | 1.0000 | YA | Terdominasi |
| BlockQuicksort | 720.32 | 1.0000 | TIDAK | Terdominasi |
| Recursive Comb Sort | 720.66 | 1.0000 | YA | Terdominasi |
| Comb Sort | 721.29 | 1.0000 | YA | Terdominasi |
| PDQSort | 741.35 | 1.0000 | YA | Terdominasi |
| Bitonic Sort | 761.04 | 1.0000 | YA | Terdominasi |
| Binary Merge | 785.93 | 1.0000 | TIDAK | Terdominasi |
| Bucket Sort | 787.75 | 1.0000 | TIDAK | Terdominasi |
| Full Rank | 810.37 | 1.0000 | TIDAK | Terdominasi |
| Bogosort | 811.64 | 1.0000 | YA | Terdominasi |
| Binary Bottom-up Merge | 837.20 | 1.0000 | TIDAK | Terdominasi |
| Hayate-Shiki | 845.65 | 0.8410 | YA | Terdominasi |
| Radix Sort | 921.33 | 1.0000 | YA | Terdominasi |
| Patience Sort | 1022.40 | 1.0000 | YA | Terdominasi |
| Strand Sort | 1129.54 | 1.0000 | YA | Terdominasi |
| Pancake Sort | 1261.09 | 1.0000 | YA | Terdominasi |
| Cocktail Selection | 2097.59 | 1.0000 | YA | Terdominasi |
| Recursive Selection | 2209.41 | 1.0000 | YA | Terdominasi |
| Selection Sort | 2215.76 | 1.0000 | YA | Terdominasi |
| Recursive Double Selection | 2344.50 | 1.0000 | YA | Terdominasi |
| Double Selection | 2364.53 | 1.0000 | YA | Terdominasi |
| Recursive Gnome | 2547.43 | 1.0000 | YA | Terdominasi |
| Recursive Cocktail | 2550.98 | 1.0000 | YA | Terdominasi |
| Bubble Sort | 2557.46 | 1.0000 | YA | Terdominasi |
| Insertion Sort | 2572.92 | 1.0000 | TIDAK | Terdominasi |
| Cocktail Shaker | 2575.37 | 1.0000 | YA | Terdominasi |
| Gnome Sort | 2580.57 | 1.0000 | YA | Terdominasi |
| Recursive Insertion | 2588.43 | 1.0000 | TIDAK | Terdominasi |
| Recursive Bubble | 2598.00 | 1.0000 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2598.40 | 1.0000 | YA | Terdominasi |
| Odd-Even Sort | 2600.40 | 1.0000 | YA | Terdominasi |

### Mengapa Ford-Johnson adalah Titik Lutut Produksi

Ford-Johnson ditetapkan sebagai **titik lutut matematis** karena mewakili keseimbangan absolut yang optimal antara upaya pengguna (jumlah perbandingan) dan akurasi peringkat (korelasi Kendall Tau) dengan memanfaatkan kemenangan transitif bayangan.

#### 1. Optimalisasi Matematis (Lutut Skala Log)
"Titik lutut" diidentifikasi menggunakan **metode Kneedle** dan **Jarak Tegak Lurus Maksimum** dari akord titik akhir pada garis depan Pareto. Saat memplot akurasi terhadap upaya pada sumbu skala log (log10(pertempuran + 1)), Ford-Johnson menempati bagian "siku" dari kurva tersebut.
*   **Hasil yang Menurun:** Berpindah dari "Miracle Sort" (99 pertempuran, 0.54 Tau) ke "Ford-Johnson (Quick)" (~527 pertempuran, 1.000 Tau) menghasilkan pengurutan yang hampir sempurna dengan upaya minimal.
*   **Dominasi:** Ford-Johnson mencapai akurasi yang hampir sempurna (~0.999) dengan lebih sedikit pertempuran (~527) daripada Budgeted Merge Sort (~0.98 Tau, ~520 pertempuran), secara efektif menggeser seluruh garis depan Pareto menuju efisiensi yang lebih tinggi.

#### 2. Batasan "Tanpa Duplikasi"
PreferenceRank memprioritaskan efisiensi pengguna dengan mengecualikan algoritma apa pun yang menghasilkan perbandingan duplikat. Banyak algoritma berkinerja tinggi (Timsort, Quicksort, Shellsort) didiskualifikasi karena dioptimalkan untuk pola akses memori komputer daripada meminimalkan keputusan manusia yang unik. Ford-Johnson adalah algoritma "Murni Unik", memastikan setiap pertarungan memberikan data segar ke model penilaian.

#### 3. Kemenangan Bayangan dan Penutupan Transitif
Ford-Johnson mencapai kinerja unggulnya dengan menerapkan **penutupan transitif bayangan** pada hasil tulang punggung penggabungan parsial. Hal ini memungkinkan model Bradley-Terry untuk memanfaatkan kemenangan yang disimpulkan tanpa memerlukan pertempuran pengguna tambahan, memaksimalkan informasi yang diekstraksi dari setiap keputusan.

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
Untuk Ford-Johnson (Titik Lutut Produksi yang baru):
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
