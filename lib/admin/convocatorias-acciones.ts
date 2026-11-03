'use server'
import {randomBytes} from 'node:crypto'
import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {requerirAdministrador} from '@/lib/admin/datos'
import {registrarAuditoria} from '@/lib/admin/auditoria'
import {crearClienteAdmin} from '@/lib/supabase/server'
import {AREAS,CATEGORIAS,PUBLICOS,esInstitucional,fichaSchema,urlSegura} from '@/lib/convocatorias/modelo'
import {ejecutarBusqueda} from '@/lib/convocatorias/motor'
import {listadoHtmlValido} from '@/lib/convocatorias/html'

export type Estado={ok:boolean;error?:string}
const valor=(f:FormData,k:string)=>String(f.get(k)??'').trim()
const lista=(f:FormData,k:string)=>f.getAll(k).map(String).filter(Boolean)
const lineas=(s:string)=>s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)
function revalidar(){revalidatePath('/convocatorias');revalidatePath('/oportunidades');revalidatePath('/admin/convocatorias')}
async function institucional(){const u=await requerirAdministrador();if(!esInstitucional(u.autorizado.rol,u.correo,u.autorizado.email,process.env.ISIA_INSTITUTIONAL_EMAIL))throw new Error('Solo la cuenta institucional configurada puede realizar esta operación.');return u}

export async function guardarFicha(id:string|null,_prev:Estado,f:FormData):Promise<Estado>{
 void _prev
 try{
  const u=await requerirAdministrador(),db=crearClienteAdmin()
  const entrada=fichaSchema.safeParse({titulo:valor(f,'titulo'),institucion:valor(f,'institucion'),resumen:valor(f,'resumen'),descripcion:valor(f,'descripcion'),
   categorias:lista(f,'categorias').filter(x=>CATEGORIAS.includes(x as typeof CATEGORIAS[number])),
   publicos:lista(f,'publicos').filter(x=>PUBLICOS.includes(x as typeof PUBLICOS[number])),
   areas:lista(f,'areas').filter(x=>AREAS.includes(x as typeof AREAS[number])),
   ambito:valor(f,'ambito')||'Colombia',paisRegion:valor(f,'paisRegion'),beneficios:lineas(valor(f,'beneficios')),
   requisitos:lineas(valor(f,'requisitos')),fechaApertura:valor(f,'fechaApertura'),fechaCierre:valor(f,'fechaCierre'),
   permanente:f.get('permanente')==='on',procedimiento:valor(f,'procedimiento'),urlOficial:valor(f,'urlOficial'),
   urlPostulacion:valor(f,'urlPostulacion'),estadoVigencia:valor(f,'estadoVigencia')||'Por verificar',edicion:valor(f,'edicion')})
  if(!entrada.success)return {ok:false,error:entrada.error.issues[0]?.message||'Revisa la ficha.'}
  const x=entrada.data
  const documentos=lineas(valor(f,'documentos')).map(s=>{const [etiqueta,url]=s.split('|').map(v=>v.trim());return {etiqueta,url}})
  if(documentos.some(d=>!d.etiqueta||!urlSegura(d.url)))return {ok:false,error:'Cada documento necesita un nombre y una URL HTTPS válida.'}
  const datos={titulo:x.titulo,institucion:x.institucion,resumen:x.resumen,descripcion:x.descripcion,categorias:x.categorias,publicos:x.publicos,
   areas:x.areas,ambito:x.ambito,pais_region:x.paisRegion,beneficios:x.beneficios,requisitos:x.requisitos,
   fecha_apertura:x.fechaApertura||null,fecha_cierre:x.fechaCierre||null,permanente:x.permanente,
   procedimiento:x.procedimiento||null,url_oficial:x.urlOficial,url_postulacion:x.urlPostulacion||null,
   documentos,estado_vigencia:x.estadoVigencia,edicion:x.edicion||null,actualizado_en:new Date().toISOString(),editado_manualmente_en:new Date().toISOString()}
  let recurso=id
  if(id){
   const {data:anterior,error:e}=await db.from('convocatorias').select('estado_editorial').eq('id',id).maybeSingle()
   if(e||!anterior)return {ok:false,error:'La ficha ya no existe.'}
   if(anterior.estado_editorial==='publicada'&&f.get('confirmado')!=='on')return {ok:false,error:'Confirma la evidencia antes de editar una ficha publicada.'}
   if(anterior.estado_editorial==='publicada'&&(!x.beneficios.length||!x.resumen||!x.descripcion))return {ok:false,error:'Una ficha publicada necesita resumen, beneficio y descripción confirmados.'}
   const {error}=await db.from('convocatorias').update({...datos,...(anterior.estado_editorial==='publicada'?{revisado_en:new Date().toISOString()}: {})}).eq('id',id)
   if(error)return {ok:false,error:error.message}
  }else{
   const slug=x.titulo.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60).replace(/-$/,'')||'convocatoria'
   const {data,error}=await db.from('convocatorias').insert({...datos,slug:`${slug}-${randomBytes(5).toString('hex')}`,estado_editorial:'pendiente'}).select('id').single()
   if(error)return {ok:false,error:error.message};recurso=data.id
  }
  await registrarAuditoria({usuarioId:u.id,usuarioEmail:u.correo,accion:id?'editar':'crear',recursoTipo:'convocatoria',recursoId:recurso!});revalidar()
 }catch(e){return {ok:false,error:e instanceof Error?e.message:'No se pudo guardar.'}}
 redirect('/admin/convocatorias?guardado=1')
}
export async function decidirFicha(id:string,estado:'publicada'|'rechazada'|'archivada',f:FormData){
 const u=await requerirAdministrador(),db=crearClienteAdmin()
 const {data:x,error:e}=await db.from('convocatorias').select('*').eq('id',id).maybeSingle()
 if(e||!x)throw new Error('Ficha no encontrada.')
 if(estado==='publicada'){
  if(f.get('evidencia')!=='on')throw new Error('Confirma la fuente oficial y la vigencia.')
  if(x.posible_duplicado_id&&f.get('duplicado')!=='on')throw new Error('Revisa el posible duplicado.')
  if(!urlSegura(x.url_oficial??'')||!x.categorias?.length||!x.publicos?.length||!x.beneficios?.length||!x.resumen?.trim()||!x.descripcion?.trim()||
   x.beneficios.some((b:string)=>b.startsWith('Posible ')))throw new Error('Completa y verifica los datos antes de aprobar.')
  if(x.fecha_cierre&&x.fecha_cierre<new Date().toISOString().slice(0,10)&&x.estado_vigencia==='Disponible')throw new Error('El cierre ya venció.')
 }
 const ahora=new Date().toISOString()
 const {error}=await db.from('convocatorias').update({estado_editorial:estado,revisado_en:ahora,actualizado_en:ahora,
  ...(estado==='publicada'&&!x.publicado_en?{publicado_en:ahora}:{})}).eq('id',id)
 if(error)throw new Error(error.message)
 await registrarAuditoria({usuarioId:u.id,usuarioEmail:u.correo,accion:estado,recursoTipo:'convocatoria',recursoId:id})
 revalidar();revalidatePath(`/convocatorias/${x.slug}`);redirect('/admin/convocatorias?guardado=1')
}
export async function guardarFuente(id:string|null,_prev:Estado,f:FormData):Promise<Estado>{
 void _prev
 try{
  const u=await requerirAdministrador(),db=crearClienteAdmin(),nombre=valor(f,'nombre'),institucion=valor(f,'institucion'),pais=valor(f,'pais'),oficial=valor(f,'oficial'),feed=valor(f,'feed'),listado=valor(f,'listado'),adaptador=valor(f,'adaptador'),integracion=valor(f,'integracion'),habilitada=f.get('habilitada')==='on'
  if(nombre.length<3||institucion.length<3||pais.length<3||!['manual','rss','html'].includes(integracion))return {ok:false,error:'Completa la fuente y el tipo de integración.'}
  if((oficial&&!urlSegura(oficial))||(feed&&!urlSegura(feed))||(listado&&!urlSegura(listado)))return {ok:false,error:'Las URL deben ser HTTPS públicas.'}
  if(habilitada){
   if(!oficial||f.get('permiso')!=='on')return {ok:false,error:'Confirma la página oficial y que sus condiciones permiten esta consulta automatizada.'}
   if(integracion==='rss'&&(!feed||new URL(oficial).hostname.replace(/^www\./,'')!==new URL(feed).hostname.replace(/^www\./,'')))return {ok:false,error:'El RSS debe estar confirmado en el mismo dominio oficial.'}
   if(integracion==='html'&&(!listadoHtmlValido(adaptador,listado)||new URL(oficial).hostname.replace(/^www\./,'')!==new URL(listado).hostname.replace(/^www\./,'')))return {ok:false,error:'Selecciona un listado HTML oficial compatible con el adaptador.'}
   if(integracion==='html'&&adaptador==='minciencias')return {ok:false,error:'La consulta HTML de Minciencias está suspendida por sus condiciones de uso. Puedes registrar enlaces oficiales manualmente.'}
   if(integracion==='manual')return {ok:false,error:'La fuente manual no se puede habilitar para búsqueda.'}
  }
  const datos={nombre,institucion,pais_ambito:pais,url_oficial:oficial||null,url_feed:feed||null,url_listado:listado||null,adaptador_html:adaptador||null,integracion,habilitada,estado_integracion:habilitada?`${integracion.toUpperCase()} habilitado`:'Pendiente de evaluación',actualizado_en:new Date().toISOString()}
  const {error}=id?await db.from('convocatorias_fuentes').update(datos).eq('id',id):await db.from('convocatorias_fuentes').insert(datos)
  if(error)return {ok:false,error:error.message}
  await registrarAuditoria({usuarioId:u.id,usuarioEmail:u.correo,accion:id?'configurar_fuente':'crear_fuente',recursoTipo:'convocatoria_fuente',recursoId:id??nombre})
  revalidatePath('/admin/convocatorias/fuentes');return {ok:true}
 }catch(e){return {ok:false,error:e instanceof Error?e.message:'No se pudo guardar la fuente.'}}
}
export async function cambiarIntervalo(_prev:Estado,f:FormData):Promise<Estado>{
 void _prev
 try{const u=await institucional(),dias=Number(valor(f,'dias'))
  if(!Number.isInteger(dias)||dias<1||dias>90)return {ok:false,error:'Elige entre 1 y 90 días.'}
  const db=crearClienteAdmin(),{data:actual,error:e}=await db.from('convocatorias_programacion').select('last_successful_run').eq('id',true).single()
  if(e)throw new Error(e.message)
  const base=actual.last_successful_run?new Date(actual.last_successful_run).getTime():Date.now()
  const proxima=new Date(Math.max(Date.now(),base+dias*86400000)).toISOString()
  const {error}=await db.from('convocatorias_programacion').update({interval_days:dias,next_scheduled_run:proxima}).eq('id',true)
  if(error)throw new Error(error.message)
  await registrarAuditoria({usuarioId:u.id,usuarioEmail:u.correo,accion:'cambiar_intervalo',recursoTipo:'convocatoria_programacion',recursoId:'global',detalle:{dias}})
  revalidatePath('/admin/convocatorias/programacion');return {ok:true}
 }catch(e){return {ok:false,error:e instanceof Error?e.message:'No se pudo actualizar.'}}
}
export async function buscarAhora(_prev:Estado):Promise<Estado>{
 void _prev
 try{const u=await institucional(),r=await ejecutarBusqueda('manual')
  if(r.estado==='ocupada')return {ok:false,error:'Ya hay una búsqueda en curso.'}
  await registrarAuditoria({usuarioId:u.id,usuarioEmail:u.correo,accion:'buscar_ahora',recursoTipo:'convocatoria_ejecucion',recursoId:r.estado})
  revalidar();revalidatePath('/admin/convocatorias/programacion')
  return r.estado==='correcta'?{ok:true}:{ok:false,error:`Búsqueda ${r.estado}: ${r.errores.join('; ')}`}
 }catch(e){return {ok:false,error:e instanceof Error?e.message:'La búsqueda falló.'}}
}
export async function revisarCambio(fichaId:string,cambioId:number,decision:'aplicado'|'rechazado',f:FormData){
 const u=await requerirAdministrador(),db=crearClienteAdmin()
 if(f.get('confirmado')!=='on')throw new Error('Confirma que revisaste la propuesta y la ficha oficial.')
 const {data:cambio,error:e}=await db.from('convocatorias_cambios').select('detectado_en,convocatoria_id,estado').eq('id',cambioId).maybeSingle()
 if(e||!cambio||cambio.convocatoria_id!==fichaId||cambio.estado!=='pendiente')throw new Error('Propuesta no disponible.')
 if(decision==='aplicado'){
  const {data:ficha}=await db.from('convocatorias').select('editado_manualmente_en').eq('id',fichaId).single()
  if(!ficha?.editado_manualmente_en||ficha.editado_manualmente_en<cambio.detectado_en)throw new Error('Guarda primero la ficha revisada manualmente.')
 }
 const {error}=await db.from('convocatorias_cambios').update({estado:decision,resuelto_en:new Date().toISOString()}).eq('id',cambioId).eq('estado','pendiente')
 if(error)throw new Error(error.message)
 await registrarAuditoria({usuarioId:u.id,usuarioEmail:u.correo,accion:`cambio_${decision}`,recursoTipo:'convocatoria',recursoId:fichaId,detalle:{cambioId}})
 revalidatePath(`/admin/convocatorias/${fichaId}`)
}
