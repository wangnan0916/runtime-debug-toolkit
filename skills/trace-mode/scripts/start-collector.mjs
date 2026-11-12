#!/usr/bin/env node

import process from "node:process";
import { runCollector } from "./log-server.mjs";

const FIXED_HOST = "127.0.0.1";
const FIXED_PORT = "0";
const FIXED_ARGS = ["--host", FIXED_HOST, "--port", FIXED_PORT];
const PASSTHROUGH_OPTIONS = new Set(["--session", "--dir"]);

function usage() {
  console.log(`Usage: node scripts/start-collector.mjs --session <id> [--dir <path>]

Starts a dedicated foreground log server with safe fixed network settings:
  --host ${FIXED_HOST}
  --port ${FIXED_PORT}

Options:
  --session   Session id and log filename stem
  --dir       Optional directory for NDJSON logs
  --help      Show this help text
`);
}

function readValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${option}`);
  return value;
}

function parseArgs(argv) {
  const passthrough = [];
  let hasSession = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }

    if (arg === "--host" || arg === "--port") {
      const fixedValue = arg === "--host" ? FIXED_HOST : FIXED_PORT;
      throw new Error(`${arg} is fixed to ${fixedValue}; do not pass it to start-collector.mjs.`);
    }

    if (PASSTHROUGH_OPTIONS.has(arg)) {
      const value = readValue(argv, i, arg);
      passthrough.push(arg, value);
      if (arg === "--session") hasSession = true;
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (!hasSession) throw new Error("Missing required --session <id>.");
  return passthrough;
}

try {
  const passthrough = parseArgs(process.argv.slice(2));
  await runCollector([...FIXED_ARGS, ...passthrough]);
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
