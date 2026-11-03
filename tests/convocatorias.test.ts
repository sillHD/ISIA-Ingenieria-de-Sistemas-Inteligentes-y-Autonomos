import assert from 'node:assert/strict'
import test from 'node:test'
import {fichaSchema,urlSegura,vigencia,esInstitucional, type Ficha} from '../lib/convocatorias/modelo.ts'

const base={titulo:'Convocatoria oficial 2026',institucion:'Universidad de prueba',resumen:'',descripcion:'Descripción verificada',
 categorias:['Investigación y financiación','Colaboración académica y científica'],
 publicos:['Estudiantes de posgrado','Grupos y semilleros de investigación'],areas:['Robótica'],ambito:'Colombia',paisRegion:'Colombia',
 beneficios:['Financiación de proyectos'],requisitos:[],fechaApertura:'',fechaCierre:'',permanente:false,
 procedimiento:'Consultar institución',urlOficial:'https://universidad.edu.co/convocatoria',urlPostulacion:'',estadoVigencia:'Por verificar',edicion:'2026'}
test('categorías y públicos no son excluyentes',()=>{const r=fichaSchema.safeParse(base);assert.equal(r.success,true);if(r.success){assert.equal(r.data.categorias.length,2);assert.equal(r.data.publicos.length,2)}})
test('rechaza enlaces inseguros y fechas incoherentes',()=>{
 for(const url of ['http://universidad.edu.co','https://127.0.0.1/a','https://intranet.local/a','https://usuario:clave@universidad.edu.co'])assert.equal(urlSegura(url),false)
 assert.equal(fichaSchema.safeParse({...base,fechaApertura:'2026-12-01',fechaCierre:'2026-11-01'}).success,false)
})
test('una fecha futura no convierte por verificar en disponible',()=>{
 const ficha={fecha_cierre:'2099-12-31',estado_vigencia:'Por verificar'} as Ficha
 assert.equal(vigencia(ficha),'Por verificar')
 assert.equal(vigencia({...ficha,fecha_cierre:'2020-01-01',estado_vigencia:'Disponible'}),'Vencida')
})
test('solo el administrador con doble identidad configurada es institucional',()=>{
 assert.equal(esInstitucional('admin','iscortesr@unal.edu.co','iscortesr@unal.edu.co','iscortesr@unal.edu.co'),true)
 assert.equal(esInstitucional('editor','iscortesr@unal.edu.co','iscortesr@unal.edu.co','iscortesr@unal.edu.co'),false)
 assert.equal(esInstitucional('admin','otro@unal.edu.co','iscortesr@unal.edu.co','iscortesr@unal.edu.co'),false)
 assert.equal(esInstitucional('admin','iscortesr@unal.edu.co','iscortesr@unal.edu.co',undefined),false)
})
