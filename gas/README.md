# TMfiber GAS MVP V0.2 — STAGING only

Prepared source, not a deployed service. The older GAS project could not be accessed through connected tools. Do not paste blindly over that project.

Requirements: create a separate sanitized STAGING spreadsheet with exactly these six tabs:
Pelanggan, Tagihan, Kas_Operasional, Users_Admin, Audit_Log, Settings.
Preserve the column headers found in docs. Do not copy real customer data into staging.

Create a separate Apps Script project and paste Code.gs. Set properties server-side:
TM_ENVIRONMENT=STAGING
TM_READS_ENABLED=true
TM_DRY_RUN=true
TM_SPREADSHEET_ID=(sanitized staging spreadsheet id)
TM_SESSION_SECRET=(strong random secret not shared with TM_OTP_SECRET)
TM_OTP_SECRET=(another strong random secret)
TM_FONNTE_TOKEN=(provider token when available; never put in GitHub)

Actions: request_otp, verify_otp, logout, get_dashboard_data, get_customers, get_invoices, get_cashbook.
Only OWNER may read customers, invoices, dashboard or cash in this pilot. Other actions rejected. OTP validity 5 minutes, throttled by number; session HMAC signature valid 12 hours with revocation properties. Public doGet never reads customer data.

Important: Google Apps Script cannot guarantee GitHub Pages browser CORS just by using text/plain. The deployed endpoint MUST be tested in a real browser before any customer access. Rate limits and provider quotas require additional hardening before production. OTP generation from Utilities UUID is not a substitute for a formally reviewed cryptographic OTP service at scale. Review Fonnte behaviour in STAGING before use.

Do not activate production login or payment from this code. No CRUD mutations, payment settlement, audit writes or router actions are implemented here. LockService is limited to OTP verification; financial transactions are separately gated.
