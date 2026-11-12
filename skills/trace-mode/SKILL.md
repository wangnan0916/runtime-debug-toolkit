---
name: trace-mode
description: Locate runtime handlers, state transitions, and async boundaries with temporary structured logs when static reading cannot answer the runtime question. Use for trace-mode or runtime tracing requests, and resume active traces after follow-ups. Use debug-mode when the goal includes a product fix.
---

# Trace Mode

Answer a runtime code-location question with observed evidence, then remove the
temporary instrumentation. Product fixes belong to [Debug Mode](../debug-mode/SKILL.md).
Collector scripts require Node.js 24+.

## Execution and Ownership

User instructions and existing authorization take precedence over skill defaults
within host permissions. Carry authorized tracing through its answer and cleanup.
Use available tools to trigger and observe the relevant behavior; request only
missing user participation. Keep a compact Trace Card with the question, trigger,
candidate path, disputed state/boundary, and observable answer.

**Caller mode:** when Debug Mode supplies a Bug Card and hypotheses, reuse that
context and perform only collection setup and instrumentation below. Return the
active probes, event plan, Collector Contract, producer connection result/time,
collector command handle, and any tunnel handle. Debug Mode owns attempts,
analysis, fixes, and cleanup. This is workflow composition; a separate agent is
not required.

## Prepare Collection

Read the [collector reference](references/collector.md) before startup and the
[probe reference](references/probes.md) before instrumentation. Choose events
that distinguish the disputed paths or values, including expected events for
each observed path. Use the bundled helpers or a small equivalent runtime client.

Own one collector per session and retain its printed contract and command handle.
Mark temporary additions with `LOG_SERVER_PROBE <session_id>` and keep payloads
allowlisted. Check [producer connectivity](references/connection-status.md) from
the actual runtime; add visible connection feedback only when useful to a user.
Keep collection active across attempts and handoffs. In caller mode, return now.

## Capture and Locate

Use the shared [attempt contract](references/attempts.md) for execution, evidence,
and recovery. Run the trigger directly when capable; use the
[manual checkpoint](references/checkpoint.md) only for required user participation.
While `pending_user`, wait before dependent analysis or cleanup.

Compare observed events and values against the event plan. Missing events need
control-flow and delivery evidence before they can establish a skipped branch.
Concurrent append order does not establish causality; use correlation or sequence
fields where needed. Adjust inconclusive attempts using new information rather
than repeating the same trigger indefinitely.

Finish when evidence identifies the requested file, function, or boundary.
Report the supporting probe values and locations, confidence, and any remaining
uncertainty. Keep the answer proportional to the user's runtime question.

## Finish or Recover

Use [troubleshooting](references/troubleshooting.md) for startup or delivery
failures. If prerequisites remain unavailable, request specific help or report
an incomplete outcome. On completion or abandonment, follow
[cleanup](references/cleanup.md); a pause for user input keeps the session active.
