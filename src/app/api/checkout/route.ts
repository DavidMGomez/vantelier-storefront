import {
  getCommerceProvider,
  getCommerceProviderName,
} from "@/composition/storefront/provider";
import { validateLines } from "@/features/commerce/domain/catalog";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  let lines;
  try {
    const body = await request.text();
    if (body.length > 16000)
      return Response.json(
        { error: "Solicitud demasiado grande." },
        { status: 413 },
      );
    lines = validateLines(JSON.parse(body).lines);
  } catch {
    return Response.json(
      { error: "Revisa los artículos y sus cantidades." },
      { status: 400 },
    );
  }
  if (getCommerceProviderName() !== "shopify")
    return Response.json(
      {
        error:
          "La tienda está en preparación. Los pagos aún no están habilitados.",
      },
      { status: 503 },
    );
  try {
    return Response.json({ url: await getCommerceProvider().checkout(lines) });
  } catch {
    return Response.json(
      {
        error:
          "No pudimos iniciar el pago. Revisa la disponibilidad e intenta de nuevo.",
      },
      { status: 502 },
    );
  }
}
