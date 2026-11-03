'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SITIO, type ItemNavegacion } from '@/lib/sitio'
import { Menu, Cerrar } from './Iconos'
import MarcaIsia from './MarcaIsia'
import estilos from './Nav.module.css'

// Subpáginas que resaltan su sección en el menú. Las claves coinciden con NAVEGACION
// (lib/sitio.ts); solo se declaran aquí las rutas hijas de cada una.
const SUBRUTAS: Record<string, string[]> = {
  '/semillero': ['/lineas', '/grupos', '/publicaciones'],
  '/proyectos': ['/ideas', '/prototipado', '/innovacion'],
  '/oportunidades': ['/practicas','/convocatorias'],
  '/comunidad': ['/integrantes', '/preguntas'],
  '/actividades': ['/novedades', '/reuniones', '/galeria'],
}

export default function Nav({ items: navegacion }: { items: ItemNavegacion[] }) {
  const ruta = usePathname()
  const [rutaAbierta, setRutaAbierta] = useState<string | null>(null)
  const [indicador, setIndicador] = useState({ izquierda: 0, ancho: 0 })
  const [desplazada, setDesplazada] = useState(false)
  // Arranca en true en la portada para que el HTML inicial no muestre dos logos
  // a la vez; el observador lo corrige en cuanto mide la pantalla real.
  const [logoEnPortada, setLogoEnPortada] = useState(ruta === '/')
  const boton = useRef<HTMLButtonElement>(null)
  const navegacionRef = useRef<HTMLElement>(null)
  const abierto = rutaAbierta === ruta
  const esAdmin = ruta.startsWith('/admin')
  const activa = (href: string) => {
    const rutas = [href, ...(SUBRUTAS[href] ?? [])]
    return rutas.some((base) => ruta === base || (base !== '/' && ruta.startsWith(base + '/')))
  }
  const items = useMemo(() => [
    { href: '/', texto: 'Inicio' },
    ...navegacion.filter((item) => item.href !== '/' && item.href !== '/unete'),
  ], [navegacion])

  // Nunca dos logos a la vez: mientras el logo grande de la portada está a la
  // vista, el del menú cede su sitio a la afiliación institucional.
  useEffect(() => {
    const logo = document.getElementById('logo-portada')
    if (!logo) {
      setLogoEnPortada(false)
      return
    }
    const observador = new IntersectionObserver(
      ([entrada]) => setLogoEnPortada(entrada.isIntersecting),
      { threshold: 0.35 },
    )
    observador.observe(logo)
    return () => observador.disconnect()
  }, [ruta])

  useLayoutEffect(() => {
    const nav = navegacionRef.current
    if (!nav) return
    function medir() {
      const activo = nav?.querySelector<HTMLElement>('[aria-current="page"]')
      setIndicador(activo
        ? { izquierda: activo.offsetLeft, ancho: activo.offsetWidth }
        : { izquierda: 0, ancho: 0 })
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(nav)
    return () => observador.disconnect()
  }, [ruta, items])

  useEffect(() => {
    if (esAdmin) {
      setDesplazada(false)
      return
    }

    let frame: number | null = null
    const actualizar = () => {
      frame = null
      setDesplazada(window.scrollY > 24)
    }
    const alDesplazar = () => {
      if (frame === null) frame = window.requestAnimationFrame(actualizar)
    }

    actualizar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => {
      window.removeEventListener('scroll', alDesplazar)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [esAdmin])

  function cerrar() {
    setRutaAbierta(null)
  }

  return (
    <header
      className={estilos.barra}
      data-desplazada={desplazada}
      data-logo-portada={logoEnPortada}
      data-admin={esAdmin}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && abierto) {
          cerrar()
          boton.current?.focus()
        }
      }}
    >
      <div className={`contenedor ${estilos.fila}`}>
        <Link href="/" className={estilos.marca} onClick={cerrar} aria-label="ISIA, ir al inicio">
          <MarcaIsia variante="simbolo" alto={40} decorativa prioridad className={estilos.logoMenu} />
          <span className={estilos.afiliacion} aria-hidden="true">
            <strong>{SITIO.universidad}</strong>
            <span>{SITIO.sede}</span>
          </span>
        </Link>
        <Link href="/unete" className={estilos.cta} aria-current={activa('/unete') ? 'page' : undefined}>
          Participar <span aria-hidden>↗</span>
        </Link>
        <button
          ref={boton}
          type="button"
          className={estilos.hamburguesa}
          onClick={() => setRutaAbierta(abierto ? null : ruta)}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        >
          {abierto ? <Cerrar size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <div className={estilos.navBorde}>
        <nav ref={navegacionRef} className={`contenedor ${estilos.enlaces}`} aria-label="Navegación principal">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={estilos.enlace}
              aria-current={activa(item.href) ? 'page' : undefined}
            >
              {item.texto}
            </Link>
          ))}
          <span
            className={estilos.indicador}
            data-visible={indicador.ancho > 0}
            style={{ left: indicador.izquierda, width: indicador.ancho }}
            aria-hidden="true"
          />
        </nav>
      </div>
      <nav
        id="menu-movil"
        className={estilos.panel}
        data-abierto={abierto}
        aria-hidden={!abierto}
        aria-label="Navegación móvil"
      >
        {[...items, { href: '/unete', texto: 'Participar' }].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={cerrar}
            tabIndex={abierto ? undefined : -1}
            aria-current={activa(item.href) ? 'page' : undefined}
          >
            {item.texto}
            <span aria-hidden>↗</span>
          </Link>
        ))}
      </nav>
    </header>
  )
}
