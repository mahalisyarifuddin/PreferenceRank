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

- **Peringkat Cepat:** Mode ini menggunakan algoritma **Merge Sort** deterministik untuk mengurutkan item Anda dengan kompleksitas O(N log N). Mode ini menjamin akurasi pengurutan 100% (asalkan preferensi konsisten) sambil secara drastis mengurangi jumlah perbandingan yang diperlukan dibandingkan dengan Peringkat Penuh. Sebagai contoh, mengurutkan 50 item memerlukan sekitar 75% lebih sedikit perbandingan dibandingkan Peringkat Penuh. Mode ini direkomendasikan untuk daftar yang panjang.

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
