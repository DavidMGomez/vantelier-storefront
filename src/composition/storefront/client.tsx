"use client";
import { Storefront } from "@/features/commerce/presentation/components/storefront";
import { beginCheckout } from "@/features/commerce/infrastructure/browser-checkout";
import type { Product } from "@/features/commerce/domain/catalog";
export function StorefrontClient({
  products,
  checkoutEnabled,
}: {
  products: Product[];
  checkoutEnabled: boolean;
}) {
  return (
    <Storefront
      products={products}
      checkout={beginCheckout}
      checkoutEnabled={checkoutEnabled}
    />
  );
}
