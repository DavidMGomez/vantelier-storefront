# 🖤 Vantelier · Storefront

Tienda oversize conectada al catálogo de Medusa.

`Next.js` · `React` · `TypeScript` · `Node 24`

[![CI](https://github.com/DavidMGomez/vantelier-storefront/actions/workflows/checks.yml/badge.svg)](https://github.com/DavidMGomez/vantelier-storefront/actions/workflows/checks.yml)

## Arranque local

Requisitos: **Node 24**, npm y el [backend](https://github.com/DavidMGomez/vantelier-backend) preparado y en ejecución.

Copia `vantelier-backend/.local/storefront.env` a `.env.local` de este repositorio. Si ya existe, actualiza solo las variables de conexión. Luego:

```sh
npm ci
npm run dev
```

🚀 Tienda: <http://localhost:3200> · Admin: <http://localhost:9000/app>

Mantén `npm run dev` del backend en otra terminal. Tras recrear la base, actualiza la clave pública y la región desde `storefront.env`; reinicia Next al cambiar `.env.local`. Nunca copies secretos ni credenciales del administrador al frontend.

## 🛠️ Comandos

| Comando         | Uso                            |
| --------------- | ------------------------------ |
| `npm run dev`   | Desarrollo en el puerto 3200   |
| `npm run check` | Lint, tipos, pruebas y formato |
| `npm run build` | Compilar para servidor Node    |
| `npm start`     | Ejecutar la versión compilada  |

Variables en [.env.example](.env.example). Para trabajar sin API, usa `COMMERCE_PROVIDER=demo` en `.env.local`.

## 📸 Catálogo e imágenes

- Productos, precios COP y disponibilidad vienen de Medusa. **Recarga la tienda** para ver cambios del panel. Si la API falla, se muestra el error.
- Los agotados siguen visibles con etiqueta y tallas deshabilitadas. «Solo disponibles» permite ocultarlos.
- Colecciones, tallas, categorías y colores se leen de Medusa; [administración y filtros](docs/catalogo.md).
- El seed comienza sin fotos y con stock cero. Sube las fotos y registra las existencias reales desde el panel.
- Miniatura = frente; segunda foto = espalda; siguientes = detalles. El catálogo alterna las dos primeras y el detalle muestra todas con flechas y miniaturas.
- Las fotos llenan un marco **3:4** con `cover`: sin deformación, con recorte centrado del sobrante. Sin fotos aparece «Imagen pendiente».

## 🧩 Código

| Ruta                          | Función                                |
| ----------------------------- | -------------------------------------- |
| `src/app/`                    | Rutas y renderizado Next               |
| `src/composition/storefront/` | Selección del proveedor                |
| `src/features/commerce/`      | Contratos, adaptador Medusa e interfaz |
| `src/shared/`                 | Componentes y utilidades compartidos   |

Next consulta Medusa desde el servidor. Las imágenes se cargan desde las URLs del backend/storage.

## 🚧 Estado

Catálogo, filtros, variantes, galería y bolsa local disponibles. **La bolsa no reserva stock ni crea pedidos; los cobros están bloqueados.** Pendientes: cuentas de clientes, carrito Medusa, checkout, pagos, envíos e impuestos.

## 📚 Docs

[Fotografías e identidad visual](docs/visual-assets.md) · [Contrato Medusa](https://github.com/DavidMGomez/vantelier-backend/blob/main/docs/frontend-medusa.md) · [Storage](https://github.com/DavidMGomez/vantelier-backend/blob/main/docs/storage.md)
