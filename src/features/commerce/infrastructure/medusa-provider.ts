import type { CommerceProvider } from "../application/ports/commerce-provider";
import type { Product, Variant } from "../domain/catalog";

type MedusaVariant = {
  id: string;
  title?: string;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
  inventory_quantity?: number;
  options?: { value: string; option_id?: string; option?: { title: string } }[];
  calculated_price?: {
    calculated_amount?: number | null;
    currency_code?: string;
  } | null;
};
type MedusaProduct = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: { url: string }[];
  metadata?: Record<string, unknown> | null;
  variants?: MedusaVariant[];
  collection?: { id: string; title: string; handle: string } | null;
  categories?: {
    id: string;
    name: string;
    is_active?: boolean;
    is_internal?: boolean;
  }[];
  options?: { id: string; title: string }[];
};
type Config = { backendUrl: string; publishableKey: string; regionId: string };

export function createMedusaProvider(config: Config): CommerceProvider {
  let backend: URL;
  try {
    backend = new URL(config.backendUrl);
  } catch {
    throw new Error("Configura MEDUSA_BACKEND_URL en .env.local.");
  }
  if (
    !["http:", "https:"].includes(backend.protocol) ||
    backend.username ||
    backend.password ||
    backend.search ||
    backend.hash
  )
    throw new Error(
      "MEDUSA_BACKEND_URL debe ser HTTP(S), sin credenciales ni parámetros.",
    );
  if (!config.publishableKey.startsWith("pk_"))
    throw new Error(
      "Configura MEDUSA_PUBLISHABLE_KEY con la clave pública de Vantelier Storefront.",
    );
  if (!config.regionId.startsWith("reg_"))
    throw new Error("Configura MEDUSA_REGION_ID con la región Colombia.");
  const base = backend.toString().replace(/\/+$/, "");

  return {
    async getProducts() {
      const products: Product[] = [];
      const seen = new Set<string>();
      for (let offset = 0; ; ) {
        const params = new URLSearchParams({
          region_id: config.regionId,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+metadata,*collection,*categories,*options,*variants.options",
          limit: "100",
          offset: String(offset),
          order: "id",
        });
        let response: Response;
        try {
          response = await fetch(`${base}/store/products?${params}`, {
            headers: { "x-publishable-api-key": config.publishableKey },
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
          });
        } catch {
          throw new Error(
            "No se pudo conectar con Medusa. Comprueba que el backend esté activo.",
          );
        }
        if (!response.ok)
          throw new Error(
            `Medusa devolvió HTTP ${response.status}. Revisa la clave pública, su canal y la región.`,
          );
        const page = (await response.json()) as {
          products: MedusaProduct[];
          count: number;
        };
        if (
          !Array.isArray(page.products) ||
          !Number.isInteger(page.count) ||
          page.count < 0
        )
          throw new Error("Medusa devolvió un catálogo inválido.");
        if (!page.products.length && offset < page.count)
          throw new Error(
            "Medusa devolvió una página incompleta del catálogo.",
          );
        for (const product of page.products) {
          if (
            !product?.id ||
            typeof product.title !== "string" ||
            seen.has(product.id)
          )
            throw new Error("Medusa devolvió productos inválidos o repetidos.");
          seen.add(product.id);
          products.push(mapProduct(product));
        }
        offset += page.products.length;
        if (offset >= page.count) return products;
      }
    },
    async checkout() {
      throw new Error(
        "La tienda está en preparación. Los pagos aún no están habilitados.",
      );
    },
  };
}

function mapProduct(product: MedusaProduct): Product {
  const metadata = product.metadata || {};
  const images = [
    ...new Set(
      [
        imageUrl(product.thumbnail),
        ...(product.images || []).map((image) => imageUrl(image.url)),
      ].filter(Boolean),
    ),
  ];
  return {
    id: product.id,
    name: product.title,
    description: product.description || "",
    image: images[0] || "",
    images,
    collection: product.collection
      ? {
          id: product.collection.id,
          title: product.collection.title,
          handle: product.collection.handle,
        }
      : undefined,
    categories: (product.categories || [])
      .filter(
        (category) =>
          category.is_active !== false && category.is_internal !== true,
      )
      .map(({ id, name }) => ({ id, name })),
    category:
      typeof metadata.category === "string" ? metadata.category : "Colección",
    colors: Array.isArray(metadata.colors)
      ? metadata.colors.filter(
          (c): c is string =>
            typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c),
        )
      : [],
    variants: (product.variants || []).flatMap((variant): Variant[] => {
      const price = variant.calculated_price;
      // Sin precio COP no hay una variante comprable; nunca inventar un precio cero.
      if (
        !variant.id ||
        price?.currency_code?.toLowerCase() !== "cop" ||
        typeof price.calculated_amount !== "number" ||
        !Number.isFinite(price.calculated_amount) ||
        price.calculated_amount < 0
      )
        return [];
      return [
        {
          id: variant.id,
          title: variant.title || "Única",
          price: price.calculated_amount,
          currency: "COP",
          ...variantOptions(variant, product),
          ...(variant.allow_backorder &&
          variant.manage_inventory !== false &&
          !(variant.inventory_quantity && variant.inventory_quantity > 0)
            ? { backorder: true }
            : {}),
          available:
            variant.manage_inventory === false ||
            variant.allow_backorder === true ||
            (typeof variant.inventory_quantity === "number" &&
              variant.inventory_quantity > 0),
        },
      ];
    }),
  };
}

function variantOptions(variant: MedusaVariant, product: MedusaProduct) {
  const result: { size?: string; color?: string } = {};
  for (const option of variant.options || []) {
    const title = (
      option.option?.title ||
      product.options?.find((item) => item.id === option.option_id)?.title ||
      ""
    )
      .trim()
      .toLowerCase();
    if (["talla", "size", "tamaño"].includes(title)) result.size = option.value;
    if (["color", "colour"].includes(title)) result.color = option.value;
  }
  return result;
}

function imageUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? value
      : "";
  } catch {
    return "";
  }
}
