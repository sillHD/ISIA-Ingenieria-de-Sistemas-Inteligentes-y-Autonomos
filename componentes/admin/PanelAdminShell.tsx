import Link from 'next/link'
import { ESQUEMAS } from '@/lib/admin/esquemas'
import CerrarSesionBoton from './CerrarSesionBoton'
import NotificacionesAdmin from './NotificacionesAdmin'
import estilos from '@/app/admin/admin.module.css'
import type { RolUsuario } from '@/lib/roles'
import type { PendientesAdmin } from '@/lib/admin/bandeja'

type Props = {
  children: React.ReactNode
  usuario: string
  rol: RolUsuario
  pendientes?: PendientesAdmin
}

function Insignia({ total }: { total?: number }) {
  if (!total) return null
  return <span className={estilos.insignia}> ({total} {total === 1 ? 'pendiente' : 'pendientes'})</span>
}

export default function PanelAdminShell({ children, usuario, rol, pendientes }: Props) {
  const soloPracticas = rol === 'empresa'
  const esAdmin = rol === 'admin'
  return (
    <div className={estilos.envoltorio}>
      <NotificacionesAdmin />
      <header className={estilos.barraSuperior}>
        <div className={estilos.marca}>
          <Link href={soloPracticas ? '/admin/practicas' : '/admin'}>
            {soloPracticas ? 'Gestión de prácticas ISIA' : 'Panel de administración ISIA'}
          </Link>
          <span>Sesión de {usuario}</span>
        </div>
        <div className={estilos.usuario}>
          <Link href="/" className={estilos.enlaceSuperior}>Ver el sitio</Link>
          <CerrarSesionBoton />
        </div>
      </header>
      <div className={estilos.cuerpo}>
        <nav className={estilos.nav} aria-label="Contenido administrativo">
          {soloPracticas ? (
            <>
              <span className={estilos.navTitulo}>Oportunidades</span>
              <Link href="/admin/practicas" className={estilos.navEnlace}>Mis prácticas e iniciativas</Link>
            </>
          ) : (
            <>
              <span className={estilos.navTitulo}>Resumen</span>
              <Link href="/admin" className={estilos.navEnlace}>Panel</Link>
              <span className={estilos.navTitulo}>Contenido</span>
              {(['proyectos', 'ideas', 'novedades', 'reuniones', 'publicaciones', 'galeria'] as const).map((coleccion) => (
                <Link key={coleccion} href={'/admin/' + coleccion} className={estilos.navEnlace}>{ESQUEMAS[coleccion].etiqueta}</Link>
              ))}
              <Link href="/admin/multimedia" className={estilos.navEnlace}>Multimedia</Link>
              <span className={estilos.navTitulo}>Oportunidades</span>
              <Link href="/admin/practicas" className={estilos.navEnlace}>Prácticas e iniciativas</Link>
              {esAdmin && <Link href="/admin/convocatorias" className={estilos.navEnlace}>Convocatorias</Link>}
              <span className={estilos.navTitulo}>Comunidad</span>
              <Link href="/admin/integrantes" className={estilos.navEnlace}>Integrantes</Link>
              <Link href="/admin/grupos" className={estilos.navEnlace}>Grupos de trabajo</Link>
              <Link href="/admin/preguntas" className={estilos.navEnlace}>Preguntas y respuestas<Insignia total={pendientes?.preguntas} /></Link>
              <span className={estilos.navTitulo}>Prototipado</span>
              <Link href="/admin/servicios" className={estilos.navEnlace}>Capacidades</Link>
              <span className={estilos.navTitulo}>Administración</span>
              <Link href="/admin/bandeja" className={estilos.navEnlace}>Bandeja de entrada<Insignia total={pendientes?.bandeja} /></Link>
              <Link href="/admin/configuracion" className={estilos.navEnlace}>Configuración</Link>
              {esAdmin && <Link href="/admin/auditoria" className={estilos.navEnlace}>Auditoría</Link>}
              {esAdmin && <Link href="/admin/integraciones" className={estilos.navEnlace}>Integraciones</Link>}
              <a href="/api/admin/exportar" className={estilos.navEnlace}>Descargar respaldo</a>
            </>
          )}
        </nav>
        <main className={estilos.contenido}>{children}</main>
      </div>
    </div>
  )
}
