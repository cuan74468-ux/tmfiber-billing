# TMfiber — Everyday Billing V3
Tanggal: 18 November 2026
Status: FRONTEND UI ONLY — API Auth / Read Only Tahap 3 belum dimulai

## Keputusan desain
Bukan web portofolio, NSAPP clone, atau dashboard dekoratif. Everyday Billing adalah workspace RT/RW Net mobile-first yang menampilkan pekerjaan harian dahulu. Design tokens: background #F8F9FB; primary #174F43; ink #17212F; neutral white; states green/orange/blue/red by meaning, Inter system-font fallback. Spacing 8px, control 44px+, mobile bottom navigation 5 pilihan, sidebar desktop.

## Navigasi
Utama: Beranda, Tagihan, Pelanggan, Kas, Menu.
Di Menu: Pembayaran, Detail Pelanggan, Detail Tagihan, Panel Penagih, Panel Teknisi, Riwayat Sistem, Pengaturan, Portal Pelanggan.
Role access is **future design only**. Frontend hiding does not enforce permissions. Actual RBAC must be implemented in GAS before data goes live.

## Halaman dan tanggung jawab
- Beranda: ringkasan penerimaan (private), jumlah belum bayar/lunas/pelanggan/jatuh tempo, tindakan harian, daftar tagihan dan aktivitas.
- Tagihan: filter Belum Bayar/Cicilan/Lunas/Semua, cari, buat, detail dan status.
- Pelanggan: cari, daftar, tambah, navigasi ke rincian layanan.
- Detail Pelanggan: profil, paket, riwayat tagihan, catatan teknis.
- Detail Tagihan: rincian, cicilan, pembayaran, bukti dan audit.
- Pembayaran: bukti bayar, rekonsiliasi dan konfirmasi manual setelah backend aman.
- Kas: pemasukan, pengeluaran, setoran dan ringkasan.
- Panel Penagih: penagihan dan setoran yang di-scope ke petugas.
- Panel Teknisi: status dan pemeriksaan jaringan; tidak mengirim perintah router.
- Riwayat Sistem: audit untuk Owner.
- Pengaturan: profil, paket, akses petugas, WhatsApp, QRIS dan keamanan.
- Portal Pelanggan: rancangan halaman dengan verifikasi signature server-side + expiry sebelum menampilkan informasi.

## Batas keamanan
Tidak ada pelanggan, token, QRIS key, Script Properties atau jaringan API di public GitHub. Semua tombol tulis disabled. Filter hanya mengubah chip; tidak ada data dummy yang dianggap nyata. Service worker cache whitelist file statis publik; tidak cache sesi atau API. Belum melakukan migrasi Sheets atau menyentuh GAS. Tidak ada aktivasi pembayaran/MikroTik/OTP.

## QA
CI menjalankan syntax check, static contract/privacy checks, Chrome viewport 360,390,412,768,1280; navigasi 13 rute, overflow, login dialog dan filter chip. Screenshots tersedia sebagai Actions artifact. Pengujian perangkat Android fisik tetap memerlukan review Owner.

## Next gate
Lakukan review visual dan UAT UI. Tahap 3 adalah proof-of-concept POST text/plain GAS, server-side RBAC, OTP dan read-only STAGING **setelah** persetujuan berikutnya. Tidak melakukan tindakan finansial di Tahap 3.

## Rollback
Revert commit frontend V3 pada branch main; tidak ada rollback data karena backend dan Sheets tidak diubah.
