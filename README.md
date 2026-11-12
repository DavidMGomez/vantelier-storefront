# Vantelier

Tienda de streetwear oversize con una experiencia editorial y un backend de comercio intercambiable. Construida con Next.js, React y TypeScript, organizada mediante arquitectura hexagonal ligera.

## Estado del proyecto

Skeleton funcional: catálogo, filtros por colección, detalle de producto, selección de variantes, bolsa con cantidades y adaptador de checkout de Shopify. Arranca en modo demo sin credenciales ni cobros. La integración real requiere una tienda Shopify configurada y validación de extremo a extremo.

## Desarrollo

Requisitos: Node.js 24 o superior y npm 11.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3200.

```sh
npm run check   # Lint, tipos, pruebas y formato
npm run build  # Compilación de producción
npm start      # Servidor de producción
```

## Arquitectura

| Directorio                                | Responsabilidad                                           |
| ----------------------------------------- | --------------------------------------------------------- |
| `src/app`                                 | Rutas, layout y frontera HTTP del checkout                |
| `src/composition/storefront`              | Selección e inyección de adaptadores                      |
| `src/features/commerce/domain`            | Productos, variantes y validación de líneas               |
| `src/features/commerce/application/ports` | Contrato del proveedor de comercio                        |
| `src/features/commerce/infrastructure`    | Catálogo demo, Shopify y cliente HTTP                     |
| `src/features/commerce/presentation`      | Experiencia de compra y estado de interfaz                |
| `src/shared`                              | Modal accesible y tokens visuales                         |
| `tests`                                   | Reglas de arquitectura, validación y contrato de checkout |

El dominio no depende de React, Next.js ni del proveedor. La presentación recibe datos y operaciones por inyección. Solamente composición selecciona la implementación. Una regla de ESLint heredada del patrón de Xirius protege las dependencias entre capas, incluso imports relativos y dinámicos.

## Preparar los repositorios

La arquitectura elegida para la siguiente etapa es Medusa. El preparador crea dos repositorios privados: `vantelier-storefront` y `vantelier-backend`, dentro de `~/Documents/GitHub` por defecto. Requiere GitHub CLI autenticado y acceso a npm/GitHub.

```sh
node scripts/setup-github.mjs --directory "$HOME/Documents/GitHub"
```

Consulta [la guía local](docs/local-setup.md) para requisitos, ejecución del backend y límites de esta preparación. La tienda de marca todavía usa datos demo; la conexión con Medusa y su checkout están pendientes.

## Adaptador de comercio actual

La primera versión incluye un adaptador alternativo de **Shopify headless**: Vantelier controla el frontend; Shopify administra productos, variantes, inventario, pedidos, envíos y checkout. Los precios y la disponibilidad definitiva se resuelven en Shopify. El navegador solamente envía identificadores de variantes y cantidades.

La [decisión inicial de arquitectura](docs/backend.md) compara Shopify, Medusa y un backend propio; la elección posterior de Medusa se documenta en [la guía local](docs/local-setup.md). Consulta la [guía de integración](docs/shopify.md) para activar el proveedor real.

## Diseño

Header de navegación compacto, fondo marfil, tipografía de gran peso y una composición editorial centrada en la fotografía. Manrope se sirve localmente; los titulares usan la pila Impact/Arial Black. El resultado exacto de los titulares puede variar por sistema operativo. Los colores y el espaciado global viven en `src/shared/theme/tokens.css`.

La interfaz se adapta a móvil y escritorio. Los diálogos usan el elemento nativo `dialog`, navegación por teclado, cierre con Escape y restitución del foco. Se respeta la preferencia de movimiento reducido.

## Configuración

| Variable                          | Descripción                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `COMMERCE_PROVIDER`               | `demo` por defecto; `shopify` activa la integración                             |
| `SHOPIFY_STORE_DOMAIN`            | Dominio canónico `nombre.myshopify.com`, sin protocolo                          |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Token **público** de Storefront del canal Headless, utilizado desde el servidor |
| `SHOPIFY_API_VERSION`             | Versión fijada de la API; inicialmente `2026-10`                                |

No se usan tokens Admin ni se incluyen credenciales en el repositorio. `.env.local` está excluido de Git. El servidor no cambia silenciosamente a datos demo si falla Shopify.

## Alcance y límites

- Los precios y las existencias demo son ilustrativos. Los mockups representan propuestas visuales de la colección, no fotografías de prendas fabricadas.
- Las imágenes de la colección Relicario se sirven localmente desde `public/images/vantelier`. Son mockups de los 16 diseños de referencia sobre modelos, con vistas de frente y espalda. Los frentes son propuestas complementarias; confirmar estampados, tejidos y colores con muestras físicas antes de vender. Los detalles de tejido y etiqueta son composiciones CSS ilustrativas.
- La bolsa permanece en memoria y se reinicia al recargar. No reserva inventario.
- Las variantes de Shopify se muestran con su título completo; el catálogo inicial consulta hasta 24 productos y 100 variantes por producto. La paginación queda para la siguiente fase.
- El stock, los pedidos y los pagos se administran en Shopify; no existe un panel administrativo local.
- No se han integrado cuentas de cliente, descuentos en la interfaz, analítica, correos propios ni seguimiento de pedidos. El checkout alojado puede ofrecer sus propias funciones según configuración.
- La tienda permanece con `noindex` durante preparación. Configurar dominio, metadatos, políticas, fotografías y quitar esa restricción al lanzar.

## Despliegue

La muestra del frontend se puede publicar en **GitHub Pages**. El workflow `Deploy GitHub Pages` valida, exporta y despliega el catálogo con cada push a `main`. Configura el repositorio como público y selecciona **GitHub Actions** en **Settings → Pages**. La [guía de publicación](docs/github-pages.md) detalla los pasos.

```sh
NEXT_PUBLIC_BASE_PATH=/vantelier-storefront npm run build:pages
```

La exportación está en `out/` y mantiene los pagos deshabilitados. GitHub Pages no ejecuta el backend ni el endpoint de checkout.

Para una tienda con checkout, utiliza alojamiento compatible con Next.js y rutas de servidor. Configura las variables del proveedor, ejecuta `npm run check` y `npm run build`, y sirve con `npm start`. La integración con Medusa todavía está pendiente.

El workflow `Quality` valida el modo servidor en pull requests y cambios en `main`. El workflow de Pages publica únicamente la versión estática y no activa pagos.

## Antes de producción

Configurar el proveedor de pagos disponible para la empresa en Colombia, costos de envío, impuestos, políticas, dominio y catálogo real. Verificar compras de prueba, falta de stock, pagos rechazados, cancelaciones y reembolsos. Añadir control de frecuencia en el perímetro del endpoint de checkout y observabilidad del servidor. La integración se entrega preparada, no certificada contra una tienda activa.

## Recursos

- [Shopify Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api)
- [Carrito y checkout](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)
- [Documentación de Medusa](https://docs.medusajs.com/learn)
- [Decisión de backend](docs/backend.md)
- [Configuración de Shopify](docs/shopify.md)

Todos los derechos reservados. La publicación del código no concede una licencia de uso de la marca o sus diseños. Las dependencias y fuentes conservan sus respectivas licencias.
