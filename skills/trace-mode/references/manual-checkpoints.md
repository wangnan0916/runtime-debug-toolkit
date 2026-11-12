# Manual Observation Transport

Use only when an attempt requires user participation. The caller's checkpoint
reference supplies phase-specific choices; the [attempt contract](attempts.md)
supplies the evidence boundary and recovery state.

## Ask and Wait

Prepare the exact operation/observation and criterion, plus session, log file,
and effective `/log` endpoint for the checkpoint. Explain the missing capability
or observation in the user's language. If a skill requirement causes a pause,
link its active `SKILL.md`, quote the relevant instruction, and explain its effect.

Use the first path supported by both the host tool schema and current mode:

1. Native `request_user_input_async`, otherwise permitted `request_user_input`.
2. The caller's Pi chooser.
3. Plain text with the caller's A/B/C choices.

Adapt the question to the missing operation; avoid asking the user to repeat an
already completed trigger. Each required manual observation stays `pending_user`
until a submission tied to this attempt arrives. Tool acknowledgement,
preselection, tests, logs, and earlier replies do not resolve it.

## Validate the Response

For native tools, use the actual schema and the caller's phase labels. Send one
question; where the UI supplies free text, omit an Other choice. Async dispatch
only sends the question: wait for the later submission without re-prompting.
Validate synchronous question IDs and values. Interpret clear free text by
meaning; clarify ambiguous outcomes before dependent work.

For Pi, pass the actual context and phase. Validate the semantic result against
the selection and phase; C needs nonempty details. Cancellation, UI unavailable,
or malformed results leave the attempt pending and permit plain-text fallback.
Native cancellation leaves it pending without another prompt. Tool errors or
unusable synchronous responses permit the next supported path.

Keep the attempt boundary through fallbacks. Retain probes and command handles
while waiting; independent work may continue. A user reply changes the observation
state, not the evidence standard or authorization scope.
