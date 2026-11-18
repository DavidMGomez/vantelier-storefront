import type { Metadata } from "next";
import { CheckoutResultClient } from "@/composition/storefront/checkout-result";

export const metadata: Metadata = {
  title: "Resultado del pago · Vantelier",
  robots: { index: false },
};

// Retorno desde la pasarela: solo muestra lo que confirma el backend.
export default function CheckoutResultPage() {
  return <CheckoutResultClient />;
}
