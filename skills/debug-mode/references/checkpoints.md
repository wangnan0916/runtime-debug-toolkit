# Debug Checkpoints

Use the shared [manual checkpoint transport](../../trace-mode/references/manual-checkpoints.md)
for attempt boundaries, result validation, interaction paths, and session recovery.
The mappings below belong to Debug Mode; do not use the standalone trace chooser.

## Questions and Context

Prepare the phase, session, log file, effective `/log` endpoint, exact trigger,
and the Bug Card's acceptance criterion. Explain what the user should observe.

| Phase | Native header / question ID | Question |
| --- | --- | --- |
| `pre-fix` | `Reproduce` / `reproduction_result` | Reproduce the original bug manually, then choose the result. |
| `post-fix` | `Verify fix` / `verification_result` | Verify the original bug against the stated acceptance criterion, then choose the result. |

Native choices are phase-specific, in this order:

| Phase | First choice | Second choice | Free-text input |
| --- | --- | --- | --- |
| `pre-fix` | Reproduced → `A` | Issue disappeared → `B` | Map by meaning, otherwise `C`. |
| `post-fix` | Fixed → `B` | Still reproducible → `A` | Map by meaning, otherwise `C`. |

For Pi, call `debug_mode_checkpoint` with the actual `phase`, `session`,
`logFile`, and `debugEndpoint`. Pi and plain text use these fixed meanings:

```text
A - Reproduced
B - Fixed
C - Other: describe what happened
```

In pre-fix, `B` means the issue did not recur; it does not prove a fix or prove
that instrumentation changed the behavior. Pi labels its editor choice
`C - Other: enter details`.

## Result Routing

| Phase | Result | Next action |
| --- | --- | --- |
| Either | `PENDING` | Keep the attempt active and wait for its submitted result. |
| Pre-fix | `A` | Read [`prove-fix-verify.md`](prove-fix-verify.md) and classify hypotheses using current-attempt evidence. |
| Pre-fix | `B` | Investigate the trigger, environment, and possible probe effects; ask only for consequential missing details. |
| Pre-fix | `C` | Use the supplied details to adjust the trigger, hypotheses, or probes. |
| Post-fix | `A` | Inspect current-attempt post-fix evidence and return to narrower hypotheses or probes. |
| Post-fix | `B` | Confirm the expected current-attempt post-fix probes, then follow [`cleanup.md`](cleanup.md). Missing evidence requires a fresh verification attempt. |
| Post-fix | `C` | Use the supplied details to adjust verification, hypotheses, or probes. |

Every repeated trigger or verification starts a fresh attempt. A prior phase's
answer, or records from before its boundary, cannot complete the new gate.

## User-Selected Automated Method

Manual gates are the default. If the user explicitly replaces reproduction or
verification with an automated method, apply that choice only to the named phase.
Record its trigger and observable criterion, take a fresh attempt boundary, and
run the authorized trigger. Map its observed outcome to the same phase meanings:
reproduced is `A`, criterion passed is `B`, and an unclear or failed execution is
`C`. A successful command exit alone is insufficient. Retain the same session,
run, and expected-probe requirements, and identify the result as automated in
the report. Never infer this override from tests passing or the user being absent.
