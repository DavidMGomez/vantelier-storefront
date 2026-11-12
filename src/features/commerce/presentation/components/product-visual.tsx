/* eslint-disable @next/next/no-img-element */
import { BrandSymbol } from "./brand-wordmark";
import type { Product } from "../../domain/catalog";
import { publicPath } from "@/shared/config/public-path";
export function productImageCount(product: Product) {
  return product.images?.length || (product.image ? 1 : 0);
}
export function productImageLabel(index: number) {
  return index === 0 ? "Frente" : index === 1 ? "Espalda" : `Foto ${index + 1}`;
}
export function ProductVisual({
  product,
  imageIndex = 0,
  eager = false,
}: {
  product: Product;
  imageIndex?: number;
  eager?: boolean;
}) {
  const photos = product.images?.length ? product.images : [product.image];
  const src = photos[imageIndex] || photos[0];
  if (!src)
    return (
      <span
        className="product-visual product-visual--empty"
        role="img"
        aria-label={`${product.name}, imagen pendiente`}
      >
        <BrandSymbol className="product-placeholder-mark" />
        <span>Imagen pendiente</span>
      </span>
    );
  return (
    <span className="product-visual">
      <img
        src={publicPath(src)}
        alt={
          productImageCount(product) > 1
            ? `${product.name}, ${productImageLabel(imageIndex).toLowerCase()}`
            : product.name
        }
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        width={600}
        height={800}
      />
    </span>
  );
}
