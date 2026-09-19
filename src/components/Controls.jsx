import { useEffect, useState } from 'react'

export function Controls({ meeting, onStart, onNext, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!confirmReset) return undefined
    const timer = window.setTimeout(() => setConfirmReset(false), 3000)
    return () => window.clearTimeout(timer)
  }, [confirmReset])

  const reset = () => {
    if (meeting.started && !meeting.finished && !confirmReset) return setConfirmReset(true)
    setConfirmReset(false)
    onReset()
  }

  return (
    <div className="control-bar">
      {!meeting.started && <button className="button button--secondary" type="button" onClick={onStart}>▶  Lancer la réunion</button>}
      {!meeting.finished && <button className={`button button--primary ${meeting.started ? 'button--wide' : ''}`} type="button" onClick={onNext} disabled={!meeting.started}>{meeting.activeIndex === meeting.subjects.length - 1 ? 'Terminer la réunion  ✓' : 'Sujet suivant  →'}</button>}
      {meeting.finished && <button className="button button--primary button--wide" type="button" onClick={onReset}>Préparer une nouvelle réunion</button>}
      {!meeting.finished && <button className={`reset-button ${confirmReset ? 'reset-button--confirm' : ''}`} type="button" onClick={reset}>{confirmReset ? 'CONFIRMER L’EFFACEMENT' : 'EFFACER ET RÉINITIALISER MIKADOTIMER'}</button>}
    </div>
  )
}
