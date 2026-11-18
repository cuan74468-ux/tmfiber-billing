# TMfiber GAS — STAGING Package (not deployed)

Files: Code.gs (POST action dispatcher + OTP HMAC and Owner read APIs), Payments.gs (manual payments), and Customers.gs (customer/invoice creation). All three are combined into one Code.gs automatically by scripts/bundle-gas.mjs in GitHub Actions.

CRUD writes are STAGING-only and require TM_MUTATIONS_ENABLED=true. Operations_Ledger is mandatory, PENDING entries block further writes until manual reconciliation. No production customer creation or invoice generation has been tested end-to-end.

## STAGING ScriptProperties (configure manually in a separate GAS project)
TM_ENVIRONMENT=STAGING
TM_READS_ENABLED=true
TM_DRY_RUN=true
TM_MUTATIONS_ENABLED=false
TM_AUTO_PAYMENTS_ENABLED=false
TM_SPREADSHEET_ID=<ID of separate sanitized STAGING Sheet>
TM_SESSION_SECRET=<unique unpredictable secret>
TM_OTP_SECRET=<different unpredictable secret>
TM_FONNTE_TOKEN=<private provider token>

Never store actual secret values here or in GitHub. Only Owner reads are supported; other roles are denied until scoped access rules are implemented.

Actions: request_otp, verify_otp, logout, get_dashboard_data, get_customers, get_invoices, get_cashbook. STAGING-only: mark_as_paid, record_installment (will return ERROR unless TM_MUTATIONS_ENABLED=true and all safeguards pass).

Financial handler uses LockService, a PENDING then COMMITTED payment ledger, idempotency fingerprint and SHA256 chained audit rows. A partially written transaction remains PENDING and REQUIRES manual reconciliation, not blind retry. Collector commission remains 0 until scoped biller assignments exist. No bank payment automation or MikroTik disconnect action exists.

Production deployment is NOT authorized. Apps Script project accessibility, Fonnte real OTP, GitHub Pages CORS/redirect, actual read-only API and payment ledger writes must be tested independently. Before any production claim, complete backup, UAT and Owner sign-off. Do not configure a production spreadsheet ID under STAGING flags.

See ../docs/STAGING_DEPLOY_BROWSER_GUIDE.md and ../docs/STAGING_MANUAL_PAYMENT_DESIGN.md.
