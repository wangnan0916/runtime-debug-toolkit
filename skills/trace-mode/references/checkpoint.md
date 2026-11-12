# Manual Trace Checkpoint

Read only for required user participation or an explicit manual choice. Use the
shared [attempt contract](attempts.md) and [manual transport](manual-checkpoints.md).
Ask the user to complete the stated trigger once and report the outcome, or
supply only the observation missing from an agent-executed trigger.

- Native header / question ID: `Capture trace` / `trace_result`.
- Pi tool: `trace_mode_checkpoint` with `session`, `logFile`, `debugEndpoint`.

| Code | Native choice | Pi / plain-text choice | Result |
| --- | --- | --- | --- |
| A | Trace captured | A - Trace captured | `captured`: trigger completed. |
| B | Could not trigger | B - Could not trigger | `not_triggered`: failed or unavailable trigger. |
| C | Free-text input | C - Other: describe what happened | `inconclusive`, or interpret clear details by meaning. |

`captured` permits analysis of expected current-attempt records; it does not
prove delivery. For `not_triggered` or `inconclusive`, use the observation to
adjust the trigger or event plan. While `pending_user`, keep the session active.
