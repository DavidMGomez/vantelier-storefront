import { afterEach, describe, expect, it, vi } from "vitest";
import { createMedusaCheckout } from "../src/features/commerce/infrastructure/medusa-checkout";
import { POST as startPayment } from "../src/app/api/checkout/payment/route";
import { GET as paymentStatus } from "../src/app/api/checkout/status/route";

const config = {
  backendUrl: "http://127.0.0.1:9000",
  publishableKey: "pk_test",
  regionId: "reg_colombia",
};
const checkoutUrl =
  "https://checkout.wompi.co/p/?public-key=pub_test_a&reference=payses_1";
const session = (o: object = {}) => ({
  id: "payses_1",
  provider_id: "pp_wompi_wompi",
  status: "pending",
  data: { checkout_url: checkoutUrl },
  ...o,
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("inicio del pago", () => {
  it("crea la colección y la sesión de Wompi y devuelve la URL de pago", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ cart: { id: "cart_1" } }))
      .mockResolvedValueOnce(
        Response.json({ payment_collection: { id: "paycol_1" } }),
      )
      .mockResolvedValueOnce(
        Response.json({
          payment_collection: { id: "paycol_1", payment_sessions: [session()] },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    expect(
      await createMedusaCheckout(config).startPayment(
        "cart_1",
        "pp_wompi_wompi",
      ),
    ).toEqual({
      redirectUrl: checkoutUrl,
    });
    expect(fetchMock.mock.calls[1][0]).toBe(
      "http://127.0.0.1:9000/store/payment-collections",
    );
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      cart_id: "cart_1",
    });
    expect(fetchMock.mock.calls[2][0]).toBe(
      "http://127.0.0.1:9000/store/payment-collections/paycol_1/payment-sessions",
    );
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
      provider_id: "pp_wompi_wompi",
    });
  });
  it("reutiliza la colección existente del carrito", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          cart: { id: "cart_1", payment_collection: { id: "paycol_1" } },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          payment_collection: { id: "paycol_1", payment_sessions: [session()] },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await createMedusaCheckout(config).startPayment("cart_1", "pp_wompi_wompi");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("no redirige a URLs que no sean del checkout de Wompi", async () => {
    for (const url of [
      "https://evil.test/p/",
      "http://checkout.wompi.co/p/",
      "javascript:alert(1)",
    ]) {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValueOnce(
            Response.json({
              cart: { id: "cart_1", payment_collection: { id: "paycol_1" } },
            }),
          )
          .mockResolvedValueOnce(
            Response.json({
              payment_collection: {
                payment_sessions: [session({ data: { checkout_url: url } })],
              },
            }),
          ),
      );
      await expect(
        createMedusaCheckout(config).startPayment("cart_1", "pp_wompi_wompi"),
      ).rejects.toThrow("pago");
    }
  });
  it("abre Mercado Pago y acepta solo su dominio de checkout", async () => {
    const mp = "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=1";
    const flow = (url: string) =>
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({
            cart: { id: "cart_1", payment_collection: { id: "paycol_1" } },
          }),
        )
        .mockResolvedValueOnce(
          Response.json({
            payment_collection: {
              payment_sessions: [
                session({
                  provider_id: "pp_mercadopago_mercadopago",
                  data: { checkout_url: url },
                }),
              ],
            },
          }),
        );
    const fetchMock = flow(mp);
    vi.stubGlobal("fetch", fetchMock);
    expect(
      await createMedusaCheckout(config).startPayment(
        "cart_1",
        "pp_mercadopago_mercadopago",
      ),
    ).toEqual({ redirectUrl: mp });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      provider_id: "pp_mercadopago_mercadopago",
    });
    // la URL de Wompi no vale para una sesión de Mercado Pago
    vi.stubGlobal("fetch", flow("https://checkout.wompi.co/p/?x=1"));
    await expect(
      createMedusaCheckout(config).startPayment(
        "cart_1",
        "pp_mercadopago_mercadopago",
      ),
    ).rejects.toThrow("pago");
  });
  it("rechaza medios de pago no integrados sin contactar a Medusa", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      createMedusaCheckout(config).startPayment("cart_1", "pp_system_default"),
    ).rejects.toThrow("Medio de pago");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("explica cuando la tienda no tiene pagos habilitados", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({
            cart: { id: "cart_1", payment_collection: { id: "paycol_1" } },
          }),
        )
        .mockResolvedValueOnce(Response.json({}, { status: 503 })),
    );
    await expect(
      createMedusaCheckout(config).startPayment("cart_1", "pp_wompi_wompi"),
    ).rejects.toThrow("pagos aún no están habilitados");
  });
});

describe("estado del pago", () => {
  const cart = (o: object) =>
    vi.fn().mockResolvedValue(Response.json({ cart: { id: "cart_1", ...o } }));
  it.each([
    [{ completed_at: "2026-11-18T10:00:00Z" }, "paid"],
    [{ payment_collection: { payment_sessions: [session()] } }, "pending"],
    [
      {
        payment_collection: {
          payment_sessions: [session({ status: "authorized" })],
        },
      },
      "pending",
    ],
    [
      {
        payment_collection: {
          payment_sessions: [session({ status: "error" })],
        },
      },
      "failed",
    ],
    [
      {
        payment_collection: {
          payment_sessions: [session({ status: "canceled" })],
        },
      },
      "failed",
    ],
    [{}, "pending"],
    [
      {
        payment_collection: {
          payment_sessions: [
            session({ status: "error" }),
            session({ provider_id: "pp_mercadopago_mercadopago" }),
          ],
        },
      },
      "pending",
    ],
  ])("cart %j → %s", async (data, expected) => {
    const fetchMock = cart(data);
    vi.stubGlobal("fetch", fetchMock);
    expect(await createMedusaCheckout(config).paymentStatus("cart_1")).toBe(
      expected,
    );
    expect(fetchMock.mock.calls[0][0]).toContain(
      "http://127.0.0.1:9000/store/carts/cart_1?fields=",
    );
  });
});

describe("rutas de pago", () => {
  function medusaEnv() {
    vi.stubEnv("GITHUB_PAGES", "false");
    vi.stubEnv("COMMERCE_PROVIDER", "medusa");
    vi.stubEnv("MEDUSA_PUBLISHABLE_KEY", "pk_test");
    vi.stubEnv("MEDUSA_REGION_ID", "reg_colombia");
  }
  const post = (
    body: Record<string, unknown>,
    headers: Record<string, string> = {},
  ) =>
    startPayment(
      new Request("http://localhost:3200/api/checkout/payment", {
        method: "POST",
        headers,
        body: JSON.stringify({ providerId: "pp_wompi_wompi", ...body }),
      }),
    );
  it("valida origen e id de carrito antes de contactar a Medusa", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    medusaEnv();
    expect(
      (await post({ cartId: "cart_1" }, { origin: "https://evil.test" }))
        .status,
    ).toBe(403);
    for (const cartId of ["", "../admin", "cart_1?x=1", 5])
      expect((await post({ cartId })).status).toBe(400);
    for (const providerId of ["", "pp_wompi_wompi/../x", 7])
      expect((await post({ cartId: "cart_1", providerId })).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("devuelve la URL de pago", async () => {
    medusaEnv();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({
            cart: { id: "cart_1", payment_collection: { id: "paycol_1" } },
          }),
        )
        .mockResolvedValueOnce(
          Response.json({
            payment_collection: { payment_sessions: [session()] },
          }),
        ),
    );
    const response = await post({ cartId: "cart_1" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ redirectUrl: checkoutUrl });
  });
  it("consulta el estado sin aceptar ids inválidos", async () => {
    medusaEnv();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ cart: { id: "cart_1", completed_at: "x" } }),
        ),
    );
    const ok = await paymentStatus(
      new Request("http://localhost:3200/api/checkout/status?cartId=cart_1"),
    );
    expect(await ok.json()).toEqual({ status: "paid" });
    expect(ok.headers.get("Cache-Control")).toBe("no-store");
    expect(
      (
        await paymentStatus(
          new Request("http://localhost:3200/api/checkout/status?cartId=../x"),
        )
      ).status,
    ).toBe(400);
  });
});
