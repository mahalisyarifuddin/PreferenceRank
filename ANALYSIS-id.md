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
| Intelligent Design | 0.00 | 0.0087 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.81 | 0.0195 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5457 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.81 | 0.8889 | TIDAK | Pareto-optimal |
| **Merge Sort** | 541.71 | 0.9034 | TIDAK | **Titik Lutut Produksi** |
| 4-way Merge Sort | 543.22 | 0.9048 | TIDAK | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0012 | TIDAK | Terdominasi |
| Exit Sort | 0.00 | -0.0062 | TIDAK | Terdominasi |
| BogoBogoSort | 45.24 | 0.0887 | YA | Terdominasi |
| Smooth Sort | 98.11 | 0.4798 | YA | Terdominasi |
| Heap Sort | 98.82 | 0.4762 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3384 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.1016 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5472 | YA | Terdominasi |
| Sleep Sort | 100.00 | 0.0063 | TIDAK | Terdominasi |
| 3-Way Quicksort | 100.00 | 0.3615 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2347 | YA | Terdominasi |
| Hater Sort | 196.23 | 0.6630 | YA | Terdominasi |
| Patience Sort | 198.57 | 0.4781 | YA | Terdominasi |
| Quicksort (Hoare) | 201.44 | 0.5138 | YA | Terdominasi |
| Random Sort | 236.68 | 0.6285 | YA | Terdominasi |
| Cycle Sort | 530.07 | 0.4391 | YA | Terdominasi |
| Binary Insertion | 530.67 | 0.8883 | TIDAK | Terdominasi |
| Timsort | 532.40 | 0.8954 | YA | Terdominasi |
| Triple-Pivot Quicksort | 541.53 | 0.8277 | YA | Terdominasi |
| In-place Merge Sort | 542.07 | 0.9026 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 557.90 | 0.8852 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.21 | 0.8865 | TIDAK | Terdominasi |
| Tournament Sort | 558.31 | 0.8867 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.39 | 0.8864 | TIDAK | Terdominasi |
| Powersort | 562.02 | 0.9085 | YA | Terdominasi |
| 3-way Merge Sort | 567.70 | 0.8803 | TIDAK | Terdominasi |
| Natural Merge Sort | 578.31 | 0.8917 | YA | Terdominasi |
| Quicksort (Ninther) | 604.10 | 0.8419 | YA | Terdominasi |
| Quicksort (Random) | 641.35 | 0.8366 | TIDAK | Terdominasi |
| Quicksort (Middle) | 643.60 | 0.8358 | TIDAK | Terdominasi |
| Stable Quicksort | 645.40 | 0.8375 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 646.56 | 0.8364 | TIDAK | Terdominasi |
| Tree Sort | 648.73 | 0.8366 | TIDAK | Terdominasi |
| Parallel Quicksort | 648.84 | 0.8365 | TIDAK | Terdominasi |
| Quicksort (LTR) | 649.12 | 0.8372 | TIDAK | Terdominasi |
| Quicksort (RTL) | 650.60 | 0.8367 | TIDAK | Terdominasi |
| Shellsort | 670.82 | 0.9314 | YA | Terdominasi |
| Quicksort (Mo3) | 702.53 | 0.8272 | YA | Terdominasi |
| Intro Sort | 715.22 | 0.8080 | TIDAK | Terdominasi |
| BlockQuicksort | 725.04 | 0.8067 | TIDAK | Terdominasi |
| Strand Sort | 737.73 | 0.8174 | TIDAK | Terdominasi |
| Comb Sort | 851.63 | 0.9746 | YA | Terdominasi |
| Hayate-Shiki | 931.93 | 0.7823 | YA | Terdominasi |
| Bitonic Sort | 1036.71 | 0.9574 | YA | Terdominasi |
| Circle Sort | 1206.98 | 0.9694 | YA | Terdominasi |
| Slowsort | 1321.04 | 0.9481 | YA | Terdominasi |
| Cocktail Shaker | 2566.32 | 0.8045 | YA | Terdominasi |
| Bubble Sort | 2575.85 | 0.8013 | YA | Terdominasi |
| Insertion Sort | 2585.64 | 0.8038 | TIDAK | Terdominasi |
| Gnome Sort | 2589.39 | 0.8043 | YA | Terdominasi |
| Odd-Even Sort | 2592.26 | 0.8038 | YA | Terdominasi |
| Selection Sort | 2750.68 | 0.8909 | YA | Terdominasi |
| Cocktail Selection | 2756.68 | 0.9228 | YA | Terdominasi |
| Double Selection | 2770.46 | 0.9216 | YA | Terdominasi |
| Stooge Sort | 2881.02 | 0.9901 | YA | Terdominasi |
| Pancake Sort | 3088.26 | 0.9686 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Regresi Estimasi Jumlah Pertempuran
Untuk Merge Sort (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ≈ N * log2(N) - (N - 1)`
- For N=100, ini memprediksi ~565 battles (disimulasikan ~542 unique rata-rata).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).
