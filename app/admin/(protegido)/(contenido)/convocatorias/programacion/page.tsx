import Link from 'next/link'
import {requerirAdministrador} from '@/lib/admin/datos'
import {esInstitucional} from '@/lib/convocatorias/modelo'
import {ejecuciones,programacion} from '@/lib/convocatorias/datos'
import ControlesProgramacion from '@/componentes/admin/ControlesProgramacion'
import estilos from '@/componentes/admin/Convocatorias.module.css'
export const dynamic='force-dynamic'
export const maxDuration=300
export const metadata={title:'Programación de convocatorias'}
export default async function Pagina(){const usuario=await requerirAdministrador(),[config,historial]=await Promise.all([programacion(),ejecuciones()]);const autorizado=esInstitucional(usuario.autorizado.rol,usuario.correo,usuario.autorizado.email,process.env.ISIA_INSTITUTIONAL_EMAIL)
 return <><Link href="/admin/convocatorias">← Volver</Link><h1>Programación e historial</h1><div className={estilos.tarjeta}><p>Intervalo: {config.interval_days} días · Última búsqueda satisfactoria: {config.last_successful_run??'Nunca'} · Próxima búsqueda: {config.next_scheduled_run}</p><p>Último estado: {config.last_run_status??'Sin ejecuciones'} · Inició: {config.last_run_started_at??'—'} · Terminó: {config.last_run_finished_at??'—'}</p></div>{autorizado&&<ControlesProgramacion dias={config.interval_days}/>}<h2>Ejecuciones recientes</h2><div className={estilos.lista}>{historial.map(x=><div className={estilos.tarjeta} key={x.id}><strong>{x.tipo} · {x.estado}</strong><p>{x.iniciada_en} · Fuentes {x.fuentes_procesadas} · Nuevas {x.nuevos} · Actualizadas {x.actualizados} · Duplicadas {x.duplicados}</p>{x.errores?.length>0&&<p role="alert">{x.errores.join(' · ')}</p>}</div>)}</div></>}
