---
name: trace-mode
description: Locate runtime handlers, state transitions, and async boundaries using temporary structured logs and NDJSON evidence when static reading cannot answer the runtime question. Resume active traces after capture replies. Use debug-mode when the goal includes a product fix.
---

# Trace Mode

Locate a runtime code boundary with temporary logs and current-attempt evidence,
then clean up. Product fixes belong to [`debug-mode`](../debug-mode/SKILL.md).
The bundled collector scripts require Node.js 24 or later.

## Working Contract

Within host permissions, explicit user scope and workflow choices override skill
defaults. Continue authorized tracing through its answer and cleanup. Resolve
routine unknowns with available tools; ask only for input that changes the next
decision. Resume the same session after replies or compaction. Keep a compact
Trace Card and event plan in context; read references as their stage applies.

**Caller mode:** when Debug Mode supplies a Bug Card and hypotheses, reuse them
and perform Steps 2–4 only. Return active probes, the Collector Contract, latest
producer connection result and time, and any tunnel handle. The caller owns
capture gates, analysis, fixes, and cleanup; skip standalone Steps 5–7.

## 1. Frame the Trace

Read relevant entry points, handlers, state transitions, and existing logs.
Keep a Trace Card: runtime question; trigger and input; candidate path; disputed
boundary or state; observable answer. Mark unavailable facts `unknown`.
Proceed when a candidate path reaches the boundary being investigated.

## 2. Plan Events

Read [`references/probes.md`](references/probes.md). Choose the smallest set of
low-volume events that distinguishes the relevant paths, transitions, or values.
Record expected events for each path; mutually exclusive branches need not all
emit. An absent event remains inconclusive until control-flow and delivery
evidence distinguish a skipped branch from missing telemetry.

## 3. Arm the Server

Follow [`references/collector.md`](references/collector.md) for startup and host
permissions. Use its safe wrapper unless the user supplied a complete healthy
contract; use its tunnel branch when the producer cannot reach loopback.
Keep `LOG_SERVER_URL`, `SESSION_ID`, `LOG_DIR`, `LOG_FILE`, and `HEALTH_URL`, plus
any effective remote destination separately from the local contract.

## 4. Instrument the Path

Use the bundled helpers or an equivalent runtime client. Mark every helper and
event for this session, allowlist payload fields, and preserve product stdout.
Follow [`references/connection-status.md`](references/connection-status.md): add
a temporary bottom-right connection indicator to a user-facing UI, or report
producer connectivity in checkpoint context for a runtime without a UI.

Check markers, session values, payloads, and producer connectivity before capture.
Keep probes and connection checks active while waiting or handing off. In caller
mode, return the ready instrumentation now.

## 5. Capture

Use [`references/checkpoint.md`](references/checkpoint.md) for the attempt
boundary and result routing. Run an authorized, available trigger directly and
record its outcome; otherwise use its supported manual interaction path.
Wait for the user's current-attempt result before advancing a manual gate.

- `PENDING`: keep the session active and wait.
- `B` or `C`: adjust the trigger or event plan, then start a fresh attempt.
- Direct completion or `A`: analyze only current-attempt records.

## 6. Analyze and Locate

Read complete records after `ATTEMPT_START_LINE`, filtered to the active session
and run. Require events expected for the observed path, then compare values.
Append order alone does not establish causality across concurrent producers;
use correlation or sequence fields when needed. Missing required evidence
returns to the event plan or the relevant delivery troubleshooting branch.

Report the runtime question, file/function/boundary, specific probe names and
log lines with relevant values, confidence and uncertainty, and smallest useful
follow-up. Use the user's language and detail proportional to the question.

## 7. Clean Up

Remove this session's paired `LOG_SERVER_PROBE <session_id>` regions, helpers,
connection indicator, timers, listeners, and pending requests. Search for its
session ID and paired markers to verify removal. Preserve other sessions and
pre-existing changes. Delete `LOG_FILE` unless the user requests retained evidence;
leave the shared server running unless shutdown was requested. Stop only a
tunnel started for this session.

Inspect the diff and run relevant repository checks; repeat or expand them only
for new edits, failures, or unresolved risks. Report cleanup status with the
location evidence. On explicit abandonment, perform the same cleanup and state
which questions remain unresolved.

Read [`references/troubleshooting.md`](references/troubleshooting.md) only after
startup, capture, or delivery fails.
