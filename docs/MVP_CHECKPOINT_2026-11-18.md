# TMfiber — Checkpoint persiapan MVP (18 November 2026)

## 1. Terverifikasi
- GitHub main: Everyday Billing V3 frontend source in index.html/styles.css/src, 13 routes.
- Browser CI checks responsive 360/390/412/768/1280, navigation, filter, login modal, privacy shell.
- GAS new STAGING code in gas/Code.gs and gas/Payments.gs, unit simulation of OTP, sessions, signed auth, owner-only reads, manual cash payments, installments, and audit chain.
- STAGING Google Sheets created separately, seven tabs, no live customer data. Tagihan A-L preserved with M-Q extra; Audit G-H extra; Kas H-I extra; new ledger A-L.
- Default config apiEndpoint empty and mutations disabled; production DB/GAS untouched.
- Bundle artifact contains one Code.gs ready for isolated browser install in new GAS project.
- CI repository secret pattern scan (common patterns only, not a replacement for complete audit).

## 2. Tidak terverifikasi / blockers
- Existing GAS project code still inaccessible with current connectors; must NOT overwrite it.
- No new GAS project deployed, no server ScriptProperties, no real Fonnte integration or owner test account.
- No browser CORS GET/POST end-to-end confirmation from GitHub Pages to Apps Script.
- No read-only operations on real private accounts; no database write UAT for financial actions.
- No customer CRUD or invoice generation production-ready; no portal HMAC or collector commission.
- No production release approval.

## 3. Exact next action required from owner when available
- Open docs/STAGING_DEPLOY_BROWSER_GUIDE.md and create independent Apps Script STAGING with bundled source.
- Configure private ScriptProperties and test Owner account, deploy new Web App and share only the non-secret /exec URL for connection. Do not share provider API tokens, signing secrets, or customer data in chat.
- Retest browser transport and finances before considering a pilot or any customer access.

## 4. Go/no-go
NO-GO for paying customer's real billing operations. GO for isolated UI demonstration and source review only. Before production: 100% UAT, storage/backup, ledger reconciliation, rate limits, tenant isolation as applicable, explicit Owner approval.

## 5. Links
Repository: https://github.com/cuan74468-ux/tmfiber-billing
Public shell: https://cuan74468-ux.github.io/tmfiber-billing/
STAGING database is in connected private Google Drive, exact link recorded in deployment guide. No customer data belongs in GitHub.
