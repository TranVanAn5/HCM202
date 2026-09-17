import { Check, ChevronRight, Eye, Pause, Play, RotateCcw, Trophy, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import CountdownTimer from '../components/CountdownTimer'
import { letters, tiebreakerQuestion } from '../data/gameData'
import useTimeUpSound from '../hooks/useTimeUpSound'
import './GamePage.css'
import './TimerControls.css'
import './TiebreakerPage.css'

export default function TiebreakerPage({ teams, scores, qualification, onResolve }) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [timerStatus, setTimerStatus] = useState('idle')
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState([])
  const timeUpSound = useTimeUpSound()
  const { secured, tied, slots } = qualification

  useEffect(() => {
    if (timerStatus !== 'running' || timeLeft <= 0) return undefined

    const timerId = window.setTimeout(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setTimerStatus('expired')
          timeUpSound.playAlert()
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [timeLeft, timerStatus])

  const startTimer = async () => {
    await timeUpSound.unlock()
    if (timeLeft === 0) setTimeLeft(10)
    setTimerStatus('running')
  }

  const resetTimer = () => {
    setTimeLeft(10)
    setTimerStatus('idle')
  }

  const revealAnswer = () => {
    if (timeLeft !== 0) return
    setRevealed(true)
  }

  const toggleTeam = (index) => {
    setSelected((current) => {
      if (current.includes(index)) return current.filter((item) => item !== index)
      return current.length < slots ? [...current, index] : current
    })
  }

  return (
    <main className="game-page tiebreaker-page">
      <aside className="scoreboard tiebreaker-standings">
        <div className="score-title"><Trophy size={18} /> <span>RANH GIỚI TOP 4</span></div>
        <p>{secured.length} đội đã chắc suất. Còn {slots} suất dành cho {tied.length} đội bằng điểm.</p>
        {secured.map((index) => (
          <div className="tiebreaker-standing" key={index}>
            <span>{teams[index]}</span><b>{scores[index]}</b><small>Đã vào</small>
          </div>
        ))}
        {tied.map((index) => (
          <div className="tiebreaker-standing is-tied" key={index}>
            <span>{teams[index]}</span><b>{scores[index]}</b><small>Tranh suất</small>
          </div>
        ))}
      </aside>

      <section className="play-area">
        <div className="round-banner rose tiebreaker-banner">
          <div>
            <span>CÂU HỎI PHỤ</span>
            <h1>Phân định top 4</h1>
            <p>Chỉ các đội đang hòa điểm ở ranh giới hạng tư tham gia.</p>
          </div>
          <div className="timer-control-panel">
            <CountdownTimer seconds={timeLeft} duration={10} />
            <div className="timer-actions">
              {timerStatus === 'running' ? (
                <button onClick={() => setTimerStatus('paused')}><Pause size={13} /> Tạm dừng</button>
              ) : (
                <button onClick={startTimer} disabled={revealed}>
                  <Play size={13} fill="currentColor" />
                  {timerStatus === 'paused' ? 'Tiếp tục' : 'Bắt đầu'}
                </button>
              )}
              <button onClick={resetTimer} disabled={revealed}><RotateCcw size={13} /> Đặt lại</button>
              <button onClick={timeUpSound.playAlert}><Volume2 size={13} /> Thử âm báo</button>
            </div>
          </div>
        </div>

        <section className="question-panel tiebreaker-question">
          {timeLeft === 0 && <div className="time-up-banner">HẾT GIỜ — CÁC ĐỘI GIƠ ĐÁP ÁN</div>}
          <p className="question-count">CÂU HỎI PHỤ / CHỐT TOP 4</p>
          <h2>{tiebreakerQuestion.q}</h2>
          <div className="answers">
            {tiebreakerQuestion.o.map((option, index) => (
              <div className={'tiebreaker-option ' + (revealed && index === tiebreakerQuestion.a ? 'correct' : '')} key={option}>
                <b>{letters[index]}</b>
                <span>{option}</span>
                {revealed && index === tiebreakerQuestion.a && <Check size={19} />}
              </div>
            ))}
          </div>

          {!revealed && (
            <button className="next-btn" onClick={revealAnswer} disabled={timeLeft !== 0}>
              <Eye size={18} /> Mở đáp án
            </button>
          )}

          {revealed && (
            <>
              <div className="knowledge"><p>{tiebreakerQuestion.note}</p></div>
              <div className="tiebreaker-selection">
                <h3>Chọn {slots} đội vào chung kết</h3>
                <p>MC chọn các đội trả lời đúng nhanh nhất trong nhóm đang hòa điểm.</p>
                <div className="tiebreaker-team-list">
                  {tied.map((index) => (
                    <button
                      aria-pressed={selected.includes(index)}
                      className={selected.includes(index) ? 'selected' : ''}
                      key={index}
                      onClick={() => toggleTeam(index)}
                    >
                      <span>{teams[index]}</span>
                      {selected.includes(index) && <Check size={17} />}
                    </button>
                  ))}
                </div>
                <button className="primary" disabled={selected.length !== slots} onClick={() => onResolve(selected)}>
                  Chốt top 4 <ChevronRight size={17} />
                </button>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  )
}
