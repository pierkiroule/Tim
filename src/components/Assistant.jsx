import { getAssistantState, messages } from '../data/messages'

export function Assistant({ meeting, remaining }) {
  const state = getAssistantState(meeting, remaining)
  const message = messages[state][meeting.activeIndex % messages[state].length]
  const tone = ['late'].includes(state) ? 'alert' : ['half', 'closing'].includes(state) ? 'watch' : state === 'finished' ? 'success' : 'calm'

  return (
    <aside className={`assistant assistant--${tone}`} aria-live="polite">
      <div className="assistant-face" aria-hidden="true">
        <span className="eye eye-left" /><span className="eye eye-right" /><span className="mouth" />
      </div>
      <div><span className="eyebrow">Mister Timer · copilote</span><p>{message}</p></div>
    </aside>
  )
}
