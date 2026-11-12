#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { copyStorefront, configureBackend } from "./setup/project-files.mjs";

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (
  args.some(
    (a) =>
      !["--directory", "--plan"].includes(a) &&
      args[args.indexOf(a) - 1] !== "--directory",
  )
) {
  throw new Error(
    "Uso: node scripts/setup-github.mjs [--directory /ruta/GitHub] [--plan]",
  );
}
const directoryIndex = args.indexOf("--directory");
if (
  directoryIndex >= 0 &&
  (!args[directoryIndex + 1] || args[directoryIndex + 1].startsWith("--"))
)
  throw new Error("Falta la ruta de --directory.");
const parent = path.resolve(
  directoryIndex >= 0
    ? args[directoryIndex + 1]
    : path.join(os.homedir(), "Documents/GitHub"),
);
const targets = ["vantelier-storefront", "vantelier-backend"].map((name) => ({
  name,
  directory: path.join(parent, name),
}));
const markerName = ".vantelier-setup.json";
const identity = "vantelier-initial-setup-v1";

function run(command, arguments_, cwd = source, capture = false) {
  const result = spawnSync(command, arguments_, {
    cwd,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    env: process.env,
  });
  if (result.error)
    throw new Error(`No se pudo ejecutar ${command}: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(
      `Falló ${command} ${arguments_[0] || ""}.${capture ? ` ${result.stderr.trim()}` : " Revisa la salida anterior."}`,
    );
  return capture ? result.stdout.trim() : "";
}
function readState(directory) {
  const marker = path.join(directory, markerName);
  if (!fs.existsSync(directory)) return null;
  if (!fs.existsSync(marker))
    throw new Error(
      `La carpeta ${directory} ya existe y no fue preparada por este script. No se modificará.`,
    );
  const state = JSON.parse(fs.readFileSync(marker, "utf8"));
  if (state.identity !== identity)
    throw new Error(`Marcador desconocido en ${directory}.`);
  return state;
}
function saveState(directory, state) {
  fs.writeFileSync(
    path.join(directory, markerName),
    JSON.stringify({ identity, ...state }, null, 2) + "\n",
  );
}
function origin(directory) {
  const result = spawnSync("git", ["remote", "get-url", "origin"], {
    cwd: directory,
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

if (args.includes("--plan")) {
  console.log(
    `Destino: ${parent}\n1. Copiar frontend sin secretos ni dependencias.\n2. Generar backend oficial Medusa 2.22.6, sin migrar la base de datos.\n3. Configurar PostgreSQL local y validar ambos builds.\n4. Crear repositorios privados y publicar commits en la cuenta autenticada de gh.\n${targets.map((t) => t.directory).join("\n")}`,
  );
  process.exit(0);
}

try {
  if (Number(process.versions.node.split(".")[0]) !== 24)
    throw new Error("Utiliza Node.js 24 LTS para esta configuración.");
  for (const tool of ["git", "npm", "gh"])
    run(tool, ["--version"], source, true);
  run("gh", ["auth", "status", "--hostname", "github.com"]);
  const owner = run("gh", ["api", "user", "--jq", ".login"], source, true);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(owner))
    throw new Error("No se pudo verificar la cuenta de GitHub.");
  for (const target of targets) readState(target.directory);
  // Check repository collisions before writing any project.
  for (const target of targets) {
    if (readState(target.directory)) continue;
    const check = spawnSync(
      "gh",
      ["repo", "view", `${owner}/${target.name}`, "--json", "name"],
      { encoding: "utf8" },
    );
    if (check.status === 0)
      throw new Error(
        `Ya existe ${owner}/${target.name}. No se publicará encima de un repositorio existente.`,
      );
    // A REST request distinguishes a missing repository from auth/network errors.
    const probe = spawnSync("gh", ["api", `repos/${owner}/${target.name}`], {
      encoding: "utf8",
    });
    if (probe.status === 0 || !probe.stderr.includes("HTTP 404"))
      throw new Error(
        `No se pudo confirmar que ${owner}/${target.name} esté disponible. ${probe.stderr.trim()}`,
      );
  }
  fs.mkdirSync(parent, { recursive: true });
  for (const target of targets) {
    let state = readState(target.directory);
    if (!state) {
      if (target.name === "vantelier-storefront") {
        fs.mkdirSync(target.directory);
        copyStorefront(source, target.directory);
      } else {
        // Official generator; do not rewrite or approximate the Medusa framework.
        run(
          "npx",
          [
            "--yes",
            "create-medusa-app@2.22.6",
            target.name,
            "--directory-path",
            parent,
            "--skip-db",
            "--no-browser",
            "--use-npm",
            "--version",
            "2.22.6",
          ],
          parent,
        );
      }
      state = { prepared: false, owner };
      saveState(target.directory, state);
    }
    if (state.owner !== owner)
      throw new Error(
        `Este proyecto se preparó para ${state.owner}. Inicia sesión con esa cuenta.`,
      );
    if (!state.prepared) {
      if (target.name === "vantelier-backend")
        configureBackend(target.directory);
      else
        fs.appendFileSync(
          path.join(target.directory, ".gitignore"),
          "\n.vantelier-setup.json\n",
        );
      state.prepared = true;
      saveState(target.directory, state);
    }
    if (!state.validated) {
      run(
        "npm",
        [target.name === "vantelier-storefront" ? "ci" : "install"],
        target.directory,
      );
      if (target.name === "vantelier-storefront")
        run("npm", ["run", "check"], target.directory);
      run(
        "npm",
        ["run", "build"],
        target.name === "vantelier-backend"
          ? path.join(target.directory, "apps/backend")
          : target.directory,
      );
      state.validated = true;
      saveState(target.directory, state);
    }
    // The CLI may initialize Git, but must not retain an upstream remote.
    if (!fs.existsSync(path.join(target.directory, ".git")))
      run("git", ["init", "-b", "main"], target.directory);
    const remote = origin(target.directory);
    const expected = [
      `https://github.com/${owner}/${target.name}.git`,
      `git@github.com:${owner}/${target.name}.git`,
      `https://github.com/${owner}/${target.name}`,
    ];
    if (remote && !expected.includes(remote))
      throw new Error(
        `El remoto de ${target.name} no corresponde a tu repositorio. No se cambiará.`,
      );
    if (!state.committed) {
      run("git", ["add", "."], target.directory);
      const staged = run(
        "git",
        ["diff", "--cached", "--name-only"],
        target.directory,
        true,
      ).split("\n");
      if (
        staged.some(
          (name) =>
            /(^|\/)\.env($|\.)/.test(name) &&
            !name.endsWith(".env.example") &&
            !name.endsWith(".env.template"),
        )
      )
        throw new Error(
          "Se detectó un archivo de entorno en el commit. Revisa .gitignore antes de continuar.",
        );
      if (staged.some(Boolean))
        run(
          "git",
          ["commit", "-m", `feat: initialize ${target.name}`],
          target.directory,
        );
      state.committed = true;
      saveState(target.directory, state);
    }
    if (!remote)
      run(
        "gh",
        [
          "repo",
          "create",
          `${owner}/${target.name}`,
          "--private",
          "--source",
          target.directory,
          "--remote",
          "origin",
          "--description",
          target.name === "vantelier-storefront"
            ? "Vantelier oversize clothing storefront — Next.js"
            : "Vantelier commerce backend — Medusa",
        ],
        target.directory,
      );
    run("git", ["push", "-u", "origin", "HEAD:main"], target.directory);
    const local = run("git", ["rev-parse", "HEAD"], target.directory, true);
    const pushed = run(
      "gh",
      ["api", `repos/${owner}/${target.name}/commits/main`, "--jq", ".sha"],
      target.directory,
      true,
    );
    if (local !== pushed)
      throw new Error(
        `No se pudo verificar el commit remoto de ${target.name}.`,
      );
    console.log(
      `Verificado: https://github.com/${owner}/${target.name} (${local.slice(0, 7)})`,
    );
  }
  console.log(
    `\nTienda: cd "${targets[0].directory}" && npm run dev\nBackend: consulta ${targets[1].directory}/README.md`,
  );
} catch (error) {
  console.error(
    `\nPreparación detenida: ${error.message}\nNo se borraron ni sobrescribieron proyectos existentes. Puedes repetir el comando tras resolver el error. Si el generador quedó incompleto sin marcador, conserva esa carpeta y usa otro destino.`,
  );
  process.exitCode = 1;
}
