---
name: debug-mode
description: Diagnose and fix runtime bugs using temporary structured logs and verified evidence. Use when the user invokes debug-mode or requests instrumented debugging, and resume active sessions after reproduction or verification replies. Use trace-mode for code location without a fix.
---

# Debug Mode

Prove a runtime cause, fix it, verify the original behavior, and clean up.
Start for `$debug-mode`, `/debug-mode`, `debug mode`, or an instrumented debugging
request; resume an active session after replies or compaction. An unrelated task
or a checkpoint answer without an active session does not start instrumentation.
The sibling [`trace-mode`](../trace-mode/SKILL.md) supplies the collector and
instrumentation workflow and requires Node.js 24 or later.

## Working Contract

Within host permissions, explicit user scope and workflow choices override skill
defaults. Continue authorized work without step-by-step approval. Resolve routine
unknowns from available evidence; ask only for missing input that changes the
next decision. Keep one compact Bug Card and Hypothesis Matrix in session context,
updating them instead of repeating the plan. Read references as their stage applies.

Manual reproduction and verification are the default observations for this workflow.
Wait for the user's current-attempt result before advancing either manual gate.
Tests or arriving logs cannot supply that result. An explicitly user-selected
automated method changes only the named phase; report which method actually ran.

## 1. Analyze and Hypothesize

Read the entry points, handlers, state transitions, logs, and changes relevant to
the symptom. Keep a Bug Card: symptom versus expected behavior; trigger and
input; candidate path and disputed boundaries; environment and available
evidence; observable acceptance criterion. Mark unavailable facts `unknown`.

Rank hypotheses supported by that evidence. Each needs:

```text
H1 <cause>
Prediction: <runtime state, path, or timing>
Probe: <events and code locations>
CONFIRMED when: <record condition>
REJECTED when: <record condition>
```

Use enough hypotheses and probes to distinguish the cause, without a fixed quota.
Prefer events that separate multiple explanations. Batch independent reads;
keep session edits, checkpoints, and cleanup under one owner.

## 2. Instrument Through Trace Mode

Read [`trace-mode`](../trace-mode/SKILL.md) and use its caller mode with the Bug
Card and Hypothesis Matrix. Read [`references/probes.md`](references/probes.md)
for the debug event extension. Return before standalone capture with active
probes, the Collector Contract, producer connection status, and any tunnel handle.
Keep probes and connection checks active through the fix and verification.

## 3. Reproduce, Prove, Fix, and Verify

Use [`references/checkpoints.md`](references/checkpoints.md) for the attempt
boundary, supported interaction path, result validation, and phase mappings.

- `PENDING`: keep the session active and wait.
- Pre-fix `B` or `C`: follow the result table, adjust the attempt, and checkpoint again.
- Pre-fix `A`: follow [`references/prove-fix-verify.md`](references/prove-fix-verify.md)
  through evidence, correction, verification, and cleanup. No additional approval
  is needed to fix the confirmed cause within the requested scope.

## Completion and Exceptions

Report the cause with current-attempt evidence and file locations, what changed,
verification performed, cleanup status, and remaining uncertainty. Use the user's
language and detail proportional to the diagnosis.

The session ends after cleanup or explicit abandonment. For abandonment, follow
[`references/cleanup.md`](references/cleanup.md) without claiming a verified fix.
Read [`references/troubleshooting.md`](references/troubleshooting.md) only when
collection, reproduction, or delivery fails.
