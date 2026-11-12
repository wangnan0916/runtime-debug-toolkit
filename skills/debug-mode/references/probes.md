# Debug Probe Extension

Extend the shared [probe design](../../trace-mode/references/probes.md) with
events that distinguish live hypotheses. Prefer an event that separates several
explanations; avoid a fixed probe quota or duplicating events for each hypothesis.

Use `runId: "pre-fix"` for reproduction and `runId: "post-fix"` for verification.
Keep probe names stable across the correction. A `hypothesis` field can associate
an event with the Hypothesis Matrix when useful:

```json
{
  "session": "<session_id>",
  "runId": "pre-fix",
  "probe": "settings.beforePersist",
  "hypothesis": "H1",
  "file": "src/settings/save.ts",
  "fn": "saveSettings",
  "vars": { "enabled": true }
}
```

The event plan should say which observed values confirm or reject a cause and
which probes are expected on that path. Shared privacy, delivery, and removal
rules apply unchanged.
