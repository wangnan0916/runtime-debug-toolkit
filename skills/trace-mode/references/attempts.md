# Attempt Contract

Read before an instrumented trigger in either workflow. One attempt ties a
specific observation to the runtime records that can explain it.

## Execute and Observe

Choose execution separately for each phase. Run directly when authorized tools
can trigger the behavior and observe the criterion in a representative environment.
Follow explicit user choices; otherwise request only the unavailable operation
or observation. A different test environment establishes only the coverage it
actually provides, especially for device-specific failures.

Keep the phase/run, executor and observer, trigger/input, environment, criterion,
expected probes, actual observation, and evidence references in session context.
These are working notes, not a prescribed report template. Keep one owner for
session edits, attempt boundaries, and cleanup. Independent inspection may run
in parallel when the host and user permit it.

Before each trigger, count complete NDJSON lines as `ATTEMPT_START_LINE` (`0` if
`LOG_FILE` is absent). Read complete records after that boundary matching the
active session and run. A repeated trigger needs a fresh boundary; changing
question transport does not. Distinguish overlapping asynchronous attempts with
correlation fields or finish one before starting the next.

## Evaluate

| Phase | Observation result |
| --- | --- |
| Reproduction (`pre-fix`) | `reproduced`, `not_reproduced`, `inconclusive` |
| Verification (`post-fix`) | `passed`, `failed`, `inconclusive` |
| Standalone capture | `captured`, `not_triggered`, `inconclusive` |
| Required user observation outstanding | `pending_user` |

A result describes the observed behavior. Advancing to a proven cause or verified
fix also requires the probes expected for that path. Wait for in-flight delivery
as needed; unresolved evidence gaps remain inconclusive. Interpret absent events
only after separating skipped control flow from telemetry loss. Use correlation
or sequence data for causal claims across concurrent producers.

A focused test can supply the observation when it exercises the original trigger
and asserts the acceptance criterion. Command exit status, unrelated tests,
health responses, or arriving logs alone do not establish that criterion.
For user observations, use the caller's manual checkpoint mapping; an answer
from another attempt cannot complete this one.

## Continue or Hand Off

Use each attempt to narrow the hypothesis, trigger, environment, or event plan.
Change an uninformative approach; request a specific missing prerequisite when
further independent work cannot resolve it. Continue useful authorized work
before asking for confirmation of any additional action.

While `pending_user`, retain probes and process handles and follow
[manual transport](manual-checkpoints.md). Tests, logs, elapsed time, and tool
acknowledgements cannot substitute for the required submission. A task update
steers the active investigation unless it clearly ends or replaces it.

Across replies or compaction, retain the card/hypotheses, probe locations, phase,
Collector Contract and process/tunnel handles, producer connection result/time,
attempt boundary, observation/result, and next action. Resume those facts rather
than inferring a missing answer. On completion or an explicitly reported end,
use [cleanup](cleanup.md) and state any unresolved questions.
