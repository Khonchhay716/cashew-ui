import { useEffect, useState } from 'react'
import { CalendarDays, ChevronDown, X, Check } from 'lucide-react'

export type FO = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom' | 'all'

interface Props {
  value: FO
  from: string
  to: string
  onChange: (opt: FO, from: string, to: string, all?: boolean) => void
}

function camDate(offsetDays = 0): string {
  const d = new Date()
  d.setUTCHours(d.getUTCHours() + 7)
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

function startOfWeek(): string {
  const d = new Date()
  d.setUTCHours(d.getUTCHours() + 7)
  const day = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() - day)
  return d.toISOString().slice(0, 10)
}

function startOfMonth(): string {
  const d = new Date()
  d.setUTCHours(d.getUTCHours() + 7)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`
}

const OPTIONS: { label: string; value: FO; sub?: string }[] = [
  { label: 'ថ្ងៃនេះ',      value: 'today',      sub: camDate() },
  { label: 'ម្សិលមិញ',     value: 'yesterday',  sub: camDate(-1) },
  { label: 'សប្ដាហ៍នេះ', value: 'this_week',  sub: `${startOfWeek()} → ${camDate()}` },
  { label: 'ខែនេះ',        value: 'this_month', sub: `${startOfMonth()} → ${camDate()}` },
  { label: 'ទាំងអស់',      value: 'all',        sub: 'All records' },
  { label: 'កំណត់ផ្ទាល់', value: 'custom' },
]

export default function FilterDropdown({ value, from, to, onChange }: Props) {
  const [open, setOpen]             = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customFrom, setCustomFrom] = useState(from)
  const [customTo, setCustomTo]     = useState(to)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => { setOpen(false); setShowCustom(false) }

  const select = (opt: FO) => {
    const today = camDate()
    if (opt === 'today')      { close(); return onChange(opt, today, today) }
    if (opt === 'yesterday')  { close(); return onChange(opt, camDate(-1), camDate(-1)) }
    if (opt === 'this_week')  { close(); return onChange(opt, startOfWeek(), today) }
    if (opt === 'this_month') { close(); return onChange(opt, startOfMonth(), today) }
    if (opt === 'all')        { close(); return onChange(opt, '', '', true) }
    if (opt === 'custom')     { setShowCustom(true) }
  }

  const applyCustom = () => {
    if (!customFrom || !customTo) return
    close()
    onChange('custom', customFrom, customTo)
  }

  // ✅ Short label for trigger button — no date text shown
  const current = OPTIONS.find(o => o.value === value)?.label ?? 'Filter'

  return (
    <>
      {/* ✅ Trigger button — compact, label only */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm active:scale-95 transition-all whitespace-nowrap"
      >
        <CalendarDays size={14} className="text-gray-400 shrink-0"/>
        <span className="font-medium">{current}</span>
        <ChevronDown size={12} className="text-gray-400 shrink-0"/>
      </button>

      {/* Popup modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">

          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close}/>

          {/* Sheet */}
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-800 text-base">
                  {showCustom ? 'Custom Range' : 'Filter by Date'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {showCustom ? 'ជ្រើសរើសថ្ងៃចាប់ផ្ដើម និងបញ្ចប់' : 'ជ្រើសរើសរយៈពេល'}
                </p>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16}/>
              </button>
            </div>

            {/* Option list */}
            {!showCustom && (
              <div className="px-3 py-3 space-y-1">
                {OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors
                      ${value === opt.value
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{opt.label}</div>
                      {opt.sub && (
                        <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                      )}
                    </div>
                    {value === opt.value && (
                      <Check size={16} className="text-green-600 shrink-0"/>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Custom date inputs */}
            {showCustom && (
              <div className="px-5 py-4 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">ពី (From)</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">ដល់ (To)</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowCustom(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={applyCustom}
                    disabled={!customFrom || !customTo}
                    className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            <div className="pb-2"/>
          </div>
        </div>
      )}
    </>
  )
}