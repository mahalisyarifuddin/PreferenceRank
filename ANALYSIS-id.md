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
| Exit Sort | 0.00 | 0.0010 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.74 | 0.0125 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5455 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.86 | 0.8894 | TIDAK | Pareto-optimal |
| **In-place Merge Sort** | 541.58 | 0.9037 | TIDAK | **Titik Lutut Produksi** |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0006 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | -0.0024 | TIDAK | Terdominasi |
| BogoBogoSort | 45.20 | 0.0899 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3446 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.0998 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5448 | YA | Terdominasi |
| Smooth Sort | 99.37 | 0.4747 | YA | Terdominasi |
| Heap Sort | 99.44 | 0.4826 | YA | Terdominasi |
| Sleep Sort | 100.00 | 0.0020 | TIDAK | Terdominasi |
| 3-Way Quicksort | 101.19 | 0.3714 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2390 | YA | Terdominasi |
| Hater Sort | 196.03 | 0.6613 | YA | Terdominasi |
| Patience Sort | 198.88 | 0.4862 | YA | Terdominasi |
| Quicksort (Hoare) | 199.80 | 0.5258 | YA | Terdominasi |
| Random Sort | 243.38 | 0.6436 | YA | Terdominasi |
| Binary Insertion | 530.61 | 0.8876 | TIDAK | Terdominasi |
| Timsort | 532.64 | 0.8970 | YA | Terdominasi |
| Triple-Pivot Quicksort | 535.74 | 0.8289 | YA | Terdominasi |
| Merge Sort | 541.78 | 0.9031 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.60 | 0.9034 | TIDAK | Terdominasi |
| Cycle Sort | 549.71 | 0.4431 | YA | Terdominasi |
| Tournament Sort | 557.12 | 0.8867 | TIDAK | Terdominasi |
| Parallel Merge Sort | 557.40 | 0.8853 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.31 | 0.8871 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.76 | 0.8879 | TIDAK | Terdominasi |
| Powersort | 562.08 | 0.9073 | YA | Terdominasi |
| 3-way Merge Sort | 566.84 | 0.8796 | TIDAK | Terdominasi |
| Natural Merge Sort | 578.28 | 0.8928 | YA | Terdominasi |
| Quicksort (Ninther) | 605.76 | 0.8421 | YA | Terdominasi |
| Quicksort (Middle) | 644.16 | 0.8373 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 644.56 | 0.8368 | TIDAK | Terdominasi |
| Quicksort (RTL) | 644.66 | 0.8365 | TIDAK | Terdominasi |
| Tree Sort | 646.14 | 0.8365 | TIDAK | Terdominasi |
| Parallel Quicksort | 651.54 | 0.8371 | TIDAK | Terdominasi |
| Quicksort (LTR) | 651.62 | 0.8370 | TIDAK | Terdominasi |
| Quicksort (Random) | 651.86 | 0.8373 | TIDAK | Terdominasi |
| Stable Quicksort | 655.33 | 0.8363 | TIDAK | Terdominasi |
| Shellsort | 673.24 | 0.9333 | YA | Terdominasi |
| Quicksort (Mo3) | 707.04 | 0.8282 | YA | Terdominasi |
| Intro Sort | 717.94 | 0.8067 | TIDAK | Terdominasi |
| BlockQuicksort | 721.63 | 0.8073 | TIDAK | Terdominasi |
| Strand Sort | 740.95 | 0.8215 | TIDAK | Terdominasi |
| Comb Sort | 851.51 | 0.9746 | YA | Terdominasi |
| Hayate-Shiki | 933.34 | 0.7874 | YA | Terdominasi |
| Bitonic Sort | 1037.85 | 0.9576 | YA | Terdominasi |
| Circle Sort | 1208.33 | 0.9691 | YA | Terdominasi |
| Slowsort | 1318.27 | 0.9478 | YA | Terdominasi |
| Insertion Sort | 2569.03 | 0.8023 | TIDAK | Terdominasi |
| Bubble Sort | 2570.84 | 0.8036 | YA | Terdominasi |
| Gnome Sort | 2576.10 | 0.8041 | YA | Terdominasi |
| Cocktail Shaker | 2584.04 | 0.8078 | YA | Terdominasi |
| Odd-Even Sort | 2618.82 | 0.8066 | YA | Terdominasi |
| Cocktail Selection | 2738.95 | 0.9225 | YA | Terdominasi |
| Selection Sort | 2742.28 | 0.8888 | YA | Terdominasi |
| Double Selection | 2758.65 | 0.9214 | YA | Terdominasi |
| Stooge Sort | 2881.61 | 0.9900 | YA | Terdominasi |
| Pancake Sort | 3059.09 | 0.9682 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Regresi Estimasi Jumlah Pertempuran
Untuk In-place Merge Sort (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ≈ N * log2(N) - (N - 1)`
- For N=100, ini memprediksi ~565 battles (disimulasikan ~542 unique rata-rata).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~45% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).
