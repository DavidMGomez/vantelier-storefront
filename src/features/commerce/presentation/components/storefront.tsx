"use client";
import { useState } from "react";
import Link from "next/link";
import { Hero } from "./hero";
import { CatalogControls } from "./catalog-controls";
import {
  activeFilterCount,
  catalogFacets,
  emptyFilters,
  filterCatalog,
  matchingVariants,
} from "../../domain/catalog-filters";
import { ArrowRight, ArrowUpRight, ShoppingBag } from "lucide-react";
import { BrandSymbol, BrandWordmark } from "./brand-wordmark";
import { ProductCard } from "./product-card";
import { ProductGallery } from "./product-gallery";
import { ProductVisual } from "./product-visual";
import type { CartLine, Product } from "../../domain/catalog";
import { availabilityLabel, formatMoney } from "../../domain/catalog";
import { Modal } from "@/shared/ui/modal";
export function Storefront({
  products,
  checkout,
  checkoutEnabled,
}: {
  products: Product[];
  checkout: (lines: CartLine[]) => Promise<string>;
  checkoutEnabled: boolean;
}) {
  const [filters, setFilters] = useState(emptyFilters);
  const [selected, setSelected] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const facets = catalogFacets(products);
  const collection = facets.collections.find(
    (item) => item.id === filters.collectionId,
  );
  const collectionTitle =
    collection?.title ||
    (facets.collections.length === 1
      ? facets.collections[0].title
      : "Las piezas");
  const items = cart.flatMap((line) => {
    const product = products.find((p) =>
      p.variants.some((v) => v.id === line.variantId),
    );
    const variant = product?.variants.find((v) => v.id === line.variantId);
    return product && variant ? [{ ...line, product, variant }] : [];
  });
  const total = items.reduce(
    (sum, line) => sum + line.quantity * line.variant.price,
    0,
  );
  const currencies = new Set(items.map((line) => line.variant.currency));
  const filteredProducts = filterCatalog(products, filters);
  const selectedVariant =
    selected?.variants.find((variant) => variant.id === variantId) ||
    selected?.variants[0];
  function openProduct(product: Product) {
    setSelected(product);
    const matches = matchingVariants(product, {
      ...filters,
      availableOnly: false,
    });
    setVariantId(
      (
        matches.find((variant) => variant.available) ||
        matches[0] ||
        product.variants[0]
      )?.id || "",
    );
    setNotice("");
  }
  function add() {
    if (!selected?.variants.some((v) => v.id === variantId && v.available))
      return;
    setCart((previous) => {
      const existing = previous.find((l) => l.variantId === variantId);
      return existing
        ? previous.map((l) =>
            l.variantId === variantId
              ? { ...l, quantity: Math.min(l.quantity + 1, 10) }
              : l,
          )
        : [...previous, { variantId, quantity: 1 }];
    });
    setNotice("Agregado a tu bolsa");
    setSelected(null);
    setCartOpen(true);
    setError("");
  }
  async function pay() {
    if (!checkoutEnabled) return;
    setBusy(true);
    setError("");
    try {
      window.location.assign(await checkout(cart));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Intenta de nuevo.");
      setBusy(false);
    }
  }
  return (
    <>
      <a className="skip-link" href="#coleccion">
        Ir a la colección
      </a>
      <header className="header">
        <nav aria-label="Principal">
          <a href="#coleccion" onClick={() => setFilters(emptyFilters)}>
            Colecciones
          </a>
          <a href="#universo">Universo</a>
        </nav>
        <Link className="wordmark" href="/" aria-label="Vantelier, inicio">
          <BrandWordmark />
        </Link>
        <button
          className="bag-button"
          onClick={() => {
            setCartOpen(true);
            setError("");
          }}
          aria-label={`Abrir bolsa, ${cart.reduce((sum, line) => sum + line.quantity, 0)} artículos`}
        >
          <span className="bag-label">Bolsa</span>
          <ShoppingBag size={19} strokeWidth={1.5} aria-hidden="true" />
          <span className="bag-count">
            ({cart.reduce((sum, line) => sum + line.quantity, 0)})
          </span>
        </button>
      </header>
      <main>
        <Hero
          onDiscover={() =>
            setFilters({
              ...emptyFilters,
              collectionId:
                facets.collections.find(
                  (item) => item.handle.toLowerCase() === "relicario",
                )?.id || "",
            })
          }
        />
        <section id="coleccion" className="collection">
          <div className="section-heading">
            <div>
              <h2>{collectionTitle}</h2>
              <p>El pasado deja huella. Tú le das otra forma.</p>
            </div>
            <span className="collection-edition">
              Vantelier · Oversized fit
            </span>
          </div>
          <CatalogControls
            facets={facets}
            filters={filters}
            count={filteredProducts.length}
            onChange={setFilters}
          />
          <div className="collection-layout">
            <div className="product-grid">
              {filteredProducts.length === 0 && (
                <div className="catalog-empty">
                  <h3>
                    {products.length === 0
                      ? "Las próximas piezas están en camino."
                      : "No encontramos prendas con estos filtros."}
                  </h3>
                  <p>
                    {filters.availableOnly
                      ? "Prueba otra talla o explora también los diseños agotados."
                      : "Puedes probar otra búsqueda o volver al catálogo completo."}
                  </p>
                  {activeFilterCount(filters) > 0 && (
                    <button
                      className="text-link"
                      onClick={() => setFilters(emptyFilters)}
                    >
                      Ver todas las piezas{" "}
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  visibleVariants={matchingVariants(product, filters)}
                  selectedSize={filters.size}
                  onOpen={() => openProduct(product)}
                />
              ))}
            </div>
          </div>
        </section>
        <section
          id="universo"
          className="manifesto"
          aria-labelledby="manifesto-title"
        >
          <div className="manifesto-seal" aria-hidden="true">
            <BrandSymbol />
            <span>Vantelier · Relicario</span>
          </div>
          <div className="manifesto-copy">
            <h2 id="manifesto-title">
              SE TRATA
              <br />
              DE SER.
            </h2>
            <p>
              Siluetas amplias, una mirada urbana y atención a los detalles. Esa
              es nuestra forma de hacer streetwear.
            </p>
            <button className="text-link" onClick={() => setAbout(true)}>
              Conoce Vantelier <ArrowUpRight size={18} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-top">
          <p>Wear your own way.</p>
          <a href="#coleccion" className="text-link">
            Explorar colección <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <Link className="footer-logo" href="/" aria-label="Vantelier, inicio">
          <BrandWordmark />
        </Link>
        <div className="footer-bottom">
          <span>Colombia · COP</span>
          <span>Streetwear for a wider tomorrow.</span>
          <span>Relicario / 001</span>
        </div>
      </footer>
      <p className="sr-only" aria-live="polite">
        {notice}
      </p>
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="product-detail">
            <ProductGallery key={selected.id} product={selected} />
            <div className="product-detail-copy">
              <p>{selected.description}</p>
              <p className="detail-price">
                {selectedVariant
                  ? formatMoney(selectedVariant.price, selectedVariant.currency)
                  : "Próximamente"}
              </p>
              <p className="detail-availability">
                {availabilityLabel(selectedVariant ? [selectedVariant] : [])}
              </p>
              {selected.collection && (
                <p className="detail-collection">
                  Colección {selected.collection.title}
                </p>
              )}
              <fieldset>
                <legend>Selecciona tu talla / variante</legend>
                <div className="sizes">
                  {selected.variants.map((v) => (
                    <button
                      key={v.id}
                      disabled={!v.available}
                      aria-pressed={v.id === variantId}
                      aria-label={`${v.title}${!v.available ? ", agotada" : v.backorder ? ", bajo pedido" : ""}`}
                      onClick={() => setVariantId(v.id)}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p className="detail-note">
                Las tallas tachadas están agotadas.
                {selectedVariant?.backorder
                  ? " Esta variante está disponible bajo pedido."
                  : ""}
              </p>
              <p className="detail-note">
                Fit oversize. Revisa las medidas de la prenda antes de comprar.
              </p>
              <button
                className="button full"
                disabled={!selectedVariant?.available}
                onClick={add}
              >
                {availabilityLabel(selectedVariant ? [selectedVariant] : []) ===
                "Agotado"
                  ? "Agotado"
                  : selected.variants.length
                    ? "Agregar a la bolsa"
                    : "Próximamente"}{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Modal>
      )}
      {cartOpen && (
        <Modal title="Tu bolsa" onClose={() => setCartOpen(false)}>
          {items.length ? (
            <>
              <div className="cart-items">
                {items.map((line) => (
                  <div className="cart-line" key={line.variantId}>
                    <ProductVisual product={line.product} />
                    <div>
                      <h3>{line.product.name}</h3>
                      <p>
                        {line.variant.title} ·{" "}
                        {formatMoney(line.variant.price, line.variant.currency)}
                      </p>
                      <label>
                        Cantidad{" "}
                        <select
                          aria-label={`Cantidad de ${line.product.name} ${line.variant.title}`}
                          value={line.quantity}
                          onChange={(e) => {
                            setError("");
                            setCart(
                              cart.map((l) =>
                                l.variantId === line.variantId
                                  ? { ...l, quantity: Number(e.target.value) }
                                  : l,
                              ),
                            );
                          }}
                        >
                          {Array.from({ length: 10 }, (_, i) => (
                            <option key={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="remove"
                        onClick={() =>
                          setCart(
                            cart.filter((l) => l.variantId !== line.variantId),
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>Subtotal</span>
                <strong>
                  {currencies.size === 1
                    ? formatMoney(total, items[0].variant.currency)
                    : "Se calcula en checkout"}
                </strong>
              </div>
              <p className="detail-note">
                {checkoutEnabled
                  ? "Envío e impuestos calculados al finalizar. La disponibilidad se confirma en checkout."
                  : "La bolsa no reserva existencias. Envíos e impuestos pendientes de configuración."}
              </p>
              {!checkoutEnabled && (
                <p className="demo-note">
                  Estamos preparando la tienda. Los pagos todavía no están
                  habilitados.
                </p>
              )}
              <button
                className="button full"
                disabled={busy || !checkoutEnabled}
                onClick={pay}
              >
                {busy ? "Abriendo checkout…" : "Continuar al pago"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
            </>
          ) : (
            <div className="empty">
              <p>Tu próxima prenda favorita te espera.</p>
              <button className="button" onClick={() => setCartOpen(false)}>
                Explorar colección <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </Modal>
      )}
      {about && (
        <Modal title="Wear your own way." onClose={() => setAbout(false)}>
          <div className="about">
            <span className="wordmark">
              <BrandWordmark />
            </span>
            <p>
              Creemos en la libertad de ocupar tu espacio. En vestir sin pedir
              permiso y encontrar identidad en lo esencial.
            </p>
            <p>
              Siluetas amplias, una mirada urbana y atención a los detalles. Esa
              es nuestra forma de hacer streetwear.
            </p>
            <p className="detail-note">
              Primera colección en preparación. Las compras estarán disponibles
              cuando terminemos de preparar la tienda.
            </p>
            <button
              className="button"
              onClick={() => {
                setAbout(false);
                document.getElementById("coleccion")?.scrollIntoView();
              }}
            >
              Ver colección <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
