import { afterEach, describe, expect, it, vi } from "vitest";
import { createMedusaProvider } from "../src/features/commerce/infrastructure/medusa-provider";
import { loadCatalog } from "../src/features/commerce/infrastructure/browser-catalog";
import {
  catalogParams,
  emptyFilters,
  parseCatalogRequest,
} from "../src/features/commerce/domain/catalog-filters";
import { GET } from "../src/app/api/catalog/route";
const config = {
  backendUrl: "http://127.0.0.1:9000",
  publishableKey: "pk_test",
  regionId: "reg_test",
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("catálogo remoto", () => {
  it("envía filtros y página a Medusa y conserva su total, sin descargar el catálogo entero", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        products: [
          { id: "prod_remote", title: "Resultado remoto", variants: [] },
        ],
        count: 29,
        offset: 12,
        limit: 12,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const request = {
      filters: {
        ...emptyFilters,
        query: "algodón",
        size: "M",
        availableOnly: true,
        typeId: "ptyp_tee",
        sort: "newest" as const,
        maxPrice: "180000",
      },
      offset: 12,
      limit: 12,
    };
    const page = await createMedusaProvider(config).getCatalog(request);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe("/store/vantelier/catalog");
    expect(url.searchParams.get("size")).toBe("M");
    expect(url.searchParams.get("available_only")).toBe("true");
    expect(url.searchParams.get("type_id")).toBe("ptyp_tee");
    expect(url.searchParams.get("region_id")).toBe("reg_test");
    expect(url.searchParams.get("offset")).toBe("12");
    expect(page.count).toBe(29);
    expect(page.products).toHaveLength(1);
    expect(parseCatalogRequest(catalogParams(request))).toEqual(request);
  });
  it("obtiene facetas del backend, independientes de los productos de la página", async () => {
    const facets = {
      collections: [],
      categories: [],
      types: [{ id: "ptyp", value: "Hoodies" }],
      sizes: ["XS", "S", "M"],
      colors: ["Negro"],
      priceCeiling: 250000,
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ facets }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await createMedusaProvider(config).getFacets()).toEqual(facets);
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe(
      "/store/vantelier/catalog/facets",
    );
  });
  it("el navegador solo recibe la página remota y permite cancelar solicitudes anteriores", async () => {
    vi.stubEnv("NEXT_PUBLIC_STATIC_EXPORT", "false");
    const page = { products: [], count: 0, offset: 0, limit: 12 };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(page));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    expect(
      await loadCatalog(
        { filters: emptyFilters, offset: 0, limit: 12 },
        controller.signal,
      ),
    ).toEqual(page);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/catalog?");
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });
  it("la ruta Next rechaza páginas/rangos inválidos sin consultar Medusa", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    for (const query of [
      "offset=-1",
      "limit=100",
      "sort=invalid",
      "min_price=200&max_price=100",
      `q=${"a".repeat(101)}`,
      `size=${"a".repeat(81)}`,
      `color=${"a".repeat(81)}`,
      "min_price=1000000001",
      "max_price=1000000001",
      "available_only=yes",
    ]) {
      expect(
        (await GET(new Request(`http://localhost:3200/api/catalog?${query}`)))
          .status,
      ).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("acepta los límites de Medusa y normaliza la búsqueda antes de enviarla", () => {
    const parsed = parseCatalogRequest(
      new URLSearchParams({
        q: ` ${"a".repeat(100)} `,
        size: "a".repeat(80),
        color: "b".repeat(80),
        max_price: "1000000000",
        available_only: "false",
      }),
    );
    expect(parsed.filters.query).toHaveLength(100);
    expect(parsed.filters.maxPrice).toBe("1000000000");
    expect(parsed.filters.availableOnly).toBe(false);
  });
  it("un fallo remoto se comunica con 502 y no se sustituye por el catálogo demo", async () => {
    vi.stubEnv("GITHUB_PAGES", "false");
    vi.stubEnv("COMMERCE_PROVIDER", "medusa");
    vi.stubEnv("MEDUSA_PUBLISHABLE_KEY", config.publishableKey);
    vi.stubEnv("MEDUSA_REGION_ID", config.regionId);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("internal")));
    const response = await GET(
      new Request("http://localhost:3200/api/catalog"),
    );
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("internal");
  });
});
