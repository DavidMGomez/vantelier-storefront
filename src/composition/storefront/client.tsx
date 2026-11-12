"use client";
import { Storefront } from "@/features/commerce/presentation/components/storefront";
import { beginCheckout } from "@/features/commerce/infrastructure/browser-checkout";
import { loadCatalog } from "@/features/commerce/infrastructure/browser-catalog";
import type {
  CatalogPage,
  CatalogFacets,
} from "@/features/commerce/domain/catalog-filters";
export function StorefrontClient({
  simulated,
  initialPage,
  facets,
  checkoutEnabled,
}: {
  simulated: boolean;
  initialPage: CatalogPage;
  facets: CatalogFacets;
  checkoutEnabled: boolean;
}) {
  return (
    <Storefront
      simulated={simulated}
      initialPage={initialPage}
      facets={facets}
      loadCatalog={loadCatalog}
      checkout={beginCheckout}
      checkoutEnabled={checkoutEnabled}
    />
  );
}
