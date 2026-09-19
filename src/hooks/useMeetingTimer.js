import { useCallback, useEffect, useRef, useState } from 'react'
import { closeActiveSubject, createMeeting, reframeMeeting, tickMeeting } from '../domain/meeting'
import { advanceMeetingTo } from '../domain/clock'
import { useScreenWakeLock } from './useScreenWakeLock'

const STORAGE_KEY = 'mikadotimer:meeting:v1'

function restoreMeeting() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    if (!saved?.meeting || !Array.isArray(saved.meeting.subjects)) return createMeeting()
    const meeting = saved.meeting
    const valid = Number.isFinite(meeting.totalSeconds)
      && meeting.subjects.length === meeting.subjectCount
      && meeting.activeIndex >= 0
      && meeting.activeIndex < meeting.subjects.length
    if (!valid) return createMeeting()
    if (!Number.isFinite(meeting.endAt)) meeting.endAt = Date.now() + Math.max(0, meeting.totalSeconds + meeting.pauseAllowance - meeting.pauseSpent - meeting.subjects.reduce((sum, subject) => sum + subject.spent, 0)) * 1000
    const elapsed = meeting.running && !meeting.finished
      ? Math.max(0, (Date.now() - Number(saved.savedAt || Date.now())) / 1000)
      : 0
    return tickMeeting(meeting, elapsed)
  } catch {
    return createMeeting()
  }
}

export function useMeetingTimer() {
  const [meeting, setMeeting] = useState(restoreMeeting)
  const [animationKey, setAnimationKey] = useState(0)
  const [introKey, setIntroKey] = useState(0)
  const lastTick = useRef(Date.now())
  const meetingRef = useRef(meeting)

  meetingRef.current = meeting
  useScreenWakeLock(meeting.started && !meeting.finished)

  useEffect(() => {
    const advance = () => {
      const now = Date.now()
      setMeeting((current) => {
        const advanced = advanceMeetingTo(current, lastTick.current, now)
        meetingRef.current = advanced
        return advanced
      })
      lastTick.current = now
    }
    const persistLatest = () => {
      advance()
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ meeting: meetingRef.current, savedAt: Date.now() }))
      } catch {
        // La sauvegarde de sortie est facultative.
      }
    }
    const handleVisibilityChange = () => advance()
    const timer = window.setInterval(advance, 200)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pageshow', advance)
    window.addEventListener('pagehide', persistLatest)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pageshow', advance)
      window.removeEventListener('pagehide', persistLatest)
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ meeting, savedAt: Date.now() }))
    } catch {
      // Le chronomètre reste utilisable lorsque le stockage privé est indisponible.
    }
  }, [meeting])

  const configure = useCallback((endAt, subjectCount, plannedPauseMinutes) => {
    setMeeting((current) => reframeMeeting(current, endAt, subjectCount, plannedPauseMinutes))
  }, [])

  const start = useCallback(() => {
    lastTick.current = Date.now()
    setMeeting((current) => {
      if (current.started || current.finished) return current
      return { ...reframeMeeting(current, current.endAt, current.subjectCount, current.plannedPauseMinutes), started: true, running: true }
    })
    setAnimationKey((key) => key + 1)
  }, [])

  const next = useCallback(() => {
    lastTick.current = Date.now()
    setMeeting((current) => closeActiveSubject(current))
  }, [])

  const togglePause = useCallback(() => {
    lastTick.current = Date.now()
    setMeeting((current) => current.started && !current.finished
      ? { ...current, paused: !current.paused, running: current.paused }
      : current)
  }, [])

  const reset = useCallback(() => {
    lastTick.current = Date.now()
    setMeeting((current) => createMeeting(current.duration, current.subjectCount, current.plannedPauseMinutes))
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

  return { meeting, animationKey, introKey, configure, start, togglePause, next, reset, rename }
}
