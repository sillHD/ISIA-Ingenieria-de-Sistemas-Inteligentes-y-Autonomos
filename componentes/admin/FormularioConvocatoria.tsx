'use client'
import {useActionState} from 'react'
import {guardarFicha, type Estado} from '@/lib/admin/convocatorias-acciones'
import {AMBITOS,AREAS,CATEGORIAS,ESTADOS,PUBLICOS,type Ficha} from '@/lib/convocatorias/modelo'
import estilos from './Convocatorias.module.css'

const inicio:Estado={ok:false}
export default function FormularioConvocatoria({ficha}:{ficha?:Ficha}){
 const [estado,accion,ocupado]=useActionState(guardarFicha.bind(null,ficha?.id??null),inicio)
 const campo=(nombre:string,etiqueta:string,valor:string,obligatorio=false,tipo='text')=><div className={estilos.campo} key={nombre}><label htmlFor={nombre}>{etiqueta}</label><input id={nombre} name={nombre} type={tipo} defaultValue={valor} required={obligatorio}/></div>
 return <form action={accion} className={estilos.form}>
  {campo('titulo','Título oficial *',ficha?.titulo??'',true)}
  {campo('institucion','Institución organizadora *',ficha?.institucion??'',true)}
  {campo('resumen','Resumen breve redactado por ISIA (obligatorio al publicar)',ficha?.resumen??'')}
  <div className={estilos.campo}><label htmlFor="descripcion">Descripción redactada y verificada por ISIA</label><textarea id="descripcion" name="descripcion" rows={6} defaultValue={ficha?.descripcion??''}/><span className={estilos.ayuda}>Resume con tus palabras el beneficio académico. No copies la descripción del portal oficial; enlázalo abajo.</span></div>
  {([['categorias','Categorías',CATEGORIAS,ficha?.categorias],['publicos','Públicos objetivo',PUBLICOS,ficha?.publicos],['areas','Áreas temáticas',AREAS,ficha?.areas]] as const).map(([nombre,etiqueta,opciones,actual])=><fieldset className={estilos.grupo} key={nombre}><legend>{etiqueta}</legend>{opciones.map(opcion=><label key={opcion}><input type="checkbox" name={nombre} value={opcion} defaultChecked={actual?.includes(opcion as never)??false}/>{opcion}</label>)}</fieldset>)}
  <div className={estilos.campo}><label htmlFor="ambito">Ámbito</label><select id="ambito" name="ambito" defaultValue={ficha?.ambito??'Colombia'}>{AMBITOS.map(x=><option key={x}>{x}</option>)}</select></div>
  {campo('paisRegion','País o región',ficha?.pais_region??'')}
  <div className={estilos.campo}><label htmlFor="beneficios">Beneficios académicos</label><textarea id="beneficios" name="beneficios" rows={4} defaultValue={ficha?.beneficios.join('\n')??''}/><span className={estilos.ayuda}>Uno por línea. Confirma cada beneficio en la fuente oficial.</span></div>
  <div className={estilos.campo}><label htmlFor="requisitos">Requisitos</label><textarea id="requisitos" name="requisitos" rows={4} defaultValue={ficha?.requisitos.join('\n')??''}/><span className={estilos.ayuda}>Uno por línea; deja vacío si no están publicados.</span></div>
  {campo('fechaApertura','Fecha de apertura',ficha?.fecha_apertura??'',false,'date')}
  {campo('fechaCierre','Fecha de cierre',ficha?.fecha_cierre??'',false,'date')}
  <label><input type="checkbox" name="permanente" defaultChecked={ficha?.permanente??false}/> Convocatoria permanente</label>
  <div className={estilos.campo}><label htmlFor="procedimiento">Procedimiento de postulación</label><textarea id="procedimiento" name="procedimiento" rows={4} defaultValue={ficha?.procedimiento??''}/></div>
  {campo('urlOficial','URL oficial HTTPS *',ficha?.url_oficial??'',true,'url')}
  {campo('urlPostulacion','URL directa de postulación',ficha?.url_postulacion??'',false,'url')}
  <div className={estilos.campo}><label htmlFor="documentos">Documentos oficiales</label><textarea id="documentos" name="documentos" rows={3} defaultValue={ficha?.documentos.map(d=>`${d.etiqueta} | ${d.url}`).join('\n')??''}/><span className={estilos.ayuda}>Nombre | URL HTTPS, uno por línea.</span></div>
  <div className={estilos.campo}><label htmlFor="estadoVigencia">Vigencia</label><select id="estadoVigencia" name="estadoVigencia" defaultValue={ficha?.estado_vigencia??'Por verificar'}>{ESTADOS.map(x=><option key={x}>{x}</option>)}</select></div>
  {campo('edicion','Edición o periodo',ficha?.edicion??'')}
  {ficha?.estado_editorial==='publicada'&&<label><input type="checkbox" name="confirmado"/> He revisado la fuente oficial y los cambios que afectan la ficha publicada.</label>}
  {estado.error&&<p role="alert" className={estilos.error}>{estado.error}</p>}
  <button className={estilos.boton} disabled={ocupado}>{ocupado?'Guardando…':'Guardar ficha'}</button>
 </form>
}
