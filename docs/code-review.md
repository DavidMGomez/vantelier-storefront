# Revisión de código

El perfil `vantelier-strict-review` está instalado a nivel de proyecto en `.agents/skills/`, tanto en el frontend como en el backend. Para usarlo:

```text
Usa $vantelier-strict-review para revisar los cambios pendientes y corregir los fallos confirmados.
```

Exige revisión independiente cuando esté disponible, escenarios reproducibles, prioridades P0–P3 y verificación posterior. Cubre contratos Next/Medusa, aislamiento de datos, inventario, filtros, accesibilidad, Pages, imágenes y CI. Se invoca durante el desarrollo; los workflows de GitHub mantienen sus comprobaciones automáticas habituales.

## Revisión de catálogo y proveedor local · 12 de noviembre de 2026

- Corregida la validación incompatible entre Next y Medusa: búsqueda de 100 caracteres, talla/color de 80, precios de 0 a 1.000 millones COP y disponibilidad estricta. Las entradas inválidas responden 400 antes de contactar al backend. Se añadió regresión.
- Corregida la presentación durante la carga: las tarjetas conservan el precio y disponibilidad de la respuesta visible hasta recibir la nueva página.
- Comprobados filtros por variante, páginas sin duplicados, facetas, rechazo de campos/estados privados y ausencia de fallback a demo.
- Comprobados en navegador el scroll bajo la cabecera, móvil sin desbordamiento y fotografías individuales. Los 32 recortes se compararon píxel por píxel con las vistas originales antes de retirar las láminas del sitio.

El revisor independiente no dejó hallazgos confirmados pendientes. La verificación HTTP local fue de lectura; no se modificó inventario ni se crearon canales, productos o pedidos para probar. Los escenarios destructivos y el seed se reservan a la base desechable de CI. Una revisión no garantiza ausencia de errores.
