import type { CartLine } from "../../domain/catalog";
import type { CheckoutSummary, ShippingAddress } from "../../domain/checkout";
export interface CheckoutGateway {
  /** Crea el carrito del backend con dirección y envío, y devuelve sus totales. */
  prepare(
    lines: CartLine[],
    address: ShippingAddress,
  ): Promise<CheckoutSummary>;
}
