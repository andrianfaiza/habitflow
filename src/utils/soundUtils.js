// Completion sound effect.
// Uses the Web Audio API to synthesize a short chime, so no audio files or
// extra libraries are required.

let audioContext = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!audioContext) audioContext = new AudioCtx()
  return audioContext
}

// Plays a single note with a soft attack and exponential release.
function playNote(context, frequency, startTime, duration) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  oscillator.connect(gain)
  gain.connect(context.destination)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

// Plays a pleasant two-note "ding" when a task or habit is completed.
export function playCompletionSound() {
  const context = getAudioContext()
  if (!context) return
  if (context.state === 'suspended') context.resume()

  const now = context.currentTime
  playNote(context, 659.25, now, 0.16) // E5
  playNote(context, 987.77, now + 0.09, 0.24) // B5
}
