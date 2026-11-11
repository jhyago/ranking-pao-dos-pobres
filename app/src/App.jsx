import { useEffect, useMemo, useState } from 'react'
import data from './data/data.json'
import { computeRanking } from './lib/ranking.js'
import TeamsView from './views/TeamsView.jsx'
import OverallView from './views/OverallView.jsx'
import RulesView from './views/RulesView.jsx'

const TABS = [
  { id: 'equipes', label: 'Equipes' },
  { id: 'geral', label: 'Geral' },
  { id: 'regras', label: 'Regras' },
]

function tabFromHash() {
  const hash = window.location.hash.replace('#', '')
  return TABS.some((t) => t.id === hash) ? hash : 'equipes'
}

function readForecast() {
  try {
    return localStorage.getItem('forecast') === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [tab, setTab] = useState(tabFromHash)
  const [forecast, setForecast] = useState(readForecast)

  useEffect(() => {
    const onHashChange = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const toggleForecast = (value) => {
    setForecast(value)
    try {
      localStorage.setItem('forecast', value ? '1' : '0')
    } catch {
      /* no storage: the choice lasts only for this visit */
    }
  }

  const result = useMemo(() => computeRanking(data, { useGuesses: forecast }), [forecast])

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">Crônicas da turma</p>
        <h1>Ranking Pão dos Pobres</h1>
        <p className="subtitle">{result.summary.matches} batalhas de Kahoot registradas</p>
        <nav className="tabs" aria-label="Seções">
          {TABS.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={t.id === tab ? 'tab active' : 'tab'}
              aria-current={t.id === tab ? 'page' : undefined}
            >
              {t.label}
            </a>
          ))}
        </nav>
      </header>

      <label className="forecast">
        <input type="checkbox" checked={forecast} onChange={(e) => toggleForecast(e.target.checked)} />
        <span>
          <strong>Previsão</strong>: incluir palpites de quem é quem
          <small>
            {forecast
              ? ' Ligada: apelidos ainda não confirmados já contam para as equipes.'
              : ' Desligada: só contam apelidos confirmados; os outros viram "novos alunos".'}
          </small>
        </span>
      </label>

      <main>
        {tab === 'equipes' && <TeamsView result={result} />}
        {tab === 'geral' && <OverallView result={result} />}
        {tab === 'regras' && <RulesView result={result} />}
      </main>

      <footer className="footer">Que vença a equipe mais sábia.</footer>
    </div>
  )
}
