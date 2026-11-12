import { catalogParams, type CatalogLoader } from "../domain/catalog-filters";
import { localProvider } from "./local-provider";
import { publicPath } from "@/shared/config/public-path";
export const loadCatalog: CatalogLoader = async (request, signal) => {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") {
    return localProvider.getCatalog(request);
  }
  const response = await fetch(
    `${publicPath("/api/catalog")}?${catalogParams(request)}`,
    { signal, cache: "no-store" },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "No se pudo actualizar el catálogo.");
  return data;
};
