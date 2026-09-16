import { useEffect, useRef } from 'react'

const ALERT_DURATION = 2500
const ALERT_VOLUME = 0.95

export default function useTimeUpSound() {
  const audioRef = useRef(null)
  const stopTimerRef = useRef(null)

  const getAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio('/audio/classic-phone-bell.mp3')
      audio.preload = 'auto'
      audio.volume = ALERT_VOLUME
      audioRef.current = audio
    }

    return audioRef.current
  }

  const stopAlert = () => {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const unlock = async () => {
    const audio = getAudio()

    try {
      audio.muted = true
      await audio.play()
      audio.pause()
      audio.currentTime = 0
      audio.muted = false
    } catch {
      audio.muted = false
    }
  }

  const playAlert = async () => {
    const audio = getAudio()
    stopAlert()
    audio.muted = false
    audio.volume = ALERT_VOLUME

    try {
      await audio.play()
      stopTimerRef.current = window.setTimeout(stopAlert, ALERT_DURATION)
    } catch {
      // Trình duyệt có thể chặn âm thanh nếu người dùng chưa tương tác với trang.
    }
  }

  useEffect(() => stopAlert, [])

  return { unlock, playAlert }
}
