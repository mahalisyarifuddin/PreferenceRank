# Analisis Algoritma Pengurutan dan Konvergensi pada PreferenceRank

Dokumen ini merangkum hasil pengujian dan analisis mendalam yang dilakukan untuk mengoptimalkan sistem pembuatan pasangan dan penilaian dalam PreferenceRank.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 48 algoritma pengurutan untuk menentukan keseimbangan terbaik antara upaya pengguna (jumlah pertarungan) dan akurasi peringkat (Kendall Tau).

### Metodologi Pengujian
- **Nilai N:** 100
- **Uji Coba:** 10 per algoritma.
- **Metrik 1: Rata-rata Pertarungan:** Jumlah rata-rata perbandingan yang dihasilkan.
- **Metrik 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi.

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rata-rata Pertarungan (menaik), lalu Rata-rata Kendall Tau (menurun).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Socialist Sort | 0.00 | 0.0077 | Pareto-optimal |
| Quantum Bogo | 1.78 | 0.0082 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5423 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6613 | Pareto-optimal |
| Intro Sort | 393.40 | 0.8071 | Pareto-optimal |
| Dual-Pivot Quicksort | 481.19 | 0.8348 | Pareto-optimal |
| Ford-Johnson | 527.05 | 0.8877 | Pareto-optimal |
| Binary Insertion | 530.07 | 0.8889 | Pareto-optimal |
| Merge Sort | 541.53 | 0.9037 | Pareto-optimal |
| **Shellsort** | 734.36 | 0.9432 | **Titik Lutut Produksi** |
| Comb Sort | 1242.58 | 0.9904 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Exit Sort | 0.00 | 0.0040 | Terdominasi |
| Intelligent Design | 0.00 | -0.0024 | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3556 | Terdominasi |
| Stalin Sort | 99.00 | 0.0933 | Terdominasi |
| Sleep Sort | 100.00 | 0.0106 | Terdominasi |
| Heap Sort | 150.66 | 0.4814 | Terdominasi |
| Smooth Sort | 151.44 | 0.4853 | Terdominasi |
| Thanos Sort | 190.00 | 0.5373 | Terdominasi |
| Patience Sort | 248.23 | 0.4662 | Terdominasi |
| Random Sort | 264.94 | 0.6487 | Terdominasi |
| Tournament Sort | 557.57 | 0.8872 | Terdominasi |
| Parallel Merge Sort | 559.65 | 0.8862 | Terdominasi |
| Tree Sort | 641.35 | 0.8379 | Terdominasi |
| Quicksort (LTR) | 643.17 | 0.8373 | Terdominasi |
| Quicksort (Random) | 645.64 | 0.8365 | Terdominasi |
| Quicksort (RTL) | 648.81 | 0.8380 | Terdominasi |
| Strand Sort | 747.55 | 0.8199 | Terdominasi |
| Hayate-Shiki | 951.19 | 0.7884 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9496 | Terdominasi |
| Circle Sort | 2221.48 | 0.9743 | Terdominasi |
| Insertion Sort | 2558.51 | 0.8016 | Terdominasi |
| Cocktail Shaker | 3888.84 | 0.9779 | Terdominasi |
| Odd-Even Sort | 4712.40 | 0.9892 | Terdominasi |
| Gnome Sort | 4847.01 | 0.9597 | Terdominasi |
| Bubble Sort | 4890.31 | 0.9721 | Terdominasi |
| Bogosort | 4950.00 | 0.9789 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9760 | Terdominasi |
| Cocktail Selection | 4950.00 | 0.9479 | Terdominasi |
| Double Selection | 4950.00 | 0.9417 | Terdominasi |
| Selection Sort | 4950.00 | 0.9336 | Terdominasi |
| Bozosort | 4950.00 | 0.5866 | Terdominasi |
| Cycle Sort | 4950.00 | 0.4901 | Terdominasi |
| Slowsort | 4950.00 | 0.4634 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2942 | Terdominasi |
| Silly Sort | 4950.00 | 0.1270 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0677 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Intro Sort**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Shellsort** diidentifikasi sebagai titik lutut optimal untuk Peringkat Cepat dengan akurasi tinggi. Algoritma ini menawarkan akurasi >93% dengan ~727 pertarungan (pengurangan 85% dibandingkan Peringkat Penuh).
- **Full Rank** tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Regresi Estimasi Jumlah Pertarungan
Untuk memberikan ekspektasi pengguna yang akurat, kami mensimulasikan Shellsort (celah Ciura) dari N=5 hingga N=1000 (1000 uji coba per N) dan menurunkan model regresi dengan ketelitian sangat tinggi (ultra-high-fidelity).

- **Observasi:** Pertumbuhan bersifat super-linear, dimodelkan secara akurat oleh hukum pangkat yang diperhalus.
- **Formula Ketelitian Ultra-Tinggi:** `Pertarungan ≈ 0.457 * N * (log2(N))^1.46`
- **Akurasi:** Model ini mencapai kesalahan relatif RMS sebesar 0.93% di seluruh rentang. Model ini memprediksi 8 pertarungan untuk N=5 (simulasi ~8), 725 pertarungan untuk N=100 (simulasi ~734), dan 13113 pertarungan untuk N=1000 (simulasi ~13047), memberikan estimasi yang sangat tepat untuk antarmuka pengguna.

### Sortir Esoterik & Lucu: Komedi Kuantitatif
Kami menyertakan beberapa algoritma "mustahil" atau "lucu" dari SortPedia dan Wikipedia untuk mengilustrasikan rentang filosofi pengurutan.

- **Socialist Sort:** Mengasumsikan semua item sudah sama dan dengan demikian sudah terurut. Algoritma ini menghasilkan **0 pertarungan**.
- **Quantum Bogo Sort:** Menghasilkan permutasi acak dan menghancurkan alam semesta jika tidak terurut. Dalam pengujian kami, algoritma ini menghasilkan **~1.5 pertarungan** karena langsung berhenti saat menemukan satu pasangan yang tidak berurutan.
- **Thanos Sort:** Menghapus setengah dari alam semesta (data) untuk mengembalikan keteraturan. Algoritma ini menunjukkan akurasi yang mengejutkan untuk jumlah pertarungan yang rendah (~190).
- **Miracle Sort:** Menunggu keajaiban untuk mengurutkan data. Dalam pengujian kami, algoritma ini melakukan satu sapuan (~99 pertarungan) dan kemudian menyerah.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (tidak signifikan untuk skor bulat yang ditampilkan).
