# Demostración estática en GitHub Pages

El repositorio del frontend ya es público y conserva su configuración de Pages. Cada push a `main` ejecuta pruebas, exporta la tienda y publica `out/` mediante `.github/workflows/pages.yml`. No hay que cambiar visibilidad ni copiar credenciales de Medusa.

## Dos proveedores, una interfaz

| Modo     | Datos y filtros                                                    | Uso                                  |
| -------- | ------------------------------------------------------------------ | ------------------------------------ |
| `medusa` | API Medusa: catálogo, precios, stock, filtros y paginación remotos | Desarrollo y futura tienda comercial |
| `local`  | Fixtures del frontend y respuestas con el mismo contrato           | Demostración sin backend             |

`local-provider.ts` importa `src/features/commerce/infrastructure/data/catalog.json` y consulta sus productos en memoria: filtra, ordena y después pagina. Implementa `getProducts`, `getCatalog`, `getFacets` y un checkout bloqueado. Conserva los 16 diseños del catálogo estático anterior, sus textos, colores, tallas, disponibilidad de demostración y precios de referencia de $149.000 COP. La página muestra una franja que identifica la demostración.

Cada producto tiene dos archivos individuales en `public/images/products/<id>/`: `frente.webp` y `espalda.webp`, recortados de las imágenes originales sin pérdida. El arreglo `images` del JSON define su orden. Para editar la demostración, modifica ese JSON y añade las fotos a `public/`; publica de nuevo. No necesita base de datos, scripts de preparación ni un servidor de imágenes.

`GITHUB_PAGES=true` fuerza `local` tanto al compilar como al interactuar en el navegador. La paginación, el slider de precios, la búsqueda y los demás filtros funcionan **sin peticiones a `/api/catalog`, `/api/checkout` ni Medusa**. El build omite las rutas de servidor `.ts`. `demo` sigue aceptado como alias para instalaciones anteriores.

## Probar sin Medusa

En `.env.local`, establece `COMMERCE_PROVIDER=local` y ejecuta `npm run dev`. Vuelve a `medusa` para utilizar tus datos reales. Reinicia Next al cambiar de proveedor.

Para exportar:

```sh
npm run check
npm run build:pages
```

Para simular el prefijo de este repositorio en macOS/Linux:

```sh
NEXT_PUBLIC_BASE_PATH=/vantelier-storefront npm run build:pages
```

En Actions, `actions/configure-pages` proporciona el prefijo real; también admite un dominio propio. El resultado es un sitio estático en `out/`, con `.nojekyll`. `publicPath` resuelve imágenes locales con ese prefijo y conserva las URLs externas.

## Límites de la demostración

La bolsa se mantiene en memoria y se reinicia al recargar. No reserva stock, crea pedidos, sincroniza inventario ni permite cobros. GitHub Pages no ejecuta Medusa: la tienda comercial necesita alojamiento independiente para el backend y un despliegue Node de este frontend.

Referencias: [Next.js static export](https://nextjs.org/docs/app/guides/static-exports), [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
