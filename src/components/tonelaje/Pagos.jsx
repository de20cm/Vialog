import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import { C } from '../../lib/colors'
import { uid, fmt, today } from '../../lib/helpers'
import { METODOS } from '../../lib/constants'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Ic from '../ui/Icons'
import { Inp, Sel, Field } from '../ui/Input'

const Pagos = ({ viajes, pagos, setPagos, conductores, camiones, rutas }) => {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const s = f => setForm(p => ({ ...p, ...f }))

  const openNew = () => {
    setForm({ id:uid(), fecha:today(), monto_usd:0, monto_bs:0, tasa:0, metodo:"Transferencia" })
    setModal(true)
  }

  const save_ = async () => {
    if (!form.viaje_id || !form.monto_usd) return alert("Completa los campos obligatorios")
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('pagos_tonelaje').insert([{ ...form, user_id: user.id }]).select()
    setPagos(p => [...p, data[0]])
    setModal(false)
  }

  const del = async id => {
    if (!confirm("¿Eliminar pago?")) return
    await supabase.from('pagos_tonelaje').delete().eq('id', id)
    setPagos(p => p.filter(x => x.id !== id))
  }

  const total = pagos.reduce((s,p) => s + p.monto_usd, 0)

  const porViaje = viajes.map(v => {
    const misPagos = pagos.filter(p => p.viaje_id === v.id)
    const cobrado = misPagos.reduce((s,p) => s + p.monto_usd, 0)
    const pendiente = v.ingreso_bruto - cobrado
    const pct = Math.min((cobrado / v.ingreso_bruto) * 100, 100)
    const ruta = rutas.find(r => r.id === v.ruta_id)
    const cam = camiones.find(c => c.id === v.camion_id)
    const cond = conductores.find(c => c.id === v.conductor_id)
    return { viaje:v, pagos:misPagos, cobrado, pendiente, pct, ruta, cam, cond }
  }).filter(x => x.viaje.ingreso_bruto > 0)

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"13px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"9px" }}>
        <div>
          <h2 style={{ margin:"0 0 2px", fontSize:"19px", fontWeight:600, color:C.textPrimary }}>Pagos</h2>
          <p style={{ margin:0, color:C.textSecondary, fontSize:"12px" }}>Total cobrado: ${fmt(total)}</p>
        </div>
        <Button onClick={openNew}><Ic n="plus" s={14}/> Registrar pago</Button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {porViaje.map(({ viaje, pagos:misPagos, cobrado, pendiente, pct, ruta, cam, cond }) => (
          <div key={viaje.id} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:"9px", overflow:"hidden" }}>
            <div style={{ padding:"10px 13px", borderBottom:`1px solid ${C.border}`, background:C.bg2, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"6px" }}>
              <div>
                <span style={{ fontSize:"12px", fontWeight:700, color:C.accentLight }}>{viaje.fecha}</span>
                <span style={{ fontSize:"11px", color:C.textMuted, marginLeft:"8px" }}>{ruta?.nombre || "Sin ruta"}</span>
                <div style={{ fontSize:"10px", color:C.textMuted, marginTop:"1px" }}>Unidad {cam?.numero} · {cond?.nombre}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"12px", color:C.green, fontWeight:700 }}>Cobrado: ${fmt(cobrado)}</div>
                {pendiente > 0 && <div style={{ fontSize:"11px", color:C.yellow }}>Pendiente: ${fmt(pendiente)}</div>}
              </div>
            </div>

            <div style={{ padding:"8px 13px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10px", color:C.textMuted, marginBottom:"4px" }}>
                <span>Total: ${fmt(viaje.ingreso_bruto)}</span>
                <span>{pct.toFixed(0)}% cobrado</span>
              </div>
              <div style={{ height:"4px", background:C.bg3, borderRadius:"2px" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:pendiente <= 0 ? C.green : C.accent, borderRadius:"2px", transition:"width 0.3s" }}/>
              </div>
            </div>

            {misPagos.length === 0 && <div style={{ padding:"10px 13px", color:C.textMuted, fontSize:"12px" }}>Sin pagos registrados</div>}
            {misPagos.map(p => (
              <div key={p.id} style={{ padding:"9px 13px", borderBottom:`1px solid ${C.bg3}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:"8px" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"1px" }}>
                    <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:"20px", fontSize:"10px", fontWeight:700, background:C.blueBg, color:C.blue, border:`1px solid ${C.blueBorder}` }}>{p.metodo}</span>
                    <span style={{ fontSize:"10px", color:C.textMuted }}>{p.fecha}</span>
                    {p.referencia && <span style={{ fontSize:"10px", color:C.textMuted }}>Ref: {p.referencia}</span>}
                  </div>
                  {p.tasa > 0 && <div style={{ fontSize:"10px", color:C.textMuted }}>Bs {fmt(p.monto_bs)} · Tasa {p.tasa}</div>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                  <span style={{ fontSize:"14px", fontWeight:700, color:C.green }}>${fmt(p.monto_usd)}</span>
                  <Button onClick={() => del(p.id)} variant="danger" small><Ic n="trash" s={12}/></Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {modal && (
        <Modal title="Registrar pago" onClose={() => setModal(false)}>
          <Field label="Viaje *">
            <Sel value={form.viaje_id || ""} onChange={e => s({ viaje_id:e.target.value })}>
              <option value="">Seleccionar</option>
              {viajes.map(v => {
                const r = rutas.find(x => x.id === v.ruta_id)
                return <option key={v.id} value={v.id}>{v.fecha} · {r?.nombre || "Sin ruta"} · ${fmt(v.ingreso_bruto)}</option>
              })}
            </Sel>
          </Field>
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
          <Field label="Método">
            <Sel value={form.metodo || "Transferencia"} onChange={e => s({ metodo:e.target.value })}>
              {METODOS.map(m => <option key={m}>{m}</option>)}
            </Sel>
          </Field>
          <Field label="Referencia">
            <Inp value={form.referencia || ""} onChange={e => s({ referencia:e.target.value })} placeholder="Número de referencia"/>
          </Field>
          <Button onClick={save_}>Guardar pago</Button>
        </Modal>
      )}
    </div>
  )
}

export default Pagos
