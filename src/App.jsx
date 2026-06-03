import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { C } from './lib/colors'
import { calcEstado } from './lib/helpers'
import Dashboard from './components/Dashboard'
import Viajes from './components/Viajes'
import Gastos from './components/Gastos'
import Mantenimiento from './components/Mantenimiento'
import Conductores from './components/Conductores'
import Camiones from './components/Camiones'
import Clientes from './components/Clientes'
import Pagos from './components/Pagos'
import AIChat from './components/AIChat'
import Login from './components/Login'
import Ic from './components/ui/Icons'

export default function App() {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [tab, setTab] = useState("dashboard")
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [camiones, setCamiones] = useState([])
  const [conductores, setConductores] = useState([])
  const [viajes, setViajes] = useState([])
  const [gastos, setGastos] = useState([])
  const [mantenimientos, setMantenimientos] = useState([])
  const [clientes, setClientes] = useState([])
  const [pagos, setPagos] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
      setCheckingAuth(false)
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const cargar = async () => {
      const [c, d, v, g, m, cl, pg] = await Promise.all([
        supabase.from('camiones').select('*'),
        supabase.from('conductores').select('*'),
        supabase.from('viajes').select('*'),
        supabase.from('gastos').select('*'),
        supabase.from('mantenimientos').select('*'),
        supabase.from('clientes').select('*'),
        supabase.from('pagos').select('*'),
      ])
      setCamiones(c.data || [])
      setConductores(d.data || [])
      setViajes(v.data || [])
      setGastos(g.data || [])
      setMantenimientos(m.data || [])
      setClientes(cl.data || [])
      setPagos(pg.data || [])
      setLoading(false)
    }
    cargar()
  }, [user])

  if (checkingAuth) return (
    <div style={{ background:C.bg0, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:"13px", color:C.textMuted }}>Cargando...</div>
    </div>
  )

  if (!user) return <Login onLogin={setUser}/>

  const nav = [
    { id:"dashboard",     label:"Dashboard", icon:"dashboard" },
    { id:"viajes",        label:"Viajes",    icon:"route"     },
    { id:"gastos",        label:"Gastos",    icon:"money"     },
    { id:"mantenimiento", label:"Mant.",     icon:"wrench"    },
    { id:"pagos",         label:"Pagos",     icon:"wallet"     },
    { id:"conductores",   label:"Conductores", icon:"users"   },
    { id:"camiones",      label:"Flota",     icon:"truck"     },
    { id:"clientes",      label:"Clientes",  icon:"clients"   },
  ]

  const alertCount = mantenimientos.filter(m => {
    const c = camiones.find(x => x.id === m.camion_id)
    return calcEstado(m, c?.km) !== "ok"
  }).length

  if (loading) return (
    <div style={{ background:C.bg0, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:"13px", color:C.textMuted }}>Cargando Vialog...</div>
    </div>
  )

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", background:C.bg0, minHeight:"100vh", color:C.textPrimary }}>

      {/* TOPBAR */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:C.bg1, borderBottom:`1px solid ${C.border}`, padding:"10px 15px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
          <span style={{ fontSize:"16px", fontWeight:700, color:C.accentLight, letterSpacing:"-0.03em" }}>Vialog</span>
          <span style={{ fontSize:"9px", color:C.textMuted, background:C.bg3, padding:"2px 6px", borderRadius:"10px", fontWeight:600 }}>v1</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button onClick={() => supabase.auth.signOut()} style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:"11px", fontWeight:600 }}>
            Salir
          </button>
          <button onClick={() => setMenuOpen(p => !p)} style={{ background:"none", border:"none", color:C.textSecondary, cursor:"pointer", position:"relative" }}>
            <Ic n={menuOpen ? "close" : "menu"} s={20}/>
            {alertCount > 0 && !menuOpen && (
              <span style={{ position:"absolute", top:"-3px", right:"-3px", background:"#ef4444", color:"#fff", fontSize:"9px", fontWeight:800, width:"13px", height:"13px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      {menuOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:200 }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.65)" }} onClick={() => setMenuOpen(false)}/>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"210px", background:C.bg1, borderRight:`1px solid ${C.border}`, padding:"14px 0", display:"flex", flexDirection:"column", gap:"1px" }}>
            <div style={{ padding:"0 13px 13px", borderBottom:`1px solid ${C.border}`, marginBottom:"5px" }}>
              <span style={{ fontSize:"16px", fontWeight:700, color:C.accentLight }}>Vialog</span>
            </div>
            {nav.map(n => (
              <button key={n.id} onClick={() => { setTab(n.id); setMenuOpen(false) }} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"9px 13px", background:tab===n.id?C.bg2:"none", border:"none", borderLeft:`3px solid ${tab===n.id?C.accent:"transparent"}`, color:tab===n.id?C.accentLight:C.textMuted, cursor:"pointer", textAlign:"left", fontSize:"12px", fontWeight:tab===n.id?600:400, width:"100%" }}>
                <Ic n={n.icon} s={15}/><span>{n.label}</span>
                {n.id === "mantenimiento" && alertCount > 0 && (
                  <span style={{ marginLeft:"auto", background:"#ef4444", color:"#fff", fontSize:"9px", fontWeight:800, padding:"1px 5px", borderRadius:"10px" }}>{alertCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:99, background:C.bg1, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around", padding:"5px 0 7px" }}>
        {nav.slice(0,5).map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", background:"none", border:"none", color:tab===n.id?C.accentLight:C.textMuted, cursor:"pointer", padding:"3px 5px", position:"relative" }}>
            <Ic n={n.icon} s={18}/>
            <span style={{ fontSize:"9px", fontWeight:600 }}>{n.label}</span>
            {n.id === "mantenimiento" && alertCount > 0 && (
              <span style={{ position:"absolute", top:0, right:"1px", background:"#ef4444", color:"#fff", fontSize:"8px", fontWeight:800, width:"12px", height:"12px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{alertCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth:"840px", margin:"0 auto", padding:"16px 13px 86px" }}>
        {tab === "dashboard"     && <Dashboard     viajes={viajes} gastos={gastos} conductores={conductores} camiones={camiones} mantenimientos={mantenimientos} pagos={pagos}/>}
        {tab === "viajes"        && <Viajes        viajes={viajes} setViajes={setViajes} camiones={camiones} setCamiones={setCamiones} conductores={conductores} clientes={clientes} gastos={gastos}/>}
        {tab === "gastos"        && <Gastos        gastos={gastos} setGastos={setGastos} viajes={viajes} camiones={camiones}/>}
        {tab === "mantenimiento" && <Mantenimiento mantenimientos={mantenimientos} setMantenimientos={setMantenimientos} camiones={camiones}/>}
        {tab === "pagos"         && <Pagos         viajes={viajes} clientes={clientes} conductores={conductores} camiones={camiones} pagos={pagos} setPagos={setPagos}/>}
        {tab === "conductores"   && <Conductores   conductores={conductores} setConductores={setConductores} viajes={viajes}/>}
        {tab === "camiones"      && <Camiones      camiones={camiones} setCamiones={setCamiones} viajes={viajes}/>}
        {tab === "clientes"      && <Clientes      clientes={clientes} setClientes={setClientes} viajes={viajes}/>}
      </div>

      <AIChat viajes={viajes} gastos={gastos} conductores={conductores} camiones={camiones} clientes={clientes}/>
    </div>
  )
}