import Link from 'next/link'
import {requerirAdministrador} from '@/lib/admin/datos'
import {listarFuentes} from '@/lib/convocatorias/datos'
import FormularioFuente from '@/componentes/admin/FormularioFuente'
import estilos from '@/componentes/admin/Convocatorias.module.css'
export const dynamic='force-dynamic'
export const metadata={title:'Fuentes de convocatorias'}
export default async function Pagina(){await requerirAdministrador();const fuentes=await listarFuentes();return <><Link href="/admin/convocatorias">← Volver</Link><h1>Fuentes</h1><p>Las fuentes se habilitan cuando la integración funciona y sus condiciones permiten consultar el listado o feed. Una autorización escrita solo es necesaria si la fuente la exige.</p>{fuentes.map(f=><details className={estilos.tarjeta} key={f.id}><summary><strong>{f.nombre}</strong> · {f.habilitada?'Habilitada':'Sin automatizar'} · {f.estado_integracion}</summary><p>Última consulta: {f.ultima_consulta??'Nunca'} · Resultado: {f.ultimo_resultado??'Sin datos'} · Errores: {f.ultimo_error??'Ninguno'}</p><FormularioFuente fuente={f}/></details>)}<h2>Agregar fuente</h2><FormularioFuente/></>}
