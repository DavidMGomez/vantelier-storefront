"use client";
import { useState } from "react";
import { formatMoney, type Product } from "../../domain/catalog";
import { ProductVisual, productImageCount } from "./product-visual";
export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const imageCount = productImageCount(product);
  const shownImage =
    hovered && imageCount > 1 ? (imageIndex === 0 ? 1 : 0) : imageIndex;
  return (
    <article className="product">
      <button
        className="product-image"
        onClick={onOpen}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        aria-label={`Ver ${product.name}`}
      >
        <ProductVisual product={product} imageIndex={shownImage} />
        <span className="product-plus">+</span>
      </button>
      {imageCount > 1 && (
        <div className="view-switch" aria-label={`Vista de ${product.name}`}>
          <button
            aria-pressed={imageIndex === 0}
            onClick={() => setImageIndex(0)}
          >
            Frente
          </button>
          <button
            aria-pressed={imageIndex === 1}
            onClick={() => setImageIndex(1)}
          >
            Espalda
          </button>
          {imageCount > 2 && (
            <button onClick={onOpen}>Ver {imageCount} fotos</button>
          )}
        </div>
      )}
      <div className="product-info">
        <h3>
          <button onClick={onOpen}>{product.name}</button>
        </h3>
        <span>
          {product.variants[0]
            ? formatMoney(
                product.variants[0].price,
                product.variants[0].currency,
              )
            : "Próximamente"}
        </span>
      </div>
      <div className="swatches" aria-label="Color de la prenda">
        {product.colors.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </div>
    </article>
  );
}
