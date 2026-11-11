import { useMemo, useState } from 'react'
import { formatPoints, ordinal, sealClass } from '../lib/format.js'

export default function OverallView({ result }) {
  const [query, setQuery] = useState('')
  const [showUnidentified, setShowUnidentified] = useState(true)

  // Positions come from the full ranking, so filtering never renumbers anyone.
  const ranked = useMemo(() => result.players.map((p, i) => ({ ...p, position: i + 1 })), [result])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ranked.filter(
      (p) =>
        (showUnidentified || p.identified) &&
        (!q || p.name.toLowerCase().includes(q) || p.nicknames.some((n) => n.toLowerCase().includes(q))),
    )
  }, [ranked, query, showUnidentified])

  return (
    <section>
      <h2>Ranking geral</h2>
      <p className="hint">
        Soma dos pontos do Kahoot em todas as partidas, do jeito que o jogo conta (sem nivelar). Quem joga mais
        aulas tende a somar mais.
      </p>

      <div className="filters">
        <input
          type="search"
          placeholder="Buscar por nome ou apelido…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar jogador"
        />
        <label className="option">
          <input type="checkbox" checked={showUnidentified} onChange={(e) => setShowUnidentified(e.target.checked)} />
          mostrar novos alunos (apelido sem dono)
        </label>
      </div>

      <ol className="list">
        {visible.map((p) => (
          <li key={p.key} className={`card player${p.position <= 3 ? ` top${p.position}` : ''}`}>
            <span className={sealClass(p.position)}>{ordinal(p.position)}</span>
            <div className="body">
              <div className="title">
                <strong>{p.name}</strong>
                {!p.identified && <span className="badge unknown">novo aluno?</span>}
                {p.teamName && <span className="badge team">{p.teamName}</span>}
              </div>
              <div className="meta">
                {p.matchesPlayed} {p.matchesPlayed === 1 ? 'partida' : 'partidas'} · melhor: {formatPoints(p.best)}
                {p.nicknames.length > 1 || p.nicknames[0] !== p.name ? ` · apelidos: ${p.nicknames.join(', ')}` : ''}
              </div>
            </div>
            <span className="value large">{formatPoints(p.total)}</span>
          </li>
        ))}
      </ol>
      {visible.length === 0 && <p className="notice">Ninguém encontrado com esse filtro.</p>}
    </section>
  )
}
