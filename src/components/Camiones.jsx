import { useState } from 'react'
import { supabase } from '../supabase'
import { C } from '../lib/colors'
import { uid, fmt } from '../lib/helpers'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Modal from './ui/Modal'
import Ic from './ui/Icons'
import { Inp, Field } from './ui/Input'

const Camiones = ({ camiones, setCamiones, viajes }) => {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const s = f => setForm(p => ({ ...p, ...f }))

  const openNew = () => {
    setForm({ id:uid(), activo:true })
    setModal("new")
  }
  const openEdit = c => { setForm({ ...c }); setModal("edit") }

  const save_ = async () => {
    if (!form.placa) return alert("La placa es obligatoria")
    if (modal === "new") {
      const { data } = await supabase.from('camiones').insert([form]).select()
      setCamiones(p => [...p, data[0]])
    } else {
      await supabase.from('camiones').update(form).eq('id', form.id)
      setCamiones(p => p.map(c => c.id === form.id ? form : c))
    }
    setModal(null)
  }

  const del = async id => {
    if (!confirm("¿Eliminar?")) return
    await supabase.from('camiones').delete().eq('id', id)
    setCamiones(p => p.filter(c => c.id !== id))
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"13px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"9px" }}>
        <div>
          <h2 style={{ margin:"0 0 2px", fontSize:"19px", fontWeight:600, color:C.textPrimary }}>Flota</h2>
          <p style={{ margin:0, color:C.textSecondary, fontSize:"12px" }}>{camiones.length} unidades</p>
        </div>
        <Button onClick={openNew}><Ic n="plus" s={14}/> Agregar unidad</Button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {camiones.map(c => {
          const mis = viajes.filter(v => v.camion_id === c.id)
          const ing = mis.reduce((s,v) => s + v.flete, 0)
          return (
            <div key={c.id} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:"9px", padding:"12px 13px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"2px" }}>
                  <span style={{ fontSize:"15px", fontWeight:700, color:C.accentLight }}>{c.placa}</span>
                  <Badge label={c.activo ? "Activo" : "Inactivo"} color={c.activo ? "green" : "gray"}/>
                </div>
                <div style={{ fontSize:"12px", color:C.textSecondary }}>{c.marca} {c.modelo} {c.año}</div>
                <div style={{ fontSize:"10px", color:C.textMuted, marginTop:"1px" }}>{fmt(c.km)} km · {mis.length} viajes</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"14px", fontWeight:700, color:C.textPrimary }}>${fmt(ing)}</div>
                <div style={{ fontSize:"10px", color:C.textMuted }}>ingresos</div>
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
        <Modal title={modal === "new" ? "Nueva unidad" : "Editar unidad"} onClose={() => setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 11px" }}>
            <Field label="Placa *"><Inp value={form.placa || ""} onChange={e => s({ placa:e.target.value.toUpperCase() })}/></Field>
            <Field label="Año"><Inp type="number" value={form.año || ""} onChange={e => s({ año:+e.target.value })}/></Field>
            <Field label="Marca"><Inp value={form.marca || ""} onChange={e => s({ marca:e.target.value })}/></Field>
            <Field label="Modelo"><Inp value={form.modelo || ""} onChange={e => s({ modelo:e.target.value })}/></Field>
          </div>
          <Field label="Kilometraje actual"><Inp type="number" value={form.km || ""} onChange={e => s({ km:+e.target.value })}/></Field>
          <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"12px" }}>
            <input type="checkbox" id="av" checked={form.activo ?? true} onChange={e => s({ activo:e.target.checked })} style={{ width:"13px", height:"13px", accentColor:C.accent }}/>
            <label htmlFor="av" style={{ fontSize:"12px", color:C.textSecondary, cursor:"pointer" }}>Activa</label>
          </div>
          <Button onClick={save_}>{modal === "new" ? "Agregar" : "Guardar"}</Button>
        </Modal>
      )}
    </div>
  )
}

export default Camiones