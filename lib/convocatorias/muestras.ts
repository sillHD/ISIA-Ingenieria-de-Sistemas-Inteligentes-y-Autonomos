import 'server-only'
import type { Ficha } from './modelo'

export const entornoRevision=()=>process.env.NODE_ENV==='development'||process.env.VERCEL_ENV==='preview'
const base:Omit<Ficha,'id'|'slug'|'titulo'|'resumen'|'categorias'|'publicos'|'areas'|'estado_vigencia'|'fecha_cierre'>={
 institucion:'Institución de muestra',descripcion:'Ficha ficticia para revisar la presentación del módulo.',
 ambito:'Colombia',pais_region:'Región de muestra',beneficios:['Beneficio de muestra, no verificado'],
 requisitos:[],fecha_apertura:null,permanente:false,procedimiento:null,url_oficial:null,
 url_postulacion:null,documentos:[],estado_editorial:'pendiente',edicion:null,
 posible_duplicado_id:null,revisado_en:null,actualizado_en:'2026-11-02T00:00:00Z',
}
const muestras:Ficha[]=[
 {...base,id:'muestra-1',slug:'muestra-movilidad',titulo:'Muestra visual: movilidad académica',resumen:'Ejemplo ficticio, no corresponde a una oportunidad real.',categorias:['Becas, pasantías y movilidad'],publicos:['Estudiantes de pregrado','Estudiantes de posgrado'],areas:['Robótica'],estado_vigencia:'Disponible',fecha_cierre:'2027-02-15'},
 {...base,id:'muestra-2',slug:'muestra-investigacion',titulo:'Muestra visual: investigación',resumen:'Ejemplo ficticio de una ficha histórica.',categorias:['Investigación y financiación','Colaboración académica y científica'],publicos:['Grupos y semilleros de investigación'],areas:['Sensórica'],estado_vigencia:'Vencida',fecha_cierre:'2026-09-30'},
 {...base,id:'muestra-3',slug:'muestra-reto',titulo:'Muestra visual: reto tecnológico',resumen:'Ejemplo ficticio con vigencia no confirmada.',categorias:['Retos y competencias tecnológicas','Innovación y emprendimiento'],publicos:['Estudiantes de pregrado'],areas:['Hardware y firmware'],estado_vigencia:'Por verificar',fecha_cierre:null},
]
export function listarMuestras(vista?:string):Ficha[]{return entornoRevision()&&vista==='ejemplo'?muestras:[]}
export function obtenerMuestra(slug:string,vista?:string):Ficha|undefined{return listarMuestras(vista).find(x=>x.slug===slug)}
