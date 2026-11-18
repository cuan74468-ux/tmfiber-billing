# TMfiber Billing — Everyday Billing V3

**Status 18 November 2026: STAGING PREPARATION — BELUM SIAP TRANSAKSI PELANGGAN.**

PWA RT/RW Net: GitHub Pages public UI + Google Apps Script private API + Google Sheets private data. Fase 1 adalah single-tenant. Backend produksi sebelumnya tidak diubah.

## Yang sudah benar-benar terverifikasi
- Everyday Billing V3: 13 rute, Chrome CI PASS pada 360, 390, 412, 768 dan 1280 px tanpa overflow horizontal.
- Backend GAS baru di folder gas: OTP WhatsApp via provider (belum diuji nyata), sesi HMAC, validasi role Owner, baca dashboard/pelanggan/tagihan/kas.
- Manual payment dan cicilan di gas/Payments.gs: sumber STAGING dikunci dengan ScriptProperties, LockService, idempotency key + fingerprint, ledger PENDING/COMMITTED, audit hash chain.
- CI simulasi backend PASS (OTP wrong/replay/revoke; installment/settlement/duplicate/partial write). **Simulasi bukan UAT browser nyata atau bukti finansial produksi aman.**
- Google Sheets STAGING terpisah dibuat TANPA menyalin pelanggan asli; tujuh tab (enam lama dengan header kompatibel + Pembayaran_Ledger).
- CI memindai file publik untuk pola kunci/token yang umum dan nomor WA pelanggan yang menyerupai nomor nyata.
- GitHub Actions otomatis membuat paket satu file Code.gs untuk deployment STAGING melalui browser.

## Yang masih tertutup
- Frontend config src/core/config.js memuat apiEndpoint kosong. Tidak ada request GAS saat website dibuka normal.
- Tidak ada GAS Web App STAGING yang terhubung dari browser, OTP Fonnte nyata, akun test Owner, atau pengujian CORS/redirect.
- Tidak ada CRUD penambahan pelanggan/generasi tagihan nyata yang sudah diuji; no production payment.
- Manual payment GAS hanya kode STAGING yang default gate-nya mati. Pembayaran otomatis, komisi kolektor, pengingat WA, dan MikroTik isolir tetap nonaktif.
- Frontend adalah public shell; jangan berikan sebagai billing produksi sampai UAT dan release Owner sukses.

## Jalur tercepat menuju pilot
1. Buka dokumen docs/STAGING_DEPLOY_BROWSER_GUIDE.md.
2. Pasang paket Code.gs dari artifact GitHub Actions dalam **Apps Script baru** (bukan proyek lama).
3. Masukkan ScriptProperties dan nomor Owner test hanya di tempat privat. Jangan tempel token di chat/GitHub.
4. Uji POST text/plain dari browser, lalu sambungkan apiEndpoint STAGING, OTP dan read-only.
5. Setelah valid, baru uji manual payments di STAGING serta recovery ledger, kemudian UAT Owner dan persetujuan production.

## Referensi
- docs/API_CONTRACT.md
- docs/EVERYDAY_BILLING_V3_CHECKPOINT.md
- docs/STAGING_DEPLOY_BROWSER_GUIDE.md
- docs/STAGING_MANUAL_PAYMENT_DESIGN.md
- docs/MVP_CUSTOMER_DELIVERY_GATE.md
- SECURITY.md

Tidak menggunakan VPS berbayar. Repository ini PUBLIC: JANGAN menyimpan Fonnte token, secret QRIS, token MikroTik, nomor pelanggan, data tagihan, atau session token.
