import { useState } from 'react'
import { supabase } from '../supabase'
import { C } from '../lib/colors'
import Button from './ui/Button'
import { Inp, Field } from './ui/Input'

const Cuenta = ({ user }) => {
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const cambiar = async () => {
    setMsg('')
    if (pass.length < 6) return setMsg('La contraseña debe tener al menos 6 caracteres')
    if (pass !== pass2) return setMsg('Las contraseñas no coinciden')

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pass })
    setLoading(false)

    if (error) setMsg('Error: ' + error.message)
    else {
      setMsg('Contraseña actualizada correctamente')
      setPass('')
      setPass2('')
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <div>
        <h2 style={{ margin:"0 0 2px", fontSize:"19px", fontWeight:600, color:C.textPrimary }}>Mi cuenta</h2>
        <p style={{ margin:0, color:C.textSecondary, fontSize:"12px" }}>{user?.email}</p>
      </div>

      <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"16px", maxWidth:"360px" }}>
        <h4 style={{ margin:"0 0 12px", fontSize:"13px", fontWeight:600, color:C.textPrimary }}>Cambiar contraseña</h4>

        <Field label="Nueva contraseña">
          <Inp type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 6 caracteres"/>
        </Field>
        <Field label="Confirmar contraseña">
          <Inp type="password" value={pass2} onChange={e => setPass2(e.target.value)} placeholder="Repite la contraseña"/>
        </Field>

        {msg && (
          <div style={{ background:msg.includes('Error')||msg.includes('no coinciden')||msg.includes('al menos') ? C.redBg : C.greenBg, border:`1px solid ${msg.includes('Error')||msg.includes('no coinciden')||msg.includes('al menos') ? C.redBorder : C.greenBorder}`, borderRadius:"7px", padding:"8px 11px", fontSize:"12px", color:msg.includes('Error')||msg.includes('no coinciden')||msg.includes('al menos') ? C.red : C.green, marginBottom:"12px" }}>
            {msg}
          </div>
        )}

        <Button onClick={cambiar}>{loading ? "Guardando..." : "Cambiar contraseña"}</Button>
      </div>
    </div>
  )
}

export default Cuenta