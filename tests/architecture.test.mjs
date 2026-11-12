import { describe, expect, it } from "vitest";
import { Linter } from "eslint";
import architecture from "../scripts/eslint/architecture.mjs";

function check(source, layer = "domain") {
  return new Linter().verify(
    source,
    [
      {
        plugins: { xirius: architecture },
        rules: { "xirius/layer-boundaries": "error" },
      },
    ],
    { filename: `src/features/extraction/${layer}/example.js` },
  );
}

describe("enforced architectural boundaries", () => {
  it.each([
    'import "@/features/extraction/infrastructure/json-document-repository";',
    'import("../infrastructure/http-provider");',
    'export * from "@/features/extraction";',
    'import { readFile } from "node:fs";',
    'const React = require("react");',
    'fetch("/api/documents");',
    'globalThis.fetch("/api/documents");',
  ])("rejects forbidden domain dependency or I/O: %s", (source) => {
    expect(
      check(source).some((error) => error.ruleId === "xirius/layer-boundaries"),
    ).toBe(true);
  });
  it("allows domain/application dependencies but keeps API calls out of presentation", () => {
    expect(
      check(
        'import { value } from "@/features/extraction/domain/document";',
        "application",
      ),
    ).toEqual([]);
    expect(
      check(
        'import { value } from "@/features/extraction/application/workspace-state";',
        "presentation",
      ),
    ).toEqual([]);
    expect(check('fetch("/data/catalog.json");', "presentation")).toHaveLength(
      1,
    );
    expect(check('fetch("/data/catalog.json");', "infrastructure")).toEqual([]);
  });
});
