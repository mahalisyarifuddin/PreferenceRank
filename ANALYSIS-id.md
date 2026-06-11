# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 67 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut Pareto-optimal untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Metric 1: Rata-rata Pertempuran:** Total perbandingan unik yang disajikan kepada pengguna.
- **Metric 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi (BT).
- **Metric 3: Duplikasi:** Menunjukkan apakah algoritma pernah meminta pasangan yang sama dua kali selama satu pengurutan.

### Hasil (N=100)
| Algoritma | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
| :--- | :--- | :--- | :--- | :--- |
| Exit Sort | 0.00 | 0.0042 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0185 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5443 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.50 | 0.8883 | TIDAK | Pareto-optimal |
| In-place Merge Sort | 541.92 | 0.9032 | TIDAK | Pareto-optimal |
| **Merge Sort** | 542.40 | 0.9043 | TIDAK | **Titik Lutut Produksi** |
| 4-way Merge Sort | 543.64 | 0.9049 | TIDAK | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0002 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | 0.0024 | TIDAK | Terdominasi |
| BogoBogoSort | 44.38 | 0.0907 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3493 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.1004 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5477 | YA | Terdominasi |
| Heap Sort | 99.44 | 0.4757 | YA | Terdominasi |
| Smooth Sort | 99.90 | 0.4822 | YA | Terdominasi |
| Sleep Sort | 100.00 | -0.0018 | TIDAK | Terdominasi |
| 3-Way Quicksort | 100.40 | 0.3553 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2414 | YA | Terdominasi |
| PDQSort | 193.24 | 0.5299 | YA | Terdominasi |
| Hater Sort | 196.16 | 0.6601 | YA | Terdominasi |
| Patience Sort | 197.36 | 0.4817 | YA | Terdominasi |
| Quicksort (Hoare) | 208.18 | 0.5422 | YA | Terdominasi |
| Random Sort | 225.15 | 0.6326 | YA | Terdominasi |
| Binary Insertion | 530.22 | 0.8863 | TIDAK | Terdominasi |
| Triple-Pivot Quicksort | 530.84 | 0.8291 | YA | Terdominasi |
| Timsort | 532.74 | 0.8953 | YA | Terdominasi |
| Parallel Merge Sort | 558.11 | 0.8871 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.48 | 0.8880 | TIDAK | Terdominasi |
| Tournament Sort | 559.00 | 0.8879 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 559.05 | 0.8872 | TIDAK | Terdominasi |
| Powersort | 563.29 | 0.9088 | YA | Terdominasi |
| 3-way Merge Sort | 566.74 | 0.8792 | TIDAK | Terdominasi |
| Natural Merge Sort | 577.60 | 0.8922 | YA | Terdominasi |
| Quicksort (Ninther) | 604.68 | 0.8421 | YA | Terdominasi |
| Quicksort (RTL) | 639.08 | 0.8365 | TIDAK | Terdominasi |
| Cycle Sort | 640.01 | 0.4481 | YA | Terdominasi |
| Tree Sort | 643.25 | 0.8369 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 644.86 | 0.8368 | TIDAK | Terdominasi |
| Quicksort (LTR) | 645.78 | 0.8362 | TIDAK | Terdominasi |
| Parallel Quicksort | 646.52 | 0.8364 | TIDAK | Terdominasi |
| Quicksort (Random) | 649.66 | 0.8369 | TIDAK | Terdominasi |
| Quicksort (Middle) | 649.79 | 0.8366 | TIDAK | Terdominasi |
| Stable Quicksort | 650.45 | 0.8371 | TIDAK | Terdominasi |
| Shellsort | 669.64 | 0.9332 | YA | Terdominasi |
| Quicksort (Mo3) | 701.75 | 0.8280 | YA | Terdominasi |
| BlockQuicksort | 708.30 | 0.8067 | TIDAK | Terdominasi |
| Intro Sort | 721.47 | 0.8077 | TIDAK | Terdominasi |
| Strand Sort | 744.45 | 0.8175 | TIDAK | Terdominasi |
| Bucket Sort | 766.32 | 0.7986 | TIDAK | Terdominasi |
| Comb Sort | 851.28 | 0.9750 | YA | Terdominasi |
| Hayate-Shiki | 937.26 | 0.7811 | YA | Terdominasi |
| Bitonic Sort | 1038.31 | 0.9572 | YA | Terdominasi |
| Circle Sort | 1210.50 | 0.9690 | YA | Terdominasi |
| Slowsort | 1322.83 | 0.9473 | YA | Terdominasi |
| Insertion Sort | 2560.05 | 0.8001 | TIDAK | Terdominasi |
| Gnome Sort | 2566.16 | 0.8022 | YA | Terdominasi |
| Cocktail Shaker | 2569.84 | 0.8066 | YA | Terdominasi |
| Bubble Sort | 2579.74 | 0.8028 | YA | Terdominasi |
| Odd-Even Sort | 2603.56 | 0.8050 | YA | Terdominasi |
| Selection Sort | 2745.33 | 0.8897 | YA | Terdominasi |
| Double Selection | 2756.29 | 0.9217 | YA | Terdominasi |
| Cocktail Selection | 2757.45 | 0.9232 | YA | Terdominasi |
| Stooge Sort | 2893.91 | 0.9900 | YA | Terdominasi |
| Pancake Sort | 3075.65 | 0.9684 | YA | Terdominasi |
| Radix Sort | 4537.68 | 0.9477 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Regresi Estimasi Jumlah Pertempuran
Untuk Merge Sort (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ≈ N * log2(N) - (N - 1)`
- For N=100, ini memprediksi ~565 battles (disimulasikan ~542 unique rata-rata).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~43% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).

## 3. Stabilitas Tolok Ukur dan Optimasi Uji Coba

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
