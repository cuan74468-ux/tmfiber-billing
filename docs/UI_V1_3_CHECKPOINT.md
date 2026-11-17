# UI V1.3 — checkpoint pengembangan

Tanggal: 17 November 2026

## Selesai di repository
- Delapan halaman navigasi; tampilan beranda + halaman fungsional secara struktur untuk direktori pelanggan, tagihan, verifikasi pembayaran, buku kas, jaringan PPPoE, audit, dan pengaturan.
- Tata letak desktop sidebar, mobile bottom bar; empty states yang eksplisit; aksi finansial dan perubahan jaringan terkunci.
- HTML statis dengan CSP ketat, JS tanpa URL API, tanpa PII, tanpa secret dan tanpa penyimpanan token browser.
- Pemeriksaan otomatis sederhana GitHub Actions: syntax JavaScript dan baseline berkas/privasi.

## Belum selesai — jangan dianggap telah diuji end-to-end
- Otentikasi OTP dan sesi backend, CORS/CSRF, data fetching terotorisasi, CRUD pelanggan/tagihan.
- Ledger finansial, pembukuan, validasi QRIS statis, Fonnte, keamanan perangkat MikroTik.
- Uji browser riil di Android/Windows, PWA offline, GitHub Pages live URL, dan inspeksi aksesibilitas manual.
- Database staging terpisah (backup bukan berarti staging aktif).

## Keputusan arsitektur
Tidak ada data palsu yang menyamar sebagai data nyata. Aksi backend tetap disabled sampai kontrak keamanan dan pengujian sudah disetujui. Jangan memasukkan Code.gs berisi data atau Script Properties ke repo public.

## Uji
GitHub Actions workflow `.github/workflows/static-check.yml` menjalankan `node --check src/app.js` dan `node scripts/check-static.mjs`. Workflow yang tertulis belum membuktikan status run PASS; periksa tab Actions.

## Selanjutnya
1. Verifikasi UI GitHub Pages pada perangkat Android dan desktop.
2. Buat database STAGING terisolasi dari database utama dan salin data sintetis untuk UAT.
3. Implementasikan API Auth/RBAC dan browser transport aman; verifikasi teknis GAS.
4. Integrasikan daftar pelanggan dan tagihan read-only terlebih dahulu; lanjutkan modul mutasi hanya setelah log dan rollback lulus.

## Tambahan PWA aman
- `sw.js` hanya menangani daftar putih file shell publik dan dokumen statis.
- API, URL dengan query, file yang tidak dikenal, request non-GET, dan origin lain tidak dicache oleh service worker.
- Aplikasi menampilkan indikator offline; saat offline tetap tidak menampilkan data/transaksi atau mengizinkan mutasi.
- Perlu pengujian offline manual pada HTTPS GitHub Pages setelah deployment.
