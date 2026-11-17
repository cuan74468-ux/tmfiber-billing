# TMfiber — penyelarasan visual dengan Ngulik Digital Member
Tanggal 17 November 2026 · V1.5

## Referensi aktual (GitHub, branch main)
- `cuan74468-ux/ngulik-digital-member/staging/member.html`: memuat banyak lapisan CSS, bukan satu stylesheet.
- `assets/home-v5.css` (latest guest/member): canvas hangat `#faf8f3`, surface `#fffefa`, ink `#252923`, terracotta `#b65c39`, Inter.
- `assets/staging-native-mobile.css`: kontrol sentuh ringkas, kartu tanpa bayangan berat, white space efisien, interaksi mobile.
- `assets/unified-theme.css`: basis Slate & Ink lama, tetapi ditimpa oleh CSS home-v5 untuk sebagian halaman. Jangan salin mentah karena bisa menyebabkan CSS cascade bertabrakan.

## Apa yang direplikasi
Bukan menyalin LMS, membership, API, logo, atau data Ngulik. Hanya desain yang konsisten: warna, tipografi, radius, hierarki, panel ringan, bottom navigation floating, desktop sidebar, dan mobile spacing.

## Implementasi
- Menambah `assets/ngulik-inspired.css` sebagai lapisan visual terakhir setelah `styles.css`.
- Menghilangkan hero biru dengan permukaan hangat, kartu saldo netral dan aksen terracotta yang hemat.
- UI mobile mengikuti gaya Ngulik: navigasi mengambang, surface terang, teks ringkas, touch target nyaman.
- Menambah `#menu` sebagai navigasi kelima agar akses ke Pembayaran, Jaringan, Audit, dan Pengaturan tidak hilang pada HP.
- Service worker versi baru melakukan cache whitelist stylesheet publik yang baru dan membersihkan cache publik versi lama.

## Pengaman
- Data pelanggan dan transaksi tetap tidak dicantumkan di repository PUBLIC.
- Tidak mengubah GAS, Sheets, autentikasi, pembayaran, kas, atau MikroTik.
- Login dan seluruh operasi mutasi masih terkunci; filter tagihan hanya state antarmuka.
- Test otomatis menguji struktur dan CSS. QA visual Android/desktop nyata tetap harus dilakukan.

## Rollback visual
Revert commit V1.5 atau hapus link `assets/ngulik-inspired.css` dari `index.html` lalu perbarui cache service worker. Tidak perlu rollback database.
