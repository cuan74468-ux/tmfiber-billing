# Architecture — security boundary

```
Public Browser / GitHub Pages  → Authenticated API boundary → Google Apps Script → Private Google Sheets
                                                    ↳ Fonnte / Bank (manual verified)
                                                    ↳ Router pull endpoint (separate HMAC/token architecture, future)
```

Frontend is presentational only. No customer data in static files. UI does not read spreadsheet; no static admin password or API token. Each backend method must authorize request identity independently; never trust role or tenant sent by browser. QRIS static is confirmed manually by Owner from verified bank statement, and router executes only authenticated billing decisions. Failure to read billing must never trigger isolation.

**V1 status:** frontend static shell created, API integration pending. Avoid treating the current GAS self-test and preflight as proof of production readiness.
