# Convocatorias: operación y preparación de producción

## Estado de esta rama

El módulo usa Next.js 15, las sesiones y roles existentes y Supabase. Incluye listado y detalle públicos, fichas pendientes de aprobación, catálogo de fuentes, un conector RSS/Atom, ejecución manual y programada, historial y migración. Las fichas de `?vista=ejemplo` son ficticias, se identifican como tales y están excluidas de indexación.

Las fuentes aprobadas figuran inicialmente deshabilitadas: **no se ha confirmado ninguna URL RSS/Atom ni permiso de consulta automatizada**. Por ello, el motor queda preparado, pero una búsqueda ahora debe terminar como fallida y registrar esa causa. No se publican fichas ficticias como reales.

## Activación paso a paso

1. Revisar y aplicar `supabase/migrations/202611020001_convocatorias.sql` al proyecto Supabase correcto, después de las migraciones anteriores. Conservar un respaldo antes de aplicarla. Verificar que aparecen las cinco tablas, las dos funciones y 11 fuentes deshabilitadas.
2. Configurar en el servidor `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` según `.env.local.example`. No publicar la clave secreta.
3. Confirmar en Supabase Auth que la cuenta institucional indicada por el semillero está autorizada con rol `admin`. Configurar `ISIA_INSTITUTIONAL_EMAIL` con ese correo en el entorno, sin guardarlo en el repositorio.
4. Configurar `CRON_SECRET` como secreto largo en el despliegue. La ruta cron requiere `Authorization: Bearer <CRON_SECRET>` y el cron diario comprueba la fecha persistida antes de trabajar. El intervalo inicial es de cuatro días. La hora del cron es 09:00 UTC (04:00 Colombia); si una búsqueda manual termina entre disparos, puede haber hasta un día de retraso en el siguiente disparo.
5. Abrir `/admin/convocatorias/fuentes`. Para cada fuente, confirmar una página institucional, un feed oficial RSS/Atom en el mismo dominio y que su consulta automatizada esté permitida. Registrar la evidencia fuera del feed si corresponde; habilitar solo fuentes verificadas. Los otros tipos de fuente permanecen en estado manual hasta contar con un conector aprobado.
6. Abrir `/admin/convocatorias/programacion` con la cuenta institucional. Revisar intervalo y fecha siguiente. Pulsar **Buscar ahora** tras habilitar al menos una fuente, consultar historial y fichas pendientes, corregir los datos no verificados, y aprobar solo con fuente oficial válida.
7. Revisar en `/convocatorias` el filtro por público, categoría, región, vigencia y área. Comprobar `/convocatorias/[slug]`, enlaces oficiales, estado vencido y vista móvil. Probar acceso de un visitante, un editor y un administrador distinto de la cuenta institucional.
8. Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` en el entorno de revisión. Verificar los registros del cron y la persistencia tras un nuevo despliegue. Realizar la última revisión institucional antes de promover a producción.

## Política operativa

- Cada registro importado entra como **pendiente**, con vigencia **Por verificar**. La clasificación por palabras clave es una sugerencia; el administrador confirma públicos, categorías y beneficios antes de publicar.
- Las fichas publicadas conservan los datos aprobados. Los cambios detectados se guardan en `convocatorias_cambios` para revisión; no se aplican automáticamente.
- Una fuente fallida queda registrada y no elimina resultados válidos de otras fuentes. Una ejecución parcial o fallida no actualiza `last_successful_run`; se reintenta una vez al día durante dos intentos y después vuelve al intervalo configurado, sin bucle ilimitado.
- La búsqueda tiene un lease de seis minutos y el cron una duración máxima de cinco. Para una fuente grande, ajustar límites solo después de medir en el entorno real.
- Este conector admite RSS/Atom. No inventa APIs, feeds ni convocatorias y no accede a HTML/PDF de fuentes sin integración aprobada.

## Recuperación

Si la migración falla, corregir el error antes de reintentar y no borrar tablas o datos existentes. Si una fuente falla, deshabilitarla desde el panel, revisar su URL y sus términos, y consultar `convocatorias_ejecuciones`. Un respaldo de Supabase y el historial editorial son necesarios para restaurar el servicio; no se configura despliegue de producción desde esta rama.
