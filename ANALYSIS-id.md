# Analisis Algoritma Pengurutan dan Konvergensi pada PreferenceRank

Dokumen ini merangkum hasil pengujian dan analisis mendalam yang dilakukan untuk mengoptimalkan sistem pembuatan pasangan dan penilaian dalam PreferenceRank.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 33 algoritma pengurutan untuk menentukan keseimbangan terbaik antara upaya pengguna (jumlah pertarungan) dan akurasi peringkat (Kendall Tau).

### Metodologi Pengujian
- **Nilai N:** 100
- **Uji Coba:** 10 per algoritma.
- **Metrik 1: Rata-rata Pertarungan:** Jumlah rata-rata perbandingan yang dihasilkan.
- **Metrik 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi.

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rata-rata Pertarungan (menaik), lalu Rata-rata Kendall Tau (menurun).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | -0.0056 | Pareto-optimal |
| Quantum Bogo | 1.62 | 0.0078 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5464 | Pareto-optimal |
| Intro Sort | 420.16 | 0.8498 | Pareto-optimal |
| Ford-Johnson | 526.98 | 0.8885 | Pareto-optimal |
| Merge Sort | 542.62 | 0.9043 | Pareto-optimal |
| **Shellsort** | 728.94 | 0.9414 | **Titik Lutut Produksi** |
| Comb Sort | 1234.66 | 0.9902 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Stalin Sort | 99.00 | 0.0701 | Terdominasi |
| Smooth Sort | 152.42 | 0.4740 | Terdominasi |
| Heap Sort | 152.94 | 0.4841 | Terdominasi |
| Thanos Sort | 190.00 | 0.5322 | Terdominasi |
| Patience Sort | 251.70 | 0.4875 | Terdominasi |
| Binary Insertion | 531.08 | 0.8875 | Terdominasi |
| Tournament Sort | 561.58 | 0.8872 | Terdominasi |
| Tree Sort | 649.72 | 0.8375 | Terdominasi |
| Quicksort | 650.62 | 0.8369 | Terdominasi |
| Strand Sort | 753.62 | 0.8169 | Terdominasi |
| Hayate-Shiki | 932.42 | 0.7835 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9487 | Terdominasi |
| Insertion Sort | 2619.90 | 0.8068 | Terdominasi |
| Cocktail Shaker | 3868.36 | 0.9778 | Terdominasi |
| Odd-Even Sort | 4658.94 | 0.9881 | Terdominasi |
| Gnome Sort | 4859.46 | 0.9623 | Terdominasi |
| Bubble Sort | 4896.92 | 0.9723 | Terdominasi |
| Bogosort | 4950.00 | 0.9784 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9757 | Terdominasi |
| Selection Sort | 4950.00 | 0.9331 | Terdominasi |
| Bozosort | 4950.00 | 0.5856 | Terdominasi |
| Cycle Sort | 4950.00 | 0.4677 | Terdominasi |
| Slowsort | 4950.00 | 0.4627 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2843 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0518 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Binary Insertion**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Shellsort** diidentifikasi sebagai titik lutut optimal untuk Peringkat Cepat dengan akurasi tinggi. Algoritma ini menawarkan akurasi >94% dengan ~720 pertarungan (pengurangan 85% dibandingkan Peringkat Penuh).
- **Full Rank** tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Regresi Estimasi Jumlah Pertarungan
Untuk memberikan ekspektasi pengguna yang akurat, kami mensimulasikan Shellsort (celah Ciura) dari N=5 hingga N=1000 (1000 uji coba per N) dan menurunkan model regresi dengan ketelitian sangat tinggi (ultra-high-fidelity).

- **Observasi:** Pertumbuhan bersifat super-linear, dimodelkan secara akurat oleh hukum pangkat yang diperhalus.
- **Formula Ketelitian Ultra-Tinggi:** `Pertarungan ≈ 0.457 * N * (log2(N))^1.46`
- **Akurasi:** Model ini mencapai kesalahan relatif RMS sebesar 0.93% di seluruh rentang. Model ini memprediksi 8 pertarungan untuk N=5 (simulasi ~8), 725 pertarungan untuk N=100 (simulasi ~734), dan 13113 pertarungan untuk N=1000 (simulasi ~13047), memberikan estimasi yang sangat tepat untuk antarmuka pengguna.

### Sortir Esoterik & Lucu: Komedi Kuantitatif
Kami menyertakan beberapa algoritma "mustahil" atau "lucu" dari SortPedia dan Wikipedia untuk mengilustrasikan rentang filosofi pengurutan.

- **Intelligent Design Sort:** Mengasumsikan Sang Pencipta sudah mengurutkan daftar. Algoritma ini menghasilkan **0 pertarungan** karena langsung berhenti, sehingga tidak memberikan perolehan informasi sama sekali.
- **Quantum Bogo Sort:** Menghasilkan permutasi acak dan menghancurkan alam semesta jika tidak terurut. Dalam pengujian kami, algoritma ini menghasilkan **~1.5 pertarungan** karena langsung berhenti (menghancurkan alam semesta) saat menemukan satu pasangan yang tidak berurutan, yang terjadi hampir seketika dalam daftar acak.
- **Thanos Sort:** Menghapus setengah dari alam semesta (data) untuk mengembalikan keteraturan. Algoritma ini menunjukkan akurasi yang mengejutkan untuk jumlah pertarungan yang rendah (~190), namun dengan konsekuensi kehilangan setengah dari pilihan Anda secara permanen.
- **Miracle Sort:** Menunggu keajaiban untuk mengurutkan data. Dalam pengujian kami, algoritma ini melakukan satu sapuan (~99 pertarungan) dan kemudian menyerah pada keajaiban tersebut.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (tidak signifikan untuk skor bulat yang ditampilkan).
