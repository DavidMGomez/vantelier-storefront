# Vantelier · Storefront

Tienda de ropa oversize con Next.js, React y TypeScript. En desarrollo usa **Medusa local** para consultar productos, variantes, precios COP y disponibilidad. El panel administrativo pertenece al repositorio `vantelier-backend`.

## Arranque local

Requisitos: Node 24 y npm 11. Los dos repositorios deben estar en tu carpeta `GitHub`.

**Primero, preparar el backend** desde `vantelier-backend`:

```sh
npm run setup
```

Si ya estaba preparado, basta con `npm run seed` para generar la configuración de conexión de esta versión. El seed conserva precios y existencias editados desde el panel. Genera `.local/storefront.env`, que contiene únicamente URL local, clave pública y región.

**Preparar el frontend** desde `vantelier-storefront`:

```sh
npm ci
node --input-type=module -e "import { copyFileSync, constants } from 'node:fs'; copyFileSync('../vantelier-backend/.local/storefront.env', '.env.local', constants.COPYFILE_EXCL)"
```

El comando es válido en macOS, Linux y PowerShell y evita sobrescribir un `.env.local` existente. Si ya tienes ese archivo, actualiza sus cuatro variables con las del archivo generado. No copies el `.env` completo del backend.

**Uso diario, dos terminales:**

| Carpeta                | Comando       | Dirección                                                        |
| ---------------------- | ------------- | ---------------------------------------------------------------- |
| `vantelier-backend`    | `npm run dev` | API: <http://localhost:9000>, panel: <http://localhost:9000/app> |
| `vantelier-storefront` | `npm run dev` | Tienda: <http://localhost:3200>                                  |

El backend inicia su PostgreSQL local y Medusa; el frontend inicia Next.js en el puerto 3200. No necesitas Redis. Detén cada servidor con `Ctrl+C`. Después de modificar `.env.local`, reinicia Next.js.

## Qué funciona

- Catálogo obtenido de la Store API de Medusa, paginado y consultado en el servidor Next en cada visita, sin caché. Recarga la tienda para ver cambios del panel.
- Precios calculados para Colombia en COP, sin dividirlos por 100. Los $149.000 iniciales siguen pendientes de revisión comercial.
- Disponibilidad según el inventario del canal de ventas. El seed inicia en cero: las tallas estarán agotadas hasta registrar existencias reales. Sin precio COP, una variante no se ofrece para compra.
- Filtros, detalle, selección de variantes y bolsa en memoria. La bolsa no reserva inventario ni crea todavía un carrito Medusa.
- Imágenes nuevas cargadas desde Medusa; los cuatro mockups originales tienen copia en `public/images/vantelier` y se muestran localmente.
- Pagos bloqueados en la interfaz, en `/api/checkout` y en el backend Medusa.

No se han conectado aún registro/login de clientes, pedidos desde la tienda, checkout, pasarela, envíos ni impuestos. Los módulos administrativos oficiales ya pertenecen al backend. Si falla la API, se muestra un error; no se reemplazan silenciosamente los datos por la demo.

## Variables de entorno

Guardar en `.env.local`, excluido de Git:

```dotenv
COMMERCE_PROVIDER=medusa
MEDUSA_BACKEND_URL=http://127.0.0.1:9000
MEDUSA_PUBLISHABLE_KEY=pk_CLAVE_PUBLICA_DEL_CANAL
MEDUSA_REGION_ID=reg_REGION_COLOMBIA
```

Son variables del servidor Next, sin prefijo `NEXT_PUBLIC_`. La clave publicable identifica el canal de ventas; no es la contraseña del administrador. Se obtiene también en el panel, **Settings → Publishable API Keys → Vantelier Storefront**. No colocar tokens Admin, secretos JWT o contraseñas en este frontend.

Para trabajar en diseño sin API existe `COMMERCE_PROVIDER=demo`. El adaptador Shopify anterior permanece como alternativa histórica y requiere configuración explícita; el flujo actual es Medusa. Los archivos de exportación estática existentes no forman parte del desarrollo local.

## Imágenes

Las subidas del panel se almacenan en `vantelier-backend/static/` y se sirven por `http://localhost:9000/static/...`. PostgreSQL guarda sus referencias, no los archivos binarios. Cambiar la miniatura desde el panel reemplaza el mockup en la tienda al recargar. Las láminas iniciales conservan el recorte frente/espalda de `metadata.lookbook`; una miniatura diferente deja de usar ese recorte.

Para nube, el backend admite un proveedor S3 compatible por variables de entorno. El frontend utiliza las URLs devueltas por Medusa. No necesita credenciales de storage. Consulta `vantelier-backend/docs/storage.md` para configuración y migración.

## Arquitectura

| Ruta                                                      | Responsabilidad                                                   |
| --------------------------------------------------------- | ----------------------------------------------------------------- |
| `src/app`                                                 | Rutas Next, renderizado por petición y frontera HTTP del checkout |
| `src/composition/storefront`                              | Selección e inyección del proveedor                               |
| `src/features/commerce/domain`                            | Contrato de productos, variantes y líneas de bolsa                |
| `src/features/commerce/application/ports`                 | Interfaz `CommerceProvider`                                       |
| `src/features/commerce/infrastructure/medusa-provider.ts` | Store API, paginación y traducción al contrato de la tienda       |
| `src/features/commerce/presentation`                      | Interfaz y estado local de la bolsa                               |
| `src/shared`                                              | Componentes compartidos, rutas de recursos y estilos              |
| `tests`                                                   | Contratos, errores, precios, inventario y límites entre capas     |

El navegador recibe el catálogo renderizado por Next; Next consulta Medusa con la clave pública. La presentación no conoce los endpoints ni las credenciales. La administración comercial se hace desde `/app` del backend, no editando el catálogo demo.

## Validación y compilación

```sh
npm run check
npm run build
npm start
```

`check` ejecuta lint, tipos, pruebas y formato. `build` genera `.next-build`; no necesita una API activa porque el catálogo comercial se resuelve al visitar la página. `start` sirve ese build en el puerto 3200 y sí necesita Medusa y las variables configuradas. Para desarrollar utiliza `dev`.

Verificados: 40 pruebas, lint, tipos, formato y build de producción de Next.js. La prueba real entre ambos servidores debe hacerse desde una terminal con acceso a los puertos locales; el entorno de revisión restringe esas conexiones. CI incluye comprobaciones y build sin credenciales de negocio.

## Comprobación manual

1. Abrir `/app` del backend y confirmar los productos publicados en el canal **Vantelier Web**.
2. Abrir la tienda: los 16 diseños iniciales deben mostrarse, con tallas agotadas si el inventario sigue en cero.
3. Cambiar nombre, precio o miniatura de un producto en el panel y recargar la tienda. Registrar stock únicamente cuando exista físicamente.
4. Confirmar que el pago permanece deshabilitado.

Un error 401/403 indica revisar clave publicable y canal; un catálogo vacío indica revisar publicación y asociación al canal. Si falta la configuración, repetir el seed y copiar sus valores. Un error de conexión requiere comprobar que Medusa esté activo en el puerto 9000. Los comandos antiguos de creación de repositorios no son necesarios: se trabaja sobre estos repositorios existentes.
