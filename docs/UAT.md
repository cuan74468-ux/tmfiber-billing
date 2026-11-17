# UAT — checklist sebelum pengaktifan

## Keamanan
- [ ] Database STAGING terpisah; backup dan rollback diverifikasi.
- [ ] Login OTP, rate limiting, expiry, logout, RBAC, verifikasi akun tak dikenal.
- [ ] CORS, CSRF, XSS dan IDOR diuji; tidak ada PII pada unauthenticated request.
- [ ] Scan seluruh file dan commit history, termasuk artifacts dan GitHub Pages.

## Billing
- [ ] Tagihan per pelanggan/periode idempoten.
- [ ] Waktu Asia/Jakarta pada GAS dan database; audit lintas bulan.
- [ ] Nominal dan kode unik dihitung serta diverifikasi backend.
- [ ] QRIS statis: Owner verifikasi transaksi bank, bukan hanya screenshot atau kecocokan nominal.
- [ ] Retry pembayaran, permintaan ganda, kegagalan tulis parsial, reversal dan rekonsiliasi.
- [ ] Penerimaan kolektor, kas, setoran dan audit tidak double count.

## MikroTik
- [ ] Hanya dry-run sampai profile ISOLIR, token dan sertifikat valid.
- [ ] Never isolate on unknown state / backend outage.
- [ ] Router hanya menjalankan perintah yang disetujui backend; catat ack dan retry.
- [ ] Verifikasi siklus isolir dan unisolir dengan akun uji, bukan pelanggan nyata.

## Publikasi
- [ ] GitHub Pages tampil pada Android dan desktop.
- [ ] Navigasi keyboard, ukuran touch target, responsif.
- [ ] Semua navigasi sensitif tertutup sampai session tervalidasi.
- [ ] Pemilik menyetujui gate produksi.
