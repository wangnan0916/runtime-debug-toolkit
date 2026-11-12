# Domain Glossary

Shared vocabulary for runtime-debug-toolkit documentation and implementation.

## Workflows

- **Trace Mode** — standalone workflow: instrument, capture one trace, locate the responsible code boundary. No product fix.
- **Debug Mode** — extends Trace Mode through hypothesis proof, fix, verification, and cleanup. The caller of Trace Mode.
- **Trace Card** — Trace Mode working context: runtime question, trigger, candidate path, unknown boundary, observable answer.
- **Bug Card** — Debug Mode counterpart: symptom, trigger, candidate path, evidence, acceptance criterion.
- **Hypothesis Matrix** — ranked plausible causes with predictions and probe conditions for confirmation or rejection; inconclusive evidence remains explicit.

## Instrumentation

- **Probe** — one planned low-volume event logged around a disputed boundary. Named like `settings.beforePersist`.
- **Session marker** — `LOG_SERVER_PROBE <session_id>` region wrapper that makes temporary instrumentation mechanically removable.
- **Collector Contract** — the values a workflow must capture after arming the server: `logServerUrl`, `sessionId`, `logDir`, `logFile`, `healthUrl`. Printed as KEY=VALUE lines plus one machine-readable `COLLECTOR_CONTRACT=` JSON line.

## Collector runtime

- **Sink** — the NDJSON HTTP server (`scripts/collector-server.mjs`): accepts `POST /log`, appends one record, exposes `/health`.
- **Collector lifecycle** — one foreground process per debugging session, owned through the agent's command handle. Keep it alive through capture and verification; shared `skills/trace-mode/references/cleanup.md` defines shutdown for complete, incomplete, and abandoned sessions. No global discovery or reuse.
- **Safe wrapper** — `scripts/start-collector.mjs`: fixes host to `127.0.0.1` and port to `0`, starts the collector in the same process with a unique temporary log directory.

## Checkpoints

- **Attempt** — one trigger and observation with a phase, executor, environment, criterion, expected probes, evidence boundary, actual observation, and semantic result. Shared rules live in `skills/trace-mode/references/attempts.md`. The agent executes by default when capable within scope; explicit user choices take precedence.
- **Checkpoint Gate** — a required user observation when an attempt needs manual participation. Dependent work waits in `pending_user`; this is not approval for routine investigation.
- **Gate invariant** — every repeated trigger starts a fresh attempt boundary; earlier observations cannot complete a new attempt. A manual attempt needs its own submitted result.
- **Attempt result** — reproduction: `reproduced` / `not_reproduced` / `inconclusive`; verification: `passed` / `failed` / `inconclusive`; capture: `captured` / `not_triggered` / `inconclusive`. A/B/C are UI transport choices, mapped by phase.
- **Checkpoint paths** — resolution order: permitted native `request_user_input_async` (or synchronous `request_user_input` when its mode allows the question), then the Pi chooser tool (`debug_mode_checkpoint` / `trace_mode_checkpoint`), then plain text. Shared transport and validation live in `skills/trace-mode/references/manual-checkpoints.md`.
- **Chooser spec** — code-defined choices per workflow (never model-supplied): phases, choice labels/meanings, which choice opens the free-form editor.
