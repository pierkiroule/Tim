import { useCallback, useEffect, useRef, useState } from 'react'
import { activeRemaining, impactPerFuture, meetingRemaining } from './domain/meeting'
import { Assistant } from './components/Assistant'
import { Configuration } from './components/Configuration'
import { Controls } from './components/Controls'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/Header'
import { MikadoIntro } from './components/MikadoIntro'
import { SolarTimeline } from './components/SolarTimeline'
import { TutorialModal } from './components/TutorialModal'
import { useMeetingTimer } from './hooks/useMeetingTimer'

function statusFor(meeting, remaining) {
  if (meeting.finished) return { label: 'Terminée', tone: 'success' }
  if (!meeting.started) return { label: 'Prête', tone: 'idle' }
  if (meeting.paused) return { label: 'En pause', tone: 'paused' }
  if (remaining < 0) return { label: 'Dépassement', tone: 'alert' }
  return { label: 'En cours', tone: 'running' }
}

export default function App() {
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const tutorialShown = useRef(false)
  const { meeting, animationKey, introKey, configure, start, togglePause, next, reset, rename } = useMeetingTimer()
  const remaining = activeRemaining(meeting)
  const totalRemaining = meetingRemaining(meeting)
  const impact = impactPerFuture(meeting)
  const status = statusFor(meeting, remaining)
  const showTutorial = useCallback(() => {
    if (tutorialShown.current) return
    tutorialShown.current = true
    setTutorialOpen(true)
  }, [])
  const closeTutorial = useCallback(() => setTutorialOpen(false), [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.matches('input, button')) return
      if (event.code === 'Space') { event.preventDefault(); meeting.started ? togglePause() : start() }
      if (event.key === 'Enter' && meeting.started && !meeting.paused && !meeting.finished) next()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [meeting.finished, meeting.paused, meeting.started, next, start, togglePause])

  return (
    <div className="app-shell" id="top">
      <MikadoIntro key={introKey} onComplete={showTutorial} />
      {tutorialOpen && <TutorialModal onClose={closeTutorial} />}
      <Header status={status.label} tone={status.tone} />
      <main>
        <Configuration meeting={meeting} onConfigure={configure} />
        <Dashboard meeting={meeting} meetingTime={totalRemaining} subjectTime={remaining} impact={impact} />
        <Assistant meeting={meeting} remaining={remaining} />
        <SolarTimeline key={animationKey} meeting={meeting} remaining={remaining} onRename={rename} />
        <Controls meeting={meeting} onStart={start} onTogglePause={togglePause} onNext={next} onReset={reset} />
      </main>
      <footer><span>MikadoTimer</span><span>Le temps partagé, sans perdre le fil.</span><span className="shortcuts">Espace · pause / reprise &nbsp; Entrée · suivant</span></footer>
    </div>
  )
}
