"use client";
import { useState } from "react";
import { PriceRange } from "./price-range";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  activeFilterCount,
  emptyFilters,
  invalidPriceRange,
  type CatalogFilters,
  type catalogFacets,
} from "../../domain/catalog-filters";

type Props = {
  facets: ReturnType<typeof catalogFacets>;
  filters: CatalogFilters;
  count: number;
  loading?: boolean;
  onChange: (filters: CatalogFilters) => void;
};

export function CatalogControls({
  facets,
  filters,
  count,
  loading,
  onChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = activeFilterCount(filters);
  const patch = (value: Partial<CatalogFilters>) =>
    onChange({ ...filters, ...value });
  return (
    <>
      <div className="collection-tabs" role="group" aria-label="Colecciones">
        <button
          aria-pressed={!filters.collectionId}
          onClick={() => patch({ collectionId: "" })}
        >
          Todas las piezas
        </button>
        {facets.collections.map((collection) => (
          <button
            key={collection.id}
            aria-pressed={filters.collectionId === collection.id}
            onClick={() => patch({ collectionId: collection.id })}
          >
            {collection.title}
          </button>
        ))}
      </div>
      <div className="collection-toolbar">
        <label className="catalog-search">
          <Search size={17} strokeWidth={1.5} aria-hidden="true" />
          <span className="sr-only">Buscar prendas</span>
          <input
            type="search"
            maxLength={100}
            value={filters.query}
            placeholder="Buscar una prenda"
            onChange={(event) => patch({ query: event.target.value })}
          />
        </label>
        <div className="catalog-actions">
          <label className="availability-toggle">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(event) =>
                patch({ availableOnly: event.target.checked })
              }
            />
            Solo disponibles
          </label>
          <button
            className="filter-toggle"
            aria-expanded={expanded}
            aria-controls="catalog-filters"
            onClick={() => setExpanded(!expanded)}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filtros{activeCount > 0 && <span>({activeCount})</span>}
          </button>
        </div>
      </div>
      <div
        id="catalog-filters"
        className="catalog-filter-panel"
        hidden={!expanded}
      >
        {facets.categories.length > 0 && (
          <label>
            Categoría
            <select
              value={filters.categoryId}
              onChange={(event) => patch({ categoryId: event.target.value })}
            >
              <option value="">Todas</option>
              {facets.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {facets.types.length > 0 && (
          <label>
            Tipo de prenda
            <select
              value={filters.typeId}
              onChange={(event) => patch({ typeId: event.target.value })}
            >
              <option value="">Todos los tipos</option>
              {facets.types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.value}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Talla
          <select
            value={filters.size}
            onChange={(event) => patch({ size: event.target.value })}
          >
            <option value="">Todas las tallas</option>
            {facets.sizes.map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
        {facets.colors.length > 0 && (
          <label>
            Color
            <select
              value={filters.color}
              onChange={(event) => patch({ color: event.target.value })}
            >
              <option value="">Todos los colores</option>
              {facets.colors.map((color) => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </label>
        )}
        <PriceRange
          ceiling={facets.priceCeiling}
          minimum={filters.minPrice}
          maximum={filters.maxPrice}
          onChange={patch}
        />
        {invalidPriceRange(filters) && (
          <p className="filter-error" id="price-range-error" role="alert">
            El precio mínimo debe ser menor o igual al máximo.
          </p>
        )}
      </div>
      <div className="catalog-results-bar">
        <span className="product-count" role="status">
          {loading
            ? "Actualizando catálogo…"
            : `${count} ${count === 1 ? "diseño" : "diseños"}`}
          {filters.size && ` · Talla ${filters.size}`}
          {filters.color && ` · ${filters.color}`}
        </span>
        {activeCount > 0 && (
          <button
            className="clear-filters"
            onClick={() => onChange(emptyFilters)}
          >
            Limpiar filtros
            <X size={14} aria-hidden="true" />
          </button>
        )}
        <label className="catalog-sort">
          <span>Ordenar</span>
          <select
            value={filters.sort}
            onChange={(event) =>
              patch({ sort: event.target.value as CatalogFilters["sort"] })
            }
          >
            <option value="catalog">Catálogo</option>
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre: A–Z</option>
          </select>
        </label>
      </div>
    </>
  );
}
