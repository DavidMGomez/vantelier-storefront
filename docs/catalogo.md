# Catálogo, colecciones y disponibilidad

## Operación desde Medusa

1. **Productos → Colecciones → Crear**: define el nombre y un handle estable, por ejemplo `Relicario` / `relicario`.
2. Abre la colección y agrega productos desde su sección **Products**. Un producto pertenece a una colección; puede pertenecer a varias categorías.
3. **Productos → Categorías** organiza tipos como Camisetas, Hoodies o Accesorios. Activa las categorías destinadas a la tienda y evita marcarlas como internas.
4. En cada producto configura opciones **Talla** y, cuando haya variantes de color, **Color**. También se reconocen `Size`, `Colour` y `Tamaño`. La talla no se deduce del nombre de la variante.
5. Publica el producto, asígnalo al canal **Vantelier Web**, registra precio COP e inventario en la ubicación vinculada. Recarga el frontend.

Las colecciones del catálogo aparecen automáticamente cuando contienen productos visibles para el canal. Cambiarles el título o mover productos se refleja al recargar, sin editar código. Las vacías no aparecen. Los productos sin colección siguen en «Todas las piezas». El seed conserva las asignaciones existentes; no hay que repetirlo para administrar el catálogo.

La portada y su fotografía anuncian **Relicario** desde el frontend. Su botón busca la colección por handle `relicario` (sin distinguir mayúsculas). Crear una colección en Medusa no reemplaza automáticamente esa campaña ni crea una página editorial propia.

## Agotados

Se conservan visibles con **Agotado** y la fotografía atenuada al 42 % de opacidad; la etiqueta y el precio mantienen su contraste. Sus fichas siguen consultables y sus variantes no se pueden agregar a la bolsa. Si una talla tiene stock y otra no, se decide por variante. **Solo disponibles** oculta las que no se pueden comprar y combina esta condición con la talla, el color y el precio seleccionados.

La disponibilidad respeta la política de Medusa: inventario sin control o backorder habilitado permiten comprar; un backorder sin unidades se presenta como **Bajo pedido**. Para prendas físicas sin preventa, conserva **Manage inventory** activado y **Allow backorders** desactivado. No se muestra una cantidad estimada. Sin precio COP válido aparece **Próximamente**.

Para retirar completamente una prenda, pásala a borrador o quítala del canal de ventas. No hace falta eliminarla ni su historial. El stock de esta pantalla no constituye una reserva; el checkout continúa bloqueado.

## Filtros y alcance

- Búsqueda por palabras, insensible a tildes y mayúsculas.
- Colección; categoría y color cuando existen datos nativos; talla; precio mínimo y máximo COP mediante un slider de dos controles; solo disponibles.
- Orden por catálogo, nombre o precio mínimo. Cuando las variantes tienen precios distintos se muestra «Desde».
- El slider se ajusta al precio máximo del catálogo, en pasos de $1.000 COP; sus extremos no se pueden cruzar y admiten teclado.
- Talla, color, precio y disponibilidad deben coincidir en la misma variante. Un rango invertido muestra una explicación y cero resultados.
- Contador, estado vacío y acción para limpiar filtros. La selección se reinicia al recargar; todavía no se guarda en la URL.

Next consulta **todas las páginas** de `/store/products` desde el servidor con región, clave pública y sin caché. Los filtros se aplican en el navegador al catálogo completo, adecuado para las 16 prendas actuales; no se filtra solo una página ni se usa el catálogo demo como respaldo.

Para crecer a cientos o miles de productos, trasladar búsqueda y paginación al servidor. La Store API admite `collection_id`, `category_id`, `q`, `order`, `limit` y `offset`; los rangos sobre precios calculados y la disponibilidad por variante requieren validar la consulta o añadir un endpoint/índice específico. No se presenta una búsqueda facetada remota como implementada.

`metadata.category` (Mármol, Orfebrería, Eclipse) se conserva como estilo de las prendas antiguas. No se confunde con una categoría nativa ni con una colección. Los círculos de color de metadata son decorativos; el filtro de color usa opciones de variantes.

Referencias: [colecciones en el panel](https://docs.medusajs.com/user-guide/products/collections), [productos por colección](https://docs.medusajs.com/resources/storefront-development/products/collections/products), [inventario](https://docs.medusajs.com/resources/storefront-development/products/inventory).
