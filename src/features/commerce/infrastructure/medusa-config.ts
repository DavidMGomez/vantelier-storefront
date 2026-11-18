export type MedusaConfig = {
  backendUrl: string;
  publishableKey: string;
  regionId: string;
};

/** Valida la configuración pública y devuelve la URL base sin barra final. */
export function medusaBaseUrl(config: MedusaConfig): string {
  let backend: URL;
  try {
    backend = new URL(config.backendUrl);
  } catch {
    throw new Error("Configura MEDUSA_BACKEND_URL en .env.local.");
  }
  if (
    !["http:", "https:"].includes(backend.protocol) ||
    backend.username ||
    backend.password ||
    backend.search ||
    backend.hash
  )
    throw new Error(
      "MEDUSA_BACKEND_URL debe ser HTTP(S), sin credenciales ni parámetros.",
    );
  if (!config.publishableKey.startsWith("pk_"))
    throw new Error(
      "Configura MEDUSA_PUBLISHABLE_KEY con la clave pública de Vantelier Storefront.",
    );
  if (!config.regionId.startsWith("reg_"))
    throw new Error("Configura MEDUSA_REGION_ID con la región Colombia.");
  return backend.toString().replace(/\/+$/, "");
}
