import { useRef } from 'react'
import { formatDelta, formatTime, liveAllocation } from '../domain/meeting'

const CENTER = 200
const INNER_RADIUS = 74
const PLAN_RADIUS = 132
const MAX_RADIUS = 164

function point(radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180
  return { x: CENTER + Math.cos(radians) * radius, y: CENTER + Math.sin(radians) * radius }
}

function radiusFor(meeting, seconds) {
  if (seconds <= 0) return INNER_RADIUS
  return Math.min(MAX_RADIUS, INNER_RADIUS + ((PLAN_RADIUS - INNER_RADIUS) * seconds) / meeting.initialShare)
}

function Stick({ meeting, subject, index, active }) {
  const hasPause = meeting.pauseMinutes > 0
  const visualIndex = index + (hasPause && index > meeting.pauseAfter ? 1 : 0)
  const angle = (visualIndex / (meeting.subjects.length + (hasPause ? 1 : 0))) * 360
  const start = point(INNER_RADIUS, angle)
  const plan = point(PLAN_RADIUS, angle)
  const endRadius = subject.done ? radiusFor(meeting, subject.spent) : radiusFor(meeting, liveAllocation(meeting, index))
  const end = point(endRadius, angle)
  const cap = point(MAX_RADIUS, angle)
  const badge = point(MAX_RADIUS + 16, angle)
  const delta = subject.done ? subject.result : liveAllocation(meeting, index) - meeting.initialShare
  const state = subject.done ? 'done' : active ? 'active' : delta > 1 ? 'gain' : delta < -1 ? 'loss' : 'planned'
  const compact = meeting.subjects.length > 24

  return (
    <g className={`stick stick--${state} ${compact ? 'stick--compact' : ''}`} style={{ '--stick-index': index }}>
      <line className="stick-track" x1={start.x} y1={start.y} x2={cap.x} y2={cap.y} />
      <line className="stick-value" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
      <circle className="stick-plan" cx={plan.x} cy={plan.y} r="2.5" />
      <circle className="stick-badge" cx={badge.x} cy={badge.y} r={compact ? 3 : 11} />
      {!compact && <text className="stick-label" x={badge.x} y={badge.y + 0.5}>{subject.done ? '✓' : index + 1}</text>}
      {meeting.subjects.length <= 12 && !active && Math.abs(delta) >= 1 && (
        <text className="stick-delta" x={badge.x} y={badge.y + (badge.y < CENTER ? -17 : 20)}>{formatDelta(delta)}</text>
      )}
    </g>
  )
}

function PauseStick({ meeting, onMovePause, svgRef }) {
  if (!meeting.pauseMinutes) return null
  const totalSticks = meeting.subjects.length + 1
  const angle = ((meeting.pauseAfter + 1) / totalSticks) * 360
  const start = point(INNER_RADIUS, angle)
  const end = point(MAX_RADIUS, angle)
  const badge = point(MAX_RADIUS + 16, angle)

  const move = (event) => {
    if (meeting.started || event.buttons === 0) return
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (!matrix) return
    const cursor = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    const degrees = (Math.atan2(cursor.y - CENTER, cursor.x - CENTER) * 180) / Math.PI + 90
    const normalized = (degrees + 360) % 360
    const slot = Math.round((normalized / 360) * totalSticks) - 1
    onMovePause(Math.max(0, Math.min(meeting.subjectCount - 1, slot)))
  }

  const moveWithKeyboard = (event) => {
    if (meeting.started || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    onMovePause(meeting.pauseAfter + (event.key === 'ArrowRight' ? 1 : -1))
  }

  return (
    <g className={`pause-stick ${meeting.started ? 'pause-stick--locked' : ''}`} role="slider" tabIndex={meeting.started ? -1 : 0} aria-label={`Pause de ${meeting.pauseMinutes} minutes, après le sujet ${meeting.pauseAfter + 1}`} aria-valuemin="1" aria-valuemax={meeting.subjectCount} aria-valuenow={meeting.pauseAfter + 1} onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={move} onKeyDown={moveWithKeyboard}>
      <line className="pause-stick__line" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
      <circle className="pause-stick__badge" cx={badge.x} cy={badge.y} r="13" />
      <text className="pause-stick__icon" x={badge.x} y={badge.y + .5}>Ⅱ</text>
      <text className="pause-stick__label" x={badge.x} y={badge.y + (badge.y < CENTER ? -19 : 23)}>{meeting.pauseMinutes} min</text>
    </g>
  )
}

export function SolarTimeline({ meeting, remaining, onRename, onMovePause }) {
  const svgRef = useRef(null)
  const active = meeting.subjects[meeting.activeIndex]
  const progress = active ? Math.min(100, Math.round((active.spent / Math.max(1, active.allocation)) * 100)) : 100
  return (
    <section className="timeline-card" aria-label="Répartition visuelle du temps">
      <div className="timeline-head">
        <div><span className="eyebrow">Répartition dynamique</span><h2>La réunion en un coup d’œil</h2></div>
        <div className="legend" aria-label="Légende"><span><i className="legend-plan" />Prévu</span><span><i className="legend-live" />Disponible</span><span><i className="legend-gain" />Gagné</span><span><i className="legend-loss" />Perdu</span>{meeting.pauseMinutes > 0 && <span><i className="legend-pause" />Pause à déplacer</span>}</div>
      </div>
      <div className="solar-wrap">
        <svg ref={svgRef} className="solar" viewBox="0 0 400 400" role="img" aria-labelledby="solar-title solar-description">
          <title id="solar-title">Répartition du temps par sujet</title>
          <desc id="solar-description">Chaque rayon représente le temps disponible pour un sujet de la réunion.</desc>
          <circle className="solar-ring solar-ring--outer" cx="200" cy="200" r={PLAN_RADIUS} />
          <circle className="solar-ring solar-ring--inner" cx="200" cy="200" r={INNER_RADIUS} />
          {meeting.subjects.map((subject, index) => <Stick key={subject.id} meeting={meeting} subject={subject} index={index} active={!meeting.finished && index === meeting.activeIndex} />)}
          <PauseStick meeting={meeting} onMovePause={onMovePause} svgRef={svgRef} />
        </svg>
        <div className="hub">
          <span>{meeting.finished ? 'Réunion terminée' : `Sujet ${meeting.activeIndex + 1}`}</span>
          {!meeting.finished && <input value={active?.title ?? ''} onChange={(event) => onRename(event.target.value)} onBlur={(event) => !event.target.value.trim() && onRename(`Sujet ${meeting.activeIndex + 1}`)} aria-label="Titre du sujet actif" maxLength="50" />}
          <strong className={remaining < 0 ? 'negative' : ''}>{meeting.finished ? '✓' : formatTime(remaining, { signed: true })}</strong>
          <small>{meeting.finished ? 'Tous les sujets sont traités' : `${progress}% du budget utilisé`}</small>
        </div>
      </div>
    </section>
  )
}
