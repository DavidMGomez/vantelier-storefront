import type { CheckoutGateway } from "../application/ports/checkout-gateway";
import type { CheckoutSummary } from "../domain/checkout";
import { medusaBaseUrl, type MedusaConfig } from "./medusa-config";

type MedusaCart = {
  id?: string;
  currency_code?: string;
  item_total?: unknown;
  shipping_total?: unknown;
  tax_total?: unknown;
  total?: unknown;
};
type MedusaShippingOption = { id?: string; name?: string; amount?: unknown };

/** Error con un mensaje apto para el comprador. */
export class CheckoutError extends Error {}

export function createMedusaCheckout(config: MedusaConfig): CheckoutGateway {
  const base = medusaBaseUrl(config);
  async function call(path: string, init?: { method: string; body: unknown }) {
    let response: Response;
    try {
      response = await fetch(`${base}${path}`, {
        method: init?.method ?? "GET",
        headers: {
          "x-publishable-api-key": config.publishableKey,
          ...(init ? { "Content-Type": "application/json" } : {}),
        },
        ...(init ? { body: JSON.stringify(init.body) } : {}),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new CheckoutError(
        "No pudimos conectar con la tienda. Intenta de nuevo en unos minutos.",
      );
    }
    return response;
  }
  return {
    async prepare(lines, address) {
      const created = await call("/store/carts", {
        method: "POST",
        body: {
          region_id: config.regionId,
          email: address.email,
          items: lines.map((line) => ({
            variant_id: line.variantId,
            quantity: line.quantity,
          })),
          shipping_address: {
            first_name: address.firstName,
            last_name: address.lastName,
            phone: address.phone,
            address_1: address.address1,
            address_2: address.address2,
            city: address.city,
            province: address.province,
            postal_code: address.postalCode,
            country_code: "co",
          },
        },
      });
      if (!created.ok)
        throw new CheckoutError(
          created.status < 500
            ? "Revisa la disponibilidad de tus artículos e intenta de nuevo."
            : "No pudimos preparar tu compra. Intenta de nuevo.",
        );
      const cartId = ((await created.json()).cart as MedusaCart | undefined)
        ?.id;
      if (!cartId) throw new CheckoutError("No pudimos preparar tu compra.");

      const listed = await call(
        `/store/shipping-options?${new URLSearchParams({ cart_id: cartId })}`,
      );
      const options: MedusaShippingOption[] = listed.ok
        ? ((await listed.json()).shipping_options ?? [])
        : [];
      const option = options
        .filter(
          (o): o is MedusaShippingOption & { id: string } =>
            typeof o?.id === "string" && Number.isFinite(Number(o.amount)),
        )
        .sort((a, b) => Number(a.amount) - Number(b.amount))[0];
      if (!option)
        throw new CheckoutError("No hay envío disponible para esta dirección.");

      const shipped = await call(
        `/store/carts/${encodeURIComponent(cartId)}/shipping-methods`,
        {
          method: "POST",
          body: { option_id: option.id },
        },
      );
      if (!shipped.ok)
        throw new CheckoutError(
          "No pudimos asignar el envío. Intenta de nuevo.",
        );
      return summary((await shipped.json()).cart, option.name);
    },
  };
}

function summary(
  cart: MedusaCart | undefined,
  label?: string,
): CheckoutSummary {
  const amounts = [
    cart?.item_total,
    cart?.shipping_total,
    cart?.tax_total,
    cart?.total,
  ].map(Number);
  if (
    !cart?.id ||
    cart.currency_code?.toLowerCase() !== "cop" ||
    amounts.some((amount) => !Number.isFinite(amount) || amount < 0)
  )
    throw new CheckoutError(
      "La tienda devolvió totales inválidos. Intenta de nuevo.",
    );
  const [itemTotal, shippingTotal, taxTotal, total] = amounts;
  return {
    cartId: cart.id,
    currency: "COP",
    itemTotal,
    shippingTotal,
    taxTotal,
    total,
    shippingLabel: label || "Envío",
  };
}
