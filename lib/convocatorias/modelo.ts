import { z } from 'zod'

export const CATEGORIAS = ['Investigación y financiación','Becas, pasantías y movilidad','Retos y competencias tecnológicas','Innovación y emprendimiento','Colaboración académica y científica'] as const
export const PUBLICOS = ['Estudiantes de pregrado','Estudiantes de posgrado','Grupos y semilleros de investigación'] as const
export const AREAS = ['Inteligencia artificial','Aprendizaje automático','Visión artificial','Robótica','Drones','Sistemas autónomos','Electrónica','Hardware y firmware','Sistemas embebidos','Automatización','Control','Redes y comunicaciones','Instrumentación y adquisición de datos','Sensórica','Energía y sistemas inteligentes'] as const
export const ESTADOS = ['Disponible','Vencida','Por verificar'] as const
export const AMBITOS = ['Colombia','Internacional'] as const

export function urlSegura(valor: string): boolean {
  try {
    const u = new URL(valor)
    const h = u.hostname.toLowerCase()
    return u.protocol === 'https:' && !u.username && !u.password && !u.port &&
      h.includes('.') && !h.endsWith('.local') && !h.endsWith('.internal') &&
      !/^\d+\.\d+\.\d+\.\d+$/.test(h) && !h.includes(':')
  } catch { return false }
}

export const fichaSchema = z.object({
  titulo: z.string().trim().min(5).max(250), institucion: z.string().trim().min(3).max(200),
  resumen: z.string().trim().max(320), descripcion: z.string().trim().max(15000),
  categorias: z.array(z.enum(CATEGORIAS)), publicos: z.array(z.enum(PUBLICOS)),
  areas: z.array(z.enum(AREAS)), ambito: z.enum(AMBITOS), paisRegion: z.string().trim().max(120),
  beneficios: z.array(z.string().trim().min(1).max(500)).max(30),
  requisitos: z.array(z.string().trim().min(1).max(500)).max(30),
  fechaApertura: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
  fechaCierre: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/), permanente: z.boolean(),
  procedimiento: z.string().trim().max(5000),
  urlOficial: z.string().trim().max(2048).refine(urlSegura,'La fuente oficial debe ser una URL HTTPS pública.'),
  urlPostulacion: z.string().trim().max(2048).refine(v=>!v||urlSegura(v)),
  estadoVigencia: z.enum(ESTADOS), edicion: z.string().trim().max(80),
}).refine(v=>!v.fechaApertura||!v.fechaCierre||v.fechaApertura<=v.fechaCierre,
  { message:'El cierre debe ser posterior a la apertura.',path:['fechaCierre'] })
export type FichaEntrada = z.infer<typeof fichaSchema>

export type Ficha = {
 id:string; slug:string; titulo:string; institucion:string; resumen:string; descripcion:string;
 categorias:(typeof CATEGORIAS)[number][]; publicos:(typeof PUBLICOS)[number][];
 areas:(typeof AREAS)[number][]; ambito:(typeof AMBITOS)[number]; pais_region:string;
 beneficios:string[]; requisitos:string[]; fecha_apertura:string|null; fecha_cierre:string|null;
 permanente:boolean; procedimiento:string|null; url_oficial:string|null; url_postulacion:string|null;
 documentos:{etiqueta:string;url:string}[]; estado_vigencia:(typeof ESTADOS)[number];
 estado_editorial:'pendiente'|'publicada'|'rechazada'|'archivada'; edicion:string|null;
 posible_duplicado_id:string|null; revisado_en:string|null; actualizado_en:string;
}
export type Fuente = {id:string;nombre:string;institucion:string;pais_ambito:string;
 url_oficial:string|null;url_feed:string|null;url_listado:string|null;adaptador_html:string|null;
 integracion:'manual'|'rss'|'html';habilitada:boolean;
 estado_integracion:string;ultima_consulta:string|null;ultimo_resultado:string|null;
 ultimo_error:string|null;fallos_consecutivos:number}

export function vigencia(ficha:Ficha):Ficha['estado_vigencia'] {
  const hoy = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
  return ficha.fecha_cierre && ficha.fecha_cierre < hoy ? 'Vencida' : ficha.estado_vigencia
}
export function esInstitucional(rol:string,correo:string|undefined,email:string,config:string|undefined):boolean {
  const valor=config?.trim().toLowerCase()
  return !!valor && rol==='admin' && correo?.trim().toLowerCase()===valor && email.trim().toLowerCase()===valor
}
