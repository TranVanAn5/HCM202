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

    masterGain.gain.setValueAtTime(0.72, now)
    compressor.threshold.setValueAtTime(-10, now)
    compressor.knee.setValueAtTime(10, now)
    compressor.ratio.setValueAtTime(6, now)
    masterGain.connect(compressor)
    compressor.connect(context.destination)

    const alarmPartials = [
      { frequency: 780, volume: 0.42, decay: 0.19 },
      { frequency: 1187, volume: 0.24, decay: 0.16 },
      { frequency: 2385, volume: 0.13, decay: 0.13 },
      { frequency: 3190, volume: 0.07, decay: 0.1 },
    ]

    ;[0, 0.24, 0.48].forEach((delay, strikeIndex) => {
      const startAt = now + delay

      alarmPartials.forEach((partial, partialIndex) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const duration = partial.decay

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(
          partial.frequency + (strikeIndex % 2 === 0 ? 9 : -11),
          startAt,
        )
        oscillator.detune.setValueAtTime(partialIndex % 2 === 0 ? -5 : 5, startAt)
        gain.gain.setValueAtTime(0.0001, startAt)
        gain.gain.exponentialRampToValueAtTime(partial.volume, startAt + 0.003)
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

        oscillator.connect(gain)
        gain.connect(masterGain)
        oscillator.start(startAt)
        oscillator.stop(startAt + duration + 0.04)
      })

      const noiseLength = Math.floor(context.sampleRate * 0.035)
      const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      const noiseSource = context.createBufferSource()
      const noiseFilter = context.createBiquadFilter()
      const noiseGain = context.createGain()

      for (let sample = 0; sample < noiseLength; sample += 1) {
        noiseData[sample] = (Math.random() * 2 - 1) * (1 - sample / noiseLength)
      }

      noiseSource.buffer = noiseBuffer
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.setValueAtTime(2700, startAt)
      noiseFilter.Q.setValueAtTime(0.9, startAt)
      noiseGain.gain.setValueAtTime(0.2, startAt)
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.04)
      noiseSource.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(masterGain)
      noiseSource.start(startAt)
    })

    window.setTimeout(() => {
      masterGain.disconnect()
      compressor.disconnect()
    }, 950)
  }

  useEffect(() => {
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  return { unlock, playAlert }
}
