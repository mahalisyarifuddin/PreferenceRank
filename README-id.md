[English](README.md) | **Bahasa Indonesia**

# PreferenceRank
*Sorting made better, powered by science.*

## Pendahuluan
PreferenceRank adalah alat fleksibel dan ilmiah untuk mengurutkan apa saja sesuai preferensi Anda, terinspirasi dari *character/bias sorter* yang viral, tetapi dikembangkan dengan pendekatan yang lebih terstruktur. Baik itu karakter favorit, makanan, film, atau destinasi wisata, alat ini memastikan hasil pemeringkatan yang akurat dan menyenangkan.

## Cara Kerja
PreferenceRank mengurutkan item Anda dengan membandingkannya secara berpasangan. Alat ini menggunakan **sistem peringkat Elo Bradley-Terry** untuk memberikan skor pada setiap item berdasarkan pilihan Anda, sehingga menghasilkan peringkat yang transparan dan relatif. Lihat bagian "Mode Peringkat" untuk detail lebih lanjut mengenai metode perbandingan.

## Mode Peringkat
PreferenceRank menawarkan dua mode berbeda untuk mengurutkan item Anda:

- **Peringkat Penuh (Default):** Mode ini menggunakan sistem turnamen round-robin yang komprehensif, di mana setiap item akan dibandingkan dengan semua item lainnya. Metode ini menyeluruh dan menjamin representasi preferensi Anda yang paling akurat, tetapi bisa memakan waktu untuk daftar yang panjang.

- **Peringkat Cepat:** Mode ini menggunakan **Algoritma Ford-Johnson (Merge-Insertion Sort)** untuk mengurutkan item Anda. Algoritma ini secara teoritis optimal untuk meminimalkan jumlah perbandingan yang diperlukan untuk mengurutkan daftar. Mode ini menjamin akurasi pengurutan 100% (asalkan preferensi konsisten) sambil secara drastis mengurangi waktu yang dibutuhkan dibandingkan dengan Peringkat Penuh. Sebagai contoh, mengurutkan 50 item memerlukan lebih dari 80% lebih sedikit perbandingan dibandingkan Peringkat Penuh. Mode ini direkomendasikan untuk daftar yang panjang.

## Perbandingan Performa
Jumlah pertarungan (perbandingan) yang diperlukan untuk memeringkat daftar Anda bergantung pada jumlah item dan mode yang Anda pilih.

*   **Peringkat Penuh**: Perbandingan meningkat secara kuadratik ($y = \frac{x(x-1)}{2}$). Terbaik untuk daftar pendek (di bawah 20 item).
*   **Peringkat Cepat**: Perbandingan meningkat jauh lebih lambat, mendekati $y \approx x \log_2 x$. Terbaik untuk daftar menengah hingga besar. Mengaktifkan opsi "Seri" di Peringkat Cepat sedikit meningkatkan jumlah pertarungan (~15%) karena hasil seri menambah ambiguitas yang harus diselesaikan algoritma.

| Item ($x$) | Pertarungan Peringkat Penuh | Pertarungan Peringkat Cepat (Ketat) | Pertarungan Peringkat Cepat (Seri Diizinkan) | Penghematan (Cepat vs Penuh) |
| :--- | :--- | :--- | :--- | :--- |
| 5 | 10 | ~11 | ~14 | -10% |
| 10 | 45 | ~31 | ~40 | 31% |
| 20 | 190 | ~80 | ~99 | 58% |
| 50 | 1225 | ~264 | ~313 | 78% |
| 100 | 4950 | ~626 | ~724 | 87% |

*Catatan: Pertarungan Peringkat Cepat adalah perkiraan rata-rata berdasarkan 1000 simulasi Monte Carlo. "Ketat" mengasumsikan preferensi unik (tanpa seri).*

## Cara Menggunakan
1. Unduh berkas `PreferenceRank.html` dari repositori.
2. Buka berkas tersebut di peramban web modern apa pun.
3. Mulai urutkan preferensi Anda!

## Fitur Utama
- **Masukan Fleksibel**: Urutkan apa saja—karakter, makanan, film, destinasi, dan lainnya.
- **Dua Mode Peringkat**: Pilih antara "Peringkat Penuh" yang komprehensif atau "Peringkat Cepat" yang cerdas (lihat detail di atas).
- **Penilaian Ilmiah**: Menggunakan sistem peringkat Elo Bradley-Terry untuk hasil yang akurat.
- **Urungkan dan Seri**: Batalkan pilihan terakhir Anda dengan mudah atau izinkan hasil seri dalam pemeringkatan.
- **Ringan**: Satu berkas HTML tanpa dependensi eksternal, sehingga portabel dan cepat.
- **Opsi Tema**: Pilih antara tema terang, gelap, atau otomatis untuk pengalaman yang dipersonalisasi.
- **Pintasan Papan Ketik**: Gunakan pintasan papan ketik untuk pemilihan yang lebih cepat saat memeringkatkan.
- **Dukungan Multi-bahasa**: Tersedia dalam Bahasa Inggris dan Bahasa Indonesia.

## Kustomisasi
PreferenceRank adalah proyek sumber terbuka, sehingga Anda bebas untuk memodifikasi dan menyesuaikannya sesuai kebutuhan. Baik itu untuk menyempurnakan algoritma, merancang ulang antarmuka, atau menambahkan fitur baru, semua terserah Anda.

## Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT. Lihat berkas `LICENSE` untuk detailnya.

## Kontribusi
Kontribusi sangat diterima! Jika Anda ingin berkontribusi, silakan *fork* repositori dan kirimkan *pull request*. Untuk perubahan besar, harap buka isu terlebih dahulu untuk mendiskusikan ide Anda.

## Umpan Balik
Jika Anda memiliki masukan atau saran, silakan hubungi melalui bagian Issues di repositori.
