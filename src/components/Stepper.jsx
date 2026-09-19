import { useEffect, useState } from 'react'

export function Stepper({ id, label, value, unit, min, max, step, disabled, onChange }) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])

  const update = (next) => {
    if (!Number.isFinite(next)) return
    const safeValue = Math.min(max, Math.max(min, next))
    setDraft(String(safeValue))
    onChange(safeValue)
  }

  const commitDraft = () => update(Number(draft))
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="stepper">
        <button type="button" onClick={() => update(value - step)} disabled={disabled || value <= min} aria-label={`Réduire ${label.toLowerCase()}`}>−</button>
        <input id={id} type="number" inputMode="numeric" value={draft} min={min} max={max} step={step} disabled={disabled} onChange={(event) => setDraft(event.target.value)} onBlur={commitDraft} onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()} />
        <button type="button" onClick={() => update(value + step)} disabled={disabled || value >= max} aria-label={`Augmenter ${label.toLowerCase()}`}>+</button>
      </div>
      <span className="field-unit">{unit}</span>
    </div>
  )
}
