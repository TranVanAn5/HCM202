import {
  BookOpen,
  Check,
  ChevronRight,
  Flag,
  HelpCircle,
  ListFilter,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import CountdownTimer from '../components/CountdownTimer'
import TeamScoreboard from '../components/TeamScoreboard'
import { letters } from '../data/gameData'
import useTimeUpSound from '../hooks/useTimeUpSound'
import './GamePage.css'
import './HelpPanel.css'
import './TimerControls.css'

const aidOptions = [
  {
    id: 'file',
    label: 'Mở hồ sơ',
    description: 'Hiện dữ kiện gợi ý',
    icon: BookOpen,
  },
  {
    id: 'eliminate',
    label: 'Loại trừ',
    description: 'Ẩn hai phương án sai',
    icon: ListFilter,
  },
]

function RoundIntro({ round, roundIndex, onStart }) {
  return (
    <section className="round-intro">
      <div className="intro-orbit" />
      <span className="intro-icon"><Flag size={25} /></span>
      <p>CHẶNG {String(roundIndex + 1).padStart(2, '0')} / 05</p>
      <h1>{round.era}</h1>
      <strong>{round.dates}</strong>
      <div className="intro-divider" />
      <p className="intro-description">{round.intro}</p>
      <div className="intro-rule">
        <b>10</b>
        <span>giây cho mỗi câu hỏi</span>
      </div>
      <button className="primary start-round-button" onClick={onStart}>
        <Play size={18} fill="currentColor" />
        Bắt đầu chặng
      </button>
    </section>
  )
}

export default function GamePage({
  roundIndex,
  gameRounds,
  questionIndex,
  answerIndex,
  isRevealed,
  onChoose,
  onNext,
  ...scoreboardProps
}) {
  const [showIntro, setShowIntro] = useState(true)
  const [timeLeft, setTimeLeft] = useState(10)
  const [timerStatus, setTimerStatus] = useState('idle')
  const [selectedAidTeam, setSelectedAidTeam] = useState(0)
  const [usedAids, setUsedAids] = useState(() =>
    Array.from({ length: scoreboardProps.teams.length }, () => []),
  )
  const [eliminatedOptions, setEliminatedOptions] = useState([])
  const [aidMessage, setAidMessage] = useState(null)
  const timeUpSound = useTimeUpSound()
  const round = gameRounds[roundIndex]
  const question = round.questions[questionIndex]

  useEffect(() => {
    setShowIntro(true)
    setTimeLeft(10)
    setTimerStatus('idle')
  }, [roundIndex])

  useEffect(() => {
    if (!showIntro) {
      setTimeLeft(10)
      setTimerStatus('idle')
      setEliminatedOptions([])
      setAidMessage(null)
    }
  }, [questionIndex])

  useEffect(() => {
    if (selectedAidTeam >= scoreboardProps.teamCount) {
      setSelectedAidTeam(Math.max(0, scoreboardProps.teamCount - 1))
    }
  }, [selectedAidTeam, scoreboardProps.teamCount])

  useEffect(() => {
    if (
      showIntro ||
      isRevealed ||
      timerStatus !== 'running' ||
      timeLeft <= 0
    ) {
      return undefined
    }
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
  }, [showIntro, isRevealed, timeLeft, timerStatus])

  useEffect(() => {
    if (isRevealed) {
      setTimerStatus((current) => current === 'expired' ? current : 'paused')
    }
  }, [isRevealed])

  const startRound = () => {
    setTimeLeft(10)
    setTimerStatus('idle')
    setShowIntro(false)
  }

  const startTimer = async () => {
    await timeUpSound.unlock()
    if (timeLeft === 0) setTimeLeft(10)
    setTimerStatus('running')
  }

  const pauseTimer = () => {
    setTimerStatus('paused')
  }

  const resetTimer = () => {
    setTimeLeft(10)
    setTimerStatus('idle')
  }

  const useAid = (aidId) => {
    const teamAids = usedAids[selectedAidTeam] || []
    if (isRevealed || teamAids.length >= 2 || teamAids.includes(aidId)) return

    setUsedAids((current) =>
      current.map((items, index) =>
        index === selectedAidTeam ? [...items, aidId] : items,
      ),
    )

    const teamName = scoreboardProps.teams[selectedAidTeam]

    if (aidId === 'file') {
      setAidMessage({
        title: `Hồ sơ dành cho ${teamName}`,
        text: question.note,
      })
    }

    if (aidId === 'eliminate') {
      const wrongOptions = question.o
        .map((_, index) => index)
        .filter((index) => index !== question.a)
        .slice(0, 2)
      setEliminatedOptions(wrongOptions)
      onChoose(null)
      setAidMessage({
        title: `${teamName} đã dùng quyền loại trừ`,
        text: 'Hai phương án sai đã được khóa trên màn hình.',
      })
    }
  }

  const buttonClass = (index) => {
    const selected = answerIndex === index ? 'picked ' : ''
    const correct = isRevealed && index === question.a ? 'correct ' : ''
    const incorrect =
      isRevealed && answerIndex === index && index !== question.a ? 'incorrect' : ''
    return selected + correct + incorrect
  }

  return (
    <main className="game-page">
      <TeamScoreboard {...scoreboardProps} />

      <section className="play-area">
        {showIntro ? (
          <RoundIntro round={round} roundIndex={roundIndex} onStart={startRound} />
        ) : (
          <>
            <div className={'round-banner ' + round.color}>
              <div>
                <span>HỒ SƠ {String(roundIndex + 1).padStart(2, '0')} / 05</span>
                <h1>{round.era}</h1>
                <p>{round.dates}</p>
              </div>
              <div className="timer-control-panel">
                <CountdownTimer seconds={timeLeft} duration={10} />
                <div className="timer-actions">
                  {timerStatus === 'running' ? (
                    <button onClick={pauseTimer}><Pause size={13} /> Tạm dừng</button>
                  ) : (
                    <button onClick={startTimer} disabled={isRevealed}>
                      <Play size={13} fill="currentColor" />
                      {timerStatus === 'paused' ? 'Tiếp tục' : 'Bắt đầu'}
                    </button>
                  )}
                  <button onClick={resetTimer} disabled={isRevealed}><RotateCcw size={13} /> Đặt lại</button>
                  <button onClick={timeUpSound.playAlert}><Volume2 size={13} /> Thử âm báo</button>
                </div>
              </div>
            </div>

            <div className="progress">
              {gameRounds.map((_, index) => (
                <i key={index} className={index <= roundIndex ? 'done' : ''} />
              ))}
            </div>

            <section className="help-panel">
              <div className="help-panel-heading">
                <span><HelpCircle size={17} /> QUYỀN TRỢ GIÚP</span>
                <label>
                  Đội sử dụng
                  <select
                    value={selectedAidTeam}
                    onChange={(event) => setSelectedAidTeam(Number(event.target.value))}
                  >
                    {scoreboardProps.teams
                      .slice(0, scoreboardProps.teamCount)
                      .map((team, index) => (
                        <option value={index} key={index}>{team}</option>
                      ))}
                  </select>
                </label>
                <b>{2 - (usedAids[selectedAidTeam]?.length || 0)} lượt còn lại</b>
              </div>

              <div className="help-actions">
                {aidOptions.map((aid) => {
                  const AidIcon = aid.icon
                  const teamAids = usedAids[selectedAidTeam] || []
                  const isUsed = teamAids.includes(aid.id)
                  const hasNoTurns = teamAids.length >= 2

                  return (
                    <button
                      className={isUsed ? 'used' : ''}
                      disabled={isRevealed || isUsed || hasNoTurns}
                      key={aid.id}
                      onClick={() => useAid(aid.id)}
                    >
                      <AidIcon size={16} />
                      <span><strong>{aid.label}</strong><small>{isUsed ? 'Đã sử dụng' : aid.description}</small></span>
                    </button>
                  )
                })}
              </div>

              {aidMessage && (
                <div className="aid-message">
                  <b>{aidMessage.title}</b>
                  <p>{aidMessage.text}</p>
                </div>
              )}
            </section>

            <article className={'question-panel ' + (timeLeft === 0 ? 'time-ended' : '')}>
              {timeLeft === 0 && <div className="time-up-banner">HẾT GIỜ — CÁC ĐỘI GIƠ ĐÁP ÁN</div>}
              <p className="question-count">
                CÂU HỎI {questionIndex + 1} / {round.questions.length}
              </p>
              <h2>{question.q}</h2>

              <div className="answers">
                {question.o.map((option, index) => (
                  <button
                    disabled={isRevealed || eliminatedOptions.includes(index)}
                    onClick={() => onChoose(index)}
                    key={option}
                    className={buttonClass(index) + (eliminatedOptions.includes(index) ? ' eliminated' : '')}
                  >
                    <b>{letters[index]}</b>
                    <span>{eliminatedOptions.includes(index) ? 'Phương án đã bị loại' : option}</span>
                    {isRevealed && index === question.a && <Check size={19} />}
                  </button>
                ))}
              </div>

              {isRevealed && (
                <div className="knowledge">
                  <BookOpen size={18} />
                  <p>{question.note}</p>
                </div>
              )}

              <button className="next-btn" onClick={onNext}>
                {isRevealed
                  ? roundIndex === 4 && questionIndex === round.questions.length - 1
                    ? 'Chốt top 4'
                    : 'Hồ sơ tiếp theo'
                  : 'Mở đáp án'}
                <ChevronRight size={18} />
              </button>
            </article>

            <p className="host-tip">
              MC chọn phương án sau khi các đội giơ bảng, sau đó bấm “Mở đáp án”.
            </p>
          </>
        )}
      </section>
    </main>
  )
}
