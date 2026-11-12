import type { CommerceProvider } from "../application/ports/commerce-provider";
import type { Product } from "../domain/catalog";
// The supplied design board defines the back artwork; fronts are complementary proposals.
const designs = [
  {
    id: "vestigio",
    name: "Vestigio",
    category: "Mármol",
    color: "#161616",
    description:
      "Una escultura que conserva sus huellas. Mármol fracturado y vetas doradas sobre negro mate; firma discreta al frente.",
  },
  {
    id: "ofrenda",
    name: "Ofrenda",
    category: "Orfebrería",
    color: "#f8f8f5",
    description:
      "Una figura ceremonial en oro sobre algodón de blanco óptico. Espalda protagonista y un pequeño símbolo al frente.",
  },
  {
    id: "fisura",
    name: "Fisura",
    category: "Mármol",
    color: "#161616",
    description:
      "Un rostro de piedra ocupa la espalda. Las grietas doradas recorren la pieza como un mapa de su historia.",
  },
  {
    id: "umbra",
    name: "Umbra",
    category: "Eclipse",
    color: "#39271f",
    description:
      "Un eclipse ilumina una escultura fragmentada. Tonos tierra, oro y una silueta amplia.",
  },
  {
    id: "herencia",
    name: "Herencia",
    category: "Orfebrería",
    color: "#3c4430",
    description:
      "Geometría ceremonial dorada sobre verde oliva mate. Un emblema pequeño conecta frente y espalda.",
  },
  {
    id: "fragmento",
    name: "Fragmento",
    category: "Mármol",
    color: "#4a202c",
    description:
      "Una franja de mármol roto atraviesa la espalda de una camiseta borgoña. Firma vertical y fisuras de oro.",
  },
  {
    id: "tumbaga",
    name: "Tumbaga",
    category: "Orfebrería",
    color: "#161616",
    description:
      "Una máscara ceremonial a gran escala dialoga con una composición tipográfica asimétrica.",
  },
  {
    id: "memoria",
    name: "Memoria",
    category: "Orfebrería",
    color: "#f8f8f5",
    description:
      "Tres fragmentos de una misma historia: escultura, figura y medallón. Un archivo visual sobre blanco óptico.",
  },
  {
    id: "umbral",
    name: "Umbral",
    category: "Orfebrería",
    color: "#161616",
    description:
      "Un arco de piedra protege una figura dorada. Una puerta a otra época sobre negro mate.",
  },
  {
    id: "origen",
    name: "Origen",
    category: "Mármol",
    color: "#39271f",
    description:
      "Un busto clásico emerge de la parte inferior de la espalda. Mármol, oro y tierra en equilibrio.",
  },
  {
    id: "custodia",
    name: "Custodia",
    category: "Eclipse",
    color: "#161616",
    description:
      "Dos manos de mármol rodean un eclipse. Una pieza sobre aquello que decidimos conservar.",
  },
  {
    id: "estrato",
    name: "Estrato",
    category: "Mármol",
    color: "#3c4430",
    description:
      "Capas de piedra, grietas y tiempo. Una composición diagonal sobre verde oliva mate.",
  },
  {
    id: "reliquia",
    name: "Reliquia",
    category: "Orfebrería",
    color: "#4a202c",
    description:
      "Una máscara dorada sobre borgoña mate. Forma ceremonial, presencia contemporánea.",
  },
  {
    id: "latencia",
    name: "Latencia",
    category: "Eclipse",
    color: "#161616",
    description:
      "El monograma V aparece en el centro de un eclipse. Una composición contenida sobre negro mate.",
  },
  {
    id: "aureo",
    name: "Áureo",
    category: "Orfebrería",
    color: "#f8f8f5",
    description:
      "Oro, mármol y escultura en tres franjas verticales. Un contraste de materias sobre blanco óptico.",
  },
  {
    id: "legado",
    name: "Legado",
    category: "Mármol",
    color: "#161616",
    description:
      "Un busto de mármol y sus grietas doradas. Relicario: una colección sobre lo que permanece.",
  },
];
const sheets = [
  "01-04-signature",
  "05-08-signature",
  "09-12-signature",
  "13-16-signature",
];
export const demoProducts: Product[] = designs.map((design, i) => ({
  id: design.id,
  name: design.name,
  description: design.description,
  image: `/images/vantelier/${sheets[Math.floor(i / 4)]}.png`,
  lookbook: {
    src: `/images/vantelier/${sheets[Math.floor(i / 4)]}.png`,
    column: i % 4,
  },
  category: design.category,
  colors: [design.color],
  variants: ["S", "M", "L", "XL"].map((size) => ({
    id: `${design.id}-${size}`,
    title: size,
    available: true,
    price: 149000,
    currency: "COP",
  })),
}));
export const demoProvider: CommerceProvider = {
  async getProducts() {
    return demoProducts;
  },
  async checkout() {
    throw new Error(
      "La tienda está en preparación. Los pagos aún no están habilitados.",
    );
  },
};
