import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {AvisoDemo,EncabezadoPagina,Seccion} from '@/componentes/Base'
import Listado from '@/componentes/convocatorias/Listado'
import {seccionVisible} from '@/lib/configuracion'
import {listarPublicas} from '@/lib/convocatorias/datos'
import {entornoRevision,listarMuestras} from '@/lib/convocatorias/muestras'
import estilos from './convocatorias.module.css'
type Props={searchParams:Promise<{vista?:string}>}
export const dynamic='force-dynamic'
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
 const muestra=entornoRevision()&&(await searchParams).vista==='ejemplo'
 return {title:'Convocatorias',description:'Oportunidades académicas, científicas y tecnológicas revisadas por ISIA.',...(muestra?{robots:{index:false,follow:false}}:{})}
}
export default async function Pagina({searchParams}:Props){
 if(!(await seccionVisible('convocatorias')))notFound()
 const vista=(await searchParams).vista,muestra=entornoRevision()&&vista==='ejemplo'
 const fichas=muestra?listarMuestras(vista):await listarPublicas()
 return <Seccion className={estilos.primera}><nav className={estilos.migas} aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href="/oportunidades">Oportunidades</Link><span>/</span><span aria-current="page">Convocatorias</span></nav>
  <EncabezadoPagina indice="Oportunidades" titulo="Convocatorias" descripcion="Consulta oportunidades académicas, científicas y tecnológicas. Verifica las condiciones finales con la institución organizadora."/>
  {muestra&&<AvisoDemo>Vista de revisión visual. Todas las fichas son ficticias y no representan convocatorias reales.</AvisoDemo>}
  <Listado fichas={fichas} muestra={muestra}/>
  {entornoRevision()&&<p className={estilos.pie}><Link href={muestra?'/convocatorias':'/convocatorias?vista=ejemplo'}>{muestra?'Salir de la vista de ejemplo':'Revisar el diseño con fichas de ejemplo'}</Link></p>}
 </Seccion>
}
