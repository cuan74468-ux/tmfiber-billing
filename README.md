# TMfiber Billing — Everyday Billing V3

**Status: STAGING SIAP DIPASANG — BELUM GO-LIVE UNTUK TRANSAKSI NYATA.**

Stack: GitHub Pages + Google Apps Script + Google Sheets privat. Fase 1 hanya satu usaha RT/RW Net, Owner-only untuk tindakan finansial. Repository publik **tidak** menyimpan nomor pelanggan, token Fonnte, atau kredensial.

## Kode dan pengujian yang telah diselesaikan

- Frontend 13 rute mobile-first dengan form pelanggan, penerbitan tagihan, cicilan, pelunasan, dan tampilan kas. Form transaksi dinonaktifkan oleh default melalui `src/core/config.js`.
- Backend GAS `gas/Code.gs`, `gas/Customers.gs`, `gas/Payments.gs`, `gas/Diagnostics.gs`: OTP & sesi HMAC, pembacaan Owner-only, pembuatan pelanggan/tagihan, pembayaran manual dengan LockService, ledger, idempotensi, hash audit, dan pemeriksaan pra-aktivasi.
- STAGING Google Sheets privat terpisah **8 tab** dengan header forward-only dan tanpa pelanggan asli. Produksi tidak diubah.
- GitHub Actions: scanner pola rahasia, unit simulasi OTP/CRUD/pembayaran, 13 halaman × viewport 360–1280, dan alur browser sintetis Owner → pelanggan → tagihan → cicilan → lunas.
- GitHub Actions juga membuat artifact instalasi `tmfiber-staging-gas-source` (satu file `Code.gs`).
- Uji otomatis tidak membuktikan OTP Fonnte sungguhan, CORS/redirect GAS, atau pembayaran terhadap Google Sheets aktual.

## Urutan aktivasi yang masih wajib

1. Deploy **Apps Script baru** untuk STAGING, menggunakan artifact GAS satu file. Jangan timpa proyek GAS lama.
2. Isi ScriptProperties privat (tanpa membagikan rahasia) dan akun Owner test di Sheets STAGING. Jalankan `TMFIBER_STAGING_PREFLIGHT`.
3. Buktikan POST dari GitHub Pages ke endpoint `/exec` benar-benar dapat membaca respons.
4. Uji OTP nyata (termasuk salah, kedaluwarsa, replay dan rate limit), akses data Owner, CRUD, transaksi manual dan ledger pada STAGING.
5. Backup produksi, audit dan UAT Owner sebelum konfigurasi produksi. QRIS otomatis dan MikroTik isolir tetap dilarang sampai approval terpisah.

**Dokumen tindakan browser:** [STAGING_DEPLOY_BROWSER_GUIDE](docs/STAGING_DEPLOY_BROWSER_GUIDE.md)

**Go-live gate:** [GO_LIVE_GATE_V1](docs/GO_LIVE_GATE_V1.md)

**Kontrak:** [API_CONTRACT](docs/API_CONTRACT.md)

**Keamanan:** [SECURITY](SECURITY.md)

Kode di `main` bukan izin menyalakan transaksi produksi. Tidak ada implementasi bank auto-payment ataupun command isolir RouterOS yang aktif.
