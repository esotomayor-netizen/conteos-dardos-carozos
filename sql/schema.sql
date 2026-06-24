-- Esquema para el conteo de estructuras vegetales (ramas, dardos, carozos)
create table if not exists parcelas (
  id serial primary key,
  nombre text not null,
  ubicacion text,
  especie text,
  created_at timestamptz not null default now()
);

create table if not exists arboles (
  id serial primary key,
  parcela_id integer not null references parcelas(id) on delete cascade,
  codigo text not null,
  variedad text,
  created_at timestamptz not null default now(),
  unique (parcela_id, codigo)
);

create table if not exists ramas (
  id serial primary key,
  arbol_id integer not null references arboles(id) on delete cascade,
  codigo text not null,
  longitud_cm numeric,
  created_at timestamptz not null default now(),
  unique (arbol_id, codigo)
);

create table if not exists conteos (
  id serial primary key,
  rama_id integer not null references ramas(id) on delete cascade,
  tipo_estructura text not null check (tipo_estructura in ('dardo', 'carozo', 'brote', 'flor', 'vegetativo')),
  cantidad integer not null check (cantidad >= 0),
  fecha date not null default current_date,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists idx_arboles_parcela on arboles(parcela_id);
create index if not exists idx_ramas_arbol on ramas(arbol_id);
create index if not exists idx_conteos_rama on conteos(rama_id);
create index if not exists idx_conteos_tipo on conteos(tipo_estructura);

-- Prospección de productores: predios externos candidatos a nuevos proveedores
create table if not exists predios_prospeccion (
  id serial primary key,
  nombre_propietario text not null,
  rut text,
  rol text,
  region text not null,
  comuna text,
  comuna_postal text,
  direccion text,
  referencia text,
  direccion_postal text,
  lat numeric,
  lng numeric,
  especie text not null,
  variedad text,
  hectareas_aprox numeric,
  ha_total_predio numeric,
  telefono text,
  email text,
  fuente text,
  estado_contacto text not null default 'sin_contactar'
    check (estado_contacto in ('sin_contactar', 'contactado', 'en_negociacion', 'proveedor_activo', 'descartado')),
  notas text,
  created_at timestamptz not null default now()
);

-- Migración no destructiva para instalaciones existentes de predios_prospeccion
alter table predios_prospeccion add column if not exists rol text;
alter table predios_prospeccion add column if not exists comuna_postal text;
alter table predios_prospeccion add column if not exists direccion text;
alter table predios_prospeccion add column if not exists referencia text;
alter table predios_prospeccion add column if not exists direccion_postal text;
alter table predios_prospeccion add column if not exists ha_total_predio numeric;

create index if not exists idx_predios_region on predios_prospeccion(region);
create index if not exists idx_predios_comuna on predios_prospeccion(comuna);
create index if not exists idx_predios_especie on predios_prospeccion(especie);
create index if not exists idx_predios_estado on predios_prospeccion(estado_contacto);
