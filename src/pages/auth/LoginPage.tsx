import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login, forgotPassword, resetPassword } from '../../services/api'
import axios from 'axios'
import toast from 'react-hot-toast'

type Mode = 'login' | 'register' | 'forgot' | 'reset'

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

export default function LoginPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const resetToken = params.get('token')

  const [mode, setMode] = useState<Mode>(resetToken ? 'reset' : 'login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPwC, setNewPwC] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const switchMode = (m: Mode) => {
    setMode(m); setEmail(''); setName(''); setPw('')
    setConfirm(''); setNewPw(''); setNewPwC(''); setSent(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'register') {
      if (pw !== confirm) { toast.error('Password មិនដូចគ្នា!'); return }
      if (pw.length < 6) { toast.error('Password យ៉ាងហោច 6 តួអក្សរ!'); return }
    }
    if (mode === 'reset') {
      if (newPw !== newPwC) { toast.error('Password មិនដូចគ្នា!'); return }
      if (newPw.length < 6) { toast.error('Password យ៉ាងហោច 6 តួអក្សរ!'); return }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const r = await login(email, pw)
        localStorage.setItem('token', r.data.token)
        localStorage.setItem('name', r.data.name)
        nav('/dashboard')

      } else if (mode === 'register') {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`,
          { name, email, password: pw, role: 'user' }
        )
        toast.success('Register ជោគជ័យ! សូម Login!')
        switchMode('login')

      } else if (mode === 'forgot') {
        await forgotPassword(email)
        setSent(true)

      } else if (mode === 'reset') {
        await resetPassword(resetToken!, newPw)
        toast.success('Reset Password ជោគជ័យ! សូម Login!')
        nav('/login')
        switchMode('login')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'មានបញ្ហា!')
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<Mode, string> = {
    login: 'Login',
    register: 'Register',
    forgot: 'Forgot Password',
    reset: 'Reset Password',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🥜</div>
          <h1 className="text-2xl font-bold text-green-700">Cashew Nuts</h1>
          <p className="text-gray-400 text-sm mt-1">ប្រព័ន្ធគ្រប់គ្រងកាស៊ូ</p>
        </div>

        {/* Tab toggle — login/register only */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
                  ${mode === m ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400'}`}>
                {titles[m]}
              </button>
            ))}
          </div>
        )}

        {/* Forgot / Reset header */}
        {(mode === 'forgot' || mode === 'reset') && (
          <div className="mb-6">
            <button onClick={() => switchMode('login')}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3">
              ← Back to Login
            </button>
            <h2 className="font-bold text-gray-800 text-lg">{titles[mode]}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === 'forgot'
                ? 'បញ្ចូល Email ដើម្បីទទួល Link Reset'
                : 'បញ្ចូល Password ថ្មី'}
            </p>
          </div>
        )}

        {/* Forgot — sent confirmation */}
        {mode === 'forgot' && sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📧</div>
            <p className="font-semibold text-gray-700">បានផ្ញើ Email រួចហើយ!</p>
            <p className="text-sm text-gray-400 mt-1">សូមពិនិត្យ Inbox របស់អ្នក</p>
            <button onClick={() => switchMode('login')}
              className="mt-5 text-sm text-green-600 font-semibold">
              ← Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">

            {/* Name — register only */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">ឈ្មោះ</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                  placeholder="ឈ្មោះរបស់អ្នក" required />
              </div>
            )}

            {/* Email — login, register, forgot */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                  placeholder="example@email.com" required />
              </div>
            )}

            {/* Password — login, register */}
            {(mode === 'login' || mode === 'register') && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
                <input type="password" value={pw} onChange={e => setPw(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                  placeholder={mode === 'register' ? 'យ៉ាងហោច 6 តួអក្សរ' : '••••••••'} required />
              </div>
            )}

            {/* Confirm password — register */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">បញ្ជាក់ Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base
                    ${confirm && pw !== confirm ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  placeholder="••••••••" required />
                {confirm && pw !== confirm && (
                  <p className="text-red-400 text-xs mt-1">Password មិនដូចគ្នា</p>
                )}
              </div>
            )}

            {/* New password — reset */}
            {mode === 'reset' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Password ថ្មី</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                    placeholder="យ៉ាងហោច 6 តួអក្សរ" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">បញ្ជាក់ Password ថ្មី</label>
                  <input type="password" value={newPwC} onChange={e => setNewPwC(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base
                      ${newPwC && newPw !== newPwC ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder="••••••••" required />
                  {newPwC && newPw !== newPwC && (
                    <p className="text-red-400 text-xs mt-1">Password មិនដូចគ្នា</p>
                  )}
                </div>
              </>
            )}

            {/* Forgot password link */}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => switchMode('forgot')}
                  className="text-xs text-green-600 hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 text-sm transition-colors flex items-center justify-center gap-2">
              {loading ? <><Spinner /> Loading...</> : titles[mode]}
            </button>
          </form>
        )}

        {/* Bottom hint */}
        {(mode === 'login' || mode === 'register') && (
          <p className="text-center text-xs text-gray-400 mt-5">
            {mode === 'login' ? (
              <>មិនទាន់មានគណនី?{' '}
                <button onClick={() => switchMode('register')} className="text-green-600 font-semibold">Register</button>
              </>
            ) : (
              <>មានគណនីហើយ?{' '}
                <button onClick={() => switchMode('login')} className="text-green-600 font-semibold">Login</button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}