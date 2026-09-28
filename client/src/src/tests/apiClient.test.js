import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We test the module's behaviour by mocking global fetch and document.cookie.
// Import after setting up the mocks so the module picks up our fetch stub.

describe('apiClient', () => {
  let apiPost, apiGet, apiDelete

  beforeEach(async () => {
    // Reset module state between tests
    vi.resetModules()

    // Stub fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })

    // Default: no CSRF cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })

    const mod = await import('../api/apiClient.js')
    apiPost = mod.apiPost
    apiGet = mod.apiGet
    apiDelete = mod.apiDelete
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('always sends credentials: include', async () => {
    await apiGet('/api/test')
    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      credentials: 'include',
    }))
  })

  it('sends X-CSRF-Token header on POST when csrf_token cookie is present', async () => {
    document.cookie = 'csrf_token=abc123'
    await apiPost('/api/test', { data: 1 })
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['X-CSRF-Token']).toBe('abc123')
  })

  it('does NOT send X-CSRF-Token on GET', async () => {
    document.cookie = 'csrf_token=abc123'
    await apiGet('/api/test')
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['X-CSRF-Token']).toBeUndefined()
  })

  it('sends Content-Type application/json when body is provided', async () => {
    await apiPost('/api/test', { key: 'value' })
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe(JSON.stringify({ key: 'value' }))
  })

  it('does not set Content-Type on GET', async () => {
    await apiGet('/api/test')
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Content-Type']).toBeUndefined()
  })

  it('sends X-CSRF-Token on DELETE', async () => {
    document.cookie = 'csrf_token=deletetoken'
    await apiDelete('/api/test')
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['X-CSRF-Token']).toBe('deletetoken')
    expect(init.method).toBe('DELETE')
  })

  it('omits X-CSRF-Token when cookie is absent', async () => {
    document.cookie = ''
    await apiPost('/api/test', {})
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['X-CSRF-Token']).toBeUndefined()
  })
})
