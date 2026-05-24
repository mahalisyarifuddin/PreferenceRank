# Analisis Algoritma Pengurutan dan Konvergensi pada PreferenceRank

Dokumen ini merangkum hasil pengujian dan analisis mendalam yang dilakukan untuk mengoptimalkan sistem pembuatan pasangan dan penilaian dalam PreferenceRank.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 47 algoritma pengurutan untuk menentukan keseimbangan terbaik antara upaya pengguna (jumlah pertarungan) dan akurasi peringkat (Kendall Tau).

### Metodologi Pengujian
- **Nilai N:** 100
- **Uji Coba:** 10 per algoritma.
- **Metrik 1: Rata-rata Pertarungan:** Jumlah rata-rata perbandingan yang dihasilkan.
- **Metrik 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi.

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rata-rata Pertarungan (menaik), lalu Rata-rata Kendall Tau (menurun).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Exit Sort | 0.00 | 0.0190 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5403 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6535 | Pareto-optimal |
| Random Sort | 286.90 | 0.7137 | Pareto-optimal |
| Intro Sort | 411.80 | 0.8641 | Pareto-optimal |
| Ford-Johnson | 526.90 | 0.8851 | Pareto-optimal |
| Binary Insertion | 532.50 | 0.8864 | Pareto-optimal |
| Merge Sort | 541.10 | 0.9081 | Pareto-optimal |
| **Shellsort** | 727.40 | 0.9398 | **Titik Lutut Produksi** |
| Comb Sort | 1240.60 | 0.9908 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Intelligent Design | 0.00 | 0.0053 | Terdominasi |
| Socialist Sort | 0.00 | -0.0166 | Terdominasi |
| Quantum Bogo | 1.50 | -0.0172 | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3038 | Terdominasi |
| Stalin Sort | 99.00 | 0.0893 | Terdominasi |
| Sleep Sort | 100.00 | 0.0259 | Terdominasi |
| Heap Sort | 143.10 | 0.4577 | Terdominasi |
| Smooth Sort | 144.80 | 0.4684 | Terdominasi |
| Thanos Sort | 190.00 | 0.5385 | Terdominasi |
| Patience Sort | 243.20 | 0.4531 | Terdominasi |
| Dual-Pivot Quicksort | 500.80 | 0.8404 | Terdominasi |
| Tournament Sort | 558.80 | 0.8796 | Terdominasi |
| Quicksort | 612.70 | 0.8364 | Terdominasi |
| Quicksort (LTR) | 624.10 | 0.8321 | Terdominasi |
| Quicksort (Random) | 655.60 | 0.8362 | Terdominasi |
| Tree Sort | 663.10 | 0.8354 | Terdominasi |
| Strand Sort | 702.60 | 0.8137 | Terdominasi |
| Hayate-Shiki | 944.90 | 0.7791 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9505 | Terdominasi |
| Circle Sort | 2148.80 | 0.9726 | Terdominasi |
| Insertion Sort | 2551.10 | 0.8021 | Terdominasi |
| Cocktail Shaker | 3974.00 | 0.9808 | Terdominasi |
| Odd-Even Sort | 4653.00 | 0.9892 | Terdominasi |
| Bubble Sort | 4888.50 | 0.9727 | Terdominasi |
| Gnome Sort | 4915.10 | 0.9570 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.1042 | Terdominasi |
| Bogosort | 4950.00 | 0.9758 | Terdominasi |
| Bozosort | 4950.00 | 0.6042 | Terdominasi |
| Cocktail Selection | 4950.00 | 0.9463 | Terdominasi |
| Cycle Sort | 4950.00 | 0.3718 | Terdominasi |
| Double Selection | 4950.00 | 0.9434 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9750 | Terdominasi |
| Selection Sort | 4950.00 | 0.9323 | Terdominasi |
| Silly Sort | 4950.00 | 0.0821 | Terdominasi |
| Slowsort | 4950.00 | 0.4644 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2665 | Terdominasi |

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
