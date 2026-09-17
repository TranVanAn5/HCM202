import { useState } from 'react'
import Nav from './components/Nav'
import { createGameRounds } from './data/gameData'
import { getQualification } from './data/qualification'
import FinalPage from './pages/FinalPage'
import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'
import KnowledgeSlidesPage from './pages/KnowledgeSlidesPage'
import RulesPage from './pages/RulesPage'
import TiebreakerPage from './pages/TiebreakerPage'

export default function App() {
  const [page, setPage] = useState('home')
  const [pageKey, setPageKey] = useState(0)
  const [roundIndex, setRoundIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answerIndex, setAnswerIndex] = useState(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [gameRounds, setGameRounds] = useState(createGameRounds)
  const [scores, setScores] = useState([0, 0, 0, 0, 0, 0])
  const [teams, setTeams] = useState([
    'Sao Vàng',
    'Việt Minh',
    'Độc Lập',
    'Hòa Bình',
    'Đoàn Kết',
    'Tiên Phong',
  ])
  const [teamCount, setTeamCount] = useState(4)
  const [timelineResult, setTimelineResult] = useState(null)
  const [qualification, setQualification] = useState(null)
  const [finalistIndices, setFinalistIndices] = useState(null)

  const startGame = () => {
    setRoundIndex(0); setQuestionIndex(0); setAnswerIndex(null); setIsRevealed(false)
    setGameRounds(createGameRounds())
    setScores([0, 0, 0, 0, 0, 0]); setTimelineResult(null)
    setQualification(null); setFinalistIndices(null)
    navigateTo('game')
  }

  const navigateTo = (nextPage) => {
    setPage(nextPage)
    setPageKey((current) => current + 1)
  }

  const advanceGame = () => {
    if (!isRevealed) return setIsRevealed(true)
    if (questionIndex + 1 < gameRounds[roundIndex].questions.length) {
      setQuestionIndex(questionIndex + 1)
    } else if (roundIndex + 1 < gameRounds.length) {
      setRoundIndex(roundIndex + 1); setQuestionIndex(0)
    } else {
      const nextQualification = getQualification(scores, teamCount)
      if (nextQualification.finalists) {
        setFinalistIndices(nextQualification.finalists)
        navigateTo('final')
      } else {
        setQualification(nextQualification)
        navigateTo('tiebreaker')
      }
    }
    setAnswerIndex(null); setIsRevealed(false)
  }

  const addScore = (teamIndex, amount) => {
    setScores((current) => current.map((score, index) => index === teamIndex ? Math.max(0, score + amount) : score))
  }

  const sharedProps = { teams, setTeams, teamCount, setTeamCount, scores, addScore }
  const resolveTiebreaker = (winners) => {
    setFinalistIndices([...qualification.secured, ...winners])
    navigateTo('final')
  }
  return (
    <div className="app-shell">
      <Nav page={page} onNavigate={navigateTo} onStart={startGame} />
      <div key={pageKey} className="page-transition">
        {page === 'home' && <HomePage onStart={startGame} onRules={() => navigateTo('rules')} />}
        {page === 'rules' && <RulesPage onStart={startGame} />}
        {page === 'knowledge' && <KnowledgeSlidesPage />}
        {page === 'game' && <GamePage {...sharedProps} gameRounds={gameRounds} roundIndex={roundIndex} questionIndex={questionIndex} answerIndex={answerIndex} isRevealed={isRevealed} onChoose={setAnswerIndex} onNext={advanceGame} />}
        {page === 'tiebreaker' && qualification && <TiebreakerPage teams={teams} scores={scores} qualification={qualification} onResolve={resolveTiebreaker} />}
        {page === 'final' && <FinalPage {...sharedProps} finalistIndices={finalistIndices} result={timelineResult} setResult={setTimelineResult} onRestart={startGame} />}
      </div>
    </div>
  )
}
