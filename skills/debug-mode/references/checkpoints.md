# Manual Debug Checkpoints

Read only when reproduction or verification needs user participation or the
user chose manual operation. Agent-executed attempts use the shared
[attempt contract](../../trace-mode/references/attempts.md) directly.

Use [manual transport](../../trace-mode/references/manual-checkpoints.md).
Explain the exact trigger and acceptance criterion; ask only for the missing
operation or observation if the agent has already performed part of the attempt.

## Native Choices

| Phase | Header / question ID | First choice | Second choice |
| --- | --- | --- | --- |
| `pre-fix` | `Reproduce` / `reproduction_result` | Reproduced → `reproduced` | Issue did not recur → `not_reproduced` |
| `post-fix` | `Verify fix` / `verification_result` | Fixed → `passed` | Still reproducible → `failed` |

Ask whether the original bug occurred or the acceptance criterion passed,
respectively. Native tools supply free text; interpret clear details by meaning,
otherwise retain them as `inconclusive`.

## Pi and Plain Text

Call `debug_mode_checkpoint` with actual `phase`, `session`, `logFile`, and
`debugEndpoint` when using Pi. Its result includes a semantic `result` plus the
A/B/C UI selection. Plain text uses the same phase-specific choices:

| Phase | A | B | C |
| --- | --- | --- | --- |
| `pre-fix` | Reproduced → `reproduced` | Issue did not recur → `not_reproduced` | Other: describe what happened |
| `post-fix` | Still reproducible → `failed` | Fixed → `passed` | Other: describe what happened |

C returns details with `inconclusive`; interpret a clear outcome by meaning.
A/B/C are transport choices, not evidence of a cause or successful verification.
Route resolved observations through [prove, fix, and verify](prove-fix-verify.md).
