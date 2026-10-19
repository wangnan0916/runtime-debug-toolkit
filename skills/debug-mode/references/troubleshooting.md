# Troubleshooting

Read only the branch matching the observed collection failure.

## Empty Log

Confirm that the manual trigger crossed the instrumented boundary.
Confirm that event and collector session IDs match.
Confirm that the endpoint ends with `/log`.
After the gate permits analysis, check current-attempt records for the active
session and run, and the probes expected for the observed path.

## Collection or Delivery Failure

Read the sibling [`trace-mode` troubleshooting guide](../../trace-mode/references/troubleshooting.md).
Then inspect extension isolation and the content-script context when relevant.

## Noisy Collection

Move probes closer to the disputed boundary.
Record state changes or sample at a low rate.
Keep enough events to preserve causal ordering.

## Bug Does Not Recur

Use pre-fix `B` in the checkpoint state table.
Check known trigger and environment differences and whether instrumentation
could affect timing. Ask only for missing details that distinguish the remaining
possibilities; a non-reproduction does not establish its cause.
Resume evidence analysis after a successful reproduction.
