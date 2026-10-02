#!/usr/bin/env node
/**
 * Turns one package's node:test output into a coverage and test-count summary
 * for the GitHub Actions job page, and optionally enforces a line minimum.
 *
 *   node .github/scripts/coverage-summary.mjs \
 *     --package server --root server --src src,scripts \
 *     --lcov server/coverage/lcov.info --tap server/coverage/tests.tap \
 *     [--min 70]
 *
 * Why two line figures: Node's coverage only reports files a test loaded. A
 * route no test imports is simply absent, so "line % of loaded files" can look
 * healthy while most of a package is untested. The second figure counts every
 * source file under --src, scoring an unloaded file's lines as uncovered. Node
 * itself counts every physical line of a loaded file (LF equals the file's
 * line count), so the two figures use the same unit.
 *
 * --min applies to the all-source-files figure, the one that cannot be raised
 * by not testing a file. Without --min the numbers are reported only.
 *
 * Writes markdown to $GITHUB_STEP_SUMMARY when set (and always to stdout), and
 * the raw numbers to coverage/summary.json beside the lcov file.
 */
import { readFileSync, writeFileSync, appendFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, relative, dirname } from 'node:path'

function args() {
  const out = {}
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i += 2) out[argv[i].replace(/^--/, '')] = argv[i + 1]
  return out
}

const opts = args()
for (const required of ['package', 'root', 'src', 'lcov', 'tap']) {
  if (!opts[required]) {
    console.error(`coverage-summary: --${required} is required`)
    process.exit(2)
  }
}

const root = resolve(opts.root)
const min = opts.min === undefined ? null : Number(opts.min)

/* ── lcov ─────────────────────────────────────────────────────────────── */

const totals = { LF: 0, LH: 0, BRF: 0, BRH: 0, FNF: 0, FNH: 0 }
const loaded = new Set()

if (existsSync(opts.lcov)) {
  for (const record of readFileSync(opts.lcov, 'utf8').split('end_of_record')) {
    const sf = record.match(/^SF:(.+)$/m)
    if (!sf) continue
    // node:test writes SF paths relative to the directory it ran in, which is
    // the package root here.
    loaded.add(resolve(root, sf[1].trim()))
    for (const key of Object.keys(totals)) {
      const m = record.match(new RegExp(`^${key}:(\\d+)$`, 'm'))
      if (m) totals[key] += Number(m[1])
    }
  }
}

/* ── every source file the package ships ──────────────────────────────── */

function walk(dir, found = []) {
  if (!existsSync(dir)) return found
  // A single file is allowed too, e.g. a package's index.js.
  if (!statSync(dir).isDirectory()) {
    if (/\.(m?js)$/.test(dir)) found.push(dir)
    return found
  }
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'coverage') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, found)
    else if (/\.(m?js)$/.test(name) && !/\.test\.m?js$/.test(name)) found.push(full)
  }
  return found
}

const sources = opts.src.split(',').flatMap((d) => walk(join(root, d.trim())))
const unloaded = sources
  .filter((f) => !loaded.has(f))
  .map((f) => ({ file: relative(root, f), lines: readFileSync(f, 'utf8').split('\n').length }))
  .sort((a, b) => b.lines - a.lines)
const unloadedLines = unloaded.reduce((sum, u) => sum + u.lines, 0)

const pct = (hit, found) => (found === 0 ? null : (hit / found) * 100)
const fmt = (value) => (value === null ? 'n/a' : `${value.toFixed(1)}%`)

const lineLoaded = pct(totals.LH, totals.LF)
const lineAll = pct(totals.LH, totals.LF + unloadedLines)
const branch = pct(totals.BRH, totals.BRF)
const funcs = pct(totals.FNH, totals.FNF)

/* ── test counts from the TAP reporter ────────────────────────────────── */

const counts = {}
if (existsSync(opts.tap)) {
  const tap = readFileSync(opts.tap, 'utf8')
  for (const key of ['tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
    const all = [...tap.matchAll(new RegExp(`^# ${key} (\\d+)$`, 'gm'))]
    counts[key] = all.length ? Number(all.at(-1)[1]) : null
  }
}

/* ── report ───────────────────────────────────────────────────────────── */

const gated = min !== null
const passedGate = !gated || (lineAll !== null && lineAll >= min)
const target = 70

const lines = []
lines.push(`### ${opts.package}`)
lines.push('')
if (counts.tests !== undefined && counts.tests !== null) {
  lines.push(`**Tests:** ${counts.pass} passed, ${counts.fail} failed, ${counts.skipped} skipped, ${counts.todo} todo (${counts.tests} total)`)
} else {
  lines.push('**Tests:** no TAP output found (did the test step run?)')
}
lines.push('')
lines.push('| Measure | Value |')
lines.push('| --- | --- |')
lines.push(`| Line coverage, all source files | **${fmt(lineAll)}** (target ${target}%: ${lineAll !== null && lineAll >= target ? 'met' : 'not met'}) |`)
lines.push(`| Line coverage, files loaded by tests | ${fmt(lineLoaded)} |`)
lines.push(`| Branch coverage (loaded files) | ${fmt(branch)} |`)
lines.push(`| Function coverage (loaded files) | ${fmt(funcs)} |`)
lines.push(`| Source files loaded by tests | ${sources.length - unloaded.length} of ${sources.length} |`)
lines.push(`| Threshold | ${gated ? `enforced: ${min}% of all source lines, ${passedGate ? 'passed' : '**failed**'}` : 'report only'} |`)
lines.push('')
if (unloaded.length) {
  lines.push('<details><summary>Source files no test loads (counted as 0%)</summary>')
  lines.push('')
  for (const u of unloaded) lines.push(`- \`${u.file}\` (${u.lines} lines)`)
  lines.push('')
  lines.push('</details>')
  lines.push('')
}

const markdown = lines.join('\n')
console.log(markdown)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`)

const summaryPath = join(dirname(resolve(opts.lcov)), 'summary.json')
writeFileSync(summaryPath, `${JSON.stringify({
  package: opts.package,
  tests: counts,
  coverage: {
    lineAllSourceFiles: lineAll,
    lineLoadedFiles: lineLoaded,
    branchLoadedFiles: branch,
    functionsLoadedFiles: funcs,
    sourceFiles: sources.length,
    sourceFilesLoaded: sources.length - unloaded.length,
    unloadedFiles: unloaded,
  },
  threshold: gated ? { min, passed: passedGate } : null,
}, null, 2)}\n`)

if (!passedGate) {
  console.log(`::error::${opts.package} line coverage ${fmt(lineAll)} is below the enforced ${min}%`)
  process.exit(1)
}
