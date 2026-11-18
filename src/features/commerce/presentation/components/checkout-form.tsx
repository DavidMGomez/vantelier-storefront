"use client";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CartLine } from "../../domain/catalog";
import { formatMoney } from "../../domain/catalog";
import {
  validateShippingAddress,
  type CheckoutSummary,
  type ShippingAddress,
} from "../../domain/checkout";

export type PrepareCheckout = (
  lines: CartLine[],
  address: ShippingAddress,
) => Promise<CheckoutSummary>;
export type PayCheckout = (
  cartId: string,
  paymentMethodId: string,
) => Promise<void>;

const fields: {
  name: keyof ShippingAddress;
  label: string;
  autoComplete: string;
  type?: string;
  optional?: boolean;
  wide?: boolean;
}[] = [
  {
    name: "email",
    label: "Correo",
    autoComplete: "email",
    type: "email",
    wide: true,
  },
  { name: "firstName", label: "Nombre", autoComplete: "given-name" },
  { name: "lastName", label: "Apellido", autoComplete: "family-name" },
  {
    name: "phone",
    label: "Celular",
    autoComplete: "tel",
    type: "tel",
    wide: true,
  },
  {
    name: "address1",
    label: "Dirección",
    autoComplete: "address-line1",
    wide: true,
  },
  {
    name: "address2",
    label: "Apto, torre o barrio",
    autoComplete: "address-line2",
    optional: true,
    wide: true,
  },
  { name: "city", label: "Ciudad o municipio", autoComplete: "address-level2" },
  { name: "province", label: "Departamento", autoComplete: "address-level1" },
  {
    name: "postalCode",
    label: "Código postal",
    autoComplete: "postal-code",
    optional: true,
  },
];
const empty = Object.fromEntries(
  fields.map((f) => [f.name, ""]),
) as ShippingAddress;

export function CheckoutForm({
  lines,
  prepare,
  pay,
  onBack,
}: {
  lines: CartLine[];
  prepare: PrepareCheckout;
  /** Sin medio de pago configurado, se muestra el total sin cobrar. */
  pay?: PayCheckout;
  onBack: () => void;
}) {
  const [address, setAddress] = useState(empty);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startPayment(cartId: string, paymentMethodId: string) {
    if (!pay) return;
    setError("");
    setBusy(true);
    try {
      await pay(cartId, paymentMethodId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Intenta de nuevo.");
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    let valid: ShippingAddress;
    try {
      valid = validateShippingAddress(address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revisa tus datos de envío.");
      return;
    }
    setBusy(true);
    try {
      setSummary(await prepare(lines, valid));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (summary)
    return (
      <CheckoutSummaryView
        summary={summary}
        destination={`${address.city.trim()}, ${address.province.trim()}`}
        canPay={Boolean(pay)}
        busy={busy}
        error={error}
        onPay={(methodId) => startPayment(summary.cartId, methodId)}
        onEdit={() => setSummary(null)}
      />
    );

  return (
    <form className="checkout-form" onSubmit={submit} noValidate>
      <button type="button" className="remove checkout-back" onClick={onBack}>
        <ArrowLeft size={14} aria-hidden="true" /> Volver a la bolsa
      </button>
      <p className="detail-note">
        Envío a toda Colombia incluido en el precio.
      </p>
      <div className="checkout-fields">
        {fields.map((field) => (
          <label key={field.name} className={field.wide ? "wide" : undefined}>
            {field.label}
            {field.optional ? " (opcional)" : ""}
            <input
              name={field.name}
              type={field.type || "text"}
              autoComplete={field.autoComplete}
              required={!field.optional}
              value={address[field.name]}
              onChange={(e) =>
                setAddress({ ...address, [field.name]: e.target.value })
              }
            />
          </label>
        ))}
      </div>
      <button className="button full" type="submit" disabled={busy}>
        {busy ? "Calculando total…" : "Ver total de la compra"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </form>
  );
}

/** Resumen con totales del backend y elección del medio de pago. */
export function CheckoutSummaryView({
  summary,
  destination,
  canPay,
  busy,
  error,
  onPay,
  onEdit,
}: {
  summary: CheckoutSummary;
  destination: string;
  canPay: boolean;
  busy: boolean;
  error: string;
  onPay: (paymentMethodId: string) => void;
  onEdit: () => void;
}) {
  const methods = canPay ? summary.paymentMethods : [];
  const [selected, setSelected] = useState(methods[0]?.id ?? "");
  const method = methods.find((m) => m.id === selected);
  return (
    <div className="checkout-summary">
      <dl>
        <div>
          <dt>Productos</dt>
          <dd>{formatMoney(summary.itemTotal, summary.currency)}</dd>
        </div>
        <div>
          <dt>{summary.shippingLabel}</dt>
          <dd>
            {summary.shippingTotal
              ? formatMoney(summary.shippingTotal, summary.currency)
              : "Incluido"}
          </dd>
        </div>
        <div className="checkout-summary-total">
          <dt>Total</dt>
          <dd>{formatMoney(summary.total, summary.currency)}</dd>
        </div>
      </dl>
      <p className="detail-note">
        Precios con IVA incluido
        {summary.taxTotal
          ? ` (${formatMoney(summary.taxTotal, summary.currency)})`
          : ""}
        . Envío a {destination}.
      </p>
      {methods.length ? (
        <fieldset className="checkout-methods" disabled={busy}>
          <legend>Medio de pago</legend>
          {methods.map((m) => (
            <label key={m.id}>
              <input
                type="radio"
                name="payment-method"
                value={m.id}
                checked={selected === m.id}
                onChange={() => setSelected(m.id)}
              />
              {m.label}
            </label>
          ))}
          <p className="detail-note">
            Pagas en la página segura del medio elegido. Tu pedido se confirma
            cuando nos notifica el pago.
          </p>
        </fieldset>
      ) : (
        <p className="demo-note">
          Los pagos aún no están habilitados. Todavía no se realiza ningún
          cobro.
        </p>
      )}
      <button
        className="button full"
        disabled={!method || busy}
        onClick={() => method && onPay(method.id)}
      >
        {busy
          ? `Abriendo ${method?.label ?? "el pago"}…`
          : `Pagar ${formatMoney(summary.total, summary.currency)}`}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="remove" disabled={busy} onClick={onEdit}>
        Editar datos de envío
      </button>
    </div>
  );
}
