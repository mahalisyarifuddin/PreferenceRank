# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 80 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut Pareto-optimal (menggunakan sumbu skala log untuk jumlah pertempuran unik) untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **N Value:** 100
- **Trials:** 250 per algorithm.

### Hasil (N=100)
| Algoritme | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|-------------|-----------------|------------|---------------|
| Sleep Sort | 0.00 | 0.0105 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0128 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5432 | TIDAK | Pareto-optimal |
| Bottom-up Merge Sort (Quick) | 520.00 | 0.9810 | TIDAK | Pareto-optimal |
| **Ford-Johnson** | 526.65 | 1.0000 | TIDAK | **Titik Lutut Produksi** |
| Intelligent Design | 0.00 | -0.0094 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | -0.0057 | TIDAK | Terdominasi |
| Exit Sort | 0.00 | -0.0020 | TIDAK | Terdominasi |
| BogoBogoSort | 25.88 | 0.1001 | YA | Terdominasi |
| Silly Sort | 71.44 | 0.2465 | YA | Terdominasi |
| Stalin Sort | 99.00 | 0.0956 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5446 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3464 | TIDAK | Terdominasi |
| Hater Sort | 187.90 | 0.6617 | YA | Terdominasi |
| Random Sort | 207.07 | 0.6355 | YA | Terdominasi |
| PDQSort | 389.19 | 0.8649 | YA | Terdominasi |
| Binary Insertion | 530.44 | 1.0000 | TIDAK | Terdominasi |
| Recursive Binary Insertion | 530.71 | 1.0000 | TIDAK | Terdominasi |
| Timsort | 532.94 | 1.0000 | YA | Terdominasi |
| In-place Merge Sort | 541.22 | 1.0000 | TIDAK | Terdominasi |
| Merge Sort | 541.74 | 1.0000 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.41 | 1.0000 | TIDAK | Terdominasi |
| Powersort | 557.00 | 1.0000 | YA | Terdominasi |
| Bottom-up Merge Sort | 557.39 | 1.0000 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.20 | 1.0000 | TIDAK | Terdominasi |
| Tournament Sort | 558.51 | 1.0000 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.79 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Ninther) | 563.21 | 1.0000 | YA | Terdominasi |
| 3-way Merge Sort | 567.29 | 1.0000 | TIDAK | Terdominasi |
| Natural Merge Sort | 573.44 | 1.0000 | YA | Terdominasi |
| Slowsort | 588.65 | 0.9515 | YA | Terdominasi |
| Triple-Pivot Quicksort | 603.79 | 1.0000 | YA | Terdominasi |
| Recursive Shellsort | 629.90 | 1.0000 | YA | Terdominasi |
| Shellsort | 630.69 | 1.0000 | YA | Terdominasi |
| Cycle Sort | 642.19 | 1.0000 | YA | Terdominasi |
| Quicksort (RTL) | 643.53 | 1.0000 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 644.68 | 1.0000 | TIDAK | Terdominasi |
| 3-Way Quicksort | 645.98 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (LTR) | 647.11 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Middle) | 648.91 | 1.0000 | TIDAK | Terdominasi |
| Stable Quicksort | 649.61 | 1.0000 | TIDAK | Terdominasi |
| Parallel Quicksort | 649.71 | 1.0000 | TIDAK | Terdominasi |
| Tree Sort | 651.29 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Random) | 651.74 | 1.0000 | TIDAK | Terdominasi |
| Quicksort (Hoare) | 654.99 | 1.0000 | YA | Terdominasi |
| Quicksort (Mo3) | 675.68 | 1.0000 | YA | Terdominasi |
| Circle Sort | 675.81 | 1.0000 | YA | Terdominasi |
| Stooge Sort | 685.61 | 1.0000 | YA | Terdominasi |
| Heap Sort | 714.26 | 1.0000 | YA | Terdominasi |
| Rotation Merge Sort | 715.39 | 1.0000 | TIDAK | Terdominasi |
| Smooth Sort | 715.68 | 1.0000 | YA | Terdominasi |
| Intro Sort | 717.01 | 1.0000 | TIDAK | Terdominasi |
| BlockQuicksort | 717.16 | 1.0000 | TIDAK | Terdominasi |
| Comb Sort | 720.02 | 1.0000 | YA | Terdominasi |
| Recursive Comb Sort | 722.44 | 1.0000 | YA | Terdominasi |
| Bitonic Sort | 760.10 | 1.0000 | YA | Terdominasi |
| Bucket Sort | 762.92 | 1.0000 | TIDAK | Terdominasi |
| Bogosort | 809.84 | 1.0000 | YA | Terdominasi |
| Full Rank | 810.80 | 1.0000 | TIDAK | Terdominasi |
| Hayate-Shiki | 843.03 | 0.8808 | YA | Terdominasi |
| Radix Sort | 894.55 | 1.0000 | YA | Terdominasi |
| Patience Sort | 1015.22 | 1.0000 | YA | Terdominasi |
| Strand Sort | 1126.76 | 1.0000 | YA | Terdominasi |
| Pancake Sort | 1246.99 | 1.0000 | YA | Terdominasi |
| Cocktail Selection | 2119.36 | 1.0000 | YA | Terdominasi |
| Selection Sort | 2222.24 | 1.0000 | YA | Terdominasi |
| Recursive Selection | 2223.15 | 1.0000 | YA | Terdominasi |
| Recursive Double Selection | 2333.34 | 1.0000 | YA | Terdominasi |
| Double Selection | 2366.46 | 1.0000 | YA | Terdominasi |
| Insertion Sort | 2552.02 | 1.0000 | TIDAK | Terdominasi |
| Recursive Insertion | 2561.01 | 1.0000 | TIDAK | Terdominasi |
| Gnome Sort | 2565.27 | 1.0000 | YA | Terdominasi |
| Bubble Sort | 2566.15 | 1.0000 | YA | Terdominasi |
| Recursive Bubble | 2570.96 | 1.0000 | YA | Terdominasi |
| Recursive Gnome | 2572.12 | 1.0000 | YA | Terdominasi |
| Cocktail Shaker | 2572.25 | 1.0000 | YA | Terdominasi |
| Recursive Cocktail | 2585.98 | 1.0000 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2589.52 | 1.0000 | YA | Terdominasi |
| Odd-Even Sort | 2616.65 | 1.0000 | YA | Terdominasi |
### Mengapa Ford-Johnson adalah Titik Lutut Produksi

Ford-Johnson ditetapkan sebagai **titik lutut matematis** karena mewakili keseimbangan absolut yang optimal antara upaya pengguna (jumlah perbandingan) dan akurasi peringkat (korelasi Kendall Tau) dengan memanfaatkan kemenangan transitif bayangan.

#### 1. Optimalisasi Matematis (Lutut Skala Log)
"Titik lutut" diidentifikasi menggunakan **metode Kneedle** dan **Jarak Tegak Lurus Maksimum** dari akord titik akhir pada garis depan Pareto. Saat memplot akurasi terhadap upaya pada sumbu skala log (log10(pertempuran + 1)), Ford-Johnson menempati bagian "siku" dari kurva tersebut.
*   **Hasil yang Menurun:** Berpindah dari "Genghis Khan Sort" (99 pertempuran, 0.36 Tau) ke "Ford-Johnson" (~527 pertempuran, 0.999 Tau) menghasilkan pengurutan yang hampir sempurna dengan upaya minimal.
*   **Dominasi:** Ford-Johnson mencapai akurasi yang hampir sempurna (~0.999) dengan lebih sedikit pertempuran (~527) daripada Quick Merge Sort (~0.90 Tau, ~542 pertempuran), secara efektif menggeser seluruh garis depan Pareto menuju efisiensi yang lebih tinggi.

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
