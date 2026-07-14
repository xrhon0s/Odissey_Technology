# Odissey Technology

Ecommerce colombiano de accesorios tecnológicos. El MVP reúne tienda pública, checkout, pagos manuales y administración en un monolito modular, con COP y español como valores predeterminados.

## Stack

Next.js (App Router), React, TypeScript estricto, Tailwind CSS y pnpm. La arquitectura incorpora PostgreSQL/Supabase, Drizzle, Zod, Cloudinary, Resend, Sentry, GA4, Vitest y Playwright conforme se implementen sus dominios. El MVP comienza con transferencias verificadas manualmente; una pasarela podrá incorporarse después de validar el negocio.

## Requisitos

- Node.js 20.9 o superior
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

| Comando             | Uso                             |
| ------------------- | ------------------------------- |
| `pnpm dev`          | Servidor local                  |
| `pnpm build`        | Build de producción             |
| `pnpm start`        | Ejecutar el build               |
| `pnpm lint`         | ESLint                          |
| `pnpm typecheck`    | TypeScript sin emitir archivos  |
| `pnpm test`         | Pruebas unitarias               |
| `pnpm test:watch`   | Vitest interactivo              |
| `pnpm format:check` | Verificar formato               |
| `pnpm format`       | Aplicar formato                 |
| `pnpm db:generate`  | Generar migraciones             |
| `pnpm db:check`     | Validar migraciones             |
| `pnpm db:migrate`   | Aplicar migraciones localmente  |
| `pnpm db:seed`      | Cargar catálogo de demostración |
| `pnpm db:studio`    | Abrir Drizzle Studio            |
| `pnpm db:start`     | Iniciar PostgreSQL con Docker   |
| `pnpm db:stop`      | Detener PostgreSQL local        |

## Variables de entorno

`.env.example` documenta todas las integraciones previstas con valores ficticios. Copia únicamente las variables necesarias a `.env.local`; nunca confirmes credenciales. La validación con Zod se añadirá junto con cada integración para no exigir servicios todavía inactivos.

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
