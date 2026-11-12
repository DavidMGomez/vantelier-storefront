import type { Product, Variant } from "./catalog";

export type CatalogFilters = {
  query: string;
  collectionId: string;
  categoryId: string;
  size: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  availableOnly: boolean;
  sort: "catalog" | "price-asc" | "price-desc" | "name";
};

export const emptyFilters: CatalogFilters = {
  query: "",
  collectionId: "",
  categoryId: "",
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
  const categories = new Map<string, { id: string; name: string }>();
  const sizes = new Set<string>(),
    colors = new Set<string>();
  for (const product of products) {
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
    filters.size,
    filters.color,
    filters.minPrice || filters.maxPrice,
    filters.availableOnly,
  ].filter(Boolean).length;
}
