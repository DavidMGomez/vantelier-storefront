import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import architecture from "./scripts/eslint/architecture.mjs";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    ".next-build/**",
    ".next-pages/**",
    "out/**",
    "tmp/**",
    ".impeccable/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { xirius: architecture },
    rules: {
      "xirius/layer-boundaries": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: ["src/features/*/{domain,application}/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        "window",
        "document",
        "fetch",
        "localStorage",
      ],
    },
  },
]);
