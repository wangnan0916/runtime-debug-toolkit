#!/usr/bin/env node
/** NDJSON HTTP sink for one foreground collector. */

import http from "node:http";
import { appendFile, mkdir, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

export const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
export const DEFAULT_ROOT = path.join(os.tmpdir(), "local-log-server-skill");
export const SERVICE_VERSION = 1;
export const SESSION_PATTERN = /^[A-Za-z0-9._-]+$/;

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export function validateSession(session) {
  if (typeof session !== "string" || !SESSION_PATTERN.test(session)) {
    const error = new Error("Session may only contain letters, digits, dot, underscore, and hyphen.");
    error.statusCode = 400;
    throw error;
  }
}

export function formatHostForUrl(host) {
  return host.includes(":") ? `[${host}]` : host;
}

export function sessionLogFile(logDir, session) {
  validateSession(session);
  return path.join(logDir, `${session}.ndjson`);
}

function resolveEventSession(body, defaultSession) {
  if (!Object.hasOwn(body, "session")) return defaultSession;
  validateSession(body.session);
  return body.session;
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      const error = new Error("Request body too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function writeJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    ...CORS_HEADERS,
  });
  res.end(payload);
}

function writeNoContent(res) {
  res.writeHead(204, CORS_HEADERS);
  res.end();
}

const writeQueues = new Map();

async function drainWriteQueue() {
  await Promise.all([...writeQueues.values()].map((queue) => queue.catch(() => {})));
}

function enqueueWrite(logFile, line) {
  const previous = writeQueues.get(logFile) ?? Promise.resolve();
  const write = previous.then(() => appendFile(logFile, line));
  writeQueues.set(logFile, write.catch(() => {}));
  return write;
}

/** The machine-readable Collector Contract printed alongside the KEY=VALUE lines. */
export function collectorContract({ logServerUrl, healthUrl, logDir, session }) {
  return JSON.stringify({
    logServerUrl,
    sessionId: session,
    logDir,
    logFile: sessionLogFile(logDir, session),
    healthUrl,
  });
}

export function printCollectorDetails({ logServerUrl, healthUrl, logDir, session }) {
  console.log(`LOG_SERVER_URL=${logServerUrl}`);
  console.log(`SESSION_ID=${session}`);
  console.log(`LOG_DIR=${logDir}`);
  console.log(`LOG_FILE=${sessionLogFile(logDir, session)}`);
  console.log(`HEALTH_URL=${healthUrl}`);
  console.log(`COLLECTOR_CONTRACT=${collectorContract({ logServerUrl, healthUrl, logDir, session })}`);
}

export async function startCollector(args) {
  if (!args.dir) await mkdir(DEFAULT_ROOT, { recursive: true, mode: 0o700 });
  const logDir = args.dir
    ? path.resolve(args.dir)
    : await mkdtemp(path.join(DEFAULT_ROOT, "collector-"));
  const startedAt = new Date().toISOString();
  let serviceInfo = null;

  await mkdir(logDir, { recursive: true });

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") {
        writeNoContent(res);
        return;
      }

      if (req.method === "GET" && req.url === "/health") {
        writeJson(res, 200, {
          ok: true,
          version: SERVICE_VERSION,
          pid: process.pid,
          logServerUrl: serviceInfo?.logServerUrl,
          healthUrl: serviceInfo?.healthUrl,
          logDir,
          startedAt,
          uptimeMs: Date.now() - Date.parse(startedAt),
        });
        return;
      }

      if (req.method !== "POST" || req.url !== "/log") {
        writeJson(res, 404, { ok: false, error: "Use POST /log with a JSON object." });
        return;
      }

      const body = await readJsonBody(req);
      if (!body || Array.isArray(body) || typeof body !== "object") {
        writeJson(res, 400, { ok: false, error: "Body must be a JSON object." });
        return;
      }

      const session = resolveEventSession(body, args.session);
      const logFile = sessionLogFile(logDir, session);
      const event = {
        ...body,
        ts: new Date().toISOString(),
        session,
      };

      await enqueueWrite(logFile, `${JSON.stringify(event)}\n`);
      writeJson(res, 200, { ok: true, session, logFile });
    } catch (error) {
      writeJson(res, error.statusCode || 500, { ok: false, error: error.message || String(error) });
    }
  });

  const shutdown = async (code) => {
    server.close(async () => {
      await drainWriteQueue();
      process.exit(code);
    });
  };

  server.on("error", async (error) => {
    await drainWriteQueue();
    console.error(`Failed to start local log server: ${error.message}`);
    process.exit(1);
  });

  for (const [signal, code] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ]) {
    process.on(signal, () => {
      shutdown(code);
    });
  }

  server.listen(args.port, args.host, () => {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : args.port;
    const logServerUrl = `http://${formatHostForUrl(args.host)}:${port}`;
    const healthUrl = `${logServerUrl}/health`;
    serviceInfo = {
      version: SERVICE_VERSION,
      pid: process.pid,
      host: args.host,
      port,
      logServerUrl,
      healthUrl,
      logDir,
      startedAt,
    };

    printCollectorDetails({ logServerUrl, healthUrl, logDir, session: args.session });
  });
}
