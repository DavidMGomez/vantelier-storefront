# Activar Shopify

1. Crear o seleccionar una tienda y configurar su moneda, mercados y ubicaciones de inventario.
2. Instalar el canal Headless. Obtener un token **público Storefront** con los permisos de lectura necesarios. Este adaptador usa `X-Shopify-Storefront-Access-Token`; no admite un token Admin ni un token privado sin cambiar la cabecera.
3. Crear productos con fotos, descripciones, precios, variantes e inventario. Publicarlos en el canal correspondiente. Usar el tipo de producto para las categorías de la interfaz.
4. Configurar las variables de `.env.example` en `.env.local` y cambiar `COMMERCE_PROVIDER=shopify`.
5. Configurar envíos, impuestos, políticas y proveedor de pago en Shopify. Confirmar qué medios están disponibles para Colombia y su costo.
6. Reiniciar el servidor. Verificar que el catálogo proviene de Shopify y que la bolsa abre el checkout alojado.
7. Realizar pruebas con el modo de prueba admitido por el proveedor, incluyendo variantes agotadas, cantidades no disponibles, pagos rechazados y reembolsos.

El adaptador consulta precios y disponibilidad sin caché. Su catálogo tiene un límite inicial de 24 productos y 100 variantes por producto. Añadir paginación antes de superar esos límites. La moneda debe configurarse coherentemente para el mercado colombiano; la interfaz muestra la moneda devuelta por Shopify.

El endpoint crea un nuevo carrito de Shopify en cada intento de checkout. No persiste carritos de Shopify entre sesiones ni sincroniza la bolsa local con cambios externos. Para recuperación de carritos o cuentas de cliente, ampliar el contrato e implementar persistencia antes de ofrecer dichas funciones.

La API y su autenticación se documentan en https://shopify.dev/docs/api/storefront/2026-10.
