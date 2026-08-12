# Conteos Dardos y Carozos

Plataforma web para registrar y reportar conteos de estructuras vegetales (ramas, dardos, carozos, brotes, flores) por parcela, árbol y rama, y CRM de captación de productores para el equipo de agrónomos.

Stack: Next.js (App Router) + Neon Postgres (`@neondatabase/serverless`) + Tailwind, pensado para desplegar en Vercel.

## Modelo de datos

Conteo de estructuras:
- **parcelas**: unidades de terreno/cultivo.
- **arboles**: pertenecen a una parcela.
- **ramas**: pertenecen a un árbol.
- **conteos**: registros de cantidad por tipo de estructura (`dardo`, `carozo`, `brote`, `flor`, `vegetativo`) asociados a una rama, con fecha y notas.

CRM de captación (`/productores`, `/productores/zonas`, `/agronomos`):
- **agronomos**: equipo comercial/agronómico que hace la captación.
- **productores**: razón social, dueño/administrador y sus contactos, ubicación (región/provincia/comuna/dirección, y coordenadas `latitud`/`longitud` para el mapa), código SAG y agrónomo asignado.
- **productor_cultivos**: especie, variedad y kilos por productor.
- **seguimientos**: historial de contactos (mail, teléfono, visita, WhatsApp) con estado (pendiente, contactado, interesado, en negociación, cerrado, sin respuesta), notas y próxima fecha de seguimiento.

## Configuración

1. Crea una base de datos en [Neon](https://neon.tech) y copia la cadena de conexión.
2. Copia `.env.example` a `.env.local` y completa `DATABASE_URL`.
3. Ejecuta los esquemas SQL en tu base de datos:

   ```bash
   psql "$DATABASE_URL" -f sql/schema.sql
   psql "$DATABASE_URL" -f sql/schema_crm.sql
   ```

4. (Opcional) Importa la base de productores exportada desde Excel (`data/productores.json`, 241 productores):

   ```bash
   node --env-file=.env.local scripts/seed-crm.mjs
   ```

5. (Opcional, para el mapa) Consigue una API key de Google Maps con la **Geocoding API** y la **Maps JavaScript API** habilitadas, agrégala a `.env.local` como `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` y `GOOGLE_MAPS_API_KEY` (puede ser la misma key), y geocodifica las direcciones:

   ```bash
   node --env-file=.env.local scripts/geocode-productores.mjs
   ```

   Es seguro volver a correrlo: solo geocodifica los productores que aún no tengan coordenadas.

6. Instala dependencias y levanta el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

7. Abre [http://localhost:3000](http://localhost:3000). El listado de productores está en `/productores`, el mapa por zonas en `/productores/zonas` y el equipo de agrónomos en `/agronomos`.

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Define la variable de entorno `DATABASE_URL` con la cadena de conexión de Neon.
3. (Opcional, para el mapa) Define `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` con tu API key de Google Maps.
4. Despliega. Vercel detecta automáticamente el proyecto Next.js.

## Flujo de uso

1. Crea una **parcela**.
2. Agrega **árboles** a la parcela.
3. Agrega **ramas** a cada árbol.
4. Registra **conteos** de dardos, carozos u otras estructuras por rama.
5. Consulta los totales agregados en la página de **Resumen**.

### CRM de captación

1. Registra al equipo en **Agrónomos** (`/agronomos`).
2. En **Productores** (`/productores`) revisa la base cargada desde Excel, filtra por comuna, especie, estado de contacto o agrónomo asignado, y asigna cada productor a un agrónomo.
3. Entra al detalle de un productor para ver sus datos de contacto, cultivos/kilos y **registrar cada llamada, mail o visita** con estado y notas.
4. El dashboard en `/productores` muestra kilos totales, productores contactados/pendientes y seguimientos por vencer.
5. En **Zonas** (`/productores/zonas`) el equipo ve un mapa con la ubicación de cada productor geocodificado y la lista agrupada por comuna, para planificar rutas de visita.
