# Backend vigente: Medusa

El frontend usa Medusa como proveedor predeterminado. Productos, precios COP, fotos, colecciones, categorías, opciones e inventario proceden de su Store API. Next consulta el catálogo desde el servidor; Medusa resuelve búsqueda, filtros, orden y paginación. La bolsa continúa en el navegador.

- [Arranque local](local-setup.md)
- [Administración del catálogo](catalogo.md)
- [Contrato de integración](https://github.com/DavidMGomez/vantelier-backend/blob/main/docs/frontend-medusa.md)

Los adaptadores demo y Shopify se conservan como alternativas explícitas. Un fallo de Medusa no cambia de proveedor.

## Checkout

`/api/checkout/cart` (servidor Next) recibe las líneas de la bolsa y la dirección, valida ambas y usa el puerto `CheckoutGateway` (`application/ports/checkout-gateway.ts`). El adaptador `infrastructure/medusa-checkout.ts` crea el carrito en la región configurada, añade la opción de envío más económica que Medusa ofrece para la dirección (hoy «Envío incluido», $0) y devuelve los totales de Medusa. La clave publicable no sale del servidor. Los montos los calcula siempre el backend; la validación del formulario es solo ayuda rápida.

### Pago (Wompi)

1. «Pagar» llama a `/api/checkout/payment` (`startPayment`). Esa ruta crea o reutiliza la colección de pago del carrito, abre una sesión `pp_wompi_wompi` y devuelve la URL de Web Checkout. Solo se acepta `https://checkout.wompi.co`.
2. El navegador guarda únicamente el id del carrito (`localStorage`) y va a Wompi.
3. Wompi devuelve al comprador a `/checkout/resultado`. Esa página consulta `/api/checkout/status` cada 3 s, hasta 2 min (`awaitPaymentResult`). El estado sale de Medusa: `paid` solo si el carrito ya está completado (pedido creado por el webhook verificado); `failed` si la sesión quedó en error o cancelada; `pending` en cualquier otro caso. Si se agota el tiempo, no se presenta como pago hecho.

El retorno del navegador nunca confirma un pago. Si el backend no tiene llaves de Wompi, «Pagar» muestra «Los pagos aún no están habilitados».
