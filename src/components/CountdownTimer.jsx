import { Clock3 } from 'lucide-react'
import './CountdownTimer.css'

export default function CountdownTimer({ seconds, duration, label = 'THỜI GIAN' }) {
  const progress = Math.max(0, Math.min(1, seconds / duration))
  const status = seconds === 0 ? 'expired' : seconds <= 3 ? 'urgent' : ''

  return (
    <div
      className={'countdown-timer ' + status}
      style={{ '--timer-progress': progress * 360 + 'deg' }}
      aria-live="polite"
    >
      <div className="timer-ring">
        <div className="timer-core">
          <Clock3 size={15} />
          <strong>{String(seconds).padStart(2, '0')}</strong>
          <small>{seconds === 0 ? 'HẾT GIỜ' : 'GIÂY'}</small>
        </div>
      </div>
      <span>{label}</span>
    </div>
  )
}
