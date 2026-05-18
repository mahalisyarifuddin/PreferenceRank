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
| Exit Sort | 0.00 | 0.0404 | Pareto-optimal |
| Quantum Bogo | 1.70 | 0.0516 | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5541 | Pareto-optimal |
| Hater Sort | 200.00 | 0.6513 | Pareto-optimal |
| Intro Sort | 407.70 | 0.8538 | Pareto-optimal |
| Ford-Johnson | 526.70 | 0.8925 | Pareto-optimal |
| Merge Sort | 542.90 | 0.9036 | Pareto-optimal |
| **Shellsort** | 744.40 | 0.9434 | **Titik Lutut Produksi** |
| Comb Sort | 1260.40 | 0.9906 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0036 | Terdominasi |
| Socialist Sort | 0.00 | -0.0389 | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3765 | Terdominasi |
| Stalin Sort | 99.00 | 0.1075 | Terdominasi |
| Sleep Sort | 100.00 | 0.0046 | Terdominasi |
| Smooth Sort | 141.80 | 0.4803 | Terdominasi |
| Heap Sort | 146.10 | 0.4937 | Terdominasi |
| Random Sort | 176.50 | 0.5124 | Terdominasi |
| Thanos Sort | 190.00 | 0.5288 | Terdominasi |
| Patience Sort | 250.70 | 0.5142 | Terdominasi |
| Dual-Pivot Quicksort | 484.60 | 0.8255 | Terdominasi |
| Binary Insertion | 530.20 | 0.8850 | Terdominasi |
| Tournament Sort | 552.70 | 0.8869 | Terdominasi |
| Quicksort | 637.60 | 0.8416 | Terdominasi |
| Tree Sort | 679.70 | 0.8392 | Terdominasi |
| Strand Sort | 736.80 | 0.8183 | Terdominasi |
| Hayate-Shiki | 928.50 | 0.7728 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9503 | Terdominasi |
| Circle Sort | 2148.80 | 0.9733 | Terdominasi |
| Insertion Sort | 2591.70 | 0.8034 | Terdominasi |
| Cocktail Shaker | 3942.20 | 0.9766 | Terdominasi |
| Odd-Even Sort | 4742.10 | 0.9874 | Terdominasi |
| Bubble Sort | 4886.70 | 0.9730 | Terdominasi |
| Gnome Sort | 4921.10 | 0.9517 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0391 | Terdominasi |
| Bogosort | 4950.00 | 0.9799 | Terdominasi |
| Bozosort | 4950.00 | 0.6008 | Terdominasi |
| Cocktail Selection | 4950.00 | 0.9460 | Terdominasi |
| Cycle Sort | 4950.00 | 0.3437 | Terdominasi |
| Double Selection | 4950.00 | 0.9410 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9756 | Terdominasi |
| Selection Sort | 4950.00 | 0.9354 | Terdominasi |
| Silly Sort | 4950.00 | 0.1095 | Terdominasi |
| Slowsort | 4950.00 | 0.4712 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2829 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Intro Sort**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Shellsort** diidentifikasi sebagai titik lutut optimal untuk Peringkat Cepat dengan akurasi tinggi. Algoritma ini menawarkan akurasi >94% dengan ~744 pertarungan (pengurangan 85% dibandingkan Peringkat Penuh).
- **Full Rank** tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Regresi Estimasi Jumlah Pertarungan
Untuk memberikan ekspektasi pengguna yang akurat, kami mensimulasikan Shellsort (celah Ciura) dari N=5 hingga N=1000 (1000 uji coba per N) dan menurunkan model regresi dengan ketelitian sangat tinggi (ultra-high-fidelity).

- **Observasi:** Pertumbuhan bersifat super-linear, dimodelkan secara akurat oleh hukum pangkat yang diperhalus.
- **Formula Ketelitian Ultra-Tinggi:** `Pertarungan ≈ 0.457 * N * (log2(N))^1.46`
- **Akurasi:** Model ini mencapai kesalahan relatif RMS sebesar 0.93% di seluruh rentang. Model ini memprediksi 8 pertarungan untuk N=5 (simulasi ~8), 725 pertarungan untuk N=100 (simulasi ~734), dan 13113 pertarungan untuk N=1000 (simulasi ~13047), memberikan estimasi yang sangat tepat untuk antarmuka pengguna.

### Sortir Esoterik & Lucu: Komedi Kuantitatif
Kami menyertakan beberapa algoritma "mustahil" atau "lucu" dari SortPedia dan Wikipedia untuk mengilustrasikan rentang filosofi pengurutan.

- **Socialist Sort:** Mengasumsikan semua item sudah sama dan dengan demikian sudah terurut. Algoritma ini menghasilkan **0 pertarungan**.
- **Quantum Bogo Sort:** Menghasilkan permutasi acak dan menghancurkan alam semesta jika tidak terurut. Dalam pengujian kami, algoritma ini menghasilkan **~1.7 pertarungan** karena langsung berhenti saat menemukan satu pasangan yang tidak berurutan.
- **Thanos Sort:** Menghapus setengah dari alam semesta (data) untuk mengembalikan keteraturan. Algoritma ini menunjukkan akurasi yang mengejutkan untuk jumlah pertarungan yang rendah (~190).
- **Miracle Sort:** Menunggu keajaiban untuk mengurutkan data. Dalam pengujian kami, algoritma ini melakukan satu sapuan (~99 pertarungan) dan kemudian menyerah.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (tidak signifikan untuk skor bulat yang ditampilkan).
