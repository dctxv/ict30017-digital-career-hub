import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ResumeReview from './pages/ResumeReview'
import Preparation from './pages/Preparation'
import SavedReview from './pages/SavedReview'
import Resources from './pages/Resources'
import Alumni from './pages/Alumni'
import CareerPaths from './pages/CareerPaths'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Policy from './pages/Policy'
import NotFound from './pages/NotFound'
import LoginHistory from './pages/LoginHistory'
import SecuritySessions from './pages/SecuritySessions'
import OAuthCallback from './pages/OAuthCallback'
import VerifyEmail from './pages/VerifyEmail'
import ChatbotWidget from './components/ChatbotWidget'
import RequireAuth from './components/RequireAuth'
import GuestOnly from './components/GuestOnly'
import SessionWatcher from './components/SessionWatcher'
import IdleTimeoutBanner from './components/IdleTimeoutBanner'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

/**
 * Renders the idle-timeout banner only while a user is signed in.
 * Placed inside AuthProvider so useAuth is available.
 */
function IdleSessionController() {
  const { user, clearSession } = useAuth()
  if (!user) return null
  return <IdleTimeoutBanner onLogout={clearSession} />
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            {/* Redirects to /login on any 401 raised through apiFetch. */}
            <SessionWatcher />
            {/* Shows warning banner and auto-logs out after 15 min of inactivity. */}
            <IdleSessionController />

            <Routes>
              <Route path="/" element={<Home />} />

              {/* A signed-in user has no business on these two. */}
              <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
              <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

              {/* The login page has linked to /forgot-password since it was
                  written, and the route did not exist — so the one thing a
                  locked-out user needs answered with the not-found page. */}
              <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
              <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />

              <Route path="/resume-review" element={<ResumeReview />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/alumni" element={<Alumni />} />
              <Route path="/careers" element={<CareerPaths />} />

              {/* Registration requires agreeing to both of these, and both
                  links pointed at nothing until now. */}
              <Route path="/terms" element={<Policy kind="terms" />} />
              <Route path="/privacy" element={<Policy kind="privacy" />} />

              {/* The account area and saved reviews belong to one person, so
                  both wait for the server to confirm the session rather than
                  trusting the cached user. */}
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/review/:id" element={<RequireAuth><SavedReview /></RequireAuth>} />
              <Route path="/security/sessions" element={<RequireAuth><SecuritySessions /></RequireAuth>} />
              <Route path="/security/login-history" element={<RequireAuth><LoginHistory /></RequireAuth>} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Preparation is guarded for a different reason than the two
                  above. Nothing on it is secret; it is that a gap is stored
                  against a person across analyses, so an anonymous visitor
                  would spend two model calls on an interview whose results
                  cannot be kept once the tab closes. */}
              <Route path="/preparation" element={<RequireAuth><Preparation /></RequireAuth>} />

              <Route
                path="/admin"
                element={<RequireAuth requiredRole="admin"><AdminDashboard /></RequireAuth>}
              />

              {/* Anything else. Previously an unknown path rendered an empty
                  page with no navigation on it, which is indistinguishable from
                  the application having crashed. */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <ChatbotWidget />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
