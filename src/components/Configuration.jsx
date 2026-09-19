import { MAX_DURATION, MAX_SUBJECTS, MIN_DURATION, MIN_SUBJECTS } from '../domain/meeting'
import { Stepper } from './Stepper'

export function Configuration({ meeting, onConfigure }) {
  return (
    <section className="configuration" aria-label="Configuration de la réunion">
      <div className="section-heading">
        <div><span className="eyebrow">Avant de commencer</span><h1>Cadrez votre réunion.</h1></div>
        <p>Un temps clair pour chaque sujet, puis une redistribution automatique au fil des échanges.</p>
      </div>
      <div className="config-grid">
        <Stepper id="duration" label="Durée totale" value={meeting.duration} unit="minutes" min={MIN_DURATION} max={MAX_DURATION} step={5} disabled={meeting.started} onChange={(duration) => onConfigure(duration, meeting.subjectCount)} />
        <Stepper id="subjects" label="Nombre de sujets" value={meeting.subjectCount} unit="sujets" min={MIN_SUBJECTS} max={MAX_SUBJECTS} step={1} disabled={meeting.started} onChange={(count) => onConfigure(meeting.duration, count)} />
      </div>
    </section>
  )
}
