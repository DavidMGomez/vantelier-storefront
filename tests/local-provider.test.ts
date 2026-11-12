import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { localProvider } from "../src/features/commerce/infrastructure/local-provider";
import { loadCatalog } from "../src/features/commerce/infrastructure/browser-catalog";
import { emptyFilters } from "../src/features/commerce/domain/catalog-filters";
import { getCommerceProviderName } from "../src/composition/storefront/provider";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("proveedor local para demostración estática", () => {
  it("responde con el mismo contrato paginado, sin duplicados entre páginas", async () => {
    const first = await localProvider.getCatalog({
      filters: emptyFilters,
      offset: 0,
      limit: 12,
    });
    const second = await localProvider.getCatalog({
      filters: emptyFilters,
      offset: 12,
      limit: 12,
    });
    expect(first.count).toBe(16);
    expect(first.products).toHaveLength(12);
    expect(second.products).toHaveLength(4);
    expect(
      new Set([...first.products, ...second.products].map((p) => p.id)).size,
    ).toBe(16);
  });
  it("conserva los 16 diseños originales con archivos independientes de frente y espalda", async () => {
    const products = await localProvider.getProducts();
    expect(products.map((product) => product.id)).toEqual([
      "vestigio",
      "ofrenda",
      "fisura",
      "umbra",
      "herencia",
      "fragmento",
      "tumbaga",
      "memoria",
      "umbral",
      "origen",
      "custodia",
      "estrato",
      "reliquia",
      "latencia",
      "aureo",
      "legado",
    ]);
    const images = products.flatMap((product) => product.images || []);
    expect(new Set(images).size).toBe(32);
    for (const product of products) {
      expect(product).not.toHaveProperty("lookbook");
      expect(product.images).toEqual([
        `/images/products/${product.id}/frente.webp`,
        `/images/products/${product.id}/espalda.webp`,
      ]);
      expect(product.image).toBe(product.images?.[0]);
      expect(product.variants.map((variant) => variant.size)).toEqual([
        "S",
        "M",
        "L",
        "XL",
      ]);
      expect(
        product.variants.every(
          (variant) =>
            variant.available &&
            variant.price === 149000 &&
            variant.currency === "COP",
        ),
      ).toBe(true);
    }
    for (const image of images) {
      expect(existsSync(resolve("public", image.slice(1)))).toBe(true);
    }
  });
  it("consulta categorías, colores, tallas y precio en memoria", async () => {
    const facets = await localProvider.getFacets();
    expect(facets.types).toEqual([]);
    expect(facets.colors).toContain("Negro");
    const result = await localProvider.getCatalog({
      filters: {
        ...emptyFilters,
        categoryId: "local_Mármol",
        color: "Negro",
        size: "S",
        availableOnly: true,
        minPrice: "149000",
        maxPrice: "149000",
      },
      offset: 0,
      limit: 12,
    });
    expect(result.count).toBeGreaterThan(0);
    expect(
      result.products.every((p) =>
        p.variants.some(
          (v) => v.size === "S" && v.color === "Negro" && v.available,
        ),
      ),
    ).toBe(true);
    expect(
      (
        await localProvider.getCatalog({
          filters: { ...emptyFilters, size: "XXL", availableOnly: true },
          offset: 0,
          limit: 12,
        })
      ).count,
    ).toBe(0);
    expect(
      (
        await localProvider.getCatalog({
          filters: { ...emptyFilters, maxPrice: "148000" },
          offset: 0,
          limit: 12,
        })
      ).count,
    ).toBe(0);
  });
  it("Pages fuerza local y funciona sin fetch aunque el entorno indique Medusa", async () => {
    vi.stubEnv("GITHUB_PAGES", "true");
    vi.stubEnv("COMMERCE_PROVIDER", "medusa");
    vi.stubEnv("NEXT_PUBLIC_STATIC_EXPORT", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(getCommerceProviderName()).toBe("local");
    expect(
      (await loadCatalog({ filters: emptyFilters, offset: 12, limit: 12 }))
        .products,
    ).toHaveLength(4);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("protege los fixtures y bloquea pagos", async () => {
    const products = await localProvider.getProducts();
    products[0].variants[0].price = 1;
    expect((await localProvider.getProducts())[0].variants[0].price).toBe(
      149000,
    );
    await expect(
      localProvider.checkout([{ variantId: "vestigio-S", quantity: 1 }]),
    ).rejects.toThrow("demostración");
  });
});
