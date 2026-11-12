import type { CommerceProvider } from "../application/ports/commerce-provider";
import type { Product } from "../domain/catalog";
type ShopifyProduct = {
  id: string;
  title: string;
  description: string;
  productType: string;
  featuredImage: { url: string } | null;
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      price: { amount: string; currencyCode: string };
    }[];
  };
};
export function createShopifyProvider(config: {
  domain: string;
  token: string;
  version: string;
}): CommerceProvider {
  if (
    !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(config.domain) ||
    !config.token ||
    !/^\d{4}-\d{2}$/.test(config.version)
  )
    throw new Error("Configuración de Shopify incompleta.");
  async function query<T>(query: string, variables: object = {}): Promise<T> {
    const response = await fetch(
      `https://${config.domain}/api/${config.version}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": config.token,
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!response.ok)
      throw new Error("No pudimos conectar con la tienda. Intenta de nuevo.");
    const result = await response.json();
    if (result.errors || !result.data)
      throw new Error("La tienda no pudo completar la solicitud.");
    return result.data as T;
  }
  return {
    async getProducts(): Promise<Product[]> {
      const data = await query<{ products: { nodes: ShopifyProduct[] } }>(
        `query { products(first: 24) { nodes { id title description productType featuredImage { url } variants(first: 100) { nodes { id title availableForSale price { amount currencyCode } } } } } }`,
      );
      return data.products.nodes.map((p) => ({
        id: p.id,
        name: p.title,
        description: p.description,
        category: p.productType || "Essentials",
        image: p.featuredImage?.url || "/product-placeholder.svg",
        colors: [],
        variants: p.variants.nodes.map((v) => ({
          id: v.id,
          title: v.title,
          available: v.availableForSale,
          price: Number(v.price.amount),
          currency: v.price.currencyCode,
        })),
      }));
    },
    async checkout(lines) {
      const data = await query<{
        cartCreate: {
          cart: { checkoutUrl: string } | null;
          userErrors: { message: string }[];
        };
      }>(
        `mutation Cart($input: CartInput!) { cartCreate(input: $input) { cart { checkoutUrl } userErrors { message } } }`,
        {
          input: {
            lines: lines.map((l) => ({
              merchandiseId: l.variantId,
              quantity: l.quantity,
            })),
          },
        },
      );
      if (data.cartCreate.userErrors.length || !data.cartCreate.cart)
        throw new Error(
          "Revisa la disponibilidad de tus artículos e intenta de nuevo.",
        );
      const url = new URL(data.cartCreate.cart.checkoutUrl);
      if (url.protocol !== "https:")
        throw new Error("Dirección de pago inválida.");
      return url.href;
    },
  };
}
