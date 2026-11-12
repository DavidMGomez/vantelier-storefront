import type { CartLine, Product } from "../../domain/catalog";
export interface CommerceProvider {
  getProducts(): Promise<Product[]>;
  checkout(lines: CartLine[]): Promise<string>;
}
