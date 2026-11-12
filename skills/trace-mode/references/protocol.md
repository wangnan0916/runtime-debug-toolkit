# Event Protocol

Read before connecting a producer. Send one JSON object to:

```text
POST <LOG_SERVER_URL>/log
Content-Type: application/json
```

The collector adds an ISO timestamp in `ts` and uses the request's `session`, or
its default session when omitted. Session IDs accept letters, digits, dots,
underscores, and hyphens. Arrays, non-object JSON, and bodies over one MiB are
rejected. `OPTIONS` supports browser preflight; `GET /health` reports status.

A successful append completes before HTTP `200` with:

```json
{ "ok": true, "session": "example-session", "logFile": "/tmp/example-session.ndjson" }
```

Failed appends return a non-success status with an `error` field.

Build payloads from an explicit allowlist of trace-relevant fields. Exclude
secrets, credentials, cookies, authorization headers, raw private requests or
responses, and unrelated personal data. Redact identifiers when identity matters.
Treat producer delivery as best-effort so logging failure leaves product behavior
unchanged; verify expected records in the local evidence file.
