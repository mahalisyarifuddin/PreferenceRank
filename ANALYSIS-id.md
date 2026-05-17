# Analisis Algoritma Pengurutan dan Konvergensi pada PreferenceRank

Dokumen ini merangkum hasil pengujian dan analisis mendalam yang dilakukan untuk mengoptimalkan sistem pembuatan pasangan dan penilaian dalam PreferenceRank.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 45 algoritma pengurutan untuk menentukan keseimbangan terbaik antara upaya pengguna (jumlah pertarungan) dan akurasi peringkat (Kendall Tau).

### Metodologi Pengujian
- **Nilai N:** 100
- **Uji Coba:** 10 per algoritma.
- **Metrik 1: Rata-rata Pertarungan:** Jumlah rata-rata perbandingan yang dihasilkan.
- **Metrik 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi.

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rata-rata Pertarungan (menaik), lalu Rata-rata Kendall Tau (menurun).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Socialist Sort | 0.00 | -0.0057 | Pareto-optimal |
| Quantum Bogo | 2.00 | 0.0227 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5333 | Pareto-optimal |
| Thanos Sort | 190.00 | 0.5457 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6632 | Pareto-optimal |
| Random Sort | 264.10 | 0.6943 | Pareto-optimal |
| Intro Sort | 423.00 | 0.8545 | Pareto-optimal |
| Ford-Johnson | 526.30 | 0.8876 | Pareto-optimal |
| Merge Sort | 542.00 | 0.9043 | Pareto-optimal |
| **Shellsort** | 733.00 | 0.9451 | **Titik Lutut Produksi** |
| Comb Sort | 1210.90 | 0.9904 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Exit Sort | 0.00 | -0.0146 | Terdominasi |
| Intelligent Design | 0.00 | -0.0098 | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.2963 | Terdominasi |
| Stalin Sort | 99.00 | 0.0945 | Terdominasi |
| Sleep Sort | 100.00 | 0.0030 | Terdominasi |
| Heap Sort | 146.40 | 0.4752 | Terdominasi |
| Smooth Sort | 156.40 | 0.4898 | Terdominasi |
| Patience Sort | 255.50 | 0.4869 | Terdominasi |
| Dual-Pivot Quicksort | 527.90 | 0.8377 | Terdominasi |
| Binary Insertion | 529.40 | 0.8855 | Terdominasi |
| Tournament Sort | 561.00 | 0.8918 | Terdominasi |
| Quicksort | 642.60 | 0.8354 | Terdominasi |
| Tree Sort | 667.90 | 0.8363 | Terdominasi |
| Strand Sort | 709.70 | 0.8333 | Terdominasi |
| Hayate-Shiki | 965.50 | 0.7921 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9503 | Terdominasi |
| Circle Sort | 2180.40 | 0.9715 | Terdominasi |
| Insertion Sort | 2506.40 | 0.8046 | Terdominasi |
| Cocktail Shaker | 4022.50 | 0.9815 | Terdominasi |
| Odd-Even Sort | 4554.00 | 0.9855 | Terdominasi |
| Gnome Sort | 4844.00 | 0.9660 | Terdominasi |
| Bubble Sort | 4865.60 | 0.9743 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0848 | Terdominasi |
| Bogosort | 4950.00 | 0.9794 | Terdominasi |
| Bozosort | 4950.00 | 0.5606 | Terdominasi |
| Cocktail Selection | 4950.00 | 0.9472 | Terdominasi |
| Cycle Sort | 4950.00 | 0.1995 | Terdominasi |
| Double Selection | 4950.00 | 0.9378 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9750 | Terdominasi |
| Selection Sort | 4950.00 | 0.9312 | Terdominasi |
| Silly Sort | 4950.00 | 0.1402 | Terdominasi |
| Slowsort | 4950.00 | 0.4629 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2820 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Intro Sort**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Shellsort** diidentifikasi sebagai titik lutut optimal untuk Peringkat Cepat dengan akurasi tinggi. Algoritma ini menawarkan akurasi >94% dengan ~730 pertarungan (pengurangan 85% dibandingkan Peringkat Penuh).
- **Full Rank** tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Regresi Estimasi Jumlah Pertarungan
Untuk memberikan ekspektasi pengguna yang akurat, kami mensimulasikan Shellsort (celah Ciura) dari N=5 hingga N=1000 (1000 uji coba per N) dan menurunkan model regresi dengan ketelitian sangat tinggi (ultra-high-fidelity).

- **Observasi:** Pertumbuhan bersifat super-linear, dimodelkan secara akurat oleh hukum pangkat yang diperhalus.
- **Formula Ketelitian Ultra-Tinggi:** `Pertarungan ≈ 0.457 * N * (log2(N))^1.46`
- **Akurasi:** Model ini mencapai kesalahan relatif RMS sebesar 0.93% di seluruh rentang. Model ini memprediksi 8 pertarungan untuk N=5 (simulasi ~8), 725 pertarungan untuk N=100 (simulasi ~734), dan 13113 pertarungan untuk N=1000 (simulasi ~13047), memberikan estimasi yang sangat tepat untuk antarmuka pengguna.

### Sortir Esoterik & Lucu: Komedi Kuantitatif
Kami menyertakan beberapa algoritma "mustahil" atau "lucu" dari SortPedia dan Wikipedia untuk mengilustrasikan rentang filosofi pengurutan.

- **Socialist Sort:** Mengasumsikan semua item sudah sama dan dengan demikian sudah terurut. Algoritma ini menghasilkan **0 pertarungan**.
- **Quantum Bogo Sort:** Menghasilkan permutasi acak dan menghancurkan alam semesta jika tidak terurut. Dalam pengujian kami, algoritma ini menghasilkan **~2 pertarungan** karena langsung berhenti saat menemukan satu pasangan yang tidak berurutan.
- **Thanos Sort:** Menghapus setengah dari alam semesta (data) untuk mengembalikan keteraturan. Algoritma ini menunjukkan akurasi yang mengejutkan untuk jumlah pertarungan yang rendah (~190).
- **Miracle Sort:** Menunggu keajaiban untuk mengurutkan data. Dalam pengujian kami, algoritma ini melakukan satu sapuan (~99 pertarungan) dan kemudian menyerah.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (tidak signifikan untuk skor bulat yang ditampilkan).
