import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const serverPath = path.join(repoRoot, "skills/trace-mode/scripts/log-server.mjs");
const startCollectorPath = path.join(repoRoot, "skills/trace-mode/scripts/start-collector.mjs");

function trackExit(child) {
  let exited = false;
  const promise = once(child, "exit").then(([code, signal]) => {
    exited = true;
    return { code, signal };
  });
  return { promise, hasExited: () => exited };
}

async function stopChild(child, tracker) {
  if (!tracker.hasExited()) {
    child.kill("SIGTERM");
  }
  await tracker.promise.catch(() => {});
}

async function waitForLogServerUrl(child, exit, contract = false) {
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString("utf8");
  });

  const logServerUrlPromise = new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for LOG_SERVER_URL"));
    }, 5000);

    const onData = (chunk) => {
      output += chunk.toString("utf8");
      const match = output.match(/^COLLECTOR_CONTRACT=(.+)\n/m);
      if (match) {
        cleanup();
        const info = JSON.parse(match[1]);
        resolve(contract ? info : info.logServerUrl);
      }
    };

    const onClose = () => {
      cleanup();
      reject(new Error(`Stream closed before LOG_SERVER_URL appeared. Output: ${output}`));
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timer);
      child.stdout.off("data", onData);
      child.stdout.off("close", onClose);
      child.stdout.off("error", onError);
    };

    child.stdout.on("data", onData);
    child.stdout.on("close", onClose);
    child.stdout.on("error", onError);
  });

  return Promise.race([
    logServerUrlPromise,
    exit.promise.then(({ code, signal }) => {
      throw new Error(`Server exited before ready: code=${code} signal=${signal} stderr=${stderr}`);
    }),
  ]);
}

async function expectedLogDir(dir) {
  return path.join(await realpath(dir), "logs");
}

function sessionLogPath(dir, session) {
  return path.join(dir, "logs", `${session}.ndjson`);
}

function requestWithNodeHttp(url, options = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      url,
      {
        method: options.method ?? "GET",
        headers: options.headers,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            async json() {
              return JSON.parse(body);
            },
            async text() {
              return body;
            },
          });
        });
      },
    );
    request.on("error", reject);
    request.end(options.body);
  });
}

// Node 25 can fail intermittently in undici setTypeOfService for loopback fetch.
// Use node:http so these tests exercise the collector instead of undici.
const fetch = requestWithNodeHttp;

async function readNdjsonEvents(logFile) {
  const lines = (await readFile(logFile, "utf8")).trim().split("\n");
  return lines.map((line) => JSON.parse(line));
}

async function waitForNdjsonEvents(logFile, expectedCount, timeoutMs = 2000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const events = await readNdjsonEvents(logFile);
      if (events.length >= expectedCount) return events;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${expectedCount} NDJSON lines in ${logFile}`);
}

async function assertLogFileMissing(logFile) {
  await assert.rejects(() => readFile(logFile, "utf8"), { code: "ENOENT" });
}

async function postLog(logServerUrl, body) {
  return fetch(`${logServerUrl}/log`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function runNodeExpectFailure(args, options) {
  const child = spawn(process.execPath, args, {
    ...options,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString("utf8");
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString("utf8");
  });

  const [code, signal] = await once(child, "exit");
  assert.notEqual(code, 0);
  return { stdout, stderr, code, signal };
}

async function listenOnLoopback(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

async function closeServer(server) {
  if (!server.listening) return;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function withRunningCollector(session, run) {
  const dir = await mkdtemp(path.join(tmpdir(), "local-log-server-"));
  const child = spawn(
    process.execPath,
    [serverPath, "--dir", "logs", "--session", session, "--port", "0"],
    {
      cwd: dir,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const exit = trackExit(child);

  try {
    const logServerUrl = await waitForLogServerUrl(child, exit);
    return await run({ dir, session, child, exit, logServerUrl });
  } finally {
    await stopChild(child, exit);
    await rm(dir, { recursive: true, force: true });
  }
}

async function testRejectsNonLoopbackHost() {
  const child = spawn(process.execPath, [serverPath, "--host", "0.0.0.0", "--port", "0"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  const exit = trackExit(child);

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString("utf8");
  });

  const { code } = await exit.promise;
  assert.notEqual(code, 0);
  assert.match(stderr, /loopback-only/);
}

async function testWritesValidNdjson() {
  await withRunningCollector("test-session", async ({ dir, session, logServerUrl }) => {
    const writes = Array.from({ length: 8 }, (_, index) =>
      postLog(logServerUrl, {
        probe: `parallel.${index + 1}`,
        vars: { index: index + 1 },
      }),
    );

    const responses = await Promise.all(writes);
    assert.equal(responses.every((response) => response.ok), true);

    const events = await waitForNdjsonEvents(sessionLogPath(dir, session), 8);
    assert.deepEqual(
      events.map((event) => event.probe).sort(),
      Array.from({ length: 8 }, (_, index) => `parallel.${index + 1}`),
    );
    assert.equal(events.every((event) => event.session === session), true);
    assert.equal(events.every((event) => typeof event.ts === "string" && event.ts.length > 0), true);
  });
}

async function testDoesNotCreateLogFileBeforeFirstEvent() {
  await withRunningCollector("no-empty-log-session", async ({ dir, session }) => {
    await assertLogFileMissing(sessionLogPath(dir, session));
  });
}

async function testRecreatesDeletedLogFile() {
  await withRunningCollector("deleted-log-session", async ({ dir, session, logServerUrl }) => {
    const logFile = sessionLogPath(dir, session);
    await rm(logFile, { force: true });

    const response = await postLog(logServerUrl, { probe: "after-delete" });
    assert.equal(response.ok, true);

    const events = await waitForNdjsonEvents(logFile, 1);
    assert.equal(events[0].probe, "after-delete");
  });
}

async function testReportsWriteFailureBeforeReturningSuccess() {
  await withRunningCollector("write-failure-session", async ({ dir, logServerUrl }) => {
    await rm(path.join(dir, "logs"), { recursive: true, force: true });

    const response = await postLog(logServerUrl, { probe: "write-failure" });

    assert.equal(response.status, 500);
    assert.equal((await response.json()).ok, false);
  });
}

async function testHealthEndpoint() {
  await withRunningCollector("health-session", async ({ dir, session, child, logServerUrl }) => {
    const response = await fetch(`${logServerUrl}/health`);
    assert.equal(response.ok, true);

    const health = await response.json();
    assert.equal(health.ok, true);
    assert.equal(health.pid, child.pid);
    assert.equal(health.logServerUrl, logServerUrl);
    assert.equal(health.healthUrl, `${logServerUrl}/health`);
    assert.equal(health.logDir, await expectedLogDir(dir));
    assert.equal(typeof health.startedAt, "string");
    assert.equal(typeof health.uptimeMs, "number");

    await assertLogFileMissing(sessionLogPath(dir, session));
  });
}

async function testRoutesBodySessionToLogFile() {
  await withRunningCollector("default-session", async ({ dir, logServerUrl }) => {
    const requestSession = "request-session";
    const response = await postLog(logServerUrl, { session: requestSession, probe: "session-route" });
    assert.equal(response.ok, true);
    assert.equal((await response.json()).session, requestSession);

    const events = await waitForNdjsonEvents(sessionLogPath(dir, requestSession), 1);
    assert.equal(events[0].session, requestSession);

    await assertLogFileMissing(sessionLogPath(dir, "default-session"));

    const invalid = await postLog(logServerUrl, { session: "../bad", probe: "invalid-session" });
    assert.equal(invalid.status, 400);
  });
}

async function testStartCollectorWrapperRejectsUnsafeOrIncompleteArgs() {
  const dir = await mkdtemp(path.join(tmpdir(), "local-log-server-"));
  const cases = [
    { args: ["--session", "safe-start", "--state", "collector.json"], message: /Unknown option: --state/ },
    { args: [], message: /Missing required --session/ },
    { args: ["--session", "safe-start", "--host", "0.0.0.0"], message: /--host is fixed/ },
    { args: ["--session", "safe-start", "--port", "3000"], message: /--port is fixed/ },
    { args: ["--session", "safe-start", "--ensure"], message: /Unknown option: --ensure/ },
  ];

  try {
    for (const { args, message } of cases) {
      const result = await runNodeExpectFailure([startCollectorPath, ...args], { cwd: dir });
      assert.match(result.stderr, message);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function testParallelSessionsWriteIndependently() {
  await withRunningCollector("parallel-default", async ({ dir, logServerUrl }) => {
    const sessionA = "parallel-session-a";
    const sessionB = "parallel-session-b";

    const writes = [
      ...Array.from({ length: 4 }, (_, index) =>
        postLog(logServerUrl, { session: sessionA, probe: `a.${index + 1}` }),
      ),
      ...Array.from({ length: 4 }, (_, index) =>
        postLog(logServerUrl, { session: sessionB, probe: `b.${index + 1}` }),
      ),
    ];

    const responses = await Promise.all(writes);
    assert.equal(responses.every((response) => response.ok), true);

    const eventsA = await waitForNdjsonEvents(sessionLogPath(dir, sessionA), 4);
    const eventsB = await waitForNdjsonEvents(sessionLogPath(dir, sessionB), 4);

    assert.deepEqual(
      eventsA.map((event) => event.probe).sort(),
      ["a.1", "a.2", "a.3", "a.4"],
    );
    assert.deepEqual(
      eventsB.map((event) => event.probe).sort(),
      ["b.1", "b.2", "b.3", "b.4"],
    );
  });
}

async function testIndependentCollectorLifecycle() {
  const children = [];
  const infos = [];
  try {
    // Even identical session IDs must not share a process, port, or default logs.
    for (let i = 0; i < 2; i += 1) {
      const child = spawn(process.execPath, [startCollectorPath, "--session", "same-session"], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      const exit = trackExit(child);
      children.push({ child, exit });
      infos.push(await waitForLogServerUrl(child, exit, true));
    }
    const [first, second] = infos;
    assert.notEqual(first.logServerUrl, second.logServerUrl);
    assert.notEqual(first.logDir, second.logDir);
    for (const [index, info] of infos.entries()) {
      assert.match(info.logServerUrl, /^http:\/\/127\.0\.0\.1:\d+$/);
      assert.equal(info.sessionId, "same-session");
      assert.equal(info.healthUrl, `${info.logServerUrl}/health`);
      assert.equal(info.logFile, path.join(info.logDir, "same-session.ndjson"));
      const health = await (await fetch(info.healthUrl)).json();
      assert.equal(health.pid, children[index].child.pid);
      assert.equal(health.logDir, info.logDir);
      assert.equal(children[index].exit.hasExited(), false);
      assert.equal((await postLog(info.logServerUrl, { probe: `collector-${index}` })).ok, true);
    }
    await stopChild(children[0].child, children[0].exit);
    assert.equal((await children[0].exit.promise).code, 143);
    await assert.rejects(() => fetch(first.healthUrl));
    assert.equal((await fetch(second.healthUrl)).ok, true);
    assert.equal((await readNdjsonEvents(first.logFile))[0].probe, "collector-0");
    assert.equal((await readNdjsonEvents(second.logFile))[0].probe, "collector-1");
    await stopChild(children[1].child, children[1].exit);
    await assert.rejects(() => fetch(second.healthUrl));
  } finally {
    for (const { child, exit } of children) await stopChild(child, exit);
    for (const info of infos) await rm(info.logDir, { recursive: true, force: true });
  }
}

async function testReportsPortConflict() {
  const dir = await mkdtemp(path.join(tmpdir(), "local-log-server-"));
  const blocker = http.createServer();
  try {
    const port = await listenOnLoopback(blocker);
    const result = await runNodeExpectFailure([serverPath, "--dir", dir, "--port", String(port)]);
    assert.match(result.stderr, /EADDRINUSE/);
  } finally {
    await closeServer(blocker);
    await rm(dir, { recursive: true, force: true });
  }
}

await testRejectsNonLoopbackHost();
await testWritesValidNdjson();
await testDoesNotCreateLogFileBeforeFirstEvent();
await testRecreatesDeletedLogFile();
await testReportsWriteFailureBeforeReturningSuccess();
await testHealthEndpoint();
await testRoutesBodySessionToLogFile();
await testParallelSessionsWriteIndependently();
await testStartCollectorWrapperRejectsUnsafeOrIncompleteArgs();
await testIndependentCollectorLifecycle();
await testReportsPortConflict();
console.log("log-server tests passed");
