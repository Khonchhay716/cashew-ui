import { useEffect, useState, useCallback } from 'react'
import { getPurchases, createPurchase, deletePurchase, getTypes } from '../../services/api'
import { Purchase, CashewType, FormItem, PagedResult } from '../../types'
import Layout from '../../components/layout/Layout'
import FilterDropdown, { FO } from '../../components/FilterDropdown'
import Pagination from '../../components/Pagination'
import { todayCambodia, formatDate } from '../../utils/date'
import toast from 'react-hot-toast'
import { Plus, X, Trash2, ChevronDown } from 'lucide-react'

const PAGE_SIZE = 10

export default function PurchasePage() {
  const [result, setResult] = useState<PagedResult<Purchase> | null>(null)
  const [types, setTypes] = useState<CashewType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [fo, setFo] = useState<FO>('today')
  const [from, setFrom] = useState(todayCambodia())
  const [to, setTo] = useState(todayCambodia())
  const [isAll, setIsAll] = useState(false)
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const [supplierName, setSupplierName] = useState('')
  const [supplierPhone, setSupplierPhone] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<FormItem[]>([{ cashewTypeId: 0, qtyKg: '', pricePerKg: '' }])

  const load = useCallback(async (p: number, f: string, t: string, all = false) => {
    setLoading(true)
    try {
      const r = await getPurchases(p, PAGE_SIZE, f, t, all)
      setResult(r.data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    getTypes().then(r => setTypes(r.data))
    load(1, todayCambodia(), todayCambodia(), false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilter = (o: FO, f: string, t: string, all = false) => {
    setFo(o); setFrom(f); setTo(t); setIsAll(all); setPage(1); setExpanded(null)
    load(1, f, t, all)
  }

  const handlePage = (p: number) => {
    setPage(p); setExpanded(null)
    load(p, from, to, isAll)
  }

  const addItem = () => setItems([...items, { cashewTypeId: 0, qtyKg: '', pricePerKg: '' }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof FormItem, value: any) => {
    const u = [...items]; u[i] = { ...u[i], [field]: value }
    if (field === 'cashewTypeId') {
      const t = types.find(t => t.id === +value)
      if (t) u[i].pricePerKg = String(t.defaultPrice)
    }
    setItems(u)
  }

  const grandTotal = items.reduce((s, i) => s + (parseFloat(i.qtyKg) || 0) * (parseFloat(i.pricePerKg) || 0), 0)

  const reset = () => {
    setSupplierName(''); setSupplierPhone(''); setNote('')
    setItems([{ cashewTypeId: 0, qtyKg: '', pricePerKg: '' }])
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validItems = items.filter(i => i.cashewTypeId > 0 && parseFloat(i.qtyKg) > 0)
    if (!validItems.length) { toast.error('សូមបន្ថែមប្រភេទ!'); return }
    try {
      await createPurchase({
        supplierName: supplierName || null,
        supplierPhone: supplierPhone || null,
        note: note || null,
        purchaseDate: new Date().toISOString(),
        items: validItems.map(i => ({
          cashewTypeId: i.cashewTypeId,
          qtyKg: parseFloat(i.qtyKg),
          pricePerKg: parseFloat(i.pricePerKg)
        }))
      })
      toast.success('រក្សាទុករួច!'); setShowForm(false); reset()
      load(page, from, to, isAll)
    } catch { toast.error('Error!') }
  }

  const del = async (id: number) => {
    if (!confirm('លុបចោល?')) return
    await deletePurchase(id); toast.success('Deleted!')
    load(page, from, to, isAll)
  }

  const list = result?.data || []
  const totalKg = result?.summaryKg ?? 0
  const totalPrice = result?.summaryPrice ?? 0

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">ទិញចូល</h1>
        <div className="flex items-center gap-2">
          <FilterDropdown value={fo} from={from} to={to} onChange={handleFilter} />
          <button onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm active:scale-95 transition-all">
            <Plus size={16} /> បន្ថែម
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { l: 'ចំនួន', v: String(result?.total || 0), c: 'text-green-600' },
          { l: 'KG', v: totalKg.toLocaleString(), c: 'text-blue-600' },
          { l: 'សរុប', v: `${totalPrice.toLocaleString()}`, c: 'text-green-600' }
        ].map(s => (
          <div key={s.l} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
            <div className="text-xs text-gray-400">{s.l}</div>
            <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-300 text-sm animate-pulse">Loading...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Ref</th>
                  <th className="text-left px-4 py-3">ឈ្មោះអ្នកលក់</th>
                  <th className="text-left px-4 py-3">ប្រភេទ</th>
                  <th className="text-right px-4 py-3">ចំនួន</th>
                  <th className="text-right px-4 py-3">សរុប</th>
                  <th className="text-left px-4 py-3">ថ្ងៃលក់</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-green-600 text-xs">{p.referenceNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.supplierName || <span className="text-gray-300">គ្មានឈ្មោះ</span>}</div>
                      {p.supplierPhone && <div className="text-xs text-gray-400">{p.supplierPhone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {p.items.map((it, i) => (
                        <div key={i} className="text-xs text-gray-600">
                          {it.cashewTypeName}: {it.qtyKg}KG × ${it.pricePerKg} = <span className="font-semibold">{it.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{p.items.reduce((s, i) => s + i.qtyKg, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{p.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.purchaseDate)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => del(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-300 text-sm">គ្មានទិន្នន័យ</td></tr>}
              </tbody>
            </table>
            <div className="px-4 pb-4">
              <Pagination page={page} totalPages={result?.totalPages || 0} total={result?.total || 0} pageSize={PAGE_SIZE} onPage={handlePage} />
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {list.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-green-600 font-semibold">{p.referenceNo}</div>
                      <div className="font-semibold text-gray-800 mt-0.5">{p.supplierName || <span className="text-gray-300 text-sm">គ្មានឈ្មោះ</span>}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">{p.totalAmount.toLocaleString()}</span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.items.map((it, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        {it.cashewTypeName}: {it.qtyKg}KG
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{formatDate(p.purchaseDate)}</div>
                </div>
                {expanded === p.id && (
                  <div className="border-t bg-gray-50 px-4 py-3 space-y-1.5">
                    {p.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
                        <span className="font-medium text-gray-700">{it.cashewTypeName}</span>
                        <span className="text-gray-500">{it.qtyKg}KG × ${it.pricePerKg} = <strong>${it.total.toLocaleString()}</strong></span>
                      </div>
                    ))}
                    {p.supplierPhone && <div className="flex justify-between text-xs"><span className="text-gray-400">Phone</span><span>{p.supplierPhone}</span></div>}
                    {p.note && <div className="flex justify-between text-xs"><span className="text-gray-400">Note</span><span>{p.note}</span></div>}
                    <button onClick={() => del(p.id)} className="flex items-center gap-1.5 text-red-400 text-xs mt-1"><Trash2 size={13} /> Delete</button>
                  </div>
                )}
              </div>
            ))}
            {list.length === 0 && <div className="text-center py-16 text-gray-300 text-sm">គ្មានទិន្នន័យ</div>}
            <Pagination page={page} totalPages={result?.totalPages || 0} total={result?.total || 0} pageSize={PAGE_SIZE} onPage={handlePage} />
          </div>
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[95vh] overflow-auto">
            <div className="sticky top-0 bg-white px-4 pt-4 pb-3 border-b flex justify-between rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="font-bold text-gray-800">Purchase ថ្មី</h2>
              <button onClick={() => { setShowForm(false); reset() }}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={submit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">ឈ្មោះអ្នកលក់</label>
                  <input value={supplierName} onChange={e => setSupplierName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">ទូរស័ព្ទ</label>
                  <input value={supplierPhone} onChange={e => setSupplierPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Optional" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-gray-700">ប្រភេទ + KG + តម្លៃ *</label>
                  <button type="button" onClick={addItem} className="text-xs text-green-600 font-semibold flex items-center gap-1"><Plus size={13} /> Add</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => {
                    const sub = (parseFloat(item.qtyKg) || 0) * (parseFloat(item.pricePerKg) || 0)
                    return (
                      <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <select value={item.cashewTypeId} onChange={e => updateItem(i, 'cashewTypeId', +e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                            <option value={0}>— ជ្រើសប្រភេទ —</option>
                            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400"><X size={18} /></button>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-400 mb-0.5 block">ចំនួន (KG)</label>
                            <input type="number" value={item.qtyKg} onChange={e => updateItem(i, 'qtyKg', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
                              placeholder="0.000" step="0.001" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-0.5 block">តម្លៃ/KG</label>
                            <input type="number" value={item.pricePerKg} onChange={e => updateItem(i, 'pricePerKg', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
                              placeholder="0.00" step="0.01" />
                          </div>
                        </div>
                        {sub > 0 && <div className="mt-2 text-right text-xs text-green-600 font-semibold">{sub}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">សរុបទឹកប្រាក់</span>
                <span className="text-xl font-bold text-green-600">{grandTotal}</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">កំណត់ចំណាំ</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>

              <button type="submit" className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 text-sm">Save Purchase</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}