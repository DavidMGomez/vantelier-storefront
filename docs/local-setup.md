# Desarrollo local con Medusa

La guía vigente está en el [README](../README.md#arranque-local). Se trabaja directamente sobre los repositorios existentes `vantelier-backend` y `vantelier-storefront`; no hay que generar repositorios nuevos.

1. Backend: `npm run setup` para preparar PostgreSQL, variables, migraciones, catálogo y administrador. En un backend ya preparado, `npm run seed` genera también la configuración pública del frontend sin restablecer precios ni stock.
2. Copiar `vantelier-backend/.local/storefront.env` a `vantelier-storefront/.env.local`, conservando otras variables que ya existan.
3. Ejecutar `npm run dev` en cada repositorio, en dos terminales.
4. Abrir tienda en <http://localhost:3200> y panel en <http://localhost:9000/app>.

La base puede usar Docker, PostgreSQL instalado por separado o el modo nativo existente del Mac. Los detalles y comandos están en el README del backend. Redis no se usa en esta etapa.

El frontend consume catálogo, precios y disponibilidad de Medusa. La bolsa sigue siendo local y el checkout está bloqueado. Los scripts antiguos `setup-github.mjs` y `scripts/setup/` se conservan como preparación histórica; no forman parte del flujo actual y no deben ejecutarse para conectar estos repositorios.
