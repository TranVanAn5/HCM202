import {
  BookOpen,
  Check,
  ChevronRight,
  Flag,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import CountdownTimer from '../components/CountdownTimer'
import TeamScoreboard from '../components/TeamScoreboard'
import { letters } from '../data/gameData'
import useTensionMusic from '../hooks/useTensionMusic'
import './GamePage.css'
import './TimerControls.css'

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
  const [musicEnabled, setMusicEnabled] = useState(true)
  const music = useTensionMusic()
  const round = gameRounds[roundIndex]
  const question = round.questions[questionIndex]

  useEffect(() => {
    setShowIntro(true)
    setTimeLeft(10)
    setTimerStatus('idle')
    music.stop()
  }, [roundIndex])

  useEffect(() => {
    if (!showIntro) {
      setTimeLeft(10)
      setTimerStatus('idle')
      music.stop()
    }
  }, [questionIndex])

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
          music.stop()
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
      music.stop()
    }
  }, [isRevealed])

  const startRound = () => {
    setTimeLeft(10)
    setTimerStatus('idle')
    setShowIntro(false)
  }

  const startTimer = () => {
    if (timeLeft === 0) setTimeLeft(10)
    setTimerStatus('running')
    if (musicEnabled) music.start()
  }

  const pauseTimer = () => {
    setTimerStatus('paused')
    music.stop()
  }

  const resetTimer = () => {
    setTimeLeft(10)
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
                  <button onClick={music.preview}><Volume2 size={13} /> Thử nhạc</button>
                  <button onClick={toggleMusic}>
                    {musicEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                    {musicEnabled ? 'Nhạc bật' : 'Nhạc tắt'}
                  </button>
                </div>
              </div>
            </div>

            <div className="progress">
              {gameRounds.map((_, index) => (
                <i key={index} className={index <= roundIndex ? 'done' : ''} />
              ))}
            </div>

            <article className={'question-panel ' + (timeLeft === 0 ? 'time-ended' : '')}>
              {timeLeft === 0 && <div className="time-up-banner">HẾT GIỜ — CÁC ĐỘI GIƠ ĐÁP ÁN</div>}
              <p className="question-count">
                CÂU HỎI {questionIndex + 1} / {round.questions.length}
              </p>
              <h2>{question.q}</h2>

              <div className="answers">
                {question.o.map((option, index) => (
                  <button
                    disabled={isRevealed}
                    onClick={() => onChoose(index)}
                    key={option}
                    className={buttonClass(index)}
                  >
                    <b>{letters[index]}</b>
                    <span>{option}</span>
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
                    ? 'Đến vòng chung kết'
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
