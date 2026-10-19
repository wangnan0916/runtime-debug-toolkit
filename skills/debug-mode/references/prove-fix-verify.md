# Prove, Fix, and Verify

Read after the current attempt establishes pre-fix `A`, or re-enter after a
post-fix `A` reports failed verification, under
[`checkpoints.md`](checkpoints.md).
The checkpoint's `ATTEMPT_START_LINE` defines the evidence boundary.

```text
prove -> fix -> verification gate
```

## 1. Prove the Cause

Read only complete records appended to `LOG_FILE` after `ATTEMPT_START_LINE`.
Filter to the active session and the attempt's run (`pre-fix` for reproduction,
`post-fix` for failed verification). Require the probes expected for the observed
path, including control-flow and delivery evidence before
interpreting an absent branch event. Compare values against hypothesis predictions;
append order alone does not establish causality across concurrent producers.

Classify each hypothesis as `CONFIRMED`, `REJECTED`, or `INCONCLUSIVE`, with
specific probe names, log line references, and relevant values. State the
observable acceptance criterion and the smallest correction supported by that
evidence. Keep unproven explanations separate from findings.

Missing expected probes, or only rejected/inconclusive hypotheses, require an
adjusted event plan and fresh reproduction checkpoint. Treat the current code
as that attempt's baseline and label its events `pre-fix`. If failed-verification
records already confirm the remaining cause, proceed to its correction without
asking the user to repeat the same observation.

**Complete when:** current-attempt records confirm one explanatory cause, with one observable acceptance criterion.

## 2. Make the Evidence-Bound Fix

Make the smallest change that addresses the confirmed cause.
Keep every probe active.
Change events to `runId: "post-fix"`.
Run existing checks relevant to the changed behavior and repository-required
checks. Add a focused regression test when it can demonstrate the bug and guard
the correction; reuse existing coverage when sufficient. Avoid tests that only
mirror implementation. Broaden testing only for an uncovered risk or failure.
Automated checks support the diagnosis; they do not replace a manual gate unless
the user explicitly changed the verification method.

**Complete when:** each product edit traces to the confirmed cause, and post-fix evidence is ready.

## 3. Cross the Verification Gate

Prepare and present one post-fix checkpoint through
[`checkpoints.md`](checkpoints.md).

- `PENDING`: yield with the session and probes active.
- Post-fix `A` or `C`: route the result through the state table, inspect only the current-attempt records when applicable, and return to the hypothesis or probe plan.
- Post-fix `B`: confirm the expected probes for the observed path with the active session and `runId: "post-fix"` after `ATTEMPT_START_LINE`, then read [`cleanup.md`](cleanup.md). Missing required evidence returns to a fresh verification attempt.

**Complete when:** a valid post-fix `B` plus every expected current-attempt probe unlocks cleanup, or the current `A`/`C` result has been routed without advancing it.
