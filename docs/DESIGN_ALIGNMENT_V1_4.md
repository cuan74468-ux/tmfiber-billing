# TMfiber — Design Alignment V1.4
Date: 2026-11-17

## Acuan
- Handoff Gemini: DOKUMEN SINKRONISASI PROYEK & HANDOFF IMPLEMENTASI: TMFIBER BILLING (diterima dari pemilik).
- Blueprint: https://docs.google.com/document/d/1V8w2rNG-Otom63DSQEZl5cJJ1KZTRmPVLGHbR2GGSHo/edit
- Linggau Design System: https://docs.google.com/document/d/1mKuw7ztdgixwH71shkifZxM8D_2SWTgf2WSpNiBykz8/edit
- Keamanan: https://docs.google.com/document/d/13veBE-ZytT5phGs56msVUzs_yWywNto3oKgreDbt7y0/edit

**Versi yang perlu direkonsiliasi:** Handoff Gemini menyebut Linggau Design System v1.2; isi awal dokumen Drive yang terakses tertulis v1.1. Implementasi memakai prinsip Clean/Human/Alive yang dapat dibaca, bukan menganggap token v1.2 telah terverifikasi.

## Implementasi
- UI mobile-first dengan aksen biru #118eea dan header biru sesuai spesifikasi TMfiber, bukan tema umum V1.3.
- Beranda: saldo privat, progress belum tersedia, empat quick actions locked, filter tagihan interaktif dan pencarian disabled.
- Menu: Beranda, Tagihan, Pelanggan, Kas, Pengaturan pada mobile. Modul pembayaran, jaringan, audit tetap ada pada desktop dan dapat dibuka via hash route; navigasi mobile ke menu lain akan diatur setelah autentikasi.
- Kartu berstatus empty bukan data dummy; tidak mengklaim semua pelanggan lunas.
- Pengaturan: profil usaha, petugas, WhatsApp, QRIS, jaringan, audit.
- Dialog login akses petugas tampil konsisten, OTP disabled hingga backend diuji.
- No credentials, API URL, records, Script Properties, atau token di browser.

## Keselamatan dan batas implementasi
- Tidak ada migrasi database atau aktivasi pembayaran/routing.
- Tidak menerapkan rekomendasi localStorage session token tanpa threat model dan pengujian.
- Rekomendasi handoff HTTP POST text/plain ke GAS belum dianggap bukti browser CORS sukses; perlu proof-of-concept dan pemeriksaan redirect.
- Handoff meminta immutability audit log; hash-chain hanya dapat mendeteksi sebagian perubahan jika trust anchor terlindungi, tidak membuktikan log Google Sheets tidak dapat diubah.
- Handoff mengandung contoh nomor WA dan secret placeholder; jangan salin sebagai data publik.

## Pengujian dan tindak lanjut
- GitHub Actions static check harus PASS setelah commit; bukan bukti visual QA.
- Perlu inspeksi Android 360px/412px, desktop, modal, tab, landscape, screen reader, PWA update, dan browser nyata.
- Next: validasi UI manual, lalu API read-only dengan server auth pada database staging terpisah.
