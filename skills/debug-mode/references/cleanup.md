# Verified Cleanup

Read this file only after a valid post-fix `B` result for the current acceptance criterion.

Remove every paired region marked `LOG_SERVER_PROBE <session_id>`.
Search for the session ID, `LOG_SERVER_PROBE`, and both region forms.
Remove copied helpers and all temporary instrumentation.
Delete `LOG_FILE` unless the user requests retained evidence.
Keep the shared server running unless the user requests shutdown.
Run relevant checks and inspect the final diff.

**Complete when:** marker and session searches return zero repository matches, checks pass, and only product changes remain.
