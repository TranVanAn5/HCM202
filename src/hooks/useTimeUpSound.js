import { useEffect, useRef } from 'react'

export default function useTimeUpSound() {
  const audioContextRef = useRef(null)

  const getContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }

  const unlock = async () => {
    const context = getContext()
    if (context.state === 'suspended') await context.resume()
  }

  const playAlert = async () => {
    const context = getContext()
    if (context.state === 'suspended') await context.resume()

    const masterGain = context.createGain()
    const compressor = context.createDynamicsCompressor()
    const now = context.currentTime

    masterGain.gain.setValueAtTime(0.85, now)
    compressor.threshold.setValueAtTime(-12, now)
    compressor.knee.setValueAtTime(8, now)
    compressor.ratio.setValueAtTime(8, now)
    masterGain.connect(compressor)
    compressor.connect(context.destination)

    ;[0, 0.28, 0.56].forEach((delay, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const startAt = now + delay

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(index === 1 ? 740 : 920, startAt)
      gain.gain.setValueAtTime(0.0001, startAt)
      gain.gain.exponentialRampToValueAtTime(0.48, startAt + 0.015)
      gain.gain.setValueAtTime(0.48, startAt + 0.15)
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.24)

      oscillator.connect(gain)
      gain.connect(masterGain)
      oscillator.start(startAt)
      oscillator.stop(startAt + 0.25)
    })

    window.setTimeout(() => {
      masterGain.disconnect()
      compressor.disconnect()
    }, 1100)
  }

  useEffect(() => {
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  return { unlock, playAlert }
}
