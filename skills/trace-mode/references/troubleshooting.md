# Collection Recovery

Read the branch matching the observed failure.

## Startup or Process Exit

Check Node.js 24+, the command's stderr, and the saved process handle. Follow
[collector permissions](collector.md#permissions) for actual permission failures.
For an unhealthy owned collector, stop it before replacement, update the producer
and tunnel destinations, and confirm health and delivery before another attempt.

## Rejected or Blocked Delivery

Check `POST /log`, JSON object shape, content type, session characters, and the
one MiB body limit. For browsers, inspect mixed content, CSP `connect-src`, and
preflight `OPTIONS`. Use an authorized reachable route or same-origin proxy when
loopback is unavailable; preserve the producer path under investigation.

## Empty or Missing Events

Confirm the trigger reached the instrumented path and that endpoint, session,
run, and attempt boundary match. `LOG_FILE` appears only after an accepted event.
Separate control-flow absence from delivery loss using nearby events and transport
checks. Account for in-flight requests before deciding evidence is missing.
If collection checks pass but expected events do not arrive, narrow the probes
or trigger for a fresh attempt; missing logs alone do not establish runtime cause.
