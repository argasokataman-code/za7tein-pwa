import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'

const [input, id] = process.argv.slice(2)
if (!input || !id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: npm run prd:intake -- docs/product/prd/inbox/file.pdf unique-revision-id')
  process.exit(1)
}
const root = resolve(import.meta.dirname, '..')
const prd = resolve(root, 'docs/product/prd')
const source = resolve(root, input)
const inbox = resolve(prd, 'inbox')
if (!source.startsWith(inbox + '/') || !existsSync(source)) {
  console.error('Source must exist inside docs/product/prd/inbox/')
  process.exit(1)
}
const extension = extname(source).toLowerCase()
if (!['.pdf', '.md', '.txt'].includes(extension)) {
  console.error('Supported sources: PDF, Markdown, text')
  process.exit(1)
}
const manifestPath = resolve(prd, 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (manifest.revisions.some((item) => item.id === id)) {
  console.error(`Revision already exists: ${id}`)
  process.exit(1)
}
const versionDir = resolve(prd, 'versions', id)
if (existsSync(versionDir)) {
  console.error(`Directory already exists: ${versionDir}`)
  process.exit(1)
}
const sha256 = createHash('sha256').update(readFileSync(source)).digest('hex')
mkdirSync(versionDir, { recursive: true })
renameSync(source, resolve(versionDir, `source${extension}`))
const record = {
  id,
  documentVersion: 'UNVERIFIED',
  status: 'proposed',
  source: `versions/${id}/source${extension}`,
  sha256,
  originalFilename: basename(source),
  decisionRecord: `versions/${id}/analysis.md`,
  milestonePlan: `versions/${id}/milestones.md`,
}
manifest.revisions.push(record)
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
writeFileSync(resolve(versionDir, 'analysis.md'), `# Analysis: ${id}\n\nStatus: UNREVIEWED. Active baseline: ${manifest.activeRevision}.\n\n## Source inventory\n- Version printed in document: UNVERIFIED\n- Pages/sections read: UNVERIFIED\n- SHA-256: ${sha256}\n\n## Requirement delta\n| Requirement ID | Source page/section | Current rule | New rule | UI/state impact | BE contract | Decision/status |\n|---|---|---|---|---|---|---|\n| TODO | TODO | TODO | TODO | TODO | TODO | UNRESOLVED |\n\n## Conflicts and open questions\n- TODO: cite both sources and record a decision before activation.\n\n## Repo impact and evidence\n- TODO: cite file paths and distinguish implemented, partial, and absent.\n`)
writeFileSync(resolve(versionDir, 'milestones.md'), `# Milestones: ${id}\n\nStatus: UNREVIEWED. Do not schedule until analysis has source-backed requirements.\n\n| ID | Requirement IDs | Dependencies | Owner | Acceptance criteria | Mock state | BE contract | Status |\n|---|---|---|---|---|---|---|---|\n| M0 | TODO | — | TODO | TODO | TODO | TODO | blocked-by-analysis |\n`)
console.log(`Registered proposed revision ${id}; active revision remains ${manifest.activeRevision}`)
