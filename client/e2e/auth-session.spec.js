import { test, expect } from '@playwright/test'

/**
 * Verifies the auth session defects: C1 (navbar never reflected the session),
 * C3 (no logout control), C4 (no route to authentication on mobile) and
 * M7 (route guard trusted localStorage alone).
 *
 * Requires both dev servers: the API on :3000 and Vite on :5173.
 */

const PASSWORD = 'CorrectHorseBattery1'
const DESKTOP = { width: 1280, height: 900 }
const MOBILE = { width: 390, height: 844 }

// Pages that render the navbar and are reachable while signed in.
const SIGNED_IN_PAGES = ['/', '/resources', '/careers', '/alumni', '/resume-review']
// Every page that renders the navbar, signed out.
const PUBLIC_PAGES = [...SIGNED_IN_PAGES, '/login', '/register']

function uniqueEmail(tag) {
  return `e2e.${tag}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`
}

async function registerAndLogin(page, { plan = 'free' } = {}) {
  const email = uniqueEmail(plan)
  const res = await page.request.post('http://localhost:3000/api/auth/register', {
    data: { full_name: 'E2E Tester', email, password: PASSWORD, plan },
  })
  expect(res.ok(), 'registration should succeed').toBeTruthy()

  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.locator('input[type="password"]').first().fill(PASSWORD)
  await page.getByRole('button', { name: /^log in$/i }).click()
  await expect(page).toHaveURL(/\/$/, { timeout: 10000 })
  return email
}

test.describe('C1 / C3 signed in navbar at desktop width', () => {
  test.use({ viewport: DESKTOP })

  test('navbar shows the user and a logout control on every page, and survives reload', async ({ page }) => {
    await registerAndLogin(page)

    for (const path of SIGNED_IN_PAGES) {
      await page.goto(path)
      await expect(page.locator('.navbar-user').first(), `signed-in name on ${path}`).toContainText('E2E Tester')
      await expect(page.getByRole('button', { name: /log out/i }).first(), `logout control on ${path}`).toBeVisible()
      await expect(page.getByRole('link', { name: /^log in$/i })).toHaveCount(0)
      await expect(page.getByRole('link', { name: /^sign up$/i })).toHaveCount(0)
    }

    // Persists across a reload rather than only living in memory.
    await page.reload()
    await expect(page.locator('.navbar-user').first()).toContainText('E2E Tester')
  })

  test('logout reverts the navbar and clears the session', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/')
    await page.getByRole('button', { name: /log out/i }).first().click()

    await expect(page.getByRole('link', { name: /^log in$/i }).first()).toBeVisible()
    await expect(page.locator('.navbar-user')).toHaveCount(0)

    // localStorage cleared, and the server no longer recognises the cookie.
    expect(await page.evaluate(() => localStorage.getItem('user'))).toBeNull()
    const me = await page.request.get('http://localhost:3000/api/auth/me')
    expect(me.status()).toBe(401)
  })

  test('C1 a signed in user cannot reach the login or register pages', async ({ page }) => {
    await registerAndLogin(page)
    for (const guestPath of ['/login', '/register']) {
      await page.goto(guestPath)
      await expect(page, `${guestPath} should redirect away`).toHaveURL(/\/$/, { timeout: 10000 })
    }
  })
})

test.describe('C4 authentication is reachable at 390x844', () => {
  test.use({ viewport: MOBILE })

  test('signed out: login and signup live inside the mobile menu', async ({ page }) => {
    await page.goto('/')

    const hamburger = page.locator('.hamburger')
    await expect(hamburger).toBeVisible()
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    // Closed menu: the auth actions are not reachable.
    await expect(page.locator('.navbar-mobile-auth').first()).not.toBeVisible()

    await hamburger.click()
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    const mobileAuth = page.locator('.navbar-mobile-auth').first()
    await expect(mobileAuth).toBeVisible()
    await expect(mobileAuth.getByRole('link', { name: /^log in$/i })).toBeVisible()
    await expect(mobileAuth.getByRole('link', { name: /^sign up$/i })).toBeVisible()
  })

  test('signed in: the mobile menu carries the user and a logout control on every page', async ({ page }) => {
    await registerAndLogin(page)

    for (const path of SIGNED_IN_PAGES) {
      await page.goto(path)
      await page.locator('.hamburger').click()
      const mobileAuth = page.locator('.navbar-mobile-auth').first()
      await expect(mobileAuth, `mobile auth block on ${path}`).toBeVisible()
      await expect(mobileAuth.locator('.navbar-user')).toContainText('E2E Tester')
      await expect(mobileAuth.getByRole('button', { name: /log out/i })).toBeVisible()
    }
  })

  test('signed in: logout works from the mobile menu', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/')
    await page.locator('.hamburger').click()
    await page.locator('.navbar-mobile-auth').first().getByRole('button', { name: /log out/i }).click()

    await page.locator('.hamburger').click()
    const mobileAuth = page.locator('.navbar-mobile-auth').first()
    await expect(mobileAuth.getByRole('link', { name: /^log in$/i })).toBeVisible()
  })

  test('no horizontal overflow at 390px on any public page', async ({ page }) => {
    for (const path of PUBLIC_PAGES) {
      await page.goto(path)
      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
      expect(overflows, `${path} should not scroll horizontally`).toBeFalsy()
    }
  })
})

test.describe('M7 the admin route is gated on the server, not on localStorage', () => {
  test.use({ viewport: DESKTOP })

  test('a hand-written admin role with no cookie does not render the admin shell', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({ id: 9999, full_name: 'Fake Admin', role: 'admin' }))
    })

    await page.goto('/admin')
    // Redirected to login, and none of the admin chrome rendered.
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    await expect(page.locator('text=Disciplines')).toHaveCount(0)
  })

  test('a signed in non-admin is kept out of the admin route', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 })
  })

  test('the admin navigation entry is hidden from non-admins', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/')
    await expect(page.getByRole('link', { name: /^admin$/i })).toHaveCount(0)
  })
})
