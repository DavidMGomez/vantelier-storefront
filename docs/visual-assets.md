# Colección Relicario

Esta guía describe los recursos del modo local y la identidad visual. El catálogo conectado a Medusa utiliza fotografías individuales subidas desde el panel; el seed no incluye fotos de demostración. El hero sigue siendo un recurso del frontend.

## Fotografías del catálogo Medusa

Selecciona el frente como miniatura en Medusa y coloca la espalda a continuación en la galería. Las fotos restantes muestran detalles o ángulos adicionales. El frontend coloca la miniatura primero, conserva el orden de las demás URLs y elimina duplicados; no interpreta los nombres de archivo. La tarjeta permite alternar las dos primeras fotos; el detalle muestra todas mediante miniaturas y flechas, también en móvil.

Las fotografías llenan un rectángulo 3:4 con `object-fit: cover` y posición central. Se mantiene la proporción original y se recorta el sobrante, sin deformar la prenda ni modificar el archivo almacenado. Para controlar el encuadre, prepara fotos 3:4 con margen alrededor del producto. Con una sola foto no se ofrece una espalda ficticia; sin fotos aparece «Imagen pendiente».

El catálogo contiene los 16 diseños de la lámina de referencia: Vestigio, Ofrenda, Fisura, Umbra, Herencia, Fragmento, Tumbaga, Memoria, Umbral, Origen, Custodia, Estrato, Reliquia, Latencia, Áureo y Legado.

Los estampados grandes se interpretan como espaldas. Los frentes son propuestas complementarias con la firma de marca y un motivo pequeño. Cada diseño tiene vistas de frente y espalda en modelos; los botones permiten seleccionarlas en escritorio y móvil. En dispositivos con ratón, pasar sobre la fotografía muestra la vista opuesta.

## Dirección de color

La revisión solicitada elimina el efecto lavado de la tela. Usar colores uniformes y mates: negro profundo, café chocolate, borgoña y oliva. Ofrenda, Memoria y Áureo usan blanco óptico. Las fracturas y el aspecto de piedra pertenecen al estampado, no a la superficie de la tela.

## Archivos y presentación

Los 16 diseños tienen 32 fotos individuales en `public/images/products/<id>/frente.webp` y `espalda.webp`. Cada archivo mide 384 × 512 píxeles (3:4): es un recorte exacto, codificado en WebP sin pérdida, de las cuatro láminas originales. Las láminas permanecen en el historial de Git y ya no se publican. No se amplían ni se reconstruyen detalles.

`src/features/commerce/infrastructure/data/catalog.json` reúne los productos, variantes y rutas de fotos. El proveedor local importa ese JSON y lo consulta en memoria. La ficha, la tarjeta y la bolsa muestran los mismos archivos con `ProductVisual`; `ProductGallery` controla su orden y selección. No hay posiciones de cuadrícula ni recortes CSS especiales para la demostración.

El hero usa `hero-signature.png`: un modelo de frente, con gafas negras envolventes inspiradas en Prada PR D10S, camiseta blanca mate y logo Vantelier grueso en el pecho. La imagen PNG tiene transparencia real. El titular es texto HTML accesible en un bloque lateral; el modelo ocupa un panel fotográfico independiente. En móvil ambos bloques se apilan. La campaña sigue siendo contenido editorial del frontend, independiente del catálogo administrado en Medusa.

## Firma tipográfica

Los 16 diseños comparten una firma de letras mayúsculas sans serif de peso alto y espaciado compacto, tanto delante como detrás. La primera V incorpora un detalle diagonal dorado. Se conserva la composición de cada estampado, incluidas las firmas verticales de Fragmento y Origen y la firma en dos líneas de Tumbaga.

`BrandWordmark` aplica esta identidad a la cabecera, el pie, la etiqueta editorial y el panel de marca. La V se dibuja en SVG con una interrupción diagonal y un acento de oro mate (`#b38a42`); el conjunto tiene un nombre accesible y escala con el tamaño de letra.

Los recursos que utiliza la aplicación se versionan en `public/images/` y se incluyen en la exportación estática.

Los precios y las existencias son demostrativos. Los mockups requieren validación con las prendas físicas antes de presentarse como fotografías de producto final.

## Interfaz

Paleta de papel cálido, tinta y oro mate. Antonio para titulares, Archivo Black para la firma y Manrope para lectura, todas autoalojadas con sus licencias OFL. El catálogo mantiene marcos 3:4, información discreta, estados de stock explícitos y controles con foco visible. Se respeta la preferencia de movimiento reducido.

Referencias de composición: [Cole Buxton](https://www.colebuxton.com/collections/t-shirts) por la fotografía y la jerarquía del catálogo, [Undergold](https://undergoldapparel.com/) por la presencia de campaña y [Entire Studios](https://www.entirestudios.com/) por la navegación contenida. Se utilizan exclusivamente los recursos de Vantelier.

Impeccable 4.8.2 está instalado para este proyecto en `.agents/skills/impeccable/`, sin hooks automáticos ni dependencias del sitio. Sus instrucciones y licencia se versionan; el ejecutable local descargable se excluye de Git.
