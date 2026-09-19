import { MAX_DURATION, MAX_PLANNED_PAUSE, MAX_SUBJECTS, MIN_DURATION, MIN_PLANNED_PAUSE, MIN_SUBJECTS } from '../domain/meeting'
import { Stepper } from './Stepper'

export function Configuration({ meeting, onConfigure }) {
  return (
    <section className="configuration" aria-label="Configuration de la réunion">
      <div className="section-heading">
        <div><span className="eyebrow">Avant de commencer</span><h1>Cadrez votre réunion.</h1></div>
        <p>Un temps clair pour chaque sujet, puis une redistribution automatique au fil des échanges.</p>
      </div>
      <div className="config-grid">
        <Stepper id="duration" label="Durée des échanges" value={meeting.duration} unit="minutes · hors pause" min={MIN_DURATION} max={MAX_DURATION} step={1} disabled={meeting.started} onChange={(duration) => onConfigure(duration, meeting.subjectCount, meeting.plannedPauseMinutes)} />
        <Stepper id="subjects" label="Nombre de sujets" value={meeting.subjectCount} unit="de 1 à 100 sujets" min={MIN_SUBJECTS} max={MAX_SUBJECTS} step={1} disabled={meeting.started} onChange={(count) => onConfigure(meeting.duration, count, meeting.plannedPauseMinutes)} />
        <Stepper id="planned-pause" label="Pause prévue" value={meeting.plannedPauseMinutes} unit="minutes · ajoutées à l’heure de fin" min={MIN_PLANNED_PAUSE} max={MAX_PLANNED_PAUSE} step={1} disabled={meeting.started} onChange={(pause) => onConfigure(meeting.duration, meeting.subjectCount, pause)} />
      </div>
      <div className="demo-config">
        <div><span className="eyebrow">Pour découvrir MikadoTimer</span><strong>Tester un cadrage court</strong><small>3 minutes · 10 sujets · 1 minute de pause</small></div>
        <button className="button button--demo" type="button" disabled={meeting.started} onClick={() => onConfigure(3, 10, 1)}>Utiliser le cadrage démo</button>
      </div>
    </section>
  )
}
