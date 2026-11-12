# Colección Relicario

El catálogo contiene los 16 diseños de la lámina de referencia: Vestigio, Ofrenda, Fisura, Umbra, Herencia, Fragmento, Tumbaga, Memoria, Umbral, Origen, Custodia, Estrato, Reliquia, Latencia, Áureo y Legado.

Los estampados grandes se interpretan como espaldas. Los frentes son propuestas complementarias con la firma de marca y un motivo pequeño. Cada diseño tiene vistas de frente y espalda en modelos; los botones permiten seleccionarlas en escritorio y móvil. En dispositivos con ratón, pasar sobre la fotografía muestra la vista opuesta.

## Dirección de color

La revisión solicitada elimina el efecto lavado de la tela. Usar colores uniformes y mates: negro profundo, café chocolate, borgoña y oliva. Ofrenda, Memoria y Áureo usan blanco óptico. Las fracturas y el aspecto de piedra pertenecen al estampado, no a la superficie de la tela.

## Archivos y presentación

Las cuatro láminas locales contienen cuatro columnas y dos filas: frentes arriba y espaldas abajo. `ProductVisual` muestra una celda mediante recorte CSS; `ProductGallery` controla la selección. Así se comparte una descarga por grupo de cuatro diseños. La ficha de producto, la tarjeta y la bolsa usan el mismo componente para evitar mostrar la lámina completa.

Los archivos activos son `01-04-signature.png`, `05-08-signature.png`, `09-12-signature.png` y `13-16-signature.png`. Los nombres de revisión evitan reutilizar las imágenes anteriores almacenadas en caché.

El hero usa `hero-signature.png`: un modelo de frente, con gafas negras envolventes inspiradas en Prada PR D10S, camiseta blanca mate y logo Vantelier grueso en el pecho. La imagen PNG tiene transparencia real. El titular permanece como texto HTML accesible detrás de la silueta; el botón y el texto auxiliar están en una capa superior. El efecto no depende de texto incrustado en la imagen.

## Firma tipográfica

Los 16 diseños comparten una firma de letras mayúsculas sans serif de peso alto y espaciado compacto, tanto delante como detrás. La primera V incorpora un detalle diagonal dorado. Se conserva la composición de cada estampado, incluidas las firmas verticales de Fragmento y Origen y la firma en dos líneas de Tumbaga.

`BrandWordmark` aplica esta identidad a la cabecera, el pie, la etiqueta editorial y el panel de marca. La V se dibuja en SVG con una interrupción diagonal y un acento de oro mate (`#b38a42`); el conjunto tiene un nombre accesible y escala con el tamaño de letra.

La imagen original y las revisiones se conservan en `generated_images`. Las copias utilizadas por la aplicación están en `public/images/vantelier` y se incluyen cuando se prepara el repositorio del frontend.

Los precios y las existencias son demostrativos. Los mockups requieren validación con las prendas físicas antes de presentarse como fotografías de producto final.
