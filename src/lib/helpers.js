export const uid = () => Math.random().toString(36).slice(2, 9);
export const fmt = n => new Intl.NumberFormat("es-VE", { minimumFractionDigits: 0 }).format(n || 0);
export const today = () => new Date().toISOString().split("T")[0];

export const calcEstado = (m, km) => {
  const hoy = new Date();
  const pf = m.proxima_fecha ? new Date(m.proxima_fecha) : null;
  const dd = pf ? Math.ceil((pf - hoy) / (1000 * 60 * 60 * 24)) : 999;
  const dk = m.proximo_km ? (m.proximo_km - (km || 0)) : 999;
  if (dd < 0 || dk < 0) return "vencido";
  if (dd <= 15 || dk <= 500) return "pendiente";
  return "ok";
};