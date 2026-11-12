import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
export default function config(phase: string): NextConfig {
  const pages = process.env.GITHUB_PAGES === "true";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (basePath && !/^\/[a-zA-Z0-9._-]+$/.test(basePath)) {
    throw new Error(
      "NEXT_PUBLIC_BASE_PATH debe ser vacío o /nombre-del-repositorio.",
    );
  }
  return {
    poweredByHeader: false,
    basePath,
    ...(pages ? { output: "export", trailingSlash: true } : {}),
    // Pages exports UI routes; .ts HTTP handlers require the Node.js server.
    pageExtensions: pages ? ["tsx"] : ["tsx", "ts"],
    images: { unoptimized: pages },
    env: {
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_PUBLIC_STATIC_EXPORT: String(pages),
    },
    // With export, distDir names the static output. Node builds have their own directory.
    distDir:
      phase === PHASE_DEVELOPMENT_SERVER
        ? ".next"
        : pages
          ? "out"
          : ".next-build",
  };
}
