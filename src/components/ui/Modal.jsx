import { C } from '../../lib/colors'

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
    <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:"14px", width:"100%", maxWidth:"560px", maxHeight:"90vh", overflow:"auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 12px", borderBottom:`1px solid ${C.border}` }}>
        <h3 style={{ margin:0, fontSize:"14px", fontWeight:600, color:C.textPrimary }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.textSecondary, cursor:"pointer", fontSize:"18px" }}>✕</button>
      </div>
      <div style={{ padding:"16px 20px" }}>{children}</div>
    </div>
  </div>
);

export default Modal;