import 'server-only'
import { cache } from 'react'
import { supabaseServidorListo } from '@/lib/supabase/config'
import { obtenerConfiguracion } from '@/lib/supabase/contenido'
import {
  CLAVES_SECCION,
  NAVEGACION,
  NAVEGACION_PREDETERMINADA,
  type ClaveSeccion,
  type ConfiguracionNavegacion,
  type ItemNavegacion,
} from '@/lib/sitio'

export type { ConfiguracionNavegacion }

export function claveDesdeHref(href: string): ClaveSeccion | undefined {
  const clave = href.replace(/^\//, '')
  return CLAVES_SECCION.includes(clave as ClaveSeccion) ? clave as ClaveSeccion : undefined
}

export const obtenerConfiguracionNavegacion = cache(async (): Promise<ConfiguracionNavegacion> => {
  if (!supabaseServidorListo()) return NAVEGACION_PREDETERMINADA
  try {
    const datos = (await obtenerConfiguracion('navegacion'))?.secciones
    if (!datos || typeof datos !== 'object') return NAVEGACION_PREDETERMINADA
    return Object.fromEntries(
      CLAVES_SECCION.map((clave) => [
        clave,
        (datos as Record<string, unknown>)[clave] !== false,
      ]),
    ) as ConfiguracionNavegacion
  } catch {
    return NAVEGACION_PREDETERMINADA
  }
})

export const obtenerVisibilidadContenidoIlustrativo = cache(async (): Promise<boolean> => {
  if (!supabaseServidorListo()) return true
  try {
    const datos = await obtenerConfiguracion('contenido_demo')
    return datos?.mostrar !== false
  } catch {
    return true
  }
})

export async function seccionVisible(clave: ClaveSeccion): Promise<boolean> {
  return (await obtenerConfiguracionNavegacion())[clave]
}

export async function navegacionVisible(): Promise<ItemNavegacion[]> {
  const configuracion = await obtenerConfiguracionNavegacion()
  const grupos: Record<string, ClaveSeccion[]> = {
    '/semillero': ['lineas', 'grupos', 'publicaciones'],
    '/proyectos': ['proyectos'],
    '/oportunidades': ['practicas','convocatorias'],
    '/comunidad': ['integrantes', 'grupos'],
    '/actividades': ['novedades', 'reuniones', 'galeria'],
  }
  return NAVEGACION.filter((item) => {
    const claves = grupos[item.href]
    return !claves || claves.some((clave) => configuracion[clave])
  })
}
