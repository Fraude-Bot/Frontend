import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const baseURL = `http://localhost:${port}`;

/**
 * The Playwright VS Code/Cursor extension starts webServer via `/bin/sh`
 * with the extension-host PATH. That PATH does not load nvm, so `npm` is
 * missing unless we prepend known Node bin directories.
 */
function pathWithNpm(existingPath = ""): string {
  const prefixes: string[] = [];
  const seen = new Set<string>();

  const addIfNpm = (dir: string) => {
    if (!seen.has(dir) && existsSync(path.join(dir, "npm"))) {
      seen.add(dir);
      prefixes.push(dir);
    }
  };

  addIfNpm(path.dirname(process.execPath));

  const nvmVersions = path.join(
    process.env.NVM_DIR ?? path.join(os.homedir(), ".nvm"),
    "versions",
    "node",
  );
  if (existsSync(nvmVersions)) {
    for (const name of readdirSync(nvmVersions).sort().reverse()) {
      addIfNpm(path.join(nvmVersions, name, "bin"));
    }
  }

  return prefixes.length > 0
    ? `${prefixes.join(path.delimiter)}${existingPath ? `${path.delimiter}${existingPath}` : ""}`
    : existingPath;
}

const npmPath = pathWithNpm(process.env.PATH ?? "/usr/bin:/bin");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `export PATH=${JSON.stringify(npmPath)}; npm run build && npm run preview -- --port 4173 --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
