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
| 3-Way Quicksort | 101.58 | 0.3620 | YA | Terdominasi |
| 3-way Merge Sort | 566.94 | 0.8808 | TIDAK | Terdominasi |
| 4-way Merge Sort | 543.44 | 0.9024 | TIDAK | Terdominasi |
| Binary Insertion | 530.61 | 0.8867 | TIDAK | Terdominasi |
| Bitonic Sort | 1037.33 | 0.9574 | YA | Terdominasi |
| BlockQuicksort | 717.95 | 0.8064 | TIDAK | Terdominasi |
| BogoBogoSort | 44.81 | 0.0927 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |
| Bottom-up Merge Sort | 558.57 | 0.8874 | TIDAK | Terdominasi |
| Bubble Sort | 2589.34 | 0.8044 | YA | Terdominasi |
| Circle Sort | 1211.16 | 0.9693 | YA | Terdominasi |
| Cocktail Selection | 2749.38 | 0.9220 | YA | Terdominasi |
| Cocktail Shaker | 2579.46 | 0.8076 | YA | Terdominasi |
| Comb Sort | 850.95 | 0.9747 | YA | Terdominasi |
| Cycle Sort | 528.88 | 0.4202 | YA | Terdominasi |
| Double Selection | 2774.61 | 0.9227 | YA | Terdominasi |
| Dual-Pivot Quicksort | 645.06 | 0.8370 | TIDAK | Terdominasi |
| Exit Sort | 0.00 | 0.0015 | TIDAK | Terdominasi |
| Ford-Johnson | 526.51 | 0.8880 | TIDAK | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3201 | TIDAK | Terdominasi |
| Gnome Sort | 2578.87 | 0.8033 | YA | Terdominasi |
| Hater Sort | 195.97 | 0.6639 | YA | Terdominasi |
| Hayate-Shiki | 930.57 | 0.7832 | YA | Terdominasi |
| Heap Sort | 98.08 | 0.4785 | YA | Terdominasi |
| In-place Merge Sort | 541.82 | 0.9029 | TIDAK | Pareto-optimal |
| Insertion Sort | 2565.09 | 0.8018 | TIDAK | Terdominasi |
| Intelligent Design | 0.00 | 0.0027 | TIDAK | Terdominasi |
| Intro Sort | 723.25 | 0.8063 | TIDAK | Terdominasi |
| **Merge Sort** | 542.16 | 0.9041 | TIDAK | **Titik Lutut Produksi** |
| Miracle Sort | 99.00 | 0.5424 | TIDAK | Pareto-optimal |
| Natural Merge Sort | 577.58 | 0.8924 | YA | Terdominasi |
| Odd-Even Sort | 2605.79 | 0.8053 | YA | Terdominasi |
| Pancake Sort | 3079.14 | 0.9688 | YA | Terdominasi |
| Parallel Merge Sort | 558.04 | 0.8872 | TIDAK | Terdominasi |
| Parallel Quicksort | 645.14 | 0.8367 | TIDAK | Terdominasi |
| Patience Sort | 198.50 | 0.4866 | YA | Terdominasi |
| Ping-pong Merge Sort | 558.58 | 0.8879 | TIDAK | Terdominasi |
| Powersort | 562.51 | 0.9071 | YA | Terdominasi |
| Quantum Bogo | 1.73 | 0.0121 | TIDAK | Pareto-optimal |
| Quicksort (Hoare) | 207.09 | 0.5238 | YA | Terdominasi |
| Quicksort (LTR) | 650.76 | 0.8371 | TIDAK | Terdominasi |
| Quicksort (Middle) | 647.08 | 0.8371 | TIDAK | Terdominasi |
| Quicksort (Mo3) | 710.38 | 0.8278 | YA | Terdominasi |
| Quicksort (Ninther) | 604.40 | 0.8427 | YA | Terdominasi |
| Quicksort (RTL) | 643.33 | 0.8364 | TIDAK | Terdominasi |
| Quicksort (Random) | 650.54 | 0.8371 | TIDAK | Terdominasi |
| Random Sort | 244.41 | 0.6469 | YA | Terdominasi |
| Selection Sort | 2759.44 | 0.8890 | YA | Terdominasi |
| Shellsort | 670.58 | 0.9323 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2385 | YA | Terdominasi |
| Sleep Sort | 100.00 | -0.0047 | TIDAK | Terdominasi |
| Slowsort | 1324.76 | 0.9496 | YA | Terdominasi |
| Smooth Sort | 100.12 | 0.4848 | YA | Terdominasi |
| Socialist Sort | 0.00 | 0.0035 | TIDAK | Pareto-optimal |
| Stable Quicksort | 654.62 | 0.8372 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.0983 | TIDAK | Terdominasi |
| Stooge Sort | 2893.43 | 0.9900 | YA | Terdominasi |
| Strand Sort | 743.92 | 0.8188 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5451 | YA | Terdominasi |
| Timsort | 532.34 | 0.8957 | YA | Terdominasi |
| Tournament Sort | 558.63 | 0.8875 | TIDAK | Terdominasi |
| Tree Sort | 650.24 | 0.8374 | TIDAK | Terdominasi |
| Triple-Pivot Quicksort | 532.48 | 0.8292 | YA | Terdominasi |

### Regresi Estimasi Jumlah Pertempuran
Untuk Merge Sort (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ≈ N * log2(N) - (N - 1)`
- For N=100, ini memprediksi ~565 battles (disimulasikan ~542 unique rata-rata).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~45% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).
