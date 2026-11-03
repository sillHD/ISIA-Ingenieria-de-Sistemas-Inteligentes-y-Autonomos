-- Listados HTML de origen controlado; las fuentes permanecen deshabilitadas
-- hasta documentar el permiso de consulta y validar el adaptador en operación.
alter table public.convocatorias_fuentes
 add column url_listado text,
 add column adaptador_html text;
alter table public.convocatorias_fuentes
 drop constraint convocatorias_fuentes_integracion_check,
 add constraint convocatorias_fuentes_integracion_check
  check (integracion in ('manual','rss','html')),
 drop constraint convocatorias_fuentes_check,
 add constraint convocatorias_fuentes_check
  check (not habilitada or
   (integracion='rss' and url_oficial is not null and url_feed is not null) or
   (integracion='html' and url_oficial is not null and url_listado is not null
    and adaptador_html in ('minciencias','dima')));
alter table public.convocatorias_fuentes
 add constraint convocatorias_fuentes_adaptador_html_check
 check (adaptador_html is null or adaptador_html in ('minciencias','dima'));

update public.convocatorias_fuentes set
 url_oficial='https://minciencias.gov.co/convocatorias/todas',
 url_listado='https://minciencias.gov.co/convocatorias/todas',
 adaptador_html='minciencias',integracion='html',
 estado_integracion='Adaptador HTML listo; permiso de consulta pendiente'
where nombre='Minciencias' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://investigacion.manizales.unal.edu.co/convocatorias/',
 url_listado='https://investigacion.manizales.unal.edu.co/convocatorias/',
 adaptador_html='dima',integracion='html',
 estado_integracion='Adaptador HTML listo; permiso de consulta pendiente'
where nombre='Investigación UNAL' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://ori.medellin.unal.edu.co/convocatorias/internas.html',
 estado_integracion='Página oficial localizada; adaptador pendiente'
where nombre='Relaciones interinstitucionales UNAL' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://web.icetex.gov.co/becas/becas-para-estudios-en-el-exterior/becas-vigentes',
 estado_integracion='Página oficial localizada; adaptador pendiente'
where nombre='ICETEX' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://euraxess.ec.europa.eu/jobs/search',
 estado_integracion='Página oficial localizada; adaptador pendiente'
where nombre='EURAXESS' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home',
 estado_integracion='Portal oficial localizado; feed o API pendiente'
where nombre='Funding & Tenders' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/',
 estado_integracion='Página oficial localizada; adaptador pendiente'
where nombre='DAAD' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://students.ieee.org/student-opportunities/',
 estado_integracion='Página oficial localizada; adaptador pendiente'
where nombre='IEEE y sociedades técnicas' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://erasmus-plus.ec.europa.eu/opportunities-1',
 estado_integracion='Portal de programas localizado; modalidades por evaluar'
where nombre='Erasmus+ movilidad y cooperación' and not habilitada and url_oficial is null;
update public.convocatorias_fuentes set
 url_oficial='https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
 url_feed='https://www.eacea.ec.europa.eu/node/253/rss_en',
 integracion='rss',estado_integracion='RSS oficial localizado; contenido y permiso pendientes'
where nombre='Erasmus Mundus' and not habilitada and url_oficial is null;
