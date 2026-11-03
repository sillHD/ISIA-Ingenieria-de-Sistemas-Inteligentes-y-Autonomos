import Link from 'next/link'
import {notFound} from 'next/navigation'
import {obtenerAdmin,cambiosPendientes} from '@/lib/convocatorias/datos'
import {requerirAdministrador} from '@/lib/admin/datos'
import {decidirFicha,revisarCambio} from '@/lib/admin/convocatorias-acciones'
import FormularioConvocatoria from '@/componentes/admin/FormularioConvocatoria'
import estilos from '@/componentes/admin/Convocatorias.module.css'
export const dynamic='force-dynamic'
export const metadata={title:'Revisar convocatoria'}
export default async function Pagina({params}:{params:Promise<{id:string}>}){
 await requerirAdministrador()
 const {id}=await params
 const [ficha,cambios]=await Promise.all([obtenerAdmin(id),cambiosPendientes(id)])
 if(!ficha)notFound()
 return <>
  <Link href="/admin/convocatorias">← Volver</Link><h1>{ficha.titulo}</h1>
  <p>Estado editorial: {ficha.estado_editorial}. Vigencia: {ficha.estado_vigencia}.</p>
  {ficha.posible_duplicado_id&&<p role="alert">Posible duplicado. Revisa la ficha relacionada antes de aprobar.</p>}
  <div className={estilos.tarjeta}><h2>Decisión editorial</h2><p>Comprueba el enlace oficial, público, beneficio y estado de apertura antes de publicar.</p>
   <div className={estilos.acciones}>
    {ficha.estado_editorial!=='publicada'&&<form action={decidirFicha.bind(null,id,'publicada')}><label><input type="checkbox" name="evidencia" required/> Confirmé la fuente oficial y la vigencia</label>{ficha.posible_duplicado_id&&<label><input type="checkbox" name="duplicado" required/> Revisé el posible duplicado</label>}<button className={estilos.boton}>Aprobar y publicar</button></form>}
    {ficha.estado_editorial==='pendiente'&&<form action={decidirFicha.bind(null,id,'rechazada')}><button className={`${estilos.boton} ${estilos.secundario}`}>Rechazar</button></form>}
    {ficha.estado_editorial==='publicada'&&<form action={decidirFicha.bind(null,id,'archivada')}><button className={`${estilos.boton} ${estilos.secundario}`}>Archivar</button></form>}
   </div>
  </div>
  {!!cambios.length&&<div className={estilos.tarjeta}><h2>Cambios detectados pendientes</h2><p>Compara la propuesta con la fuente oficial. Si la aceptas, edita y guarda la ficha primero; después márcala como incorporada.</p>{cambios.map(c=><details key={c.id} className={estilos.tarjeta}><summary>Propuesta del {c.detectado_en}</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(c.datos_propuestos,null,2)}</pre><div className={estilos.acciones}>{(['aplicado','rechazado'] as const).map(decision=><form key={decision} action={revisarCambio.bind(null,id,c.id,decision)}><label><input type="checkbox" name="confirmado" required/> Revisé esta propuesta</label><button className={`${estilos.boton} ${estilos.secundario}`}>{decision==='aplicado'?'Marcar incorporada':'Descartar propuesta'}</button></form>)}</div></details>)}</div>}
  <h2>Editar información</h2><FormularioConvocatoria ficha={ficha}/>
 </>
}
