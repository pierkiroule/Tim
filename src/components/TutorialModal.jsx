import { useEffect } from 'react'

const steps = [
  ['Cadrez', 'Choisissez la durée des échanges, le nombre de sujets et la pause prévue.'],
  ['Lancez', 'MikadoTimer répartit automatiquement le temps disponible entre tous les sujets.'],
  ['Gardez le rythme', 'Passez au sujet suivant : l’avance ou le retard est aussitôt redistribué.'],
  ['Faites une pause', 'Le temps prévu est protégé. Au-delà, le dépassement est recalculé en direct.'],
]

export function TutorialModal({ onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="tutorial-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="tutorial-modal" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <button className="tutorial-close" type="button" onClick={onClose} aria-label="Fermer le tutoriel">×</button>
        <span className="eyebrow">Bienvenue sur MikadoTimer</span>
        <h2 id="tutorial-title">Votre réunion, simplement rythmée.</h2>
        <p className="tutorial-lead">Quatre étapes suffisent. MikadoTimer s’occupe de tous les recalculs.</p>
        <ol className="tutorial-steps">
          {steps.map(([title, description], index) => (
            <li key={title}><span>{index + 1}</span><div><strong>{title}</strong><p>{description}</p></div></li>
          ))}
        </ol>
        <button className="button button--primary tutorial-action" type="button" onClick={onClose} autoFocus>J’ai compris, cadrer ma réunion</button>
      </section>
    </div>
  )
}
