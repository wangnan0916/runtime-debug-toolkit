# Trace Checkpoint

Use this checkpoint when the agent cannot run the trigger safely.
Show the active session, log file, endpoint, and exact trigger.
Checkpoint answers are protocol messages rather than progress summaries.

Use the first available path in this order:

1. Native Codex path
2. Pi chooser path
3. Plain-text path

## Native Codex Path

Use this path whenever `request_user_input` is listed.
The tool listing selects this path; do not infer that the interactive UI is unavailable.

```json
{
  "questions": [
    {
      "header": "Capture trace",
      "id": "trace_result",
      "question": "Run the stated trigger once, then choose the result.",
      "options": [
        {
          "label": "Trace captured (Recommended)",
          "description": "The trigger completed, so the current log can be analyzed."
        },
        {
          "label": "Could not trigger",
          "description": "The trigger failed or was unavailable, so the trace plan needs adjustment."
        }
      ]
    }
  ]
}
```

Map `Trace captured (Recommended)` to `A`.
Map `Could not trigger` to `B`.
Codex supplies a free-form Other choice automatically. Map its submitted text to `C` evidence.
Call `request_user_input` once with this payload.
The call is the checkpoint response; wait for its result instead of substituting
a plain-text prompt or final answer.
If the native tool is absent or an attempted call returns an error, continue to the Pi chooser path.
A native cancellation leaves the checkpoint pending. Stop without selecting a result or falling back.

## Pi Chooser Path

When `trace_mode_checkpoint` is available, call it as the response's only tool.
Pass the real `session`, `logFile`, and `debugEndpoint` values.
Repeat this tool call for every later manual attempt in the same trace.

The chooser presents exactly these options:

```text
A - Trace captured
B - Could not trigger
C - Other: enter details
```

Option `C` opens a free-form editor. Treat its submitted text as the checkpoint evidence.
A `cancelled` or `ui_unavailable` result switches to the plain-text fallback template.

## Plain-Text Path

Use plain text only after the native path is unavailable (tool absent or call
error) and the Pi path is unavailable or returns a fallback result.
Send exactly this template. Then wait for a typed reply.

```text
The temporary trace is ready.

- Session: <session_id>
- Log file: <LOG_FILE>
- Trace endpoint: <LOG_SERVER_URL>/log
- Trigger: <exact trigger>

Run the trigger once, then reply with one result:

A - Trace captured
B - Could not trigger
C - Other: describe what happened
```

## State Table

| Result | Route |
| --- | --- |
| `A` | Route to log analysis for the current session. |
| `B` | Route to a narrower trigger or event plan. |
| `C` | Use the supplied details to adjust the trigger or events. |
