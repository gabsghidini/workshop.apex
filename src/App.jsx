import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Layout from './pages/workshop/Layout'
import Home from './pages/workshop/Home'
import ContentPage from './pages/workshop/ContentPage'

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])
  if (session === undefined) return <div className="ws-loading"><div className="ws-spinner" /></div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

function GuestOnly({ children }) {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])
  if (session === undefined) return null
  if (session) return <Navigate to="/workshop" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/workshop" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="mod/:modId" element={<ContentPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/workshop" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
