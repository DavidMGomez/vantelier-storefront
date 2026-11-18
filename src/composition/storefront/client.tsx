"use client";
import { Storefront } from "@/features/commerce/presentation/components/storefront";
import {
  beginCheckout,
  payCheckout,
  prepareCheckout,
} from "@/features/commerce/infrastructure/browser-checkout";
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
  addressStepEnabled = false,
}: {
  simulated: boolean;
  initialPage: CatalogPage;
  facets: CatalogFacets;
  checkoutEnabled: boolean;
  addressStepEnabled?: boolean;
}) {
  return (
    <Storefront
      simulated={simulated}
      initialPage={initialPage}
      facets={facets}
      loadCatalog={loadCatalog}
      checkout={beginCheckout}
      checkoutEnabled={checkoutEnabled}
      prepareCheckout={addressStepEnabled ? prepareCheckout : undefined}
      payCheckout={addressStepEnabled ? payCheckout : undefined}
    />
  );
}
