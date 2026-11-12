---
name: vantelier-strict-review
description: Revisar estrictamente código de Vantelier (Next.js y Medusa v2) como revisor par independiente. Usar al pedir code review, revisión de seguridad, contratos, regresiones o una revisión antes de publicar. Priorizar fallos reproducibles y correcciones mínimas; comprobar filtros, stock, imágenes, exportación estática y CI.
---

# Revisión estricta de Vantelier

## Delimitar y preservar

1. Leer `AGENTS.md`, `git status`, remotos y diff, incluidos archivos nuevos. Identificar el rango solicitado y recorrer consumidores, pruebas y contratos relacionados; no limitarse a las líneas modificadas.
2. Revisar el repositorio actual. Si el cambio cruza la frontera Next/Medusa, inspeccionar también el repositorio hermano disponible. No crear ni clonar repositorios para revisar.
3. No modificar bases, ejecutar seeds sobre datos del usuario, reiniciar sus procesos, imprimir secretos ni habilitar pagos. Usar bases desechables solo si están preparadas para pruebas. Revisar dependencias instaladas y documentación oficial cuando haya incertidumbre sobre una API.
4. Si actúas como autor o coordinador y hay delegación disponible, solicitar una revisión independiente en un contexto nuevo. Si ya eres el revisor delegado, completar tu revisión sin volver a delegar. Entregar alcance, código y requisitos; no anticipar diagnósticos ni soluciones. Si no está disponible, explicitar que no hubo revisión independiente.

## Examinar los riesgos relevantes

- **Medusa:** exigir clave publicable, aislar canales y productos publicados, ocultar categorías internas/inactivas y campos privados. Usar precios calculados COP e inventario del canal; respetar backorders y variantes sin precio. Combinar talla, color, stock y precio sobre la misma variante antes de ordenar y paginar. Probar IDs inexistentes y rangos inválidos.
- **Next y React:** comprobar contratos de servidor/navegador, entradas inválidas, errores visibles sin fallback silencioso, cancelación de respuestas antiguas, cambio de filtros desde páginas posteriores, carga/reintento, scroll y foco bajo la cabecera. No permitir compras de variantes agotadas. Conservar la bolsa al paginar.
- **Proveedor local:** leer el JSON en memoria; conservar textos, precios y disponibilidad de demostración. Verificar rutas y orden de fotos individuales, prefijo de Pages, ausencia de consultas a Medusa en exportación y checkout bloqueado. No introducir inventario real ni credenciales en fixtures.
- **UI:** verificar teclado, foco, etiquetas de sliders, estado agotado legible, móvil sin desbordamiento y galería con cero, una, dos y más fotos. Usar el navegador disponible, sin sustituir observación visual por suposiciones.
- **Operación:** comprobar scripts simples y portables, lockfile reproducible, secretos excluidos, seed idempotente, límites de consultas, Docker/volúmenes y CI acordes con el alcance. No proponer arquitectura nueva sin un problema concreto.

## Exigir evidencia

Para cada hallazgo, aportar prioridad, archivo y línea, disparador reproducible, resultado esperado/actual, impacto y corrección mínima. Separar fallos confirmados de hipótesis pendientes. No reportar preferencias de estilo, duplicados, problemas ajenos al alcance ni riesgos hipotéticos como errores.

- **P0:** pérdida o exposición grave e inmediata de datos; detener publicación.
- **P1:** seguridad, integridad comercial o flujo principal roto; corregir antes de publicar.
- **P2:** fallo funcional reproducible en un caso válido; corregir en el alcance autorizado.
- **P3:** mejora concreta no bloqueante; explicar su beneficio sin exigirla.

No aprobar por tener pruebas verdes. Intentar refutar supuestos con casos negativos y de frontera. Tampoco inventar hallazgos para aparentar rigor.

## Corregir y cerrar

Si se solicitaron correcciones, reproducir cada hallazgo, implementar el cambio mínimo y añadir regresión cuando proteja un comportamiento importante. Solicitar al revisor que verifique las correcciones. No editar cuando se pidió solo revisión.

Ejecutar los comandos pertinentes del `package.json`: frontend `npm run check`, build Node y `npm run build:pages`; backend pruebas, tipos, build API/admin y smoke HTTP en la base desechable de CI. No ejecutar un build estático sobre la salida que usa el servidor de desarrollo activo; utilizar una copia temporal sin secretos. Ampliar pruebas solo por cambios o riesgos nuevos.

Entregar primero hallazgos restantes; después, correcciones, pruebas realmente ejecutadas y límites de verificación. Si no quedan fallos confirmados, decirlo sin garantizar ausencia de errores. Respetar las autorizaciones de commit/push de la sesión; no publicar por el mero hecho de invocar esta revisión.
