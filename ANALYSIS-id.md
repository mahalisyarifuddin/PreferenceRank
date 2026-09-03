# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis yang digunakan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 85 algoritma pengurutan yang berbeda. Pengujian ini menambahkan algoritma Stanley P. Y. Fung ["I Can't Believe It Can Sort"](https://arxiv.org/abs/2110.01111). Algoritma yang meminta pasangan duplikat diidentifikasi dan dikeluarkan dari analisis Pareto-optimal agar pilihan produksi mencerminkan keputusan manusia yang unik.

### Metodologi Tolok Ukur
- **Nilai N:** 100
- **Uji coba:** 250 per algoritma.
- **Perintah pengujian:** `node research/sort_analysis.js 100 250`
- **Metrik:** rata-rata jumlah pertempuran unik dan rata-rata Kendall Tau terhadap kekuatan sebenarnya yang dibuat secara acak.

### Hasil (N=100)

| Algoritme | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|------------------------|-----------------------|-----------|----------------|
| Exit Sort | 0.00 | 0.0014 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0008 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | -0.0016 | TIDAK | Terdominasi |
| Sleep Sort | 0.00 | -0.0051 | TIDAK | Terdominasi |
| Quantum Bogo | 1.65 | 0.0020 | TIDAK | Pareto-optimal |
| BogoBogoSort | 26.63 | 0.0068 | YA | Terdominasi |
| Silly Sort | 71.65 | 0.1126 | YA | Terdominasi |
| Thanos Sort | 99.00 | 0.4994 | YA | Terdominasi |
| Miracle Sort | 99.00 | 0.4991 | TIDAK | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3576 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.0340 | TIDAK | Terdominasi |
| Hater Sort | 188.08 | 0.5638 | YA | Terdominasi |
| Random Sort | 209.52 | 0.5567 | YA | Terdominasi |
| Budgeted Merge Sort | 520.00 | 0.9631 | TIDAK | Pareto-optimal |
| Ford-Johnson (Quick) | 526.64 | 1.0000 | TIDAK | **Titik pilihan produksi** |
| Recursive Binary Insertion | 530.59 | 1.0000 | TIDAK | Terdominasi |
| Binary Gnome | 531.26 | 1.0000 | TIDAK | Terdominasi |
| Binary Insertion | 531.37 | 1.0000 | TIDAK | Terdominasi |
| Timsort | 532.77 | 1.0000 | YA | Terdominasi |
| Merge Sort | 542.27 | 1.0000 | TIDAK | Terdominasi |
| In-place Merge Sort | 542.29 | 1.0000 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.93 | 1.0000 | TIDAK | Terdominasi |
| Powersort | 557.14 | 1.0000 | YA | Terdominasi |
| Ping-pong Merge Sort | 558.13 | 1.0000 | TIDAK | Terdominasi |
| Tournament Sort | 558.46 | 1.0000 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.53 | 1.0000 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.88 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Ninther) | 562.76 | 1.0000 | YA | Terdominasi |
| 3-way Merge Sort | 567.70 | 1.0000 | TIDAK | Terdominasi |
| Natural Merge Sort | 573.28 | 1.0000 | YA | Terdominasi |
| Slowsort | 580.84 | 0.9465 | YA | Terdominasi |
| Triple-Pivot Quicksort | 607.78 | 1.0000 | YA | Terdominasi |
| Binary Patience | 612.35 | 1.0000 | YA | Terdominasi |
| Shellsort | 629.84 | 1.0000 | YA | Terdominasi |
| Recursive Shellsort | 630.39 | 1.0000 | YA | Terdominasi |
| Cycle Sort | 642.53 | 1.0000 | YA | Terdominasi |
| Tree Sort | 643.05 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (RTL) | 643.28 | 1.0000 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 646.42 | 1.0000 | TIDAK | Terdominasi |
| 3-Way Quicksort | 647.17 | 1.0000 | TIDAK | Terdominasi |
| Parallel Quicksort | 648.95 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Middle) | 650.32 | 1.0000 | TIDAK | Terdominasi |
| Stable Quicksort | 651.65 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (LTR) | 652.04 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Hoare) | 652.35 | 1.0000 | YA | Terdominasi |
| Quicksort (Random) | 652.83 | 1.0000 | TIDAK | Terdominasi |
| Binary Shell | 672.12 | 1.0000 | YA | Terdominasi |
| Quicksort (Mo3) | 675.50 | 1.0000 | YA | Terdominasi |
| Circle Sort | 676.34 | 1.0000 | YA | Terdominasi |
| Stooge Sort | 686.91 | 1.0000 | YA | Terdominasi |
| Rotation Merge Sort | 714.30 | 1.0000 | TIDAK | Terdominasi |
| Heap Sort | 715.19 | 1.0000 | YA | Terdominasi |
| Smooth Sort | 716.61 | 1.0000 | YA | Terdominasi |
| Intro Sort | 716.90 | 1.0000 | TIDAK | Terdominasi |
| BlockQuicksort | 717.91 | 1.0000 | TIDAK | Terdominasi |
| Comb Sort | 718.41 | 1.0000 | YA | Terdominasi |
| Recursive Comb Sort | 721.14 | 1.0000 | YA | Terdominasi |
| PDQSort | 728.18 | 1.0000 | YA | Terdominasi |
| Bitonic Sort | 759.97 | 1.0000 | YA | Terdominasi |
| Bucket Sort | 766.26 | 1.0000 | TIDAK | Terdominasi |
| Binary Merge | 786.55 | 1.0000 | TIDAK | Terdominasi |
| Full Rank | 810.80 | 1.0000 | TIDAK | Terdominasi |
| Bogosort | 810.89 | 1.0000 | YA | Terdominasi |
| Binary Bottom-up Merge | 836.42 | 1.0000 | TIDAK | Terdominasi |
| Hayate-Shiki | 844.89 | 0.8426 | YA | Terdominasi |
| Radix Sort | 878.08 | 1.0000 | YA | Terdominasi |
| Patience Sort | 1006.82 | 1.0000 | YA | Terdominasi |
| Strand Sort | 1116.82 | 1.0000 | YA | Terdominasi |
| Pancake Sort | 1251.65 | 1.0000 | YA | Terdominasi |
| Cocktail Selection | 2105.65 | 1.0000 | YA | Terdominasi |
| Recursive Selection | 2213.13 | 1.0000 | YA | Terdominasi |
| Selection Sort | 2217.96 | 1.0000 | YA | Terdominasi |
| Double Selection | 2331.02 | 1.0000 | YA | Terdominasi |
| Recursive Double Selection | 2348.08 | 1.0000 | YA | Terdominasi |
| Recursive Gnome | 2556.46 | 1.0000 | YA | Terdominasi |
| Recursive Insertion | 2568.33 | 1.0000 | TIDAK | Terdominasi |
| Bubble Sort | 2569.73 | 1.0000 | YA | Terdominasi |
| Gnome Sort | 2576.56 | 1.0000 | YA | Terdominasi |
| Insertion Sort | 2577.76 | 1.0000 | TIDAK | Terdominasi |
| I Can't Believe It Can Sort | 2577.82 | 1.0000 | YA | Terdominasi |
| Cocktail Shaker | 2578.00 | 1.0000 | YA | Terdominasi |
| Recursive Bubble | 2578.36 | 1.0000 | YA | Terdominasi |
| Recursive Cocktail | 2597.78 | 1.0000 | YA | Terdominasi |
| Odd-Even Sort | 2601.10 | 1.0000 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2608.76 | 1.0000 | YA | Terdominasi |

### Interpretasi entri baru

Algoritma Fung diimplementasikan sebagai dua loop bersarang dari makalah tersebut: setiap posisi `i` dibandingkan dengan setiap posisi `j`, lalu ditukar jika `A[i] < A[j]`. Provider state-machine mempertahankan urutan tersebut sehingga membuat **N² permintaan perbandingan posisi**. Pada N=100, pengujian ulang mengukur **2.577,82 pertempuran unik**, **Kendall Tau 1,0000**, dan **permintaan duplikat: YA**. Penanda duplikat memang diharapkan karena algoritma ini sengaja mengunjungi kembali pasangan saat array berubah. Algoritma ini mengurutkan dengan benar, tetapi dikeluarkan dari garis depan produksi karena batasan tanpa duplikasi PreferenceRank.

### Mengapa Ford-Johnson tetap menjadi Titik Lutut Produksi

Ford-Johnson tetap menjadi pilihan produksi karena merupakan titik praktis tanpa duplikasi pertama pada garis depan baru yang mencapai akurasi peringkat sempurna: **526,64 pertempuran** dan **Kendall Tau 1,0000**. Budgeted Merge Sort menggunakan sedikit lebih sedikit pertempuran (**520,00**), tetapi hanya mencapai **Tau 0,9631**. Dengan demikian, algoritma baru ini merupakan perbandingan yang berguna untuk kebenaran dan efisiensi, bukan pengganti Peringkat Cepat.

Analisis Pareto dapat dihitung ulang dengan `node research/pareto_analysis.js`; skrip tersebut membaca `results.txt` saat ini alih-alih menyimpan set hasil hard-code kedua. Garis depan tanpa duplikasi pada pengujian ini berisi Exit Sort, Quantum Bogo, Miracle Sort, Budgeted Merge Sort, dan Ford-Johnson. Titik-titik dengan jumlah pertempuran rendah mengorbankan akurasi peringkat; Ford-Johnson dipilih sebagai titik lutut operasional karena merupakan entri garis depan pertama dengan akurasi 1,0000 sekaligus menghindari pertanyaan pengguna yang duplikat.

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
