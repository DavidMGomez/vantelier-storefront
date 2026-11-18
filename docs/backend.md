# Backend vigente: Medusa

El frontend usa Medusa como proveedor predeterminado. Productos, precios COP, fotos, colecciones, categorías, opciones e inventario proceden de su Store API. Next consulta el catálogo desde el servidor; Medusa resuelve búsqueda, filtros, orden y paginación. La bolsa continúa en el navegador.

- [Arranque local](local-setup.md)
- [Administración del catálogo](catalogo.md)
- [Contrato de integración](https://github.com/DavidMGomez/vantelier-backend/blob/main/docs/frontend-medusa.md)

Los adaptadores demo y Shopify se conservan como alternativas explícitas. Un fallo de Medusa no cambia de proveedor.

## Checkout

`/api/checkout/cart` (servidor Next) recibe las líneas de la bolsa y la dirección, valida ambas y usa el puerto `CheckoutGateway` (`application/ports/checkout-gateway.ts`). El adaptador `infrastructure/medusa-checkout.ts` crea el carrito en la región configurada, añade la opción de envío más económica que Medusa ofrece para la dirección (hoy «Envío incluido», $0) y devuelve los totales de Medusa. La clave publicable no sale del servidor. Los montos los calcula siempre el backend; la validación del formulario es solo ayuda rápida.

### Pago (Wompi y Mercado Pago)

1. Al preparar el carrito, el adaptador consulta `/store/payment-providers` de la región y devuelve en `paymentMethods` solo los medios integrados (`pp_wompi_wompi`, `pp_mercadopago_mercadopago`), en orden fijo. Nunca incluye `pp_system_default`. Sin medios, «Pagar» queda deshabilitado.
2. El comprador elige el medio. «Pagar» llama a `/api/checkout/payment` con `cartId` y `providerId`; esa ruta crea o reutiliza la colección de pago, abre la sesión y devuelve la URL de checkout. Cada medio solo redirige a sus dominios oficiales: `checkout.wompi.co`, `www.mercadopago.com.co` y `sandbox.mercadopago.com.co`.
3. El navegador guarda únicamente el id del carrito (`localStorage`) y va al checkout.
4. Al volver, `/checkout/resultado` consulta `/api/checkout/status` cada 3 s, hasta 2 min (`awaitPaymentResult`). El estado depende de Medusa: `paid` solo si el carrito ya está completado (pedido creado por el webhook verificado); `failed` si todos los intentos quedaron en error o cancelados; `pending` en cualquier otro caso. Si se agota el tiempo, no se muestra como pagado.

El retorno del navegador nunca confirma un pago.
