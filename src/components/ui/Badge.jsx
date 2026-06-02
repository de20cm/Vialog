import { C } from '../../lib/colors'

const Badge = ({ label, color }) => {
  const m = {
    green: { bg:C.greenBg, text:C.green, border:C.greenBorder },
    red:   { bg:C.redBg,   text:C.red,   border:C.redBorder },
    yellow:{ bg:C.yellowBg,text:C.yellow, border:C.yellowBorder },
    blue:  { bg:C.blueBg,  text:C.blue,  border:C.blueBorder },
    gray:  { bg:C.bg3,     text:C.textSecondary, border:C.border },
  };
  const c = m[color] || m.gray;
  return (
    <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:"20px", fontSize:"10px", fontWeight:700, background:c.bg, color:c.text, border:`1px solid ${c.border}` }}>
      {label}
    </span>
  );
};

export default Badge;