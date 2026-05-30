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
| Exit Sort | 0.00 | 0.0054 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.72 | 0.0170 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5475 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.82 | 0.8890 | TIDAK | Pareto-optimal |
| Merge Sort | 541.23 | 0.9039 | TIDAK | Pareto-optimal |
| **In-place Merge Sort** | 541.76 | 0.9046 | TIDAK | **Titik Lutut Produksi** |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0023 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | -0.0025 | TIDAK | Terdominasi |
| BogoBogoSort | 44.26 | 0.0893 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3630 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.0970 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5467 | YA | Terdominasi |
| Heap Sort | 99.56 | 0.4803 | YA | Terdominasi |
| Sleep Sort | 100.00 | -0.0059 | TIDAK | Terdominasi |
| Smooth Sort | 100.80 | 0.4860 | YA | Terdominasi |
| 3-Way Quicksort | 101.58 | 0.3448 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2464 | YA | Terdominasi |
| Hater Sort | 196.09 | 0.6637 | YA | Terdominasi |
| Patience Sort | 199.25 | 0.4868 | YA | Terdominasi |
| Quicksort (Hoare) | 203.70 | 0.5313 | YA | Terdominasi |
| Random Sort | 254.65 | 0.6600 | YA | Terdominasi |
| Cycle Sort | 504.61 | 0.4230 | YA | Terdominasi |
| Binary Insertion | 530.44 | 0.8875 | TIDAK | Terdominasi |
| Timsort | 532.38 | 0.8943 | YA | Terdominasi |
| Triple-Pivot Quicksort | 534.50 | 0.8286 | YA | Terdominasi |
| 4-way Merge Sort | 542.69 | 0.9023 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.03 | 0.8863 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.25 | 0.8873 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.29 | 0.8862 | TIDAK | Terdominasi |
| Tournament Sort | 558.73 | 0.8867 | TIDAK | Terdominasi |
| Powersort | 562.54 | 0.9078 | YA | Terdominasi |
| 3-way Merge Sort | 568.33 | 0.8800 | TIDAK | Terdominasi |
| Natural Merge Sort | 578.56 | 0.8935 | YA | Terdominasi |
| Quicksort (Ninther) | 602.87 | 0.8423 | YA | Terdominasi |
| Quicksort (LTR) | 637.28 | 0.8373 | TIDAK | Terdominasi |
| Tree Sort | 644.16 | 0.8363 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 645.96 | 0.8372 | TIDAK | Terdominasi |
| Quicksort (RTL) | 647.14 | 0.8377 | TIDAK | Terdominasi |
| Quicksort (Random) | 647.97 | 0.8368 | TIDAK | Terdominasi |
| Parallel Quicksort | 651.38 | 0.8369 | TIDAK | Terdominasi |
| Stable Quicksort | 651.82 | 0.8362 | TIDAK | Terdominasi |
| Quicksort (Middle) | 652.87 | 0.8361 | TIDAK | Terdominasi |
| Shellsort | 671.36 | 0.9328 | YA | Terdominasi |
| Quicksort (Mo3) | 709.14 | 0.8277 | YA | Terdominasi |
| BlockQuicksort | 718.28 | 0.8073 | TIDAK | Terdominasi |
| Intro Sort | 722.06 | 0.8072 | TIDAK | Terdominasi |
| Strand Sort | 740.23 | 0.8193 | TIDAK | Terdominasi |
| Comb Sort | 851.81 | 0.9747 | YA | Terdominasi |
| Hayate-Shiki | 932.18 | 0.7849 | YA | Terdominasi |
| Bitonic Sort | 1037.63 | 0.9577 | YA | Terdominasi |
| Circle Sort | 1210.62 | 0.9702 | YA | Terdominasi |
| Slowsort | 1320.52 | 0.9465 | YA | Terdominasi |
| Insertion Sort | 2568.90 | 0.8013 | TIDAK | Terdominasi |
| Cocktail Shaker | 2569.86 | 0.8075 | YA | Terdominasi |
| Bubble Sort | 2580.12 | 0.8035 | YA | Terdominasi |
| Gnome Sort | 2588.91 | 0.8039 | YA | Terdominasi |
| Odd-Even Sort | 2600.93 | 0.8052 | YA | Terdominasi |
| Double Selection | 2743.44 | 0.9218 | YA | Terdominasi |
| Cocktail Selection | 2752.02 | 0.9223 | YA | Terdominasi |
| Selection Sort | 2766.80 | 0.8899 | YA | Terdominasi |
| Stooge Sort | 2877.99 | 0.9901 | YA | Terdominasi |
| Pancake Sort | 3076.83 | 0.9683 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Regresi Estimasi Jumlah Pertempuran
Untuk In-place Merge Sort (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ≈ N * log2(N) - (N - 1)`
- For N=100, ini memprediksi ~565 battles (disimulasikan ~542 unique rata-rata).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~43% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).
