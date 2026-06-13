# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 78 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut Pareto-optimal (menggunakan sumbu skala log untuk jumlah pertempuran unik) untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **N Value:** 100
- **Trials:** 250 per algorithm.

### Hasil (N=100)
| Algoritma | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|-----------------------|-----------------------|-----------|---------------|
| Intelligent Design | 0.00 | 0.0028 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.80 | 0.0167 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5457 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.79 | 0.8888 | TIDAK | Pareto-optimal |
| **Merge Sort** | 541.98 | 0.9050 | TIDAK | **Titik Lutut Produksi** |
| In-place Merge Sort | 542.61 | 0.9040 | TIDAK | Pareto-optimal |
| 4-way Merge Sort | 543.28 | 0.9029 | TIDAK | Pareto-optimal |
| Rotation Merge Sort | 711.75 | 0.9146 | TIDAK | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0006 | TIDAK | Terdominasi |
| Exit Sort | 0.00 | 0.0025 | TIDAK | Terdominasi |
| BogoBogoSort | 44.20 | 0.0856 | YA | Terdominasi |
| Heap Sort | 98.68 | 0.4782 | YA | Terdominasi |
| Thanos Sort | 99.00 | 0.5429 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3383 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.1029 | TIDAK | Terdominasi |
| Smooth Sort | 99.27 | 0.4795 | YA | Terdominasi |
| Sleep Sort | 100.00 | 0.0012 | TIDAK | Terdominasi |
| 3-Way Quicksort | 100.79 | 0.3600 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2377 | YA | Terdominasi |
| PDQSort | 194.52 | 0.5267 | YA | Terdominasi |
| Hater Sort | 196.08 | 0.6640 | YA | Terdominasi |
| Patience Sort | 199.58 | 0.4820 | YA | Terdominasi |
| Quicksort (Hoare) | 202.46 | 0.5143 | YA | Terdominasi |
| Random Sort | 238.39 | 0.6291 | YA | Terdominasi |
| Cycle Sort | 515.34 | 0.4504 | YA | Terdominasi |
| Binary Insertion | 530.74 | 0.8876 | TIDAK | Terdominasi |
| Recursive Binary Insertion | 530.86 | 0.8879 | TIDAK | Terdominasi |
| Timsort | 532.61 | 0.8960 | YA | Terdominasi |
| Triple-Pivot Quicksort | 536.00 | 0.8278 | YA | Terdominasi |
| Tournament Sort | 557.52 | 0.8866 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.06 | 0.8865 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.18 | 0.8850 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.53 | 0.8859 | TIDAK | Terdominasi |
| Powersort | 561.86 | 0.9072 | YA | Terdominasi |
| 3-way Merge Sort | 566.70 | 0.8800 | TIDAK | Terdominasi |
| Natural Merge Sort | 577.58 | 0.8914 | YA | Terdominasi |
| Quicksort (Ninther) | 603.51 | 0.8421 | YA | Terdominasi |
| Dual-Pivot Quicksort | 646.78 | 0.8373 | TIDAK | Terdominasi |
| Quicksort (RTL) | 647.71 | 0.8369 | TIDAK | Terdominasi |
| Parallel Quicksort | 648.13 | 0.8368 | TIDAK | Terdominasi |
| Quicksort (LTR) | 648.16 | 0.8374 | TIDAK | Terdominasi |
| Stable Quicksort | 648.93 | 0.8371 | TIDAK | Terdominasi |
| Quicksort (Random) | 649.41 | 0.8363 | TIDAK | Terdominasi |
| Tree Sort | 651.08 | 0.8362 | TIDAK | Terdominasi |
| Quicksort (Middle) | 655.46 | 0.8375 | TIDAK | Terdominasi |
| Recursive Shellsort | 667.59 | 0.9324 | YA | Terdominasi |
| Shellsort | 670.21 | 0.9324 | YA | Terdominasi |
| Quicksort (Mo3) | 710.36 | 0.8281 | YA | Terdominasi |
| Intro Sort | 716.46 | 0.8073 | TIDAK | Terdominasi |
| BlockQuicksort | 719.20 | 0.8062 | TIDAK | Terdominasi |
| Strand Sort | 742.42 | 0.8149 | TIDAK | Terdominasi |
| Bucket Sort | 759.93 | 0.8007 | TIDAK | Terdominasi |
| Comb Sort | 851.45 | 0.9744 | YA | Terdominasi |
| Recursive Comb Sort | 851.53 | 0.9745 | YA | Terdominasi |
| Hayate-Shiki | 935.64 | 0.7833 | YA | Terdominasi |
| Bitonic Sort | 1035.14 | 0.9578 | YA | Terdominasi |
| Circle Sort | 1214.68 | 0.9698 | YA | Terdominasi |
| Slowsort | 1325.05 | 0.9478 | YA | Terdominasi |
| Recursive Bubble | 2550.57 | 0.8017 | YA | Terdominasi |
| Bubble Sort | 2563.62 | 0.8022 | YA | Terdominasi |
| Cocktail Shaker | 2566.20 | 0.8055 | YA | Terdominasi |
| Recursive Insertion | 2568.82 | 0.8033 | TIDAK | Terdominasi |
| Recursive Cocktail | 2579.24 | 0.8066 | YA | Terdominasi |
| Recursive Gnome | 2582.67 | 0.8019 | YA | Terdominasi |
| Insertion Sort | 2583.05 | 0.8043 | TIDAK | Terdominasi |
| Gnome Sort | 2589.26 | 0.8027 | YA | Terdominasi |
| Odd-Even Sort | 2589.76 | 0.8021 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2608.10 | 0.8057 | YA | Terdominasi |
| Cocktail Selection | 2754.22 | 0.9228 | YA | Terdominasi |
| Double Selection | 2755.62 | 0.9227 | YA | Terdominasi |
| Selection Sort | 2755.90 | 0.8899 | YA | Terdominasi |
| Recursive Double Selection | 2756.15 | 0.9220 | YA | Terdominasi |
| Recursive Selection | 2766.95 | 0.8904 | YA | Terdominasi |
| Stooge Sort | 2888.18 | 0.9901 | YA | Terdominasi |
| Pancake Sort | 3083.92 | 0.9687 | YA | Terdominasi |
| Radix Sort | 4525.35 | 0.9450 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Mengapa Vanilla Merge Sort adalah Titik Lutut

Vanilla Merge Sort ditetapkan sebagai **titik lutut matematis** karena mewakili keseimbangan optimal antara upaya pengguna (jumlah perbandingan) dan akurasi peringkat (korelasi Kendall Tau).

#### 1. Optimalisasi Matematis (Lutut Skala Log)
"Titik lutut" diidentifikasi menggunakan **metode Kneedle** dan **Jarak Tegak Lurus Maksimum** dari akord titik akhir pada garis depan Pareto. Saat memplot akurasi terhadap upaya pada sumbu skala log ($log_{10}(\text{pertempuran} + 1)$), Merge Sort menempati bagian "siku" dari kurva tersebut.
*   **Hasil yang Menurun:** Berpindah dari "Miracle Sort" (99 pertempuran, 0.54 Tau) ke "Merge Sort" (~542 pertempuran, 0.90 Tau) menghasilkan peningkatan akurasi yang masif.
*   **Saturasi:** Berpindah melampaui Merge Sort ke "Rotation Merge Sort" (~712 pertempuran) hanya meningkatkan akurasi menjadi **0.91**. Tambahan 170 pertempuran hanya menghasilkan keuntungan marjinal 1%, menandai Merge Sort sebagai titik efisiensi puncak.

#### 2. Batasan "Tanpa Duplikasi"
PreferenceRank memprioritaskan efisiensi pengguna dengan mengecualikan algoritma apa pun yang menghasilkan perbandingan duplikat. Banyak algoritma berkinerja tinggi (Timsort, Quicksort, Shellsort) didiskualifikasi karena dioptimalkan untuk pola akses memori komputer daripada meminimalkan keputusan manusia yang unik. Merge Sort adalah algoritma "Murni Unik", memastikan setiap pertarungan memberikan data segar ke model penilaian.

#### 3. Stabilitas dan Implementasi
Meskipun varian In-place dan Rotation Merge Sort juga muncul di garis depan Pareto, implementasi **Vanilla** dipilih untuk produksi karena **stabilitas** bawaannya (mempertahankan urutan relatif dari hasil seri) dan kesederhanaannya, yang menghindari overhead performa dari rotasi data yang kompleks.

Bagian berikut merinci trade-off antara vanilla merge sort, basic in-place merge sort, dan varian block merge sort.

### Penggunaan Memori

* **Vanilla Merge Sort:** Memerlukan ruang tambahan O(n). Ini mengalokasikan array scratchpad sekunder dengan ukuran yang sama dengan input untuk menangani pencampuran data.
* **In-Place Merge Sort:** Memerlukan ruang tambahan O(1) untuk varian iteratif, atau $O(\log n)$ untuk versi rekursif untuk mengelola tumpukan panggilan. Tidak ada buffer data sekunder yang dihasilkan.

### Kompleksitas Waktu dan Performa

* **Vanilla Merge Sort:** Menjamin kompleksitas waktu $O(n \log n)$ yang ketat di kasus terbaik, terburuk, dan rata-rata. Ini cepat dalam praktiknya karena elemen disalin secara berurutan, yang memaksimalkan efisiensi cache CPU.
* **In-Place Merge Sort:** Seringkali mengalami penurunan kecepatan. Implementasi dasar turun ke waktu O(n²) karena pergeseran elemen internal yang sering (mirip dengan mekanika insertion sort). Penggabungan in-place berbasis rotasi (seperti `Rotation Merge Sort`) mencapai $O(n \log^2 n)$ tetapi berjalan jauh lebih lambat karena overhead swap pointer yang intens dan lokalitas cache CPU yang buruk. Varian block merge sort yang sangat dioptimalkan mencapai $O(n \log n)$ tetapi sangat kompleks untuk diimplementasikan.

### Stabilitas Algoritma

* **Vanilla Merge Sort:** Inheren stabil. Secara alami mempertahankan urutan relatif asli dari elemen duplikat karena menggabungkan dari kiri ke kanan dari array yang berbeda.
* **In-Place Merge Sort:** Seringkali tidak stabil. Untuk menghindari alokasi memori, sebagian besar versi harus memindahkan elemen melalui rotasi data yang kompleks atau swap internal, yang biasanya merusak urutan relatif dari kunci yang identik.
* **Block Merge Sort:** Varian yang sangat kompleks yang mencapai pengurutan $O(n \log n)$ yang stabil dengan ruang tambahan O(1) dengan menggunakan buffer internal yang diekstraksi dari data itu sendiri.

### Perbandingan Struktural

| Fitur | Vanilla Merge Sort | In-Place (Rotasi) | Block Merge Sort |
| :--- | :--- | :--- | :--- |
| Kompleksitas Waktu | $O(n \log n)$ | $O(n \log^2 n)$ | $O(n \log n)$ |
| Ruang Tambahan | O(n) | O(1) atau $O(\log n)$ | O(1) |
| Stabilitas | Stabil | Tidak Stabil | Stabil |
| Kompleksitas Implementasi | Sederhana | Sedang | Sangat Tinggi |

### Regresi Estimasi Jumlah Pertempuran
Untuk Merge Sort (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ≈ N * log2(N) - (N - 1)`
- For N=100, ini memprediksi ~565 battles (disimulasikan ~542 unique rata-rata).

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
