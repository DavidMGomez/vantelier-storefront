export type ShippingAddress = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
};

// Totales calculados por el backend; el frontend solo los muestra.
export type CheckoutSummary = {
  cartId: string;
  currency: "COP";
  itemTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  shippingLabel: string;
  /** Medios de pago habilitados en el backend para la región (puede estar vacío). */
  paymentMethods: PaymentMethod[];
};

export type PaymentMethod = { id: string; label: string };

/** Estado del pago según el backend; "paid" solo cuando el pedido ya existe. */
export type PaymentStatus = "paid" | "pending" | "failed";

const PAYMENT_METHOD_ID = /^pp_[a-z0-9]+(?:_[a-z0-9]+)*$/;
export function validatePaymentMethodId(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 64 ||
    !PAYMENT_METHOD_ID.test(value)
  )
    throw new Error("Elige un medio de pago.");
  return value;
}

const CART_ID = /^cart_[A-Za-z0-9]{1,64}$/;
export function validateCartId(value: unknown): string {
  if (typeof value !== "string" || !CART_ID.test(value))
    throw new Error("Revisa la compra que intentas pagar.");
  return value;
}

type Rule = { label: string; min: number; max: number; pattern?: RegExp };
const rules: Record<keyof ShippingAddress, Rule> = {
  email: {
    label: "el correo",
    min: 6,
    max: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  firstName: { label: "el nombre", min: 1, max: 80 },
  lastName: { label: "el apellido", min: 1, max: 80 },
  phone: {
    label: "el teléfono",
    min: 7,
    max: 20,
    pattern: /^\+?[\d\s()-]{7,20}$/,
  },
  address1: { label: "la dirección", min: 3, max: 150 },
  address2: { label: "el complemento de la dirección", min: 0, max: 150 },
  city: { label: "la ciudad", min: 2, max: 80 },
  province: { label: "el departamento", min: 2, max: 80 },
  postalCode: { label: "el código postal", min: 0, max: 10, pattern: /^\d*$/ },
};

/** Validación rápida para el comprador; Medusa vuelve a validar al crear el carrito. */
export function validateShippingAddress(input: unknown): ShippingAddress {
  if (!input || typeof input !== "object")
    throw new Error("Revisa tus datos de envío.");
  const source = input as Record<string, unknown>;
  const result = {} as ShippingAddress;
  for (const [field, rule] of Object.entries(rules) as [
    keyof ShippingAddress,
    Rule,
  ][]) {
    const raw = source[field] ?? "";
    const value = typeof raw === "string" ? raw.trim() : null;
    if (
      value === null ||
      value.length < rule.min ||
      value.length > rule.max ||
      (value && rule.pattern && !rule.pattern.test(value))
    )
      throw new Error(`Revisa ${rule.label}.`);
    result[field] = value;
  }
  if (result.phone.replace(/\D/g, "").length < 7)
    throw new Error(`Revisa ${rules.phone.label}.`);
  return result;
}
