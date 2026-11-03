# Convocatorias: operación y preparación de producción

## Estado de esta rama

El módulo usa Next.js 15, las sesiones y roles existentes y Supabase. Incluye listado y detalle públicos, fichas pendientes de aprobación, catálogo de fuentes, conectores RSS/Atom y HTML público de origen controlado, ejecución manual y programada, historial y migraciones. Las fichas de `?vista=ejemplo` son ficticias, se identifican como tales y están excluidas de indexación.

Las 11 fuentes aprobadas figuran inicialmente deshabilitadas. DIMA tiene un listado HTML público y EACEA un RSS oficial, pero todavía falta comprobar `robots.txt` desde el servidor de ejecución y validar el contenido del feed en el entorno real. No se encontró una exigencia de autorización escrita específica para DIMA; no debe marcarse una autorización inexistente como requisito. Minciencias mantiene condiciones expresas más restrictivas y su lector HTML está suspendido. Por ahora, una búsqueda sin fuentes habilitadas termina como fallida y registra esa causa. No se publican fichas ficticias como reales.

## Activación paso a paso

1. Las migraciones `20261103001821_202611020001_convocatorias.sql`, `20261103001917_convocatorias_indices.sql`, `20261103012238_convocatorias_html_fuentes.sql` y `20261103014350_convocatorias_resumen_editorial.sql` ya se aplicaron al proyecto `ISIA-Website`. Se verificaron cinco tablas, dos funciones, dos índices de relación y 11 fuentes deshabilitadas. Para otros entornos, aplicarlas después de las migraciones anteriores y conservar un respaldo.
2. Configurar en el servidor `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` según `.env.local.example`. No publicar la clave secreta.
3. Confirmar en Supabase Auth que la cuenta institucional indicada por el semillero está autorizada con rol `admin`. Configurar `ISIA_INSTITUTIONAL_EMAIL` con ese correo en el entorno, sin guardarlo en el repositorio.
4. Configurar `CRON_SECRET` como secreto largo en el despliegue. La ruta cron requiere `Authorization: Bearer <CRON_SECRET>` y el cron diario comprueba la fecha persistida antes de trabajar. El intervalo inicial es de cuatro días. La hora del cron es 09:00 UTC (04:00 Colombia); si una búsqueda manual termina entre disparos, puede haber hasta un día de retraso en el siguiente disparo.
5. Abrir `/admin/convocatorias/fuentes`. Para RSS, comprobar que el feed es oficial y que sus entradas son convocatorias individuales pertinentes. Para HTML público, revisar las condiciones de uso y `robots.txt`, y comprobar que el adaptador extrae títulos y enlaces de la página actual. Confirmar estas comprobaciones y habilitar solo la fuente verificada; no hace falta una carta de autorización si el sitio no la exige. El motor vuelve a consultar `robots.txt` antes de cada búsqueda y detiene la fuente si no puede comprobarlo. Las demás permanecen manuales hasta tener un conector específico probado.
6. Abrir `/admin/convocatorias/programacion` con la cuenta institucional. Revisar intervalo y fecha siguiente. Pulsar **Buscar ahora** tras habilitar al menos una fuente, consultar historial y fichas pendientes, corregir los datos no verificados, y aprobar solo con fuente oficial válida.
7. Revisar en `/convocatorias` el filtro por público, categoría, región, vigencia y área. Comprobar `/convocatorias/[slug]`, enlaces oficiales, estado vencido y vista móvil. Probar acceso de un visitante, un editor y un administrador distinto de la cuenta institucional.
8. Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` en el entorno de revisión. Verificar los registros del cron y la persistencia tras un nuevo despliegue. Realizar la última revisión institucional antes de promover a producción.

## Política operativa

- Cada registro importado entra como **pendiente**, con vigencia **Por verificar**. El recolector usa temporalmente el texto externo para clasificación y detección de cambios, pero guarda la descripción y el resumen vacíos; el administrador redacta una síntesis breve propia antes de publicar. La clasificación por palabras clave es una sugerencia; el administrador confirma públicos, categorías y beneficios.
- Las fichas publicadas conservan los datos aprobados. Los cambios detectados se guardan en `convocatorias_cambios` para revisión; no se aplican automáticamente.
- Una fuente fallida queda registrada y no elimina resultados válidos de otras fuentes. Una ejecución parcial o fallida no actualiza `last_successful_run`; se reintenta una vez al día durante dos intentos y después vuelve al intervalo configurado, sin bucle ilimitado.
- La búsqueda tiene un lease de seis minutos y el cron una duración máxima de cinco. Para una fuente grande, ajustar límites solo después de medir en el entorno real.
- Los adaptadores HTML reconocen exclusivamente los listados exactos de Minciencias y DIMA Manizales; el de Minciencias está suspendido por sus condiciones. Solo leen el índice y envían fichas a revisión; no infieren fechas ni requisitos de los detalles. El lector de DIMA descarta las tarjetas marcadas «Finalizada». Las fuentes no habilitadas no se consultan.

## Catálogo de las 11 fuentes

| Fuente | Página oficial registrada | Integración |
| --- | --- | --- |
| Minciencias | https://minciencias.gov.co/convocatorias/todas | HTML preparado, deshabilitado |
| Investigación UNAL, DIMA Manizales | https://investigacion.manizales.unal.edu.co/convocatorias/ | HTML preparado, deshabilitado |
| Relaciones interinstitucionales UNAL | https://ori.medellin.unal.edu.co/convocatorias/internas.html | Manual, adaptador pendiente |
| ICETEX | https://web.icetex.gov.co/becas/becas-para-estudios-en-el-exterior/becas-vigentes | Manual, adaptador pendiente |
| EURAXESS | https://euraxess.ec.europa.eu/jobs/search | Manual, adaptador pendiente |
| Funding & Tenders | https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home | Manual, feed/API por confirmar |
| DAAD | https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/ | Manual, adaptador pendiente |
| IEEE y sociedades técnicas | https://students.ieee.org/student-opportunities/ | Manual, adaptador pendiente |
| Universidades y laboratorios internacionales | Sin institución concreta elegida | Manual |
| Erasmus+ movilidad y cooperación | https://erasmus-plus.ec.europa.eu/opportunities-1 | Manual, modalidades por evaluar |
| Erasmus Mundus | https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en | RSS candidato: https://www.eacea.ec.europa.eu/node/253/rss_en; deshabilitado |

El RSS de EACEA entrega XML oficial, pero falta comprobar en una ejecución controlada que sus entradas representan convocatorias concretas. Un listado HTML público puede consultarse sin autorización escrita individual si sus condiciones de uso y reglas de rastreo lo permiten; la mera publicidad de la página no basta para confirmarlo. Minciencias exige autorización escrita para ciertos usos de su contenido, por lo que su conector permanece deshabilitado. Para DIMA no se encontró una exigencia específica de autorización escrita; antes de activarlo hay que comprobar sus reglas de rastreo desde el entorno de ejecución y limitar la recolección a títulos y enlaces oficiales.

## Verificación de dependencias

Se actualizaron Next.js a 15.5.28, Zod a 4.6.6 y Sharp a 0.35.5 (dependencia de Next.js). `npm audit --omit=dev` informa cero vulnerabilidades. `npm audit` completo sigue señalando avisos moderados en la cadena de ESLint y `minimatch`; son herramientas de desarrollo y la corrección automática propone versiones incompatibles con Next.js 15. Se mantuvieron ESLint y `eslint-config-next` en versiones compatibles 9.39.5 y 15.5.28.
El proyecto fija Node 24.x, la versión configurada en Vercel, para evitar que el rango anterior `>=22` seleccione automáticamente Node 26 en futuras compilaciones.

## Recuperación

Si la migración falla, corregir el error antes de reintentar y no borrar tablas o datos existentes. Si una fuente falla, deshabilitarla desde el panel, revisar su URL y sus términos, y consultar `convocatorias_ejecuciones`. Un respaldo de Supabase y el historial editorial son necesarios para restaurar el servicio; no se configura despliegue de producción desde esta rama.
