# Prove, Fix, and Verify

Read this file only after a valid pre-fix `A` result for the current attempt.
The checkpoint's `ATTEMPT_START_LINE` defines the evidence boundary.

```text
prove -> fix -> verification gate
```

## 1. Prove the Cause

Read only complete records appended to `LOG_FILE` after `ATTEMPT_START_LINE`.
Confirm that every expected probe is present, then inspect the records in file order and compare the relevant values with each hypothesis prediction.
Classify each hypothesis as `CONFIRMED`, `REJECTED`, or `INCONCLUSIVE`.
Write the evidence report:

```text
H1 <short cause>
Status: CONFIRMED
Evidence: <specific current-attempt events and values>

H2 <short cause>
Status: REJECTED
Evidence: <specific current-attempt events and values>

Acceptance: <one observable sentence>
Next action: <smallest correction for the confirmed cause>
```

Missing expected probes keep the cause unproven. Adjust the event plan and return to the
pre-fix gate in [`../SKILL.md`](../SKILL.md) with a fresh checkpoint.
Return there as well when every hypothesis is rejected or inconclusive.

**Complete when:** current-attempt records confirm one explanatory cause, with one observable acceptance criterion.

## 2. Make the Evidence-Bound Fix

Make the smallest change that addresses the confirmed cause.
Keep every probe active.
Change events to `runId: "post-fix"`.
Add a focused regression test when the behavior is automatable.

**Complete when:** each product edit traces to the confirmed cause, and post-fix evidence is ready.

## 3. Cross the Verification Gate

Prepare and present one post-fix checkpoint through
[`checkpoints.md`](checkpoints.md).

- `PENDING`: yield with the session and probes active.
- Post-fix `A` or `C`: route the result through the state table, inspect only the current-attempt records when applicable, and return to the hypothesis or probe plan.
- Post-fix `B`: confirm that the expected post-fix probes are present after `ATTEMPT_START_LINE`, then read [`cleanup.md`](cleanup.md). Missing probes return to a fresh verification checkpoint.

**Complete when:** a valid post-fix `B` plus every expected current-attempt probe unlocks cleanup, or the current `A`/`C` result has been routed without advancing it.
