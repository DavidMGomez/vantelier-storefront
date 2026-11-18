import type { CartLine } from "../domain/catalog";
import type {
  CheckoutSummary,
  PaymentStatus,
  ShippingAddress,
} from "../domain/checkout";
import { publicPath } from "@/shared/config/public-path";

// Solo se guarda el id del carrito para consultar el resultado al volver de la pasarela.
const PENDING_CART_KEY = "vantelier:checkout-cart";

/** Abre la sesión de pago y envía al comprador al checkout de la pasarela. */
export async function payCheckout(cartId: string): Promise<void> {
  const response = await fetch(publicPath("/api/checkout/payment"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.redirectUrl !== "string")
    throw new Error(result.error || "No pudimos iniciar el pago.");
  localStorage.setItem(PENDING_CART_KEY, cartId);
  window.location.assign(result.redirectUrl);
}

/** Estado según el backend; null si este navegador no tiene una compra en curso. */
export async function checkPaymentStatus(): Promise<PaymentStatus | null> {
  const cartId = localStorage.getItem(PENDING_CART_KEY);
  if (!cartId) return null;
  const response = await fetch(
    publicPath(`/api/checkout/status?${new URLSearchParams({ cartId })}`),
    { cache: "no-store" },
  );
  if (response.status === 400) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Consulta fallida.");
  return result.status;
}

export function clearPendingCheckout() {
  localStorage.removeItem(PENDING_CART_KEY);
}
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
