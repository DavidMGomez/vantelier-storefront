/* eslint-disable @next/next/no-img-element */
import type { Product } from "../../domain/catalog";
import type { CSSProperties } from "react";
import { publicPath } from "@/shared/config/public-path";
export type ProductView = "front" | "back";
export function ProductVisual({
  product,
  view = "front",
  eager = false,
}: {
  product: Product;
  view?: ProductView;
  eager?: boolean;
}) {
  const atlas = product.lookbook;
  if (!product.image)
    return (
      <span
        className="product-visual"
        role="img"
        aria-label={`${product.name}, imagen pendiente`}
      />
    );
  const style = atlas
    ? ({
        "--lookbook-column": atlas.column,
        "--lookbook-row": view === "front" ? 0 : 1,
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
        src={publicPath(atlas?.src || product.image)}
        alt={`${product.name}, vista ${view === "front" ? "de frente" : "de espalda"}`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        width={atlas ? 1536 : 600}
        height={atlas ? 1024 : 800}
      />
    </span>
  );
}
