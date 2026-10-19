# Temporary Log Service Connection Status

Read this reference when adding connection status to an instrumented runtime.
The agent implements the indicator in the target project; this toolkit defines
its behavior rather than supplying a universal UI component.

## Runtime Integration

After adding the log client, mount one small indicator at the bottom-right of
the debugged UI. Use the project's existing UI, styling, and request APIs: an
H5 app can use its DOM or framework, a mini program its page/component system,
and a native or canvas app its own overlay mechanism. Prefer a shared root when
the trace spans routes, and avoid duplicate instances after navigation or hot
reload. Respect safe areas and keep the indicator from covering relevant
controls, intercepting input, moving content, or stealing focus. Use a text
label as well as color, with wording appropriate to the project.

Use the same runtime context and effective collector destination as the log
producer, including any tunnel or proxy. A health check from the agent's shell
does not establish connectivity from the user's device. For a backend-only or
CLI trace, report the producer's connection check result and time in the agent's
checkpoint context; do not add an unrelated UI or change product stdout.

## Health and State

Check `GET <effective LOG_SERVER_URL>/health` from the producer using its native
request API. Require HTTP `200` and a JSON body with `ok: true`; do not depend on
the returned loopback URL matching a public tunnel or proxy origin. Use these
states, or equivalent localized labels:

| State | Display | Meaning |
| --- | --- | --- |
| Checking | Amber, `Log service: checking` | The initial check or a resumed check is pending. |
| Connected | Green, `Log service: connected` | A recent health request succeeded from the producer. |
| Unavailable | Red, `Log service: unavailable` | A request failed, timed out, was blocked, or returned an invalid response. |
| Unknown | Gray, `Log service: unknown` | Checks are paused, unsupported, or the last result is stale. |

Check immediately on mount and periodically while the UI is active. About five
seconds between checks and a three-second request timeout are reasonable
defaults; adapt them to the runtime. Allow at most one health request in flight,
bound every request's lifetime, and let a later success recover the indicator.
Routine background checks can retain the previous state while it is fresh.
Expire old results after a bounded window, such as fifteen seconds, so an old
success never remains green indefinitely. When the app resumes, clear stale
status and check again; lifecycle pauses must not leave a stale green label.

Handle errors without affecting product behavior. Keep health traffic out of
`POST /log`, business probe counts, and product output. If the runtime cannot
make health requests, display unknown and explain the limitation in the agent's
checkpoint context instead of claiming a successful connection.

Connected means the service is reachable; it does not prove that a log was
appended. `sendBeacon()` returning true only means the browser queued a request,
and an opaque response cannot confirm delivery. A validated successful
`POST /log` response confirms that request's append under [`protocol.md`](protocol.md).
The agent must still find the probes expected for the observed path in the
current-attempt NDJSON records. Connection status never completes a trace or
unlocks a manual gate.

## Lifetime and Verification

Wrap all added UI, styles, health client code, and integration edits in
`LOG_SERVER_PROBE <session_id>` regions using the file's native comment syntax.
Keep the indicator and checks active through reproduction, verification, and
pending checkpoints. Carry them with active probes when handing off to Debug
Mode.

Before the manual trigger, confirm the indicator is visible in the target UI
and reflects a health response from that runtime. Exercise unavailable/recovery
when changing the health lifecycle or investigating a connection failure: fail
only the indicator's request path, then restore it. Leave the shared collector
running. Reusing an unchanged, validated indicator needs no new failure drill. Follow
[`troubleshooting.md`](troubleshooting.md) for unexpected connection failures.

Dispose timers and lifecycle listeners and cancel or ignore pending responses
on unmount, replacement, and cleanup. At session cleanup, remove the indicator,
its styles, requests, and all mounting hooks along with the probes. Leave no
temporary UI or background checks in the final product diff.
