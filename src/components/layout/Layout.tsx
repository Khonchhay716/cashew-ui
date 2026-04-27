import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, TrendingUp, Settings, LogOut, Menu, X } from 'lucide-react'

const menus = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/purchase', label: 'ទិញ', icon: ShoppingCart },
  { path: '/sale', label: 'លក់', icon: TrendingUp },
  { path: '/master', label: 'ប្រភេទ​ស្វាយ', icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation(); const nav = useNavigate()
  const name = localStorage.getItem('name') || 'User'
  const [open, setOpen] = useState(false)
  const logout = () => { localStorage.clear(); nav('/login') }
  const Nav = () => (
    <>
      <div className="p-4 border-b border-green-600 flex items-center justify-between">
        <div><div className="font-bold">ប្រព័ន្ធគ្រប់គ្រង</div><div className="text-green-300 text-xs mt-0.5">{name}</div></div>
        <button onClick={() => setOpen(false)} className="md:hidden text-green-200"><X size={20}/></button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menus.map(m => { const I = m.icon; const a = loc.pathname === m.path
          return <Link key={m.path} to={m.path} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${a?'bg-white/20':'hover:bg-white/10'}`}>
            <I size={18}/>{m.label}</Link>})}
      </nav>
      <div className="p-3 border-t border-green-600">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full hover:bg-white/10">
          <LogOut size={18}/>ចាកចេញ</button>
      </div>
    </>
  )
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {open && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setOpen(false)}/>}
      <aside className="hidden md:flex w-56 bg-green-700 text-white flex-col flex-shrink-0"><Nav/></aside>
      <aside className={`fixed inset-y-0 left-0 w-64 bg-green-700 text-white flex flex-col z-30 transition-transform duration-300 md:hidden ${open?'translate-x-0':'-translate-x-full'}`}><Nav/></aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-green-700 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setOpen(true)}><Menu size={22}/></button>
          <span className="font-bold">ប្រព័ន្ធគ្រប់គ្រង</span>
        </header>
        <main className="flex-1 overflow-auto"><div className="p-3 md:p-6 max-w-5xl mx-auto">{children}</div></main>
      </div>
    </div>
  )
}
