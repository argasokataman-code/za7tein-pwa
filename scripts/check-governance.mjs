import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const prd = resolve(root, 'docs/product/prd')
const manifest = JSON.parse(readFileSync(resolve(prd, 'manifest.json'), 'utf8'))
const errors = []
const pending = readdirSync(resolve(prd, 'inbox')).filter((name) =>
  name !== '.gitkeep' && !manifest.revisions.some((item) => item.originalFilename === name),
)
if (pending.length) errors.push(`Unregistered PRD/BRS in inbox: ${pending.join(', ')}. Run npm run prd:intake.`)
const ids = new Set()
for (const revision of manifest.revisions) {
  if (ids.has(revision.id)) errors.push(`Duplicate revision ID: ${revision.id}`)
  ids.add(revision.id)
  const source = resolve(prd, revision.source)
  if (!existsSync(source)) errors.push(`Missing source: ${revision.id}`)
  else if (revision.sha256) {
    const hash = createHash('sha256').update(readFileSync(source)).digest('hex')
    if (hash !== revision.sha256) errors.push(`Source changed: ${revision.id}`)
  }
  for (const key of ['decisionRecord', 'milestonePlan']) {
    if (revision[key] && !existsSync(resolve(prd, revision[key]))) errors.push(`Missing ${key}: ${revision.id}`)
  }
}
const active = manifest.revisions.filter((item) => item.status === 'active')
if (active.length !== 1 || active[0]?.id !== manifest.activeRevision) errors.push('Exactly one active revision must match activeRevision')
if (active[0]) {
  const decision = readFileSync(resolve(prd, active[0].decisionRecord), 'utf8')
  const milestones = readFileSync(resolve(prd, active[0].milestonePlan), 'utf8')
  if (decision.includes('UNREVIEWED') || milestones.includes('UNREVIEWED')) errors.push('Active revision has unreviewed analysis or milestones')
}
for (const revision of manifest.revisions) {
  if (revision.supersedes && !ids.has(revision.supersedes)) errors.push(`Unknown supersedes: ${revision.id}`)
  if (revision.supersededBy && !ids.has(revision.supersededBy)) errors.push(`Unknown supersededBy: ${revision.id}`)
}

function walk(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(path, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}
const files = walk(resolve(root, 'src'))
const legacyDebt = JSON.parse(readFileSync(resolve(root, 'docs/design/legacy-debt.json'), 'utf8'))
for (const file of files.filter((path) => extname(path) === '.tsx')) {
  const relative = file.slice(root.length + 1)
  const svgBlocks = [...readFileSync(file, 'utf8').matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map((match) =>
    createHash('sha256').update(match[0]).digest('hex'),
  )
  const approved = legacyDebt.inlineSvg[relative] ?? []
  if (JSON.stringify(svgBlocks) !== JSON.stringify(approved)) errors.push(`Inline SVG changed in ${relative}. Functional icons must use lucide-react; review decorative or brand exceptions explicitly.`)
}
for (const file of files.filter((path) => /src\/(pages|components)\//.test(path) || path.endsWith('/src/styles/_system.scss'))) {
  if (!['.tsx', '.css', '.scss'].includes(extname(file))) continue
  const relative = file.slice(root.length + 1)
  const count = (readFileSync(file, 'utf8').match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g) ?? []).length
  const allowed = legacyDebt.rawColors[relative] ?? 0
  if (count > allowed) errors.push(`New raw color in ${relative}: ${count} > legacy baseline ${allowed}. Use a design token or document an exception.`)
}
const tokens = readFileSync(resolve(root, 'src/styles/_tokens.scss'), 'utf8')
const defined = new Set([...tokens.matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)].map((m) => m[1]))
for (const file of files.filter((path) => ['.scss', '.css', '.tsx', '.ts'].includes(extname(path)))) {
  for (const match of readFileSync(file, 'utf8').matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)) defined.add(match[1])
}
// Legacy Bootstrap selectors reference variables provided only when a Bootstrap
// button is active. Keep the ported stylesheet out of the new-token contract.
const legacyExternal = new Set(['--bs-btn-active-color', '--bs-btn-active-border-color'])
for (const file of files) {
  if (!['.scss', '.css', '.tsx', '.ts'].includes(extname(file))) continue
  const content = readFileSync(file, 'utf8')
  for (const match of content.matchAll(/var\((--[a-z][a-z0-9-]*)/g)) {
    if (!defined.has(match[1]) && !legacyExternal.has(match[1])) errors.push(`Undefined design token ${match[1]} in ${file.slice(root.length + 1)}`)
  }
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Governance OK: ${manifest.activeRevision}; ${manifest.revisions.length} revisions; ${defined.size} tokens`)
