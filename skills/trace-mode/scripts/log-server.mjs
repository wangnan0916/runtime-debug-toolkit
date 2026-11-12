#!/usr/bin/env node
/** Foreground CLI for one independently managed collector. */
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { LOOPBACK_HOSTS, startCollector, validateSession } from "./collector-server.mjs";

function usage() {
  console.log(`Usage: node scripts/log-server.mjs [--dir <path>] [--session <id>] [--port 0] [--host 127.0.0.1]

Options:
  --dir       Directory for NDJSON logs. Default: a unique temporary directory
  --session   Session id and log filename stem. Default: dbg-<timestamp>-<random>
  --port      Port to bind. Use 0 for an available port. Default: 0
  --host      Loopback host to bind. Default: 127.0.0.1
  --help      Show this help text
`);
}

function parseArgs(argv) {
  const args = {
    dir: undefined,
    session: `dbg-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    port: 0,
    host: "127.0.0.1",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    i += 1;

    if (key === "dir") args.dir = value;
    else if (key === "session") args.session = value;
    else if (key === "host") args.host = value;
    else if (key === "port") {
      const port = Number(value);
      if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new Error(`Invalid port: ${value}`);
      }
      args.port = port;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  validateSession(args.session);

  if (!LOOPBACK_HOSTS.has(args.host)) {
    throw new Error(
      `Host must be loopback-only (127.0.0.1, localhost, or ::1). Refusing to bind ${args.host}.`,
    );
  }

  return args;
}

export async function runCollector(argv) {
  await startCollector(parseArgs(argv));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCollector(process.argv.slice(2)).catch((error) => {
    console.error(error.message || String(error));
    process.exit(1);
  });
}
