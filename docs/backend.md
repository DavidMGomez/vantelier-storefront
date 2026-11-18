# Backend vigente: Medusa

El frontend usa Medusa como proveedor predeterminado. Productos, precios COP, fotos, colecciones, categorías, opciones e inventario proceden de su Store API. Next consulta el catálogo desde el servidor; Medusa resuelve búsqueda, filtros, orden y paginación. La bolsa continúa en el navegador.

- [Arranque local](local-setup.md)
- [Administración del catálogo](catalogo.md)
- [Contrato de integración](https://github.com/DavidMGomez/vantelier-backend/blob/main/docs/frontend-medusa.md)

Los adaptadores demo y Shopify se conservan como alternativas explícitas. Un fallo de Medusa no cambia de proveedor.

## Checkout

`/api/checkout/cart` (servidor Next) recibe las líneas de la bolsa y la dirección, valida ambas y usa el puerto `CheckoutGateway` (`application/ports/checkout-gateway.ts`). El adaptador `infrastructure/medusa-checkout.ts` crea el carrito en la región configurada, añade la opción de envío más económica que Medusa ofrece para la dirección (hoy «Envío incluido», $0) y devuelve los totales de Medusa. La clave publicable no sale del servidor. Los montos los calcula siempre el backend; la validación del formulario es solo ayuda rápida. Los cobros, las cuentas de cliente y los pedidos siguen pendientes.
