import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EncabezadoPagina, Seccion } from '@/componentes/Base'
import ListadoPracticas from '@/componentes/practicas/ListadoPracticas'
import { listarOportunidadesPublicas } from '@/lib/practicas'
import { obtenerConfiguracionNavegacion } from '@/lib/configuracion'
import estilos from '../networking.module.css'

export const metadata: Metadata = { title: 'Oportunidades', description: 'Prácticas, convocatorias y retos conectados con la comunidad ISIA.' }
export const revalidate = 300

export default async function PaginaOportunidades() {
  const config = await obtenerConfiguracionNavegacion()
  if (!config.practicas && !config.convocatorias) notFound()
  const oportunidades = config.practicas ? await listarOportunidadesPublicas() : []
  const abiertas = oportunidades.filter((oferta) => oferta.estado === 'abierta')
  const historicas = oportunidades.filter((oferta) => oferta.estado === 'cerrada' || oferta.estado === 'archivada')
  return <Seccion className={estilos.primera}><EncabezadoPagina indice="Networking" titulo="Oportunidades" descripcion="Consulta oportunidades académicas y prácticas. Verifica las condiciones en la institución de origen." />
    <div className={estilos.rejillaHub}>
      {config.convocatorias && <Link href="/convocatorias" className={estilos.tarjetaHub}><span>Ámbito académico</span><h2>Convocatorias</h2><p>Becas, investigación, movilidad, competencias, innovación y cooperación.</p><strong>Consultar convocatorias ↗</strong></Link>}
      {config.practicas && <Link href="/practicas" className={estilos.tarjetaHub}><span>Organizaciones</span><h2>Prácticas e iniciativas</h2><p>Ofertas compartidas por entidades autorizadas.</p><strong>Consultar prácticas ↗</strong></Link>}
    </div>
    {config.practicas && <div className={estilos.bloque}><h2>Disponibles en organizaciones</h2><ListadoPracticas ofertas={abiertas} /><h2 className={estilos.separadorTitulo}>Histórico</h2><ListadoPracticas ofertas={historicas} historico /></div>}
  </Seccion>
}
