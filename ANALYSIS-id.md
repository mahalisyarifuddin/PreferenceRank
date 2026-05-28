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
Diurutkan berdasarkan Duplikat (TIDAK dulu), lalu Rata-rata Pertarungan (naik).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Duplikat | Status Pareto |
| :--- | :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | -0.0018 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | 0.0032 | TIDAK | Terdominasi |
| Exit Sort | 0.00 | -0.0009 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.68 | 0.0149 | TIDAK | Pareto-optimal |
| Stalin Sort | 99.00 | 0.1036 | TIDAK | Terdominasi |
| Miracle Sort | 99.00 | 0.5451 | TIDAK | Pareto-optimal |
| Genghis Khan Sort | 99.00 | 0.3520 | TIDAK | Terdominasi |
| Sleep Sort | 100.00 | 0.0061 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 491.07 | 0.8372 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.79 | 0.8883 | TIDAK | Pareto-optimal |
| Binary Insertion | 530.46 | 0.8863 | TIDAK | Terdominasi |
| **Merge Sort** | 542.10 | 0.9065 | TIDAK | **Titik Lutut Produksi** |
| Parallel Merge Sort | 558.40 | 0.8863 | TIDAK | Terdominasi |
| Tournament Sort | 559.13 | 0.8856 | TIDAK | Terdominasi |
| Quicksort (Random) | 639.13 | 0.8357 | TIDAK | Terdominasi |
| Quicksort (LTR) | 643.12 | 0.8378 | TIDAK | Terdominasi |
| Tree Sort | 647.83 | 0.8372 | TIDAK | Terdominasi |
| Quicksort (RTL) | 653.42 | 0.8366 | TIDAK | Terdominasi |
| Strand Sort | 737.76 | 0.8209 | TIDAK | Terdominasi |
| Insertion Sort | 2568.57 | 0.8034 | TIDAK | Terdominasi |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| BogoBogoSort | 44.32 | 0.0913 | YA | Terdominasi |
| Smooth Sort | 98.70 | 0.4807 | YA | Terdominasi |
| Thanos Sort | 99.00 | 0.5466 | YA | Terdominasi |
| Heap Sort | 99.60 | 0.4817 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2391 | YA | Terdominasi |
| Hater Sort | 196.36 | 0.6615 | YA | Terdominasi |
| Patience Sort | 198.62 | 0.4767 | YA | Terdominasi |
| Random Sort | 226.55 | 0.6278 | YA | Terdominasi |
| Intro Sort | 396.89 | 0.8376 | YA | Terdominasi |
| Cycle Sort | 498.38 | 0.4252 | YA | Terdominasi |
| Shellsort | 671.59 | 0.9324 | YA | Terdominasi |
| Comb Sort | 852.69 | 0.9742 | YA | Terdominasi |
| Hayate-Shiki | 932.92 | 0.7833 | YA | Terdominasi |
| Bitonic Sort | 1034.54 | 0.9581 | YA | Terdominasi |
| Circle Sort | 1217.37 | 0.9693 | YA | Terdominasi |
| Slowsort | 1321.35 | 0.9477 | YA | Terdominasi |
| Bubble Sort | 2558.94 | 0.8010 | YA | Terdominasi |
| Gnome Sort | 2566.00 | 0.8027 | YA | Terdominasi |
| Cocktail Shaker | 2582.08 | 0.8071 | YA | Terdominasi |
| Odd-Even Sort | 2632.06 | 0.8081 | YA | Terdominasi |
| Double Selection | 2755.02 | 0.9205 | YA | Terdominasi |
| Cocktail Selection | 2762.89 | 0.9215 | YA | Terdominasi |
| Selection Sort | 2767.50 | 0.8909 | YA | Terdominasi |
| Stooge Sort | 2888.75 | 0.9901 | YA | Terdominasi |
| Pancake Sort | 3103.72 | 0.9691 | YA | Terdominasi |
| Bozosort | 4946.40 | 1.0000 | YA | Terdominasi |
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
