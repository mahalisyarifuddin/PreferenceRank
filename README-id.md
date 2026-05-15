[English](README.md) | **Bahasa Indonesia**

# PreferenceRank
*Sorting made better, powered by science.*

## Pendahuluan
PreferenceRank adalah alat fleksibel dan ilmiah untuk mengurutkan apa saja sesuai preferensi Anda, terinspirasi dari *character/bias sorter* yang viral, tetapi dikembangkan dengan pendekatan yang lebih terstruktur. Baik itu karakter favorit, makanan, film, atau destinasi wisata, alat ini memastikan hasil pemeringkatan yang akurat dan menyenangkan.

## Cara Kerja
PreferenceRank mengurutkan item Anda dengan membandingkannya secara berpasangan. Alat ini menggunakan **sistem peringkat Elo Bradley-Terry varian berbobot** untuk memberikan skor pada setiap item berdasarkan pilihan Anda, sehingga menghasilkan peringkat yang transparan dan relatif. Skor dihitung pada skala 400 poin dengan rata-rata 1000. Lihat bagian "Mode Peringkat" untuk detail lebih lanjut mengenai metode perbandingan.

## Mode Peringkat
PreferenceRank menawarkan dua mode berbeda untuk mengurutkan item Anda:

- **Peringkat Penuh (Default):** Menggunakan sistem round-robin komprehensif (Pertarungan = N(N-1)/2). Menjamin preferensi paling akurat namun meningkat secara kuadratik. Terbaik untuk daftar pendek (<20 item).

- **Peringkat Cepat:** Menggunakan **Algoritma Ford-Johnson** (Merge-Insertion Sort) untuk pembuatan pasangan yang efisien, dikombinasikan dengan **skor murni Bradley-Terry** untuk representasi yang akurat.

### Analisis Algoritma
Berdasarkan analisis perbandingan berbagai algoritma pengurutan (lihat [ANALYSIS.md](ANALYSIS.md)), **Ford-Johnson** diidentifikasi sebagai pilihan paling efisien untuk pemeringkatan preferensi manusia. Algoritma ini bersifat Pareto-optimal, memaksimalkan perolehan informasi sembari meminimalkan kelelahan pengguna.

**Perbandingan (N=100), Diurutkan berdasarkan Kendall Tau:**
| Algoritma | Rata-rata Pertarungan | Rata-rata Kendall Tau | Status Pareto |
| :--- | :--- | :--- | :--- |
| Quicksort | ~661 | 0,84 | Terdominasi |
| **Ford-Johnson** | **~527** | **0,89** | **Pareto-optimal** |
| Merge Sort | ~543 | 0,90 | Pareto-optimal |
| Shellsort | ~730 | 0,94 | Titik Lutut |
| Peringkat Penuh | 4950 | 1,00 | Pareto-optimal |

*Peringkat Cepat (Ford-Johnson) mengurangi jumlah pertarungan sebesar ~89% dibandingkan dengan Peringkat Penuh sembari tetap mempertahankan akurasi pemeringkatan yang tinggi.*

## Detail Teknis
PreferenceRank menggunakan **algoritma Minorization-Maximization (MM)** untuk menemukan Maximum Likelihood Estimate (MLE) bagi model Bradley-Terry. Pendekatan iteratif ini menjamin konvergensi dan perhitungan skor yang efisien (O(N²) per iterasi), menjaga akurasi dan stabilitas bahkan untuk kumpulan data yang lebih besar tanpa beban komputasi dari operasi matriks.

Berdasarkan **analisis titik lutut (knee point analysis)**, ambang batas konvergensi ditetapkan pada `1e-7`. Nilai ini memberikan rata-rata pengurangan jumlah iterasi sebesar ~48% dibandingkan dengan presisi yang lebih tinggi (`1e-12`), sembari memastikan kesalahan log-strength (~10⁻⁷) tetap jauh di bawah ambang batas yang dapat memengaruhi skor Elo bilangan bulat yang dibulatkan.

## Cara Menggunakan
1. Unduh berkas `PreferenceRank.html` dari repositori.
2. Buka berkas tersebut di peramban web modern apa pun.
3. Mulai urutkan preferensi Anda!

## Fitur Utama
- **Masukan Fleksibel**: Urutkan apa saja—karakter, makanan, film, destinasi, dan lainnya.
- **Dua Mode Peringkat**: Pilih antara "Peringkat Penuh" yang komprehensif atau "Peringkat Cepat" yang cerdas (lihat detail di atas).
- **Penilaian Ilmiah**: Menggunakan sistem peringkat Elo Bradley-Terry untuk hasil yang akurat.
- **Estimasi Ketidakpastian**: Menampilkan keyakinan peringkat dengan rincian "Rentang Peringkat" dan "Interval Keyakinan (IK)", tersedia di mode **Peringkat Cepat** dan **Peringkat Penuh**.
- **Jumlah Pertarungan**: Melihat jumlah pertarungan yang diikuti oleh setiap item untuk wawasan lebih mendalam.
- **Nilai Huruf**: Sistem nilai huruf opsional berdasarkan skor Elo (S, A, B, C, D, E, F).
- **Urungkan dan Seri**: Batalkan pilihan terakhir Anda dengan mudah atau izinkan hasil seri dalam pemeringkatan.
- **Ringan**: Satu berkas HTML tanpa dependensi eksternal, sehingga portabel dan cepat.
- **Opsi Tema**: Pilih antara tema terang, gelap, atau otomatis untuk pengalaman yang dipersonalisasi.
- **Pintasan Papan Ketik**: Gunakan pintasan papan ketik untuk pemilihan yang lebih cepat saat memeringkatkan.
- **Penyimpanan Sesi**: Progres Anda disimpan secara otomatis ke penyimpanan lokal peramban, memungkinkan Anda melanjutkan sesi peringkat kapan saja.
- **Salin Hasil**: Salin tabel peringkat akhir Anda ke papan klip dengan mudah hanya dengan satu klik.
- **Dukungan Multi-bahasa**: Tersedia dalam Bahasa Inggris dan Bahasa Indonesia.

## Kustomisasi
PreferenceRank adalah proyek sumber terbuka, sehingga Anda bebas untuk memodifikasi dan menyesuaikannya sesuai kebutuhan. Baik itu untuk menyempurnakan algoritma, merancang ulang antarmuka, atau menambahkan fitur baru, semua terserah Anda.

## Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT. Lihat berkas `LICENSE` untuk detailnya.

## Kontribusi
Kontribusi sangat diterima! Jika Anda ingin berkontribusi, silakan *fork* repositori dan kirimkan *pull request*. Untuk perubahan besar, harap buka isu terlebih dahulu untuk mendiskusikan ide Anda.

## Umpan Balik
Jika Anda memiliki masukan atau saran, silakan hubungi melalui bagian Issues di repositori.
