import { C } from '../../lib/colors'

const Button = ({ children, onClick, variant = "primary", small = false }) => {
  const s = {
    primary: { background:C.accent, color:"#fff", border:"none" },
    ghost:   { background:C.bg3, color:C.textSecondary, border:`1px solid ${C.border}` },
    danger:  { background:C.bg3, color:C.red, border:`1px solid ${C.border}` },
  };
  return (
    <button onClick={onClick} style={{ ...s[variant], display:"inline-flex", alignItems:"center", gap:"5px", borderRadius:"7px", padding:small?"5px 7px":"8px 13px", fontSize:small?"11px":"13px", fontWeight:600, cursor:"pointer" }}>
      {children}
    </button>
  );
};

export default Button;