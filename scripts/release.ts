/**
 * Sobe a versão de exibição (semver) e dispara build + submit de produção no EAS.
 * O número do build (versionCode/buildNumber) continua automático via `autoIncrement` no eas.json.
 *
 * Uso: bun run release <patch|minor|major> [--platform android|ios|all] [--no-build]
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BUMPS = ["patch", "minor", "major"] as const;
type Bump = (typeof BUMPS)[number];
const PLATFORMS = ["android", "ios", "all"] as const;

const root = resolve(import.meta.dirname, "..");
const configPath = resolve(root, "app.config.ts");
const packagePath = resolve(root, "package.json");

const args = process.argv.slice(2);
const bump = args.find((a): a is Bump => (BUMPS as readonly string[]).includes(a));
const platformIdx = args.indexOf("--platform");
const platform = platformIdx >= 0 ? args[platformIdx + 1] : "android";
const noBuild = args.includes("--no-build");

if (!bump || !(PLATFORMS as readonly string[]).includes(platform)) {
  console.error("Uso: bun run release <patch|minor|major> [--platform android|ios|all] [--no-build]");
  process.exit(1);
}

const config = readFileSync(configPath, "utf8");
const match = config.match(/const APP_VERSION = "(\d+)\.(\d+)\.(\d+)" as const;/);
if (!match) {
  console.error("APP_VERSION não encontrado em app.config.ts");
  process.exit(1);
}

const [major, minor, patch] = [Number(match[1]), Number(match[2]), Number(match[3])];
const next =
  bump === "major"
    ? `${major + 1}.0.0`
    : bump === "minor"
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;
const current = `${major}.${minor}.${patch}`;

writeFileSync(configPath, config.replace(match[0], `const APP_VERSION = "${next}" as const;`));

const pkg = readFileSync(packagePath, "utf8");
writeFileSync(packagePath, pkg.replace(/("version":\s*)"[^"]+"/, `$1"${next}"`));

console.log(`Versão: ${current} -> ${next}`);

if (noBuild) {
  console.log("Build ignorado (--no-build). Commite a alteração de versão.");
  process.exit(0);
}

const proc = spawnSync(
  "bunx",
  ["eas-cli@latest", "build", "--platform", platform, "--profile", "production", "--auto-submit"],
  { cwd: root, stdio: "inherit" },
);
if (proc.status !== 0) process.exit(proc.status ?? 1);

console.log(`Lembre-se de commitar a versão ${next} (git commit -am "chore: release ${next}").`);
