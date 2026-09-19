import { useEffect, useState } from 'react'
import { MAX_PLANNED_PAUSE, MAX_SUBJECTS, MIN_PLANNED_PAUSE, MIN_SUBJECTS } from '../domain/meeting'
import { Stepper } from './Stepper'

function timeValue(timestamp) {
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function timestampForTime(value, now = new Date()) {
  const [hours, minutes] = value.split(':').map(Number)
  const target = new Date(now)
  target.setHours(hours, minutes, 0, 0)
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1)
  return target.getTime()
}

export function Configuration({ meeting, onConfigure }) {
  const [now, setNow] = useState(() => new Date())
  const [expanded, setExpanded] = useState(() => !meeting.started)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    setExpanded(!meeting.started)
  }, [meeting.started])
  const update = (endAt = meeting.endAt, count = meeting.subjectCount, pause = meeting.plannedPauseMinutes) => onConfigure(endAt, count, pause)

  return (
    <section className={`configuration ${expanded ? 'configuration--expanded' : 'configuration--collapsed'}`} aria-label="Configuration de la réunion">
      <div className="configuration-heading">
        <div>
          <span className="eyebrow">Cadrage en temps réel</span>
          <h1>{expanded ? 'Cadrez votre réunion.' : `Fin à ${timeValue(meeting.endAt)}`}</h1>
          {!expanded && <p>{meeting.subjectCount} sujets · {meeting.plannedPauseMinutes} min de pause</p>}
        </div>
        <button className="configuration-toggle" type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} aria-controls="configuration-details">
          {expanded ? 'Réduire le cadrage' : 'Modifier le cadrage'}
          <span aria-hidden="true">⌄</span>
        </button>
      </div>
      <div className="configuration-details" id="configuration-details" hidden={!expanded}>
        <p className="configuration-intro">Il est <strong>{timeValue(now)}</strong> et vous souhaitez terminer à <strong>{timeValue(meeting.endAt)}</strong>. Modifiez le cadrage à tout moment : tout est recalculé instantanément.</p>
        <div className="config-grid">
          <div className="field"><label htmlFor="end-time">Heure de fin</label><input className="time-input" id="end-time" type="time" value={timeValue(meeting.endAt)} disabled={meeting.finished} onChange={(event) => event.target.value && update(timestampForTime(event.target.value))} /><span className="field-unit">aujourd’hui, ou demain si l’heure est passée</span></div>
          <Stepper id="subjects" label="Nombre de sujets" value={meeting.subjectCount} unit={`${meeting.subjects.filter((subject) => subject.done).length} déjà terminé(s) · 100 maximum`} min={Math.max(MIN_SUBJECTS, meeting.subjects.filter((subject) => subject.done).length + (meeting.finished ? 0 : 1))} max={MAX_SUBJECTS} step={1} disabled={meeting.finished} onChange={(count) => update(meeting.endAt, count)} />
          <Stepper id="planned-pause" label="Pause prévue" value={meeting.plannedPauseMinutes} unit="minutes · comprise dans l’heure de fin" min={MIN_PLANNED_PAUSE} max={MAX_PLANNED_PAUSE} step={1} disabled={meeting.finished} onChange={(pause) => update(meeting.endAt, meeting.subjectCount, pause)} />
        </div>
        <div className="demo-config">
          <div><span className="eyebrow">Pour découvrir MikadoTimer</span><strong>Tester un cadrage court</strong><small>Fin dans 4 minutes · 10 sujets · 1 minute de pause</small></div>
          <button className="button button--demo" type="button" disabled={meeting.finished} onClick={() => onConfigure(Date.now() + 4 * 60 * 1000, 10, 1)}>Utiliser le cadrage démo</button>
        </div>
      </div>
    </section>
  )
}
