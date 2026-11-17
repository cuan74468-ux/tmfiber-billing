# TMfiber Billing

PWA billing RT/RW Net berbasis **GitHub Pages (public UI)** + **Google Apps Script (private logic)** + **Google Sheets (private data)**.

## Status yang terverifikasi
- Frontend V1.4: desain mobile-first yang mengikuti handoff Gemini (Clean, Human, Alive), bukan produk billing yang sudah online sepenuhnya.
- Backend GAS: Self-Test dan Preflight telah PASS pada sesi operator. API login, CRUD, finansial dan MikroTik belum tervalidasi end-to-end.
- GitHub Pages meng-host **hanya UI publik**. Halaman dan form terlindungi tidak menarik data maupun menjalankan transaksi sampai autentikasi tersedia.
- Service worker cache terbatas pada file statis publik, tidak menyimpan data pelanggan atau respons API.

## Pengoperasian
Pengaturan Pages: branch `main`, folder `/(root)`. Gunakan browser untuk menguji tampilan, menu, filter, dan dialog.
Jangan masukkan OTP, kredensial, nomor pelanggan atau rahasia ke repository.

## Dokumen
- [Design alignment](docs/DESIGN_ALIGNMENT_V1_4.md)
- [API contract (rancangan, belum diaktifkan)](docs/API_CONTRACT.md)
- [UAT](docs/UAT.md)
- [Security](SECURITY.md)
- [Checkpoint](docs/CHECKPOINT.md)

## Gate implementasi
1. Audit visual Android + desktop.
2. Backend auth RBAC read-only STAGING, transport browser yang benar.
3. CRUD dan pembayaran manual idempoten setelah tes dan approval.
4. MikroTik dry-run dan QRIS real bank reconciliation setelah pengamanan.
5. Multi-tenant sesudah pilot berhasil.
