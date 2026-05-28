# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur (benchmarking) dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, yang sekarang menyertakan deduplikasi perbandingan untuk meminimalkan upaya pengguna.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 48 algoritma pengurutan untuk menentukan keseimbangan akhir antara upaya pengguna (pertarungan unik) dan akurasi peringkat (Kendall Tau). Deduplikasi diterapkan: jika algoritma meminta perbandingan antara pasangan yang sama dua kali, hasil sebelumnya akan digunakan kembali secara otomatis.

### Metodologi Tolok Ukur
- **Nilai N:** 100
- **Uji Coba:** 250 per algoritma.
- **Metrik 1: Rerata Pertarungan:** Rata-rata jumlah perbandingan unik yang ditampilkan kepada pengguna.
- **Metrik 2: Rerata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor perkiraan.

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rerata Pertarungan (naik), lalu Rerata Kendall Tau (turun).

| Algoritma | Rerata Pertarungan | Rerata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | 0.0029 | Pareto-optimal |
| Quantum Bogo | 1.69 | 0.0226 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5477 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6613 | Pareto-optimal |
| Intro Sort | 394.94 | 0.8264 | Pareto-optimal |
| Dual-Pivot Quicksort | 481.17 | 0.8337 | Pareto-optimal |
| Ford-Johnson | 526.80 | 0.8894 | Pareto-optimal |
| Merge Sort | 541.12 | 0.9036 | Pareto-optimal |
| **Shellsort** | 671.55 | 0.9421 | **Titik Lutut Produksi** |
| Comb Sort | 1237.83 | 0.9903 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Exit Sort | 0.00 | 0.0005 | Terdominasi |
| Socialist Sort | 0.00 | -0.0054 | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3273 | Terdominasi |
| Stalin Sort | 99.00 | 0.1063 | Terdominasi |
| Sleep Sort | 100.00 | -0.0004 | Terdominasi |
| Heap Sort | 150.40 | 0.4761 | Terdominasi |
| Smooth Sort | 150.96 | 0.4736 | Terdominasi |
| Thanos Sort | 189.99 | 0.5353 | Terdominasi |
| Patience Sort | 249.74 | 0.4767 | Terdominasi |
| Random Sort | 259.77 | 0.6564 | Terdominasi |
| Binary Insertion | 530.20 | 0.8865 | Terdominasi |
| Parallel Merge Sort | 558.52 | 0.8870 | Terdominasi |
| Tournament Sort | 558.97 | 0.8853 | Terdominasi |
| Quicksort (Random) | 642.78 | 0.8363 | Terdominasi |
| Quicksort (LTR) | 643.28 | 0.8361 | Terdominasi |
| Tree Sort | 643.57 | 0.8367 | Terdominasi |
| Quicksort (RTL) | 646.11 | 0.8354 | Terdominasi |
| Strand Sort | 743.60 | 0.8212 | Terdominasi |
| Hayate-Shiki | 932.10 | 0.7852 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9497 | Terdominasi |
| Circle Sort | 2180.40 | 0.9743 | Terdominasi |
| Insertion Sort | 2565.64 | 0.8023 | Terdominasi |
| Cocktail Shaker | 3871.29 | 0.9770 | Terdominasi |
| Odd-Even Sort | 4667.26 | 0.9878 | Terdominasi |
| Gnome Sort | 4845.45 | 0.9625 | Terdominasi |
| Bubble Sort | 4874.80 | 0.9727 | Terdominasi |
| Bogosort | 4950.00 | 0.9790 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9758 | Terdominasi |
| Cocktail Selection | 4950.00 | 0.9474 | Terdominasi |
| Double Selection | 4950.00 | 0.9422 | Terdominasi |
| Selection Sort | 4950.00 | 0.9339 | Terdominasi |
| Bozosort | 4950.00 | 0.5822 | Terdominasi |
| Cycle Sort | 4950.00 | 0.4701 | Terdominasi |
| Slowsort | 4950.00 | 0.4615 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2910 | Terdominasi |
| Silly Sort | 4950.00 | 0.1260 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0636 | Terdominasi |

### Batas Pareto & Analisis Titik Lutut
Batas Pareto mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan unik sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Intro Sort**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Shellsort** diidentifikasi sebagai "titik lutut" akhir untuk produksi. Setelah deduplikasi, ia menawarkan akurasi >94% untuk ~672 pertarungan unik (pengurangan 86% vs. Peringkat Penuh). Verifikasi menggunakan metode Kneedle dan Jarak Tegak Lurus Maksimum mengonfirmasi Shellsort sebagai titik keseimbangan optimal.
- **Peringkat Penuh** tetap menjadi standar emas untuk akurasi tetapi dengan biaya besar 4950 pertarungan.

### Regresi Estimasi Jumlah Pertarungan
Untuk memberikan ekspektasi pengguna yang akurat, kami mensimulasikan Shellsort (celah Ciura) dengan deduplikasi perbandingan di seluruh N=5 hingga N=1000 dan memperoleh model regresi fidelitas ultra-tinggi yang diperbarui.

- **Observasi:** Pertumbuhan tetap super-linear, tetapi konstanta efektif lebih rendah karena deduplikasi.
- **Formula Fidelitas Ultra-Tinggi:** `Pertarungan Unik ≈ 0.428 * N * (log2(N))^1.458`
- **Akurasi:** Model ini mencapai kesalahan relatif RMS <1% di seluruh rentang. Ini memprediksi 672 pertarungan untuk N=100 (disimulasikan ~671) dan 12226 pertarungan untuk N=1000 (disimulasikan ~12269), memberikan perkiraan yang sangat tepat untuk UI.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) untuk konvergensi dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (dapat diabaikan untuk skor yang dibulatkan menjadi bilangan bulat).
