import type { Product, Variant } from "./catalog";

export type CatalogFilters = {
  query: string;
  collectionId: string;
  categoryId: string;
  typeId: string;
  size: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  availableOnly: boolean;
  sort: "catalog" | "price-asc" | "price-desc" | "name" | "newest" | "oldest";
};

export const emptyFilters: CatalogFilters = {
  query: "",
  collectionId: "",
  categoryId: "",
  typeId: "",
  size: "",
  color: "",
  minPrice: "",
  maxPrice: "",
  availableOnly: false,
  sort: "catalog",
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
const priceBound = (value: string) =>
  value.trim() && Number.isFinite(Number(value)) && Number(value) >= 0
    ? Number(value)
    : undefined;

export function invalidPriceRange(filters: CatalogFilters) {
  const min = priceBound(filters.minPrice);
  const max = priceBound(filters.maxPrice);
  return min !== undefined && max !== undefined && min > max;
}

// Talla, color, precio y disponibilidad deben coincidir en LA MISMA variante.
export function matchingVariants(
  product: Product,
  filters: CatalogFilters,
): Variant[] {
  const min = priceBound(filters.minPrice);
  const max = priceBound(filters.maxPrice);
  return product.variants.filter(
    (variant) =>
      (!filters.size || variant.size === filters.size) &&
      (!filters.color || variant.color === filters.color) &&
      (min === undefined || variant.price >= min) &&
      (max === undefined || variant.price <= max) &&
      (!filters.availableOnly || variant.available),
  );
}

export function filterCatalog(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  const words = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
  const variantFilter =
    filters.size ||
    filters.color ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.availableOnly;
  const filtered = products.filter((product) => {
    if (filters.typeId && product.type?.id !== filters.typeId) return false;
    if (filters.collectionId && product.collection?.id !== filters.collectionId)
      return false;
    if (
      filters.categoryId &&
      !product.categories?.some(
        (category) => category.id === filters.categoryId,
      )
    )
      return false;
    const text = normalize(
      `${product.name} ${product.description} ${product.collection?.title || ""} ${product.category} ${(product.categories || []).map((category) => category.name).join(" ")}`,
    );
    if (!words.every((word) => text.includes(word))) return false;
    return !variantFilter || matchingVariants(product, filters).length > 0;
  });
  if (filters.sort === "newest" || filters.sort === "oldest")
    return filtered.sort(
      (a, b) =>
        (Date.parse(a.createdAt || "1970-01-01") -
          Date.parse(b.createdAt || "1970-01-01")) *
        (filters.sort === "newest" ? -1 : 1),
    );
  if (filters.sort === "name")
    return filtered.sort((a, b) => a.name.localeCompare(b.name, "es"));
  if (filters.sort === "price-asc" || filters.sort === "price-desc") {
    const price = (product: Product) => {
      const variants = matchingVariants(product, filters);
      return variants.length
        ? Math.min(...variants.map((variant) => variant.price))
        : undefined;
    };
    return filtered.sort((a, b) => {
      const left = price(a),
        right = price(b);
      if (left === undefined) return right === undefined ? 0 : 1;
      if (right === undefined) return -1;
      return filters.sort === "price-asc" ? left - right : right - left;
    });
  }
  return filtered;
}

export function catalogFacets(products: Product[]) {
  let maximumPrice = 0;
  const collections = new Map<string, NonNullable<Product["collection"]>>();
  const types = new Map<string, { id: string; value: string }>();
  const categories = new Map<string, { id: string; name: string }>();
  const sizes = new Set<string>(),
    colors = new Set<string>();
  for (const product of products) {
    if (product.type) types.set(product.type.id, product.type);
    if (product.collection)
      collections.set(product.collection.id, product.collection);
    for (const category of product.categories || [])
      categories.set(category.id, category);
    for (const variant of product.variants) {
      maximumPrice = Math.max(maximumPrice, variant.price);
      if (variant.size) sizes.add(variant.size);
      if (variant.color) colors.add(variant.color);
    }
  }
  const standardSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  return {
    types: [...types.values()].sort((a, b) =>
      a.value.localeCompare(b.value, "es"),
    ),
    priceCeiling: Math.ceil(maximumPrice / 1000) * 1000,
    collections: [...collections.values()].sort((a, b) =>
      a.title.localeCompare(b.title, "es"),
    ),
    categories: [...categories.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    ),
    sizes: [...sizes].sort((a, b) => {
      const rankA = standardSizes.indexOf(a.toUpperCase()),
        rankB = standardSizes.indexOf(b.toUpperCase());
      return rankA !== -1 && rankB !== -1
        ? rankA - rankB
        : a.localeCompare(b, "es", { numeric: true });
    }),
    colors: [...colors].sort((a, b) => a.localeCompare(b, "es")),
  };
}

export function activeFilterCount(filters: CatalogFilters) {
  return [
    filters.query.trim(),
    filters.collectionId,
    filters.categoryId,
    filters.typeId,
    filters.size,
    filters.color,
    filters.minPrice || filters.maxPrice,
    filters.availableOnly,
  ].filter(Boolean).length;
}

export type CatalogFacets = ReturnType<typeof catalogFacets>;
export type CatalogPage = {
  products: Product[];
  count: number;
  offset: number;
  limit: number;
};
export type CatalogRequest = {
  filters: CatalogFilters;
  offset: number;
  limit: number;
};
export type CatalogLoader = (
  request: CatalogRequest,
  signal?: AbortSignal,
) => Promise<CatalogPage>;

export function catalogParams(request: CatalogRequest): URLSearchParams {
  const { filters } = request;
  const params = new URLSearchParams({
    limit: String(request.limit),
    offset: String(request.offset),
    sort: filters.sort,
  });
  const fields = {
    q: filters.query,
    collection_id: filters.collectionId,
    category_id: filters.categoryId,
    type_id: filters.typeId,
    size: filters.size,
    color: filters.color,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
  };
  for (const [key, value] of Object.entries(fields))
    if (value !== "") params.set(key, value);
  if (filters.availableOnly) params.set("available_only", "true");
  return params;
}

export function parseCatalogRequest(params: URLSearchParams): CatalogRequest {
  const sort = params.get("sort") || "catalog";
  const offset = Number(params.get("offset") || 0),
    limit = Number(params.get("limit") || 12);
  if (
    ![
      "catalog",
      "price-asc",
      "price-desc",
      "name",
      "newest",
      "oldest",
    ].includes(sort) ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 100000 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 48
  )
    throw new Error("Revisa el orden o la página solicitada.");
  const lengthLimits: Record<string, number> = { q: 100, size: 80, color: 80 };
  for (const [key, value] of params)
    if (
      (key === "q" ? value.trim() : value).length > (lengthLimits[key] ?? 120)
    )
      throw new Error("El filtro es demasiado largo.");
  const availability = params.get("available_only");
  if (availability !== null && !["true", "false"].includes(availability))
    throw new Error("Revisa el filtro de disponibilidad.");
  const filters: CatalogFilters = {
    ...emptyFilters,
    query: (params.get("q") || "").trim(),
    collectionId: params.get("collection_id") || "",
    categoryId: params.get("category_id") || "",
    typeId: params.get("type_id") || "",
    size: params.get("size") || "",
    color: params.get("color") || "",
    minPrice: params.get("min_price") || "",
    maxPrice: params.get("max_price") || "",
    availableOnly: availability === "true",
    sort: sort as CatalogFilters["sort"],
  };
  if (
    invalidPriceRange(filters) ||
    [filters.minPrice, filters.maxPrice].some(
      (value) =>
        value !== "" &&
        (!Number.isFinite(Number(value)) ||
          Number(value) < 0 ||
          Number(value) > 1_000_000_000),
    )
  )
    throw new Error("Revisa el rango de precios.");
  return { filters, offset, limit };
}
