import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Every CSS variable the client references must be declared in theme.css.
 *
 * An undefined variable does not error: the property resolves to nothing and
 * the element silently falls back to whatever it inherits. That is how the
 * upload page's drop-zone icon and analysing spinner shipped invisible — they
 * referenced --green-700 and --green-200, colours from a palette the theme had
 * replaced — and how the admin dashboard once rendered near-black text on a
 * near-black surface. Lint and the build pass in both cases. This does not.
 */

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')
const THEME = join(SRC, 'styles', 'theme.css')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (/\.(css|jsx?)$/.test(name) && !name.endsWith('.test.js')) out.push(path)
  }
  return out
}

const declared = new Set(
  [...readFileSync(THEME, 'utf8').matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(m => m[1])
)

test('every var(--token) used in the client is declared in theme.css', () => {
  const missing = new Map()
  for (const file of walk(SRC)) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const token = match[1]
      if (!declared.has(token)) {
        if (!missing.has(token)) missing.set(token, new Set())
        missing.get(token).add(file.slice(SRC.length + 1))
      }
    }
  }
  const report = [...missing].map(([token, files]) => `${token} in ${[...files].join(', ')}`).join('\n')
  assert.equal(missing.size, 0, `Undefined CSS variables:\n${report}`)
})

test('the dark theme declares every token the light theme declares', () => {
  const css = readFileSync(THEME, 'utf8')
  const block = (selector) => {
    const start = css.indexOf(selector)
    const open = css.indexOf('{', start)
    let depth = 0
    for (let i = open; i < css.length; i++) {
      if (css[i] === '{') depth++
      if (css[i] === '}' && --depth === 0) return css.slice(open, i)
    }
    return ''
  }
  const tokens = (text) => new Set([...text.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(m => m[1]))
  const light = tokens(block(':root'))
  const dark = tokens(block("[data-theme='dark']"))
  // Fonts, radii, timings and widths are theme-independent and live in :root only.
  const colourOnly = [...light].filter(t => !/^--(radius|font|transition|nav-height|page-width|content-width)/.test(t))
  const missing = colourOnly.filter(t => !dark.has(t))
  assert.deepEqual(missing, [], `Tokens missing from the dark theme: ${missing.join(', ')}`)
})
