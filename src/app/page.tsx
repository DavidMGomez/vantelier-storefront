import { getCommerceProvider } from "@/composition/storefront/provider";
import { StorefrontClient } from "@/composition/storefront/client";
export default async function Home() {
  const products = await getCommerceProvider().getProducts();
  return (
    <StorefrontClient
      products={products}
      demo={
        process.env.GITHUB_PAGES === "true" ||
        (process.env.COMMERCE_PROVIDER || "demo") === "demo"
      }
    />
  );
}
