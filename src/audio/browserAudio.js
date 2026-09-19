const patterns = {
  start: [[523.25, 0, 0.16], [659.25, 0.13, 0.2]],
  closing: [[783.99, 0, 0.12]],
  pause: [[523.25, 0, 0.12], [440, 0.09, 0.16]],
  resume: [[587.33, 0, 0.1], [698.46, 0.08, 0.12]],
}

export function createBrowserAudio(browser = typeof window === 'undefined' ? undefined : window) {
  let context
  let voice
  let enabled = false
  const sources = new Set()
  const timers = new Set()

  const selectVoice = () => {
    const voices = browser?.speechSynthesis?.getVoices?.() ?? []
    voice = voices.find((candidate) => candidate.lang?.toLowerCase().startsWith('fr'))
  }
  selectVoice()
  browser?.speechSynthesis?.addEventListener?.('voiceschanged', selectVoice)

  function ensureContext() {
    if (context) return context
    const AudioContext = browser?.AudioContext || browser?.webkitAudioContext
    if (!AudioContext) return undefined
    try { context = new AudioContext() } catch { return undefined }
    return context
  }

  function stop() {
    enabled = false
    browser?.speechSynthesis?.cancel?.()
    timers.forEach((timer) => browser.clearTimeout(timer))
    timers.clear()
    sources.forEach((source) => { try { source.stop() } catch { /* déjà arrêté */ } })
    sources.clear()
  }

  function play(type) {
    const audio = context
    if (!audio || !enabled) return 0
    const notes = patterns[type] ?? []
    const now = audio.currentTime
    notes.forEach(([frequency, offset, duration]) => {
      try {
        const oscillator = audio.createOscillator()
        const gain = audio.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(frequency, now + offset)
        gain.gain.setValueAtTime(0.0001, now + offset)
        gain.gain.exponentialRampToValueAtTime(0.055, now + offset + 0.018)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration)
        oscillator.connect(gain).connect(audio.destination)
        sources.add(oscillator)
        oscillator.onended = () => sources.delete(oscillator)
        oscillator.start(now + offset)
        oscillator.stop(now + offset + duration + 0.01)
      } catch { /* Le TTS reste disponible si Web Audio échoue. */ }
    })
    return Math.max(0, ...notes.map(([, offset, duration]) => offset + duration)) * 1000
  }

  function speak(message) {
    if (!enabled || !browser?.speechSynthesis || !browser?.SpeechSynthesisUtterance) return
    try {
      browser.speechSynthesis.cancel()
      const utterance = new browser.SpeechSynthesisUtterance(message)
      utterance.lang = 'fr-FR'
      utterance.rate = 0.95
      if (voice) utterance.voice = voice
      browser.speechSynthesis.speak(utterance)
    } catch { /* Les API navigateur sont optionnelles. */ }
  }

  return {
    arm() { enabled = true },
    activate() {
      enabled = true
      const audio = ensureContext()
      try { audio?.resume?.() } catch { /* activation TTS seule */ }
    },
    announce({ type, message }) {
      if (!enabled) return
      const delay = play(type)
      let timer
      timer = browser?.setTimeout?.(() => { timers.delete(timer); speak(message) }, delay + 35)
      if (timer !== undefined) timers.add(timer)
    },
    stop,
    destroy() {
      stop()
      browser?.speechSynthesis?.removeEventListener?.('voiceschanged', selectVoice)
      try { context?.close?.() } catch { /* rien à nettoyer */ }
    },
  }
}
