import Link from 'next/link'
import {listarAdmin} from '@/lib/convocatorias/datos'
import {requerirAdministrador} from '@/lib/admin/datos'
import estilos from '@/app/admin/admin.module.css'
import tabla from '@/componentes/admin/TablaAdmin.module.css'
export const dynamic='force-dynamic'
export const metadata={title:'Administrar convocatorias'}
export default async function Pagina(){await requerirAdministrador();const fichas=await listarAdmin();const pendientes=fichas.filter(x=>x.estado_editorial==='pendiente').length
 return <><div className={estilos.cabeceraPagina}><div><h1>Convocatorias</h1><p>{pendientes} pendientes de revisión · {fichas.length} fichas visibles en el panel.</p></div><Link href="/admin/convocatorias/nuevo" className={estilos.botonNuevo}>Añadir convocatoria</Link></div><p><Link href="/admin/convocatorias/fuentes">Fuentes</Link> · <Link href="/admin/convocatorias/programacion">Programación e historial</Link></p><div className={tabla.envoltorio}><table className={tabla.tabla}><thead><tr><th>Título</th><th>Institución</th><th>Vigencia</th><th>Editorial</th><th>Acción</th></tr></thead><tbody>{fichas.map(x=><tr key={x.id}><td>{x.titulo}</td><td>{x.institucion}</td><td>{x.estado_vigencia}</td><td>{x.estado_editorial}</td><td><Link href={`/admin/convocatorias/${x.id}`}>Revisar</Link></td></tr>)}</tbody></table>{!fichas.length&&<p>Aún no hay convocatorias registradas.</p>}</div></>}
