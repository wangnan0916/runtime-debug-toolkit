# Trace Checkpoint

Use the attempt boundary and interaction rules in
[`manual-checkpoints.md`](manual-checkpoints.md). Run an authorized, available
trigger directly; use the manual path only when the agent cannot run it.

## Capture Question

Show the active session, log file, effective `/log` endpoint, and exact trigger.
Ask the user to run that trigger once and report what happened.

- Native header: `Capture trace`; question ID: `trace_result`.
- Native question: `Run the stated trigger once, then choose the result.`
- Pi tool: `trace_mode_checkpoint` with `session`, `logFile`, `debugEndpoint`.

| Code | Native choice | Pi / plain-text option | Meaning |
| --- | --- | --- | --- |
| `A` | Trace captured | A - Trace captured | The stated trigger completed. |
| `B` | Could not trigger | B - Could not trigger | The trigger failed or was unavailable. |
| `C` | Free-text input | C - Other: describe what happened | Additional details need interpretation. |

A direct trigger must also have an observed outcome. Completion of a command or
an `A` answer permits analysis; neither proves that expected probes arrived.

## Result Routing

| Result | Next action |
| --- | --- |
| `PENDING` | Keep the attempt active and wait for its submitted result. |
| `A` | Analyze current-attempt records after `ATTEMPT_START_LINE`. |
| `B` | Narrow the trigger or event plan using available evidence before asking for missing details. |
| `C` | Use the supplied details to adjust the trigger or events. |

For a new attempt after `B` or `C`, record a fresh boundary and checkpoint.
Analysis still requires the events expected for the observed path under
[`../SKILL.md`](../SKILL.md).
