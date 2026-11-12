# Producer Connection Status

Check connectivity from the producer's runtime using the same destination,
proxy, or tunnel as its events. An agent-shell health check does not establish
connectivity from a user's device.

Require HTTP `200` and JSON `ok: true` from `GET <effective LOG_SERVER_URL>/health`.
Do not require a public tunnel origin to match the loopback URL returned by the
server. Record the check result and time in session context; if unsupported,
record unknown and explain the limitation.

Health proves reachability. A successful `POST /log` response proves that request's
append under [protocol](protocol.md). A browser beacon returning true only means
queued delivery; opaque responses cannot confirm append. Expected current-attempt
NDJSON records remain the evidence used for tracing and verification.

## Optional User Feedback

Add a small bottom-right indicator when a user needs visible connection feedback
or requests it. Use the target project's UI and request APIs. Keep it clear of
controls and safe areas, with text as well as color; avoid focus, input, layout,
or duplicate-mount side effects. Backend and CLI traces need no extra UI.

| State | Meaning |
| --- | --- |
| Checking | A health check is pending. |
| Connected | A recent producer health check succeeded. |
| Unavailable | The check failed, timed out, or returned an invalid response. |
| Unknown | Unsupported, paused, or stale connection information. |

For a live indicator, check on mount and periodically while active; bound request
lifetimes and permit at most one in flight. For example, use a five-second
interval, three-second timeout, and fifteen-second freshness window, adapted to
the runtime. Expire stale success on pause/resume and allow recovery on later
success. Health failures must not affect product behavior or add business logs.

Mark all temporary UI, styles, health checks, and mounting edits with the shared
session markers. Keep them active while user observations are pending. Check
visibility and freshness when adding an indicator; exercise recovery when its
lifecycle changes or connectivity is the problem being investigated. Remove its
requests, timers, and listeners through shared [cleanup](cleanup.md).
