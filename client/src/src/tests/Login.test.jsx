import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// Mock apiPost so no real network calls happen
vi.mock('../api/apiClient', () => ({
  apiPost: vi.fn(),
}))

import { apiPost } from '../api/apiClient'

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login' }),
  }
})

// Stub Navbar to keep tests simple
vi.mock('../components/Navbar', () => ({ default: () => <nav /> }))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument()
  })

  it('shows error when submitted with empty fields', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() =>
      expect(screen.getByText(/email and password are required/i)).toBeInTheDocument()
    )
  })

  it('shows generic error when server returns an error', async () => {
    apiPost.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid email or password.' }),
    })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'a@b.com')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'WrongPass@1')
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() =>
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    )
  })

  it('shows the OTP screen when server returns twoFactorRequired', async () => {
    apiPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ twoFactorRequired: true, email: 'a@b.com' }),
    })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'a@b.com')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'Secure@Pass99!')
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() =>
      expect(screen.getAllByText(/6-digit code/i).length).toBeGreaterThan(0)
    )
  })

  it('toggles password visibility', async () => {
    renderLogin()
    const pwInput = screen.getByPlaceholderText(/••••••••/)
    expect(pwInput).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: /show/i }))
    expect(pwInput).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByRole('button', { name: /hide/i }))
    expect(pwInput).toHaveAttribute('type', 'password')
  })

  it('shows resend verification button when EMAIL_NOT_VERIFIED is returned', async () => {
    apiPost.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Please verify your email.', code: 'EMAIL_NOT_VERIFIED' }),
    })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'a@b.com')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'Secure@Pass99!')
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() =>
      expect(screen.getByText(/resend verification email/i)).toBeInTheDocument()
    )
  })

  it('navigates home after successful OTP verification', async () => {
    // Step 1: credentials accepted → OTP screen
    apiPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ twoFactorRequired: true, email: 'a@b.com' }),
    })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'a@b.com')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'Secure@Pass99!')
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => screen.getAllByText(/6-digit code/i))

    // Step 2: OTP verified
    apiPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, full_name: 'Test', email: 'a@b.com', role: 'student' } }),
    })
    await userEvent.type(screen.getByPlaceholderText('000000'), '123456')
    fireEvent.click(screen.getByRole('button', { name: /verify and log in/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }))
  })
})
