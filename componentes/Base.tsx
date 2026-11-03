// Primitivas de diseño del sitio.
//
// Son las piezas que usa TODA página. Si montas una sección nueva, empieza
// siempre por <Seccion> y <TituloSeccion> y usa <Boton>, <Etiqueta> y <Fecha>
// en vez de escribir tu propio HTML: así tu sección sale con el mismo aire que
// el resto sin que tengas que decidir nada de diseño.
//
// Ejemplo mínimo de una página nueva:
//
//   <Seccion>
//     <TituloSeccion indice="01" titulo="Mi sección" />
//     ...
//   </Seccion>

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Flecha } from './Iconos'
import estilos from './Base.module.css'

/* ------------------------------------------------------------------ Seccion */

type SeccionProps = {
  children: ReactNode
  id?: string
  /** Alterna al fondo gris claro, para separar visualmente bloques seguidos.
   *  Es la única forma de separar secciones en este diseño: no hay bordes. */
  alterna?: boolean
  className?: string
}

export function Seccion({ children, id, alterna, className }: SeccionProps) {
  const clases = [
    estilos.seccion,
    alterna ? estilos.alterna : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={clases}>
      <div className="contenedor">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------ TituloSeccion */

type TituloSeccionProps = {
  /** Numeración en monoespaciada a la izquierda, tipo "03". Opcional. */
  indice?: string
  titulo: string
  descripcion?: string
  /** Centra el bloque. Por defecto va alineado a la izquierda. */
  centrado?: boolean
}

export function TituloSeccion({
  indice,
  titulo,
  descripcion,
  centrado,
}: TituloSeccionProps) {
  return (
    <header
      className={`${estilos.encabezado} ${centrado ? estilos.encabezadoCentrado : ''}`}
    >
      {indice && (
        <span className={`mono ${estilos.indice}`}>
          <span className={estilos.raya} aria-hidden />
          {indice}
        </span>
      )}
      <h2 className={estilos.tituloSeccion}>{titulo}</h2>
      {descripcion && <p className={estilos.descripcion}>{descripcion}</p>}
    </header>
  )
}

/* -------------------------------------------------------------------- Boton */

type BotonProps = {
  href: string
  children: ReactNode
  /** "principal" es la píldora negra rellena; "sutil" es solo texto en verde.
   *  Un solo botón principal por bloque: con dos, ninguno destaca. */
  variante?: 'principal' | 'sutil'
  /** Añade la flecha a la derecha. Encendido por defecto. */
  flecha?: boolean
  className?: string
}

export function Boton({
  href,
  children,
  variante = 'principal',
  flecha = true,
  className,
}: BotonProps) {
  const externo = href.startsWith('http') || href.startsWith('mailto:')
  const clases = `${estilos.boton} ${variante === 'sutil' ? estilos.botonSutil : estilos.botonPrincipal} ${className ?? ''}`
  const contenido = (
    <>
      <span>{children}</span>
      {flecha && <Flecha size={16} className={estilos.botonFlecha} />}
    </>
  )

  if (externo) {
    return (
      <a
        href={href}
        className={clases}
        target="_blank"
        rel="noreferrer noopener"
      >
        {contenido}
        {href.startsWith('http') && <span className="solo-lectores"> (se abre en una pestaña nueva)</span>}
      </a>
    )
  }

  return (
    <Link href={href} className={clases}>
      {contenido}
    </Link>
  )
}

/* ----------------------------------------------------------------- Etiqueta */

// Cada valor tiene su color fijo en todo el sitio: un proyecto "activo" se ve
// igual en la portada que en su ficha. Solo hay tres colores posibles, y el
// rojo se reserva para lo que reclama atención. Si añades un estado nuevo al
// contenido, añádelo también aquí y en Base.module.css.
const COLOR_ETIQUETA: Record<string, string> = {
  Disponible: 'verde', Vencida: 'neutro', 'Por verificar': 'rojo',
  // estados de proyecto
  'En formulación': 'neutro',
  Prototipado: 'verde',
  'Fase inicial': 'verde',
  // tipos de novedad
  convocatoria: 'rojo',
  evento: 'verde',
  logro: 'rojo',
  publicacion: 'neutro',
  // modalidades de reunión
  presencial: 'verde',
  virtual: 'neutro',
  hibrida: 'rojo',
  Presencial: 'verde',
  Híbrida: 'neutro',
  Remota: 'rojo',
}

const TEXTO_ETIQUETA: Record<string, string> = {
  'En formulación': 'En formulación',
  Prototipado: 'Prototipado',
  'Fase inicial': 'Fase inicial',
  divulgacion: 'Divulgación',
  convocatoria: 'Convocatoria',
  evento: 'Evento',
  logro: 'Logro',
  publicacion: 'Publicación',
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrida: 'Híbrida',
}

export function Etiqueta({ valor }: { valor: string }) {
  const color = COLOR_ETIQUETA[valor] ?? 'neutro'
  return (
    <span className={`mono ${estilos.etiqueta} ${estilos[color]}`}>
      {TEXTO_ETIQUETA[valor] ?? valor}
    </span>
  )
}

/* -------------------------------------------------------------------- Fecha */

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const MESES_CORTOS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
]

/** Parte una fecha YYYY-MM-DD sin pasar por new Date(), que interpreta la
 *  cadena como UTC y en Colombia haría que toda fecha saliera un día antes. */
export function partesFecha(iso: string) {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return {
    anio,
    mes,
    dia,
    nombreMes: MESES[mes - 1] ?? '',
    mesCorto: MESES_CORTOS[mes - 1] ?? '',
  }
}

/** Fecha en texto, siempre igual en todo el sitio: "19 de septiembre de 2026". */
export function Fecha({ iso, corta }: { iso: string; corta?: boolean }) {
  const { anio, dia, nombreMes, mesCorto } = partesFecha(iso)
  return (
    <time dateTime={iso}>
      {corta
        ? `${dia} ${mesCorto} ${anio}`
        : `${dia} de ${nombreMes} de ${anio}`}
    </time>
  )
}

/* ------------------------------------------------------------- EnlaceMasCosas */

/** El "ver todo" que cierra los bloques de la portada. */
export function VerTodo({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <div className={estilos.verTodo}>
      <Boton href={href} variante="sutil">
        {children}
      </Boton>
    </div>
  )
}

export function EncabezadoPagina({
  indice,
  titulo,
  descripcion,
}: {
  indice?: string
  titulo: string
  descripcion?: string
}) {
  return (
    <header className={estilos.encabezadoPagina}>
      <nav className={estilos.miga} aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{indice ?? titulo}</span>
      </nav>
      <h1>{titulo}</h1>
      {descripcion && <p className={estilos.descripcion}>{descripcion}</p>}
    </header>
  )
}

export function AvisoDemo({ children }: { children?: ReactNode }) {
  return (
    <aside className={estilos.aviso}>
      <span className={estilos.avisoEtiqueta}>Provisional</span>
      <p>
        {children ??
          'Contenido ilustrativo pendiente de validación por el semillero.'}
      </p>
    </aside>
  )
}

export function EstadoVacio({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion: string
  children?: ReactNode
}) {
  return (
    <div className={estilos.estadoVacio}>
      <span className="mono">Información pendiente</span>
      <h2>{titulo}</h2>
      <p>{descripcion}</p>
      {children && <div className={estilos.estadoAccion}>{children}</div>}
    </div>
  )
}
