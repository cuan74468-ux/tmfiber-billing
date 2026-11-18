# TMfiber — Deploy STAGING lewat browser (bukan production)

## Lokasi kerja
- Frontend: https://cuan74468-ux.github.io/tmfiber-billing/
- Repo: https://github.com/cuan74468-ux/tmfiber-billing
- Database STAGING terpisah: https://docs.google.com/spreadsheets/d/1Qh-gM1zf_WcbEmGcHqsOXPSs_sfo3qiH6QjbISPdrpE/edit
- Database produksi: JANGAN diubah, ditautkan atau dijadikan test.

## Langkah saat Owner siap
1. Buka GitHub Actions commit terbaru. Unduh artifact bernama tmfiber-staging-gas-source dan ekstrak satu file Code.gs.
2. Buat **Apps Script baru** (jangan edit GAS lama). Tempel isi Code.gs dari artifact ke editor, simpan.
3. Buka Project Settings → Script Properties; masukkan:
   TM_ENVIRONMENT = STAGING
   TM_READS_ENABLED = true
   TM_DRY_RUN = true
   TM_MUTATIONS_ENABLED = false
   TM_AUTO_PAYMENTS_ENABLED = false
   TM_SPREADSHEET_ID = 1Qh-gM1zf_WcbEmGcHqsOXPSs_sfo3qiH6QjbISPdrpE
   TM_SESSION_SECRET = <unique 32+ byte unpredictable secret>
   TM_OTP_SECRET = <different unique 32+ byte unpredictable secret>
   TM_FONNTE_TOKEN = <provider token, if available>
   Never send these secret values in chat or put them in a public repository.
4. On the private STAGING spreadsheet Users_Admin tab, enter one **authorized test number** with Role OWNER, Aktif TRUE. Do not copy production customers into STAGING.
5. Deploy → New deployment → Web App. Execute as owner; evaluate the narrowest access compatible with your login model. Copy the /exec URL (URL is not a token).
6. Browser transport gate: test from GitHub Pages using one POST text/plain;charset=utf-8; verify GAS redirect/CORS permits reading response. If blocked, DO NOT switch to mode:no-cors or expose customer data in GET.
7. Only after transport gate passes, set the non-secret staging endpoint in src/core/config.js via GitHub commit and rerun Chrome/Android UI test.
8. Test OTP receive/wrong/expired/reused, logout/revocation and read-only customer/invoice responses. Enable manual mutation only in STAGING, after owner explicitly approves UAT.
9. Do not switch TM_ENVIRONMENT to PRODUCTION using this STAGING script. Production needs separate audit, migration, rollback and sign-off.

## Safety
The public config apiEndpoint is deliberately empty. The current live website has **no working billing API**. Provider secrets must live only in ScriptProperties; Fonnte is not connected through these tools. Do not activate router commands or automatic QRIS confirmation.

## Definition of done before telling paying customer “ready”
Authenticated Android login real OTP; authorized read of customer/invoice lists; manual invoice creation and payment on real/staging-isolated safe flow; anti-double-submit; fully hashed audit and reconciliation; backup; owner UAT; written release approval.
