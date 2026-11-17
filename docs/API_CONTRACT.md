# TMfiber Billing — Kontrak API GAS (Tahap 2; belum aktif)

**Sumber yang disepakati:** Dokumen Sinkronisasi TMfiber termasuk Bab 8; satu endpoint GAS HTTP POST. Ini menggantikan rancangan REST sebelumnya. Tidak ada panggilan jaringan baru pada frontend Tahap 2.

## 1. Request tunggal
```http
POST {GAS_WEB_APP_URL}
Content-Type: text/plain;charset=utf-8

{"action":"get_dashboard_data","session_token":"<SESSION_OPAQUE>","payload":{}}
```
URL Web App bukan secret autentikasi. Jangan pernah menyematkan API key, nomor pelanggan atau ScriptProperties pada frontend publik.

## 2. Respons standar
**Sukses**:
```json
{"status":"SUCCESS","code":200,"message":"Berhasil.","data":{}}
```
**Gagal**:
```json
{"status":"ERROR","code":403,"message":"Akses ditolak.","data":{}}
```
Semua action mengembalikan tepat envelope `status` (SUCCESS/ERROR), `code` numerik, `message` string, `data` object. Format `ok` boolean **bukan** kontrak TMfiber.

## 3. Daftar action (akan diimplementasikan setelah Tahap 2)
| action | Autentikasi dan izin | Tahap |
|---|---|---|
| `request_otp`, `verify_otp` | nomor terdaftar, rate limit, OTP sekali pakai, TTL | 3 |
| `logout` | sesi aktif, revokasi | 3 |
| `get_dashboard_data`, `get_customers`, `get_invoices` | sesi server dan RBAC | 3 |
| `save_customer`, `generate_monthly_bills` | OWNER; validasi, sanitasi, idempotency | 4 |
| `mark_as_paid`, `record_installment` | OWNER/KOLEKTOR terbatas; lock+ledger | 4–5 |
| `get_cashbook`, `save_cash_entry`, `confirm_collector_deposit` | OWNER; akses kolektor dibatasi | 5 |
| `get_network_status` | OWNER/TEKNISI | 7 |
| `get_mikrotik_commands` | token router terpisah, DRY_RUN=true | 7 |

## 4. Persyaratan keamanan
- Server memverifikasi HMAC-SHA256 atau validitas session token opak, expiry, revokasi, dan role pada **setiap** request. Jangan percaya role/tenant_id dari frontend.
- `Content-Type: text/plain;charset=utf-8` menghindari jenis preflight tertentu, tetapi **tidak menjamin browser CORS dan redirect GAS dapat membaca respons**. Tahap 3 wajib proof-of-concept dari GitHub Pages, tanpa `mode: no-cors` atau JSONP.
- Untuk penulisan finansial gunakan `LockService.getScriptLock()`, idempotency key, aturan anti-double-submit, dan catat `Audit_Log` dengan `prev_hash` serta `row_hash`. Hash chaining pada Sheets adalah tamper-evident terbatas, bukan immutable.
- Simpan token Fonnte, QRIS, MikroTik dan secret penandatangan di ScriptProperties GAS. Lindungi data pelanggan agar tidak pernah menjadi file publik.
- Formula injection ditangani per-field sebagai teks yang aman tanpa merusak nomor WhatsApp berawalan '+'.

## 5. Bab 8, kontrak tahap lanjut
- Portal cek tagihan `?inv=ID_TAGIHAN&sig=HMAC_SHORT` memerlukan expiry, pembatasan akses, tanda tangan server-side, tanpa PII di URL/respons tidak terotorisasi.
- Status `CICIL` tetap pada kolom H Tagihan; `jumlah_terbayar`, `sisa_hutang`, `komisi_biller` akan ditambah di kanan kolom L melalui migrasi forward-only dan ledger pembayaran terpisah.
- Komisi hanya dihitung satu kali saat `LUNAS`; reversal, setoran dan audit wajib konsisten.
- QRIS statis perlu verifikasi bank; jangan menganggap nominal unik membuatnya menjadi QRIS dinamis.

## 6. Status gate
Belum ada API Tahap 3 yang diaktifkan, tidak ada perubahan Google Sheets/GAS/QRIS/router pada Tahap 2. UAT dan approval Owner wajib sebelum perubahan transaksi.
