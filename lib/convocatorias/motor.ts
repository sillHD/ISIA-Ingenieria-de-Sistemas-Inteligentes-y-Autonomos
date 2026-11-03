import 'server-only'
import {createHash} from 'node:crypto'
import {lookup} from 'node:dns/promises'
import {request} from 'node:https'
import {isIP} from 'node:net'
import {crearClienteAdmin} from '@/lib/supabase/server'
import {urlSegura,type Fuente} from './modelo'
import {interpretarHtml,listadoHtmlValido} from './html'
import {prepararCandidato} from './candidato'

function ipPublica(ip:string){
 if(isIP(ip)===4){const [a,b,c]=ip.split('.').map(Number)
  return !(a===0||a===10||a===127||a>=224||(a===169&&b===254)||
   (a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127)||
   (a===192&&b===0&&(c===0||c===2))||(a===198&&(b===18||b===19||(b===51&&c===100)))||
   (a===203&&b===0&&c===113))}
 if(isIP(ip)===6){const v=ip.toLowerCase();return !(v==='::'||v==='::1'||v.startsWith('fc')||v.startsWith('fd')||
  /^fe[89abcdef]/.test(v)||v.startsWith('ff')||v.startsWith('::ffff:')||v.startsWith('2001:db8:'))}
 return false
}
function dominio(url:string,fuente:Fuente){
 if(!fuente.url_oficial||!urlSegura(url))return false
 const base=new URL(fuente.url_oficial).hostname.replace(/^www\./,''),host=new URL(url).hostname.replace(/^www\./,'')
 return host===base||host.endsWith(`.${base}`)
}
async function descargar(urlTexto:string,fuente:Fuente,saltos=0):Promise<string>{
 if(saltos>2||!dominio(urlTexto,fuente))throw new Error('Destino externo no autorizado.')
 const url=new URL(urlTexto),direcciones=await lookup(url.hostname,{all:true,verbatim:true})
 if(!direcciones.length||direcciones.some(x=>!ipPublica(x.address)))throw new Error('Dirección no pública.')
 const ip=direcciones[0]
 const resultado=await new Promise<{codigo:number;ubicacion?:string;texto:string}>((resolve,reject)=>{
  const partes:Buffer[]=[];let bytes=0
  const req=request(url,{method:'GET',timeout:10000,headers:{'User-Agent':'ISIA-Convocatorias/1.0',Accept:'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html','Accept-Encoding':'identity'},lookup:(_h,_o,cb)=>cb(null,ip.address,ip.family)},res=>{
   res.on('data',(b:Buffer)=>{bytes+=b.length;if(bytes>2_000_000){req.destroy(new Error('Feed mayor de 2 MB.'));return}partes.push(b)})
   res.on('end',()=>resolve({codigo:res.statusCode??0,ubicacion:res.headers.location,texto:Buffer.concat(partes).toString('utf8')}))
  })
  req.on('timeout',()=>req.destroy(new Error('Tiempo agotado.')));req.on('error',reject);req.end()
 })
 if([301,302,303,307,308].includes(resultado.codigo)&&resultado.ubicacion)return descargar(new URL(resultado.ubicacion,url).href,fuente,saltos+1)
 if(resultado.codigo!==200)throw new Error(`HTTP ${resultado.codigo}`)
 return resultado.texto
}
const entidades=(v:string)=>v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&(?:amp|lt|gt|quot|apos);/g,s=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"})[s]??'')
function campo(xml:string,nombre:string){return entidades(xml.match(new RegExp(`<${nombre}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${nombre}>`,'i'))?.[1]??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
function clasificar(texto:string){
 const t=texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),categorias:string[]=[],publicos:string[]=[],areas:string[]=[],beneficios:string[]=[]
 if(/investig|research|financ|funding|grant/.test(t)){categorias.push('Investigación y financiación');beneficios.push('Posible apoyo a investigación; confirmar en fuente oficial.')}
 if(/beca|scholarship|fellowship|pasant|internship|movilidad|mobility|master|maestr/.test(t)){categorias.push('Becas, pasantías y movilidad');beneficios.push('Posible formación o movilidad; confirmar en fuente oficial.')}
 if(/estudiante auxiliar|estimulo economico/.test(t)){if(!categorias.includes('Investigación y financiación'))categorias.push('Investigación y financiación');beneficios.push('Posible apoyo económico académico; confirmar en fuente oficial.')}
 if(/reto|challenge|compet|hackathon/.test(t)){categorias.push('Retos y competencias tecnológicas');beneficios.push('Posible competencia académica; confirmar en fuente oficial.')}
 if(/innov|emprend|startup/.test(t)){categorias.push('Innovación y emprendimiento');beneficios.push('Posible apoyo a innovación; confirmar en fuente oficial.')}
 if(/colabor|cooper|consorti|partnership/.test(t)){categorias.push('Colaboración académica y científica');beneficios.push('Posible cooperación; confirmar en fuente oficial.')}
 if(/pregrado|undergraduate|bachelor/.test(t))publicos.push('Estudiantes de pregrado')
 if(/posgrado|graduate|master|doctoral|phd/.test(t))publicos.push('Estudiantes de posgrado')
 if(/grupo|semillero|research group|laborator/.test(t))publicos.push('Grupos y semilleros de investigación')
 if(/robot/.test(t))areas.push('Robótica');if(/inteligencia artificial|artificial intelligence/.test(t))areas.push('Inteligencia artificial')
 return {categorias,publicos,areas,beneficios}
}
export function interpretarFeed(xml:string,fuente:Fuente){
 if(!fuente.url_feed||!/<(?:rss|feed)\b/i.test(xml.slice(0,2000)))throw new Error('RSS/Atom no reconocido.')
 const resultado:{titulo:string;descripcion:string;url:string;edicion:string|null;clave:string;huella:string;clasificacion:ReturnType<typeof clasificar>}[]=[]
 for(const [,tipo,bloque] of [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].slice(0,100)){
  const titulo=campo(bloque,'title').slice(0,250),descripcion=(campo(bloque,'description')||campo(bloque,'summary')).slice(0,5000)
  const atom=tipo.toLowerCase()==='entry'?bloque.match(/<link\b[^>]*\bhref=["']([^"']+)["']/i)?.[1]:undefined
  let url:string;try{url=new URL(entidades(atom??campo(bloque,'link')),fuente.url_feed).href}catch{continue}
  if(!titulo||!dominio(url,fuente))continue
  const clasificacion=clasificar(`${titulo} ${descripcion}`);if(!clasificacion.beneficios.length)continue
  const canon=new URL(url);canon.hash='';for(const k of [...canon.searchParams.keys()])if(/^utm_|^fbclid$|^gclid$/i.test(k))canon.searchParams.delete(k)
  const edicion=titulo.match(/\b20\d{2}\b/)?.[0]??null
  resultado.push({titulo,descripcion,url:canon.href,edicion,
   clave:createHash('sha256').update(`${canon.href}|${edicion??''}`).digest('hex'),
   huella:createHash('sha256').update(`${titulo}|${descripcion}|${url}`).digest('hex'),clasificacion})
 }
 return resultado
}
export async function ejecutarBusqueda(tipo:'manual'|'automatica'){
 const db=crearClienteAdmin(),{data:id,error:inicioError}=await db.rpc('iniciar_busqueda_convocatorias',{p_tipo:tipo,p_forzar:tipo==='manual'})
 if(inicioError)throw new Error(inicioError.message)
 if(!id)return {estado:'ocupada',nuevos:0,actualizados:0,duplicados:0,errores:[] as string[]}
 let nuevos=0,actualizados=0,duplicados=0,procesadas=0;const errores:string[]=[],detalle:{fuente:string;estado:string;encontrados:number}[]=[]
 try{
  const {data:fuentes,error}=await db.from('convocatorias_fuentes').select('*').eq('habilitada',true).in('integracion',['rss','html'])
  if(error)throw new Error(error.message)
  if(!fuentes?.length)errores.push('No hay fuentes verificadas y habilitadas.')
  for(const fuente of (fuentes??[]) as Fuente[]){
   try{
    if(fuente.integracion==='html'&&!listadoHtmlValido(fuente.adaptador_html,fuente.url_listado))throw new Error('Adaptador HTML no autorizado.')
    const url=fuente.integracion==='html'?fuente.url_listado:fuente.url_feed
    if(!url)throw new Error('URL de integración ausente.')
    const contenido=await descargar(url,fuente)
    const items=fuente.integracion==='html'?interpretarHtml(contenido,fuente,clasificar):interpretarFeed(contenido,fuente)
    for(const item of items){
     try{
      const {data:anterior,error:e}=await db.from('convocatorias').select('id,estado_editorial,huella_contenido,editado_manualmente_en').eq('clave_dedupe',item.clave).maybeSingle()
      if(e)throw new Error(e.message)
      if(anterior?.huella_contenido===item.huella){duplicados++;continue}
      const datos=prepararCandidato(item,fuente)
      if(anterior){
       if(anterior.estado_editorial==='publicada'||anterior.estado_editorial==='archivada'||anterior.editado_manualmente_en){
        const {error:ce}=await db.from('convocatorias_cambios').upsert({convocatoria_id:anterior.id,datos_propuestos:datos,huella_contenido:item.huella},{onConflict:'convocatoria_id,huella_contenido',ignoreDuplicates:true});if(ce)throw new Error(ce.message)
       }else if(anterior.estado_editorial==='pendiente'){
        const {error:ue}=await db.from('convocatorias').update(datos).eq('id',anterior.id);if(ue)throw new Error(ue.message)
       }
       actualizados++
      }else{
       const slug=item.titulo.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60).replace(/-$/,'')
       const {data:similares,error:se}=await db.from('convocatorias').select('id,edicion')
        .eq('institucion',fuente.institucion).ilike('titulo',item.titulo).limit(10)
       if(se)throw new Error(se.message)
       const posible=similares?.find(x=>x.edicion===item.edicion)
       const {error:ie}=await db.from('convocatorias').insert({...datos,slug:`${slug||'convocatoria'}-${item.clave.slice(0,10)}`,fuente_id:fuente.id,clave_dedupe:item.clave,posible_duplicado_id:posible?.id??null,estado_vigencia:'Por verificar',estado_editorial:'pendiente'})
       if(ie){if(ie.code==='23505'){duplicados++;continue}throw new Error(ie.message)}nuevos++
      }
     }catch(e){errores.push(`${fuente.nombre}: ${e instanceof Error?e.message:'Error al guardar candidato'}`)}
    }
    procesadas++;detalle.push({fuente:fuente.nombre,estado:'correcta',encontrados:items.length})
    await db.from('convocatorias_fuentes').update({ultima_consulta:new Date().toISOString(),ultimo_resultado:`${items.length} candidatos`,ultimo_error:null,fallos_consecutivos:0}).eq('id',fuente.id)
   }catch(e){const mensaje=e instanceof Error?e.message:'Error de fuente';errores.push(`${fuente.nombre}: ${mensaje}`);detalle.push({fuente:fuente.nombre,estado:'fallida',encontrados:0});await db.from('convocatorias_fuentes').update({ultima_consulta:new Date().toISOString(),ultimo_resultado:'fallida',ultimo_error:mensaje.slice(0,500),fallos_consecutivos:fuente.fallos_consecutivos+1}).eq('id',fuente.id)}
  }
 }catch(e){errores.push(e instanceof Error?e.message:'La búsqueda falló')}
 const estado=errores.length?(procesadas?'parcial':'fallida'):'correcta'
 const {error:finalError}=await db.rpc('finalizar_busqueda_convocatorias',{p_id:id,p_estado:estado,p_fuentes:procesadas,p_nuevos:nuevos,p_actualizados:actualizados,p_duplicados:duplicados,p_errores:errores,p_detalle:detalle})
 if(finalError)throw new Error(finalError.message)
 return {estado,nuevos,actualizados,duplicados,errores}
}
