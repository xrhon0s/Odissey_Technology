# Odissey Technology

Ecommerce colombiano de accesorios tecnológicos. El MVP reúne tienda pública, checkout, pagos manuales y administración en un monolito modular, con COP y español como valores predeterminados.

## Stack

Next.js (App Router), React, TypeScript estricto, Tailwind CSS y pnpm. La arquitectura incorpora PostgreSQL, Supabase Auth y Storage, Drizzle, Zod y Vitest. El MVP comienza con transferencias verificadas manualmente; una pasarela podrá incorporarse después de validar el negocio.

## Requisitos

- Node.js 22 o superior
- pnpm 10.28.1
- PostgreSQL o un proyecto de Supabase (cuando se habilite persistencia)

## Instalación y ejecución

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Scripts

| Comando                   | Uso                                          |
| ------------------------- | -------------------------------------------- |
| `pnpm dev`                | Servidor local                               |
| `pnpm build`              | Build de producción                          |
| `pnpm start`              | Ejecutar el build                            |
| `pnpm lint`               | ESLint                                       |
| `pnpm typecheck`          | TypeScript sin emitir archivos               |
| `pnpm test`               | Pruebas unitarias                            |
| `pnpm test:watch`         | Vitest interactivo                           |
| `pnpm format:check`       | Verificar formato                            |
| `pnpm format`             | Aplicar formato                              |
| `pnpm db:generate`        | Generar migraciones                          |
| `pnpm db:check`           | Validar migraciones                          |
| `pnpm db:migrate`         | Aplicar migraciones localmente               |
| `pnpm db:seed`            | Cargar catálogo de demostración              |
| `pnpm db:bootstrap-admin` | Vincular el primer administrador de Supabase |
| `pnpm db:studio`          | Abrir Drizzle Studio                         |
| `pnpm db:start`           | Iniciar PostgreSQL con Docker                |
| `pnpm db:stop`            | Detener PostgreSQL local                     |

## Variables de entorno

`.env.example` documenta todas las integraciones previstas con valores ficticios. Copia únicamente las variables necesarias a `.env.local`; nunca confirmes credenciales. `DATABASE_URL` usa el pooler de transacciones para la aplicación desplegada y `MIGRATION_DATABASE_URL` usa la conexión directa o el pooler de sesión para las migraciones.

## Base de datos y migraciones

El esquema reside en `src/db/schema` y las migraciones reproducibles en `src/db/migrations`. Para generar una migración local configura `DATABASE_URL` y ejecuta `pnpm db:generate`; este comando no aplica la migración. No se deben modificar bases de producción manualmente ni ejecutar migraciones destructivas sin revisión y autorización.

### PostgreSQL local y datos de demostración

Docker permite probar el catálogo sin crear todavía un proyecto de Supabase:

```bash
pnpm db:start
cp .env.example .env.local
pnpm db:migrate
SEED_DEMO_DATA=true pnpm db:seed
pnpm dev
```

Visita `http://localhost:3000/catalogo`. El seed es idempotente y se niega a ejecutar en producción o sin `SEED_DEMO_DATA=true`. Sus productos usan SKU con prefijo `DEMO-` y no contienen imágenes externas.

Para detener la base sin eliminar sus datos:

```bash
pnpm db:stop
```

El volumen `postgres_data` conserva la información entre reinicios. Eliminar ese volumen es una operación destructiva y no forma parte del flujo normal.

## Pagos manuales

El checkout permite seleccionar Nequi, transferencia Bancolombia o efectivo contraentrega. DaviPlata permanece deshabilitado hasta completar su configuración. Las transferencias quedan pendientes de revisión manual y, cuando WhatsApp está habilitado, el comprador puede enviar el comprobante con la referencia, valor y método prellenados.

El efectivo contraentrega se valida en el servidor y solo se acepta para recogida local o entregas en los diez municipios del Valle de Aburrá: Medellín, Barbosa, Girardota, Copacabana, Bello, Itagüí, Envigado, Sabaneta, La Estrella y Caldas.

Los métodos de envío, sus precios, disponibilidad y orden se administran en `/admin/configuracion`; no es necesario modificar la base de datos para ajustar el checkout.

Al despachar un pedido, el administrador registra transportadora, número de guía, enlace de rastreo y fecha estimada. El comprador puede consultar esos datos desde `/pedido`.

## Reservas de inventario

Los pedidos pendientes reservan inventario durante 30 minutos. La tienda libera reservas vencidas durante nuevas cotizaciones y expone la ruta privada `GET /api/internal/release-reservations` para una ejecución programada. En producción configura `CRON_SECRET` con al menos 24 caracteres y programa una llamada periódica con el encabezado `Authorization: Bearer <CRON_SECRET>` desde el proveedor de despliegue elegido.

## Consulta de pedidos

El comprador puede consultar el estado en `/pedido` usando la referencia y el mismo correo de la compra. La respuesta pública muestra el avance del pedido, pago, entrega, productos y totales, pero omite dirección, teléfono e historial administrativo.

## Acceso administrativo

El panel usa Supabase Auth con sesión por cookies y vuelve a verificar en PostgreSQL que el usuario pertenezca a `admin_users` y esté activo. Sin configuración, `/admin` permanece cerrado y `/login` explica qué falta.

Para habilitar el primer propietario:

1. Crea el usuario en Supabase Auth y copia su UUID.
2. Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Define `ADMIN_AUTH_USER_ID`, `ADMIN_EMAIL`, `ADMIN_FULL_NAME` y establece temporalmente `BOOTSTRAP_ADMIN=true`.
4. Ejecuta `pnpm db:bootstrap-admin` y vuelve a dejar `BOOTSTRAP_ADMIN=false`.

No habilites registro público de administradores. Las acciones del panel verifican la sesión y la fila activa del administrador en el servidor, incluso si la ruta ya pasó por el proxy de sesión.

## Imágenes de productos

Las imágenes se guardan en Supabase Storage para evitar un proveedor y costo adicional. El panel acepta JPG, PNG, WebP y AVIF de máximo 3 MB; la lectura es pública y las operaciones de escritura se autorizan contra `admin_users` mediante RLS. Este límite conserva margen frente al máximo de carga de las funciones de Vercel.

Después de aplicar las migraciones en el proyecto de Supabase:

1. Abre el SQL Editor.
2. Ejecuta `supabase/product-images.sql` una sola vez. El script también puede repetirse para reparar la configuración.
3. Inicia sesión como administrador y usa la sección de imágenes dentro de cada producto.

No configures una llave de servicio en el navegador. Las subidas usan la sesión administrativa y la llave publicable, con las políticas de Storage como frontera de autorización.

## Información legal y datos comerciales

La tienda publica términos y condiciones, política de tratamiento de datos, política de envíos e información sobre cambios, garantías y retracto. El checkout exige aceptación expresa y cada pedido nuevo conserva la fecha y las versiones aceptadas.

Antes de abrir la tienda al público, completa en `/admin/configuracion`:

- Nombre o razón social.
- NIT o documento de identificación.
- Dirección de notificación.
- Ciudad y país.
- Correo y teléfono de atención.

El pie de página incluye un enlace visible a la Superintendencia de Industria y Comercio. Los textos incluidos son una base operativa preparada con referencia al Estatuto del Consumidor y al régimen colombiano de protección de datos; deben revisarse con asesoría jurídica usando la información real del comercio antes del lanzamiento.

## Pruebas

Ejecuta antes de entregar una unidad de trabajo:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Playwright se incorporará cuando exista el primer flujo crítico navegable.

## Estructura

- `src/app`: rutas públicas, legales, administrativas y API.
- `src/components`: componentes visuales organizados por contexto.
- `src/features`: reglas y casos de uso por dominio.
- `src/db`: esquema, consultas y migraciones.
- `src/lib`: utilidades transversales concretas.
- `src/config`: configuración validada.

## Despliegue

Los pull requests ejecutan verificaciones en GitHub Actions. Tras aprobación y merge a `main`, Vercel será el destino previsto; cualquier despliegue y migración de producción requiere autorización explícita.

Consulta [CONTRIBUTING.md](./CONTRIBUTING.md) para el flujo de trabajo y [AGENTS.md](./AGENTS.md) para las reglas de implementación.
