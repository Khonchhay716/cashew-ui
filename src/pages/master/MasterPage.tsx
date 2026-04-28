import { useEffect, useState } from 'react'
import { getTypes, createType, updateType, deleteType } from '../../services/api'
import { CashewType } from '../../types'
import Layout from '../../components/layout/Layout'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

export default function MasterPage() {
  const [types, setTypes] = useState<CashewType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number|null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [desc, setDesc] = useState('')

  const load = () => getTypes().then(r => setTypes(r.data))
  useEffect(() => { load() }, [])

  const reset = () => { setName(''); setPrice(''); setDesc(''); setEditId(null) }

  const startEdit = (t: CashewType) => {
    setEditId(t.id); setName(t.name); setPrice(String(t.defaultPrice)); setDesc(t.description||'')
    setShowForm(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editId) await updateType(editId, { name, defaultPrice: parseFloat(price), description: desc||null })
      else await createType({ name, defaultPrice: parseFloat(price), description: desc||null })
      toast.success(editId ? 'Updated!' : 'បានបន្ថែម!')
      setShowForm(false); reset(); load()
    } catch { toast.error('Error!') }
  }

  const del = async (id: number) => {
    if (!confirm('លុបចោល?')) return
    await deleteType(id); toast.success('Deleted!'); load()
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ប្រភេទ​ស្វាយ</h1>
        </div>
        <button onClick={() => { reset(); setShowForm(true) }}
          className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm active:scale-95 transition-all">
          <Plus size={16}/> បន្ថែម
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">ឈ្មោះ</th>
              <th className="text-right px-5 py-3">តម្លៃ(KG)</th>
              <th className="text-left px-5 py-3">Description</th>
              <th className="px-5 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {types.map(t => (
              <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-4 font-semibold text-gray-800">{t.name}</td>
                <td className="px-5 py-4 text-right font-bold text-green-600">{t.defaultPrice.toLocaleString()} រៀល</td>
                <td className="px-5 py-4 text-gray-500">{t.description||'—'}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => startEdit(t)} className="text-blue-400 hover:text-blue-600"><Pencil size={15}/></button>
                    <button onClick={() => del(t.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {types.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-300 text-sm">គ្មានទិន្នន័យ</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {types.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-gray-800">{t.name}</div>
                {t.description && <div className="text-xs text-gray-400 mt-0.5">{t.description}</div>}
              </div>
              <div className="text-xl font-bold text-green-600">${t.defaultPrice}/KG</div>
            </div>
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
              <button onClick={() => startEdit(t)} className="flex items-center gap-1.5 text-blue-500 text-sm"><Pencil size={14}/> Edit</button>
              <button onClick={() => del(t.id)} className="flex items-center gap-1.5 text-red-400 text-sm"><Trash2 size={14}/> Delete</button>
            </div>
          </div>
        ))}
        {types.length === 0 && (
          <div className="text-center py-16 text-gray-300 text-sm"><div className="text-4xl mb-2">🥜</div>ចុច "បន្ថែម" ដើម្បីបង្កើតប្រភេទ!</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl">
            <div className="px-4 pt-4 pb-3 border-b flex justify-between rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="font-bold">{editId?'កែ':'បន្ថែម'}ប្រភេទ</h2>
              <button onClick={() => { setShowForm(false); reset() }}><X size={22} className="text-gray-400"/></button>
            </div>
            <form onSubmit={submit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">ឈ្មោះប្រភេទ *</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="ឧ. ស្វាយខ្មែរ" required/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">តម្លៃ ($/KG) *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="0.00" step="0.01" required/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  placeholder="Optional"/>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 text-sm flex items-center justify-center gap-2">
                <Check size={16}/>{editId?'Update':'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}