# Conteos Dardos y Carozos

Plataforma web para registrar y reportar conteos de estructuras vegetales (ramas, dardos, carozos, brotes, flores) por parcela, árbol y rama.

Stack: Next.js (App Router) + Neon Postgres (`@neondatabase/serverless`) + Tailwind, pensado para desplegar en Vercel.

## Modelo de datos

- **parcelas**: unidades de terreno/cultivo.
- **arboles**: pertenecen a una parcela.
- **ramas**: pertenecen a un árbol.
- **conteos**: registros de cantidad por tipo de estructura (`dardo`, `carozo`, `brote`, `flor`, `vegetativo`) asociados a una rama, con fecha y notas.

## Configuración

1. Crea una base de datos en [Neon](https://neon.tech) y copia la cadena de conexión.
2. Copia `.env.example` a `.env.local` y completa `DATABASE_URL`.
3. Ejecuta el esquema SQL en tu base de datos:

   ```bash
   psql "$DATABASE_URL" -f sql/schema.sql
   ```

4. Instala dependencias y levanta el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Define la variable de entorno `DATABASE_URL` con la cadena de conexión de Neon.
3. Despliega. Vercel detecta automáticamente el proyecto Next.js.

## Flujo de uso

1. Crea una **parcela**.
2. Agrega **árboles** a la parcela.
3. Agrega **ramas** a cada árbol.
4. Registra **conteos** de dardos, carozos u otras estructuras por rama.
5. Consulta los totales agregados en la página de **Resumen**.
