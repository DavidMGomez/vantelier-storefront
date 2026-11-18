import { getCheckoutGateway } from "@/composition/storefront/checkout";
import { validateCartId } from "@/features/commerce/domain/checkout";
import { CheckoutError } from "@/features/commerce/infrastructure/medusa-checkout";

const unavailable = () =>
  Response.json(
    {
      error:
        "La tienda está en preparación. Los pagos aún no están habilitados.",
    },
    { status: 503 },
  );

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  let cartId: string;
  try {
    const body = await request.text();
    if (body.length > 1000) throw new Error();
    cartId = validateCartId(JSON.parse(body)?.cartId);
  } catch {
    return Response.json(
      { error: "Revisa la compra que intentas pagar." },
      { status: 400 },
    );
  }
  let gateway;
  try {
    gateway = getCheckoutGateway();
  } catch {
    gateway = null;
  }
  if (!gateway) return unavailable();
  try {
    return Response.json(await gateway.startPayment(cartId), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof CheckoutError
            ? error.message
            : "No pudimos iniciar el pago. Intenta de nuevo.",
      },
      { status: 502 },
    );
  }
}
