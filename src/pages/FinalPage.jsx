import {
  Flag,
  Pause,
  Play,
  RotateCcw,
  Eye,
  Trophy,
  Volume2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import CountdownTimer from '../components/CountdownTimer'
import TeamScoreboard from '../components/TeamScoreboard'
import { timelineEvents } from '../data/gameData'
import useTimeUpSound from '../hooks/useTimeUpSound'
import './GamePage.css'
import './FinalPage.css'
import './FinalPresentation.css'
import './FinalScoreboard.css'
import './TimerControls.css'

export default function FinalPage({
  timeline,
  result,
  setResult,
  teams,
  setTeams,
  teamCount,
  setTeamCount,
  scores,
  addScore,
  onRestart,
}) {
  const [showIntro, setShowIntro] = useState(true)
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerStatus, setTimerStatus] = useState('idle')
  const timeUpSound = useTimeUpSound()
  const rankings = teams
    .slice(0, teamCount)
    .map((team, index) => ({ team, score: scores[index], index }))
    .sort((first, second) => second.score - first.score || first.index - second.index)
  const leader = rankings[0]
  const isExpired = timeLeft === 0
  const chronologicalEvents = [...timelineEvents].sort((first, second) => first.year - second.year)
  const scoreboardProps = {
    teams,
    setTeams,
    teamCount,
    setTeamCount,
    scores,
    addScore,
    title: 'BẢNG ĐIỂM TỔNG',
    increments: [30, 20, 10, -10],
    note: 'MC cộng +30 / +20 / +10; dùng −10 để sửa nếu bấm nhầm.',
  }

  useEffect(() => {
    if (
      showIntro ||
      timerStatus !== 'running' ||
      timeLeft <= 0 ||
      result
    ) {
      return undefined
    }
    const timerId = window.setTimeout(
      () => setTimeLeft((current) => {
        if (current <= 1) {
          setTimerStatus('expired')
          timeUpSound.playAlert()
          return 0
        }
        return current - 1
      }),
      1000,
    )
    return () => window.clearTimeout(timerId)
  }, [showIntro, timeLeft, result, timerStatus])

  const startFinal = () => {
    setTimeLeft(30)
    setTimerStatus('idle')
    setResult(null)
    setShowIntro(false)
  }

  const startTimer = async () => {
    await timeUpSound.unlock()
    if (timeLeft === 0) setTimeLeft(30)
    setTimerStatus('running')
  }

  const pauseTimer = () => {
    setTimerStatus('paused')
  }

  const resetTimer = () => {
    setTimeLeft(30)
    setTimerStatus('idle')
  }

  const revealAnswer = () => {
    if (!isExpired) return
    setTimerStatus('paused')
    setResult('revealed')
  }

  if (showIntro) {
    return (
      <main className="game-page final-game-layout">
        <TeamScoreboard {...scoreboardProps} />
        <section className="play-area">
          <div className="round-intro final-round-intro">
            <div className="intro-orbit" />
            <span className="intro-icon"><Flag size={25} /></span>
            <p>VÒNG CHUNG KẾT</p>
            <h1>Khôi phục dòng thời gian</h1>
            <strong>THỬ THÁCH CUỐI CÙNG</strong>
            <div className="intro-divider" />
            <p className="intro-description">
              Năm sự kiện A–E được xáo vị trí. Các mốc năm bên dưới được xếp theo
              thời gian; các đội có 30 giây để ghép sự kiện với năm tương ứng.
            </p>
            <div className="intro-rule"><b>30</b><span>giây cho vòng chung kết</span></div>
            <button className="primary start-round-button" onClick={startFinal}>
              <Play size={18} fill="currentColor" /> Bắt đầu chung kết
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="game-page final-game-layout">
      <TeamScoreboard {...scoreboardProps} />
      <section className="play-area final-page final-score-page">
        <section className="final-head final-head-with-timer">
          <div>
            <p className="eyebrow"><Trophy size={15} /> THỬ THÁCH CUỐI</p>
            <h1>Khôi phục dòng thời gian</h1>
            <p>Ghép năm sự kiện A–E với các mốc năm theo đúng trình tự thời gian.</p>
          </div>
          <div className="final-timer-controls">
            <CountdownTimer seconds={timeLeft} duration={30} label="CHUNG KẾT" />
            <div className="timer-actions">
              {timerStatus === 'running' ? (
                <button onClick={pauseTimer}><Pause size={13} /> Tạm dừng</button>
              ) : (
                <button onClick={startTimer} disabled={Boolean(result)}>
                  <Play size={13} fill="currentColor" />
                  {timerStatus === 'paused' ? 'Tiếp tục' : 'Bắt đầu'}
                </button>
              )}
              <button onClick={resetTimer} disabled={Boolean(result)}><RotateCcw size={13} /> Đặt lại</button>
              <button onClick={timeUpSound.playAlert}><Volume2 size={13} /> Thử âm báo</button>
            </div>
          </div>
        </section>

        {isExpired && <div className="final-time-up">HẾT GIỜ — CÁC ĐỘI DỪNG BÚT</div>}

        <section className="timeline-card final-presentation-card">
        <p className="random-events-label">5 SỰ KIỆN ĐƯỢC XÁO VỊ TRÍ</p>
        <div className="random-event-grid">
          {timeline.map((event) => (
            <article className="random-event-card" key={event.letter}>
              <span>{event.letter}</span>
              <b>{event.title}</b>
            </article>
          ))}
        </div>

        <p className="random-events-label">5 MỐC THỜI GIAN THEO THỨ TỰ</p>
        <div className="final-year-grid" aria-label="Các mốc thời gian">
          {chronologicalEvents.map((event) => (
            <span key={event.year}>{event.year}</span>
          ))}
        </div>

        <button
          className="primary reveal-answer-button"
          disabled={!isExpired || Boolean(result)}
          onClick={revealAnswer}
        >
          <Eye size={18} /> Mở đáp án
        </button>
        {!isExpired && !result && (
          <p className="answer-button-hint">Đáp án chỉ có thể mở sau khi hết 30 giây.</p>
        )}

        {result && (
          <div className="final-answer">
            <p>ĐÁP ÁN — TRÌNH TỰ ĐÚNG</p>
            <div>
              {chronologicalEvents.map((event) => (
                <article key={event.letter}>
                  <span>{event.letter}</span>
                  <b>{event.title}</b>
                  <time>{event.year}</time>
                </article>
              ))}
            </div>
          </div>
        )}
        </section>

      </section>

      <aside className="winner final-summary-panel">
        <span>KẾT QUẢ TỔNG HỢP</span>
        <h2>
          {leader.team}
          <em>{leader.score} điểm</em>
        </h2>
        <div className="final-rankings">
          {rankings.map((entry, index) => (
            <article className={index === 0 ? 'is-leading' : ''} key={entry.index}>
              <b>#{index + 1}</b>
              <span>{entry.team}</span>
              <strong>{entry.score} điểm</strong>
            </article>
          ))}
        </div>
        <button className="secondary restart-final-button" onClick={onRestart}>
          <RotateCcw size={16} /> Chơi lại từ đầu
        </button>
      </aside>
    </main>
  )
}
