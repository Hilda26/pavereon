import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../contracts/Paveron.py", import.meta.url), "utf8");
const required = [
  "def fund_reserve",
  "def open_cover",
  "def file_incident",
  "def resolve_incident",
  "def list_covers",
  "def list_incidents",
  "def available_capacity",
];

const missing = required.filter((needle) => !source.includes(needle));
if (missing.length) {
  console.error(`Paveron contract missing expected entries: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Paveron schema surface verified.");
