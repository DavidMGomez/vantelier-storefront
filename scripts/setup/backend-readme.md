# Vantelier Backend

Backend de comercio basado en Medusa v2.22.6, generado con la CLI oficial. Incluye API de tienda, administración, catálogo, inventario y pedidos. El frontend de marca se mantiene en el repositorio hermano `vantelier-storefront`.

## Desarrollo local

Requisitos: Node.js 24, npm 11 y Docker con Docker Compose. La preparación genera credenciales locales aleatorias en archivos excluidos de Git.

Desde la raíz:

```sh
docker compose --env-file .env.local up -d --wait
cd apps/backend
npx medusa db:migrate
npm run dev
```

API: http://localhost:9000. Administración: http://localhost:9000/app.

Crear el administrador con la CLI de Medusa. Para no guardar la contraseña en el historial, desde zsh:

```sh
read "VANTELIER_ADMIN_EMAIL?Correo del administrador: "
read -s "VANTELIER_ADMIN_PASSWORD?Contraseña del administrador: "
printf '\n'
npx medusa user -e "$VANTELIER_ADMIN_EMAIL" -p "$VANTELIER_ADMIN_PASSWORD"
unset VANTELIER_ADMIN_PASSWORD VANTELIER_ADMIN_EMAIL
```

Las variables se expanden como argumentos del proceso de la CLI; usar solo en un equipo local de confianza.

## Estructura

- `apps/backend`: aplicación Medusa y extensiones administrativas.
- `compose.yaml`: PostgreSQL de desarrollo con volumen persistente y puerto local 5433.
- `.env.local` y `apps/backend/.env`: configuración privada, no versionada.

## Configuración inicial

Crear la región Colombia con moneda COP, opciones de envío, ubicación de inventario y productos por talla/color. Crear o recuperar una clave publicable asociada al canal de ventas. La tienda de marca todavía funciona con datos demo: la conexión del catálogo y la adaptación del checkout se implementan en una etapa posterior.

El checkout real colombiano no está integrado. Validar Wompi Colombia o una integración equivalente antes de habilitar cobros; no usar el proveedor manual de prueba como pasarela real.

## Validación

Desde `apps/backend` ejecutar `npm run build`. La preparación debe completar este paso antes de publicar el primer commit. La migración y el recorrido real de compra requieren la base de datos en ejecución y una comprobación adicional.

## Producción

Este Compose es exclusivamente local. Preparar PostgreSQL administrado, Redis, servidor y worker según la guía de despliegue de Medusa, almacenamiento de imágenes, copias de seguridad, secretos y HTTPS. No usar las credenciales locales en producción.

## Referencias

- https://docs.medusajs.com/learn/installation
- https://docs.medusajs.com/resources/create-medusa-app
- https://docs.medusajs.com/learn/deployment/general

Conservar las licencias del starter y de sus dependencias.
