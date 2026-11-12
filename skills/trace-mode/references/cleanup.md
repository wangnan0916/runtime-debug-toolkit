# Session Cleanup

Use when an investigation finishes, is abandoned, or ends with an explicitly
reported incomplete outcome. A pending user observation is a pause, not an end.
Debug Mode and standalone Trace Mode use this same procedure.

Preserve a concise evidence summary for the final report before deleting logs.
Remove only this session's paired `LOG_SERVER_PROBE <session_id>` regions,
copied helpers, optional connection UI, mounting hooks, timers, and listeners.
Cancel or ignore pending requests. Preserve product fixes, pre-existing edits,
and other sessions' instrumentation.

Search for this session ID and paired markers, then inspect the diff to confirm
removal. Stop owned producers/requests, the owned tunnel, and the collector using
the saved handles; confirm process exit. Leave a user-supplied collector running
unless asked to stop it. Delete `LOG_FILE` and its empty auto-created directory
unless retained evidence was requested.

Run checks affected by removing instrumentation and any outstanding required
repository checks. Reuse results for unchanged code; expand testing only for
new edits, failures, or unresolved risks. Report residual resources or failed
checks explicitly. An incomplete investigation receives the same cleanup
without claiming a verified fix.
