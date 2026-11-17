# Security policy — TMfiber

Repository **public**, **tidak** berarti database dan fungsi administratif boleh publik.

- Jangan commit akun pribadi, data pelanggan, PPPoE credentials, WA/QRIS/MikroTik tokens, GAS Script Properties, backup, atau log berisi PII.
- Seluruh CRUD, pembayaran dan aksi router wajib divalidasi di backend: session, role, ownership, amount, idempotency, audit.
- GitHub Pages tidak memiliki secret. Pembatasan UI bukan authorization.
- Jangan expose database ID, spreadsheet, GAS privileged endpoints, atau router token dalam browser.
- Jangan gunakan JSONP, `mode:no-cors`, atau URL GET untuk mutasi finansial.
- Sebelum go-live: scan seluruh history Git, source maps dan build artifacts; rotasi secret yang pernah terekspos (termasuk lewat chat).
- Ancaman: XSS, IDOR, CSRF, CORS bypass, replay, duplicate payment, privilege escalation, salah isolir.
- Melaporkan kerentanan: gunakan saluran privat pemilik repository, jangan masukkan secret dalam GitHub Issues.

Kebijakan global: [Ferry Digital Security Standard](https://docs.google.com/document/d/13veBE-ZytT5phGs56msVUzs_yWywNto3oKgreDbt7y0/edit).
