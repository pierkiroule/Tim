import { getAssistantState, messages } from '../data/messages'
import { formatTime } from '../domain/meeting'

const stateLabels = {
  ready: 'Prêt à vous guider',
  running: 'Rythme idéal',
  half: 'À mi-parcours',
  closing: 'On conclut',
  late: 'Cap sur l’essentiel',
  finished: 'Mission accomplie',
}

export function Assistant({ meeting, remaining }) {
  const state = getAssistantState(meeting, remaining)
  const message = messages[state][meeting.activeIndex % messages[state].length]
  const tone = ['late'].includes(state) ? 'alert' : ['half', 'closing'].includes(state) ? 'watch' : state === 'finished' ? 'success' : 'calm'
  const active = meeting.subjects[meeting.activeIndex]
  const progress = meeting.finished ? 100 : !meeting.started ? 0 : Math.min(100, Math.round(((active?.spent ?? 0) / Math.max(1, active?.allocation ?? 1)) * 100))
  const detail = meeting.finished
    ? `${meeting.subjectCount} sujets parcourus ensemble.`
    : !meeting.started
      ? 'Je veille au rythme et redistribue chaque minute gagnée.'
      : remaining < 0
        ? `${formatTime(remaining, { signed: true })} au-delà du temps prévu.`
        : `${formatTime(remaining)} pour faire passer l’essentiel.`

  return (
    <aside className={`assistant assistant--${tone}`} style={{ '--assistant-progress': `${progress * 3.6}deg` }} aria-live="polite">
      <div className="assistant-avatar" aria-hidden="true">
        <span className="assistant-spark assistant-spark--one">✦</span><span className="assistant-spark assistant-spark--two">•</span>
        <div className="assistant-face">
          <span className="eye eye-left" /><span className="eye eye-right" /><span className="mouth" />
        </div>
      </div>
      <div className="assistant-copy">
        <div className="assistant-heading"><span className="eyebrow">Mister Time · copilote</span><span className="assistant-state">{stateLabels[state]}</span></div>
        <p key={`${state}-${meeting.activeIndex}`}>{message}</p>
        <small>{detail}</small>
      </div>
    </aside>
  )
}
