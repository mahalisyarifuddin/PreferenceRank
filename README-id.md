**English** | [Bahasa Indonesia](README-id.md)

# PreferenceRank
Pengurutan lebih baik, didukung oleh sains.

## Pendahuluan
PreferenceRank adalah alat yang serbaguna dan ilmiah untuk mengurutkan apa pun yang Anda sukai, terinspirasi oleh penyortir karakter/bias yang viral tetapi ditingkatkan dengan pendekatan yang lebih ketat. Urutkan karakter, makanan, film, atau tujuan wisata favorit Anda dengan presisi dan menyenangkan.

## Cara Kerja
PreferenceRank mengurutkan pilihan Anda dengan membandingkannya dalam pasangan. Ini menggunakan **sistem peringkat Elo**, khususnya varian **Bradley-Terry berbobot**, untuk memberikan skor pada setiap item berdasarkan pilihan Anda. Ini memberikan peringkat relatif dan transparan yang beradaptasi dengan setiap keputusan yang Anda buat. Skor dihitung pada skala 400 poin dengan rata-rata 1000. Lihat bagian "Mode Peringkat" untuk detail lebih lanjut tentang metode perbandingan.

## Mode Peringkat
PreferenceRank menawarkan dua mode berbeda untuk mengurutkan pilihan Anda:

- **Peringkat Penuh (Bawaan):** Menggunakan sistem round-robin yang komprehensif (Pertarungan = N(N-1)/2). Menjamin preferensi yang paling akurat tetapi tumbuh secara kuadratik. Terbaik untuk daftar kecil (<20 pilihan).

- **Peringkat Cepat:** Menggunakan **Shellsort** untuk pembuatan pasangan yang efisien, dikombinasikan dengan **penilaian Bradley-Terry murni** untuk representasi yang akurat.

### Analisis Algoritma
Berdasarkan analisis komparatif terhadap 24 algoritma pengurutan (lihat [ANALYSIS-id.md](ANALYSIS-id.md)), **Shellsort** diidentifikasi sebagai **titik lutut matematika** optimal untuk peringkat preferensi manusia dengan akurasi tinggi.

**Perbandingan (N=100):**
| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Heap Sort | ~165 | 0.49 | Pareto-optimal |
| Ford-Johnson | ~527 | 0.89 | Pareto-optimal |
| Merge Sort | ~543 | 0.91 | Pareto-optimal |
| **Shellsort** | **~725** | **0.95** | **Titik Lutut** |
| Comb Sort | ~1260 | 0.99 | Pareto-optimal |
| Full Rank | 4950 | 1.00 | Pareto-optimal |

*Peringkat Cepat mengurangi pertarungan sekitar 85% dibandingkan dengan Peringkat Penuh sambil tetap mempertahankan akurasi peringkat yang tinggi. Algoritma seperti Bogosort secara kuantitatif absurd dan hanya berfungsi sebagai pembanding yang lucu.*

## Detail Teknis
PreferenceRank menggunakan **algoritma Minorization-Maximization (MM)** untuk menemukan Maximum Likelihood Estimate (MLE) untuk model Bradley-Terry. Pendekatan iteratif ini memastikan konvergensi yang terjamin dan perhitungan skor yang efisien (O(N²) per iterasi), menjaga akurasi dan stabilitas bahkan untuk kumpulan data yang lebih besar tanpa beban komputasi operasi matriks.

Berdasarkan **analisis titik lutut**, ambang batas konvergensi ditetapkan ke 1e-7. Nilai ini memberikan pengurangan rata-rata ~47% dalam jumlah iterasi dibandingkan dengan presisi yang lebih tinggi (1e-12) sambil memastikan kesalahan kekuatan logaritmik tetap jauh di bawah ambang batas yang mempengaruhi pembulatan skor Elo integer.

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
