# STAGING manual-payment design (not deployed)

This code is purposefully locked behind ScriptProperties:
TM_ENVIRONMENT=STAGING, TM_READS_ENABLED=true, TM_DRY_RUN=true, TM_MUTATIONS_ENABLED=true, TM_AUTO_PAYMENTS_ENABLED=false.

These flags MUST NEVER be enabled on the existing production GAS project. The running app still contains no functional payment button.

The staging spreadsheet now has seven tabs: the original six plus Pembayaran_Ledger. Tagihan columns A-L remain unchanged; M-Q store paid, remaining, commission, last mutation key/time. Kas_Operasional H-I hold invoice/idempotency reference. Audit_Log G-H hold prev_hash and row_hash.

Under LockService, each payment is staged as PENDING before the invoice, cash and audit writes. The final ledger state is COMMITTED. An interrupted write leaves PENDING and REQUIRES manual reconciliation; retries with same key return conflict, not duplicate payment. Successful retry returns already_processed. This prevents blind double submission but is not a fully atomic database transaction.

Only OWNER may submit, and only explicit manual TUNAI, TRANSFER, QRIS_STATIC_MANUAL methods. All payment providers and router commands remain off. Collector commission is deliberately 0 until scoped biller assignments and settings are designed and tested.

Ledger reversal, failed-partial recovery and reliable audit chain trust anchoring must be tested before production. The work is preparation and staging source, NOT production-ready financial processing.
