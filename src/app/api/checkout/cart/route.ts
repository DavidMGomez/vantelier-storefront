import { getCheckoutGateway } from "@/composition/storefront/checkout";
import { validateLines } from "@/features/commerce/domain/catalog";
import { validateShippingAddress } from "@/features/commerce/domain/checkout";
import { CheckoutError } from "@/features/commerce/infrastructure/medusa-checkout";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  let lines;
  let address;
  try {
    const body = await request.text();
    if (body.length > 16000)
      return Response.json(
        { error: "Solicitud demasiado grande." },
        { status: 413 },
      );
    const parsed = JSON.parse(body);
    lines = validateLines(parsed?.lines);
    address = validateShippingAddress(parsed?.address);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.message.startsWith("Revisa")
            ? error.message
            : "Revisa los artículos y tus datos de envío.",
      },
      { status: 400 },
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
      {
        error:
          "La tienda está en preparación. Las compras aún no están habilitadas.",
      },
      { status: 503 },
    );
  try {
    return Response.json(await gateway.prepare(lines, address), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof CheckoutError
            ? error.message
            : "No pudimos preparar tu compra. Intenta de nuevo.",
      },
      { status: 502 },
    );
  }
}
