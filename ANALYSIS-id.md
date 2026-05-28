# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur (benchmarking) dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, menggunakan perbandingan "Murni Unik" untuk mengukur efisiensi informasi yang sebenarnya.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 48 algoritma pengurutan untuk menentukan keseimbangan akhir antara upaya pengguna (pertarungan unik) dan akurasi peringkat (Kendall Tau). Deduplikasi diterapkan: perbandingan redundan diselesaikan secara diam-diam, sehingga "Rerata Pertarungan" hanya mewakili interaksi unik pengguna.

### Metodologi Tolok Ukur
- **Nilai N:** 100
- **Uji Coba:** 250 per algoritma.
- **Metrik 1: Rerata Pertarungan:** Rata-rata jumlah perbandingan unik yang ditampilkan kepada pengguna.
- **Metrik 2: Rerata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor perkiraan (BT).

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rerata Pertarungan (naik), lalu Rerata Kendall Tau (turun).

| Algoritma | Rerata Pertarungan | Rerata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | 0.0070 | Pareto-optimal |
| Quantum Bogo | 1.80 | 0.0192 | Pareto-optimal |
| BogoBogoSort | 44.94 | 0.0942 | Pareto-optimal |
| Smooth Sort | 98.62 | 0.4751 | Pareto-optimal |
| Thanos Sort | 99.00 | 0.5460 | Pareto-optimal |
| Hater Sort | 196.04 | 0.6651 | Pareto-optimal |
| Intro Sort | 406.79 | 0.8356 | Pareto-optimal |
| Dual-Pivot Quicksort | 488.27 | 0.8365 | Pareto-optimal |
| Ford-Johnson | 526.84 | 0.8899 | Pareto-optimal |
| Merge Sort | 541.17 | 0.9034 | Pareto-optimal |
| **Shellsort** | 670.38 | 0.9318 | **Titik Lutut Produksi** |
| Comb Sort | 852.90 | 0.9747 | Pareto-optimal |
| Stooge Sort | 2889.84 | 0.9900 | Pareto-optimal |
| Bozosort | 4946.48 | 1.0000 | Pareto-optimal |
| Socialist Sort | 0.00 | 0.0048 | Terdominasi |
| Exit Sort | 0.00 | -0.0004 | Terdominasi |
| Miracle Sort | 99.00 | 0.5458 | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3516 | Terdominasi |
| Stalin Sort | 99.00 | 0.1050 | Terdominasi |
| Sleep Sort | 100.00 | -0.0095 | Terdominasi |
| Heap Sort | 101.23 | 0.4863 | Terdominasi |
| Silly Sort | 138.00 | 0.2444 | Terdominasi |
| Patience Sort | 197.99 | 0.4769 | Terdominasi |
| Random Sort | 251.25 | 0.6493 | Terdominasi |
| Cycle Sort | 500.50 | 0.4591 | Terdominasi |
| Binary Insertion | 530.58 | 0.8868 | Terdominasi |
| Parallel Merge Sort | 557.96 | 0.8870 | Terdominasi |
| Tournament Sort | 558.04 | 0.8877 | Terdominasi |
| Quicksort (Random) | 645.54 | 0.8361 | Terdominasi |
| Quicksort (LTR) | 648.94 | 0.8371 | Terdominasi |
| Tree Sort | 649.52 | 0.8359 | Terdominasi |
| Quicksort (RTL) | 651.76 | 0.8374 | Terdominasi |
| Strand Sort | 751.27 | 0.8192 | Terdominasi |
| Hayate-Shiki | 928.67 | 0.7838 | Terdominasi |
| Bitonic Sort | 1038.89 | 0.9576 | Terdominasi |
| Circle Sort | 1207.89 | 0.9697 | Terdominasi |
| Slowsort | 1321.99 | 0.9467 | Terdominasi |
| Gnome Sort | 2548.66 | 0.8015 | Terdominasi |
| Bubble Sort | 2570.82 | 0.8033 | Terdominasi |
| Insertion Sort | 2593.32 | 0.8044 | Terdominasi |
| Odd-Even Sort | 2615.69 | 0.8058 | Terdominasi |
| Cocktail Selection | 2749.14 | 0.9233 | Terdominasi |
| Selection Sort | 2758.31 | 0.8910 | Terdominasi |
| Double Selection | 2766.07 | 0.9222 | Terdominasi |
| Cocktail Shaker | 2586.94 | 0.8063 | Terdominasi |
| Pancake Sort | 3092.15 | 0.9695 | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | Terdominasi |
| Peringkat Penuh | 4950.00 | 1.0000 | Terdominasi |

### Batas Pareto & Analisis Titik Lutut
Batas Pareto mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan unik sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Intro Sort**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Shellsort** diidentifikasi sebagai "titik lutut" optimal untuk produksi. Di bawah model "Murni Unik", ia menawarkan akurasi >93% untuk ~670 pertarungan unik (pengurangan 86% vs. Peringkat Penuh). Ini tetap menjadi titik keseimbangan yang paling masuk akal secara matematis untuk pemeringkatan preferensi manusia.
- **Peringkat Penuh** (dan pada akhirnya Bogosort/Bozosort) mencapai Tau sempurna 1.000 tetapi dengan biaya besar ~4950 pertarungan.

### Regresi Estimasi Jumlah Pertarungan
Untuk memberikan ekspektasi pengguna yang akurat, kami mensimulasikan Shellsort (celah Ciura) dengan deduplikasi perbandingan penuh dan memperoleh model regresi fidelitas ultra-tinggi.

- **Observasi:** Pertumbuhan tetap super-linear, tetapi jumlah unik ~8,5% lebih rendah daripada perbandingan algoritmik mentah.
- **Formula Fidelitas Ultra-Tinggi:** `Pertarungan Unik ≈ 0.428 * N * (log2(N))^1.458`
- **Akurasi:** Model ini mencapai kesalahan relatif RMS <1% di seluruh rentang. Ini memprediksi ~671 pertarungan untuk N=100 (disimulasikan ~670), memberikan perkiraan yang tepat untuk UI.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) untuk konvergensi dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (dapat diabaikan untuk skor yang dibulatkan menjadi bilangan bulat).
