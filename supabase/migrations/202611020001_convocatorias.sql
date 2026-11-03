-- Catálogo privado para lectura y gestión exclusivamente desde el servidor.
create table public.convocatorias_fuentes (
 id uuid primary key default gen_random_uuid(), nombre text not null unique,
 institucion text not null, pais_ambito text not null,
 url_oficial text, url_feed text, integracion text not null default 'manual'
   check (integracion in ('manual','rss')),
 habilitada boolean not null default false,
 estado_integracion text not null default 'Pendiente de evaluación',
 ultima_consulta timestamptz, ultimo_resultado text, ultimo_error text,
 fallos_consecutivos integer not null default 0 check (fallos_consecutivos >= 0),
 actualizado_en timestamptz not null default now(),
 check (not habilitada or (integracion = 'rss' and url_oficial is not null and url_feed is not null))
);
create table public.convocatorias (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 fuente_id uuid references public.convocatorias_fuentes(id) on delete set null,
 clave_dedupe text unique, huella_contenido text, id_oficial text, edicion text,
 titulo text not null, institucion text not null, resumen text not null default '',
 descripcion text not null default '',
 categorias text[] not null default '{}', publicos text[] not null default '{}',
 areas text[] not null default '{}', beneficios text[] not null default '{}',
 requisitos text[] not null default '{}',
 ambito text not null default 'Internacional' check (ambito in ('Colombia','Internacional')),
 pais_region text not null default '', fecha_apertura date, fecha_cierre date,
 permanente boolean not null default false, procedimiento text,
 url_oficial text, url_postulacion text, documentos jsonb not null default '[]'::jsonb,
 estado_vigencia text not null default 'Por verificar'
   check (estado_vigencia in ('Disponible','Vencida','Por verificar')),
 estado_editorial text not null default 'pendiente'
   check (estado_editorial in ('pendiente','publicada','rechazada','archivada')),
 posible_duplicado_id uuid references public.convocatorias(id) on delete set null,
 editado_manualmente_en timestamptz, revisado_en timestamptz,
 publicado_en timestamptz, creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now(),
 check (jsonb_typeof(documentos) = 'array'),
 check (url_oficial is null or url_oficial ~* '^https://[^/]+'),
 check (url_postulacion is null or url_postulacion ~* '^https://[^/]+'),
 check (estado_editorial <> 'publicada' or
   (url_oficial is not null and cardinality(categorias)>0 and cardinality(publicos)>0
    and cardinality(beneficios)>0 and length(trim(descripcion))>0 and revisado_en is not null))
);
create index convocatorias_publicas_idx on public.convocatorias
 (estado_editorial,estado_vigencia,fecha_cierre,publicado_en desc);
create table public.convocatorias_cambios (
 id bigint generated always as identity primary key,
 convocatoria_id uuid not null references public.convocatorias(id) on delete cascade,
 datos_propuestos jsonb not null, huella_contenido text not null,
 estado text not null default 'pendiente' check (estado in ('pendiente','aplicado','rechazado')),
 detectado_en timestamptz not null default now(), resuelto_en timestamptz,
 unique (convocatoria_id,huella_contenido)
);
create table public.convocatorias_ejecuciones (
 id uuid primary key default gen_random_uuid(),
 tipo text not null check (tipo in ('manual','automatica')),
 estado text not null default 'en_curso'
   check (estado in ('en_curso','correcta','parcial','fallida')),
 iniciada_en timestamptz not null default now(), finalizada_en timestamptz,
 fuentes_procesadas integer not null default 0, nuevos integer not null default 0,
 actualizados integer not null default 0, duplicados integer not null default 0,
 errores jsonb not null default '[]'::jsonb,
 detalle_fuentes jsonb not null default '[]'::jsonb
);
create table public.convocatorias_programacion (
 id boolean primary key default true check(id),
 interval_days integer not null default 4 check(interval_days between 1 and 90),
 last_successful_run timestamptz,
 next_scheduled_run timestamptz not null default (now()+interval '4 days'),
 last_run_status text, last_run_started_at timestamptz,
 last_run_finished_at timestamptz, consecutive_failures integer not null default 0,
 active_run_id uuid references public.convocatorias_ejecuciones(id),
 lease_expires_at timestamptz
);
insert into public.convocatorias_programacion(id) values(true);
insert into public.convocatorias_fuentes(nombre,institucion,pais_ambito) values
 ('Minciencias','Ministerio de Ciencia, Tecnología e Innovación','Colombia'),
 ('Investigación UNAL','Universidad Nacional de Colombia','Colombia'),
 ('Relaciones interinstitucionales UNAL','Universidad Nacional de Colombia','Colombia'),
 ('ICETEX','ICETEX','Colombia'),('EURAXESS','EURAXESS','Internacional'),
 ('Funding & Tenders','Comisión Europea','Internacional'),
 ('DAAD','DAAD','Internacional'),('IEEE y sociedades técnicas','IEEE','Internacional'),
 ('Universidades y laboratorios internacionales','Instituciones por evaluar','Internacional'),
 ('Erasmus+ movilidad y cooperación','Comisión Europea','Internacional'),
 ('Erasmus Mundus','Comisión Europea','Internacional');
alter table public.convocatorias_fuentes enable row level security;
alter table public.convocatorias enable row level security;
alter table public.convocatorias_cambios enable row level security;
alter table public.convocatorias_ejecuciones enable row level security;
alter table public.convocatorias_programacion enable row level security;
revoke all on public.convocatorias_fuentes,public.convocatorias,public.convocatorias_cambios,
 public.convocatorias_ejecuciones,public.convocatorias_programacion from anon,authenticated;
grant all on public.convocatorias_fuentes,public.convocatorias,public.convocatorias_cambios,
 public.convocatorias_ejecuciones,public.convocatorias_programacion to service_role;
grant usage,select on sequence public.convocatorias_cambios_id_seq to service_role;
create function public.iniciar_busqueda_convocatorias(p_tipo text,p_forzar boolean default false)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if p_tipo not in ('manual','automatica') then raise exception 'tipo inválido'; end if;
 update public.convocatorias_programacion set lease_expires_at=now()+interval '6 minutes',
  last_run_status='en_curso',last_run_started_at=now()
 where id=true and (active_run_id is null or lease_expires_at<now())
  and (p_forzar or next_scheduled_run<=now());
 if not found then return null; end if;
 insert into public.convocatorias_ejecuciones(tipo) values(p_tipo) returning id into v_id;
 update public.convocatorias_programacion set active_run_id=v_id where id=true;
 return v_id;
end $$;
create function public.finalizar_busqueda_convocatorias(
 p_id uuid,p_estado text,p_fuentes integer,p_nuevos integer,p_actualizados integer,
 p_duplicados integer,p_errores jsonb,p_detalle jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare v_fallos integer; v_dias integer;
begin
 if p_estado not in ('correcta','parcial','fallida') then raise exception 'estado inválido'; end if;
 update public.convocatorias_ejecuciones set estado=p_estado,finalizada_en=now(),
  fuentes_procesadas=p_fuentes,nuevos=p_nuevos,actualizados=p_actualizados,
  duplicados=p_duplicados,errores=p_errores,detalle_fuentes=p_detalle
 where id=p_id and estado='en_curso';
 if not found then raise exception 'ejecución no activa'; end if;
 select consecutive_failures,interval_days into v_fallos,v_dias
  from public.convocatorias_programacion where id=true for update;
 update public.convocatorias_programacion set active_run_id=null,lease_expires_at=null,
  last_run_status=p_estado,last_run_finished_at=now(),
  last_successful_run=case when p_estado='correcta' then now() else last_successful_run end,
  consecutive_failures=case when p_estado='correcta' then 0 else least(v_fallos+1,3) end,
  next_scheduled_run=case when p_estado='correcta' then now()+make_interval(days=>v_dias)
   when v_fallos<2 then now()+interval '1 day' else now()+make_interval(days=>v_dias) end
 where id=true and active_run_id=p_id;
 if not found then raise exception 'lease reemplazado'; end if;
end $$;
revoke all on function public.iniciar_busqueda_convocatorias(text,boolean) from public,anon,authenticated;
revoke all on function public.finalizar_busqueda_convocatorias(uuid,text,integer,integer,integer,integer,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.iniciar_busqueda_convocatorias(text,boolean) to service_role;
grant execute on function public.finalizar_busqueda_convocatorias(uuid,text,integer,integer,integer,integer,jsonb,jsonb) to service_role;
