/** Configuración editorial y de contacto centralizada. */
export const SITIO = {
  sigla: 'ISIA',
  nombre: 'Ingeniería de Sistemas Inteligentes y Autónomos',
  nombreLineas: ['Ingeniería de Sistemas', 'Inteligentes y Autónomos'],
  nombreCorto: 'Semillero ISIA',
  descripcion:
    'Semillero de investigación ISIA, Ingeniería de Sistemas Inteligentes y Autónomos, de la Universidad Nacional de Colombia, sede Manizales.',
  universidad: 'Universidad Nacional de Colombia',
  sede: 'Sede Manizales',
  ubicacion: 'Manizales, Colombia',
  locale: 'es_CO',
  correo: 'isia_man@unal.edu.co',
  correoHref: 'mailto:isia_man@unal.edu.co',
  politicaDatos: 'https://legal.unal.edu.co/rlunal/home/doc.jsp?d_i=97992',
  correoDatos: 'protecdatos_na@unal.edu.co',
  repositorio: 'https://github.com/josh0827/ISIA-Ingenieria-de-Sistemas-Inteligentes-y-Autonomos',
} as const

export type ItemNavegacion = { href: string; texto: string }

export const NAVEGACION: ItemNavegacion[] = [
  { href: '/semillero', texto: 'Semillero' },
  { href: '/proyectos', texto: 'Proyectos' },
  { href: '/oportunidades', texto: 'Oportunidades' },
  { href: '/comunidad', texto: 'Comunidad' },
  { href: '/actividades', texto: 'Actividades' },
]

export type ClaveSeccion =
  | 'lineas'
  | 'grupos'
  | 'practicas'
  | 'convocatorias'
  | 'proyectos'
  | 'novedades'
  | 'reuniones'
  | 'integrantes'
  | 'publicaciones'
  | 'galeria'

export const CLAVES_SECCION: readonly ClaveSeccion[] = [
  'lineas',
  'grupos',
  'practicas',
  'convocatorias',
  'proyectos',
  'novedades',
  'reuniones',
  'integrantes',
  'publicaciones',
  'galeria',
]

export type ConfiguracionNavegacion = Record<ClaveSeccion, boolean>

export const NAVEGACION_PREDETERMINADA: ConfiguracionNavegacion = {
  lineas: true,
  grupos: true,
  practicas: true,
  convocatorias: true,
  proyectos: true,
  novedades: true,
  reuniones: true,
  integrantes: true,
  publicaciones: true,
  galeria: true,
}

export const PRESENTACION = {
  titular: 'Conectar personas, ideas y capacidades',
  aviso: 'Presentación y objetivos propuestos; pendientes de validación por el semillero.',
  parrafos: [
    'ISIA es el semillero de investigación en Ingeniería de Sistemas Inteligentes y Autónomos de la Universidad Nacional de Colombia, sede Manizales.',
    'El portal facilita conexiones entre estudiantes de pregrado y posgrado, egresados, docentes, investigadores, organizaciones y personas externas alrededor de ideas, proyectos, oportunidades y retos de prototipado.',
    'Los sistemas inteligentes y autónomos aportan el contexto técnico: software, electrónica, datos, control e inteligencia artificial se articulan mediante preguntas y colaboraciones con alcance verificable.',
  ],
}

/** Propuestas editoriales; no son objetivos institucionales aprobados. */
export const OBJETIVOS: { titulo: string; texto: string }[] = [
  {
    titulo: 'Aprender a investigar',
    texto: 'Explorar preguntas de investigación, revisar literatura y formular métodos de estudio con criterios claros.',
  },
  {
    titulo: 'Diseñar y evaluar',
    texto: 'Relacionar conceptos de sistemas inteligentes con propuestas de prototipos y formas reproducibles de evaluación.',
  },
  {
    titulo: 'Documentar y compartir',
    texto: 'Proponer prácticas de documentación que permitan comunicar procesos, limitaciones y aprendizajes.',
  },
  {
    titulo: 'Comprender el entorno',
    texto: 'Examinar posibles preguntas de la región desde la ingeniería, considerando su contexto y alcance.',
  },
]

export const AVISO_LINEAS = 'Líneas de referencia provisionales. Su denominación y alcance están pendientes de validación; no se presentan como líneas oficiales aprobadas.'

/** El orden y los títulos permiten relacionar las fichas Markdown con cada línea. */
export const LINEAS: { icono: string; titulo: string; texto: string }[] = [
  {
    icono: 'ojo',
    titulo: 'Percepción y visión por computador',
    texto: 'Estudio de cómo interpretar imágenes y señales de sensores para reconocer objetos, estimar movimiento y describir un entorno.',
  },
  {
    icono: 'brujula',
    titulo: 'Control y navegación autónoma',
    texto: 'Exploración de métodos para estimar el estado de un sistema, planear trayectorias y ajustar su movimiento.',
  },
  {
    icono: 'antena',
    titulo: 'Redes y sistemas embebidos',
    texto: 'Diseño de sistemas de cómputo integrados en dispositivos y de enlaces que transportan información con recursos limitados.',
  },
  {
    icono: 'red',
    titulo: 'Aprendizaje automático aplicado',
    texto: 'Análisis de modelos que aprenden de datos y de cómo evaluar sus errores, límites y posibles aplicaciones.',
  },
  {
    icono: 'brazo',
    titulo: 'Robótica y sistemas ciberfísicos',
    texto: 'Estudio de la interacción entre software, sensores, actuadores y procesos físicos en sistemas integrados.',
  },
  {
    icono: 'onda',
    titulo: 'Instrumentación inteligente',
    texto: 'Exploración de técnicas de medición y procesamiento de señales para obtener información útil y valorar su incertidumbre.',
  },
]
