-- La tarjeta pública siempre debe tener un resumen propio antes de aprobarse.
alter table public.convocatorias drop constraint convocatorias_check;
alter table public.convocatorias add constraint convocatorias_check
 check (estado_editorial <> 'publicada' or
  (url_oficial is not null and cardinality(categorias)>0 and cardinality(publicos)>0
   and cardinality(beneficios)>0 and length(trim(resumen)) between 1 and 320
   and length(trim(descripcion))>0 and revisado_en is not null));
