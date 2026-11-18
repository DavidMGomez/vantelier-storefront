import type { CartLine } from "../domain/catalog";
import type { CheckoutSummary, ShippingAddress } from "../domain/checkout";
import { publicPath } from "@/shared/config/public-path";
export async function prepareCheckout(
  lines: CartLine[],
  address: ShippingAddress,
): Promise<CheckoutSummary> {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true")
    throw new Error(
      "La tienda está en preparación. Las compras aún no están habilitadas.",
    );
  const response = await fetch(publicPath("/api/checkout/cart"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines, address }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error || "No pudimos preparar tu compra.");
  return result;
}
export async function beginCheckout(lines: CartLine[]): Promise<string> {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") {
    throw new Error(
      "La tienda está en preparación. Los pagos aún no están habilitados.",
    );
  }
  const response = await fetch(publicPath("/api/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "No se pudo iniciar el pago.");
  return result.url;
}
