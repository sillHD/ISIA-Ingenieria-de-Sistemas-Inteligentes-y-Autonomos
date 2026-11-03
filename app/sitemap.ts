import type { MetadataRoute } from 'next'
import { sitioIndexable } from '@/lib/indexacion'
import { urlSitio } from '@/lib/supabase/config'
import { listarIdeas, listarNovedades, listarProyectos, listarServicios } from '@/lib/contenido'
import { navegacionVisible,seccionVisible } from '@/lib/configuracion'
import { listarPublicas } from '@/lib/convocatorias/datos'

export const revalidate = 3600

const RUTAS_FIJAS = ['/', '/unete', '/privacidad']

// DEMO: sitemap vacío. Con NEXT_PUBLIC_SITIO_INDEXABLE=true lista rutas fijas,
// secciones visibles y fichas de detalle.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlSitio()
  if (!sitioIndexable() || !base) return []

  const [navegacion, proyectos, ideas, novedades, servicios] = await Promise.all([
    navegacionVisible(),
    listarProyectos(),
    listarIdeas(),
    listarNovedades(),
    listarServicios(),
  ])
  const detalle = [
    ...proyectos.map(({ slug }) => `/proyectos/${slug}`),
    ...ideas.map(({ slug }) => `/ideas/${slug}`),
    ...novedades.map(({ slug }) => `/novedades/${slug}`),
    ...servicios.map(({ slug }) => `/prototipado/${slug}`),
    ...((await seccionVisible('convocatorias'))?(await listarPublicas()).map(({slug})=>`/convocatorias/${slug}`):[]),
  ]
  const rutas = [...RUTAS_FIJAS, ...navegacion.map(({ href }) => href), ...((await seccionVisible('convocatorias'))?['/convocatorias']:[]), ...detalle]
  return [...new Set(rutas)].map((ruta) => ({ url: `${base}${ruta === '/' ? '' : ruta}` }))
}
