import {
  getCommerceProvider,
  getCommerceProviderName,
} from "@/composition/storefront/provider";
import { StorefrontClient } from "@/composition/storefront/client";
import { connection } from "next/server";
export default async function Home() {
  // El catálogo comercial se consulta por petición; el build no necesita una API activa.
  if (getCommerceProviderName() !== "demo") await connection();
  const products = await getCommerceProvider().getProducts();
  return (
    <StorefrontClient
      products={products}
      checkoutEnabled={getCommerceProviderName() === "shopify"}
    />
  );
}
