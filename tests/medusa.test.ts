import { afterEach, describe, expect, it, vi } from "vitest";
import { createMedusaProvider } from "../src/features/commerce/infrastructure/medusa-provider";
import { getCommerceProvider } from "../src/composition/storefront/provider";
import { POST } from "../src/app/api/checkout/route";

const config = {
  backendUrl: "http://127.0.0.1:9000",
  publishableKey: "pk_test",
  regionId: "reg_colombia",
};
const originalImage =
  "https://davidmgomez.github.io/vantelier-storefront/images/vantelier/01-04-signature.png";
const variant = {
  id: "variant_real_s",
  title: "S",
  manage_inventory: true,
  allow_backorder: false,
  inventory_quantity: 0,
  calculated_price: { calculated_amount: 149000, currency_code: "cop" },
};
const product = {
  id: "prod_real",
  title: "Vestigio",
  thumbnail: originalImage,
  metadata: {
    category: "Mármol",
    colors: ["#161616"],
    lookbook: { src: originalImage, column: 0 },
  },
  variants: [variant],
};
function respond(products: unknown[], count = products.length) {
  return Response.json({ products, count });
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("catálogo Medusa", () => {
  it("consulta región, precios e inventario reales sin caché ni conversión de centavos", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond([product]));
    vi.stubGlobal("fetch", fetchMock);
    const [mapped] = await createMedusaProvider(config).getProducts();
    expect(mapped.id).toBe("prod_real");
    expect(mapped.variants).toEqual([
      {
        id: "variant_real_s",
        title: "S",
        price: 149000,
        currency: "COP",
        available: false,
      },
    ]);
    expect(mapped.lookbook).toEqual({
      src: "/images/vantelier/01-04-signature.png",
      column: 0,
    });
    const [url, options] = fetchMock.mock.calls[0];
    expect(new URL(url).searchParams.get("region_id")).toBe("reg_colombia");
    expect(new URL(url).searchParams.get("fields")).toBe(
      "*variants.calculated_price,+variants.inventory_quantity,+metadata",
    );
    expect(options.headers).toEqual({ "x-publishable-api-key": "pk_test" });
    expect(options.cache).toBe("no-store");
  });
  it("refleja al recargar cambios de nombre, precio, stock e imagen desde el panel", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(respond([product]))
        .mockResolvedValueOnce(
          respond([
            {
              ...product,
              title: "Vestigio nuevo",
              thumbnail: "http://localhost:9000/static/foto.png",
              variants: [
                {
                  ...variant,
                  inventory_quantity: 7,
                  calculated_price: {
                    calculated_amount: 159000,
                    currency_code: "cop",
                  },
                },
              ],
            },
          ]),
        ),
    );
    const provider = createMedusaProvider(config);
    expect((await provider.getProducts())[0].variants[0].available).toBe(false);
    const [updated] = await provider.getProducts();
    expect(updated.name).toBe("Vestigio nuevo");
    expect(updated.variants[0]).toMatchObject({
      price: 159000,
      available: true,
    });
    expect(updated.image).toBe("http://localhost:9000/static/foto.png");
    expect(updated.lookbook).toBeUndefined();
  });
  it("no inventa precios o stock cuando faltan datos y respeta las políticas de inventario", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond([
          {
            ...product,
            variants: [
              { ...variant, id: "unknown", inventory_quantity: undefined },
              { ...variant, id: "unmanaged", manage_inventory: false },
              { ...variant, id: "backorder", allow_backorder: true },
              { ...variant, id: "no_price", calculated_price: null },
              {
                ...variant,
                id: "usd",
                calculated_price: {
                  calculated_amount: 10,
                  currency_code: "usd",
                },
              },
              {
                ...variant,
                id: "null",
                calculated_price: {
                  calculated_amount: null,
                  currency_code: "cop",
                },
              },
            ],
          },
        ]),
      ),
    );
    const [mapped] = await createMedusaProvider(config).getProducts();
    expect(mapped.variants.map((v) => [v.id, v.available])).toEqual([
      ["unknown", false],
      ["unmanaged", true],
      ["backorder", true],
    ]);
  });
  it("pagina todo el catálogo con los offsets devueltos", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respond([product], 2))
      .mockResolvedValueOnce(respond([{ ...product, id: "prod_second" }], 2));
    vi.stubGlobal("fetch", fetchMock);
    expect(await createMedusaProvider(config).getProducts()).toHaveLength(2);
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get("offset")).toBe(
      "1",
    );
  });
  it("acepta un catálogo vacío sin sustituirlo por los 16 diseños demo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond([])));
    expect(await createMedusaProvider(config).getProducts()).toEqual([]);
  });
  it.each([401, 403, 500])(
    "muestra el fallo HTTP %s sin caer a demo",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("error", { status })),
      );
      await expect(createMedusaProvider(config).getProducts()).rejects.toThrow(
        `HTTP ${status}`,
      );
    },
  );
  it("explica los fallos de conexión sin exponer el error interno", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("private upstream details")),
    );
    await expect(createMedusaProvider(config).getProducts()).rejects.toThrow(
      "Comprueba que el backend esté activo",
    );
  });
  it("rechaza paginación incompleta y registros repetidos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond([], 2)));
    await expect(createMedusaProvider(config).getProducts()).rejects.toThrow(
      "incompleta",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respond([product, product], 2)),
    );
    await expect(createMedusaProvider(config).getProducts()).rejects.toThrow(
      "repetidos",
    );
  });
  it("selecciona Medusa por defecto y exige configuración pública válida", () => {
    vi.stubEnv("GITHUB_PAGES", "false");
    vi.stubEnv("COMMERCE_PROVIDER", "");
    vi.stubEnv("MEDUSA_PUBLISHABLE_KEY", "");
    expect(() => getCommerceProvider()).toThrow("MEDUSA_PUBLISHABLE_KEY");
    expect(() =>
      createMedusaProvider({ ...config, publishableKey: "sk_admin" }),
    ).toThrow("clave pública");
    expect(() =>
      createMedusaProvider({
        ...config,
        backendUrl: "http://user:secret@localhost:9000",
      }),
    ).toThrow("sin credenciales");
  });
  it("mantiene los pagos bloqueados tanto en el adaptador como en la ruta Next", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("GITHUB_PAGES", "false");
    vi.stubEnv("COMMERCE_PROVIDER", "medusa");
    await expect(
      createMedusaProvider(config).checkout([
        { variantId: variant.id, quantity: 1 },
      ]),
    ).rejects.toThrow("pagos");
    const response = await POST(
      new Request("http://localhost:3200/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          lines: [{ variantId: variant.id, quantity: 1 }],
        }),
      }),
    );
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
