import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ResumeReview from './pages/ResumeReview'
import Resources from './pages/Resources'
import Alumni from './pages/Alumni'
import CareerPaths from './pages/CareerPaths'
import ChatbotWidget from './components/ChatbotWidget'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resume-review" element={<ResumeReview />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/careers" element={<CareerPaths />} />
      </Routes>
      <ChatbotWidget />
    </BrowserRouter>
  )
}