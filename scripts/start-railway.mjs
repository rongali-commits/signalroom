import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";

if (!process.env.DEEPSEEK_API_KEY && existsSync(".dev.vars")) {
  for (const line of readFileSync(".dev.vars", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

const key = process.env.DEEPSEEK_API_KEY?.trim();
if (!key) {
  console.error("DEEPSEEK_API_KEY is required before SignalRoom can start.");
  process.exit(1);
}

const port = process.env.PORT || "3000";
const dataDirectory = resolve(process.env.SIGNALROOM_DATA_DIR || ".railway/state");
const wrangler = resolve("node_modules/wrangler/bin/wrangler.js");
const config = resolve("wrangler.railway.jsonc");
mkdirSync(dataDirectory, { recursive: true });

const environment = {
  ...process.env,
  CI: "true",
  CLOUDFLARE_INCLUDE_PROCESS_ENV: "true",
  NODE_ENV: "production",
  WRANGLER_SEND_METRICS: "false",
};

const migration = spawnSync(
  process.execPath,
  [wrangler, "d1", "migrations", "apply", "signalroom-local", "--config", config, "--local", "--persist-to", dataDirectory],
  { env: environment, stdio: "inherit" },
);

if (migration.status !== 0) {
  console.error("SignalRoom could not prepare its local rate-limit database.");
  process.exit(migration.status ?? 1);
}

const server = spawn(
  process.execPath,
  [wrangler, "dev", "--config", config, "--local", "--persist-to", dataDirectory, "--ip", "0.0.0.0", "--port", port, "--inspector-port", "0"],
  { env: environment, stdio: "inherit" },
);

const stop = (signal) => {
  if (!server.killed) server.kill(signal);
};

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
server.on("exit", (code) => process.exit(code ?? 0));
