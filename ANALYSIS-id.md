# Analisis Algoritma Pengurutan dan Konvergensi di PreferenceRank

Dokumen ini merangkum tolok ukur dan analisis ekstensif yang dilakukan untuk mengoptimalkan pembuatan pasangan dan sistem penilaian di PreferenceRank, dengan fokus pada **perbandingan murni tanpa duplikasi** sebagai kriteria utama pemilihan algoritma.

## 1. Perbandingan Algoritma Pengurutan (N=100)

Kami membandingkan 67 algoritma pengurutan. Persyaratan utama untuk produksi adalah penghapusan perbandingan pasangan duplikat. Algoritma yang meminta pasangan yang sama dua kali sekarang diidentifikasi dan dikeluarkan dari analisis titik lutut Pareto-optimal untuk memastikan efisiensi pengguna yang maksimal.

### Metodologi Tolok Ukur
- **N Value:** 100
- **Trials:** 250 per algorithm.
- **Metric 1: Rata-rata Pertempuran:** Total perbandingan unik yang disajikan kepada pengguna.
- **Metric 2: Rata-rata Kendall Tau:** Korelasi peringkat antara kekuatan tersembunyi yang sebenarnya dan skor estimasi (BT).
- **Metric 3: Duplikasi:** Menunjukkan apakah algoritma pernah meminta pasangan yang sama dua kali selama satu pengurutan.

### Hasil (N=100)
| Algoritma | Rata-rata Pertempuran | Rata-rata Kendall Tau | Duplikasi | Status Pareto |
| :--- | :--- | :--- | :--- | :--- |
| Exit Sort | 0.00 | 0.0108 | TIDAK | Pareto-optimal |
| Quantum Bogo | 1.69 | 0.0135 | TIDAK | Pareto-optimal |
| Miracle Sort | 99.00 | 0.5480 | TIDAK | Pareto-optimal |
| Ford-Johnson | 526.71 | 0.8880 | TIDAK | Pareto-optimal |
| In-place Merge Sort | 541.60 | 0.9038 | TIDAK | Pareto-optimal |
| **Merge Sort** | 541.74 | 0.9023 | TIDAK | **Titik Lutut Produksi** |
| Bucket Sort | 757.80 | 0.8007 | TIDAK | Terdominasi |
| Radix Sort | 4527.58 | 0.9458 | YA | Terdominasi |
| Full Rank | 4950.00 | 1.0000 | TIDAK | Pareto-optimal |
| Intelligent Design | 0.00 | -0.0069 | TIDAK | Terdominasi |
| Socialist Sort | 0.00 | -0.0056 | TIDAK | Terdominasi |
| BogoBogoSort | 44.02 | 0.0863 | YA | Terdominasi |
| Genghis Khan Sort | 99.00 | 0.3686 | TIDAK | Terdominasi |
| Stalin Sort | 99.00 | 0.1018 | TIDAK | Terdominasi |
| Thanos Sort | 99.00 | 0.5459 | YA | Terdominasi |
| Heap Sort | 99.67 | 0.4807 | YA | Terdominasi |
| Sleep Sort | 100.00 | -0.0034 | TIDAK | Terdominasi |
| Smooth Sort | 100.24 | 0.4913 | YA | Terdominasi |
| 3-Way Quicksort | 102.38 | 0.3577 | YA | Terdominasi |
| Silly Sort | 138.00 | 0.2387 | YA | Terdominasi |
| Hater Sort | 196.06 | 0.6620 | YA | Terdominasi |
| PDQSort | 196.92 | 0.5634 | YA | Terdominasi |
| Patience Sort | 200.01 | 0.4884 | YA | Terdominasi |
| Quicksort (Hoare) | 204.74 | 0.5232 | YA | Terdominasi |
| Random Sort | 237.53 | 0.6367 | YA | Terdominasi |
| Cycle Sort | 454.58 | 0.4163 | YA | Terdominasi |
| Binary Insertion | 530.88 | 0.8870 | TIDAK | Terdominasi |
| Timsort | 531.96 | 0.8968 | YA | Terdominasi |
| Triple-Pivot Quicksort | 536.18 | 0.8260 | YA | Terdominasi |
| 4-way Merge Sort | 543.80 | 0.9037 | TIDAK | Terdominasi |
| Ping-pong Merge Sort | 558.32 | 0.8858 | TIDAK | Terdominasi |
| Bottom-up Merge Sort | 558.52 | 0.8874 | TIDAK | Terdominasi |
| Parallel Merge Sort | 558.52 | 0.8866 | TIDAK | Terdominasi |
| Tournament Sort | 559.18 | 0.8869 | TIDAK | Terdominasi |
| Powersort | 562.34 | 0.9084 | YA | Terdominasi |
| 3-way Merge Sort | 568.24 | 0.8797 | TIDAK | Terdominasi |
| Natural Merge Sort | 577.01 | 0.8915 | YA | Terdominasi |
| Quicksort (Ninther) | 604.84 | 0.8421 | YA | Terdominasi |
| Tree Sort | 643.40 | 0.8367 | TIDAK | Terdominasi |
| Quicksort (Random) | 643.62 | 0.8367 | TIDAK | Terdominasi |
| Stable Quicksort | 644.48 | 0.8370 | TIDAK | Terdominasi |
| Parallel Quicksort | 646.26 | 0.8369 | TIDAK | Terdominasi |
| Quicksort (LTR) | 647.45 | 0.8372 | TIDAK | Terdominasi |
| Quicksort (RTL) | 650.88 | 0.8370 | TIDAK | Terdominasi |
| Dual-Pivot Quicksort | 651.85 | 0.8369 | TIDAK | Terdominasi |
| Quicksort (Middle) | 654.45 | 0.8373 | TIDAK | Terdominasi |
| Shellsort | 672.14 | 0.9322 | YA | Terdominasi |
| Quicksort (Mo3) | 717.40 | 0.8269 | YA | Terdominasi |
| BlockQuicksort | 720.58 | 0.8067 | TIDAK | Terdominasi |
| Intro Sort | 727.61 | 0.8076 | TIDAK | Terdominasi |
| Strand Sort | 744.26 | 0.8188 | TIDAK | Terdominasi |
| Comb Sort | 851.56 | 0.9746 | YA | Terdominasi |
| Hayate-Shiki | 930.30 | 0.7827 | YA | Terdominasi |
| Bitonic Sort | 1035.41 | 0.9578 | YA | Terdominasi |
| Circle Sort | 1205.64 | 0.9688 | YA | Terdominasi |
| Slowsort | 1321.66 | 0.9486 | YA | Terdominasi |
| Bubble Sort | 2567.80 | 0.8012 | YA | Terdominasi |
| Cocktail Shaker | 2568.30 | 0.8049 | YA | Terdominasi |
| Gnome Sort | 2568.67 | 0.8027 | YA | Terdominasi |
| Insertion Sort | 2585.11 | 0.8046 | TIDAK | Terdominasi |
| Odd-Even Sort | 2618.44 | 0.8069 | YA | Terdominasi |
| Selection Sort | 2732.37 | 0.8899 | YA | Terdominasi |
| Cocktail Selection | 2750.68 | 0.9219 | YA | Terdominasi |
| Double Selection | 2766.21 | 0.9219 | YA | Terdominasi |
| Stooge Sort | 2898.02 | 0.9900 | YA | Terdominasi |
| Pancake Sort | 3079.41 | 0.9686 | YA | Terdominasi |
| Bogosort | 4950.00 | 1.0000 | YA | Terdominasi |

### Regresi Estimasi Jumlah Pertempuran
Untuk Merge Sort (Titik Lutut Produksi yang baru):
- **Formula:** `Pertempuran Unik ≈ N * log2(N) - (N - 1)`
- For N=100, ini memprediksi ~565 battles (disimulasikan ~542 unique rata-rata).

---

## 2. Analisis Konvergensi Bradley-Terry

Kami menganalisis konvergensi algoritma Minorization-Maximization (MM) dan mengidentifikasi 1e-7 sebagai ambang titik lutut. Optimalisasi ini menghemat ~43% iterasi sambil mempertahankan kesalahan skor maksimum <0,001 (diabaikan untuk skor integer yang dibulatkan).

## 3. Stabilitas Tolok Ukur dan Optimasi Uji Coba

Untuk memastikan keandalan peringkat kami, kami menganalisis dampak jumlah uji coba terhadap stabilitas tolok ukur. Jumlah uji coba optimal diidentifikasi sebagai **200** menggunakan analisis titik lutut skala log dari kesalahan standar rata-rata (SEM).

```
Trials	Vanilla_Tau	Vanilla_SEM	InPlace_Tau	InPlace_SEM	Mean_Diff	SEM_Diff	Total_SEM
50	0.90587	0.00165	0.90587	0.00165	0.000000	0.000000	0.003295
100	0.90251	0.00123	0.90251	0.00123	0.000000	0.000000	0.002466
150	0.90353	0.00092	0.90353	0.00092	0.000000	0.000000	0.001846
200	0.90395	0.00091	0.90395	0.00091	0.000000	0.000000	0.001820
250	0.90384	0.00078	0.90384	0.00078	0.000000	0.000000	0.001559
300	0.90461	0.00064	0.90461	0.00064	0.000000	0.000000	0.001275
350	0.90414	0.00067	0.90414	0.00067	0.000000	0.000000	0.001344
400	0.90346	0.00059	0.90346	0.00059	0.000000	0.000000	0.001188
450	0.90284	0.00054	0.90284	0.00054	0.000000	0.000000	0.001071
500	0.90409	0.00053	0.90409	0.00053	0.000000	0.000000	0.001066
550	0.90418	0.00051	0.90418	0.00051	0.000000	0.000000	0.001014
600	0.90382	0.00051	0.90382	0.00051	0.000000	0.000000	0.001024
650	0.90386	0.00047	0.90386	0.00047	0.000000	0.000000	0.000937
700	0.90370	0.00045	0.90370	0.00045	0.000000	0.000000	0.000903
750	0.90388	0.00043	0.90388	0.00043	0.000000	0.000000	0.000850
800	0.90396	0.00041	0.90396	0.00041	0.000000	0.000000	0.000825
850	0.90455	0.00040	0.90455	0.00040	0.000000	0.000000	0.000798
900	0.90359	0.00042	0.90359	0.00042	0.000000	0.000000	0.000842
950	0.90324	0.00038	0.90324	0.00038	0.000000	0.000000	0.000760
1000	0.90410	0.00038	0.90410	0.00038	0.000000	0.000000	0.000766
```
