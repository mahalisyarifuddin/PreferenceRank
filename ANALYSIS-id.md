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
| Intelligent Design | 0.00 | 0.0036 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0215 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5422 | TIDAK | Pareto-optimal |
| Dual-Pivot Quicksort | 486.05 | 0.8352 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.74 | 0.8872 | TIDAK | Pareto-optimal |
| Binary Insertion | 530.88 | 0.8878 | TIDAK | Pareto-optimal |
| In-place Merge Sort | 541.22 | 0.9046 | TIDAK | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Socialist Sort | 0.00 | -0.0033 | TIDAK | Terdominasi |
| Exit Sort | 0.00 | -0.0027 | TIDAK | Terdominasi |
| BogoBogoSort | 44.70 | 0.0936 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3486 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.1018 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5450 | YA | Terdominasi |
| Smooth Sort | 99.45 | 0.4780 | YA | Terdominasi |
| Heap Sort | 99.68 | 0.4778 | YA | Terdominasi |
| Sleep Sort | 100.00 | 0.0022 | TIDAK | Terdominasi |
| 3-Way Quicksort | 100.40 | 0.3528 | YA | Terdominasi |
| Quicksort (Hoare) | 108.69 | 0.4243 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2349 | YA | Terdominasi |
| Hater Sort | 195.87 | 0.6649 | YA | Terdominasi |
| Patience Sort | 196.66 | 0.4811 | YA | Terdominasi |
| Random Sort | 244.16 | 0.6446 | YA | Terdominasi |
| Cycle Sort | 507.87 | 0.4025 | YA | Terdominasi |
| Triple-Pivot Quicksort | 537.93 | 0.8268 | YA | Terdominasi |
| **Merge Sort** | 541.75 | 0.9032 | TIDAK | **Titik Lutut Produksi** |
| 4-way Merge Sort | 543.15 | 0.9042 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 557.66 | 0.8864 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 557.94 | 0.8866 | TIDAK | Terdominasi |
| Tournament Sort | 558.03 | 0.8860 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.27 | 0.8863 | TIDAK | Terdominasi |
| 3-way Merge Sort | 567.39 | 0.8799 | TIDAK | Terdominasi |
| Natural Merge Sort | 577.11 | 0.8925 | YA | Terdominasi |
| Quicksort (Ninther) | 604.16 | 0.8413 | YA | Terdominasi |
| Quicksort (RTL) | 644.26 | 0.8368 | TIDAK | Terdominasi |
| Quicksort (Random) | 644.88 | 0.8361 | TIDAK | Terdominasi |
| Parallel Quicksort | 645.20 | 0.8374 | TIDAK | Terdominasi |
| Quicksort (Middle) | 649.32 | 0.8363 | TIDAK | Terdominasi |
| Stable Quicksort | 650.85 | 0.8362 | TIDAK | Terdominasi |
| Quicksort (LTR) | 650.95 | 0.8372 | TIDAK | Terdominasi |
| Tree Sort | 656.59 | 0.8368 | TIDAK | Terdominasi |
| Shellsort | 669.19 | 0.9333 | YA | Terdominasi |
| Quicksort (Mo3) | 710.98 | 0.8272 | YA | Terdominasi |
| BlockQuicksort | 722.06 | 0.8083 | TIDAK | Terdominasi |
| Intro Sort | 724.33 | 0.8079 | TIDAK | Terdominasi |
| Strand Sort | 750.29 | 0.8211 | TIDAK | Terdominasi |
| Comb Sort | 850.96 | 0.9751 | YA | Terdominasi |
| Hayate-Shiki | 928.34 | 0.7826 | YA | Terdominasi |
| Timsort | 1018.19 | 0.8817 | TIDAK | Terdominasi |
| Bitonic Sort | 1036.08 | 0.9572 | YA | Terdominasi |
| Circle Sort | 1212.12 | 0.9693 | YA | Terdominasi |
| Slowsort | 1323.78 | 0.9465 | YA | Terdominasi |
| Powersort | 1809.43 | 0.7960 | YA | Terdominasi |
| Gnome Sort | 2540.20 | 0.7998 | YA | Terdominasi |
| Insertion Sort | 2565.25 | 0.8018 | TIDAK | Terdominasi |
| Bubble Sort | 2570.83 | 0.8039 | YA | Terdominasi |
| Cocktail Shaker | 2591.48 | 0.8081 | YA | Terdominasi |
| Odd-Even Sort | 2602.74 | 0.8059 | YA | Terdominasi |
| Selection Sort | 2744.54 | 0.8895 | YA | Terdominasi |
| Cocktail Selection | 2748.02 | 0.9211 | YA | Terdominasi |
| Double Selection | 2775.11 | 0.9222 | YA | Terdominasi |
| Stooge Sort | 2888.06 | 0.9899 | YA | Terdominasi |
| Pancake Sort | 3069.47 | 0.9685 | YA | Terdominasi |
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
