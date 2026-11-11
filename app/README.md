# Ranking Pão dos Pobres

App React (Vite) com o ranking dos quizzes de Kahoot: equipes, geral e regras.

## Rodar

```
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a pasta dist/ (site estático)
npm test         # testes das regras do ranking
```

## De onde vêm os dados

O app lê os CSVs da pasta `../dados` (o script `scripts/build-data.mjs` roda sozinho antes de `dev` e `build`):

- `aula*.csv`: uma partida por arquivo (`apelido`, `pontuacao`, `acertos_pct`...). Para uma nova partida, é só adicionar o CSV.
- `equipes.csv`: quem é de cada equipe e os apelidos de cada pessoa.

## Confirmar um apelido

Em `dados/equipes.csv`, mova o apelido da coluna `apelidos_sugeridos_a_confirmar` para `apelidos_confirmados` (separados por `;`) e rode `npm run dev` ou `npm run build` de novo. Apelidos que não estão em nenhuma das duas colunas aparecem como "novo aluno?".

Só o nome da coluna `membro` vai para o app. Nomes completos e e-mails não são usados.

## Regras

Estão em `src/lib/ranking.js` (e explicadas na aba Regras): nivelamento pelo 1º lugar, média dos presentes, mínimo de 2 presentes por equipe, só a melhor conta por partida e ranking geral pela soma dos pontos do Kahoot.
