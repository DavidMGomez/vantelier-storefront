"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  availabilityLabel,
  productPrice,
  type Product,
  type Variant,
} from "../../domain/catalog";
import { ProductVisual, productImageCount } from "./product-visual";
export function ProductCard({
  product,
  visibleVariants = product.variants,
  selectedSize,
  onOpen,
}: {
  product: Product;
  visibleVariants?: Variant[];
  selectedSize?: string;
  onOpen: () => void;
}) {
  const availability = availabilityLabel(visibleVariants);
  const [imageIndex, setImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const imageCount = productImageCount(product);
  const shownImage =
    hovered && imageCount > 1 ? (imageIndex === 0 ? 1 : 0) : imageIndex;
  return (
    <article
      className={`product${availability === "Agotado" ? " product--sold-out" : ""}`}
    >
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
        {availability !== "Disponible" && (
          <span className="stock-badge">
            {availability}
            {selectedSize && availability === "Agotado"
              ? ` · ${selectedSize}`
              : ""}
          </span>
        )}
        <span className="product-plus">
          <Plus size={19} strokeWidth={1.5} aria-hidden="true" />
        </span>
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
        <span>{productPrice(visibleVariants)}</span>
      </div>
      <div className="product-meta">
        <span>
          {product.categories?.map((category) => category.name).join(" / ") ||
            product.category}
        </span>
        <div className="swatches" aria-label="Color de la prenda">
          {product.colors.map((color) => (
            <span key={color} style={{ background: color }} />
          ))}
        </div>
      </div>
    </article>
  );
}
