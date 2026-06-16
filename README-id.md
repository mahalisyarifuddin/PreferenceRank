**English** | [Bahasa Indonesia](README-id.md)

# PreferenceRank
Pengurutan lebih baik, didukung oleh sains.

## Pendahuluan
PreferenceRank adalah alat yang serbaguna dan ilmiah untuk mengurutkan apa pun yang Anda sukai, terinspirasi oleh penyortir karakter/bias yang viral tetapi ditingkatkan dengan pendekatan yang lebih ketat. Urutkan karakter, makanan, film, atau tujuan wisata favorit Anda dengan presisi dan menyenangkan.

## Cara Kerja
PreferenceRank mengurutkan pilihan Anda dengan membandingkannya dalam pasangan. Ini menggunakan **sistem peringkat Elo**, khususnya varian **Bradley-Terry**, untuk memberikan skor pada setiap item berdasarkan pilihan Anda. Ini memberikan peringkat relatif dan transparan yang beradaptasi dengan setiap keputusan yang Anda buat. Skor dihitung pada skala 400 poin dengan rata-rata 1000. Lihat bagian "Mode Peringkat" untuk detail lebih lanjut tentang metode perbandingan.

## Mode Peringkat
PreferenceRank menawarkan dua mode berbeda untuk mengurutkan pilihan Anda:

- **Peringkat Penuh (Bawaan):** Menggunakan sistem round-robin yang komprehensif (Pertarungan = N(N-1)/2). Menjamin preferensi yang paling akurat tetapi tumbuh secara kuadratik. Terbaik untuk daftar kecil (<20 pilihan).

- **Peringkat Cepat:** Menggunakan **PrismChain Rank** untuk pembuatan pasangan yang efisien dan tanpa duplikat, dikombinasikan dengan **kemenangan transitif bayangan** untuk akurasi yang unggul.

### Analisis Algoritma
Berdasarkan analisis perbandingan terhadap 78 algoritma pengurutan yang berbeda (lihat [ANALYSIS-id.md](ANALYSIS-id.md)), **PrismChain Rank** diidentifikasi sebagai **titik lutut matematis** yang optimal (menggunakan analisis skala log) untuk pemeringkatan preferensi manusia dengan akurasi tinggi tanpa perbandingan yang redundan.

**Perbandingan (N=100):**
| Algoritma | Rata-rata Pertempuran | Rata-rata Kendall Tau |
|-----------|-----------------------|-----------------------|
| Miracle Sort | 99.00 | 0.5483 |
| Ford-Johnson | 527.06 | 0.8880 |
| In-place Merge Sort | 541.92 | 0.9048 |
| **PrismChain Rank** | 520.00 | 0.9229 |
| Rotation Merge Sort | 715.24 | 0.9161 |
| Full Rank | 4950.00 | 1.0000 |

*Peringkat Cepat mengurangi jumlah pertarungan hingga sekitar 89% dibandingkan dengan Peringkat Penuh, sekaligus tetap mempertahankan akurasi peringkat yang tinggi. Algoritma yang menghasilkan perbandingan ganda dikecualikan dari proses produksi untuk memastikan efisiensi pengguna yang maksimal.

## Mulai Cepat
1. Unduh file `PreferenceRank.html` dari repositori.
2. Buka file tersebut di peramban web modern apa pun.
3. Mulai urutkan preferensi Anda!

## Fitur Utama
- **Input Fleksibel**: Urutkan apa saja—karakter, makanan, film, tujuan wisata, dan lainnya.
- **Dua Mode Peringkat**: Pilih antara "Peringkat Penuh" yang komprehensif atau "Peringkat Cepat" yang cerdas (lihat detail di atas).
- **Penilaian Ilmiah**: Menggunakan sistem peringkat Elo Bradley-Terry untuk hasil yang akurat.
- **Estimasi Ketidakpastian**: Memvisualisasikan kepercayaan peringkat dengan detail "Rentang Peringkat" dan "Interval Kepercayaan (IK)", tersedia di mode **Peringkat Cepat** dan **Peringkat Penuh**.
- **Jumlah Pertandingan**: Lihat jumlah pertarungan yang diikuti setiap pilihan untuk wawasan lebih mendalam.
- **Nilai Huruf**: Sistem nilai huruf opsional berdasarkan skor Elo (S, A, B, C, D, E, F).
- **Urungkan dan Seri**: Membatalkan pilihan terakhir Anda dengan mudah atau mengizinkan hasil seri dalam peringkat.
- **Ringan**: Sebuah file HTML tunggal tanpa dependensi eksternal, membuatnya portabel dan cepat.
- **Opsi Tema**: Pilih antara tema terang, gelap, atau otomatis untuk pengalaman yang dipersonalisasi.
- **Pintasan Papan Ketik**: Gunakan pintasan papan ketik untuk pemilihan yang lebih cepat selama pemeringkatan.
- **Penyimpanan Sesi**: Kemajuan Anda secara otomatis disimpan ke penyimpanan lokal peramban Anda, memungkinkan Anda untuk melanjutkan sesi peringkat kapan saja.
- **Salin Hasil**: Salin tabel peringkat akhir Anda ke papan klip dengan mudah dengan satu klik.
- **Dukungan Multi-bahasa**: Tersedia dalam bahasa Inggris dan Bahasa Indonesia.

## Kustomisasi
PreferenceRank bersifat sumber terbuka, memungkinkan Anda untuk memodifikasi dan menyesuaikannya sesuai kebutuhan. Ubah algoritma, desain ulang antarmuka, atau tambahkan fungsionalitas baru—semuanya terserah Anda.

## Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detailnya.

## Kontribusi
Kontribusi sangat disambut! Jangan ragu untuk melakukan fork pada repositori dan kirimkan pull request. Untuk perubahan besar, silakan buka issue terlebih dahulu untuk mendiskusikan ide Anda.

## Umpan Balik
Jika Anda memiliki umpan balik atau saran, silakan hubungi melalui bagian Issues di repositori.
