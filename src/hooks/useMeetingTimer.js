import { useCallback, useEffect, useRef, useState } from 'react'
import { closeActiveSubject, createMeeting, normalizeConfig, tickMeeting } from '../domain/meeting'

export function useMeetingTimer() {
  const [meeting, setMeeting] = useState(() => createMeeting())
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

  const configure = useCallback((duration, subjectCount) => {
    setMeeting((current) => {
      if (current.started) return current
      const config = normalizeConfig(duration, subjectCount)
      return createMeeting(config.duration, config.subjectCount)
    })
  }, [])

  const toggle = useCallback(() => {
    lastTick.current = performance.now()
    setMeeting((current) => {
      if (current.finished) return createMeeting(current.duration, current.subjectCount)
      return { ...current, started: true, running: !current.running }
    })
  }, [])

  const next = useCallback(() => {
    lastTick.current = performance.now()
    setMeeting((current) => closeActiveSubject(current))
  }, [])

  const reset = useCallback(() => {
    lastTick.current = performance.now()
    setMeeting((current) => createMeeting(current.duration, current.subjectCount))
  }, [])

  const rename = useCallback((title) => {
    setMeeting((current) => ({
      ...current,
      subjects: current.subjects.map((subject, index) =>
        index === current.activeIndex ? { ...subject, title } : subject,
      ),
    }))
  }, [])

  return { meeting, configure, toggle, next, reset, rename }
}
