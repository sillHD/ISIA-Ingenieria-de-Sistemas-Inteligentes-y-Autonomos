import {listarPublicas} from '@/lib/convocatorias/datos'
import {AMBITOS,AREAS,CATEGORIAS,ESTADOS,PUBLICOS,vigencia} from '@/lib/convocatorias/modelo'
export const dynamic='force-dynamic'
export async function GET(request:Request){
 try{
  const p=new URL(request.url).searchParams
  const opcion=(clave:string,valores:readonly string[],defecto:string)=>valores.includes(p.get(clave)??'')?p.get(clave)!:defecto
  const estado=opcion('estado',[...ESTADOS,'todos'],'Disponible'),publico=opcion('publico',[...PUBLICOS,'todos'],'todos')
  const categoria=opcion('categoria',[...CATEGORIAS,'todas'],'todas'),ambito=opcion('ambito',[...AMBITOS,'todos'],'todos')
  const area=opcion('area',[...AREAS,'todas'],'todas'),q=(p.get('q')??'').slice(0,120).toLowerCase()
  const pagina=Math.max(1,Math.min(1000,Number.parseInt(p.get('pagina')??'1',10)||1))
  const limite=Math.max(1,Math.min(50,Number.parseInt(p.get('limite')??'12',10)||12))
  const todas=(await listarPublicas()).filter(x=>(estado==='todos'||vigencia(x)===estado)&&
   (publico==='todos'||x.publicos.includes(publico as typeof PUBLICOS[number]))&&
   (categoria==='todas'||x.categorias.includes(categoria as typeof CATEGORIAS[number]))&&
   (ambito==='todos'||x.ambito===ambito)&&(area==='todas'||x.areas.includes(area as typeof AREAS[number]))&&
   (!q||[x.titulo,x.institucion,x.resumen,x.descripcion].join(' ').toLowerCase().includes(q)))
  return Response.json({convocatorias:todas.slice((pagina-1)*limite,pagina*limite),total:todas.length,pagina,limite},{headers:{'Cache-Control':'no-store'}})
 }catch(error){console.error('[convocatorias] catálogo:',error);return Response.json({error:'No se pudo consultar el catálogo.'},{status:500})}
}
