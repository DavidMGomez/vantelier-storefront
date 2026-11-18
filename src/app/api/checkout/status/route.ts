import { getCheckoutGateway } from "@/composition/storefront/checkout";
import { validateCartId } from "@/features/commerce/domain/checkout";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  let cartId: string;
  try {
    cartId = validateCartId(new URL(request.url).searchParams.get("cartId"));
  } catch {
    return Response.json(
      { error: "Revisa la compra que intentas consultar." },
      { status: 400, headers: noStore },
    );
  }
  let gateway;
  try {
    gateway = getCheckoutGateway();
  } catch {
    gateway = null;
  }
  if (!gateway)
    return Response.json(
      { error: "La tienda está en preparación." },
      { status: 503, headers: noStore },
    );
  try {
    return Response.json(
      { status: await gateway.paymentStatus(cartId) },
      { headers: noStore },
    );
  } catch {
    return Response.json(
      { error: "No pudimos consultar tu pago. Intenta de nuevo." },
      { status: 502, headers: noStore },
    );
  }
}
