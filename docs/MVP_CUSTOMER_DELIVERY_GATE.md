# TMfiber — customer delivery checklist (MVP)

Status as of 18 November 2026: UI Chrome tests PASS. GAS source prepared but deployment, OTP provider, CORS, real database reads, cash collection and router behaviour remain unverified.

1. Isolated staging spreadsheet with fake accounts, same six tabs and headers, no real PII.
2. Install new GAS source in separate staging script. Supply only server-side Script Properties.
3. Verify from GitHub Pages browser: text/plain POST reads response despite GAS redirect. Fail closed on CORS.
4. Real test OTP including wrong, expired, reused, throttled, role restricted, logout and revocation.
5. Verify read-only dashboard totals and customer listing against STAGING fixtures.
6. Implement idempotent manual payments in staging using ScriptLock, transaction ledger and audit hash chain; verify partial-write recovery.
7. UAT with Owner, backups, invoice link HMAC, biller commissions, then explicit production go-live approval.
8. MikroTik still DRY_RUN, automatic payments disabled.

The public GitHub repository contains zero production data or credentials added by this release. Do not call this operationally ready until full end-to-end steps pass.
