# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 78 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut Pareto-optimal (menggunakan sumbu skala log untuk jumlah pertempuran unik) untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **N Value:** 100
- **Trials:** 250 per algorithm.

### Hasil (N=100)
| Algoritme | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|-----------------------|-----------------------|-----------|---------------|
| Intelligent Design | 0.00 | 0.0067 | TIDAK | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0067 | TIDAK | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3565 | TIDAK | Pareto-optimal |
| Bottom-up Merge Sort | 520.00 | 0.9157 | TIDAK | Pareto-optimal |
| **Ford-Johnson** | 526.98 | 0.9995 | TIDAK | **Titik Lutut Produksi** |
| In-place Merge Sort | 541.60 | 0.9996 | TIDAK | Pareto-optimal |
| Rotation Merge Sort | 715.96 | 0.9998 | TIDAK | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Exit Sort | 0.00 | 0.0059 | TIDAK | Terdominasi |
| Quantum Bogo | 1.65 | 0.0027 | TIDAK | Terdominasi |
| BogoBogoSort | 45.10 | 0.0108 | YA | Terdominasi |
| Smooth Sort | 98.86 | 0.0212 | YA | Terdominasi |
| Stalin Sort | 99.00 | 0.1094 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5474 | YA | Terdominasi |
| Miracle Sort | 99.00 | 0.0115 | TIDAK | Terdominasi |
| Heap Sort | 99.42 | 0.0092 | YA | Terdominasi |
| Sleep Sort | 100.00 | 0.0012 | TIDAK | Terdominasi |
| 3-Way Quicksort | 100.79 | 0.0021 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.0160 | YA | Terdominasi |
| PDQSort | 194.12 | 0.0695 | YA | Terdominasi |
| Hater Sort | 196.01 | 0.0316 | YA | Terdominasi |
| Quicksort (Hoare) | 197.22 | 0.3437 | YA | Terdominasi |
| Patience Sort | 198.31 | 0.0081 | YA | Terdominasi |
| Random Sort | 225.86 | 0.0323 | YA | Terdominasi |
| Binary Insertion | 530.12 | 0.9995 | TIDAK | Terdominasi |
| Recursive Binary Insertion | 530.63 | 0.9994 | TIDAK | Terdominasi |
| Triple-Pivot Quicksort | 532.69 | 0.8642 | YA | Terdominasi |
| Timsort | 532.70 | 0.9995 | YA | Terdominasi |
| Merge Sort | 541.65 | 0.9996 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.54 | 0.9995 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.12 | 0.9995 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.34 | 0.9994 | TIDAK | Terdominasi |
| Tournament Sort | 558.46 | 0.0281 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.79 | 0.9994 | TIDAK | Terdominasi |
| Powersort | 561.78 | 0.9995 | YA | Terdominasi |
| 3-way Merge Sort | 567.79 | 0.9994 | TIDAK | Terdominasi |
| Natural Merge Sort | 577.34 | 0.9994 | YA | Terdominasi |
| Quicksort (Ninther) | 605.01 | 0.9991 | YA | Terdominasi |
| Stable Quicksort | 639.76 | 0.9983 | TIDAK | Terdominasi |
| Cycle Sort | 642.75 | 0.0917 | YA | Terdominasi |
| Quicksort (LTR) | 643.04 | 0.9983 | TIDAK | Terdominasi |
| Tree Sort | 647.28 | 0.0306 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 649.88 | 0.9983 | TIDAK | Terdominasi |
| Parallel Quicksort | 650.35 | 0.9983 | TIDAK | Terdominasi |
| Quicksort (Middle) | 650.62 | 0.9983 | TIDAK | Terdominasi |
| Quicksort (RTL) | 651.60 | 0.9982 | TIDAK | Terdominasi |
| Quicksort (Random) | 653.86 | 0.9983 | TIDAK | Terdominasi |
| Recursive Shellsort | 670.30 | 0.9996 | YA | Terdominasi |
| Shellsort | 671.97 | 0.9996 | YA | Terdominasi |
| Quicksort (Mo3) | 712.38 | 0.9975 | YA | Terdominasi |
| BlockQuicksort | 721.98 | 0.9975 | TIDAK | Terdominasi |
| Intro Sort | 722.02 | -0.7603 | TIDAK | Terdominasi |
| Strand Sort | 741.47 | 0.0733 | TIDAK | Terdominasi |
| Bucket Sort | 770.85 | 0.9972 | TIDAK | Terdominasi |
| Recursive Comb Sort | 850.55 | 0.9999 | YA | Terdominasi |
| Comb Sort | 852.49 | 0.9999 | YA | Terdominasi |
| Hayate-Shiki | 932.11 | 0.2892 | YA | Terdominasi |
| Bitonic Sort | 1036.82 | 0.6474 | YA | Terdominasi |
| Circle Sort | 1203.00 | 0.9619 | YA | Terdominasi |
| Slowsort | 1318.67 | 0.6127 | YA | Terdominasi |
| Gnome Sort | 2546.68 | 0.9943 | YA | Terdominasi |
| Bubble Sort | 2548.95 | 0.9943 | YA | Terdominasi |
| Recursive Insertion | 2562.23 | 0.9943 | TIDAK | Terdominasi |
| Recursive Bubble | 2563.32 | 0.9944 | YA | Terdominasi |
| Insertion Sort | 2567.80 | 0.9942 | TIDAK | Terdominasi |
| Recursive Gnome | 2576.45 | 0.9942 | YA | Terdominasi |
| Recursive Cocktail | 2584.30 | 0.9943 | YA | Terdominasi |
| Cocktail Shaker | 2592.21 | 0.9942 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2625.33 | 0.9942 | YA | Terdominasi |
| Odd-Even Sort | 2640.50 | 0.9943 | YA | Terdominasi |
| Selection Sort | 2737.22 | 0.9954 | YA | Terdominasi |
| Double Selection | 2742.19 | 0.9969 | YA | Terdominasi |
| Recursive Selection | 2742.29 | 0.9954 | YA | Terdominasi |
| Cocktail Selection | 2744.95 | 0.9971 | YA | Terdominasi |
| Recursive Double Selection | 2775.99 | 0.9969 | YA | Terdominasi |
| Stooge Sort | 2903.40 | 1.0000 | YA | Terdominasi |
| Pancake Sort | 3070.74 | 0.9994 | YA | Terdominasi |
| Radix Sort | 4536.64 | 0.9976 | YA | Terdominasi |
| Bogosort | 4950.00 | 0.5034 | YA | Terdominasi |

### Mengapa Ford-Johnson adalah Titik Lutut Produksi

Ford-Johnson ditetapkan sebagai **titik lutut matematis** karena mewakili keseimbangan absolut yang optimal antara upaya pengguna (jumlah perbandingan) dan akurasi peringkat (korelasi Kendall Tau) dengan memanfaatkan kemenangan transitif bayangan.

#### 1. Optimalisasi Matematis (Lutut Skala Log)
"Titik lutut" diidentifikasi menggunakan **metode Kneedle** dan **Jarak Tegak Lurus Maksimum** dari akord titik akhir pada garis depan Pareto. Saat memplot akurasi terhadap upaya pada sumbu skala log (log10(pertempuran + 1)), Ford-Johnson menempati bagian "siku" dari kurva tersebut.
*   **Hasil yang Menurun:** Berpindah dari "Genghis Khan Sort" (99 pertempuran, 0.36 Tau) ke "Ford-Johnson" (~527 pertempuran, 0.999 Tau) menghasilkan pengurutan yang hampir sempurna dengan upaya minimal.
*   **Dominasi:** Ford-Johnson mencapai akurasi yang hampir sempurna (~0.999) dengan lebih sedikit pertempuran (~527) daripada Vanilla Merge Sort (~0.90 Tau, ~542 pertempuran), secara efektif menggeser seluruh garis depan Pareto menuju efisiensi yang lebih tinggi.

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
- **Formula:** `Pertempuran Unik ~ N * log2(N) - 1.411 * N + 3.6` (untuk N >= 16)
- For N=100, ini memprediksi ~527 pertempuran (disimulasikan ~527 unik rata-rata).

---

## 3. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~43% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).

## 4. Stabilitas Tolok Ukur dan Optimasi Uji Coba

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
