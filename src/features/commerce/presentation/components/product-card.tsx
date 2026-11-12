"use client";
import { useState } from "react";
import { formatMoney, type Product } from "../../domain/catalog";
import { ProductVisual, type ProductView } from "./product-visual";
export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  const [view, setView] = useState<ProductView>("front");
  const [hovered, setHovered] = useState(false);
  const shownView =
    hovered && product.lookbook ? (view === "front" ? "back" : "front") : view;
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
        <ProductVisual product={product} view={shownView} />
        <span className="product-plus">+</span>
      </button>
      {product.lookbook && (
        <div className="view-switch" aria-label={`Vista de ${product.name}`}>
          <button
            aria-pressed={view === "front"}
            onClick={() => setView("front")}
          >
            Frente
          </button>
          <button
            aria-pressed={view === "back"}
            onClick={() => setView("back")}
          >
            Espalda
          </button>
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
