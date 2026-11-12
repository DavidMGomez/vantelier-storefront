import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  availabilityLabel,
  productPrice,
  type Product,
} from "../src/features/commerce/domain/catalog";
import {
  catalogFacets,
  emptyFilters,
  filterCatalog,
  invalidPriceRange,
} from "../src/features/commerce/domain/catalog-filters";
import { ProductCard } from "../src/features/commerce/presentation/components/product-card";

const product: Product = {
  id: "vestigio",
  name: "Vestigio",
  description: "Algodón amplio",
  image: "",
  colors: [],
  category: "Mármol",
  collection: { id: "col_relicario", title: "Relicario", handle: "relicario" },
  categories: [
    { id: "cat_tee", name: "Camisetas" },
    { id: "cat_oversize", name: "Oversize" },
  ],
  variants: [
    {
      id: "s",
      title: "S / Negro",
      size: "S",
      color: "Negro",
      price: 149000,
      currency: "COP",
      available: true,
    },
    {
      id: "m",
      title: "M / Blanco",
      size: "M",
      color: "Blanco",
      price: 159000,
      currency: "COP",
      available: false,
    },
  ],
};
const soldOut: Product = {
  ...product,
  id: "aureo",
  name: "Áureo",
  collection: undefined,
  variants: product.variants.map((variant) => ({
    ...variant,
    available: false,
  })),
};

describe("catálogo y disponibilidad", () => {
  it("muestra agotados por defecto y permite ocultarlos", () => {
    expect(filterCatalog([product, soldOut], emptyFilters)).toHaveLength(2);
    expect(
      filterCatalog([product, soldOut], {
        ...emptyFilters,
        availableOnly: true,
      }),
    ).toEqual([product]);
    expect(availabilityLabel(soldOut.variants)).toBe("Agotado");
    expect(availabilityLabel(product.variants)).toBe("Disponible");
  });
  it("talla y disponibilidad deben coincidir: stock S no habilita M", () => {
    expect(filterCatalog([product], { ...emptyFilters, size: "M" })).toEqual([
      product,
    ]);
    expect(
      filterCatalog([product], {
        ...emptyFilters,
        size: "M",
        availableOnly: true,
      }),
    ).toEqual([]);
    expect(
      filterCatalog([product], {
        ...emptyFilters,
        size: "S",
        availableOnly: true,
      }),
    ).toEqual([product]);
  });
  it("no combina el precio, talla y color de variantes distintas", () => {
    expect(
      filterCatalog([product], { ...emptyFilters, size: "S", color: "Blanco" }),
    ).toEqual([]);
    expect(
      filterCatalog([product], {
        ...emptyFilters,
        size: "S",
        minPrice: "150000",
      }),
    ).toEqual([]);
    expect(
      filterCatalog([product], {
        ...emptyFilters,
        size: "M",
        maxPrice: "150000",
      }),
    ).toEqual([]);
  });
  it("filtra por ID de colección y admite productos sin colección", () => {
    expect(
      filterCatalog([product, soldOut], {
        ...emptyFilters,
        collectionId: "col_relicario",
      }),
    ).toEqual([product]);
    expect(
      filterCatalog([product], {
        ...emptyFilters,
        collectionId: "col_deleted",
      }),
    ).toEqual([]);
  });
  it("permite pertenecer a varias categorías y buscar sin acentos", () => {
    expect(
      filterCatalog([product], {
        ...emptyFilters,
        categoryId: "cat_oversize",
        query: "algodon marmol",
      }),
    ).toEqual([product]);
    expect(
      filterCatalog([soldOut], { ...emptyFilters, query: "aureo" }),
    ).toEqual([soldOut]);
  });
  it("ordena por precio mínimo real, pone productos sin precio al final y no muta la entrada", () => {
    const cheap = {
      ...product,
      id: "cheap",
      variants: [{ ...product.variants[0], price: 99000 }],
    };
    const noPrice = { ...product, id: "no_price", variants: [] };
    const input = [noPrice, product, cheap];
    expect(
      filterCatalog(input, { ...emptyFilters, sort: "price-asc" }).map(
        (p) => p.id,
      ),
    ).toEqual(["cheap", "vestigio", "no_price"]);
    expect(
      filterCatalog(input, { ...emptyFilters, sort: "price-desc" }).map(
        (p) => p.id,
      ),
    ).toEqual(["vestigio", "cheap", "no_price"]);
    expect(input.map((p) => p.id)).toEqual(["no_price", "vestigio", "cheap"]);
    expect(productPrice(product.variants)).toMatch(/^Desde/);
  });
  it("genera opciones únicas desde los datos y ordena las tallas", () => {
    const facets = catalogFacets([
      product,
      soldOut,
      { ...product, variants: [...product.variants].reverse() },
    ]);
    expect(facets.collections).toEqual([product.collection]);
    expect(facets.categories).toHaveLength(2);
    expect(facets.priceCeiling).toBe(159000);
    expect(facets.sizes).toEqual(["S", "M"]);
    expect(facets.colors).toEqual(["Blanco", "Negro"]);
  });
  it("un rango invertido no ofrece resultados y permite mostrar un error", () => {
    const filters = { ...emptyFilters, minPrice: "160000", maxPrice: "140000" };
    expect(invalidPriceRange(filters)).toBe(true);
    expect(filterCatalog([product], filters)).toEqual([]);
    expect(invalidPriceRange(emptyFilters)).toBe(false);
  });
  it("distingue pedidos pendientes de stock y productos sin precio publicable", () => {
    expect(
      availabilityLabel([{ ...product.variants[0], backorder: true }]),
    ).toBe("Bajo pedido");
    expect(availabilityLabel([])).toBe("Próximamente");
  });
  it("la tarjeta comunica agotado sin impedir consultar la prenda", () => {
    const html = renderToStaticMarkup(
      createElement(ProductCard, { product: soldOut, onOpen: () => {} }),
    );
    expect(html).toContain("Agotado");
    expect(html).toContain('aria-label="Ver Áureo"');
    expect(html).not.toContain("disabled");
  });
});
