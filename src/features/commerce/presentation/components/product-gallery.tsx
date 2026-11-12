"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Product } from "../../domain/catalog";
import {
  ProductVisual,
  productImageCount,
  productImageLabel,
} from "./product-visual";
export function ProductGallery({ product }: { product: Product }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageCount = productImageCount(product);
  const current = Math.min(imageIndex, Math.max(0, imageCount - 1));
  return (
    <div className="product-gallery">
      <ProductVisual product={product} imageIndex={current} eager />
      {imageCount > 1 && (
        <>
          <div className="gallery-controls">
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() =>
                setImageIndex((current + imageCount - 1) % imageCount)
              }
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span aria-live="polite">
              {productImageLabel(current)} · {current + 1} / {imageCount}
            </span>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => setImageIndex((current + 1) % imageCount)}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div
            className="gallery-thumbnails"
            aria-label={`Fotos de ${product.name}`}
          >
            {Array.from({ length: imageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ver ${productImageLabel(index).toLowerCase()} de ${product.name}`}
                aria-pressed={current === index}
                onClick={() => setImageIndex(index)}
              >
                <ProductVisual product={product} imageIndex={index} />
                <span>{productImageLabel(index)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
