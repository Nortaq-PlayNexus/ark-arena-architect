import { rm } from "node:fs/promises";

const targets = ["dist", "release", "test-results", "playwright-report", "coverage"];
for (const target of targets) {
  await rm(target, { recursive: true, force: true });
  console.log(`Removed ${target}`);
}
