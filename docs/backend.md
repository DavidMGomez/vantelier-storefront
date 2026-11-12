# Decisión de backend

Fecha: 12 de noviembre de 2026.

Estado: evaluación inicial. Posteriormente se eligió Medusa para la siguiente etapa. La preparación de proyectos está en [local-setup.md](local-setup.md); todavía falta integrar el frontend con el backend y la pasarela colombiana.

Objetivo: lanzar una tienda de ropa con diseño propio, variantes por talla/color, inventario, pedidos y pagos, reduciendo el trabajo operativo.

| Alternativa      | Qué proporciona                                         | Trabajo adicional                                                   | Decisión                                   |
| ---------------- | ------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| Shopify headless | Panel, catálogo, inventario, pedidos y checkout alojado | Configurar tienda, canal Headless, pagos y frontend                 | Recomendada para la primera versión        |
| Medusa           | Módulos de comercio abiertos y personalizables          | Alojamiento o Cloud, proveedores de pago y operación                | Alternativa si el control técnico pesa más |
| Backend propio   | Control total                                           | Reservas, concurrencia, pagos, webhooks, pedidos, seguridad y panel | No justificado para el lanzamiento         |

Shopify permite conservar el diseño de Vantelier con un frontend Next.js. El Storefront API proporciona catálogo y carrito; `cartCreate` devuelve `checkoutUrl`. La operación administrativa permanece en Shopify. Se debe presupuestar la suscripción, el alojamiento del frontend y las tarifas aplicables del proveedor y de Shopify; no se fija aquí una cotización.

Colombia no aparece en la lista consultada de Shopify Payments. Hay que elegir un proveedor externo disponible para el país y la cuenta desde el administrador. PSE y Nequi no se consideran habilitados hasta verificar el proveedor específico y realizar pruebas.

Medusa permite más personalización. Su guía de despliegue propio contempla PostgreSQL, Redis, servidor y worker. Medusa Cloud administra infraestructura, pero sigue siendo necesario integrar y verificar el flujo comercial.

## Frontera de confianza

El cliente no decide el precio cobrado. Envía solamente variante y cantidad. Shopify valida las líneas y establece el checkout. La vista de inventario no equivale a una reserva; la confirmación final ocurre en el proveedor. El modo demo nunca devuelve una URL de pago.

## Fuentes oficiales

- https://shopify.dev/docs/storefronts/headless/overview
- https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage
- https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries
- https://help.shopify.com/es/manual/payments/third-party-providers
- https://docs.medusajs.com/learn/deployment/general
- https://docs.medusajs.com/resources/deployment
