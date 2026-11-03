import {ejecutarBusqueda} from '@/lib/convocatorias/motor'
export const dynamic='force-dynamic'
export const maxDuration=300
export async function GET(req:Request){
 const secreto=process.env.CRON_SECRET
 if(!secreto||req.headers.get('authorization')!==`Bearer ${secreto}`)return Response.json({error:'No autorizado'},{status:401,headers:{'Cache-Control':'no-store'}})
 try{const r=await ejecutarBusqueda('automatica');return Response.json(r,{status:r.estado==='fallida'?503:200,headers:{'Cache-Control':'no-store'}})}
 catch(e){console.error('[convocatorias] cron:',e);return Response.json({error:'Fallo de la búsqueda'},{status:500})}
}
