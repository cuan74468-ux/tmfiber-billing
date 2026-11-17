# TMfiber V1 — Kontrak API (usulan, belum diimplementasikan)

Frontend GitHub Pages **tidak boleh** membaca Sheets secara langsung atau memanggil endpoint router.

## Batas keamanan
- `POST /session/otp/request`: nomor pengguna terdaftar, rate limiting, pesan respons non-enumerating.
- `POST /session/otp/verify`: OTP satu kali, TTL, batas percobaan, session acak dengan expiration.
- `GET /session/me`: identitas dan role dari server, bukan parameter client.
- `GET /dashboard`: KPI terotorisasi.
- `GET /customers`, `GET /invoices`, `GET /payments`, `GET /cashbook`, `GET /network`: pagination/filter di sisi server.
- `POST /payments/confirm`: Owner only, bukti mutasi terverifikasi, idempotency key, lock dan audit.
- `POST /invoices/generate`: Owner only, per pelanggan-periode sekali.
- `POST /network/commands`: Owner only, otorisasi kuat, dry-run lebih dulu.
- `POST /session/logout`: invalidasi sesi.

Jika memakai GAS Web App, implementasi konkret perlu memastikan browser dapat menggunakan API dengan aman; redirect ContentService/CORS/cookies harus diuji. **Jangan menggunakan `mode: no-cors` sebagai jalan pintas**. Pertimbangkan server proxy/API gateway jika model keamanan GAS tidak memenuhi kebutuhan.

## Respons terstruktur
Sukses: `{ "ok": true, "data": { ... } }`. Gagal: `{ "ok": false, "error": { "code": "...", "message": "..." } }`.
Jangan masukkan secret, token router, atau nomor WA pribadi ke respons publik.

## Status saat commit
Belum ada endpoint production yang diikat ke UI; tidak ada URL rahasia disimpan dalam frontend.
