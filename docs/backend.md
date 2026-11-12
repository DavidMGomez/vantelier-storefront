# Backend vigente: Medusa

El frontend usa Medusa como proveedor predeterminado. Productos, precios COP, fotos, colecciones, categorías, opciones e inventario proceden de su Store API. Next consulta el catálogo desde el servidor; Medusa resuelve búsqueda, filtros, orden y paginación. La bolsa continúa en el navegador.

- [Arranque local](local-setup.md)
- [Administración del catálogo](catalogo.md)
- [Contrato de integración](https://github.com/DavidMGomez/vantelier-backend/blob/main/docs/frontend-medusa.md)

Los adaptadores demo y Shopify se conservan como alternativas explícitas. Un fallo de Medusa no cambia de proveedor. Los cobros, las cuentas de cliente y los pedidos desde la tienda siguen pendientes; la bolsa no reserva inventario.
