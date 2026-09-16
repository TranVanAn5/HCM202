import { useEffect, useRef } from 'react'

const NOTES = [110, 130.81, 146.83, 164.81, 146.83, 130.81]
const MASTER_VOLUME = 0.8

export default function useTensionMusic() {
  const audioContextRef = useRef(null)
  const masterGainRef = useRef(null)
  const intervalRef = useRef(null)
  const droneRef = useRef(null)
  const stepRef = useRef(0)

  const getContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }

  const getMasterGain = () => {
    const context = getContext()
    if (!masterGainRef.current) {
      const masterGain = context.createGain()
      masterGain.gain.setValueAtTime(MASTER_VOLUME, context.currentTime)
      masterGain.connect(context.destination)
      masterGainRef.current = masterGain
    }
    return masterGainRef.current
  }

  const playPulse = () => {
    const context = getContext()
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(NOTES[stepRef.current % NOTES.length], now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)

    oscillator.connect(gain)
    gain.connect(getMasterGain())
    oscillator.start(now)
    oscillator.stop(now + 0.3)
    stepRef.current += 1
  }

  const start = async () => {
    if (intervalRef.current) return
    const context = getContext()
    if (context.state === 'suspended') await context.resume()

    const drone = context.createOscillator()
    const droneGain = context.createGain()
    drone.type = 'sine'
    drone.frequency.setValueAtTime(55, context.currentTime)
    droneGain.gain.setValueAtTime(0.11, context.currentTime)
    drone.connect(droneGain)
    droneGain.connect(getMasterGain())
    drone.start()
    droneRef.current = { oscillator: drone, gain: droneGain }

    playPulse()
    intervalRef.current = window.setInterval(playPulse, 480)
  }

  const preview = async () => {
    const context = getContext()
    if (context.state === 'suspended') await context.resume()
    const now = context.currentTime

    ;[110, 146.83, 196].forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = index === 0 ? 'sine' : 'triangle'
      oscillator.frequency.setValueAtTime(frequency, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.2 : 0.12, now + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)
      oscillator.connect(gain)
      gain.connect(getMasterGain())
      oscillator.start(now)
      oscillator.stop(now + 0.95)
    })
  }

  const stop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (droneRef.current) {
      const { oscillator, gain } = droneRef.current
      const now = audioContextRef.current?.currentTime || 0
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
      oscillator.stop(now + 0.14)
      droneRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stop()
      masterGainRef.current?.disconnect()
      audioContextRef.current?.close()
    }
  }, [])

  return { start, stop, preview }
}
