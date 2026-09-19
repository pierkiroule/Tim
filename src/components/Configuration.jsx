import { MAX_DURATION, MAX_PLANNED_PAUSE, MAX_SUBJECTS, MIN_DURATION, MIN_PLANNED_PAUSE, MIN_SUBJECTS } from '../domain/meeting'
import { Stepper } from './Stepper'

const PRESETS = [
  { duration: 60, subjectCount: 10 },
  { duration: 90, subjectCount: 15 },
  { duration: 120, subjectCount: 20 },
]

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
      <div className="presets" aria-label="Configurations prédéfinies">
        <span>Formats suggérés</span>
        <div className="preset-list">
          {PRESETS.map((preset) => {
            const active = meeting.duration === preset.duration && meeting.subjectCount === preset.subjectCount && meeting.plannedPauseMinutes === 0
            return (
              <button className={`preset ${active ? 'preset--active' : ''}`} type="button" key={preset.duration} disabled={meeting.started} onClick={() => onConfigure(preset.duration, preset.subjectCount)} aria-pressed={active}>
                <strong>{preset.duration} min</strong><small>{preset.subjectCount} sujets</small>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
