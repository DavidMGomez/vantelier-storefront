"use client";
import { useEffect, useState } from "react";
import {
  awaitPaymentResult,
  type PaymentWaitResult,
} from "../../application/await-payment";
import type { PaymentStatus } from "../../domain/checkout";

type View = "checking" | PaymentWaitResult | "missing";

const copy: Record<View, { title: string; body: string }> = {
  checking: {
    title: "Estamos confirmando tu pago",
    body: "Esperamos la confirmación de la pasarela. No cierres esta página; puede tardar unos segundos.",
  },
  paid: {
    title: "¡Gracias! Tu pago quedó confirmado",
    body: "Recibimos la confirmación de la pasarela y tu pedido ya está registrado.",
  },
  failed: {
    title: "El pago no se completó",
    body: "La pasarela lo rechazó o se canceló. No se hizo ningún cobro; puedes intentarlo de nuevo desde la bolsa.",
  },
  timeout: {
    title: "Tu pago sigue en proceso",
    body: "Algunos medios, como PSE, tardan más en confirmarse. Vuelve a esta página en unos minutos; no hagas un segundo pago.",
  },
  missing: {
    title: "No encontramos una compra en curso",
    body: "Si ya pagaste, la confirmación llega aparte de esta página. Vuelve a la tienda para seguir comprando.",
  },
};

export function CheckoutResult({
  checkStatus,
  homeHref,
  onPaid,
}: {
  /** Devuelve null si este navegador no tiene una compra en curso. */
  checkStatus: () => Promise<PaymentStatus | null>;
  homeHref: string;
  onPaid?: () => void;
}) {
  const [view, setView] = useState<View>("checking");
  useEffect(() => {
    const controller = new AbortController();
    let missing = false;
    awaitPaymentResult(
      async () => {
        const status = await checkStatus();
        if (status === null) {
          missing = true;
          controller.abort();
          return "pending";
        }
        return status;
      },
      {
        maxAttempts: 40,
        wait: () => new Promise((resolve) => setTimeout(resolve, 3000)),
        signal: controller.signal,
      },
    ).then((result) => {
      if (missing) return setView("missing");
      if (controller.signal.aborted) return;
      if (result === "paid") onPaid?.();
      setView(result);
    });
    return () => controller.abort();
  }, [checkStatus, onPaid]);
  const { title, body } = copy[view];
  return (
    <main className="empty" aria-live="polite">
      <h1>{title}</h1>
      <p>{body}</p>
      {view !== "checking" && (
        <a className="button" href={homeHref}>
          Volver a la tienda
        </a>
      )}
    </main>
  );
}
