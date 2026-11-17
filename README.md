# TMfiber Billing

Aplikasi administrasi billing RT/RW Net mobile-first, **GitHub Pages (frontend)** + **Google Apps Script (API privat)** + **Google Sheets (database privat)**.

## Status
- UI statis dan PWA sudah disiapkan.
- **Belum terhubung ke API produksi**. Semua tindakan keuangan, SMS/WA, isolir, dan router tidak tersedia sebelum otentikasi API backend dan UAT.
- Tidak ada data pelanggan, kunci privat, atau ID spreadsheet di repository.
- Backend `Code.gs V1.2` yang diuji sebelumnya hanya membuktikan self-test dan preflight, bukan kontrak API untuk login.

## Menjalankan
GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save. Alternatif pengujian lokal: buka `index.html` pada browser (fitur service worker memerlukan HTTPS/localhost).

**Jangan masukkan URL webhook, OTP, token, password, akun atau informasi pelanggan di file frontend.** Endpoint API harus tersedia dengan kontrol autentikasi dan origin sesuai desain `docs/API_CONTRACT.md` sebelum pengaktifan.

## Roadmap
1. Finalkan API backend dan isolasi sesi dengan auth teruji, lakukan security review CORS/CSRF.
2. Uji end-to-end pada database STAGING salinan, bukan data utama.
3. Uji ledger, rekonsiliasi QRIS manual, isolir (dry-run) dan rollback.
4. Aktifkan modul satu per satu melalui persetujuan operator.

Lihat [SECURITY.md](SECURITY.md), [API Contract](docs/API_CONTRACT.md), [UAT](docs/UAT.md), dan [Checkpoint](docs/CHECKPOINT.md).
