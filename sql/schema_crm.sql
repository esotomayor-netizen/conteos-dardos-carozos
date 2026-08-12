-- Esquema para el CRM de captación de productores (agrónomos)
create table if not exists agronomos (
  id serial primary key,
  nombre text not null,
  email text,
  telefono text,
  created_at timestamptz not null default now()
);

create table if not exists productores (
  id serial primary key,
  razon_social text not null,
  codigo_sag text,
  dueno_nombre text,
  dueno_telefono text,
  dueno_email text,
  administrador_nombre text,
  administrador_telefono text,
  administrador_email text,
  region text,
  provincia text,
  comuna text,
  direccion text,
  agronomo_id integer references agronomos(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists productor_cultivos (
  id serial primary key,
  productor_id integer not null references productores(id) on delete cascade,
  especie text not null,
  variedad text,
  kilos integer,
  created_at timestamptz not null default now()
);

create table if not exists seguimientos (
  id serial primary key,
  productor_id integer not null references productores(id) on delete cascade,
  agronomo_id integer references agronomos(id) on delete set null,
  canal text not null check (canal in ('mail', 'telefono', 'visita', 'whatsapp', 'otro')),
  estado text not null check (
    estado in ('pendiente', 'contactado', 'interesado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido', 'sin_respuesta')
  ),
  fecha date not null default current_date,
  proximo_seguimiento date,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists idx_productores_comuna on productores(comuna);
create index if not exists idx_productores_region on productores(region);
create index if not exists idx_productores_agronomo on productores(agronomo_id);
create index if not exists idx_productor_cultivos_productor on productor_cultivos(productor_id);
create index if not exists idx_productor_cultivos_especie on productor_cultivos(especie);
create index if not exists idx_seguimientos_productor on seguimientos(productor_id);
create index if not exists idx_seguimientos_fecha on seguimientos(fecha);
create index if not exists idx_seguimientos_proximo on seguimientos(proximo_seguimiento);
