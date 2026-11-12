import path from "node:path";

/** Resolve actual module destinations, including relative imports and public barrels. */
const layerBoundaries = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      dependency:
        "{{layer}} cannot depend on {{target}}. Keep dependencies directed inward.",
      io: "Network I/O belongs in an infrastructure adapter, not {{layer}}.",
      dynamic:
        "Use a literal import path so the layer boundary can be verified.",
    },
  },
  create(context) {
    const root = path.resolve(context.cwd, "src");
    const filename = path.resolve(context.filename);
    const relative = path.relative(root, filename).split(path.sep).join("/");
    const match = relative.match(
      /^features\/([^/]+)\/(domain|application|infrastructure|presentation)\//,
    );
    const layer =
      match?.[2] ?? (relative.startsWith("shared/") ? "shared" : null);
    if (!layer) return {};
    const allowed = {
      domain: ["domain"],
      application: ["domain", "application"],
      infrastructure: ["domain", "application", "infrastructure"],
      presentation: ["domain", "application", "presentation"],
    };
    function check(node, source) {
      if (typeof source?.value !== "string") {
        context.report({ node, messageId: "dynamic" });
        return;
      }
      const specifier = source.value;
      const resolved = specifier.startsWith("@/")
        ? path.resolve(root, specifier.slice(2))
        : specifier.startsWith(".")
          ? path.resolve(path.dirname(filename), specifier)
          : null;
      let valid;
      if (!resolved) {
        valid =
          !["domain", "application"].includes(layer) &&
          !specifier.startsWith("node:");
      } else {
        const target = path.relative(root, resolved).split(path.sep).join("/");
        const destination = target.match(
          /^features\/([^/]+)\/(domain|application|infrastructure|presentation)(?:\/|$)/,
        );
        valid =
          layer === "shared"
            ? target.startsWith("shared/")
            : destination
              ? destination[1] === match[1] &&
                allowed[layer].includes(destination[2])
              : ["presentation", "infrastructure"].includes(layer) &&
                target.startsWith("shared/");
      }
      if (!valid)
        context.report({
          node,
          messageId: "dependency",
          data: { layer, target: specifier },
        });
    }
    function network(node) {
      if (!["domain", "application", "presentation"].includes(layer)) return;
      const callee = node.callee;
      const name =
        callee.type === "Identifier"
          ? callee.name
          : callee.type === "MemberExpression" &&
              ["window", "globalThis"].includes(callee.object.name)
            ? (callee.property.name ?? callee.property.value)
            : null;
      if (
        ["fetch", "XMLHttpRequest", "WebSocket", "EventSource"].includes(name)
      )
        context.report({ node, messageId: "io", data: { layer } });
    }
    return {
      ImportDeclaration: (node) => check(node, node.source),
      ExportAllDeclaration: (node) => check(node, node.source),
      ExportNamedDeclaration: (node) => {
        if (node.source) check(node, node.source);
      },
      ImportExpression: (node) => check(node, node.source),
      CallExpression: (node) => {
        if (node.callee.type === "Identifier" && node.callee.name === "require")
          check(node, node.arguments[0]);
        network(node);
      },
      NewExpression: network,
    };
  },
};

const architecture = { rules: { "layer-boundaries": layerBoundaries } };
export default architecture;
