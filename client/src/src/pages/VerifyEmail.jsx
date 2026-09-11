import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiPost } from '../api/apiClient'
import './Auth.css'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email…')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setStatus('error')
      setMessage('This verification link is missing information. Please use the link from your email.')
      return
    }

    apiPost('/api/auth/verify-email', { token, email })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Verification failed.')
        setStatus('success')
        setMessage(data.message || 'Email verified successfully. You can now log in.')
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.message || 'This verification link is invalid or has expired.')
      })
  }, [searchParams])

  return (
    <div className="page-enter auth-page">
      <Navbar />
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-brand">Digital Career Hub</div>
          <h1 className="auth-title">
            {status === 'success' ? 'Email verified' : status === 'error' ? 'Verification failed' : 'Verifying…'}
          </h1>
          <p className="auth-sub">{message}</p>

          {status === 'success' && (
            <Link to="/login" className="btn-auth" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Go to log in
            </Link>
          )}

          {status === 'error' && (
            <Link to="/login" className="link-green">Back to log in</Link>
          )}
        </div>
      </div>
    </div>
  )
}
