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
| Intelligent Design | 0.00 | 0.0331 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5165 | Pareto-optimal |
| Thanos Sort | 190.00 | 0.5265 | Pareto-optimal |
| Intro Sort | 445.40 | 0.8566 | Pareto-optimal |
| Ford-Johnson | 525.70 | 0.8937 | Pareto-optimal |
| Binary Insertion | 529.90 | 0.8953 | Pareto-optimal |
| Merge Sort | 543.80 | 0.9049 | Pareto-optimal |
| **Shellsort** | **719.50** | **0.9446** | **Titik Lutut Produksi** |
| Comb Sort | 1201.00 | 0.9897 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Quantum Bogo | 1.40 | -0.0349 | Terdominasi |
| Stalin Sort | 99.00 | 0.1055 | Terdominasi |
| Smooth Sort | 147.00 | 0.4847 | Terdominasi |
| Heap Sort | 147.20 | 0.4650 | Terdominasi |
| Patience Sort | 243.70 | 0.4525 | Terdominasi |
| Tournament Sort | 556.40 | 0.8895 | Terdominasi |
| Tree Sort | 598.10 | 0.8354 | Terdominasi |
| Quicksort | 647.20 | 0.8359 | Terdominasi |
| Strand Sort | 705.50 | 0.8321 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9477 | Terdominasi |
| Insertion Sort | 2581.00 | 0.8063 | Terdominasi |
| Cocktail Shaker | 4011.00 | 0.9802 | Terdominasi |
| Odd-Even Sort | 4682.70 | 0.9896 | Terdominasi |
| Bubble Sort | 4884.40 | 0.9709 | Terdominasi |
| Gnome Sort | 4895.60 | 0.9660 | Terdominasi |
| Selection Sort | 4950.00 | 0.9339 | Terdominasi |
| Bogosort | 4950.00 | 0.9789 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9762 | Terdominasi |
| Bozosort | 4950.00 | 0.5992 | Terdominasi |
| Slowsort | 4950.00 | 0.4645 | Terdominasi |
| Cycle Sort | 4950.00 | 0.3362 | Terdominasi |
| Stooge Sort | 4950.00 | 0.3124 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0487 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Binary Insertion**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Shellsort** diidentifikasi sebagai titik lutut optimal untuk Peringkat Cepat dengan akurasi tinggi. Algoritma ini menawarkan akurasi >94% dengan ~720 pertarungan (pengurangan 85% dibandingkan Peringkat Penuh).
- **Full Rank** tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Sortir Esoterik & Lucu: Komedi Kuantitatif
Kami menyertakan beberapa algoritma "mustahil" atau "lucu" dari SortPedia dan Wikipedia untuk mengilustrasikan rentang filosofi pengurutan.

- **Intelligent Design Sort:** Mengasumsikan Sang Pencipta sudah mengurutkan daftar. Waktu $O(1)$, tetapi tidak ada informasi yang diperoleh jika daftar tersebut belum terurut.
- **Thanos Sort:** Menghapus setengah dari alam semesta (data) untuk mengembalikan keteraturan. Akurasi yang mengejutkan untuk jumlah pertarungan yang rendah, dengan biaya kehilangan setengah data Anda.
- **Miracle Sort:** Menunggu keajaiban untuk mengurutkan data.
- **Quantum Bogo Sort:** Menghasilkan permutasi acak dan menghancurkan alam semesta jika tidak terurut.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (tidak signifikan untuk skor bulat yang ditampilkan).
