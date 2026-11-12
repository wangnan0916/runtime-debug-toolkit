# Debugging Recovery

Read the branch relevant to the observed failure.

## Bug Does Not Recur

Check trigger/input and environment differences, plus possible probe effects on
timing. `not_reproduced` establishes neither the cause nor a fix. Narrow the
remaining explanations before requesting missing details or repeating the attempt.

## Missing or Noisy Evidence

For empty or missing events, follow shared
[collection troubleshooting](../../trace-mode/references/troubleshooting.md).
Inspect extension isolation or content-script context when relevant to the target.
For noise, move probes toward disputed boundaries or record state transitions;
sample only when it preserves the needed causal evidence.

## Verification Still Fails

Use the current post-fix evidence to test remaining hypotheses. Read
[prove, fix, and verify](prove-fix-verify.md) for correction and re-entry rules.
An uninformative repeat needs a changed approach; an unavailable prerequisite
needs specific help or an explicitly incomplete report and cleanup.
