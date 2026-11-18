import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { awaitPaymentResult } from "../src/features/commerce/application/await-payment";
import { CheckoutResult } from "../src/features/commerce/presentation/components/checkout-result";
import { CheckoutSummaryView } from "../src/features/commerce/presentation/components/checkout-form";

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

describe("resumen y medio de pago", () => {
  const summary = {
    cartId: "cart_1",
    currency: "COP" as const,
    itemTotal: 298000,
    shippingTotal: 0,
    taxTotal: 47580,
    total: 298000,
    shippingLabel: "Envío incluido",
    paymentMethods: [
      { id: "pp_wompi_wompi", label: "Wompi" },
      { id: "pp_mercadopago_mercadopago", label: "Mercado Pago" },
    ],
  };
  const view = (props: Partial<Parameters<typeof CheckoutSummaryView>[0]>) =>
    renderToStaticMarkup(
      createElement(CheckoutSummaryView, {
        summary,
        destination: "Popayán, Cauca",
        canPay: true,
        busy: false,
        error: "",
        onPay: () => {},
        onEdit: () => {},
        ...props,
      }),
    );
  it("ofrece los medios habilitados y preselecciona el primero", () => {
    const html = view({});
    expect(html).toContain("Wompi");
    expect(html).toContain("Mercado Pago");
    expect(html.match(/checked=""/g)).toHaveLength(1);
    expect(html.match(/<input[^>]*pp_wompi_wompi[^>]*>/)?.[0]).toContain(
      'checked=""',
    );
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Pagar/);
  });
  it("sin medios habilitados no permite pagar", () => {
    const html = view({ summary: { ...summary, paymentMethods: [] } });
    expect(html).toContain("Los pagos aún no están habilitados");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Pagar/);
  });
});
