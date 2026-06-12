# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 68 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut Pareto-optimal (menggunakan sumbu skala log untuk jumlah pertempuran unik) untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **N Value:** 100
- **Trials:** 250 per algorithm.

### Hasil (N=100)
| Algoritma | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
|-----------|-----------------------|-----------------------|-----------|---------------|
| Socialist Sort | 0.00 | 0.0051 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.66 | 0.0150 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5443 | TIDAK | Pareto-optimal |
| Ford-Johnson | 527.00 | 0.8881 | TIDAK | Pareto-optimal |
| In-place Merge Sort | 541.79 | 0.9037 | TIDAK | Pareto-optimal |
| **Merge Sort** | 542.10 | 0.9047 | TIDAK | **Titik Lutut Produksi** |
| Rotation Merge Sort | 719.14 | 0.9162 | TIDAK | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| BogoBogoSort | 45.08 | 0.0897 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3413 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.0962 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5432 | YA | Terdominasi |
| Smooth Sort | 99.10 | 0.4819 | YA | Terdominasi |
| Heap Sort | 99.63 | 0.4831 | YA | Terdominasi |
| Sleep Sort | 100.00 | 0.0042 | TIDAK | Terdominasi |
| 3-Way Quicksort | 100.40 | 0.3521 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2409 | YA | Terdominasi |
| PDQSort | 194.04 | 0.5397 | YA | Terdominasi |
| Hater Sort | 195.92 | 0.6617 | YA | Terdominasi |
| Patience Sort | 198.63 | 0.4815 | YA | Terdominasi |
| Quicksort (Hoare) | 202.81 | 0.5319 | YA | Terdominasi |
| Random Sort | 227.79 | 0.6268 | YA | Terdominasi |
| Cycle Sort | 493.04 | 0.4458 | YA | Terdominasi |
| Binary Insertion | 530.58 | 0.8876 | TIDAK | Terdominasi |
| Timsort | 532.86 | 0.8958 | YA | Terdominasi |
| Triple-Pivot Quicksort | 534.81 | 0.8273 | YA | Terdominasi |
| 4-way Merge Sort | 543.85 | 0.9035 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.01 | 0.8861 | TIDAK | Terdominasi |
| Tournament Sort | 558.23 | 0.8862 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.36 | 0.8869 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.58 | 0.8872 | TIDAK | Terdominasi |
| Powersort | 562.20 | 0.9067 | YA | Terdominasi |
| 3-way Merge Sort | 567.92 | 0.8801 | TIDAK | Terdominasi |
| Natural Merge Sort | 576.91 | 0.8936 | YA | Terdominasi |
| Quicksort (Ninther) | 605.08 | 0.8424 | YA | Terdominasi |
| Parallel Quicksort | 640.13 | 0.8366 | TIDAK | Terdominasi |
| Quicksort (Random) | 644.97 | 0.8364 | TIDAK | Terdominasi |
| Quicksort (LTR) | 645.43 | 0.8367 | TIDAK | Terdominasi |
| Tree Sort | 650.48 | 0.8373 | TIDAK | Terdominasi |
| Quicksort (Middle) | 651.15 | 0.8371 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 651.60 | 0.8368 | TIDAK | Terdominasi |
| Stable Quicksort | 651.68 | 0.8371 | TIDAK | Terdominasi |
| Quicksort (RTL) | 652.68 | 0.8365 | TIDAK | Terdominasi |
| Shellsort | 670.90 | 0.9323 | YA | Terdominasi |
| BlockQuicksort | 712.38 | 0.8074 | TIDAK | Terdominasi |
| Quicksort (Mo3) | 714.68 | 0.8273 | YA | Terdominasi |
| Intro Sort | 722.48 | 0.8080 | TIDAK | Terdominasi |
| Strand Sort | 752.38 | 0.8175 | TIDAK | Terdominasi |
| Bucket Sort | 777.16 | 0.7984 | TIDAK | Terdominasi |
| Comb Sort | 852.84 | 0.9747 | YA | Terdominasi |
| Hayate-Shiki | 930.26 | 0.7829 | YA | Terdominasi |
| Bitonic Sort | 1036.59 | 0.9578 | YA | Terdominasi |
| Circle Sort | 1205.53 | 0.9689 | YA | Terdominasi |
| Slowsort | 1323.76 | 0.9483 | YA | Terdominasi |
| Gnome Sort | 2559.98 | 0.8021 | YA | Terdominasi |
| Insertion Sort | 2569.62 | 0.8023 | TIDAK | Terdominasi |
| Bubble Sort | 2571.98 | 0.8024 | YA | Terdominasi |
| Odd-Even Sort | 2585.90 | 0.8037 | YA | Terdominasi |
| Cocktail Shaker | 2591.84 | 0.8087 | YA | Terdominasi |
| Selection Sort | 2757.05 | 0.8894 | YA | Terdominasi |
| Cocktail Selection | 2769.04 | 0.9232 | YA | Terdominasi |
| Double Selection | 2778.82 | 0.9220 | YA | Terdominasi |
| Stooge Sort | 2889.10 | 0.9900 | YA | Terdominasi |
| Pancake Sort | 3083.51 | 0.9688 | YA | Terdominasi |
| Radix Sort | 4555.54 | 0.9493 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |
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
