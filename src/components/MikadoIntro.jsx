import { useEffect, useState } from 'react'

const sticks = [
  [-72, -24, -16, 0],
  [62, -38, 28, 30],
  [-44, 42, 67, 60],
  [58, 30, -48, 90],
  [-12, -55, 12, 120],
  [22, 54, 82, 150],
  [-68, 18, -72, 180],
  [70, 6, 48, 210],
  [-28, -34, 105, 240],
  [35, -18, -105, 270],
  [-8, 35, 34, 300],
  [12, -4, -22, 330],
]

export function MikadoIntro() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setVisible(false), reducedMotion ? 50 : 3200)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="mikado-intro">
      <span className="mikado-intro__orb mikado-intro__orb--one" aria-hidden="true" />
      <span className="mikado-intro__orb mikado-intro__orb--two" aria-hidden="true" />
      <div className="mikado-intro__scene">
        <span className="mikado-intro__kicker">Votre réunion prend forme</span>
        <div className="mikado-intro__sticks" aria-hidden="true">
          {sticks.map(([x, y, start, end], index) => (
            <i
              className={`mikado-intro__stick mikado-intro__stick--${index % 3}`}
              key={end}
              style={{ '--x': `${x}px`, '--y': `${y}px`, '--start': `${start}deg`, '--end': `${end}deg`, '--delay': `${index * 35}ms` }}
            />
          ))}
          <span className="mikado-intro__dial" />
        </div>
        <div className="mikado-intro__brand"><strong>Mikado</strong>Timer</div>
        <p>Chaque idée trouve son temps.</p>
        <span className="mikado-intro__progress" aria-hidden="true" />
      </div>
      <button className="mikado-intro__skip" type="button" onClick={() => setVisible(false)}>Passer l’introduction</button>
    </div>
  )
}
