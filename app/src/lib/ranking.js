// Ranking rules (explained to students on the "Regras" screen):
//  - each score becomes a % of the match winner's score;
//  - a team's score in a match = mean of the members who played, if at least MIN_PRESENT played;
//  - a team's final score = mean of the matches in which it scored;
//  - same person with two accounts in one match: only the best one counts;
//  - the individual (overall) ranking = sum of raw Kahoot points;
//  - a nickname with no known owner is treated as a "new student", outside any team.

export const MIN_PRESENT = 2

const normalize = (s) => s.trim().toLowerCase()
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length

function indexNicknames(teams, useGuesses) {
  const index = new Map()
  const register = (nickname, team, member) => {
    const key = normalize(nickname)
    // On conflict the first entry wins; confirmed nicknames are registered before guesses.
    if (!index.has(key)) index.set(key, { key: `${team.id}:${member.name}`, team, member })
  }
  for (const t of teams) for (const m of t.members) for (const n of m.confirmed) register(n, t, m)
  if (useGuesses) for (const t of teams) for (const m of t.members) for (const n of m.guesses) register(n, t, m)
  return index
}

function memberStatus(member, useGuesses) {
  if (member.confirmed.length) return 'confirmed'
  if (useGuesses && member.guesses.length) return 'guess'
  return 'unknown'
}

export function computeRanking({ matches, teams }, { useGuesses = false } = {}) {
  const index = indexNicknames(teams, useGuesses)
  const people = new Map()
  const byTeam = new Map(teams.map((t) => [t.id, matches.map(() => null)]))

  matches.forEach((match, i) => {
    const top = Math.max(0, ...match.players.map((p) => p.score))
    // One entry per person; duplicate accounts keep the best score.
    const inMatch = new Map()
    for (const p of match.players) {
      const hit = index.get(normalize(p.nickname))
      const key = hit ? hit.key : `?:${normalize(p.nickname)}`
      const current = inMatch.get(key)
      if (!current || p.score > current.score) inMatch.set(key, { ...p, hit, key })
      if (!people.has(key)) {
        people.set(key, {
          key,
          name: hit ? hit.member.name : p.nickname,
          teamId: hit ? hit.team.id : null,
          teamName: hit ? hit.team.name : null,
          identified: Boolean(hit),
          nicknames: new Set(),
          total: 0,
          matchesPlayed: 0,
          best: 0,
        })
      }
      people.get(key).nicknames.add(p.nickname)
    }
    for (const [key, r] of inMatch) {
      const person = people.get(key)
      person.total += r.score
      person.matchesPlayed += 1
      person.best = Math.max(person.best, r.score)
      r.pct = top > 0 ? (r.score / top) * 100 : 0
    }
    for (const t of teams) {
      const present = [...inMatch.values()].filter((r) => r.hit && r.hit.team.id === t.id)
      byTeam.get(t.id)[i] = {
        label: match.label,
        present: present.length,
        score: present.length >= MIN_PRESENT ? mean(present.map((r) => r.pct)) : null,
      }
    }
  })

  const teamResults = teams.map((t) => {
    const perMatch = byTeam.get(t.id)
    const scores = perMatch.filter((m) => m.score !== null).map((m) => m.score)
    return {
      id: t.id,
      name: t.name,
      average: scores.length ? mean(scores) : null,
      scoredMatches: scores.length,
      matches: perMatch,
      members: t.members.map((m) => ({ name: m.name, status: memberStatus(m, useGuesses) })),
    }
  })
  teamResults.sort((a, b) => {
    if (a.average === null && b.average === null) return a.id.localeCompare(b.id, 'pt', { numeric: true })
    if (a.average === null) return 1
    if (b.average === null) return -1
    return b.average - a.average || b.scoredMatches - a.scoredMatches
  })

  const players = [...people.values()]
    .map((p) => ({ ...p, nicknames: [...p.nicknames] }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'pt'))

  return {
    teams: teamResults,
    players,
    summary: {
      matches: matches.length,
      unidentified: players.filter((p) => !p.identified).length,
      identified: players.filter((p) => p.identified).length,
    },
  }
}
