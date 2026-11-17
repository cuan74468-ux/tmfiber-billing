# TMfiber Tahap 2 — frontend modular & API contract
Tanggal: 17 November 2026

## Implementasi
- Kontrak POST tunggal GAS; `action`, `session_token`, `payload`; respons `status: SUCCESS/ERROR`, `code`, `message`, `data`.
- Split JS: `src/core/navigation.js` (ikon & navigasi), `src/views/screens.js` (layar), `src/app.js` (bootstrap, event, router).
- Layar sehari-hari memakai bahasa sederhana, tidak menyebut MikroTik pada beranda.
- Alat teknisi, Riwayat sistem, dan pengaturan hanya masuk melalui Menu (bukan bottom tab).
- Stylesheet mobile `assets/stage2-ux.css` melapisi SUNLIME tanpa membuat tema baru.
- Cache PWA hanya untuk aset frontend publik, termasuk modul ES.

## Tidak dilakukan
Tidak ada perubahan Apps Script, Google Sheets produksi, transaksi pembayaran, router, webhook, dan data pelanggan.

## Verifikasi yang diminta
Node syntax+static tests, browser responsif 360/390/412, navigasi hash, login dialog, tab filter, no horizontal overflow, aksi mutasi disabled. Manual QA HP tetap diperlukan.

## Rollback
Revert satu commit Tahap 2. Tidak perlu rollback database.
