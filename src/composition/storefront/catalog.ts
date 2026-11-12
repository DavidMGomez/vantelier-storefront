import { getCommerceProvider } from "./provider";
import {
  catalogFacets,
  filterCatalog,
  type CatalogRequest,
} from "@/features/commerce/domain/catalog-filters";

export async function getCatalogPage(request: CatalogRequest) {
  const provider = getCommerceProvider();
  if (provider.getCatalog) return provider.getCatalog(request);
  const products = filterCatalog(await provider.getProducts(), request.filters);
  return {
    products: products.slice(request.offset, request.offset + request.limit),
    count: products.length,
    offset: request.offset,
    limit: request.limit,
  };
}
export async function getCatalogFacets() {
  const provider = getCommerceProvider();
  if (provider.getFacets) return provider.getFacets();
  return catalogFacets(await provider.getProducts());
}
