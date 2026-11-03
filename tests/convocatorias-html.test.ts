import assert from 'node:assert/strict'
import test from 'node:test'
import {interpretarHtml,listadoHtmlValido,LISTADOS_HTML} from '../lib/convocatorias/html.ts'
import type {Fuente} from '../lib/convocatorias/modelo.ts'

const clase=()=>({categorias:['Investigación y financiación'],publicos:['Grupos y semilleros de investigación'],areas:[],beneficios:['Apoyo académico por verificar']})
const base={id:'f',nombre:'Fuente',institucion:'Fuente',pais_ambito:'Colombia',url_feed:null,
 habilitada:false,estado_integracion:'Pendiente',ultima_consulta:null,ultimo_resultado:null,ultimo_error:null,fallos_consecutivos:0}

test('el adaptador Minciencias recoge filas oficiales y descarta enlaces externos',()=>{
 const fuente={...base,url_oficial:LISTADOS_HTML.minciencias,url_listado:LISTADOS_HTML.minciencias,adaptador_html:'minciencias',integracion:'html'} as Fuente
 const html='<table><tbody><tr><td>55</td><td><a href="/convocatorias/proyecto-2026">Convocatoria de investigación 2026</a></td><td>Financiación de investigación</td></tr><tr><td>1</td><td><a href="https://evil.example/convocatorias/falsa">Convocatoria falsa</a></td><td>Financiación</td></tr></tbody></table>'
 const r=interpretarHtml(html,fuente,clase)
 assert.equal(r.length,1)
 assert.equal(r[0].url,'https://minciencias.gov.co/convocatorias/proyecto-2026')
 assert.equal(r[0].edicion,'2026')
})
test('el adaptador DIMA usa el enlace de detalle y el texto de la tarjeta',()=>{
 const fuente={...base,url_oficial:LISTADOS_HTML.dima,url_listado:LISTADOS_HTML.dima,adaptador_html:'dima',integracion:'html'} as Fuente
 const html='<section><h2>Convocatoria estudiante auxiliar DIMA 41 - 2026</h2><p>Proyecto de investigación para estudiante de pregrado. Estímulo económico.</p><a href="/convocatorias/estudiantes_auxiliares/191">Ver convocatoria...</a></section>'
 const r=interpretarHtml(html,fuente,clase)
 assert.equal(r.length,1)
 assert.match(r[0].descripcion,/Estímulo económico/)
 assert.equal(r[0].url,'https://investigacion.manizales.unal.edu.co/convocatorias/estudiantes_auxiliares/191')
})
test('el adaptador DIMA descarta una convocatoria marcada como finalizada',()=>{
 const fuente={...base,url_oficial:LISTADOS_HTML.dima,url_listado:LISTADOS_HTML.dima,adaptador_html:'dima',integracion:'html'} as Fuente
 const html='<section><h2>Convocatoria estudiante auxiliar DIMA 41 - 2026</h2><p>Proyecto de investigación para estudiante de pregrado. Finalizada.</p><a href="/convocatorias/estudiantes_auxiliares/191">Ver convocatoria...</a></section>'
 assert.equal(interpretarHtml(html,fuente,clase).length,0)
})
test('solo se aceptan listados HTML de los adaptadores definidos',()=>{
 assert.equal(listadoHtmlValido('minciencias',LISTADOS_HTML.minciencias),true)
 assert.equal(listadoHtmlValido('minciencias','https://minciencias.gov.co/otra'),false)
 assert.equal(listadoHtmlValido('inventado',LISTADOS_HTML.minciencias),false)
})
