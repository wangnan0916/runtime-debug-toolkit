# Collector Lifecycle

Read before startup. Use Node.js 24+ and keep the host's long-running command
handle so the session can continue and the process can be stopped later.

## Start and Retain the Contract

```bash
node <trace-mode-skill-dir>/scripts/start-collector.mjs --session <session_id>
```

The wrapper starts one foreground collector on `127.0.0.1` with an available
port and a unique temporary log directory. Keep it running while continuing the
investigation. There is no detached service, global discovery, or shared lifecycle.
Capture its printed contract, preferably the final JSON object verbatim:

```text
LOG_SERVER_URL=<loopback origin>
SESSION_ID=<session_id>
LOG_DIR=<temporary log directory>
LOG_FILE=<session NDJSON path>
HEALTH_URL=<loopback health URL>
COLLECTOR_CONTRACT={"logServerUrl":"…","sessionId":"…","logDir":"…","logFile":"…","healthUrl":"…"}
```

A complete healthy user-supplied contract can replace startup. Leave that
collector's lifecycle to the user unless shutdown is requested.
`LOG_FILE` appears on the first accepted event. Each session has a separate file
and write queue. See [protocol](protocol.md) for requests and append guarantees.

## Permissions

Follow the host's declared permission mechanism. If listener creation explicitly
requires approval, use it for the wrapper at startup; otherwise start normally.
A clear permission error may justify that host's approval path. A service
disconnect alone does not.

Scope approval to the exact wrapper command. Offer a reusable rule only for a
read-only installation and include the absolute wrapper path; a writable skill
or repository does not qualify. Explain that the wrapper binds loopback, writes
temporary logs, and makes no external requests. A public tunnel has different
exposure. Honor a denial without retrying through another mechanism; continue
independent analysis or use a user-managed collector if the host permits it and
the user chooses it.

## Remote Producers

When a device cannot reach loopback, use an authorized reachable route. For a
Cloudflare Quick Tunnel, check `cloudflared --version`; if setup is needed,
follow the [official installation instructions](https://developers.cloudflare.com/tunnel/downloads/)
within the available permissions. Keep this command's handle:

```bash
cloudflared tunnel --url <local LOG_SERVER_URL>
```

Use the generated HTTPS origin as the effective producer destination, with
`/log` and `/health`. Preserve the original local Collector Contract separately;
the session ID and local evidence file do not change. Anyone with the tunnel URL
can reach the collector while it runs, so keep payloads allowlisted.

Confirm producer health and one transport-check event in `LOG_FILE` before
recording the first attempt boundary. The bundled helpers send individual events
without retries; delivery failure can explain missing probes. Consult the
[Quick Tunnel documentation](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)
for service limits rather than treating it as guaranteed delivery.

## Ownership and Recovery

Retain collector/tunnel handles across replies, compaction, and caller handoff.
Keep owned processes active through pending observations, retries, and verification.
If a collector dies, inspect its failure, replace it, update producer/tunnel
URLs, and validate delivery before a fresh attempt. See
[troubleshooting](troubleshooting.md) for failures and [cleanup](cleanup.md) for
shutdown and evidence deletion.
