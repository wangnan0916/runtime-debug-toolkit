# Temporary Probes

Read before instrumentation. Follow [protocol](protocol.md) for delivery and
payload privacy. Select low-volume events that distinguish the disputed paths,
state transitions, or values, rather than logging every call.

## Event Plan

Use stable probe names and include a `runId` in each event. Standalone traces
can use `trace-1`; Debug Mode supplies `pre-fix` or `post-fix`. The helpers add
the session, not the run. Record expected events for each path; mutually
exclusive branches need not all emit. Add correlation or sequence fields when
concurrent operations would otherwise be ambiguous.

```json
{
  "session": "<session_id>",
  "runId": "trace-1",
  "probe": "settings.beforePersist",
  "file": "src/settings/save.ts",
  "fn": "saveSettings",
  "vars": { "enabled": true }
}
```

## Helpers and Removal Markers

Copy the [browser helper](../assets/browser-log-helper.js) or
[Node.js helper](../assets/node-log-helper.js), replacing `<session_id>` and
`<LOG_SERVER_URL>`. Their local function is `logServerLog`. For another runtime,
use a small equivalent client; delivery failure must not change product behavior
or pollute product stdout.

Wrap every temporary helper, event, and integration edit with paired markers:

```ts
// #region LOG_SERVER_PROBE <session_id> settings-before-persist
logServerLog({
  runId: "trace-1",
  probe: "settings.beforePersist",
  file: "src/settings/save.ts",
  fn: "saveSettings",
  vars: { enabled },
});
// #endregion LOG_SERVER_PROBE <session_id>
```

Use native comment syntax outside JavaScript, preserving the session text in
both markers. Check replacements, payloads, and
[producer connectivity](connection-status.md) before capture. The bundled helpers
do not implement health checks or connection UI.
