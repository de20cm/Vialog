import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { C } from '../lib/colors'
import { uid, fmt, today } from '../lib/helpers'
import { METODOS } from '../lib/constants'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Modal from './ui/Modal'
import Ic from './ui/Icons'
import { Inp, Sel, Field } from './ui/Input'

const Pagos = ({ viajes, clientes, conductores, camiones, pagos, setPagos }) => {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const s = f => setForm(p => ({ ...p, ...f }))

  const openNew = () => {
    setForm({ id:uid(), fecha:today(), monto_usd:0, monto_bs:0, tasa:0 })
    setModal(true)
  }

  const save_ = async () => {
    if (!form.viaje_id || !form.monto_usd) return alert("Completa los campos obligatorios")
    const viaje = viajes.find(v => v.id === form.viaje_id)
    const cliente = clientes.find(c => c.id === viaje?.cliente_id)
    const conductor = conductores.find(c => c.id === viaje?.conductor_id)
    const camion = camiones.find(c => c.id === viaje?.camion_id)
    const pago = {
      ...form,
      cliente_id: cliente?.id || '',
      conductor: conductor?.nombre || '',
      camion: camion?.placa || '',
    }
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('pagos').insert([{ ...pago, user_id: user.id }]).select()
    setPagos(p => [...p, data[0]])
    setModal(false)
  }

  const del = async id => {
    if (!confirm("¿Eliminar pago?")) return
    await supabase.from('pagos').delete().eq('id', id)
    setPagos(p => p.filter(x => x.id !== id))
  }

  const total = pagos.reduce((s,p) => s + p.monto_usd, 0)

  // pagos agrupados por viaje
  const porViaje = viajes.map(v => {
    const misPagos = pagos.filter(p => p.viaje_id === v.id)
    const totalPagado = misPagos.reduce((s,p) => s + p.monto_usd, 0)
    const pendiente = v.flete - totalPagado
    return { viaje:v, pagos:misPagos, totalPagado, pendiente }
  }).filter(x => x.pagos.length > 0 || x.viaje.flete > 0)

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
        {porViaje.map(({ viaje, pagos:misPagos, totalPagado, pendiente }) => {
          const cli = clientes.find(c => c.id === viaje.cliente_id)
          return (
            <div key={viaje.id} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:"9px", overflow:"hidden" }}>
              <div style={{ padding:"10px 13px", borderBottom:`1px solid ${C.border}`, background:C.bg2, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"6px" }}>
                <div>
                  <span style={{ fontSize:"12px", fontWeight:700, color:C.accentLight }}>{viaje.numero}</span>
                  <span style={{ fontSize:"11px", color:C.textMuted, marginLeft:"8px" }}>{viaje.origen} → {viaje.destino}</span>
                  {cli && <span style={{ fontSize:"11px", color:C.textMuted }}> · {cli.nombre}</span>}
                </div>
                <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"12px", color:C.green, fontWeight:700 }}>Cobrado: ${fmt(totalPagado)}</div>
                    {pendiente > 0 && <div style={{ fontSize:"11px", color:C.yellow }}>Pendiente: ${fmt(pendiente)}</div>}
                  </div>
                  <div style={{ height:"36px", width:"36px", borderRadius:"50%", background:C.bg3, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg viewBox="0 0 36 36" width="36" height="36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke={C.border} strokeWidth="3"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke={pendiente <= 0 ? C.green : C.accent} strokeWidth="3"
                        strokeDasharray={`${Math.min((totalPagado/viaje.flete)*87.96, 87.96)} 87.96`}
                        strokeLinecap="round" transform="rotate(-90 18 18)"/>
                    </svg>
                  </div>
                </div>
              </div>
              {misPagos.map(p => (
                <div key={p.id} style={{ padding:"9px 13px", borderBottom:`1px solid ${C.bg3}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:"8px" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"1px" }}>
                      <Badge label={p.metodo || "—"} color="blue"/>
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
          )
        })}
      </div>

      {modal && (
        <Modal title="Registrar pago" onClose={() => setModal(false)}>
          <Field label="Viaje *">
            <Sel value={form.viaje_id || ""} onChange={e => s({ viaje_id:e.target.value })}>
              <option value="">Seleccionar</option>
              {viajes.map(v => <option key={v.id} value={v.id}>{v.numero} – {v.origen}→{v.destino} (${fmt(v.flete)})</option>)}
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
          <Field label="Método *">
            <Sel value={form.metodo || ""} onChange={e => s({ metodo:e.target.value })}>
              <option value="">Seleccionar</option>
              {METODOS.map(m => <option key={m}>{m}</option>)}
            </Sel>
          </Field>
          <Field label="Referencia">
            <Inp value={form.referencia || ""} onChange={e => s({ referencia:e.target.value })}/>
          </Field>
          <Button onClick={save_}>Registrar pago</Button>
        </Modal>
      )}
    </div>
  )
}

export default Pagos