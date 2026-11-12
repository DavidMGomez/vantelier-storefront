import type {
  CatalogFacets,
  CatalogPage,
  CatalogRequest,
} from "../../domain/catalog-filters";
export interface CatalogReader {
  getCatalog(request: CatalogRequest): Promise<CatalogPage>;
  getFacets(): Promise<CatalogFacets>;
}
