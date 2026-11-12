import type { CommerceProvider } from "../application/ports/commerce-provider";
import type { CatalogReader } from "../application/ports/catalog-reader";
import type { Product } from "../domain/catalog";
import { catalogFacets, filterCatalog } from "../domain/catalog-filters";
import catalog from "./data/catalog.json";

// Fixtures independientes de Medusa. No representan inventario ni ventas reales.
const localProducts: Product[] = catalog;

export const localProvider: CommerceProvider & CatalogReader = {
  async getProducts() {
    return structuredClone(localProducts);
  },
  async getFacets() {
    return structuredClone(catalogFacets(localProducts));
  },
  async getCatalog(request) {
    const products = filterCatalog(localProducts, request.filters);
    return structuredClone({
      products: products.slice(request.offset, request.offset + request.limit),
      count: products.length,
      offset: request.offset,
      limit: request.limit,
    });
  },
  async checkout() {
    throw new Error(
      "Esta es una demostración. Los pagos aún no están habilitados.",
    );
  },
};
