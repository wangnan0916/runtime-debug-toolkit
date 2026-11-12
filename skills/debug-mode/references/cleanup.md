# Verified Cleanup

Use after post-fix `B` and the required current-attempt evidence confirm the
acceptance criterion, or when the user explicitly abandons the session.

Remove every paired region marked `LOG_SERVER_PROBE <session_id>`.
Search for the session ID and both region forms. Remove this session's copied
helpers and temporary instrumentation. Preserve other sessions' markers,
pre-existing changes, and product fixes; cancellation is not a request to revert
product code.
Remove the connection indicator, styles, mounting hooks, health timers, and
lifecycle listeners; cancel or ignore pending health responses.
Stop the collector and any cloudflared process started for this session through
their saved command handles; confirm they exited. Leave a user-supplied collector
running unless asked to stop it. Then delete `LOG_FILE` and its empty auto-created
directory unless the user requests retained evidence.
Inspect the diff and run checks affected by removing instrumentation, plus any
outstanding repository-required checks. Reuse prior results for unchanged code;
repeat or expand checks only when an edit, failure, or unresolved risk warrants it.

**Complete when:** this session's temporary additions are gone and relevant
checks pass. Report the fix, evidence, verification, and cleanup status. On
abandonment, state which stages remain unverified instead of claiming success.
