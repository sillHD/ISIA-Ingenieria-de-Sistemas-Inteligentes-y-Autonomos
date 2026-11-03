import {createHash} from 'node:crypto'
import {load} from 'cheerio'
import {urlSegura,type Fuente} from './modelo.ts'

export const LISTADOS_HTML = {
 minciencias: 'https://minciencias.gov.co/convocatorias/todas',
 dima: 'https://investigacion.manizales.unal.edu.co/convocatorias/',
} as const
export type AdaptadorHtml = keyof typeof LISTADOS_HTML
export function listadoHtmlValido(adaptador:string|null,url:string|null):adaptador is AdaptadorHtml {
 return !!adaptador && adaptador in LISTADOS_HTML && !!url && url===LISTADOS_HTML[adaptador as AdaptadorHtml]
}

type Clasificacion = {categorias:string[];publicos:string[];areas:string[];beneficios:string[]}
type Candidato = {titulo:string;descripcion:string;url:string;edicion:string|null;clave:string;huella:string;clasificacion:Clasificacion}
export function interpretarHtml(html:string,fuente:Fuente,clasificar:(texto:string)=>Clasificacion):Candidato[]{
 if(!listadoHtmlValido(fuente.adaptador_html,fuente.url_listado))throw new Error('Adaptador HTML sin listado oficial permitido.')
 const $=load(html),enlaces:{titulo:string;descripcion:string;url:string}[]=[]
 if(fuente.adaptador_html==='minciencias'){
  $('table tr').slice(0,100).each((_,fila)=>{
   const celdas=$(fila).find('td'),enlace=celdas.eq(1).find('a[href]').first()
   if(celdas.length<3||!enlace.length)return
   enlaces.push({titulo:enlace.text().trim(),descripcion:celdas.eq(2).text().replace(/\s+/g,' ').trim(),url:enlace.attr('href')??''})
  })
 }else{
  $('a[href]').slice(0,300).each((_,nodo)=>{
   const enlace=$(nodo),href=enlace.attr('href')??''
   if(!/\/convocatorias\/(?:estudiantes_auxiliares|internas|conjuntas|minciencias)\/\d+(?:[/?#]|$)/i.test(href))return
   const contenedor=enlace.parents().toArray().map(x=>$(x)).find(x=>
    x.find('h1,h2,h3,h4').length>0 && x.text().trim().length>enlace.text().trim().length+30 && x.text().trim().length<=2500)
   const titulo=contenedor?.find('h1,h2,h3,h4').first().text().replace(/\s+/g,' ').trim()||enlace.text().trim()
   const descripcion=contenedor?.text().replace(/\s+/g,' ').trim()??''
   enlaces.push({titulo,descripcion,url:href})
  })
 }
 if(!enlaces.length)throw new Error('El listado HTML cambió o no contiene enlaces reconocibles.')
 const resultado:Candidato[]=[],vistos=new Set<string>()
 for(const entrada of enlaces){
  let url:URL
  try{url=new URL(entrada.url,fuente.url_listado!)}catch{continue}
  if(!urlSegura(url.href)||url.hostname.replace(/^www\./,'')!==new URL(fuente.url_listado!).hostname.replace(/^www\./,''))continue
  if(entrada.titulo.length<5||/^(?:ver convocatoria|convocatorias)$/i.test(entrada.titulo))continue
  url.hash='';for(const k of [...url.searchParams.keys()])if(/^utm_|^fbclid$|^gclid$/i.test(k))url.searchParams.delete(k)
  if(vistos.has(url.href))continue
  vistos.add(url.href)
  const titulo=entrada.titulo.slice(0,250),descripcion=entrada.descripcion.slice(0,5000)
  const clasificacion=clasificar(`${titulo} ${descripcion}`)
  if(!clasificacion.beneficios.length)continue
  const edicion=titulo.match(/\b20\d{2}\b/)?.[0]??null
  resultado.push({titulo,descripcion,url:url.href,edicion,clasificacion,
   clave:createHash('sha256').update(`${url.href}|${edicion??''}`).digest('hex'),
   huella:createHash('sha256').update(`${titulo}|${descripcion}|${url.href}`).digest('hex')})
 }
 return resultado.slice(0,100)
}
