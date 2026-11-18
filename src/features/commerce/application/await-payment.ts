import type { PaymentStatus } from "../domain/checkout";

export type PaymentWaitResult = Exclude<PaymentStatus, "pending"> | "timeout";

/**
 * Consulta el estado del pago hasta que el backend lo confirme o lo rechace.
 * Un tiempo agotado nunca se presenta como pago hecho.
 */
export async function awaitPaymentResult(
  check: () => Promise<PaymentStatus>,
  options: {
    maxAttempts: number;
    wait: () => Promise<void>;
    onUpdate?: (status: PaymentStatus) => void;
    signal?: AbortSignal;
  },
): Promise<PaymentWaitResult> {
  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    if (options.signal?.aborted) break;
    try {
      const status = await check();
      options.onUpdate?.(status);
      if (status !== "pending") return status;
    } catch {
      // Fallo de red transitorio: se reintenta en la siguiente vuelta.
    }
    if (options.signal?.aborted || attempt === options.maxAttempts - 1) break;
    await options.wait();
  }
  return "timeout";
}
