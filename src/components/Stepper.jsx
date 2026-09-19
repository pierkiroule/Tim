export function Stepper({ id, label, value, unit, min, max, step, disabled, onChange }) {
  const update = (next) => onChange(Math.min(max, Math.max(min, next)))
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="stepper">
        <button type="button" onClick={() => update(value - step)} disabled={disabled || value <= min} aria-label={`Réduire ${label.toLowerCase()}`}>−</button>
        <input id={id} type="number" value={value} min={min} max={max} step={step} disabled={disabled} onChange={(event) => update(Number(event.target.value))} />
        <button type="button" onClick={() => update(value + step)} disabled={disabled || value >= max} aria-label={`Augmenter ${label.toLowerCase()}`}>+</button>
      </div>
      <span className="field-unit">{unit}</span>
    </div>
  )
}
