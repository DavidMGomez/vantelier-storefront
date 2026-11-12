# Publicación en GitHub Pages

GitHub Pages aloja una versión estática de Vantelier: catálogo de 16 diseños, filtros, vistas de frente y espalda, selección de tallas y bolsa. Los pagos permanecen desactivados. Medusa, inventario y pagos necesitan un backend desplegado por separado.

## Configuración del repositorio

1. Abre el repositorio del **frontend** en GitHub.
2. En **Settings → General → Danger Zone → Change repository visibility**, selecciona **Public**.
3. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**.
4. Sube el código y `.github/workflows/pages.yml` a `main`.
5. En **Actions → Deploy GitHub Pages**, comprueba que `build` y `deploy` terminen correctamente. El entorno `github-pages` muestra la URL publicada.

Cada push a `main` vuelve a validar y desplegar la tienda. También se puede iniciar desde **Run workflow**. El workflow necesita `contents: read`, `pages: read` durante la compilación y `pages: write` e `id-token: write` durante la publicación. No requiere tokens personales ni secretos de comercio.

## Verificación local

```sh
npm ci
npm run check
NEXT_PUBLIC_BASE_PATH=/vantelier-storefront npm run build:pages
```

El resultado está en `out/`, listo para servir como archivos estáticos. El nombre de la ruta debe coincidir con el repositorio. En GitHub Actions se toma automáticamente de `actions/configure-pages`, por lo que también admite un dominio propio sin prefijo.

Para un dominio en la raíz:

```sh
NEXT_PUBLIC_BASE_PATH= npm run build:pages
```

## Decisiones de implementación

- `GITHUB_PAGES=true` activa `output: export` y selecciona exclusivamente las rutas de interfaz `.tsx`. El handler `.ts` de `/api/checkout` se conserva para los despliegues Node.js y no se exporta a Pages.
- La exportación siempre usa el catálogo demo local, incluso si el entorno tiene otro proveedor configurado.
- `publicPath` agrega el prefijo a imágenes y endpoints locales. Los enlaces `next/link` y los recursos de Next.js usan `basePath`.
- `build:pages` crea `.nojekyll` y publica únicamente `out/`; no publica código de servidor ni archivos de entorno.
- La bolsa no reserva inventario y se reinicia al recargar. El botón de pago está deshabilitado en esta muestra.

## Despliegue con servidor

`npm run build` y `npm start` mantienen el modo Next.js con el endpoint de checkout. No establezcas `GITHUB_PAGES=true` en ese despliegue. El adaptador de Shopify existente y la futura integración de Medusa son independientes de la publicación estática.

## Referencias

- [Exportación estática de Next.js](https://nextjs.org/docs/app/guides/static-exports)
- [Workflows de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Prefijos de ruta en Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)
