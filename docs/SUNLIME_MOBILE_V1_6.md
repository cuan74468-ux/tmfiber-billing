# TMfiber — SUNLIME Mobile V1.6
Tanggal: 17 November 2026

## Permintaan
Lebih mobile, premium, menonjol dengan kombinasi kuning dan hijau; tetap relevan untuk billing RT/RW Net.

## Implementasi
- Brand: deep forest #104b33, yellow #ffda3d, lime #d9fc54, paper #f7faef, surface #fffef6.
- Kerangka dari Ngulik Digital dipertahankan (jarak, ritme, navigasi), tetapi dibuat sebagai brand TMfiber yang berani.
- Kartu uang WiFi hijau tua dengan nominal kuning; angka privat tidak ditampilkan tanpa login.
- Quick actions menggunakan kombinasi kuning/lime/hijau lembut. Tombol tetap nonaktif sampai API autentikasi siap.
- Bottom navigation mengambang hijau tua dengan active-state kuning. 5 tab: Beranda, Tagihan, Pelanggan, Kas, Menu.
- Format ringkas, mobile touch-first, adaptasi lebar kecil, reduced-motion.
- CSS versi baru isolated `assets/sunlime-mobile.css` dimuat terakhir; cache PWA dinaikkan v4. Tidak ada perubahan database, backend atau operasi finansial.
- Uji otomatis hanya memeriksa sintaks/static structure; perlu review visual real Android sebelum signoff.

## Rollback
Revert commit atau hapus link stylesheet SUNLIME dari index dan update SW cache. Data utama tidak berubah.
