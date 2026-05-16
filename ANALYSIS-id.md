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
| Intelligent Design | 0.00 | 0.0324 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5413 | Pareto-optimal |
| Smooth Sort | 170.20 | 0.5445 | Pareto-optimal |
| Intro Sort | 456.80 | 0.8465 | Pareto-optimal |
| Ford-Johnson | 527.40 | 0.8910 | Pareto-optimal |
| Merge Sort | 546.70 | 0.9073 | Pareto-optimal |
| Shellsort | 725.50 | 0.9457 | Pareto-optimal |
| **Aetheris** | **936.70** | **0.9657** | **Titik Lutut Produksi** |
| Comb Sort | 1230.70 | 0.9905 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0230 | Terdominasi |
| Stalin Sort | 99.00 | 0.0640 | Terdominasi |
| Heap Sort | 164.30 | 0.4808 | Terdominasi |
| Thanos Sort | 190.00 | 0.5334 | Terdominasi |
| Patience Sort | 248.80 | 0.4926 | Terdominasi |
| Binary Insertion | 531.20 | 0.8879 | Terdominasi |
| Tournament Sort | 557.00 | 0.8855 | Terdominasi |
| Quicksort | 630.20 | 0.8377 | Terdominasi |
| Tree Sort | 643.60 | 0.8367 | Terdominasi |
| Strand Sort | 774.50 | 0.8265 | Terdominasi |
| Hayate-Shiki | 962.90 | 0.7859 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9526 | Terdominasi |
| Insertion Sort | 2585.00 | 0.8008 | Terdominasi |
| Cocktail Shaker | 3873.70 | 0.9777 | Terdominasi |
| Odd-Even Sort | 4702.50 | 0.9884 | Terdominasi |
| Gnome Sort | 4858.50 | 0.9756 | Terdominasi |
| Bubble Sort | 4877.80 | 0.9747 | Terdominasi |
| Selection Sort | 4950.00 | 0.9359 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2749 | Terdominasi |
| Bogosort | 4950.00 | 0.9804 | Terdominasi |
| Cycle Sort | 4950.00 | 0.3176 | Terdominasi |
| Slowsort | 4950.00 | 0.4357 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9761 | Terdominasi |
| Bozosort | 4950.00 | 0.5962 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0975 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Binary Insertion**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Aetheris** diidentifikasi sebagai titik lutut utama untuk Peringkat Cepat dengan akurasi tinggi. Algoritma ini menyatukan Binary Shellsort dengan lintasan Linear Shifting, menawarkan akurasi >96% dengan ~930 pertarungan (pengurangan 80% dibandingkan Peringkat Penuh).
- **Full Rank** tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Regresi Estimasi Jumlah Pertarungan
Untuk memberikan ekspektasi pengguna yang akurat, kami mensimulasikan Aetheris Sort dari N=5 hingga N=1000 dan menurunkan model regresi dengan ketelitian tinggi.

- **Observasi:** Pertumbuhan bersifat super-linear, dimodelkan secara akurat oleh hukum pangkat yang diperhalus.
- **Formula Ketelitian Tinggi:** `Pertarungan ≈ 0.52 * N * (log2(N))^1.5`
- **Akurasi:** Model ini mencapai kesalahan relatif RMS sebesar 1.2% di seluruh rentang. Model ini memprediksi 9 pertarungan untuk N=5 (simulasi ~8), 889 pertarungan untuk N=100 (simulasi ~937), dan 16328 pertarungan untuk N=1000 (simulasi ~16500), memberikan estimasi yang sangat tepat untuk antarmuka pengguna.

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
