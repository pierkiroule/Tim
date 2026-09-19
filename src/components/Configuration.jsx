import { MAX_DURATION, MAX_SUBJECTS, MIN_DURATION, MIN_PAUSE, MIN_SUBJECTS } from '../domain/meeting'
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
        <Stepper id="duration" label="Durée totale" value={meeting.duration} unit="minutes · pause incluse" min={MIN_DURATION} max={MAX_DURATION} step={1} disabled={meeting.started} onChange={(duration) => onConfigure(duration, meeting.subjectCount, Math.min(meeting.pauseMinutes, duration - 1), meeting.pauseAfter)} />
        <Stepper id="subjects" label="Nombre de sujets" value={meeting.subjectCount} unit="sujets" min={MIN_SUBJECTS} max={MAX_SUBJECTS} step={1} disabled={meeting.started} onChange={(count) => onConfigure(meeting.duration, count, meeting.pauseMinutes, Math.min(meeting.pauseAfter, count - 1))} />
        <Stepper id="pause" label="Temps de pause" value={meeting.pauseMinutes} unit={meeting.pauseMinutes ? `${meeting.pauseMinutes} min soustraites aux sujets` : 'aucune pause'} min={MIN_PAUSE} max={Math.max(0, meeting.duration - 1)} step={1} disabled={meeting.started} onChange={(pause) => onConfigure(meeting.duration, meeting.subjectCount, pause, meeting.pauseAfter)} />
      </div>
      <div className="presets" aria-label="Configurations prédéfinies">
        <span>Formats suggérés</span>
        <div className="preset-list">
          {PRESETS.map((preset) => {
            const active = meeting.duration === preset.duration && meeting.subjectCount === preset.subjectCount && meeting.pauseMinutes === 0
            return (
              <button className={`preset ${active ? 'preset--active' : ''}`} type="button" key={preset.duration} disabled={meeting.started} onClick={() => onConfigure(preset.duration, preset.subjectCount, 0)} aria-pressed={active}>
                <strong>{preset.duration} min</strong><small>{preset.subjectCount} sujets</small>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
