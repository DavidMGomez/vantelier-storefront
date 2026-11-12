import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const storefrontFiles = [
  "src",
  "public",
  "tests",
  "scripts",
  "docs",
  ".github",
  ".gitignore",
  ".env.example",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "next-env.d.ts",
  "eslint.config.mjs",
  "vitest.config.ts",
  "README.md",
];

export function copyStorefront(source, target) {
  // Explicit allowlist: never copy local credentials, Git metadata or build output.
  for (const name of storefrontFiles) {
    const input = path.join(source, name);
    if (fs.existsSync(input))
      fs.cpSync(input, path.join(target, name), {
        recursive: true,
        dereference: false,
      });
  }
}

export function configureBackend(target) {
  const app = path.join(target, "apps/backend");
  if (!fs.existsSync(path.join(app, "medusa-config.ts"))) {
    throw new Error(
      "El generador no creó apps/backend/medusa-config.ts. Revisa su salida antes de continuar.",
    );
  }
  // Only generated local development credentials; none are written to tracked files.
  const password = crypto.randomBytes(24).toString("hex");
  const databaseUrl = `postgres://vantelier:${password}@localhost:5433/vantelier`;
  const envPath = path.join(app, ".env");
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const settings = {
    DATABASE_URL: databaseUrl,
    STORE_CORS: "http://localhost:3200,http://127.0.0.1:3200",
    ADMIN_CORS: "http://localhost:9000,http://127.0.0.1:9000",
    AUTH_CORS:
      "http://localhost:3200,http://127.0.0.1:3200,http://localhost:9000,http://127.0.0.1:9000",
    JWT_SECRET: crypto.randomBytes(32).toString("hex"),
    COOKIE_SECRET: crypto.randomBytes(32).toString("hex"),
  };
  for (const [key, value] of Object.entries(settings)) {
    const expression = new RegExp(`^${key}=.*$`, "m");
    env = expression.test(env)
      ? env.replace(expression, `${key}=${value}`)
      : `${env}\n${key}=${value}`;
  }
  fs.writeFileSync(envPath, `${env.trim()}\n`, { mode: 0o600 });
  fs.chmodSync(envPath, 0o600);
  fs.writeFileSync(
    path.join(target, ".env.local"),
    `VANTELIER_DB_PASSWORD=${password}\n`,
    { mode: 0o600 },
  );
  fs.writeFileSync(
    path.join(target, "compose.yaml"),
    `name: vantelier-local
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "127.0.0.1:5433:5432"
    environment:
      POSTGRES_USER: vantelier
      POSTGRES_PASSWORD: \${VANTELIER_DB_PASSWORD:?Define VANTELIER_DB_PASSWORD in .env.local}
      POSTGRES_DB: vantelier
    volumes:
      - vantelier-postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vantelier -d vantelier"]
      interval: 3s
      timeout: 3s
      retries: 20
volumes:
  vantelier-postgres:
`,
  );
  const ignore = path.join(target, ".gitignore");
  fs.appendFileSync(
    ignore,
    "\n# Local Vantelier state\n.env\n.env.*\n!.env.example\nnode_modules/\n.medusa/\n.next/\n*.tsbuildinfo\n.vantelier-setup.json\n",
  );
  fs.writeFileSync(path.join(target, "README.md"), backendReadme);
}

const backendReadme = fs.readFileSync(
  new URL("./backend-readme.md", import.meta.url),
  "utf8",
);
