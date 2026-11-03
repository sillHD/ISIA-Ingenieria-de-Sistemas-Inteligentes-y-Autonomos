'use client'
import { useEffect,useMemo,useState } from 'react'
import Link from 'next/link'
import { Etiqueta,EstadoVacio,Fecha } from '@/componentes/Base'
import { AMBITOS,AREAS,CATEGORIAS,ESTADOS,PUBLICOS,type Ficha,vigencia } from '@/lib/convocatorias/modelo'
import estilos from '@/app/convocatorias/convocatorias.module.css'

type Filtros={q:string;publico:string;categoria:string;ambito:string;estado:string;area:string}
const inicial:Filtros={q:'',publico:'todos',categoria:'todas',ambito:'todos',estado:'Disponible',area:'todas'}
function leer():Filtros{
 const p=new URLSearchParams(location.search)
 const elegir=(k:keyof Filtros,opciones:readonly string[])=>opciones.includes(p.get(k)??'')?p.get(k)!:inicial[k]
 return {q:p.get('q')?.slice(0,120)??'',publico:elegir('publico',[...PUBLICOS,'todos']),
 categoria:elegir('categoria',[...CATEGORIAS,'todas']),ambito:elegir('ambito',[...AMBITOS,'todos']),
 estado:elegir('estado',[...ESTADOS,'todos']),area:elegir('area',[...AREAS,'todas'])}
}
const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
export default function Listado({fichas,muestra=false}:{fichas:Ficha[];muestra?:boolean}){
 const [f,setF]=useState<Filtros>(inicial),[limite,setLimite]=useState(6)
 useEffect(()=>{const sync=()=>{setF(leer());setLimite(6)};sync();addEventListener('popstate',sync);return()=>removeEventListener('popstate',sync)},[])
 function cambiar(k:keyof Filtros,v:string){const n={...f,[k]:v};setF(n);setLimite(6);const u=new URL(location.href);if(v===inicial[k])u.searchParams.delete(k);else u.searchParams.set(k,v);history.replaceState(null,'',u)}
 const visibles=useMemo(()=>fichas.filter(x=>{
  const q=norm(f.q.trim()),texto=norm([x.titulo,x.institucion,x.resumen,x.descripcion,x.pais_region,...x.categorias,...x.areas].join(' '))
  return (!q||texto.includes(q))&&(f.publico==='todos'||x.publicos.includes(f.publico as Ficha['publicos'][number]))&&
   (f.categoria==='todas'||x.categorias.includes(f.categoria as Ficha['categorias'][number]))&&
   (f.ambito==='todos'||x.ambito===f.ambito)&&(f.estado==='todos'||vigencia(x)===f.estado)&&
   (f.area==='todas'||x.areas.includes(f.area as Ficha['areas'][number]))
 }),[fichas,f])
 const selector=(titulo:string,clave:keyof Filtros,opciones:readonly string[],todos:string)=><label>{titulo}<select value={f[clave]} onChange={e=>cambiar(clave,e.target.value)}><option value={inicial[clave]==='Disponible'?'todos':inicial[clave]}>{todos}</option>{opciones.map(v=><option key={v}>{v}</option>)}</select></label>
 return <>
  <div className={estilos.filtros} role="group" aria-label="Filtrar convocatorias">
   <label className={estilos.buscar}>Buscar convocatorias<input type="search" value={f.q} maxLength={120} placeholder="Tema, institución o palabra clave" onChange={e=>cambiar('q',e.target.value)}/></label>
   {selector('Público objetivo','publico',PUBLICOS,'Todos los públicos')}
   {selector('Categoría','categoria',CATEGORIAS,'Todas las categorías')}
   {selector('Región','ambito',AMBITOS,'Todas las regiones')}
   <label>Disponibilidad<select value={f.estado} onChange={e=>cambiar('estado',e.target.value)}>{ESTADOS.map(v=><option key={v}>{v}</option>)}<option value="todos">Todos los estados</option></select></label>
   {selector('Área temática','area',AREAS,'Todas las áreas')}
  </div>
  <div className={estilos.resultados}><p role="status">{visibles.length} {visibles.length===1?'convocatoria':'convocatorias'}</p><button type="button" onClick={()=>{setF(inicial);setLimite(6);const u=new URL(location.href);Object.keys(inicial).forEach(k=>u.searchParams.delete(k));history.replaceState(null,'',u)}}>Restablecer filtros</button></div>
  {visibles.length?<><div className={estilos.rejilla}>{visibles.slice(0,limite).map(x=><article className={estilos.tarjeta} key={x.id}>
   <div className={estilos.meta}><Etiqueta valor={vigencia(x)}/><span>{x.ambito}</span></div>
   {muestra&&<strong className={estilos.muestra}>Muestra visual · No es una convocatoria real</strong>}
   <p className={estilos.institucion}>{x.institucion}</p><h2><Link href={`/convocatorias/${x.slug}${muestra?'?vista=ejemplo':''}`}>{x.titulo}</Link></h2><p>{x.resumen}</p>
   <div className={estilos.etiquetas}>{x.categorias.map(c=><span key={c}>{c}</span>)}</div>
   <p><b>Dirigida a:</b> {x.publicos.join(' · ')}</p><p><b>Cierre:</b> {x.permanente?'Modalidad permanente':x.fecha_cierre?<Fecha iso={x.fecha_cierre} corta/>:'Por verificar'}</p>
   <Link href={`/convocatorias/${x.slug}${muestra?'?vista=ejemplo':''}`}>Consultar detalle ↗</Link>
  </article>)}</div>{visibles.length>limite&&<button className={estilos.cargar} type="button" onClick={()=>setLimite(v=>v+6)}>Mostrar más</button>}</>
   :<EstadoVacio titulo={fichas.length?'No hay coincidencias':'Convocatorias por publicar'} descripcion={fichas.length?'Prueba otra combinación de filtros.':'Las fichas aparecerán cuando exista una fuente oficial y el equipo haya aprobado su publicación.'}/>}
 </>
}
