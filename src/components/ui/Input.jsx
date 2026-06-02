import { C } from '../../lib/colors'

const iS = { width:"100%", background:C.bg0, border:`1px solid ${C.border}`, borderRadius:"7px", padding:"8px 10px", color:C.textPrimary, fontSize:"13px", outline:"none", boxSizing:"border-box" };

export const Inp = (props) => <input style={iS} {...props} />;
export const Sel = ({ children, ...props }) => <select style={{ ...iS, cursor:"pointer" }} {...props}>{children}</select>;

export const Field = ({ label, children }) => (
  <div style={{ marginBottom:"12px" }}>
    <label style={{ display:"block", fontSize:"10px", fontWeight:600, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px" }}>{label}</label>
    {children}
  </div>
);