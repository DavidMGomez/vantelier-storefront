import { afterEach, describe, expect, it, vi } from "vitest";
import { validateShippingAddress } from "../src/features/commerce/domain/checkout";
import { createMedusaCheckout } from "../src/features/commerce/infrastructure/medusa-checkout";
import { POST } from "../src/app/api/checkout/cart/route";

const config = {
  backendUrl: "http://127.0.0.1:9000",
  publishableKey: "pk_test",
  regionId: "reg_colombia",
};
const address = {
  email: "  ana@example.com ",
  firstName: "Ana",
  lastName: "Gómez",
  phone: "+57 300 123 4567",
  address1: "Calle 5 # 10-20",
  address2: "Apto 301",
  city: "Popayán",
  province: "Cauca",
  postalCode: "190001",
};
const lines = [{ variantId: "variant_s", quantity: 2 }];
const cartTotals = {
  id: "cart_1",
  currency_code: "cop",
  item_total: 298000,
  shipping_total: 0,
  tax_total: 47580,
  total: 298000,
};
function medusaFlow(
  overrides: { options?: unknown[]; cartStatus?: number } = {},
) {
  return vi
    .fn()
    .mockResolvedValueOnce(
      Response.json(
        overrides.cartStatus
          ? { message: "Variant out of stock" }
          : { cart: { ...cartTotals, shipping_total: 0 } },
        { status: overrides.cartStatus || 200 },
      ),
    )
    .mockResolvedValueOnce(
      Response.json({
        shipping_options: overrides.options ?? [
          { id: "so_express", name: "Express", amount: 12000 },
          { id: "so_included", name: "Envío incluido", amount: 0 },
        ],
      }),
    )
    .mockResolvedValueOnce(Response.json({ cart: cartTotals }))
    .mockResolvedValueOnce(
      Response.json({
        payment_providers: [
          { id: "pp_system_default" },
          { id: "pp_mercadopago_mercadopago" },
          { id: "pp_wompi_wompi" },
        ],
      }),
    );
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("datos de envío", () => {
  it("normaliza espacios y conserva solo los campos esperados", () => {
    expect(
      validateShippingAddress({ ...address, injected: "<script>" }),
    ).toEqual({ ...address, email: "ana@example.com" });
  });
  it.each([
    ["email", "sin-arroba"],
    ["firstName", ""],
    ["phone", "12"],
    ["address1", "x"],
    ["city", ""],
    ["province", ""],
    ["postalCode", "ABC"],
  ])("rechaza %s inválido con un mensaje para el comprador", (field, value) => {
    expect(() =>
      validateShippingAddress({ ...address, [field]: value }),
    ).toThrow(/Revisa/);
  });
  it("acepta dirección complementaria y código postal vacíos", () => {
    expect(
      validateShippingAddress({ ...address, address2: "", postalCode: "" }),
    ).toMatchObject({ address2: "", postalCode: "" });
  });
});

describe("checkout Medusa", () => {
  it("crea el carrito con dirección colombiana, elige el envío más económico y devuelve los totales de Medusa", async () => {
    const fetchMock = medusaFlow();
    vi.stubGlobal("fetch", fetchMock);
    const summary = await createMedusaCheckout(config).prepare(
      lines,
      validateShippingAddress(address),
    );
    expect(summary).toEqual({
      cartId: "cart_1",
      currency: "COP",
      itemTotal: 298000,
      shippingTotal: 0,
      taxTotal: 47580,
      total: 298000,
      shippingLabel: "Envío incluido",
      // solo medios integrados, en orden fijo; nunca el proveedor de sistema
      paymentMethods: [
        { id: "pp_wompi_wompi", label: "Wompi" },
        { id: "pp_mercadopago_mercadopago", label: "Mercado Pago" },
      ],
    });
    expect(fetchMock.mock.calls[3][0]).toBe(
      "http://127.0.0.1:9000/store/payment-providers?region_id=reg_colombia",
    );
    const [createUrl, createInit] = fetchMock.mock.calls[0];
    expect(createUrl).toBe("http://127.0.0.1:9000/store/carts");
    expect(createInit.headers["x-publishable-api-key"]).toBe("pk_test");
    expect(JSON.parse(createInit.body)).toEqual({
      region_id: "reg_colombia",
      email: "ana@example.com",
      items: [{ variant_id: "variant_s", quantity: 2 }],
      shipping_address: {
        first_name: "Ana",
        last_name: "Gómez",
        phone: "+57 300 123 4567",
        address_1: "Calle 5 # 10-20",
        address_2: "Apto 301",
        city: "Popayán",
        province: "Cauca",
        postal_code: "190001",
        country_code: "co",
      },
    });
    expect(fetchMock.mock.calls[1][0]).toBe(
      "http://127.0.0.1:9000/store/shipping-options?cart_id=cart_1",
    );
    expect(fetchMock.mock.calls[2][0]).toBe(
      "http://127.0.0.1:9000/store/carts/cart_1/shipping-methods",
    );
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
      option_id: "so_included",
    });
  });
  it("explica cuando Medusa no ofrece envío para la dirección", async () => {
    vi.stubGlobal("fetch", medusaFlow({ options: [] }));
    await expect(
      createMedusaCheckout(config).prepare(
        lines,
        validateShippingAddress(address),
      ),
    ).rejects.toThrow("No hay envío disponible");
  });
  it("informa disponibilidad cuando Medusa rechaza los artículos", async () => {
    vi.stubGlobal("fetch", medusaFlow({ cartStatus: 400 }));
    await expect(
      createMedusaCheckout(config).prepare(
        lines,
        validateShippingAddress(address),
      ),
    ).rejects.toThrow("disponibilidad");
  });
  it("rechaza totales que no estén en COP o no sean números válidos", async () => {
    const fetchMock = medusaFlow();
    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce(Response.json({ cart: cartTotals }))
      .mockResolvedValueOnce(
        Response.json({ shipping_options: [{ id: "so", amount: 0 }] }),
      )
      .mockResolvedValueOnce(
        Response.json({ cart: { ...cartTotals, currency_code: "usd" } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      createMedusaCheckout(config).prepare(
        lines,
        validateShippingAddress(address),
      ),
    ).rejects.toThrow("totales");
  });
});

describe("ruta /api/checkout/cart", () => {
  function post(body: unknown, headers: Record<string, string> = {}) {
    return POST(
      new Request("http://localhost:3200/api/checkout/cart", {
        method: "POST",
        headers,
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    );
  }
  it("bloquea solicitudes de otro origen", async () => {
    expect(
      (await post({ lines, address }, { origin: "https://evil.test" })).status,
    ).toBe(403);
  });
  it("valida artículos y dirección antes de contactar a Medusa", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("COMMERCE_PROVIDER", "medusa");
    expect(
      (await post({ lines, address: { ...address, email: "x" } })).status,
    ).toBe(400);
    expect((await post({ lines: [], address })).status).toBe(400);
    expect((await post("{")).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("no prepara checkout fuera de Medusa", async () => {
    vi.stubEnv("COMMERCE_PROVIDER", "local");
    expect((await post({ lines, address })).status).toBe(503);
  });
  it("devuelve el resumen calculado por Medusa", async () => {
    vi.stubEnv("GITHUB_PAGES", "false");
    vi.stubEnv("COMMERCE_PROVIDER", "medusa");
    vi.stubEnv("MEDUSA_PUBLISHABLE_KEY", "pk_test");
    vi.stubEnv("MEDUSA_REGION_ID", "reg_colombia");
    vi.stubGlobal("fetch", medusaFlow());
    const response = await post({ lines, address });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      cartId: "cart_1",
      total: 298000,
    });
  });
});
