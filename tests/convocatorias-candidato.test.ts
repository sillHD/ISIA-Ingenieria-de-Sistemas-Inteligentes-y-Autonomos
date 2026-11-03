import assert from 'node:assert/strict'
import test from 'node:test'
import {prepararCandidato} from '../lib/convocatorias/candidato.ts'
import type {Fuente} from '../lib/convocatorias/modelo.ts'

test('el candidato guarda el enlace y deja la síntesis para redacción editorial',()=>{
 const fuente={institucion:'Institución oficial',pais_ambito:'Colombia'} as Fuente
 const item={titulo:'Convocatoria oficial',descripcion:'Texto externo completo que no debe almacenarse',url:'https://ejemplo.edu.co/convocatoria',edicion:'2026',huella:'abc',
  clasificacion:{categorias:['Investigación y financiación'],publicos:[],areas:[],beneficios:['Posible apoyo; confirmar en fuente oficial.']}}
 const datos=prepararCandidato(item,fuente)
 assert.equal(datos.url_oficial,item.url)
 assert.equal(datos.descripcion,'')
 assert.equal(datos.resumen,'')
 assert.equal(JSON.stringify(datos).includes(item.descripcion),false)
})
