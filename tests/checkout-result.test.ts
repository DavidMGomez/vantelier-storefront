import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { awaitPaymentResult } from "../src/features/commerce/application/await-payment";
import { CheckoutResult } from "../src/features/commerce/presentation/components/checkout-result";

const noWait = () => Promise.resolve();

describe("espera del resultado del pago", () => {
  it("sigue consultando mientras el pago está pendiente y termina al confirmarse", async () => {
    const check = vi
      .fn()
      .mockResolvedValueOnce("pending")
      .mockResolvedValueOnce("pending")
      .mockResolvedValueOnce("paid");
    const seen: string[] = [];
    expect(
      await awaitPaymentResult(check, {
        maxAttempts: 10,
        wait: noWait,
        onUpdate: (s) => seen.push(s),
      }),
    ).toBe("paid");
    expect(check).toHaveBeenCalledTimes(3);
    expect(seen).toEqual(["pending", "pending", "paid"]);
  });
  it("termina de inmediato si el pago falló", async () => {
    const check = vi.fn().mockResolvedValue("failed");
    expect(
      await awaitPaymentResult(check, { maxAttempts: 5, wait: noWait }),
    ).toBe("failed");
    expect(check).toHaveBeenCalledTimes(1);
  });
  it("deja de consultar tras el límite sin declarar el pago como hecho", async () => {
    const check = vi.fn().mockResolvedValue("pending");
    expect(
      await awaitPaymentResult(check, { maxAttempts: 4, wait: noWait }),
    ).toBe("timeout");
    expect(check).toHaveBeenCalledTimes(4);
  });
  it("tolera errores de red transitorios", async () => {
    const check = vi
      .fn()
      .mockRejectedValueOnce(new Error("red"))
      .mockResolvedValueOnce("paid");
    expect(
      await awaitPaymentResult(check, { maxAttempts: 3, wait: noWait }),
    ).toBe("paid");
  });
  it("se detiene si se cancela (el comprador salió de la página)", async () => {
    const controller = new AbortController();
    const check = vi.fn().mockImplementation(async () => {
      controller.abort();
      return "pending";
    });
    expect(
      await awaitPaymentResult(check, {
        maxAttempts: 10,
        wait: noWait,
        signal: controller.signal,
      }),
    ).toBe("timeout");
    expect(check).toHaveBeenCalledTimes(1);
  });
});

describe("pantalla de resultado", () => {
  it("empieza confirmando con el backend, sin afirmar que el pago se hizo", () => {
    const html = renderToStaticMarkup(
      createElement(CheckoutResult, {
        checkStatus: async () => "paid" as const,
        homeHref: "/",
      }),
    );
    expect(html).toContain("Estamos confirmando tu pago");
    expect(html).not.toContain("confirmado");
  });
});
