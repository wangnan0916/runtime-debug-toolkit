# Manual Checkpoint Transport

Read with the caller's checkpoint reference for phase meanings and result routes.
A checkpoint collects an observation, not approval for routine investigation.

## Attempt State

Before a direct trigger or the first manual question, count complete NDJSON lines
in `LOG_FILE` as `ATTEMPT_START_LINE` (`0` if absent). Evidence is complete records
after that boundary matching the session and run. Keep the boundary across
interaction fallbacks; reset it when the trigger is repeated.

Each manual attempt starts `GATE_RESULT=PENDING`. Only a submitted result tied to
the current attempt and phase sets `A`, `B`, or `C`. Logs, tests, elapsed time,
preselected options, tool acknowledgements, and earlier answers cannot do so.
Clarify ambiguous replies without advancing the gate.

While pending, keep probes and connection checks active. Wait before dependent
analysis, product edits, phase changes, cleanup, or completion claims. Explicit
user abandonment invokes the caller's cleanup; a changed task is steering, not
an automatic result code.

On pause or compaction, preserve workflow/phase, trigger/criterion, card and probe
plan, Collector Contract and any tunnel handle, instrumentation locations,
connection result/time, attempt boundary, gate result, and next action. Resume
that state instead of restarting or inferring an answer.

## Interaction Path

Use the first supported path below. Both the tool schema and current mode must
permit this question; a listed Plan-only tool is unavailable in Default mode.

1. Native `request_user_input_async`, otherwise permitted `request_user_input`.
2. The caller's Pi chooser.
3. Plain text.

Prepare phase, session, log file, effective `/log` endpoint, exact trigger, and
verification criterion before asking. Use the user's language. When the manual
gate causes a pause, link the active `SKILL.md`, quote its gate instruction, and
explain which observation is needed alongside the question.

## Native Tools

Follow the actual tool schema. For `request_user_input_async`, send one question
with context and the caller's question in `title`, and its two result labels in
`options`. The UI supplies free text; omit an Other option. A tool acknowledgement
only means the question was sent: wait for the later user submission. Do not
fall back or re-prompt while that question is pending. Independent work may
continue if it does not cross the gate.

For synchronous `request_user_input`, use the caller's header, question ID, and
choices with brief descriptions; append a recommended suffix to the first choice
if the schema requires it. Validate the returned question ID and submitted value.

Map choices by the caller's table. Map clear free-text outcomes to the matching
code; other nonempty details become `C`. A native cancellation leaves the gate
pending: yield without another prompt. Tool errors or unusable synchronous
responses allow the next supported path, retaining the attempt boundary.

## Pi and Plain Text

Pass actual session, log file, endpoint, and any required phase to the Pi chooser.
Finish preparation before calling; validate its returned selection and nonempty
`C` details before dependent work. The caller defines its fixed A/B/C meanings.

Pi `cancelled`, `ui_unavailable`, empty, or malformed results request plain-text
fallback without completing the gate or abandoning the session.

When no interactive path is usable, end with the prepared context, question, and
caller-defined A/B/C options; wait for a typed result for this attempt. Preserve
fields and option meanings, without prescribing exact prose or field order.
