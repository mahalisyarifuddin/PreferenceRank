# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 64 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut Pareto-optimal untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Metric 1: Rata-rata Pertempuran:** Total perbandingan unik yang disajikan kepada pengguna.
- **Metric 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi (BT).
- **Metric 3: Duplikasi:** Menunjukkan apakah algoritma pernah meminta pasangan yang sama dua kali selama satu pengurutan.

### Hasil (N=100)
| Algoritma | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
| :--- | :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | -0.0009 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0240 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5505 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.97 | 0.8898 | TIDAK | Pareto-optimal |
| In-place Merge Sort | 541.85 | 0.9034 | TIDAK | Pareto-optimal |
| **Merge Sort** | 542.26 | 0.9054 | TIDAK | **Titik Lutut Produksi** |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Socialist Sort | 0.00 | -0.0093 | TIDAK | Terdominasi |
| Exit Sort | 0.00 | -0.0048 | TIDAK | Terdominasi |
| BogoBogoSort | 44.56 | 0.0895 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3484 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.1069 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5452 | YA | Terdominasi |
| Smooth Sort | 99.36 | 0.4767 | YA | Terdominasi |
| Sleep Sort | 100.00 | -0.0061 | TIDAK | Terdominasi |
| 3-Way Quicksort | 100.40 | 0.3414 | YA | Terdominasi |
| Heap Sort | 100.81 | 0.4841 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2431 | YA | Terdominasi |
| Hater Sort | 196.19 | 0.6643 | YA | Terdominasi |
| Patience Sort | 197.99 | 0.4822 | YA | Terdominasi |
| Quicksort (Hoare) | 201.05 | 0.5212 | YA | Terdominasi |
| Random Sort | 257.53 | 0.6674 | YA | Terdominasi |
| Cycle Sort | 497.28 | 0.4095 | YA | Terdominasi |
| Binary Insertion | 530.80 | 0.8870 | TIDAK | Terdominasi |
| Triple-Pivot Quicksort | 531.33 | 0.8274 | YA | Terdominasi |
| Timsort | 532.33 | 0.8962 | YA | Terdominasi |
| 4-way Merge Sort | 543.62 | 0.9022 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.20 | 0.8853 | TIDAK | Terdominasi |
| Tournament Sort | 558.21 | 0.8880 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.40 | 0.8873 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.61 | 0.8868 | TIDAK | Terdominasi |
| Powersort | 562.91 | 0.9079 | YA | Terdominasi |
| 3-way Merge Sort | 567.90 | 0.8802 | TIDAK | Terdominasi |
| Natural Merge Sort | 577.77 | 0.8929 | YA | Terdominasi |
| Quicksort (Ninther) | 603.94 | 0.8414 | YA | Terdominasi |
| Tree Sort | 642.21 | 0.8362 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 644.26 | 0.8367 | TIDAK | Terdominasi |
| Parallel Quicksort | 645.48 | 0.8366 | TIDAK | Terdominasi |
| Quicksort (Random) | 645.84 | 0.8370 | TIDAK | Terdominasi |
| Quicksort (LTR) | 647.63 | 0.8376 | TIDAK | Terdominasi |
| Quicksort (RTL) | 650.37 | 0.8380 | TIDAK | Terdominasi |
| Stable Quicksort | 651.68 | 0.8365 | TIDAK | Terdominasi |
| Quicksort (Middle) | 654.52 | 0.8368 | TIDAK | Terdominasi |
| Shellsort | 669.93 | 0.9326 | YA | Terdominasi |
| BlockQuicksort | 714.08 | 0.8067 | TIDAK | Terdominasi |
| Quicksort (Mo3) | 715.34 | 0.8278 | YA | Terdominasi |
| Intro Sort | 717.42 | 0.8066 | TIDAK | Terdominasi |
| Strand Sort | 742.84 | 0.8196 | TIDAK | Terdominasi |
| Comb Sort | 851.79 | 0.9747 | YA | Terdominasi |
| Hayate-Shiki | 934.54 | 0.7830 | YA | Terdominasi |
| Bitonic Sort | 1036.58 | 0.9567 | YA | Terdominasi |
| Circle Sort | 1212.30 | 0.9692 | YA | Terdominasi |
| Slowsort | 1320.97 | 0.9486 | YA | Terdominasi |
| Bubble Sort | 2553.59 | 0.8007 | YA | Terdominasi |
| Gnome Sort | 2568.57 | 0.8019 | YA | Terdominasi |
| Insertion Sort | 2570.98 | 0.8043 | TIDAK | Terdominasi |
| Cocktail Shaker | 2588.40 | 0.8078 | YA | Terdominasi |
| Odd-Even Sort | 2609.19 | 0.8049 | YA | Terdominasi |
| Cocktail Selection | 2745.26 | 0.9233 | YA | Terdominasi |
| Selection Sort | 2752.82 | 0.8899 | YA | Terdominasi |
| Double Selection | 2756.60 | 0.9234 | YA | Terdominasi |
| Stooge Sort | 2889.56 | 0.9902 | YA | Terdominasi |
| Pancake Sort | 3110.75 | 0.9698 | YA | Terdominasi |
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
