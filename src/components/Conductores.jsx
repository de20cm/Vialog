import { useState } from 'react'
import { supabase } from '../supabase'
import { C } from '../lib/colors'
import { uid, fmt } from '../lib/helpers'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Modal from './ui/Modal'
import Ic from './ui/Icons'
import { Inp, Field } from './ui/Input'

const Conductores = ({ conductores, setConductores, viajes }) => {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const s = f => setForm(p => ({ ...p, ...f }))

  const openNew = () => {
    setForm({ id:uid(), comision:10, activo:true })
    setModal("new")
  }
  const openEdit = c => { setForm({ ...c }); setModal("edit") }

  const save_ = async () => {
    if (!form.nombre) return alert("El nombre es obligatorio")
    if (modal === "new") {
      const { data } = await supabase.from('conductores').insert([form]).select()
      setConductores(p => [...p, data[0]])
    } else {
      await supabase.from('conductores').update(form).eq('id', form.id)
      setConductores(p => p.map(c => c.id === form.id ? form : c))
    }
    setModal(null)
  }

  const del = async id => {
    if (!confirm("¿Eliminar?")) return
    await supabase.from('conductores').delete().eq('id', id)
    setConductores(p => p.filter(c => c.id !== id))
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"13px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"9px" }}>
        <div>
          <h2 style={{ margin:"0 0 2px", fontSize:"19px", fontWeight:600, color:C.textPrimary }}>Conductores</h2>
          <p style={{ margin:0, color:C.textSecondary, fontSize:"12px" }}>{conductores.length} registros</p>
        </div>
        <Button onClick={openNew}><Ic n="plus" s={14}/> Agregar</Button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {conductores.map(c => {
          const mis = viajes.filter(v => v.conductor_id === c.id)
          const cob = mis.filter(v => v.pagado).reduce((s,v) => s + v.flete, 0)
          const com = cob * (c.comision / 100)
          return (
            <div key={c.id} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:"9px", padding:"12px 13px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"2px" }}>
                  <span style={{ fontSize:"13px", fontWeight:700, color:C.textPrimary }}>{c.nombre}</span>
                  <Badge label={c.activo ? "Activo" : "Inactivo"} color={c.activo ? "green" : "gray"}/>
                </div>
                <div style={{ fontSize:"10px", color:C.textMuted }}>{c.cedula} · {c.tel}</div>
                <div style={{ fontSize:"10px", color:C.textMuted, marginTop:"1px" }}>{mis.length} viajes · {c.comision}% comisión</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"14px", fontWeight:700, color:C.green }}>${fmt(com)}</div>
                <div style={{ fontSize:"10px", color:C.textMuted }}>comisión</div>
                <div style={{ display:"flex", gap:"4px", marginTop:"6px", justifyContent:"flex-end" }}>
                  <Button onClick={() => openEdit(c)} variant="ghost" small><Ic n="edit" s={12}/></Button>
                  <Button onClick={() => del(c.id)} variant="danger" small><Ic n="trash" s={12}/></Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Nuevo conductor" : "Editar conductor"} onClose={() => setModal(null)}>
          <Field label="Nombre *"><Inp value={form.nombre || ""} onChange={e => s({ nombre:e.target.value })}/></Field>
          <Field label="Cédula"><Inp value={form.cedula || ""} onChange={e => s({ cedula:e.target.value })}/></Field>
          <Field label="Teléfono"><Inp value={form.tel || ""} onChange={e => s({ tel:e.target.value })}/></Field>
          <Field label="% Comisión"><Inp type="number" value={form.comision ?? 10} onChange={e => s({ comision:+e.target.value })}/></Field>
          <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"12px" }}>
            <input type="checkbox" id="ac" checked={form.activo ?? true} onChange={e => s({ activo:e.target.checked })} style={{ width:"13px", height:"13px", accentColor:C.accent }}/>
            <label htmlFor="ac" style={{ fontSize:"12px", color:C.textSecondary, cursor:"pointer" }}>Activo</label>
          </div>
          <Button onClick={save_}>{modal === "new" ? "Agregar" : "Guardar"}</Button>
        </Modal>
      )}
    </div>
  )
}

export default Conductores