"use client";
import { useId } from "react";
import { formatMoney } from "../../domain/catalog";

export function PriceRange({
  ceiling,
  minimum,
  maximum,
  onChange,
}: {
  ceiling: number;
  minimum: string;
  maximum: string;
  onChange: (value: { minPrice: string; maxPrice: string }) => void;
}) {
  const id = useId();
  const limit = Math.max(1000, ceiling);
  const min = minimum === "" ? 0 : Number(minimum);
  const max = maximum === "" ? limit : Number(maximum);
  const update = (lower: number, upper: number) =>
    onChange({
      minPrice: lower === 0 ? "" : String(lower),
      maxPrice: upper === limit ? "" : String(upper),
    });
  return (
    <fieldset className="price-range" disabled={ceiling === 0}>
      <legend>Precio (COP)</legend>
      <div className="price-range-values">
        <label htmlFor={`${id}-min`}>
          Desde <output>{formatMoney(min)}</output>
        </label>
        <label htmlFor={`${id}-max`}>
          Hasta <output>{formatMoney(max)}</output>
        </label>
      </div>
      <div className="price-range-controls">
        <div className="price-range-track" aria-hidden="true">
          <span
            style={{
              left: `${(min / limit) * 100}%`,
              right: `${100 - (max / limit) * 100}%`,
            }}
          />
        </div>
        <input
          id={`${id}-min`}
          type="range"
          aria-label="Precio mínimo"
          aria-valuetext={formatMoney(min)}
          min={0}
          max={limit}
          step={1000}
          value={min}
          style={{ zIndex: min > limit / 2 ? 3 : 1 }}
          onChange={(event) =>
            update(Math.min(Number(event.target.value), max), max)
          }
        />
        <input
          id={`${id}-max`}
          type="range"
          aria-label="Precio máximo"
          aria-valuetext={formatMoney(max)}
          min={0}
          max={limit}
          step={1000}
          value={max}
          onChange={(event) =>
            update(min, Math.max(Number(event.target.value), min))
          }
        />
      </div>
    </fieldset>
  );
}
