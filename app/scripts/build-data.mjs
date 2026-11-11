// Reads the CSVs in ../dados and writes src/data/data.json for the app.
// The CSVs are the single source of truth; their headers stay in Portuguese because the teacher edits them.
// Full names and e-mails are never exported: only the name the student wrote in the team form.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '..', '..', 'dados')
const outFile = join(here, '..', 'src', 'data', 'data.json')

// Minimal CSV parser with quote support.
function parseCsv(text) {
  const t = text.replace(/^﻿/, '')
  const rows = []
  let field = ''
  let row = []
  let quoted = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (quoted) {
      if (c === '"' && t[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((x) => x !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((x) => x !== '')) rows.push(row) }
  const [header, ...rest] = rows
  return rest.map((r) => Object.fromEntries(header.map((name, i) => [name.trim(), (r[i] ?? '').trim()])))
}

const splitList = (s) => (s ? s.split(';').map((x) => x.trim()).filter(Boolean) : [])

function labelFromFile(file) {
  const m = file.match(/^aula(\d+)(?:-(\d+))?\.csv$/)
  if (!m) return file.replace('.csv', '')
  return m[2] ? `Aula ${Number(m[1])} · Quizz ${Number(m[2])}` : `Aula ${Number(m[1])}`
}

const matchFiles = readdirSync(dataDir)
  .filter((f) => /^aula.*\.csv$/.test(f))
  .sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }))

const matches = matchFiles.map((file) => ({
  id: file.replace('.csv', ''),
  label: labelFromFile(file),
  players: parseCsv(readFileSync(join(dataDir, file), 'utf8')).map((r) => ({
    nickname: r.apelido,
    score: Number(r.pontuacao),
    correctPct: Number(r.acertos_pct),
  })),
}))

const teams = []
for (const r of parseCsv(readFileSync(join(dataDir, 'equipes.csv'), 'utf8'))) {
  let team = teams.find((t) => t.id === r.equipe_id)
  if (!team) { team = { id: r.equipe_id, name: r.equipe, members: [] }; teams.push(team) }
  team.members.push({
    name: r.membro,
    confirmed: splitList(r.apelidos_confirmados),
    guesses: splitList(r.apelidos_sugeridos_a_confirmar),
  })
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify({ matches, teams }, null, 2))
console.log(`data.json: ${matches.length} matches, ${teams.length} teams`)
