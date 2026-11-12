import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Product } from "../src/features/commerce/domain/catalog";
import { ProductVisual } from "../src/features/commerce/presentation/components/product-visual";
import { ProductGallery } from "../src/features/commerce/presentation/components/product-gallery";
import { ProductCard } from "../src/features/commerce/presentation/components/product-card";

const images = [
  "https://images.example.com/front.png",
  "https://images.example.com/back.png",
  "https://images.example.com/detail.png",
];
const product: Product = {
  id: "prod_test",
  name: "Vestigio",
  description: "",
  image: images[0],
  images,
  category: "Colección",
  colors: [],
  variants: [],
};

describe("fotos individuales de producto", () => {
  it("cada vista utiliza su archivo completo, incluyendo la tercera foto", () => {
    images.forEach((url, imageIndex) => {
      const html = renderToStaticMarkup(
        createElement(ProductVisual, { product, imageIndex }),
      );
      expect(html).toContain(`src="${url}"`);
      expect(html).not.toContain("product-visual--atlas");
    });
  });
  it("ofrece todas las miniaturas y controles anterior/siguiente para tres o más fotos", () => {
    const html = renderToStaticMarkup(
      createElement(ProductGallery, { product }),
    );
    for (const url of images) expect(html).toContain(`src="${url}"`);
    expect(html).toContain('aria-label="Foto anterior"');
    expect(html).toContain('aria-label="Foto siguiente"');
    expect(html).toContain('aria-label="Ver foto 3 de Vestigio"');
    const card = renderToStaticMarkup(
      createElement(ProductCard, { product, onOpen: () => {} }),
    );
    expect(card).toContain("Ver 3 fotos");
  });
  it("con una foto no inventa una vista de espalda", () => {
    const html = renderToStaticMarkup(
      createElement(ProductGallery, {
        product: { ...product, images: [images[0]] },
      }),
    );
    expect(html).toContain(`src="${images[0]}"`);
    expect(html).not.toContain("Espalda");
    expect(html).not.toContain("Foto siguiente");
  });
  it("sin fotos muestra un estado vacío y no solicita imágenes inexistentes", () => {
    const html = renderToStaticMarkup(
      createElement(ProductGallery, {
        product: { ...product, image: "", images: [] },
      }),
    );
    expect(html).toContain("Imagen pendiente");
    expect(html).not.toContain("<img");
  });
});
