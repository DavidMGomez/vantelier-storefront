/* eslint-disable @next/next/no-img-element */
import type { Product } from "../../domain/catalog";
import type { CSSProperties } from "react";
import { publicPath } from "@/shared/config/public-path";
export function productImageCount(product: Product) {
  if (product.lookbook) return 2;
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
  const atlas = product.lookbook;
  const photos = product.images?.length ? product.images : [product.image];
  const src = atlas?.src || photos[imageIndex] || photos[0];
  if (!src)
    return (
      <span
        className="product-visual product-visual--empty"
        role="img"
        aria-label={`${product.name}, imagen pendiente`}
      >
        Imagen pendiente
      </span>
    );
  const style = atlas
    ? ({
        "--lookbook-column": atlas.column,
        "--lookbook-row": imageIndex === 1 ? 1 : 0,
      } as CSSProperties)
    : undefined;
  return (
    <span
      className={
        atlas ? "product-visual product-visual--atlas" : "product-visual"
      }
      style={style}
    >
      <img
        src={publicPath(src)}
        alt={
          productImageCount(product) > 1
            ? `${product.name}, ${productImageLabel(imageIndex).toLowerCase()}`
            : product.name
        }
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        width={atlas ? 1536 : 600}
        height={atlas ? 1024 : 800}
      />
    </span>
  );
}
