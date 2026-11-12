import { localProvider } from "@/features/commerce/infrastructure/local-provider";
import { createShopifyProvider } from "@/features/commerce/infrastructure/shopify-provider";
import { createMedusaProvider } from "@/features/commerce/infrastructure/medusa-provider";
export function getCommerceProviderName() {
  return process.env.GITHUB_PAGES === "true"
    ? "local"
    : process.env.COMMERCE_PROVIDER || "medusa";
}
export function getCommerceProvider() {
  const provider = getCommerceProviderName();
  if (provider === "local" || provider === "demo") return localProvider;
  if (provider === "medusa")
    return createMedusaProvider({
      backendUrl: process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000",
      publishableKey: process.env.MEDUSA_PUBLISHABLE_KEY || "",
      regionId: process.env.MEDUSA_REGION_ID || "",
    });
  if (provider !== "shopify")
    throw new Error(
      "COMMERCE_PROVIDER debe ser medusa, local o shopify (demo es alias de local).",
    );
  return createShopifyProvider({
    domain: process.env.SHOPIFY_STORE_DOMAIN || "",
    token: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
    version: process.env.SHOPIFY_API_VERSION || "2026-10",
  });
}
