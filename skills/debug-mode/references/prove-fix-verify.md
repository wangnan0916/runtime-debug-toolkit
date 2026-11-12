# Prove, Fix, and Verify

Use after an instrumented reproduction or failed verification. The shared
[attempt contract](../../trace-mode/references/attempts.md) defines evidence scope
and execution; this reference defines Debug Mode's decisions.

## Establish the Cause

For `reproduced`, compare current-attempt probe values against the hypothesis
predictions. Classify live explanations as confirmed, rejected, or inconclusive
with probe names, log locations, and relevant values. Proceed to a correction
when evidence explains the observed failure and its acceptance criterion.

For `not_reproduced`, inspect trigger/environment differences and possible probe
effects; disappearance alone proves neither a cause nor a fix. For inconclusive
observations or missing expected evidence, narrow the event plan or resolve
collection before another attempt. Read [troubleshooting](troubleshooting.md)
for the observed failure rather than loading every recovery branch.

A failed post-fix attempt can establish the remaining cause directly. Otherwise
use the current code as a new baseline with `runId: "pre-fix"` and update the
hypotheses. There is no need for a user to repeat an already established observation.

## Correct and Verify

Make the smallest correction supported by the confirmed cause. Keep relevant
probes active, with stable names and `runId: "post-fix"`, so verification can
compare the same behavior. Adjust probes if the corrected path requires it.

Run checks relevant to the changed behavior and repository-required checks. Add
a regression test when it demonstrates the original failure and guards the
correction; reuse adequate existing coverage. Avoid tests that merely mirror
implementation. Once checks pass, broaden or repeat only for changed code,
failures, or unresolved risk.

Verify the original trigger against the acceptance criterion with a fresh
post-fix attempt boundary. A focused check may perform this verification when
it supplies both the behavioral assertion and expected runtime probes; prepare
its boundary first and evaluate that attempt without rerunning it unnecessarily.

| Result | Next action |
| --- | --- |
| `passed` with expected evidence | Follow shared [cleanup](../../trace-mode/references/cleanup.md). |
| `failed` | Use post-fix evidence to narrow the remaining cause and correct it. |
| `inconclusive` or evidence gaps | Resolve the gap or adjust the next attempt; do not claim verification. |
| `pending_user` | Retain the session and wait for the required observation. |

Use [manual checkpoints](checkpoints.md) only for required user participation.
If ending without complete verification, explain what was established, what
changed, and which criterion or environment remains unverified, then clean up.
