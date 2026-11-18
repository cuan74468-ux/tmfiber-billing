# TMfiber Go-Live Gate — Owner single-tenant pilot

Last verified: GitHub CI synthetic tests of frontend, OTP, CRUD, manual ledger; no real GAS deployment.

## What is ready
- Everyday Billing V3, mobile/desktop.
- Staged frontend forms (customer, invoice, installments, settlement) behind disabled public flags.
- STAGING-only GAS dispatcher, Owner auth, signed OTP, list/read APIs, manual payment and audit ledger.
- 8-tab separate STAGING spreadsheet with no real customer records.
- Single-file GAS Actions artifact and installation guide.

## Mandatory preflight steps before real usage
1. In a **new and separate** Apps Script project, paste generated Code.gs bundle. No changes to existing production Apps Script.
2. Enter ScriptProperties privately as in STAGING_DEPLOY_BROWSER_GUIDE.md, leave TM_MUTATIONS_ENABLED=false and TM_AUTO_PAYMENTS_ENABLED=false.
3. Select and run TMFIBER_STAGING_PREFLIGHT from Apps Script editor. It validates flags, eight tabs, required column names and pending transactions; does not reveal secrets or customer data.
4. Test cross-origin POST with real deployed /exec from GitHub Pages; if response cannot be read, do not bypass browser CORS with no-cors/JSONP/GET.
5. Test OTP on approved STAGING test number with real provider, negative/replay/rate-limit cases.
6. Enable controlled mutations **in isolated STAGING only**, then test add customer, create invoice, cash, transfer, QRIS manual, partial settlement, failed write / rollback reconciliation, and full audit.
7. Repeat test in Android Chrome 360–412 viewport and reconcile exact Sheets records. Take backup of production DB and freeze schema/version, then prepare separate production deployment.
8. Owner must approve UAT and production cutover before any financial write against live DB. Router isolation remains DRY_RUN; automatic payment verification remains OFF.

## Blocker
Current tools have access to GitHub and Google Sheets but **not** edit/deploy permissions for Google Apps Script project. There is no verified deployed staging Web App or actual provider key. Do not claim real go-live.

## Browser deployment
See docs/STAGING_DEPLOY_BROWSER_GUIDE.md. The package in GitHub Actions has no secrets and can be copied into a new GAS project.

## Release terminology
UI DEMO: public front-end only, safe to show. STAGING: isolated pilot with synthetic data; never live money. PRODUCTION: only after real tests, backup, security review and Owner UAT.
