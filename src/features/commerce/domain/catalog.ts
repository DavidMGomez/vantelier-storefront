export type Variant = {
  id: string;
  title: string;
  available: boolean;
  price: number;
  currency: string;
  size?: string;
  color?: string;
  backorder?: boolean;
};
export type Product = {
  id: string;
  name: string;
  type?: { id: string; value: string };
  createdAt?: string;
  description: string;
  image: string;
  images?: string[];
  category: string;
  categories?: { id: string; name: string }[];
  collection?: { id: string; title: string; handle: string };
  colors: string[];
  variants: Variant[];
};
export type CartLine = { variantId: string; quantity: number };

export function availabilityLabel(variants: Variant[]): string {
  if (!variants.length) return "Próximamente";
  if (!variants.some((variant) => variant.available)) return "Agotado";
  if (
    variants
      .filter((variant) => variant.available)
      .every((variant) => variant.backorder)
  )
    return "Bajo pedido";
  return "Disponible";
}

export function productPrice(variants: Variant[]): string {
  if (!variants.length) return "Próximamente";
  const amounts = variants.map((variant) => variant.price);
  const minimum = Math.min(...amounts);
  return `${Math.max(...amounts) > minimum ? "Desde " : ""}${formatMoney(minimum, variants[0].currency)}`;
}
export function validateLines(input: unknown): CartLine[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50)
    throw new Error("Selecciona entre 1 y 50 artículos.");
  const seen = new Set<string>();
  return input.map((line: unknown) => {
    if (
      !line ||
      typeof line !== "object" ||
      !("variantId" in line) ||
      !("quantity" in line) ||
      typeof line.variantId !== "string" ||
      !line.variantId ||
      line.variantId.length > 200 ||
      typeof line.quantity !== "number" ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 10 ||
      seen.has(line.variantId)
    )
      throw new Error("Revisa los artículos y sus cantidades.");
    seen.add(line.variantId);
    return { variantId: line.variantId, quantity: line.quantity };
  });
}
export function formatMoney(amount: number, currency = "COP") {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(amount);
}
