const OFF = 7 * 3600000
export const todayCambodia = () => new Date(Date.now() + OFF).toISOString().split('T')[0]
export const formatDate = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + OFF)
  return `${d.getUTCDate().toString().padStart(2,'0')}/${(d.getUTCMonth()+1).toString().padStart(2,'0')}/${d.getUTCFullYear()}`
}
