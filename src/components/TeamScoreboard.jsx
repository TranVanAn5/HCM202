import { Trophy } from 'lucide-react'

export default function TeamScoreboard({
  teams,
  setTeams,
  teamCount,
  setTeamCount,
  scores,
  addScore,
  title = 'BẢNG ĐIỂM',
  increments = [10, 5],
  note = 'MC bấm điểm khi đội trả lời đúng.',
}) {
  return (
    <aside className="scoreboard">
      <div className="score-title">
        <Trophy size={18} />
        <span>{title}</span>
      </div>

      <div className="team-controls">
        <button onClick={() => setTeamCount(Math.max(2, teamCount - 1))}>−</button>
        <span>{teamCount} ĐỘI</span>
        <button
          onClick={() => setTeamCount(Math.min(teams.length, teamCount + 1))}
        >
          +
        </button>
      </div>

      {teams.slice(0, teamCount).map((team, index) => (
        <div className="team-score" key={index}>
          <input
            value={team}
            aria-label={'Tên đội ' + (index + 1)}
            onChange={(event) => {
              setTeams((items) =>
                items.map((item, itemIndex) =>
                  itemIndex === index ? event.target.value : item,
                ),
              )
            }}
          />
          <b>{scores[index]}</b>
          <div>
            {increments.map((amount) => (
              <button key={amount} onClick={() => addScore(index, amount)}>
                {amount > 0 ? '+' : ''}{amount}
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="score-note">{note}</p>
    </aside>
  )
}
