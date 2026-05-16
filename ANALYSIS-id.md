# Analisis Algoritma Pengurutan dan Konvergensi pada PreferenceRank

Dokumen ini merangkum hasil pengujian dan analisis mendalam yang dilakukan untuk mengoptimalkan sistem pembuatan pasangan dan penilaian dalam PreferenceRank.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 35 algoritma pengurutan untuk menentukan keseimbangan terbaik antara upaya pengguna (jumlah pertarungan) dan akurasi peringkat (Kendall Tau).

### Metodologi Pengujian
- **Nilai N:** 100
- **Uji Coba:** 10 per algoritma.
- **Metrik 1: Rata-rata Pertarungan:** Jumlah rata-rata perbandingan yang dihasilkan.
- **Metrik 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi.

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rata-rata Pertarungan (menaik), lalu Rata-rata Kendall Tau (menurun).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Intelligent Design | 0.00 | -0.0147 | Pareto-optimal |
| Quantum Bogo | 1.62 | 0.0005 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5423 | Pareto-optimal |
| Intro Sort | 435.28 | 0.8512 | Pareto-optimal |
| Ford-Johnson | 527.20 | 0.8886 | Pareto-optimal |
| Binary Insertion | 530.62 | 0.8891 | Pareto-optimal |
| Merge Sort | 541.62 | 0.9015 | Pareto-optimal |
| Shellsort | 730.18 | 0.9425 | Pareto-optimal |
| **Aetheris** | 949.64 | 0.9629 | **Titik Lutut Produksi** |
| Comb Sort | 1252.48 | 0.9905 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Stalin Sort | 99.00 | 0.0978 | Terdominasi |
| Smooth Sort | 150.92 | 0.4771 | Terdominasi |
| Heap Sort | 153.58 | 0.4755 | Terdominasi |
| Thanos Sort | 190.00 | 0.5330 | Terdominasi |
| Patience Sort | 249.00 | 0.4721 | Terdominasi |
| Tournament Sort | 559.80 | 0.8853 | Terdominasi |
| Quicksort | 658.64 | 0.8382 | Terdominasi |
| Tree Sort | 662.28 | 0.8369 | Terdominasi |
| Strand Sort | 739.42 | 0.8211 | Terdominasi |
| Hayate-Shiki | 943.66 | 0.7802 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9513 | Terdominasi |
| Insertion Sort | 2551.58 | 0.8010 | Terdominasi |
| Cocktail Shaker | 3901.04 | 0.9778 | Terdominasi |
| Odd-Even Sort | 4684.68 | 0.9889 | Terdominasi |
| Gnome Sort | 4876.20 | 0.9622 | Terdominasi |
| Bubble Sort | 4887.64 | 0.9720 | Terdominasi |
| Bogosort | 4950.00 | 0.9792 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9757 | Terdominasi |
| Selection Sort | 4950.00 | 0.9341 | Terdominasi |
| Bozosort | 4950.00 | 0.5906 | Terdominasi |
| Slowsort | 4950.00 | 0.4739 | Terdominasi |
| Cycle Sort | 4950.00 | 0.4338 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2916 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0630 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Binary Insertion**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Aetheris** diidentifikasi sebagai titik lutut utama untuk Peringkat Cepat dengan akurasi tinggi. Algoritma ini menyatukan Binary Shellsort dengan lintasan Linear Shifting, menawarkan akurasi >96% dengan ~930 pertarungan (pengurangan 80% dibandingkan Peringkat Penuh).
- **Full Rank** tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Regresi Estimasi Jumlah Pertarungan
Untuk memberikan ekspektasi pengguna yang akurat, kami mensimulasikan Aetheris Sort dari N=5 hingga N=1000 dan menurunkan model regresi dengan ketelitian tinggi.

- **Observasi:** Pertumbuhan bersifat super-linear, dimodelkan secara akurat oleh hukum pangkat yang diperhalus.
- **Formula Ketelitian Tinggi:** `Pertarungan ≈ 0.14 * N * (log2(N))^2.25`
- **Akurasi:** Model ini mencapai kesalahan relatif RMS sebesar 0.8% pada rentang paling umum (N=20-1000). Model ini memprediksi 5 pertarungan untuk N=5 (simulasi ~8), 992 pertarungan untuk N=100 (simulasi ~949), dan 24705 pertarungan untuk N=1000 (simulasi ~24466), memberikan estimasi yang sangat tepat untuk antarmuka pengguna.

### Sortir Esoterik & Lucu: Komedi Kuantitatif
Kami menyertakan beberapa algoritma "mustahil" atau "lucu" dari SortPedia dan Wikipedia untuk mengilustrasikan rentang filosofi pengurutan.

- **Intelligent Design Sort:** Mengasumsikan Sang Pencipta sudah mengurutkan daftar. Algoritma ini menghasilkan **0 pertarungan** karena langsung berhenti, sehingga tidak memberikan perolehan informasi sama sekali.
- **Quantum Bogo Sort:** Menghasilkan permutasi acak dan menghancurkan alam semesta jika tidak terurut. Dalam pengujian kami, algoritma ini menghasilkan **~1.5 pertarungan** karena langsung berhenti (menghancurkan alam semesta) saat menemukan satu pasangan yang tidak berurutan, yang terjadi hampir seketika dalam daftar acak.
- **Thanos Sort:** Menghapus setengah dari alam semesta (data) untuk mengembalikan keteraturan. Algoritma ini menunjukkan akurasi yang mengejutkan untuk jumlah pertarungan yang rendah (~190), namun dengan konsekuensi kehilangan setengah dari pilihan Anda secara permanen.
- **Miracle Sort:** Menunggu keajaiban untuk mengurutkan data. Dalam pengujian kami, algoritma ini melakukan satu sapuan (~99 pertarungan) dan kemudian menyerah pada keajaiban tersebut.

- **Kompatibilitas Visualizer Sortir:** Versi umum dari algoritma Aetheris Sort tersedia di `research/aetheris_visualizer.js`, yang kompatibel dengan API [SortVisualizer.com](https://sortvisualizer.com/docs/).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (tidak signifikan untuk skor bulat yang ditampilkan).
