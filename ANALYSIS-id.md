# Analisis Algoritma Pengurutan dan Konvergensi pada PreferenceRank

Dokumen ini merangkum hasil pengujian dan analisis mendalam yang dilakukan untuk mengoptimalkan sistem pembuatan pasangan dan penilaian dalam PreferenceRank.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 23 algoritma pengurutan untuk menentukan keseimbangan terbaik antara upaya pengguna (jumlah pertarungan) dan akurasi peringkat (Kendall Tau).

### Metodologi Pengujian
- **Nilai N:** 100
- **Uji Coba:** 1-10 per algoritma.
- **Metrik 1: Rata-rata Pertarungan:** Jumlah rata-rata perbandingan yang dihasilkan.
- **Metrik 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi.

### Hasil (N=100)
Tabel ini dipartisi berdasarkan status Pareto dan diurutkan berdasarkan Rata-rata Pertarungan (menaik), lalu Rata-rata Kendall Tau (menurun).

| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Tournament Sort | 1.00 | 0.0028 | Pareto-optimal |
| Heap Sort | 168.00 | 0.5883 | Pareto-optimal |
| Ford-Johnson | 524.00 | 0.8921 | Pareto-optimal |
| Merge Sort | 535.00 | 0.8990 | Pareto-optimal |
| **Shellsort** | **713.00** | **0.9487** | **Titik Lutut** |
| Comb Sort | 1201.00 | 0.9875 | Pareto-optimal |
| Odd-Even Sort | 4554.00 | 0.9891 | Pareto-optimal |
| Full Rank | 4950.00 | 1.0000 | Pareto-optimal |
| Binary Insertion | 536.00 | 0.8889 | Terdominasi |
| Tree Sort | 582.00 | 0.8396 | Terdominasi |
| Quicksort | 601.00 | 0.8368 | Terdominasi |
| Bitonic Sort | 1334.00 | 0.9531 | Terdominasi |
| Insertion Sort | 2676.00 | 0.8311 | Terdominasi |
| Cocktail Shaker | 3915.00 | 0.9737 | Terdominasi |
| Bubble Sort | 4914.00 | 0.9733 | Terdominasi |
| Bogosort | 4950.00 | 0.9762 | Terdominasi |
| Pancake Sort | 4950.00 | 0.9721 | Terdominasi |
| Gnome Sort | 4950.00 | 0.9523 | Terdominasi |
| Selection Sort | 4950.00 | 0.9341 | Terdominasi |
| Cycle Sort | 4950.00 | 0.7774 | Terdominasi |
| Bozosort | 4950.00 | 0.5608 | Terdominasi |
| Slowsort | 4950.00 | 0.5038 | Terdominasi |
| Stooge Sort | 4950.00 | 0.2739 | Terdominasi |

### Analisis Pareto Frontier & Titik Lutut
Pareto Frontier mengidentifikasi algoritma di mana tidak ada algoritma lain yang lebih baik dalam meminimalkan pertarungan sekaligus lebih baik dalam memaksimalkan akurasi.

- Ford-Johnson dan Merge Sort memberikan rasio akurasi-terhadap-pertarungan yang luar biasa untuk upaya tingkat menengah.
- Shellsort diidentifikasi sebagai titik lutut matematika untuk N=100. Algoritma ini menawarkan akurasi 95% dengan hanya 713 pertarungan (pengurangan 85% dibandingkan Peringkat Penuh).
- Full Rank tetap menjadi standar emas untuk akurasi, tetapi dengan biaya yang sangat besar yaitu 4950 pertarungan.

### Bogosort: Komedi Kuantitatif
Bogosort adalah "badut" dalam algoritma pengurutan. Metodologinya—mengacak seluruh daftar secara acak sampai daftar tersebut terurut—sengaja dibuat konyol.

- **Kompleksitas:** O(N * N!). Untuk N=100, jumlah pengacakan yang diharapkan adalah sekitar 9.3e157.
- **Komedi dalam Angka:** Untuk mengurutkan 100 item, Bogosort kemungkinan besar membutuhkan lebih banyak pengacakan daripada jumlah atom di alam semesta yang teramati. Jika setiap atom di alam semesta adalah komputer yang melakukan satu miliar pengacakan per detik, Bogosort tetap tidak akan selesai pada saat bintang terakhir di alam semesta padam.
- **Dalam Pengujian Kami:** Bogosort dibatasi pada jumlah pertarungan Round Robin (4950). Algoritma ini mencapai akurasi ~0.98. Meskipun terlihat tinggi, hal ini semata-mata karena algoritma ini melakukan perbandingan acak dalam jumlah besar yang kemudian digunakan oleh model Bradley-Terry untuk mengekstrak informasi. Efisiensinya (Tau / Pertarungan) secara astronomis lebih rendah daripada algoritma rasional lainnya.

**Kesimpulan:** Shellsort digunakan untuk "Peringkat Cepat" karena mewakili titik lutut matematika dari efisiensi pengurutan.

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang batas titik lutut. Optimalisasi ini menghemat ~47% iterasi sambil mempertahankan kesalahan skor maksimum <0.001 (tidak signifikan untuk skor bulat yang ditampilkan).
