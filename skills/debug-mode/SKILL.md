---
name: debug-mode
description: Diagnose and fix runtime bugs with temporary structured logs when static inspection cannot establish the cause. Use for debug-mode or instrumented debugging requests, and resume active investigations after follow-ups. Use trace-mode for code location without a product fix.
---

# Debug Mode

Deliver an evidence-backed cause, a scoped fix, verification of the original
behavior, and removal of temporary instrumentation. The sibling
[Trace Mode](../trace-mode/SKILL.md) provides collection; its scripts need Node.js 24+.

## Execution

User instructions and existing authorization take precedence over skill defaults
within host permissions. Carry the requested investigation through completion;
resolve routine choices from the code and tools. Reproduce and verify directly
when capable. Ask for a specific missing input, operation, or observation only
when it prevents the next useful action. Honor a user's choice to operate manually.

Resume an active session on follow-ups or compaction. Keep a compact Bug Card
and Hypothesis Matrix as working context, without requiring a user-facing form.
Read references when their stage applies.

## Investigate

Establish the symptom, expected behavior, trigger, relevant environment, and an
observable acceptance criterion. Inspect enough code to identify the disputed
runtime boundary. Rank plausible causes with a prediction and a probe that can
confirm or reject each; mark unknowns and inconclusive evidence explicitly.

Use Trace Mode in **caller mode**, supplying that context. Read the
[debug event extension](references/probes.md) when instrumenting. Keep the probes
and collector active through correction and verification.

## Reproduce, Fix, and Verify

Follow the shared [attempt contract](../trace-mode/references/attempts.md) before
triggering the instrumented path. Use [prove, fix, and verify](references/prove-fix-verify.md)
to evaluate the observations and continue through the correction. Agent-executed
and user-executed attempts require the same runtime evidence.

Read [manual checkpoints](references/checkpoints.md) only when user participation
is needed. While a required user observation is `pending_user`, retain the
session and wait before dependent analysis, edits, or completion. Continue
independent work that does not depend on that observation.

If attempts stop producing information, change the approach or identify the
missing prerequisite. Use [troubleshooting](references/troubleshooting.md) for
reproduction or collection failures; report incomplete verification honestly.

## Finish

Follow the shared [cleanup procedure](../trace-mode/references/cleanup.md) when
finishing or abandoning the session. Report the cause and supporting probe
values/locations, the correction, actual verification and its limits, and cleanup
status. Use concise language matching the user; include detail needed to assess
the result rather than a transcript of the investigation.
