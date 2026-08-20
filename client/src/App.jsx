import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ResumeReview from './pages/ResumeReview'
import Resources from './pages/Resources'
import Alumni from './pages/Alumni'
import CareerPaths from './pages/CareerPaths'
import ChatbotWidget from './components/ChatbotWidget'
import AdminDashboard from './pages/AdminDashboard'
import RequireAuth from './components/RequireAuth'
import GuestOnly from './components/GuestOnly'
import SessionWatcher from './components/SessionWatcher'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Redirects to /login on any 401 raised through apiFetch. */}
          <SessionWatcher />
          <Routes>
            <Route path="/" element={<Home />} />

            {/* A signed-in user has no business on these two. */}
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnly>
                  <Register />
                </GuestOnly>
              }
            />

            <Route path="/resume-review" element={<ResumeReview />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/careers" element={<CareerPaths />} />
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
      </AuthProvider>
    </LanguageProvider>
  )
}
