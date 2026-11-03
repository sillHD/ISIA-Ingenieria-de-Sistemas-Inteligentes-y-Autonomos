import 'server-only'
import { crearClienteAdmin } from '@/lib/supabase/server'
import { supabaseServidorListo } from '@/lib/supabase/config'
import { type Ficha, type Fuente } from './modelo'

const columnas='id,slug,titulo,institucion,resumen,descripcion,categorias,publicos,areas,ambito,pais_region,beneficios,requisitos,fecha_apertura,fecha_cierre,permanente,procedimiento,url_oficial,url_postulacion,documentos,estado_vigencia,estado_editorial,edicion,posible_duplicado_id,revisado_en,actualizado_en'
const sinMigracion=(code?:string)=>code==='PGRST205'||code==='42P01'
export async function listarPublicas():Promise<Ficha[]> {
 if(!supabaseServidorListo())return []
 const todas:Ficha[]=[]
 for(let inicio=0;;inicio+=300){
  const {data,error}=await crearClienteAdmin().from('convocatorias').select(columnas)
   .eq('estado_editorial','publicada').order('publicado_en',{ascending:false}).range(inicio,inicio+299)
  if(error){if(sinMigracion(error.code))return [];throw new Error(error.message)}
  const pagina=(data??[]) as Ficha[];todas.push(...pagina);if(pagina.length<300)break
 }
 return todas
}
export async function obtenerPublica(slug:string):Promise<Ficha|undefined>{
 if(!supabaseServidorListo())return undefined
 const {data,error}=await crearClienteAdmin().from('convocatorias').select(columnas)
  .eq('slug',slug).eq('estado_editorial','publicada').maybeSingle()
 if(error){if(sinMigracion(error.code))return undefined;throw new Error(error.message)}
 return data as Ficha|undefined
}
export async function listarAdmin():Promise<Ficha[]>{
 const todas:Ficha[]=[]
 for(let inicio=0;;inicio+=300){
  const {data,error}=await crearClienteAdmin().from('convocatorias').select(columnas)
   .order('actualizado_en',{ascending:false}).range(inicio,inicio+299)
  if(error)throw new Error(error.message)
  const pagina=(data??[]) as Ficha[]
  todas.push(...pagina)
  if(pagina.length<300)break
 }
 return todas
}
export async function obtenerAdmin(id:string):Promise<Ficha|undefined>{
 const {data,error}=await crearClienteAdmin().from('convocatorias').select(columnas).eq('id',id).maybeSingle()
 if(error)throw new Error(error.message);return data as Ficha|undefined
}
export async function cambiosPendientes(id:string){
 const {data,error}=await crearClienteAdmin().from('convocatorias_cambios').select('id,datos_propuestos,detectado_en')
  .eq('convocatoria_id',id).eq('estado','pendiente').order('detectado_en',{ascending:false})
 if(error)throw new Error(error.message)
 return (data??[]) as {id:number;datos_propuestos:Record<string,unknown>;detectado_en:string}[]
}
export async function listarFuentes():Promise<Fuente[]>{
 const {data,error}=await crearClienteAdmin().from('convocatorias_fuentes').select('*').order('nombre')
 if(error)throw new Error(error.message);return (data??[]) as Fuente[]
}
export async function programacion(){
 const {data,error}=await crearClienteAdmin().from('convocatorias_programacion').select('*').eq('id',true).single()
 if(error)throw new Error(error.message);return data as {interval_days:number;last_successful_run:string|null;
 next_scheduled_run:string;last_run_status:string|null;last_run_started_at:string|null;
 last_run_finished_at:string|null;consecutive_failures:number}
}
export async function ejecuciones(){
 const {data,error}=await crearClienteAdmin().from('convocatorias_ejecuciones').select('*').order('iniciada_en',{ascending:false}).limit(30)
 if(error)throw new Error(error.message);return (data??[]) as {id:string;tipo:string;estado:string;iniciada_en:string;
 fuentes_procesadas:number;nuevos:number;actualizados:number;duplicados:number;errores:string[]}[]
}
