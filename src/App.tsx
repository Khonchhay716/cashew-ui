import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import PurchasePage from './pages/purchase/PurchasePage'
import SalePage from './pages/sale/SalePage'
import MasterPage from './pages/master/MasterPage'

function Guard({ children }: { children: React.ReactNode }) {
  return localStorage.getItem('token') ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<LoginPage />} />
        <Route path="/dashboard" element={<Guard><DashboardPage /></Guard>} />
        <Route path="/purchase" element={<Guard><PurchasePage /></Guard>} />
        <Route path="/sale" element={<Guard><SalePage /></Guard>} />
        <Route path="/master" element={<Guard><MasterPage /></Guard>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}
