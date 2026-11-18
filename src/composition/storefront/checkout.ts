import type { CheckoutGateway } from "@/features/commerce/application/ports/checkout-gateway";
import { createMedusaCheckout } from "@/features/commerce/infrastructure/medusa-checkout";
import { getCommerceProviderName } from "./provider";

/** Solo Medusa prepara carritos con dirección y envío; los demás proveedores no lo soportan. */
export function getCheckoutGateway(): CheckoutGateway | null {
  if (getCommerceProviderName() !== "medusa") return null;
  return createMedusaCheckout({
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000",
    publishableKey: process.env.MEDUSA_PUBLISHABLE_KEY || "",
    regionId: process.env.MEDUSA_REGION_ID || "",
  });
}
