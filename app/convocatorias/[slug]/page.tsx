import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {AvisoDemo,Etiqueta,Fecha,Seccion} from '@/componentes/Base'
import {seccionVisible} from '@/lib/configuracion'
import {obtenerPublica} from '@/lib/convocatorias/datos'
import {obtenerMuestra} from '@/lib/convocatorias/muestras'
import {vigencia} from '@/lib/convocatorias/modelo'
import estilos from '../convocatorias.module.css'
type Props={params:Promise<{slug:string}>;searchParams:Promise<{vista?:string}>}
export const dynamic='force-dynamic'
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{
 const slug=(await params).slug,muestra=obtenerMuestra(slug,(await searchParams).vista),ficha=muestra??await obtenerPublica(slug)
 return {title:ficha?.titulo??'Convocatoria no encontrada',description:ficha?.resumen,...(muestra?{robots:{index:false,follow:false}}:{})}
}
export default async function Detalle({params,searchParams}:Props){
 if(!(await seccionVisible('convocatorias')))notFound()
 const slug=(await params).slug,muestra=obtenerMuestra(slug,(await searchParams).vista),ficha=muestra??await obtenerPublica(slug)
 if(!ficha)notFound()
 const enlaces=muestra?[]:[...(ficha.url_oficial?[{etiqueta:'Fuente oficial',url:ficha.url_oficial}]:[]),...(ficha.url_postulacion?[{etiqueta:'Postulación',url:ficha.url_postulacion}]:[]),...ficha.documentos]
 return <Seccion className={estilos.primera}><article className={estilos.detalle}>
  <nav className={estilos.migas} aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href={muestra?'/convocatorias?vista=ejemplo':'/convocatorias'}>Convocatorias</Link><span>/</span><span aria-current="page">Detalle</span></nav>
  {muestra&&<AvisoDemo>Ficha ficticia de muestra. No permite postularse.</AvisoDemo>}
  <header><Etiqueta valor={vigencia(ficha)}/><h1>{ficha.titulo}</h1><p>{ficha.institucion}</p><p>{ficha.resumen}</p></header>
  <dl className={estilos.ficha}><div><dt>Público objetivo</dt><dd>{ficha.publicos.join(' · ')}</dd></div><div><dt>País o región</dt><dd>{ficha.pais_region||'Por verificar'}</dd></div><div><dt>Ámbito</dt><dd>{ficha.ambito}</dd></div><div><dt>Cierre</dt><dd>{ficha.permanente?'Modalidad permanente':ficha.fecha_cierre?<Fecha iso={ficha.fecha_cierre}/>:'Por verificar'}</dd></div><div><dt>Última revisión</dt><dd>{ficha.revisado_en?<Fecha iso={ficha.revisado_en.slice(0,10)}/>:'Pendiente de revisión'}</dd></div></dl>
  <div className={estilos.cuerpo}>
   <section><h2>Descripción</h2><p>{ficha.descripcion||'No especificado.'}</p></section>
   <section><h2>Categorías</h2><p>{ficha.categorias.join(' · ')}</p></section>
   <section><h2>Áreas temáticas</h2><p>{ficha.areas.join(' · ')||'No especificado.'}</p></section>
   <section><h2>Beneficios académicos</h2>{ficha.beneficios.length?<ul>{ficha.beneficios.map(x=><li key={x}>{x}</li>)}</ul>:<p>Por verificar.</p>}</section>
   <section><h2>Requisitos</h2>{ficha.requisitos.length?<ul>{ficha.requisitos.map(x=><li key={x}>{x}</li>)}</ul>:<p>No especificados.</p>}</section>
   <section><h2>Cómo postularse</h2><p>{ficha.procedimiento||'Consultar la fuente oficial.'}</p></section>
   <section><h2>Enlaces oficiales</h2>{enlaces.length?<ul>{enlaces.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noreferrer noopener">{x.etiqueta} ↗<span className="solo-lectores"> (se abre en una pestaña nueva)</span></a></li>)}</ul>:<p>Esta ficha de muestra no tiene enlaces oficiales.</p>}</section>
  </div>
 </article></Seccion>
}
