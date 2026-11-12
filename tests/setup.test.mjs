import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  copyStorefront,
  configureBackend,
} from "../scripts/setup/project-files.mjs";
const temporary = [];
function directory() {
  const value = fs.mkdtempSync(path.join(os.tmpdir(), "vantelier-setup-test-"));
  temporary.push(value);
  return value;
}
afterEach(() => {
  for (const value of temporary.splice(0))
    fs.rmSync(value, { recursive: true, force: true });
});
describe("repository preparation", () => {
  it("copies source but never root credentials, git state or build output", () => {
    const source = directory();
    const target = directory();
    fs.writeFileSync(path.join(source, "package.json"), "{}");
    fs.writeFileSync(path.join(source, ".env.local"), "SECRET=test");
    fs.writeFileSync(
      path.join(source, ".env.example"),
      "COMMERCE_PROVIDER=demo",
    );
    for (const name of [".git", ".next", "node_modules"]) {
      fs.mkdirSync(path.join(source, name));
      fs.writeFileSync(path.join(source, name, "private"), "not for export");
    }
    copyStorefront(source, target);
    expect(fs.existsSync(path.join(target, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(target, ".env.example"))).toBe(true);
    for (const name of [".env.local", ".git", ".next", "node_modules"])
      expect(fs.existsSync(path.join(target, name))).toBe(false);
  });
  it("rejects an unexpected generator layout before writing configuration", () => {
    const target = directory();
    expect(() => configureBackend(target)).toThrow("generador");
    expect(fs.existsSync(path.join(target, ".env.local"))).toBe(false);
  });
  it("keeps generated development credentials out of tracked templates", () => {
    const target = directory();
    const backend = path.join(target, "apps/backend");
    fs.mkdirSync(backend, { recursive: true });
    fs.writeFileSync(
      path.join(backend, "medusa-config.ts"),
      "export default {};",
    );
    fs.writeFileSync(
      path.join(backend, ".env"),
      "DATABASE_URL=old\nEXISTING_SETTING=keep\n",
    );
    configureBackend(target);
    const rootEnv = fs.readFileSync(path.join(target, ".env.local"), "utf8");
    const secret = rootEnv.trim().split("=")[1];
    const backendEnv = fs.readFileSync(path.join(backend, ".env"), "utf8");
    expect(backendEnv).toContain(`:${secret}@localhost:5433/vantelier`);
    expect(backendEnv).toContain("EXISTING_SETTING=keep");
    expect(backendEnv.match(/DATABASE_URL=/g)).toHaveLength(1);
    const compose = fs.readFileSync(path.join(target, "compose.yaml"), "utf8");
    expect(compose).toContain("${VANTELIER_DB_PASSWORD:?");
    expect(compose).not.toContain(secret);
    expect(compose).toContain("127.0.0.1:5433:5432");
    expect(fs.readFileSync(path.join(target, ".gitignore"), "utf8")).toContain(
      ".env.*",
    );
    expect(fs.statSync(path.join(backend, ".env")).mode & 0o777).toBe(0o600);
  });
});
