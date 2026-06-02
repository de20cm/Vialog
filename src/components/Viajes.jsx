import { useState } from 'react'
import { supabase } from '../supabase'
import { C } from '../lib/colors'
import { uid, fmt, today } from '../lib/helpers'
import { ESTADOS, EQUIPOS } from '../lib/constants'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Modal from './ui/Modal'
import Ic from './ui/Icons'
import { Inp, Sel, Field } from './ui/Input'

const Viajes = ({ viajes, setViajes, camiones, conductores, clientes, gastos }) => {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [filtro, setFiltro] = useState("todos")
  const s = f => setForm(p => ({ ...p, ...f }))

  const openNew = () => {
    setForm({ id:uid(), numero:`V-${String(viajes.length+1).padStart(3,"0")}`, salida:today(), pagado:false, estado:"en curso", litros_combustible:0, peso_kg:0 })
    setModal("new")
  }
  const openEdit = v => { setForm({ ...v }); setModal("edit") }

  const save_ = async () => {
    if (!form.camion_id || !form.origen || !form.destino || !form.flete) return alert("Completa los campos obligatorios")
    if (modal === "new") {
      const { data } = await supabase.from('viajes').insert([form]).select()
      setViajes(p => [...p, data[0]])
    } else {
      await supabase.from('viajes').update(form).eq('id', form.id)
      setViajes(p => p.map(v => v.id === form.id ? form : v))
    }
    setModal(null)
  }

  const del = async id => {
    if (!confirm("¿Eliminar viaje?")) return
    await supabase.from('viajes').delete().eq('id', id)
    setViajes(p => p.filter(v => v.id !== id))
  }

  const filt = filtro === "todos" ? viajes : viajes.filter(v => v.estado === filtro)
  const ec = { "en curso":"blue", "completado":"green", "pendiente":"yellow", "cobrado":"green" }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"13px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"9px" }}>
        <div>
          <h2 style={{ margin:"0 0 2px", fontSize:"19px", fontWeight:600, color:C.textPrimary }}>Viajes</h2>
          <p style={{ margin:0, color:C.textSecondary, fontSize:"12px" }}>{viajes.length} registros</p>
        </div>
        <Button onClick={openNew}><Ic n="plus" s={14}/> Nuevo viaje</Button>
      </div>

      <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
        {["todos", ...ESTADOS].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{ padding:"3px 10px", borderRadius:"20px", border:"1px solid", fontSize:"11px", fontWeight:600, cursor:"pointer", background:filtro===f?C.accent:"transparent", color:filtro===f?"#fff":C.textMuted, borderColor:filtro===f?C.accent:C.border, textTransform:"capitalize" }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {filt.length === 0 && <div style={{ color:C.textMuted, textAlign:"center", padding:"36px", fontSize:"12px" }}>Sin viajes</div>}
        {filt.map(v => {
          const cam  = camiones.find(c => c.id === v.camion_id)
          const cond = conductores.find(c => c.id === v.conductor_id)
          const mg   = gastos.filter(g => g.viaje_id === v.id).reduce((s,g) => s + g.monto_usd, 0)
          const util = v.flete - mg
          return (
            <div key={v.id} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:"9px", padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:"170px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}>
                    <span style={{ fontSize:"12px", fontWeight:700, color:C.accentLight }}>{v.numero}</span>
                    <Badge label={v.estado} color={ec[v.estado] || "gray"}/>
                    {v.pagado && <Badge label="Pagado" color="green"/>}
                  </div>
                  <div style={{ fontSize:"13px", fontWeight:600, color:C.textPrimary, marginBottom:"2px" }}>{v.origen} → {v.destino}</div>
                  <div style={{ fontSize:"11px", color:C.textMuted }}>{cam?.placa} · {cond?.nombre} · {v.km ? `${fmt(v.km)} km` : ""}{v.equipo ? ` · ${v.equipo}` : ""}</div>
                  <div style={{ fontSize:"10px", color:C.textMuted, marginTop:"1px" }}>{v.salida}{v.llegada ? ` → ${v.llegada}` : ""}{v.litros_combustible > 0 ? ` · ${fmt(v.litros_combustible)} lts` : ""}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"15px", fontWeight:700, color:C.textPrimary }}>${fmt(v.flete)}</div>
                  <div style={{ fontSize:"11px", color:util >= 0 ? C.green : C.red }}>Util: ${fmt(util)}</div>
                  <div style={{ display:"flex", gap:"4px", marginTop:"6px", justifyContent:"flex-end" }}>
                    <Button onClick={() => openEdit(v)} variant="ghost" small><Ic n="edit" s={12}/></Button>
                    <Button onClick={() => del(v.id)} variant="danger" small><Ic n="trash" s={12}/></Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Nuevo viaje" : "Editar viaje"} onClose={() => setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 11px" }}>
            <Field label="N° Viaje"><Inp value={form.numero || ""} onChange={e => s({ numero:e.target.value })}/></Field>
            <Field label="Estado"><Sel value={form.estado || ""} onChange={e => s({ estado:e.target.value })}>{ESTADOS.map(x => <option key={x}>{x}</option>)}</Sel></Field>
            <Field label="Unidad *"><Sel value={form.camion_id || ""} onChange={e => s({ camion_id:e.target.value })}><option value="">Seleccionar</option>{camiones.map(c => <option key={c.id} value={c.id}>{c.placa}</option>)}</Sel></Field>
            <Field label="Conductor"><Sel value={form.conductor_id || ""} onChange={e => s({ conductor_id:e.target.value })}><option value="">Seleccionar</option>{conductores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</Sel></Field>
            <Field label="Cliente"><Sel value={form.cliente_id || ""} onChange={e => s({ cliente_id:e.target.value })}><option value="">Seleccionar</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</Sel></Field>
            <Field label="Equipo"><Sel value={form.equipo || ""} onChange={e => s({ equipo:e.target.value })}><option value="">Seleccionar</option>{EQUIPOS.map(x => <option key={x}>{x}</option>)}</Sel></Field>
            <Field label="Origen *"><Inp value={form.origen || ""} onChange={e => s({ origen:e.target.value })}/></Field>
            <Field label="Destino *"><Inp value={form.destino || ""} onChange={e => s({ destino:e.target.value })}/></Field>
            <Field label="Fecha salida"><Inp type="date" value={form.salida || ""} onChange={e => s({ salida:e.target.value })}/></Field>
            <Field label="Fecha llegada"><Inp type="date" value={form.llegada || ""} onChange={e => s({ llegada:e.target.value })}/></Field>
            <Field label="Kilómetros"><Inp type="number" value={form.km || ""} onChange={e => s({ km:+e.target.value })}/></Field>
            <Field label="Litros combustible"><Inp type="number" value={form.litros_combustible || ""} onChange={e => s({ litros_combustible:+e.target.value })}/></Field>
            <Field label="Peso carga (kg)"><Inp type="number" value={form.peso_kg || ""} onChange={e => s({ peso_kg:+e.target.value })}/></Field>
            <Field label="Flete (USD) *"><Inp type="number" value={form.flete || ""} onChange={e => s({ flete:+e.target.value })}/></Field>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"13px" }}>
            <input type="checkbox" id="pag" checked={form.pagado || false} onChange={e => s({ pagado:e.target.checked })} style={{ width:"14px", height:"14px", accentColor:C.accent }}/>
            <label htmlFor="pag" style={{ fontSize:"12px", color:C.textSecondary, cursor:"pointer" }}>Flete cobrado</label>
          </div>
          <Button onClick={save_}>{modal === "new" ? "Registrar" : "Guardar"}</Button>
        </Modal>
      )}
    </div>
  )
}

export default Viajes