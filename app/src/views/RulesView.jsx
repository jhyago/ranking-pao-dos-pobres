import { MIN_PRESENT } from '../lib/ranking.js'

export default function RulesView({ result }) {
  const { matches, unidentified, identified } = result.summary
  return (
    <section className="rules">
      <h2>Como o ranking funciona</h2>
      <p className="hint">
        Duas formas de olhar a turma: o <strong>ranking das equipes</strong>, pensado para ser justo com times de
        tamanhos diferentes, e o <strong>ranking geral</strong>, que é só a pontuação do Kahoot.
      </p>

      <article className="card">
        <h3>Ranking das equipes</h3>
        <ol>
          <li>
            <strong>Nivelamos cada partida.</strong> A pontuação de cada pessoa vira uma porcentagem da pontuação do
            1º lugar daquela partida (o 1º vale 100%). Assim, uma partida com mais perguntas não vale mais do que
            outra.
          </li>
          <li>
            <strong>Nota da equipe na partida = média de quem jogou.</strong> Equipe de 2 ou de 4 pessoas disputa em
            pé de igualdade, e a falta de um colega não zera nada.
          </li>
          <li>
            <strong>Pelo menos {MIN_PRESENT} integrantes presentes.</strong> Se só uma pessoa da equipe jogou, a
            partida não conta para ela: não dá para mandar só o melhor.
          </li>
          <li>
            <strong>Nota final = média das partidas em que a equipe pontuou.</strong>
          </li>
          <li>
            <strong>Duas contas, uma pessoa.</strong> Se alguém jogou com dois apelidos na mesma partida, vale só a
            melhor.
          </li>
        </ol>
        <p className="example">
          Exemplo: numa partida o 1º fez 8.000 pontos. Na equipe, Ana fez 4.000 (50%) e Bia fez 6.000 (75%). A nota
          da equipe nessa partida é (50 + 75) ÷ 2 = <strong>62,5%</strong>.
        </p>
      </article>

      <article className="card">
        <h3>Ranking geral</h3>
        <p>
          É a soma dos pontos que o Kahoot deu a cada pessoa, em todas as partidas. Sem ajuste: quem jogou mais aulas
          e respondeu mais rápido sobe. Contas duplas na mesma partida também valem só a melhor.
        </p>
      </article>

      <article className="card">
        <h3>Quem é quem?</h3>
        <p>O Kahoot só mostra apelidos. Cada apelido tem um destes estados:</p>
        <ul>
          <li><strong>Confirmado</strong>: sabemos de quem é e ele conta para a equipe.</li>
          <li>
            <strong>Palpite</strong>: parece ser de alguém, mas ninguém confirmou. Só conta se a <em>Previsão</em>{' '}
            estiver ligada.
          </li>
          <li>
            <strong>Novo aluno</strong>: não sabemos de quem é. Aparece sozinho no ranking geral e não conta para
            nenhuma equipe, até alguém confirmar.
          </li>
        </ul>
        <p className="meta">
          Hoje: {matches} partidas analisadas, {identified} pessoas identificadas e {unidentified} apelidos sem dono.
          Se o seu apelido está como “novo aluno?”, avise o professor para ele ligar a você e à sua equipe.
        </p>
      </article>
    </section>
  )
}
