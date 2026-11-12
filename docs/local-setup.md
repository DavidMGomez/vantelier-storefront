# Proyectos locales y publicación inicial

La preparación separa la tienda de marca y el backend en dos repositorios privados de la cuenta personal autenticada en GitHub CLI:

| Repositorio            | Contenido                                                                    |
| ---------------------- | ---------------------------------------------------------------------------- |
| `vantelier-storefront` | Next.js, diseño Vantelier y catálogo demo                                    |
| `vantelier-backend`    | Aplicación oficial Medusa 2.22.6 en `apps/backend`, panel y PostgreSQL local |

El panel administrativo forma parte del backend. No necesita otro repositorio.

## Preparar y publicar

Requisitos: Node.js 24, npm, Git y GitHub CLI (`gh`). Configurar nombre y correo de Git para crear commits. Iniciar sesión con la cuenta personal en la que deben crearse los repositorios:

```sh
gh auth login --hostname github.com
```

Desde la tienda original:

```sh
node scripts/setup-github.mjs --directory "$HOME/Documents/GitHub"
```

Para revisar las acciones sin modificar archivos:

```sh
node scripts/setup-github.mjs --plan
```

El proceso:

1. Verifica herramientas, sesión de GitHub, colisiones de carpetas y nombres de repositorio.
2. Copia los archivos fuente de la tienda, excluyendo credenciales, dependencias y resultados de compilación.
3. Ejecuta `create-medusa-app` oficial para generar el backend. No ejecuta migraciones ni inicia servicios durante la publicación.
4. Prepara PostgreSQL local y credenciales aleatorias en archivos privados ignorados por Git.
5. Instala dependencias, valida la tienda y compila ambos proyectos.
6. Crea commits y repositorios privados, publica `main` y compara el SHA local con GitHub.

Si una carpeta ya existe y no pertenece a una ejecución anterior identificada, el proceso se detiene. No sobrescribe proyectos, cambia remotos ajenos ni hace force push. Una generación interrumpida antes de escribir su marcador debe revisarse manualmente o repetirse en otro destino. Las validaciones completadas quedan registradas para permitir reintentos; si se modifica el código entre reintentos, ejecutar nuevamente las comprobaciones antes de publicar.

La primera ejecución necesita acceso a GitHub y npm. El script no instala herramientas globales ni adquiere servicios de pago. Las migraciones, el servidor y los pagos no se ejecutan durante el primer push.

## Ejecutar la tienda

Después de preparar los repositorios:

```sh
cd "$HOME/Documents/GitHub/vantelier-storefront"
npm run dev
```

Abrir http://localhost:3200.

También se puede ejecutar directamente desde la carpeta original con `npm run dev`, sin publicar ni preparar el backend.

## Ejecutar Medusa

Con Docker instalado y ejecutándose:

```sh
cd "$HOME/Documents/GitHub/vantelier-backend"
docker compose --env-file .env.local up -d --wait
cd apps/backend
npx medusa db:migrate
npm run dev
```

Abrir http://localhost:9000/app. El README generado del backend explica cómo crear el usuario administrador. Configurar región Colombia, COP, canal de ventas, clave publicable, productos y existencias en el administrador.

## Estado de integración

La preparación crea dos proyectos ejecutables por separado. La tienda de marca mantiene datos demo; todavía no consume el catálogo de Medusa ni implementa su checkout. El adaptador Shopify anterior se conserva como referencia. El siguiente desarrollo es adaptar la tienda al flujo de Medusa y validar una pasarela colombiana. No activar pagos manuales de prueba como si fueran cobros reales.

## Comprobación realizada en el entorno de trabajo

Se verifican localmente la sintaxis del preparador, la exclusión de credenciales al copiar, la configuración de desarrollo y las pruebas/build del frontend. La descarga de Medusa, el build del backend, las migraciones y los commits remotos solo pueden verificarse cuando el preparador se ejecuta en una terminal con red y acceso de escritura a Git.

Referencias oficiales:

- https://docs.medusajs.com/resources/create-medusa-app
- https://docs.medusajs.com/learn/installation
