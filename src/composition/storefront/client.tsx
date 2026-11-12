"use client";
import { Storefront } from "@/features/commerce/presentation/components/storefront";
import { beginCheckout } from "@/features/commerce/infrastructure/browser-checkout";
import type { Product } from "@/features/commerce/domain/catalog";
export function StorefrontClient({
  products,
  demo,
}: {
  products: Product[];
  demo: boolean;
}) {
  return (
    <Storefront products={products} checkout={beginCheckout} demo={demo} />
  );
}
