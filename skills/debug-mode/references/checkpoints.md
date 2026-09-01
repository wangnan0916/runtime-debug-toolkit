# Manual Checkpoints

Read this reference at each reproduction or verification gate.
Checkpoint answers are protocol messages rather than progress summaries.
A native checkpoint presents context, then one tool call.
A Pi checkpoint contains only its chooser call.
A plain-text checkpoint contains one exact fallback template.

## Gate Result

An active debug session survives user replies, tool results, retries, and context compaction.
Every manual reproduction or verification attempt begins with `GATE_RESULT=PENDING`.

Immediately before the first checkpoint call for an attempt, record the number of complete
NDJSON lines currently in `LOG_FILE` as `ATTEMPT_START_LINE`; use `0` when the file does not
exist. Only complete records after that line belong to this attempt. Existing records,
tool activity labels, tests, and static code observations never change `GATE_RESULT`.

Set `GATE_RESULT` to `A`, `B`, or `C` only from a valid answer returned by the selected
checkpoint path for the current phase. A result authorizes only that attempt.
While the result remains `PENDING`, finish the checkpoint path and yield: keep the session
and probes active, and do not read evidence, edit product code, change `runId`, verify,
clean up, or report a cause or fix.

After routing a valid result, every later attempt starts again with a fresh line boundary
and path selection below.

Use the first available path in this order:

1. Native Codex path
2. Pi chooser path
3. Plain-text path

## Native Codex Path

Use this path whenever `request_user_input` is listed.
The tool listing selects this path; do not infer that the interactive UI is unavailable.
Before the call, show these fields in this order:

```text
The manual debug checkpoint is ready:

- Phase: <pre-fix or post-fix>
- Session: <session_id>
- Log file: <LOG_FILE>
- Debug endpoint: <LOG_SERVER_URL>/log
```

Call `request_user_input` once with the applicable payload.
The call is the checkpoint response; wait for its result instead of substituting
a plain-text prompt or final answer.

### Pre-Fix Native Payload

```json
{
  "questions": [
    {
      "header": "Reproduce",
      "id": "reproduction_result",
      "question": "Reproduce the original bug manually, then choose the result.",
      "options": [
        {
          "label": "Reproduced (Recommended)",
          "description": "The bug appeared again, so the current log can be analyzed."
        },
        {
          "label": "Issue disappeared",
          "description": "The bug did not appear, so the trigger or probes need adjustment."
        }
      ]
    }
  ]
}
```

Map `Reproduced (Recommended)` to `A`.
Map `Issue disappeared` to `B`.

### Post-Fix Native Payload

```json
{
  "questions": [
    {
      "header": "Verify fix",
      "id": "verification_result",
      "question": "Verify the original bug manually, then choose the result.",
      "options": [
        {
          "label": "Fixed (Recommended)",
          "description": "The acceptance criterion passed, so temporary instrumentation can be removed."
        },
        {
          "label": "Still reproducible",
          "description": "The bug remains, so post-fix evidence needs more analysis."
        }
      ]
    }
  ]
}
```

Map `Fixed (Recommended)` to `B`.
Map `Still reproducible` to `A`.

Codex supplies a free-form Other choice automatically. Map its submitted text to `C` evidence.
The answer is valid only when the result contains the applicable question ID and a submitted
value that maps above.

If the native tool is absent, errors, or returns an empty or malformed result without an
explicit cancellation, continue to the Pi chooser path. An explicit native cancellation
leaves `GATE_RESULT=PENDING`; yield without selecting a result or falling back.

## Pi Chooser Path

When `debug_mode_checkpoint` is available, call it as the response's only tool.
Pass the real `phase`, `session`, `logFile`, and `debugEndpoint` values.
Use `pre-fix` for reproduction and `post-fix` for verification.
Repeat this tool call for every later attempt in either phase.

The chooser presents exactly these options:

```text
A - Reproduced
B - Fixed
C - Other: enter details
```

Option `C` opens a free-form editor. Treat its submitted text as the checkpoint evidence.
A `cancelled`, `ui_unavailable`, empty, or malformed result switches to the applicable
fallback template without changing `GATE_RESULT`.

## Plain-Text Path

Use plain text only after the native path fails under the rules above and the Pi path is
unavailable or returns a fallback result.
Send exactly the applicable template as the final action in the response. Then wait for a
typed reply; `GATE_RESULT` remains `PENDING` until that reply maps to `A`, `B`, or `C`.

### Pre-Fix Template

```text
I added debug-mode probes.
The collector writes to these locations:

- Session: <session_id>
- Log file: <LOG_FILE>
- Debug endpoint: <LOG_SERVER_URL>/log

Reproduce the bug manually. Then, select one option:

A - Reproduced
B - Fixed
C - Other: describe what happened
```

### Post-Fix Template

```text
I kept the debug-mode probes active for post-fix verification.
The collector writes to these locations:

- Session: <session_id>
- Log file: <LOG_FILE>
- Debug endpoint: <LOG_SERVER_URL>/log

Verify the original bug manually. Then, select one option:

A - Reproduced
B - Fixed
C - Other: describe what happened
```

The user can request another language. Preserve every field, field order, and option when translating.

## State Table

| Phase | Result | Route |
| --- | --- | --- |
| Either | `PENDING` | Yield with the session and probes active; no evidence analysis, product edit, phase change, cleanup, or completion claim. |
| Pre-fix | `A` | Read NDJSON evidence after `ATTEMPT_START_LINE` and classify every hypothesis. |
| Pre-fix | `B` | Record that probes changed reproduction. Request a narrower trigger or clarification. |
| Pre-fix | `C` | Use the supplied details to adjust the trigger, hypotheses, or probes. |
| Post-fix | `A` | Read post-fix evidence after `ATTEMPT_START_LINE`. Return to narrower hypotheses or probes. |
| Post-fix | `B` | Confirm the expected current-attempt probes, then begin verified cleanup; missing probes require a fresh verification attempt. |
| Post-fix | `C` | Use the supplied details to adjust verification, hypotheses, or probes. |
