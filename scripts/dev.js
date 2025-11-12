#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("child_process");

const port = process.env.PORT || "3001";
const env = { ...process.env, NODE_ENV: process.env.NODE_ENV || "development" };

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "dev", "-p", port],
  {
    stdio: "inherit",
    env,
  }
);

child.on("close", (code) => {
  process.exit(code ?? 0);
});
