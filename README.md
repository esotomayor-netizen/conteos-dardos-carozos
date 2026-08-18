# CRM Captación de Productores

CRM para el equipo de agrónomos: seguimiento de contactos, dashboard ejecutivo, tablero tipo Kanban y calendario de captación de productores de fruta.

Stack: Next.js (App Router) + Neon Postgres (`@neondatabase/serverless`) + Tailwind, pensado para desplegar en Vercel.

## Modelo de datos

- **agronomos**: equipo comercial/agronómico que hace la captación.
- **productores**: razón social, dueño/administrador y sus contactos, ubicación (región/provincia/comuna/dirección, y coordenadas `latitud`/`longitud` para el mapa), código SAG y agrónomo asignado.
- **productor_cultivos**: especie, variedad y kilos por productor.
- **seguimientos**: historial de contactos (mail, teléfono, visita, WhatsApp) con estado (pendiente, contactado, interesado, en negociación, cerrado, sin respuesta), notas y próxima fecha de seguimiento.

## Configuración

1. Crea una base de datos en [Neon](https://neon.tech) y copia la cadena de conexión.
2. Copia `.env.example` a `.env.local` y completa `DATABASE_URL`.
3. Ejecuta el esquema SQL en tu base de datos:

   ```bash
   psql "$DATABASE_URL" -f sql/schema_crm.sql
   ```

4. (Opcional) Importa la base de productores exportada desde Excel (`data/productores.json`, 792 productores):

   ```bash
   node --env-file=.env.local scripts/seed-crm.mjs
   ```

5. (Opcional, para el mapa) Consigue una API key de Google Maps con la **Geocoding API** y la **Maps JavaScript API** habilitadas, agrégala a `.env.local` como `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` y `GOOGLE_MAPS_API_KEY` (puede ser la misma key), y geocodifica las direcciones:

   ```bash
   node --env-file=.env.local scripts/geocode-productores.mjs
   ```

   Es seguro volver a correrlo: solo geocodifica los productores que aún no tengan coordenadas.

6. (Opcional, recomendado) Define `CRM_ACCESS_PASSWORD` en `.env.local` para pedir una clave única
   del equipo antes de entrar a cualquier página (ver [Acceso con clave](#acceso-con-clave)).

7. Instala dependencias y levanta el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

8. Abre [http://localhost:3000](http://localhost:3000) (redirige a `/dashboard`).

## Acceso con clave

La plataforma se puede proteger con una sola clave compartida por todo el equipo (sin cuentas
individuales). Al definir la variable de entorno `CRM_ACCESS_PASSWORD`, cualquier visita queda
redirigida a `/login` hasta ingresar esa clave; luego se guarda una cookie de sesión (30 días) y
aparece un botón "Cerrar sesión" en el header. Si `CRM_ACCESS_PASSWORD` no está definida, la app
queda sin clave (comportamiento anterior).

Para activarla en producción: agrega `CRM_ACCESS_PASSWORD` en Vercel → tu proyecto → Settings →
Environment Variables, y vuelve a desplegar.

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Define la variable de entorno `DATABASE_URL` con la cadena de conexión de Neon.
3. (Opcional, para el mapa) Define `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` con tu API key de Google Maps.
4. (Opcional) Define `CRM_ACCESS_PASSWORD` para pedir clave de acceso (ver arriba).
5. Despliega. Vercel detecta automáticamente el proyecto Next.js.

## Flujo de uso

1. Registra al equipo en **Agrónomos** (`/agronomos`).
2. En **Productores** (`/productores`) revisa la base cargada desde Excel, filtra por comuna, especie, estado de contacto o agrónomo asignado, y asigna cada productor a un agrónomo.
3. Entra al detalle de un productor para ver sus datos de contacto, cultivos/kilos y **registrar cada llamada, mail o visita** con estado y notas.
4. En **Sugerencias** (`/sugerencias`) revisa la propuesta de contactos priorizada por seguimientos vencidos, leads sin próxima fecha y productores nunca contactados, filtrable por especie.
5. En **Tablero** (`/pipeline`) gestiona el pipeline de captación arrastrando productores entre etapas, estilo Kanban.
6. En **Calendario** (`/calendario`) sigue la trazabilidad día a día de seguimientos vencidos, programados y realizados.
7. En **Dashboard** (`/dashboard`) el equipo ve KPIs, contactos por canal/especie, embudo de conversión, ranking de agrónomos y tendencia de captación.
