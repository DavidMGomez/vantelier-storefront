import { getCatalogPage } from "@/composition/storefront/catalog";
import { parseCatalogRequest } from "@/features/commerce/domain/catalog-filters";
export async function GET(request: Request) {
  let query;
  try {
    query = parseCatalogRequest(new URL(request.url).searchParams);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Filtros inválidos." },
      { status: 400 },
    );
  }
  try {
    return Response.json(await getCatalogPage(query), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        error:
          "No se pudo actualizar el catálogo. Revisa la conexión e intenta de nuevo.",
      },
      { status: 502 },
    );
  }
}
