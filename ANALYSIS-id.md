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
| Socialist Sort | 0.00 | 0.0014 | Pareto-optimal |
| Quantum Bogo | 2.00 | 0.0398 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5384 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6546 | Pareto-optimal |
| Intro Sort | 402.10 | 0.8538 | Pareto-optimal |
| Ford-Johnson | 526.10 | 0.8866 | Pareto-optimal |
| Binary Insertion | 532.20 | 0.8873 | Pareto-optimal |
| Merge Sort | 541.80 | 0.9040 | Pareto-optimal |
| **Shellsort** | 731.10 | 0.9440 | **Titik Lutut Produksi** |
| Comb Sort | 1240.60 | 0.9909 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Exit Sort | 0.00 | -0.0305 | Terdominasi |
| Intelligent Design | 0.00 | -0.0489 | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3277 | Terdominasi |
| Stalin Sort | 99.00 | 0.0840 | Terdominasi |
| Sleep Sort | 100.00 | 0.0345 | Terdominasi |
| Heap Sort | 148.40 | 0.4863 | Terdominasi |
| Smooth Sort | 155.00 | 0.4589 | Terdominasi |
| Thanos Sort | 190.00 | 0.5288 | Terdominasi |
| Random Sort | 199.90 | 0.5305 | Terdominasi |
| Patience Sort | 245.20 | 0.4737 | Terdominasi |
| Dual-Pivot Quicksort | 481.50 | 0.8351 | Terdominasi |
| Tournament Sort | 559.00 | 0.8807 | Terdominasi |
| Parallel Merge Sort | 560.50 | 0.8857 | Terdominasi |
| Quicksort (LTR) | 627.60 | 0.8341 | Terdominasi |
| Quicksort (RTL) | 643.40 | 0.8396 | Terdominasi |
| Tree Sort | 656.10 | 0.8380 | Terdominasi |
| Quicksort (Random) | 669.80 | 0.8389 | Terdominasi |
| Strand Sort | 745.80 | 0.8183 | Terdominasi |
| Hayate-Shiki | 919.50 | 0.7874 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9482 | Terdominasi |
| Circle Sort | 2180.40 | 0.9728 | Terdominasi |
| Insertion Sort | 2534.50 | 0.8076 | Terdominasi |
| Cocktail Shaker | 3844.80 | 0.9787 | Terdominasi |
| Odd-Even Sort | 4722.30 | 0.9891 | Terdominasi |
| Gnome Sort | 4857.50 | 0.9486 | Terdominasi |
| Bubble Sort | 4886.00 | 0.9721 | Terdominasi |
| Bogosort | 4950.00 | 0.9809 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9756 | Terdominasi |
| Cocktail Selection | 4950.00 | 0.9478 | Terdominasi |
| Double Selection | 4950.00 | 0.9427 | Terdominasi |
| Selection Sort | 4950.00 | 0.9329 | Terdominasi |
| Bozosort | 4950.00 | 0.5693 | Terdominasi |
| Slowsort | 4950.00 | 0.4585 | Terdominasi |
| Cycle Sort | 4950.00 | 0.4049 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2790 | Terdominasi |
| Silly Sort | 4950.00 | 0.1081 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0418 | Terdominasi |

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
