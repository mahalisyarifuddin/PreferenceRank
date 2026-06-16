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
| Exit Sort | 0.00 | 0.0038 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.74 | 0.0105 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5483 | TIDAK | Pareto-optimal |
| **PrismChain Rank** | 520.00 | 0.9229 | TIDAK | **Titik Lutut Produksi** |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0012 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | -0.0007 | TIDAK | Terdominasi |
| BogoBogoSort | 44.87 | 0.0903 | YA | Terdominasi |
| Stalin Sort | 99.00 | 0.1043 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5456 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3474 | TIDAK | Terdominasi |
| Heap Sort | 99.36 | 0.4815 | YA | Terdominasi |
| Sleep Sort | 100.00 | -0.0140 | TIDAK | Terdominasi |
| 3-Way Quicksort | 100.00 | 0.3586 | YA | Terdominasi |
| Smooth Sort | 100.01 | 0.4909 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2389 | YA | Terdominasi |
| PDQSort | 195.26 | 0.5422 | YA | Terdominasi |
| Hater Sort | 195.93 | 0.6628 | YA | Terdominasi |
| Patience Sort | 197.97 | 0.4821 | YA | Terdominasi |
| Quicksort (Hoare) | 204.38 | 0.5383 | YA | Terdominasi |
| Random Sort | 243.23 | 0.6493 | YA | Terdominasi |
| Ford-Johnson | 527.06 | 0.8880 | TIDAK | Terdominasi |
| Triple-Pivot Quicksort | 530.10 | 0.8286 | YA | Terdominasi |
| Binary Insertion | 530.81 | 0.8862 | TIDAK | Terdominasi |
| Recursive Binary Insertion | 530.88 | 0.8859 | TIDAK | Terdominasi |
| Timsort | 532.69 | 0.8976 | YA | Terdominasi |
| Cycle Sort | 535.76 | 0.4528 | YA | Terdominasi |
| Merge Sort | 541.83 | 0.9028 | TIDAK | Terdominasi |
| In-place Merge Sort | 541.92 | 0.9048 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.70 | 0.9032 | TIDAK | Terdominasi |
| Tournament Sort | 557.97 | 0.8873 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.13 | 0.8865 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.31 | 0.8865 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.60 | 0.8868 | TIDAK | Terdominasi |
| Powersort | 562.07 | 0.9085 | YA | Terdominasi |
| 3-way Merge Sort | 567.59 | 0.8814 | TIDAK | Terdominasi |
| Natural Merge Sort | 578.50 | 0.8930 | YA | Terdominasi |
| Quicksort (Ninther) | 603.62 | 0.8424 | YA | Terdominasi |
| Tree Sort | 643.44 | 0.8364 | TIDAK | Terdominasi |
| Parallel Quicksort | 644.90 | 0.8365 | TIDAK | Terdominasi |
| Quicksort (RTL) | 646.32 | 0.8370 | TIDAK | Terdominasi |
| Quicksort (Middle) | 647.48 | 0.8375 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 648.23 | 0.8373 | TIDAK | Terdominasi |
| Quicksort (Random) | 648.98 | 0.8374 | TIDAK | Terdominasi |
| Stable Quicksort | 650.32 | 0.8368 | TIDAK | Terdominasi |
| Quicksort (LTR) | 655.66 | 0.8368 | TIDAK | Terdominasi |
| Shellsort | 671.71 | 0.9331 | YA | Terdominasi |
| Recursive Shellsort | 672.92 | 0.9316 | YA | Terdominasi |
| Quicksort (Mo3) | 711.33 | 0.8268 | YA | Terdominasi |
| Rotation Merge Sort | 715.24 | 0.9161 | TIDAK | Terdominasi |
| BlockQuicksort | 717.58 | 0.8070 | TIDAK | Terdominasi |
| Intro Sort | 723.76 | 0.8076 | YA | Terdominasi |
| Strand Sort | 743.33 | 0.8176 | TIDAK | Terdominasi |
| Bucket Sort | 764.08 | 0.7997 | TIDAK | Terdominasi |
| Comb Sort | 851.46 | 0.9745 | YA | Terdominasi |
| Recursive Comb Sort | 851.53 | 0.9748 | YA | Terdominasi |
| Hayate-Shiki | 931.10 | 0.7831 | YA | Terdominasi |
| Bitonic Sort | 1037.80 | 0.9571 | YA | Terdominasi |
| Circle Sort | 1216.41 | 0.9697 | YA | Terdominasi |
| Slowsort | 1322.11 | 0.9461 | YA | Terdominasi |
| Recursive Bubble | 2565.82 | 0.8028 | YA | Terdominasi |
| Gnome Sort | 2570.18 | 0.8032 | YA | Terdominasi |
| Insertion Sort | 2571.49 | 0.8030 | TIDAK | Terdominasi |
| Recursive Gnome | 2577.45 | 0.8022 | YA | Terdominasi |
| Cocktail Shaker | 2580.36 | 0.8055 | YA | Terdominasi |
| Recursive Cocktail | 2581.96 | 0.8091 | YA | Terdominasi |
| Bubble Sort | 2582.86 | 0.8041 | YA | Terdominasi |
| Recursive Insertion | 2589.20 | 0.8041 | TIDAK | Terdominasi |
| Odd-Even Sort | 2597.12 | 0.8045 | YA | Terdominasi |
| Recursive Odd-Even Sort | 2603.07 | 0.8068 | YA | Terdominasi |
| Selection Sort | 2732.62 | 0.8899 | YA | Terdominasi |
| Cocktail Selection | 2738.38 | 0.9234 | YA | Terdominasi |
| Double Selection | 2743.47 | 0.9217 | YA | Terdominasi |
| Recursive Selection | 2756.91 | 0.8905 | YA | Terdominasi |
| Recursive Double Selection | 2766.54 | 0.9215 | YA | Terdominasi |
| Stooge Sort | 2890.85 | 0.9900 | YA | Terdominasi |
| Pancake Sort | 3101.09 | 0.9693 | YA | Terdominasi |
| Radix Sort | 4523.60 | 0.9464 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Mengapa PrismChain Rank adalah Titik Lutut

PrismChain Rank ditetapkan sebagai **titik lutut matematis** karena mewakili keseimbangan absolut yang optimal antara upaya pengguna (jumlah perbandingan) dan akurasi peringkat (korelasi Kendall Tau) dengan memanfaatkan kemenangan transitif bayangan.

#### 1. Optimalisasi Matematis (Lutut Skala Log)
"Titik lutut" diidentifikasi menggunakan **metode Kneedle** dan **Jarak Tegak Lurus Maksimum** dari akord titik akhir pada garis depan Pareto. Saat memplot akurasi terhadap upaya pada sumbu skala log (log10(pertempuran + 1)), PrismChain Rank menempati bagian "siku" dari kurva tersebut.
*   **Hasil yang Menurun:** Berpindah dari "Miracle Sort" (99 pertempuran, 0.55 Tau) ke "PrismChain Rank" (~520 pertempuran, 0.92 Tau) menghasilkan peningkatan akurasi yang masif.
*   **Dominasi:** PrismChain Rank mencapai akurasi yang lebih tinggi (~0.92) dengan lebih sedikit pertempuran (~520) daripada Vanilla Merge Sort (~0.90 Tau, ~542 pertempuran), secara efektif menggeser seluruh garis depan Pareto menuju efisiensi yang lebih tinggi.

#### 2. Batasan "Tanpa Duplikasi"
PreferenceRank memprioritaskan efisiensi pengguna dengan mengecualikan algoritma apa pun yang menghasilkan perbandingan duplikat. Banyak algoritma berkinerja tinggi (Timsort, Quicksort, Shellsort) didiskualifikasi karena dioptimalkan untuk pola akses memori komputer daripada meminimalkan keputusan manusia yang unik. PrismChain Rank adalah algoritma "Murni Unik", memastikan setiap pertarungan memberikan data segar ke model penilaian.

#### 3. Kemenangan Bayangan dan Penutupan Transitif
PrismChain Rank mencapai kinerja unggulnya dengan menerapkan **penutupan transitif bayangan** pada hasil tulang punggung penggabungan parsial. Hal ini memungkinkan model Bradley-Terry untuk memanfaatkan kemenangan yang disimpulkan tanpa memerlukan pertempuran pengguna tambahan, memaksimalkan informasi yang diekstraksi dari setiap keputusan.

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
Untuk PrismChain Rank (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ~ N * log2(N) - 1.44 * N` (untuk N >= 16)
- For N=100, ini memprediksi ~520 battles (disimulasikan ~520 unique rata-rata).

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
