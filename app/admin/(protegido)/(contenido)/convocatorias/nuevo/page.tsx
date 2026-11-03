import Link from 'next/link'
import FormularioConvocatoria from '@/componentes/admin/FormularioConvocatoria'
import {requerirAdministrador} from '@/lib/admin/datos'
export const metadata={title:'Nueva convocatoria'}
export default async function Pagina(){await requerirAdministrador();return <><Link href="/admin/convocatorias">← Volver</Link><h1>Nueva convocatoria</h1><p>La ficha quedará pendiente hasta que un administrador revise la evidencia oficial y la apruebe.</p><FormularioConvocatoria/></>}
