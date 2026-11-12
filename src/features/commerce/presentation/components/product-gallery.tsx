"use client";
import { useState } from "react";
import type { Product } from "../../domain/catalog";
import { ProductVisual, type ProductView } from "./product-visual";
export function ProductGallery({ product }: { product: Product }) {
  const [view, setView] = useState<ProductView>("front");
  return (
    <div className="product-gallery">
      <ProductVisual product={product} view={view} eager />
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
    </div>
  );
}
