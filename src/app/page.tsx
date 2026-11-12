import { getCommerceProviderName } from "@/composition/storefront/provider";
import {
  getCatalogPage,
  getCatalogFacets,
} from "@/composition/storefront/catalog";
import { StorefrontClient } from "@/composition/storefront/client";
import { emptyFilters } from "@/features/commerce/domain/catalog-filters";
import { connection } from "next/server";
export default async function Home() {
  const isLocal = ["local", "demo"].includes(getCommerceProviderName());
  if (!isLocal) await connection();
  const [initialPage, facets] = await Promise.all([
    getCatalogPage({ filters: emptyFilters, offset: 0, limit: 12 }),
    getCatalogFacets(),
  ]);
  return (
    <StorefrontClient
      simulated={isLocal}
      initialPage={initialPage}
      facets={facets}
      checkoutEnabled={getCommerceProviderName() === "shopify"}
    />
  );
}
