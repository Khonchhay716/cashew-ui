import { useEffect, useState, useCallback } from 'react'
import { getDashboard } from '../../services/api'
import { Dashboard } from '../../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../../components/layout/Layout'
import FilterDropdown, { FO } from '../../components/FilterDropdown'
import { todayCambodia } from '../../utils/date'
import { ShoppingCart, TrendingUp, Scale, TrendingDown } from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FO>('today')
  const [from, setFrom] = useState(todayCambodia())
  const [to, setTo] = useState(todayCambodia())

  const load = useCallback(async (f: string, t: string, all = false) => {
    setLoading(true)
    try {
      const r = await getDashboard(f, t, all)
      setData(r.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(todayCambodia(), todayCambodia(), false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilter = (opt: FO, f: string, t: string, all = false) => {
    setFilter(opt); setFrom(f); setTo(t)
    load(f, t, all)
  }

  const chartLabel = filter === 'all' ? '6 ខែចុងក្រោយ' : '7 ថ្ងៃចុងក្រោយ'

  const chartData = data
    ? data.purchaseChart.map((p, i) => ({
      name: p.label,
      ទិញ: Math.round(p.value),
      លក់: Math.round(data.saleChart[i]?.value || 0),
    }))
    : []

  const stats = data
    ? [
      { label: 'KG ទិញ', value: `${data.totalPurchaseKg.toLocaleString()} KG`, icon: Scale, color: 'bg-blue-500', sub: `${data.purchaseCount} records` },
      { label: 'KG លក់', value: `${data.totalSaleKg.toLocaleString()} KG`, icon: Scale, color: 'bg-orange-500', sub: `${data.saleCount} records` },
      { label: 'ទឹកប្រាក់ទិញ', value: `${data.totalPurchasePrice.toLocaleString()} រ`, icon: ShoppingCart, color: 'bg-purple-500', sub: '' },
      { label: 'ទឹកប្រាក់លក់', value: `${data.totalSalePrice.toLocaleString()} រ`, icon: TrendingUp, color: 'bg-green-500', sub: '' },
    ]
    : []

  return (
    <Layout>
      {/* ✅ Header — title + filter on same row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          {filter === 'all' ? (
            <p className="text-xs text-gray-400 mt-0.5">ទិន្នន័យទាំងអស់</p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">{from}{from !== to ? ` → ${to}` : ''}</p>
          )}
        </div>
        <FilterDropdown value={filter} from={from} to={to} onChange={handleFilter} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-300">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-pulse">🥜</div>
            <div className="text-sm">Loading...</div>
          </div>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.map((s, i) => {
              const I = s.icon
              return (
                <div key={i} className={`${s.color} text-white rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                    <I size={14} /><span className="text-xs">{s.label}</span>
                  </div>
                  <div className="text-lg font-bold leading-tight">{s.value}</div>
                  {s.sub && <div className="text-xs opacity-70 mt-1">{s.sub}</div>}
                </div>
              )
            })}
          </div>

          <div className={`rounded-2xl p-4 mb-4 ${data.profit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              {data.profit >= 0
                ? <TrendingUp size={16} className="text-green-600" />
                : <TrendingDown size={16} className="text-red-500" />}
              <span className="text-sm font-medium text-gray-600">ចំណេញ = លក់ − ទិញ</span>
            </div>
            <div className={`text-2xl font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {data.profit >= 0 ? '+' : ''}{data.profit.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">{chartLabel}</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()}`} />
                <Bar dataKey="ទិញ" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="លក់" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded bg-blue-500" />ទិញ</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded bg-green-500" />លក់</div>
            </div>
          </div>
        </>
      ) : null}
    </Layout>
  )
}