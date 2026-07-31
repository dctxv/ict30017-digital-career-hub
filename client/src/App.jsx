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
import { LanguageProvider } from './context/LanguageContext'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
    </LanguageProvider>
  )
}