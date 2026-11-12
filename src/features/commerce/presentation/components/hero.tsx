/* eslint-disable @next/next/no-img-element */
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { publicPath } from "@/shared/config/public-path";
export function Hero({ onDiscover }: { onDiscover?: () => void }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <h1 id="hero-title" className="hero-title">
          BUILT
          <br />
          <span>OVERSIZED.</span>
        </h1>
        <p className="hero-description">
          El pasado deja huella.
          <br />
          Tú le das otra forma.
        </p>
        <a className="button" href="#coleccion" onClick={onDiscover}>
          Descubre Relicario <ArrowUpRight size={19} aria-hidden="true" />
        </a>
        <p className="hero-collection">
          <span className="gold-line" aria-hidden="true" />
          Relicario · Colección 001
        </p>
      </div>
      <div className="hero-image-panel">
        <span className="hero-image-word" aria-hidden="true">
          RELICARIO
        </span>
        <div className="hero-model">
          <img
            src={publicPath("/images/vantelier/hero-signature.png")}
            alt="Modelo con gafas negras envolventes, camiseta oversize blanca mate y firma Vantelier con detalle dorado en la V"
            width="1024"
            height="1536"
            fetchPriority="high"
          />
        </div>
        <span className="hero-fit">Vantelier / Oversized fit</span>
      </div>
      <div className="hero-bottom">
        <span>Memoria, materia e identidad.</span>
        <a href="#coleccion" aria-label="Explorar la colección">
          <ArrowDown size={18} aria-hidden="true" />
        </a>
        <span>Colombia</span>
      </div>
    </section>
  );
}
