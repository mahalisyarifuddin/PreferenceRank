# Analisis Algoritma Pengurutan dan Konvergensi pada PreferenceRank

Dokumen ini merangkum hasil pengujian dan analisis mendalam yang dilakukan untuk mengoptimalkan sistem pembuatan pasangan dan penilaian dalam PreferenceRank.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 24 algoritma pengurutan untuk menentukan keseimbangan terbaik antara upaya pengguna (jumlah pertarungan) dan akurasi peringkat (Kendall Tau).

### Metodologi Pengujian
- **Nilai N:** 100
- **Uji Coba:** 10 per algoritma.
- **Metrik 1: Rata-rata Pertarungan:** Jumlah rata-rata perbandingan yang dihasilkan.
- **Metrik 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi.

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rata-rata Pertarungan (menaik), lalu Rata-rata Kendall Tau (menurun).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Heap Sort | 165.00 | 0.4856 | Pareto-optimal |
| Ford-Johnson | 527.20 | 0.8865 | Pareto-optimal |
| Binary Insertion | 532.30 | 0.8884 | Pareto-optimal |
| Merge Sort | 543.10 | 0.9078 | Pareto-optimal |
| **Shellsort** | **722.10** | **0.9458** | **Titik Lutut Produksi** |
| Comb Sort | 1260.40 | 0.9913 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Tournament Sort | 556.30 | 0.8870 | Terdominasi |
| Tree Sort | 627.40 | 0.8405 | Terdominasi |
| Quicksort | 652.40 | 0.8307 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9463 | Terdominasi |
| Insertion Sort | 2592.70 | 0.8085 | Terdominasi |
| Cocktail Shaker | 4003.40 | 0.9788 | Terdominasi |
| Odd-Even Sort | 4573.80 | 0.9877 | Terdominasi |
| Bubble Sort | 4887.60 | 0.9728 | Terdominasi |
| Gnome Sort | 4923.60 | 0.9557 | Terdominasi |
| Bogosort | 4950.00 | 0.9798 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9758 | Terdominasi |
| Selection Sort | 4950.00 | 0.9330 | Terdominasi |
| Bozosort | 4950.00 | 0.5752 | Terdominasi |
| Slowsort | 4950.00 | 0.4656 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2841 | Terdominasi |
| Cycle Sort | 4950.00 | 0.2279 | Terdominasi |
| BogoBogoSort | 4950.00 | 0.0487 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- **Ford-Johnson**, **Binary Insertion**, dan **Merge Sort** memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- **Shellsort** diidentifikasi sebagai titik lutut optimal untuk Peringkat Cepat dengan akurasi tinggi. Algoritma ini menawarkan akurasi >94% dengan ~722 pertarungan (pengurangan 85% dibandingkan Peringkat Penuh).
- **Full Rank** tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Bogosort & BogoBogoSort: Komedi Kuantitatif
Bogosort dan kembaran "jahatnya" BogoBogoSort mewakili puncak absurditas komputasi.

- **Bogosort:** Mengacak seluruh daftar secara acak sampai terurut. Untuk N=100, pengacakan yang diharapkan melebihi 10^157.
- **BogoBogoSort:** Secara rekursif melakukan Bogosort pada prefiks daftar. Algoritma ini sangat tidak efisien sehingga membuat Bogosort terlihat seperti Quicksort sebagai perbandingan.
- **Dalam Pengujian Kami:** Keduanya dibatasi pada 4950 pertarungan. Akurasi mereka hanyalah produk sampingan dari model Bradley-Terry yang mengekstrak informasi jarang dari derau acak.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (tidak signifikan untuk skor bulat yang ditampilkan).
