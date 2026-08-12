-- Migración: agrega columnas de coordenadas a productores (para el mapa).
-- Ejecuta esto una sola vez si tu base ya existía antes de este cambio.
alter table productores add column if not exists latitud numeric(9, 6);
alter table productores add column if not exists longitud numeric(9, 6);
