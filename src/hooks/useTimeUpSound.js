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

    masterGain.gain.setValueAtTime(0.76, now)
    compressor.threshold.setValueAtTime(-10, now)
    compressor.knee.setValueAtTime(10, now)
    compressor.ratio.setValueAtTime(6, now)
    masterGain.connect(compressor)
    compressor.connect(context.destination)

    const bellPartials = [
      { ratio: 1, volume: 0.58, decay: 1.65 },
      { ratio: 2.01, volume: 0.3, decay: 1.25 },
      { ratio: 2.93, volume: 0.17, decay: 0.95 },
      { ratio: 4.16, volume: 0.09, decay: 0.68 },
    ]

    ;[0, 0.72].forEach((delay, strikeIndex) => {
      const startAt = now + delay
      const fundamental = strikeIndex === 0 ? 720 : 660

      bellPartials.forEach((partial, partialIndex) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const duration = partial.decay + (strikeIndex * 0.08)

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(fundamental * partial.ratio, startAt)
        oscillator.detune.setValueAtTime(partialIndex % 2 === 0 ? -3 : 3, startAt)
        gain.gain.setValueAtTime(0.0001, startAt)
        gain.gain.exponentialRampToValueAtTime(partial.volume, startAt + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

        oscillator.connect(gain)
        gain.connect(masterGain)
        oscillator.start(startAt)
        oscillator.stop(startAt + duration + 0.04)
      })
    })

    window.setTimeout(() => {
      masterGain.disconnect()
      compressor.disconnect()
    }, 2800)
  }

  useEffect(() => {
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  return { unlock, playAlert }
}
