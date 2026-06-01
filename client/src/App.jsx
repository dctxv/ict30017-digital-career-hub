import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home           from './pages/Home'
import Login          from './pages/Login'
import Register       from './pages/Register'
import ResumeReview   from './pages/ResumeReview'
import Resources      from './pages/Resources'
import Alumni         from './pages/Alumni'
import CareerPaths    from './pages/CareerPaths'
import ChatbotWidget  from './components/ChatbotWidget'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import VerifyEmail    from './pages/VerifyEmail'
import RequireAuth    from './components/RequireAuth'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"                 element={<Home />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/resources"        element={<Resources />} />
        <Route path="/alumni"           element={<Alumni />} />
        <Route path="/careers"          element={<CareerPaths />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />
        <Route path="/verify-email"     element={<VerifyEmail />} />

        {/* Authenticated routes */}
        <Route
          path="/resume-review"
          element={
            <RequireAuth>
              <ResumeReview />
            </RequireAuth>
          }
        />

        {/* Admin-only */}
        <Route
          path="/admin"
          element={
            <RequireAuth requiredRole="admin">
              <AdminDashboard />
            </RequireAuth>
          }
        />
      </Routes>
      <ChatbotWidget />
    </BrowserRouter>
  )
}
