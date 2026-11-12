import type { CatalogReader } from "./catalog-reader";
import type { CartLine, Product } from "../../domain/catalog";
export interface CommerceProvider extends Partial<CatalogReader> {
  getProducts(): Promise<Product[]>;
  checkout(lines: CartLine[]): Promise<string>;
}
