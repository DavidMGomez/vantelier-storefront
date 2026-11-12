/* eslint-disable @next/next/no-img-element */
import { publicPath } from "@/shared/config/public-path";
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero-eyebrow">Vantelier / Relicario / Drop 001</p>
      <h1 id="hero-title" className="hero-title">
        BUILT
        <br />
        OVERSIZED
      </h1>
      <div className="hero-model">
        <img
          src={publicPath("/images/vantelier/hero-signature.png")}
          alt="Modelo con gafas negras envolventes, camiseta oversize blanca mate y firma Vantelier con detalle dorado en la V"
          width="1024"
          height="1536"
          fetchPriority="high"
        />
      </div>
      <div className="hero-copy">
        <p className="hero-description">
          El pasado deja huella.
          <br />
          Tú le das otra forma.
        </p>
        <a className="button" href="#coleccion">
          Descubre Relicario <span>⟶</span>
        </a>
      </div>
      <span className="scribble">
        HECHO PARA
        <br />
        DEJAR HUELLA.
      </span>
      <div className="hero-aside">
        <span>DROP / 001</span>
        <span className="vertical-rule" />
        <span>↓</span>
      </div>
      <div className="hero-caption">
        Vantelier
        <br />
        Blanco óptico
        <br />
        Oversized fit
        <i />
      </div>
      <span className="hero-bottom">Memoria, materia e identidad.</span>
    </section>
  );
}
