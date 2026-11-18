import type { CartLine } from "../../domain/catalog";
import type {
  CheckoutSummary,
  PaymentStatus,
  ShippingAddress,
} from "../../domain/checkout";
export interface CheckoutGateway {
  /** Crea el carrito del backend con dirección y envío, y devuelve sus totales. */
  prepare(
    lines: CartLine[],
    address: ShippingAddress,
  ): Promise<CheckoutSummary>;
  /** Abre la sesión de pago del carrito y devuelve a dónde enviar al comprador. */
  startPayment(
    cartId: string,
    paymentMethodId: string,
  ): Promise<{ redirectUrl: string }>;
  /** Estado confirmado por el backend (webhook del proveedor), nunca por el retorno del navegador. */
  paymentStatus(cartId: string): Promise<PaymentStatus>;
}
