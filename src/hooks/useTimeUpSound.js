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

    masterGain.gain.setValueAtTime(0.78, now)
    compressor.threshold.setValueAtTime(-10, now)
    compressor.knee.setValueAtTime(10, now)
    compressor.ratio.setValueAtTime(6, now)
    masterGain.connect(compressor)
    compressor.connect(context.destination)

    const alarmPartials = [
      { ratio: 1, volume: 0.48 },
      { ratio: 1.48, volume: 0.25 },
      { ratio: 2.16, volume: 0.12 },
    ]

    ;[0, 0.17, 0.34].forEach((delay, strikeIndex) => {
      const startAt = now + delay
      const fundamental = strikeIndex % 2 === 0 ? 1050 : 1220

      alarmPartials.forEach((partial, partialIndex) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const duration = 0.14

        oscillator.type = partialIndex === 0 ? 'triangle' : 'sine'
        oscillator.frequency.setValueAtTime(fundamental * partial.ratio, startAt)
        oscillator.detune.setValueAtTime(partialIndex % 2 === 0 ? -3 : 3, startAt)
        gain.gain.setValueAtTime(0.0001, startAt)
        gain.gain.exponentialRampToValueAtTime(partial.volume, startAt + 0.006)
        gain.gain.setValueAtTime(partial.volume * 0.82, startAt + 0.055)
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
    }, 850)
  }

  useEffect(() => {
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  return { unlock, playAlert }
}
