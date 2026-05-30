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
| Exit Sort | 0.00 | -0.0013 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.75 | 0.0096 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5428 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.99 | 0.8892 | TIDAK | Pareto-optimal |
| In-place Merge Sort | 541.74 | 0.9031 | TIDAK | Pareto-optimal |
| **Merge Sort** | 541.99 | 0.9040 | TIDAK | **Titik Lutut Produksi** |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0038 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | -0.0071 | TIDAK | Terdominasi |
| BogoBogoSort | 44.12 | 0.0840 | YA | Terdominasi |
| Heap Sort | 97.42 | 0.4792 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3497 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.0983 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5440 | YA | Terdominasi |
| Sleep Sort | 100.00 | 0.0036 | TIDAK | Terdominasi |
| Smooth Sort | 100.25 | 0.4827 | YA | Terdominasi |
| 3-Way Quicksort | 101.48 | 0.3641 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2403 | YA | Terdominasi |
| Hater Sort | 195.91 | 0.6646 | YA | Terdominasi |
| Patience Sort | 198.22 | 0.4732 | YA | Terdominasi |
| Quicksort (Hoare) | 205.33 | 0.5223 | YA | Terdominasi |
| Random Sort | 233.29 | 0.6401 | YA | Terdominasi |
| Cycle Sort | 517.46 | 0.4358 | YA | Terdominasi |
| Triple-Pivot Quicksort | 531.03 | 0.8292 | YA | Terdominasi |
| Binary Insertion | 531.08 | 0.8867 | TIDAK | Terdominasi |
| Timsort | 533.38 | 0.8971 | YA | Terdominasi |
| 4-way Merge Sort | 543.63 | 0.9025 | TIDAK | Terdominasi |
| Tournament Sort | 557.73 | 0.8874 | TIDAK | Terdominasi |
| Parallel Merge Sort | 557.78 | 0.8865 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.46 | 0.8866 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 559.50 | 0.8868 | TIDAK | Terdominasi |
| Powersort | 562.72 | 0.9088 | YA | Terdominasi |
| 3-way Merge Sort | 568.17 | 0.8801 | TIDAK | Terdominasi |
| Natural Merge Sort | 576.67 | 0.8919 | YA | Terdominasi |
| Quicksort (Ninther) | 604.30 | 0.8418 | YA | Terdominasi |
| Quicksort (Random) | 641.96 | 0.8365 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 643.67 | 0.8368 | TIDAK | Terdominasi |
| Quicksort (LTR) | 645.79 | 0.8374 | TIDAK | Terdominasi |
| Quicksort (Middle) | 647.15 | 0.8375 | TIDAK | Terdominasi |
| Quicksort (RTL) | 647.97 | 0.8381 | TIDAK | Terdominasi |
| Parallel Quicksort | 648.99 | 0.8373 | TIDAK | Terdominasi |
| Tree Sort | 651.63 | 0.8371 | TIDAK | Terdominasi |
| Stable Quicksort | 655.29 | 0.8366 | TIDAK | Terdominasi |
| Shellsort | 670.18 | 0.9319 | YA | Terdominasi |
| Quicksort (Mo3) | 701.46 | 0.8277 | YA | Terdominasi |
| Intro Sort | 719.22 | 0.8067 | TIDAK | Terdominasi |
| BlockQuicksort | 719.53 | 0.8080 | TIDAK | Terdominasi |
| Strand Sort | 746.43 | 0.8230 | TIDAK | Terdominasi |
| Comb Sort | 851.18 | 0.9745 | YA | Terdominasi |
| Hayate-Shiki | 939.88 | 0.7841 | YA | Terdominasi |
| Bitonic Sort | 1037.29 | 0.9574 | YA | Terdominasi |
| Circle Sort | 1212.07 | 0.9696 | YA | Terdominasi |
| Slowsort | 1324.86 | 0.9484 | YA | Terdominasi |
| Insertion Sort | 2554.97 | 0.8004 | TIDAK | Terdominasi |
| Bubble Sort | 2573.69 | 0.8029 | YA | Terdominasi |
| Gnome Sort | 2580.36 | 0.8029 | YA | Terdominasi |
| Cocktail Shaker | 2596.14 | 0.8081 | YA | Terdominasi |
| Odd-Even Sort | 2612.70 | 0.8065 | YA | Terdominasi |
| Selection Sort | 2737.31 | 0.8909 | YA | Terdominasi |
| Cocktail Selection | 2770.76 | 0.9227 | YA | Terdominasi |
| Double Selection | 2782.18 | 0.9229 | YA | Terdominasi |
| Stooge Sort | 2875.11 | 0.9900 | YA | Terdominasi |
| Pancake Sort | 3078.48 | 0.9684 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Regresi Estimasi Jumlah Pertempuran
Untuk Merge Sort (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ≈ N * log2(N) - (N - 1)`
- For N=100, ini memprediksi ~565 battles (disimulasikan ~542 unique rata-rata).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~41% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).

## 3. Stabilitas Tolok Ukur dan Optimasi Uji Coba

Untuk memastikan keandalan peringkat kami, kami menganalisis dampak jumlah uji coba terhadap stabilitas tolok ukur. Jumlah uji coba optimal diidentifikasi sebagai **300** menggunakan analisis titik lutut skala log dari kesalahan standar rata-rata (SEM).

```
Trials	Vanilla_Tau	Vanilla_SEM	InPlace_Tau	InPlace_SEM	Mean_Diff	SEM_Diff	Total_SEM
50	0.90562	0.00165	0.90562	0.00165	0.000000	0.000000	0.003298
100	0.90306	0.00104	0.90306	0.00104	0.000000	0.000000	0.002088
150	0.90413	0.00102	0.90413	0.00102	0.000000	0.000000	0.002041
200	0.90489	0.00089	0.90489	0.00089	0.000000	0.000000	0.001782
250	0.90314	0.00076	0.90314	0.00076	0.000000	0.000000	0.001522
300	0.90416	0.00073	0.90416	0.00073	0.000000	0.000000	0.001463
350	0.90372	0.00065	0.90372	0.00065	0.000000	0.000000	0.001295
400	0.90312	0.00063	0.90312	0.00063	0.000000	0.000000	0.001254
450	0.90370	0.00058	0.90370	0.00058	0.000000	0.000000	0.001158
500	0.90370	0.00055	0.90370	0.00055	0.000000	0.000000	0.001102
550	0.90369	0.00050	0.90369	0.00050	0.000000	0.000000	0.001005
600	0.90441	0.00048	0.90441	0.00048	0.000000	0.000000	0.000958
650	0.90356	0.00047	0.90356	0.00047	0.000000	0.000000	0.000933
700	0.90316	0.00046	0.90316	0.00046	0.000000	0.000000	0.000922
750	0.90293	0.00045	0.90293	0.00045	0.000000	0.000000	0.000897
800	0.90428	0.00042	0.90428	0.00042	0.000000	0.000000	0.000849
850	0.90353	0.00042	0.90353	0.00042	0.000000	0.000000	0.000840
900	0.90390	0.00038	0.90390	0.00038	0.000000	0.000000	0.000762
950	0.90334	0.00039	0.90334	0.00039	0.000000	0.000000	0.000789
1000	0.90395	0.00038	0.90395	0.00038	0.000000	0.000000	0.000768
```
