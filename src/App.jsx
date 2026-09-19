import { useEffect } from 'react'
import { activeRemaining, impactPerFuture, meetingRemaining } from './domain/meeting'
import { Assistant } from './components/Assistant'
import { Configuration } from './components/Configuration'
import { Controls } from './components/Controls'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/Header'
import { SolarTimeline } from './components/SolarTimeline'
import { useMeetingTimer } from './hooks/useMeetingTimer'

function statusFor(meeting, remaining) {
  if (meeting.finished) return { label: 'Terminée', tone: 'success' }
  if (!meeting.started) return { label: 'Prête', tone: 'idle' }
  if (remaining < 0) return { label: 'Dépassement', tone: 'alert' }
  return { label: 'En cours', tone: 'running' }
}

export default function App() {
  const { meeting, animationKey, configure, start, next, reset, rename } = useMeetingTimer()
  const remaining = activeRemaining(meeting)
  const totalRemaining = meetingRemaining(meeting)
  const impact = impactPerFuture(meeting)
  const status = statusFor(meeting, remaining)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.matches('input, button')) return
      if (event.code === 'Space' && !meeting.started) { event.preventDefault(); start() }
      if (event.key === 'Enter' && meeting.started && !meeting.finished) next()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [meeting.finished, meeting.started, next, start])

  return (
    <div className="app-shell" id="top">
      <Header status={status.label} tone={status.tone} />
      <main>
        <Configuration meeting={meeting} onConfigure={configure} />
        <Dashboard meeting={meeting} meetingTime={totalRemaining} subjectTime={remaining} impact={impact} />
        <Assistant meeting={meeting} remaining={remaining} />
        <SolarTimeline key={animationKey} meeting={meeting} remaining={remaining} onRename={rename} />
        <Controls meeting={meeting} onStart={start} onNext={next} onReset={reset} />
      </main>
      <footer><span>MicadoTimer</span><span>Le temps partagé, sans perdre le fil.</span><span className="shortcuts">Espace · lancer &nbsp; Entrée · suivant</span></footer>
    </div>
  )
}
