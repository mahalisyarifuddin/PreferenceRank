# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum pengujian tolok ukur (benchmarking) dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 79 algoritma pengurutan yang berbeda, termasuk varian Ford-Johnson yang baru diusulkan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan yang duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikecualikan dari analisis titik lutut (knee point) Pareto-optimal (menggunakan sumbu skala log untuk jumlah pertempuran unik) untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Pengujian
- **Nilai N:** 100
- **Uji Coba:** 250 per algoritma.

### Hasil (N=100)
| Algoritma | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|-----------------------|-----------------------|-----------|---------------|
| Intelligent Design | 0.00 | 0.0053 | NO | Pareto-optimal |
| Quantum Bogo | 1.72 | 0.0208 | NO | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5518 | NO | Pareto-optimal |
| Ford-Johnson | 526.88 | 0.8888 | NO | Pareto-optimal |
| **Merge Sort** | 541.32 | 0.9036 | NO | **Titik Lutut** |
| In-place Merge Sort | 542.82 | 0.9049 | NO | Pareto-optimal |
| Rotation Merge Sort | 714.34 | 0.9153 | NO | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | NO | Pareto-optimal |
| Socialist Sort | 0.00 | -0.0098 | NO | Terdominasi |
| Exit Sort | 0.00 | 0.0005 | NO | Terdominasi |
| BogoBogoSort | 44.40 | 0.0935 | YES | Terdominasi |
| Heap Sort | 98.92 | 0.4812 | YES | Terdominasi |
| Stalin Sort | 99.00 | 0.1085 | NO | Terdominasi |
| Thanos Sort | 99.00 | 0.5459 | YES | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3438 | NO | Terdominasi |
| Smooth Sort | 99.50 | 0.4844 | YES | Terdominasi |
| Sleep Sort | 100.00 | 0.0088 | NO | Terdominasi |
| 3-Way Quicksort | 101.19 | 0.3560 | YES | Terdominasi |
| Silly Sort | 138.00 | 0.2359 | YES | Terdominasi |
| PDQSort | 191.19 | 0.5431 | YES | Terdominasi |
| Hater Sort | 196.23 | 0.6644 | YES | Terdominasi |
| Patience Sort | 199.36 | 0.4782 | YES | Terdominasi |
| Quicksort (Hoare) | 204.80 | 0.5116 | YES | Terdominasi |
| Random Sort | 239.89 | 0.6448 | YES | Terdominasi |
| Cycle Sort | 512.93 | 0.4430 | YES | Terdominasi |
| Quick Rank (proposed) | 526.97 | 0.8878 | NO | Terdominasi |
| Triple-Pivot Quicksort | 529.68 | 0.8274 | YES | Terdominasi |
| Binary Insertion | 530.35 | 0.8881 | NO | Terdominasi |
| Recursive Binary Insertion | 530.74 | 0.8868 | NO | Terdominasi |
| Timsort | 532.71 | 0.8943 | YES | Terdominasi |
| 4-way Merge Sort | 543.26 | 0.9040 | NO | Terdominasi |
| Ping-pong Merge Sort | 558.18 | 0.8869 | NO | Terdominasi |
| Parallel Merge Sort | 558.40 | 0.8866 | NO | Terdominasi |
| Tournament Sort | 558.46 | 0.8867 | NO | Terdominasi |
| Bottom-up Merge Sort | 558.94 | 0.8868 | NO | Terdominasi |
| Powersort | 562.04 | 0.9075 | YES | Terdominasi |
| 3-way Merge Sort | 568.06 | 0.8794 | NO | Terdominasi |
| Natural Merge Sort | 577.32 | 0.8918 | YES | Terdominasi |
| Quicksort (Ninther) | 605.22 | 0.8418 | YES | Terdominasi |
| Quicksort (Random) | 644.15 | 0.8371 | NO | Terdominasi |
| Parallel Quicksort | 644.67 | 0.8366 | NO | Terdominasi |
| Quicksort (Middle) | 645.71 | 0.8372 | NO | Terdominasi |
| Dual-Pivot Quicksort | 647.24 | 0.8370 | NO | Terdominasi |
| Quicksort (RTL) | 647.80 | 0.8362 | NO | Terdominasi |
| Quicksort (LTR) | 648.07 | 0.8367 | NO | Terdominasi |
| Tree Sort | 648.27 | 0.8365 | NO | Terdominasi |
| Stable Quicksort | 650.17 | 0.8368 | NO | Terdominasi |
| Recursive Shellsort | 669.92 | 0.9320 | YES | Terdominasi |
| Shellsort | 670.02 | 0.9334 | YES | Terdominasi |
| Quicksort (Mo3) | 709.19 | 0.8284 | YES | Terdominasi |
| Intro Sort | 718.51 | 0.8076 | NO | Terdominasi |
| BlockQuicksort | 724.74 | 0.8083 | NO | Terdominasi |
| Strand Sort | 746.78 | 0.8173 | NO | Terdominasi |
| Bucket Sort | 777.60 | 0.8006 | NO | Terdominasi |
| Recursive Comb Sort | 851.15 | 0.9739 | YES | Terdominasi |
| Comb Sort | 852.31 | 0.9745 | YES | Terdominasi |
| Hayate-Shiki | 935.24 | 0.7823 | YES | Terdominasi |
| Bitonic Sort | 1038.34 | 0.9572 | YES | Terdominasi |
| Circle Sort | 1208.72 | 0.9693 | YES | Terdominasi |
| Slowsort | 1317.91 | 0.9484 | YES | Terdominasi |
| Recursive Insertion | 2553.70 | 0.8016 | NO | Terdominasi |
| Bubble Sort | 2559.72 | 0.8022 | YES | Terdominasi |
| Cocktail Shaker | 2564.17 | 0.8054 | YES | Terdominasi |
| Insertion Sort | 2569.82 | 0.8024 | NO | Terdominasi |
| Recursive Gnome | 2571.80 | 0.8027 | YES | Terdominasi |
| Recursive Bubble | 2573.41 | 0.8035 | YES | Terdominasi |
| Gnome Sort | 2574.22 | 0.8033 | YES | Terdominasi |
| Recursive Cocktail | 2587.50 | 0.8070 | YES | Terdominasi |
| Recursive Odd-Even Sort | 2608.29 | 0.8052 | YES | Terdominasi |
| Odd-Even Sort | 2627.86 | 0.8062 | YES | Terdominasi |
| Cocktail Selection | 2744.22 | 0.9214 | YES | Terdominasi |
| Selection Sort | 2750.30 | 0.8905 | YES | Terdominasi |
| Recursive Selection | 2753.40 | 0.8896 | YES | Terdominasi |
| Double Selection | 2762.05 | 0.9230 | YES | Terdominasi |
| Recursive Double Selection | 2774.11 | 0.9231 | YES | Terdominasi |
| Stooge Sort | 2883.68 | 0.9900 | YES | Terdominasi |
| Pancake Sort | 3063.03 | 0.9683 | YES | Terdominasi |
| Radix Sort | 4542.46 | 0.9479 | YES | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YES | Terdominasi |

### Mengapa Vanilla Merge Sort adalah Titik Lutut

Vanilla Merge Sort ditetapkan sebagai **titik lutut matematis** karena mewakili keseimbangan optimal antara upaya pengguna (jumlah perbandingan) dan akurasi peringkat (korelasi Kendall Tau).

#### 1. Optimalisasi Matematis (Lutut Skala Log)
"Titik lutut" diidentifikasi menggunakan **metode Kneedle** dan **Jarak Tegak Lurus Maksimum** dari akord titik akhir pada garis depan Pareto. Saat memplot akurasi terhadap upaya pada sumbu skala log (log10(pertempuran + 1)), Merge Sort menempati "siku" kurva.
*   **Hasil yang Menurun:** Beralih dari "Miracle Sort" (99 pertempuran, 0,55 Tau) ke "Merge Sort" (~541 pertempuran, 0,90 Tau) menghasilkan peningkatan akurasi yang sangat besar.
*   **Saturasi:** Bergerak melampaui Merge Sort ke "Rotation Merge Sort" (~714 pertempuran) hanya meningkatkan akurasi menjadi **0,915**. Tambahan 173 pertempuran hanya menghasilkan keuntungan marjinal 1%, menandai Merge Sort sebagai titik efisiensi puncak.

#### 2. Batasan "Tanpa Duplikat"
PreferenceRank memprioritaskan efisiensi pengguna dengan mengecualikan algoritma apa pun yang menghasilkan perbandingan duplikat. Banyak algoritma berperforma tinggi (Timsort, Quicksort, Shellsort) didiskualifikasi karena dioptimalkan untuk pola akses memori komputer daripada meminimalkan keputusan manusia yang unik. Merge Sort adalah algoritma "Murni Unik", memastikan setiap pertempuran memberikan data segar ke model penilaian.

#### 3. Stabilitas dan Implementasi
Meskipun varian In-place dan Rotation Merge Sort juga muncul di garis depan Pareto, implementasi **Vanilla** dipilih untuk produksi karena **stabilitas** bawaannya (menjaga urutan relatif dari hasil seri) dan kesederhanaannya, yang menghindari beban kinerja rotasi data yang kompleks.

## 2. Perbandingan In-place dan Block Merge Sort

Bagian berikut merinci pertukaran antara vanilla merge sort, basic in-place merge sort, dan varian block merge sort.

### Penggunaan Memori

* **Vanilla Merge Sort:** Memerlukan ruang tambahan O(n). Algoritma ini mengalokasikan array scratchpad sekunder dengan ukuran yang identik dengan input untuk menangani pencampuran data.
* **In-Place Merge Sort:** Memerlukan ruang tambahan O(1) untuk varian iteratif, atau ruang O(log n) untuk versi rekursif untuk mengelola tumpukan panggilan. Tidak ada buffer data sekunder yang dihasilkan.

### Kompleksitas Waktu dan Performa

* **Vanilla Merge Sort:** Menjamin kompleksitas waktu O(n log n) yang ketat di semua kasus (terbaik, terburuk, dan rata-rata). Ini cepat dalam praktiknya karena elemen disalin secara berurutan, yang memaksimalkan efisiensi cache CPU.
* **In-Place Merge Sort:** Seringkali mengalami penurunan kecepatan. Implementasi dasar turun ke waktu O(n^2) karena pergeseran elemen internal yang sering (mirip dengan mekanika insertion sort). Merge in-place berbasis rotasi (seperti `Rotation Merge Sort`) mencapai O(n log^2 n) tetapi berjalan jauh lebih lambat karena overhead swap pointer yang intens dan lokalitas cache CPU yang buruk. Block merge sort yang sangat teroptimasi mencapai O(n log n) tetapi sangat kompleks untuk diimplementasikan.

### Stabilitas Algoritma

* **Vanilla Merge Sort:** Inheren stabil. Secara alami menjaga urutan relatif asli dari elemen duplikat karena menggabungkan dari kiri ke kanan dari array yang berbeda.
* **In-Place Merge Sort:** Seringkali tidak stabil. Untuk menghindari alokasi memori, sebagian besar versi harus memindahkan elemen melalui rotasi data yang kompleks atau swap internal, yang biasanya merusak urutan relatif dari kunci yang identik.
* **Block Merge Sort:** Varian yang sangat kompleks yang mencapai pengurutan O(n log n) yang stabil dengan ruang tambahan O(1) dengan menggunakan buffer internal yang diekstraksi dari data itu sendiri.

### Perbandingan Struktural

| Fitur | Vanilla Merge Sort | In-Place (Rotation) | Block Merge Sort |
| :--- | :--- | :--- | :--- |
| Kompleksitas Waktu | O(n log n) | O(n log^2 n) | O(n log n) |
| Ruang Tambahan | O(n) | O(1) atau O(log n) | O(1) |
| Stabilitas | Stabil | Tidak Stabil | Stabil |
| Kompleksitas Implementasi | Sederhana | Moderat | Sangat Tinggi |

### Regresi Estimasi Jumlah Pertempuran
Untuk Merge Sort (Titik Lutut Produksi yang baru):
- **Rumus:** `Pertempuran Unik ~ N * log2(N) - (N - 1)`
- Untuk N=100, ini memprediksi ~565 pertempuran (rata-rata simulasi ~541 unik).

---

## 3. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~43% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor yang dibulatkan ke integer).

## 4. Stabilitas Tolok Ukur dan Optimalisasi Uji Coba

Untuk memastikan keandalan peringkat kami, kami menganalisis dampak jumlah uji coba pada stabilitas tolok ukur. Jumlah uji coba optimal diidentifikasi sebagai **200** menggunakan analisis titik lutut skala log dari standard error of the mean (SEM).

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
