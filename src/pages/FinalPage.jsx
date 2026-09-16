import {
  Flag,
  Pause,
  Play,
  RotateCcw,
  Eye,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import CountdownTimer from '../components/CountdownTimer'
import TeamScoreboard from '../components/TeamScoreboard'
import { timelineEvents } from '../data/gameData'
import useTensionMusic from '../hooks/useTensionMusic'
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
  const [musicEnabled, setMusicEnabled] = useState(true)
  const music = useTensionMusic()
  const rankings = teams
    .slice(0, teamCount)
    .map((team, index) => ({ team, score: scores[index], index }))
    .sort((first, second) => second.score - first.score || first.index - second.index)
  const leader = rankings[0]
  const isExpired = timeLeft === 0
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
          music.stop()
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

  const startTimer = () => {
    if (timeLeft === 0) setTimeLeft(30)
    setTimerStatus('running')
    if (musicEnabled) music.start()
  }

  const pauseTimer = () => {
    setTimerStatus('paused')
    music.stop()
  }

  const resetTimer = () => {
    setTimeLeft(30)
    setTimerStatus('idle')
    music.stop()
  }

  const toggleMusic = () => {
    setMusicEnabled((enabled) => {
      if (enabled) music.stop()
      else if (timerStatus === 'running') music.start()
      return !enabled
    })
  }

  const revealAnswer = () => {
    if (!isExpired) return
    setTimerStatus('paused')
    music.stop()
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
              Màn hình sẽ trình chiếu năm sự kiện theo thứ tự ngẫu nhiên. Các đội
              có 30 giây để ghi trình tự đúng vào phiếu đáp án của đội mình.
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
            <p>Quan sát năm sự kiện ngẫu nhiên và ghi lại trình tự đúng trên phiếu đáp án của đội.</p>
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
              <button onClick={music.preview}><Volume2 size={13} /> Thử nhạc</button>
              <button onClick={toggleMusic}>
                {musicEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                {musicEnabled ? 'Nhạc bật' : 'Nhạc tắt'}
              </button>
            </div>
          </div>
        </section>

        {isExpired && <div className="final-time-up">HẾT GIỜ — CÁC ĐỘI DỪNG BÚT</div>}

        <section className="timeline-card final-presentation-card">
        <p className="random-events-label">5 CỘT MỐC ĐANG ĐƯỢC XÁO TRỘN</p>
        <div className="random-event-grid">
          {timeline.map((event, index) => (
            <article className="random-event-card" key={event}>
              <span>{String.fromCharCode(65 + index)}</span>
              <b>{event}</b>
            </article>
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
              {timelineEvents.map((event, index) => (
                <article key={event}>
                  <span>{index + 1}</span>
                  <b>{event}</b>
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
