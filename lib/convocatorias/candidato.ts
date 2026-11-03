import type {Fuente} from './modelo.ts'

export type CandidatoExtraido = {
 titulo:string;descripcion:string;url:string;edicion:string|null;huella:string;
 clasificacion:{categorias:string[];publicos:string[];areas:string[];beneficios:string[]}
}

/** El texto externo sirve para detectar novedades, pero no se publica ni se almacena. */
export function prepararCandidato(item:CandidatoExtraido,fuente:Fuente){
 return {titulo:item.titulo,institucion:fuente.institucion,resumen:'',descripcion:'',
  categorias:item.clasificacion.categorias,publicos:item.clasificacion.publicos,areas:item.clasificacion.areas,
  beneficios:item.clasificacion.beneficios,url_oficial:item.url,edicion:item.edicion,
  ambito:fuente.pais_ambito==='Colombia'?'Colombia':'Internacional',pais_region:fuente.pais_ambito,
  huella_contenido:item.huella,actualizado_en:new Date().toISOString()}
}
