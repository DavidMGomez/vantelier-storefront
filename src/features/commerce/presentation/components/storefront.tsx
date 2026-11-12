"use client";
import { useState } from "react";
import Link from "next/link";
import { Hero } from "./hero";
import { BrandWordmark } from "./brand-wordmark";
import { ProductCard } from "./product-card";
import { ProductGallery } from "./product-gallery";
import { ProductVisual } from "./product-visual";
import type { CartLine, Product } from "../../domain/catalog";
import { formatMoney } from "../../domain/catalog";
import { Modal } from "@/shared/ui/modal";
export function Storefront({
  products,
  checkout,
  demo,
}: {
  products: Product[];
  checkout: (lines: CartLine[]) => Promise<string>;
  demo: boolean;
}) {
  const [category, setCategory] = useState("Todo");
  const [selected, setSelected] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const categories = ["Todo", ...new Set(products.map((p) => p.category))];
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
  function openProduct(product: Product) {
    setSelected(product);
    setVariantId(product.variants.find((v) => v.available)?.id || "");
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
        <Link className="wordmark" href="/" aria-label="Vantelier, inicio">
          <BrandWordmark />
        </Link>
        <nav aria-label="Principal">
          <a className="active" href="#coleccion">
            Shop
          </a>
          <a href="#coleccion" onClick={() => setCategory("Todo")}>
            Colecciones
          </a>
          <button onClick={() => setAbout(true)}>Nosotros</button>
        </nav>
        <button
          className="bag-button"
          onClick={() => {
            setCartOpen(true);
            setError("");
          }}
          aria-label={`Abrir bolsa, ${cart.reduce((s, l) => s + l.quantity, 0)} artículos`}
        >
          <svg
            width="21"
            height="23"
            viewBox="0 0 24 26"
            fill="none"
            aria-hidden="true"
          >
            <path d="M5 8h14l2 16H3L5 8Z" stroke="currentColor" />
            <path d="M8 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" />
          </svg>
          <span>{cart.reduce((s, l) => s + l.quantity, 0)}</span>
        </button>
      </header>
      <main>
        <Hero />
        <section id="coleccion" className="collection">
          <div className="section-heading">
            <h2>RELICARIO — DROP 001</h2>
            <div className="filters" aria-label="Filtrar colección">
              {categories.map((c) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="collection-layout">
            <div className="product-grid">
              {products
                .filter((p) => category === "Todo" || p.category === category)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={() => openProduct(product)}
                  />
                ))}
            </div>
            <aside className="editorials">
              <button className="editorial" onClick={() => setAbout(true)}>
                <div className="texture texture-dark" />
                <span>
                  <strong>
                    THE
                    <br />
                    FEELING
                  </strong>
                  <small>
                    Texturas que hablan.
                    <br />
                    Detalles que importan.
                  </small>
                  <b>⟶</b>
                </span>
              </button>
              <button className="editorial" onClick={() => setAbout(true)}>
                <div className="label-photo">
                  <span>
                    <BrandWordmark registered={false} />
                    <small>WEAR YOUR OWN WAY</small>
                  </span>
                </div>
                <span>
                  <strong>
                    IN THE
                    <br />
                    DETAILS
                  </strong>
                  <small>
                    Menos ruido.
                    <br />
                    Más identidad.
                  </small>
                  <b>⟶</b>
                </span>
              </button>
            </aside>
          </div>
          {!products.length && <p>Estamos preparando la próxima colección.</p>}
        </section>
        <section className="manifesto">
          <p>No se trata de encajar.</p>
          <h2>SE TRATA DE SER.</h2>
          <button onClick={() => setAbout(true)}>Conoce Vantelier ⟶</button>
        </section>
      </main>
      <footer>
        <Link className="footer-logo" href="/">
          <BrandWordmark />
        </Link>
        <span>Streetwear for a wider tomorrow.</span>
        <span>Colombia · COP</span>
      </footer>
      <p className="sr-only" aria-live="polite">
        {notice}
      </p>
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="product-detail">
            <ProductGallery key={selected.id} product={selected} />
            <div>
              <p>{selected.description}</p>
              <p className="detail-price">
                {selected.variants.find((v) => v.id === variantId)
                  ? formatMoney(
                      selected.variants.find((v) => v.id === variantId)!.price,
                      selected.variants.find((v) => v.id === variantId)!
                        .currency,
                    )
                  : "Sin disponibilidad"}
              </p>
              <fieldset>
                <legend>Selecciona tu talla / variante</legend>
                <div className="sizes">
                  {selected.variants.map((v) => (
                    <button
                      key={v.id}
                      disabled={!v.available}
                      aria-pressed={v.id === variantId}
                      onClick={() => setVariantId(v.id)}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p className="detail-note">
                Fit oversize. Revisa las medidas de la prenda antes de comprar.
              </p>
              <button
                className="button full"
                disabled={!variantId}
                onClick={add}
              >
                Agregar a la bolsa +
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
                Envío e impuestos calculados al finalizar. La disponibilidad se
                confirma en checkout.
              </p>
              {demo && (
                <p className="demo-note">
                  Colección de muestra. Los pagos todavía no están habilitados.
                </p>
              )}
              <button
                className="button full"
                disabled={busy || demo}
                onClick={pay}
              >
                {busy ? "Abriendo checkout…" : "Continuar al pago ⟶"}
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
                Explorar colección ⟶
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
              Primera colección en preparación. Las imágenes y los precios de
              esta muestra son ilustrativos.
            </p>
            <button
              className="button"
              onClick={() => {
                setAbout(false);
                document.getElementById("coleccion")?.scrollIntoView();
              }}
            >
              Ver colección ⟶
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
