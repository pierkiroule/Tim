import { useCallback, useEffect, useRef, useState } from 'react'
import { createBrowserAudio } from '../audio/browserAudio'
import { baselineAnnouncements, createAnnouncementTracker, detectAnnouncements } from '../audio/transitions'

export const AUDIO_STORAGE_KEY = 'mikadotimer:audio:v1'

export function restoreAudioPreference(storage) {
  try {
    const target = storage ?? (typeof window === 'undefined' ? undefined : window.localStorage)
    return target?.getItem(AUDIO_STORAGE_KEY) === 'true'
  } catch { return false }
}

export function persistAudioPreference(enabled, storage) {
  try {
    const target = storage ?? (typeof window === 'undefined' ? undefined : window.localStorage)
    target?.setItem(AUDIO_STORAGE_KEY, String(enabled))
  } catch { /* préférence non persistée */ }
}

export function useAudioMessages(meeting) {
  const [enabled, setEnabled] = useState(restoreAudioPreference)
  const tracker = useRef(createAnnouncementTracker())
  const audio = useRef()

  useEffect(() => {
    const controller = createBrowserAudio()
    audio.current = controller
    baselineAnnouncements(tracker.current, meeting)
    if (enabled) controller.arm()
    return () => {
      controller.destroy()
      if (audio.current === controller) audio.current = undefined
    }
    // Initialiser une seule fois : les transitions sont traitées par l'effet suivant.
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    const unlock = () => audio.current?.activate()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    detectAnnouncements(tracker.current, meeting).forEach((event) => audio.current?.announce(event))
  }, [enabled, meeting])

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current
      baselineAnnouncements(tracker.current, meeting)
      persistAudioPreference(next)
      if (next) audio.current?.activate()
      else audio.current?.stop()
      return next
    })
  }, [meeting])

  return { audioEnabled: enabled, toggleAudio: toggle }
}
