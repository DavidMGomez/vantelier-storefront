import { demoProvider } from "@/features/commerce/infrastructure/demo-provider";
import { createShopifyProvider } from "@/features/commerce/infrastructure/shopify-provider";
export function getCommerceProvider() {
  const provider =
    process.env.GITHUB_PAGES === "true"
      ? "demo"
      : process.env.COMMERCE_PROVIDER || "demo";
  if (provider === "demo") return demoProvider;
  if (provider !== "shopify")
    throw new Error("COMMERCE_PROVIDER debe ser demo o shopify.");
  return createShopifyProvider({
    domain: process.env.SHOPIFY_STORE_DOMAIN || "",
    token: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
    version: process.env.SHOPIFY_API_VERSION || "2026-10",
  });
}
