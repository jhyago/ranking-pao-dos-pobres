import { formatPct, ordinal, sealClass } from '../lib/format.js'

const BADGES = {
  confirmed: { text: 'confirmado', className: 'ok' },
  guess: { text: 'palpite', className: 'guess' },
  unknown: { text: 'apelido desconhecido', className: 'unknown' },
}

function Podium({ teams }) {
  const top = teams.filter((t) => t.average !== null).slice(0, 3)
  if (top.length === 0) return null
  // Visual order: 2nd, 1st, 3rd.
  const order = [top[1], top[0], top[2]]
  return (
    <ol className="podium" aria-label="Pódio">
      {order.map((t, i) => {
        if (!t) return <li key={`empty-${i}`} className="step empty" aria-hidden="true" />
        const position = top.indexOf(t) + 1
        return (
          <li key={t.id} className={`step p${position}`}>
            <span className={sealClass(position)}>{ordinal(position)}</span>
            <span className="name">{t.name}</span>
            <span className="score">{formatPct(t.average)}</span>
          </li>
        )
      })}
    </ol>
  )
}

function MatchHistory({ matches }) {
  return (
    <div className="history" role="img" aria-label="Nota da equipe em cada partida">
      {matches.map((m, i) => (
        <span
          key={i}
          className={m.score === null ? 'bar empty' : 'bar'}
          style={{ height: m.score === null ? '6%' : `${Math.max(m.score, 6)}%` }}
          title={
            m.score === null
              ? `${m.label}: não pontuou (${m.present} presente${m.present === 1 ? '' : 's'}, mínimo 2)`
              : `${m.label}: ${formatPct(m.score)} (${m.present} presentes)`
          }
        />
      ))}
    </div>
  )
}

export default function TeamsView({ result }) {
  const { teams } = result
  const anyScored = teams.some((t) => t.average !== null)
  return (
    <section>
      <h2>Ranking das equipes</h2>
      <p className="hint">
        Média das notas nas partidas em que a equipe pontuou (pelo menos 2 integrantes jogando). 100% seria
        igualar o 1º lugar de todas as partidas.
      </p>

      {!anyScored && (
        <p className="notice">
          Ainda não dá para pontuar nenhuma equipe: faltam apelidos confirmados. Ligue a <strong>Previsão</strong>{' '}
          lá em cima para ver como ficaria com os palpites.
        </p>
      )}

      <Podium teams={teams} />

      <ol className="list">
        {teams.map((t, i) => (
          <li key={t.id} className="card">
            <div className="row">
              <span className={t.average === null ? 'seal muted' : sealClass(i + 1)}>
                {t.average === null ? '—' : ordinal(i + 1)}
              </span>
              <div className="body">
                <div className="title">
                  <strong>{t.name}</strong>
                  <span className="value">{t.average === null ? 'sem nota' : formatPct(t.average)}</span>
                </div>
                <div className="track" aria-hidden="true">
                  <div className="fill" style={{ width: `${t.average ?? 0}%` }} />
                </div>
                <div className="meta">
                  pontuou em {t.scoredMatches} de {t.matches.length} partidas
                </div>
              </div>
              <MatchHistory matches={t.matches} />
            </div>
            <details>
              <summary>Integrantes ({t.members.length})</summary>
              <ul className="members">
                {t.members.map((m) => (
                  <li key={m.name}>
                    <span>{m.name}</span>
                    <span className={`badge ${BADGES[m.status].className}`}>
                      {BADGES[m.status].text}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ol>
    </section>
  )
}
