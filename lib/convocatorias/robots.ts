/** Reglas de rastreo aplicables a una URL pública. Las reglas más específicas prevalecen. */
export function permiteRobots(contenido: string, urlTexto: string, agente = 'ISIA-Convocatorias'): boolean {
 const grupos: {agentes: string[]; reglas: {permite: boolean; patron: string}[]}[] = []
 let grupo: (typeof grupos)[number] | null = null
 for (const linea of contenido.split(/\r?\n/)) {
  const limpia = linea.split('#', 1)[0].trim()
  if (!limpia) {
   grupo = null
   continue
  }
  const separador = limpia.indexOf(':')
  if (separador < 0) continue
  const clave = limpia.slice(0, separador).trim().toLowerCase()
  const valor = limpia.slice(separador + 1).trim()
  if (clave === 'user-agent') {
   if (!grupo || grupo.reglas.length) {
    grupo = {agentes: [], reglas: []}
    grupos.push(grupo)
   }
   grupo.agentes.push(valor.toLowerCase())
  } else if (grupo && (clave === 'allow' || clave === 'disallow') && valor.startsWith('/')) {
   grupo.reglas.push({permite: clave === 'allow', patron: valor})
  }
 }
 const nombre = agente.toLowerCase()
 const longitudAgente = Math.max(0, ...grupos.flatMap(g => g.agentes.filter(a => a !== '*' && nombre.startsWith(a)).map(a => a.length)))
 const aplicables = longitudAgente
  ? grupos.filter(g => g.agentes.some(a => a.length === longitudAgente && nombre.startsWith(a)))
  : grupos.filter(g => g.agentes.includes('*'))
 const url = new URL(urlTexto)
 const ruta = url.pathname + url.search
 let coincidencia: {longitud: number; permite: boolean} | null = null
 for (const grupoAplicable of aplicables) for (const regla of grupoAplicable.reglas) {
  const final = regla.patron.endsWith('$')
  const patron = final ? regla.patron.slice(0, -1) : regla.patron
  const expresion = '^' + patron.split('*').map(p => p.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')).join('.*') + (final ? '$' : '')
  if (!new RegExp(expresion).test(ruta)) continue
  const longitud = patron.replace(/\*/g, '').length
  if (!coincidencia || longitud > coincidencia.longitud || (longitud === coincidencia.longitud && regla.permite)) {
   coincidencia = {longitud, permite: regla.permite}
  }
 }
 return coincidencia?.permite ?? true
}
