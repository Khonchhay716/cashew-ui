import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

api.interceptors.request.use(c => {
  const t = localStorage.getItem('token')
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})

api.interceptors.response.use(r => r, e => {
  const url    = e.config?.url ?? ''
  const is401  = e.response?.status === 401
  const isAuth = url.includes('/api/auth/')

  // ✅ Don't redirect if error comes from auth endpoints (login/register/forgot/reset)
  if (is401 && !isAuth) {
    localStorage.clear()
    window.location.href = '/login'
  }

  return Promise.reject(e)
})

const buildParams = (obj: Record<string, string | number | boolean | undefined>) => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== '') p.append(k, String(v))
  }
  return p.toString()
}

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password })

export const getTypes   = ()                   => api.get('/api/master')
export const createType = (d: any)             => api.post('/api/master', d)
export const updateType = (id: number, d: any) => api.put(`/api/master/${id}`, d)
export const deleteType = (id: number)          => api.delete(`/api/master/${id}`)

export const getPurchases = (page = 1, pageSize = 10, from?: string, to?: string, all = false) =>
  api.get(`/api/purchase?${buildParams(all ? { page, pageSize, all: true } : { page, pageSize, from, to })}`)
export const createPurchase = (d: any)     => api.post('/api/purchase', d)
export const deletePurchase = (id: number) => api.delete(`/api/purchase/${id}`)

export const getSales = (page = 1, pageSize = 10, from?: string, to?: string, all = false) =>
  api.get(`/api/sale?${buildParams(all ? { page, pageSize, all: true } : { page, pageSize, from, to })}`)
export const createSale = (d: any)     => api.post('/api/sale', d)
export const deleteSale = (id: number) => api.delete(`/api/sale/${id}`)

export const getDashboard = (from?: string, to?: string, all = false) =>
  api.get(`/api/dashboard?${buildParams(all ? { all: true } : { from, to })}`)

export const forgotPassword = (email: string) =>
  api.post('/api/auth/forgot-password', { email })

export const resetPassword = (token: string, newPassword: string) =>
  api.post('/api/auth/reset-password', { token, newPassword })

export default api