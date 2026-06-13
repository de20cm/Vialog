import { useState } from 'react'
import { supabase } from '../../supabase'
import { C } from '../../lib/colors'
import { uid, fmt, today } from '../../lib/helpers'
import { CATEGORIAS_GASTO_TONELAJE, TIPOS_GASTO_TONELAJE } from '../../lib/constants'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Ic from '../ui/Icons'
import { Inp, Sel, Field } from '../ui/Input'

const Gastos = ({ gastos, setGastos, camiones }) => {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [mes, setMes] = useState(() => {
    const hoy = new Date()
    return `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}`
  })
  const s = f => setForm(p => ({ ...p, ...f }))

  const meses = [...new Set(gastos.map(g => g.fecha?.slice(0,7)).filter(Boolean))].sort().reverse()
  const gastosMes = gastos.filter(g => g.fecha?.startsWith(mes))
  const total = gastosMes.reduce((s,g) => s + (g.monto_usd || 0), 0)

  const openNew = () => {
    setForm({ id:uid(), fecha:today(), monto_bs:0, tasa:0, monto_usd:0, tipo_gasto:"VARIABLES" })
    setModal(true)
  }

  const save_ = async () => {
    if (!form.categoria || !form.camion_id || !form.monto_usd) return alert("Completa los campos obligatorios")
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('gastos_tonelaje').insert([{ ...form, user_id: user.id }]).select()
    setGastos(p => [...p, data[0]])
    setModal(false)
  }

  const del = async id => {
    if (!confirm("¿Eliminar?")) return
    await supabase.from('gastos_tonelaje').delete().eq('id', id)
    setGastos(p => p.filter(g => g.id !== id))
  }

  const tc = { FIJOS:"blue", VARIABLES:"yellow" }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"13px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"9px" }}>
        <div>
          <h2 style={{ margin:"0 0 2px", fontSize:"19px", fontWeight:600, color:C.textPrimary }}>Gastos</h2>
          <p style={{ margin:0, color:C.textSecondary, fontSize:"12px" }}>Total mes: ${fmt(total)}</p>
        </div>
        <Button onClick={openNew}><Ic n="plus" s={14}/> Registrar gasto</Button>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
        {meses.map(m => (
          <button key={m} onClick={() => setMes(m)} style={{ padding:"3px 10px", borderRadius:"20px", border:"1px solid", fontSize:"11px", fontWeight:600, cursor:"pointer", background:mes===m?C.accent:"transparent", color:mes===m?"#fff":C.textMuted, borderColor:mes===m?C.accent:C.border }}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {gastosMes.length === 0 && <div style={{ color:C.textMuted, textAlign:"center", padding:"36px", fontSize:"12px" }}>Sin gastos este mes</div>}
        {[...gastosMes].reverse().map(g => {
          const cam = camiones.find(c => c.id === g.camion_id)
          return (
            <div key={g.id} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:"9px", padding:"11px 13px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"8px" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"2px" }}>
                  <Badge label={g.tipo_gasto} color={tc[g.tipo_gasto] || "gray"}/>
                  <span style={{ fontSize:"10px", color:C.textMuted }}>{g.fecha}</span>
                </div>
                <div style={{ fontSize:"11px", color:C.textSecondary }}>{g.categoria} · {g.subcategoria}{cam ? ` · Unidad ${cam.numero}` : ""}</div>
                {g.descripcion && <div style={{ fontSize:"10px", color:C.textMuted }}>{g.descripcion}</div>}
                {g.proveedor && <div style={{ fontSize:"10px", color:C.textMuted }}>Proveedor: {g.proveedor}</div>}
                {g.tasa > 0 && <div style={{ fontSize:"10px", color:C.textMuted }}>Bs {fmt(g.monto_bs)} · Tasa {g.tasa}</div>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                <span style={{ fontSize:"14px", fontWeight:700, color:C.red }}>${fmt(g.monto_usd)}</span>
                <Button onClick={() => del(g.id)} variant="danger" small><Ic n="trash" s={12}/></Button>
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal title="Registrar gasto" onClose={() => setModal(false)}>
          <Field label="Unidad *">
            <Sel value={form.camion_id || ""} onChange={e => s({ camion_id:e.target.value })}>
              <option value="">Seleccionar</option>
              {camiones.map(c => <option key={c.id} value={c.id}>Unidad {c.numero}</option>)}
            </Sel>
          </Field>
          <Field label="Categoría *">
            <Sel value={form.categoria || ""} onChange={e => s({ categoria:e.target.value })}>
              <option value="">Seleccionar</option>
              {CATEGORIAS_GASTO_TONELAJE.map(c => <option key={c}>{c}</option>)}
            </Sel>
          </Field>
          <Field label="Subcategoría"><Inp value={form.subcategoria || ""} onChange={e => s({ subcategoria:e.target.value })}/></Field>
          <Field label="Descripción"><Inp value={form.descripcion || ""} onChange={e => s({ descripcion:e.target.value })}/></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 11px" }}>
            <Field label="Monto (USD) *">
              <Inp type="number" value={form.monto_usd || ""} onChange={e => s({ monto_usd:+e.target.value, monto_bs:+((+e.target.value)*(form.tasa||0)).toFixed(2) })}/>
            </Field>
            <Field label="Tasa BCV">
              <Inp type="number" value={form.tasa || ""} onChange={e => s({ tasa:+e.target.value, monto_bs:+((form.monto_usd||0)*(+e.target.value)).toFixed(2) })}/>
            </Field>
            <Field label="Monto (Bs)">
              <Inp type="number" value={form.monto_bs || ""} onChange={e => s({ monto_bs:+e.target.value })}/>
            </Field>
            <Field label="Fecha">
              <Inp type="date" value={form.fecha || ""} onChange={e => s({ fecha:e.target.value })}/>
            </Field>
          </div>
          <Field label="Tipo *">
            <Sel value={form.tipo_gasto || "VARIABLES"} onChange={e => s({ tipo_gasto:e.target.value })}>
              {TIPOS_GASTO_TONELAJE.map(t => <option key={t}>{t}</option>)}
            </Sel>
          </Field>
          <Field label="Proveedor"><Inp value={form.proveedor || ""} onChange={e => s({ proveedor:e.target.value })}/></Field>
          <Button onClick={save_}>Guardar gasto</Button>
        </Modal>
      )}
    </div>
  )
}

export default Gastos