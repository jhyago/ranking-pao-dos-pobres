# Ranking Pão dos Pobres

Ranking of a class's Kahoot quizzes: a team ranking (fair across team sizes and absences) and an individual overall ranking, shown in a small React app.

## Layout

- `dados/` — source data, edited by the teacher. Headers stay in Portuguese.
  - `aula*.csv` — one Kahoot match per file (`apelido`, `classificacao`, `acertos_pct`, `pontuacao`). File name gives the label (`aula6-2.csv` → "Aula 6 · Quizz 2").
  - `equipes.csv` — one row per student: team, name, `apelidos_confirmados`, `apelidos_sugeridos_a_confirmar` (`;`-separated).
  - `equipes-formulario-original.csv` — raw Google Forms export. Do not edit.
- `app/` — React + Vite frontend.
  - `scripts/build-data.mjs` — turns `dados/*.csv` into `src/data/data.json` (generated, git-ignored). Runs before `dev` and `build`.
  - `src/lib/ranking.js` — all ranking rules. Pure functions, covered by `ranking.test.js`.
  - `src/views/` — `TeamsView`, `OverallView`, `RulesView`.

## Commands (run inside `app/`)

```
npm run dev     # data + dev server on http://localhost:5173
npm test        # node:test, ranking rules
npm run build   # data + production build in dist/
```

Always run `npm test` and `npm run build` after changing code.

## Conventions

- **Code in English** (identifiers, comments, file names, tests). **UI text in Brazilian Portuguese** (the audience is the students). Talk to the user in Portuguese.
- Match the existing style: function components, no extra libraries unless clearly needed, plain CSS with tokens in `:root` and a dark-mode override.
- Keep the UI usable on phones (16px gutters, no horizontal scroll) and accessible (labels, `aria-*`, focus styles).

## Ranking rules (decided with the teacher — do not change without asking)

1. Each score is normalized to % of the match winner's score.
2. A team's score in a match = mean of the members who played, only if at least 2 played (`MIN_PRESENT`).
3. A team's final score = mean over the matches in which it scored.
4. Same person with two accounts in one match: only the best counts.
5. Overall ranking = sum of raw Kahoot points (no normalization).
6. A nickname not mapped to anyone is a "new student": shown in the overall ranking, never counted for a team.
7. Guessed nicknames only count when the "Previsão" toggle is on (off by default).

If the rules change, update `ranking.js`, its tests and `RulesView.jsx` together.

## Data and privacy

- Students are likely minors. Never put e-mails or full names in the app, the generated JSON or commits. Only the `membro` column is exported.
- Nickname → student mapping is confirmed by the teacher. Never move a nickname to `apelidos_confirmados` on your own guess; propose it and ask.
- Aula 4 had no quiz. There are 11 matches as of 2026-10-30.

## Review

Use the `code-reviewer` agent (`.claude/agents/code-reviewer.md`) before considering a change done.
