import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const root = fileURLToPath(new URL("..", import.meta.url));
const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (repository && !repository.endsWith(".github.io") ? `/${repository}` : "");
const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      COMMERCE_PROVIDER: "local",
      NEXT_PUBLIC_BASE_PATH: basePath,
    },
  },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
writeFileSync(new URL("../out/.nojekyll", import.meta.url), "");
console.log(`Exportación lista en out/ (ruta base: ${basePath || "/"}).`);
