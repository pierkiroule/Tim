import { useEffect, useRef } from 'react'

export function useScreenWakeLock(enabled) {
  const lock = useRef(null)

  useEffect(() => {
    let cancelled = false

    const release = async () => {
      const currentLock = lock.current
      lock.current = null
      if (currentLock && !currentLock.released) await currentLock.release()
    }

    const request = async () => {
      if (!enabled || document.visibilityState !== 'visible' || !navigator.wakeLock || lock.current) return
      try {
        const nextLock = await navigator.wakeLock.request('screen')
        if (cancelled || !enabled) {
          await nextLock.release()
          return
        }
        lock.current = nextLock
        nextLock.addEventListener('release', () => {
          if (lock.current === nextLock) lock.current = null
        })
      } catch {
        // Non sécurisé, économie d'énergie ou API absente : l'horloge murale
        // continue malgré tout à rattraper le temps passé en arrière-plan.
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void release()
    }
  }, [enabled])
}
