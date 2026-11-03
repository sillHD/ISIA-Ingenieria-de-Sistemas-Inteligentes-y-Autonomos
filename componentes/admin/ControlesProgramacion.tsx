'use client'
import {useActionState} from 'react'
import {buscarAhora,cambiarIntervalo,type Estado} from '@/lib/admin/convocatorias-acciones'
import estilos from './Convocatorias.module.css'
export default function ControlesProgramacion({dias}:{dias:number}){const [intervalo,guardar,guardando]=useActionState(cambiarIntervalo,{ok:false} as Estado);const [busqueda,buscar,buscando]=useActionState(buscarAhora,{ok:false} as Estado)
 return <div className={estilos.tarjeta}><h2>Controles de la cuenta institucional</h2><form action={guardar} className={estilos.acciones}><label>Intervalo en días <input name="dias" type="number" min="1" max="90" defaultValue={dias} required/></label><button className={estilos.boton} disabled={guardando}>Guardar intervalo</button></form>{intervalo.error&&<p role="alert" className={estilos.error}>{intervalo.error}</p>}{intervalo.ok&&<p role="status">Intervalo actualizado.</p>}<form action={buscar}><button className={estilos.boton} disabled={buscando}>{buscando?'Buscando…':'Buscar ahora'}</button></form>{busqueda.error&&<p role="alert" className={estilos.error}>{busqueda.error}</p>}{busqueda.ok&&<p role="status">Búsqueda terminada correctamente.</p>}</div>}
