import { MAX_DURATION, MAX_SUBJECTS, MIN_DURATION, MIN_SUBJECTS } from '../domain/meeting'
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
        <Stepper id="duration" label="Durée totale" value={meeting.duration} unit="minutes · jusqu’à 8 h" min={MIN_DURATION} max={MAX_DURATION} step={1} disabled={meeting.started} onChange={(duration) => onConfigure(duration, meeting.subjectCount)} />
        <Stepper id="subjects" label="Nombre de sujets" value={meeting.subjectCount} unit="sujets" min={MIN_SUBJECTS} max={MAX_SUBJECTS} step={1} disabled={meeting.started} onChange={(count) => onConfigure(meeting.duration, count)} />
      </div>
      <div className="presets" aria-label="Configurations prédéfinies">
        <span>Formats suggérés</span>
        <div className="preset-list">
          {PRESETS.map((preset) => {
            const active = meeting.duration === preset.duration && meeting.subjectCount === preset.subjectCount
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
