import test from 'node:test'
import assert from 'node:assert/strict'
import { computeRanking } from './ranking.js'

const teams = [
  {
    id: '1', name: 'Team A',
    members: [
      { name: 'Ana', confirmed: ['ana'], guesses: [] },
      { name: 'Bia', confirmed: ['bia', 'bia2'], guesses: [] },
      { name: 'Caio', confirmed: [], guesses: ['caio'] },
    ],
  },
  {
    id: '2', name: 'Team B',
    members: [
      { name: 'Dani', confirmed: ['dani'], guesses: [] },
      { name: 'Edu', confirmed: ['edu'], guesses: [] },
    ],
  },
]
const P = (nickname, score) => ({ nickname, score, correctPct: 0 })
const team = (r, id) => r.teams.find((t) => t.id === id)

test('normalizes by the match winner and averages members who played', () => {
  const matches = [{ label: 'M1', players: [P('Dani', 1000), P('ana', 500), P('bia', 250), P('edu', 100)] }]
  const r = computeRanking({ matches, teams })
  assert.equal(team(r, '1').average, 37.5) // (50 + 25) / 2
  assert.equal(team(r, '2').average, 55) // (100 + 10) / 2
  assert.equal(r.teams[0].id, '2')
})

test('a team with fewer than 2 members present does not score in that match', () => {
  const matches = [
    { label: 'M1', players: [P('ana', 500), P('dani', 1000), P('edu', 1000)] },
    { label: 'M2', players: [P('ana', 500), P('bia', 500), P('dani', 1000)] },
  ]
  const a = team(computeRanking({ matches, teams }), '1')
  assert.equal(a.matches[0].score, null)
  assert.equal(a.matches[1].score, 50)
  assert.equal(a.scoredMatches, 1)
  assert.equal(a.average, 50)
})

test('two accounts of the same person in one match: only the best counts', () => {
  const matches = [{ label: 'M1', players: [P('bia', 100), P('bia2', 900), P('ana', 1000)] }]
  const r = computeRanking({ matches, teams })
  const bia = r.players.find((p) => p.name === 'Bia')
  assert.equal(bia.total, 900)
  assert.equal(bia.matchesPlayed, 1)
  assert.deepEqual(bia.nicknames.sort(), ['bia', 'bia2'])
  assert.equal(team(r, '1').average, 95) // (100 + 90) / 2
})

test('unknown nickname becomes a new student outside any team; case is ignored', () => {
  const matches = [{ label: 'M1', players: [P('Mystery', 800), P('ANA', 400), P('mystery', 300)] }]
  const r = computeRanking({ matches, teams })
  assert.equal(r.players.find((p) => !p.identified).total, 800)
  assert.equal(r.summary.unidentified, 1)
  assert.equal(r.players.find((p) => p.name === 'Ana').teamId, '1')
})

test('guesses only count when the forecast is on', () => {
  const matches = [{ label: 'M1', players: [P('caio', 500), P('ana', 1000)] }]
  const off = computeRanking({ matches, teams }, { useGuesses: false })
  assert.equal(team(off, '1').average, null)
  assert.equal(off.summary.unidentified, 1)
  const on = computeRanking({ matches, teams }, { useGuesses: true })
  assert.equal(team(on, '1').average, 75)
  assert.equal(on.summary.unidentified, 0)
})

test('overall ranking sums raw Kahoot points, without normalizing', () => {
  const matches = [
    { label: 'M1', players: [P('ana', 1000), P('dani', 500)] },
    { label: 'M2', players: [P('ana', 200), P('dani', 5000)] },
  ]
  const r = computeRanking({ matches, teams })
  assert.deepEqual(r.players.map((p) => [p.name, p.total]), [['Dani', 5500], ['Ana', 1200]])
})
