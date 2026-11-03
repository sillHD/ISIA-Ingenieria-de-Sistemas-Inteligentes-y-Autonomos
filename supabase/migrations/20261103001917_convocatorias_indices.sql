-- Índices para las relaciones que pueden crecer con el catálogo.
create index convocatorias_fuente_id_idx on public.convocatorias(fuente_id);
create index convocatorias_posible_duplicado_id_idx on public.convocatorias(posible_duplicado_id);
