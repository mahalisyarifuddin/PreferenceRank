# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis mendalam yang dilakukan untuk mengoptimalkan sistem pembuatan pasangan dan penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikat** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 48 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan berpasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut (knee point) Pareto-optimal untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **Nilai N:** 100
- **Uji Coba:** 250 per algoritma.
- **Metrik 1: Rata-rata Pertarungan:** Total perbandingan unik yang ditampilkan kepada pengguna.
- **Metrik 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor yang diperkirakan (BT).
- **Metrik 3: Duplikat:** Menunjukkan apakah algoritma pernah meminta pasangan yang sama dua kali selama satu proses pengurutan.

### Hasil (N=100)
Tabel dipartisi berdasarkan status Pareto (Optimal lalu Terdominasi) dan diurutkan berdasarkan Rata-rata Pertarungan (naik).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Duplikat | Status Pareto |
| :--- | :--- | :--- | :--- | :--- |
| Exit Sort | 0.00 | -0.0005 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.62 | 0.0120 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5450 | TIDAK | Pareto-optimal |
| Dual-Pivot Quicksort | 494.08 | 0.8364 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.85 | 0.8886 | TIDAK | Pareto-optimal |
| **Merge Sort** | 542.07 | 0.9032 | TIDAK | **Titik Lutut Produksi** |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0069 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | 0.0036 | TIDAK | Terdominasi |
| BogoBogoSort | 44.46 | 0.0897 | YA | Terdominasi |
| Smooth Sort | 98.10 | 0.4813 | YA | Terdominasi |
| Heap Sort | 98.52 | 0.4865 | YA | Terdominasi |
| Stalin Sort | 99.00 | 0.0993 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5475 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3381 | TIDAK | Terdominasi |
| Sleep Sort | 100.00 | -0.0022 | TIDAK | Terdominasi |
| Silly Sort | 138.00 | 0.2398 | YA | Terdominasi |
| Hater Sort | 195.94 | 0.6643 | YA | Terdominasi |
| Patience Sort | 198.58 | 0.4921 | YA | Terdominasi |
| Random Sort | 255.21 | 0.6554 | YA | Terdominasi |
| Intro Sort | 409.05 | 0.8314 | YA | Terdominasi |
| Cycle Sort | 431.63 | 0.4313 | YA | Terdominasi |
| Binary Insertion | 530.42 | 0.8877 | TIDAK | Terdominasi |
| Tournament Sort | 558.18 | 0.8860 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.28 | 0.8861 | TIDAK | Terdominasi |
| Quicksort (RTL) | 642.67 | 0.8369 | TIDAK | Terdominasi |
| Quicksort (Random) | 644.90 | 0.8365 | TIDAK | Terdominasi |
| Tree Sort | 648.08 | 0.8366 | TIDAK | Terdominasi |
| Quicksort (LTR) | 654.10 | 0.8375 | TIDAK | Terdominasi |
| Shellsort | 671.24 | 0.9330 | YA | Terdominasi |
| Strand Sort | 738.34 | 0.8200 | TIDAK | Terdominasi |
| Comb Sort | 851.18 | 0.9745 | YA | Terdominasi |
| Hayate-Shiki | 937.24 | 0.7873 | YA | Terdominasi |
| Bitonic Sort | 1036.05 | 0.9574 | YA | Terdominasi |
| Circle Sort | 1213.04 | 0.9695 | YA | Terdominasi |
| Slowsort | 1323.12 | 0.9494 | YA | Terdominasi |
| Bubble Sort | 2565.62 | 0.8014 | YA | Terdominasi |
| Insertion Sort | 2568.34 | 0.8019 | TIDAK | Terdominasi |
| Gnome Sort | 2569.91 | 0.8020 | YA | Terdominasi |
| Cocktail Shaker | 2578.76 | 0.8062 | YA | Terdominasi |
| Odd-Even Sort | 2610.81 | 0.8061 | YA | Terdominasi |
| Cocktail Selection | 2753.86 | 0.9209 | YA | Terdominasi |
| Double Selection | 2754.74 | 0.9215 | YA | Terdominasi |
| Selection Sort | 2756.40 | 0.8908 | YA | Terdominasi |
| Stooge Sort | 2881.16 | 0.9901 | YA | Terdominasi |
| Pancake Sort | 3083.59 | 0.9684 | YA | Terdominasi |
| Bozosort | 4946.49 | 1.0000 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Batas Pareto & Analisis Titik Lutut
Dengan batasan "Perbandingan Murni" yang baru (Tanpa Duplikat):

- **Merge Sort** muncul sebagai **Titik Lutut Produksi** utama. Algoritma ini Pareto-optimal dan mencapai akurasi tertinggi di antara semua algoritma "Murni" sebelum mencapai biaya ekstrem dari Full Rank.
- **Ford-Johnson** dan **Dual-Pivot Quicksort** tetap menjadi pilihan Pareto-optimal yang sangat baik untuk upaya tingkat menengah tanpa duplikat.
- **Shellsort**, meskipun sangat akurat, sekarang dikategorikan sebagai terdominasi karena secara inheren menghasilkan perbandingan duplikat (dalam implementasi berbasis gap saat ini), yang melanggar persyaratan efisiensi baru.

### Regresi Estimasi Jumlah Pertarungan
Untuk Merge Sort (Titik Lutut Produksi baru):
- **Rumus:** `Pertarungan Unik ≈ N * log2(N) - (N - 1)`
- Untuk N=100, rumus ini memprediksi ~565 pertarungan (simulasi rata-rata ~542 unik).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (tidak signifikan untuk skor bulat).
