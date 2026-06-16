[English](README.md) | **Bahasa Indonesia**

# PreferenceRank
Pengurutan yang lebih baik, didukung oleh sains.

## Pendahuluan
PreferenceRank adalah alat pemeringkat ilmiah dan serbaguna untuk apa pun yang Anda suka, terinspirasi oleh penyortir karakter/bias yang viral tetapi ditingkatkan dengan pendekatan yang lebih teliti. Berikan peringkat pada karakter, makanan, film, atau destinasi wisata favorit Anda dengan presisi dan menyenangkan.

## Cara Kerja
PreferenceRank mengurutkan pilihan Anda dengan membandingkannya secara berpasangan. Alat ini menggunakan **sistem peringkat Elo**, khususnya **varian Bradley-Terry**, untuk memberikan skor pada setiap pilihan berdasarkan keputusan Anda. Ini memberikan peringkat relatif dan transparan yang beradaptasi dengan setiap keputusan yang Anda buat. Skor dihitung pada skala 400 poin dengan rata-rata 1000. Lihat bagian "Mode Peringkat" untuk detail lebih lanjut tentang metode perbandingan.

## Mode Peringkat
PreferenceRank menawarkan dua mode berbeda untuk mengurutkan pilihan Anda:

- **Peringkat Penuh (Default):** Menggunakan sistem round-robin yang komprehensif (Pertempuran = N(N-1)/2). Menjamin preferensi yang paling akurat tetapi tumbuh secara kuadratik. Terbaik untuk daftar kecil (<20 pilihan).

- **Peringkat Cepat:** Menggunakan **Merge Sort** untuk pembuatan pasangan yang efisien dan tanpa duplikasi, dikombinasikan dengan **penilaian murni Bradley-Terry** untuk representasi yang akurat.

### Analisis Algoritma
Berdasarkan analisis komparatif dari 79 algoritma pengurutan yang berbeda (lihat [ANALYSIS.md](ANALYSIS.md)), **Merge Sort** diidentifikasi sebagai **titik lutut matematis** yang optimal (menggunakan analisis skala log) untuk pemeringkatan preferensi manusia dengan akurasi tinggi tanpa perbandingan yang redundan.

**Perbandingan (N=100):**
| Algoritma | Rata-rata Pertempuran | Rata-rata Kendall Tau |
|-----------|-----------------------|-----------------------|
| Ford-Johnson | 526.88 | 0.8888 |
| **Merge Sort** | 541.32 | 0.9036 |
| In-place Merge Sort | 542.82 | 0.9049 |
| Rotation Merge Sort | 714.34 | 0.9153 |
| Full Rank | 4950.00 | 1.0000 |
*Peringkat Cepat mengurangi pertempuran sekitar 89% dibandingkan dengan Peringkat Penuh sambil mempertahankan akurasi peringkat yang tinggi. Algoritma yang menghasilkan perbandingan duplikat (seperti Shellsort) dikeluarkan dari produksi untuk memastikan efisiensi pengguna yang maksimal.*

## Detail Teknis
PreferenceRank menggunakan **algoritma Minorization-Maximization (MM)** untuk menemukan Maximum Likelihood Estimate (MLE) bagi model Bradley-Terry. Pendekatan iteratif ini memastikan konvergensi yang terjamin dan perhitungan skor yang efisien (O(N²) per iterasi), menjaga akurasi dan stabilitas bahkan untuk dataset yang lebih besar tanpa beban komputasi operasi matriks.

Berdasarkan **analisis titik lutut**, ambang batas konvergensi ditetapkan pada 1e-7. Nilai ini memberikan pengurangan rata-rata sekitar 43% dalam jumlah iterasi dibandingkan dengan presisi yang lebih tinggi (1e-12) sambil memastikan kesalahan log-strength tetap jauh di bawah ambang batas yang mempengaruhi pembulatan skor Elo integer.

## Mulai Cepat
1. Unduh file `PreferenceRank.html` dari repositori.
2. Buka file tersebut di browser web modern apa pun.
3. Mulailah memberi peringkat pada preferensi Anda!

## Fitur Utama
- **Masukan Fleksibel**: Beri peringkat apa pun—karakter, makanan, film, destinasi, dan banyak lagi.
- **Dua Mode Peringkat**: Pilih antara "Peringkat Penuh" yang komprehensif atau "Peringkat Cepat" yang cerdas (lihat detail di atas).
- **Penilaian Ilmiah**: Menggunakan sistem peringkat Bradley-Terry Elo untuk hasil yang akurat.
- **Estimasi Ketidakpastian**: Memvisualisasikan kepercayaan peringkat dengan detail "Rentang Peringkat" dan "Interval Kepercayaan (IK)", tersedia di mode **Peringkat Cepat** dan **Peringkat Penuh**.
- **Jumlah Pertandingan**: Lihat jumlah pertempuran yang diikuti setiap pilihan untuk wawasan yang lebih mendalam.
- **Nilai Huruf**: Sistem nilai huruf opsional berdasarkan skor Elo (S, A, B, C, D, E, F).
- **Urungkan dan Seri**: Batalkan pilihan terakhir Anda dengan mudah atau izinkan hasil seri dalam peringkat.
- **Ringan**: Sebuah file HTML tunggal tanpa dependensi eksternal, membuatnya portabel dan cepat.
- **Opsi Tema**: Pilih antara tema terang, gelap, atau otomatis untuk pengalaman yang dipersonalisasi.
- **Pintasan Papan Ketik**: Gunakan pintasan papan ketik untuk pemilihan yang lebih cepat selama pemeringkatan.
- **Persistensi Sesi**: Kemajuan Anda secara otomatis disimpan ke penyimpanan lokal browser Anda, memungkinkan Anda untuk melanjutkan sesi pemeringkatan kapan saja.
- **Salin Hasil**: Salin tabel peringkat akhir Anda ke papan klip dengan mudah dengan satu klik.
- **Dukungan Multi-bahasa**: Tersedia dalam Bahasa Inggris dan Bahasa Indonesia.

## Kustomisasi
PreferenceRank adalah sumber terbuka, memungkinkan Anda untuk memodifikasi dan mengadaptasinya sesuai kebutuhan. Ubah algoritma, desain ulang antarmuka, atau tambahkan fungsionalitas baru—semuanya terserah Anda.

## Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detailnya.

## Kontribusi
Kontribusi sangat disambut! Jangan ragu untuk melakukan fork pada repositori dan mengirimkan pull request. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan ide Anda.

## Umpan Balik
Jika Anda memiliki umpan balik atau saran, silakan hubungi melalui bagian Issues di repositori.
