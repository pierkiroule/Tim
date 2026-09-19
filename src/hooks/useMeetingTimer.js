import { useCallback, useEffect, useRef, useState } from 'react'
import { closeActiveSubject, createMeeting, normalizeConfig, tickMeeting } from '../domain/meeting'

export function useMeetingTimer() {
  const [meeting, setMeeting] = useState(() => createMeeting())
  const [animationKey, setAnimationKey] = useState(0)
  const [introKey, setIntroKey] = useState(0)
  const lastTick = useRef(performance.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = performance.now()
      const elapsed = (now - lastTick.current) / 1000
      lastTick.current = now
      setMeeting((current) => tickMeeting(current, elapsed))
    }, 200)
    return () => window.clearInterval(timer)
  }, [])

  const configure = useCallback((duration, subjectCount, pauseMinutes, pauseAfter) => {
    setMeeting((current) => {
      if (current.started) return current
      const config = normalizeConfig(duration, subjectCount, pauseMinutes, pauseAfter)
      return createMeeting(config.duration, config.subjectCount, config.pauseMinutes, config.pauseAfter)
    })
  }, [])

  const start = useCallback(() => {
    lastTick.current = performance.now()
    setMeeting((current) => {
      if (current.started || current.finished) return current
      return { ...current, started: true, running: true }
    })
    setAnimationKey((key) => key + 1)
  }, [])

  const next = useCallback(() => {
    lastTick.current = performance.now()
    setMeeting((current) => closeActiveSubject(current))
  }, [])

  const reset = useCallback(() => {
    lastTick.current = performance.now()
    setMeeting((current) => createMeeting(current.duration, current.subjectCount, current.pauseMinutes, current.pauseAfter))
    setAnimationKey((key) => key + 1)
    setIntroKey((key) => key + 1)
  }, [])

  const rename = useCallback((title) => {
    setMeeting((current) => ({
      ...current,
      subjects: current.subjects.map((subject, index) =>
        index === current.activeIndex ? { ...subject, title } : subject,
      ),
    }))
  }, [])

  const movePause = useCallback((pauseAfter) => {
    setMeeting((current) => current.started ? current : { ...current, pauseAfter: Math.max(0, Math.min(current.subjectCount - 1, pauseAfter)) })
  }, [])

  return { meeting, animationKey, introKey, configure, start, next, reset, rename, movePause }
}
