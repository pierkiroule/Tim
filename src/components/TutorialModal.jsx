import { useEffect } from 'react'

function TutorialIcon({ name }) {
  const paths = {
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
    play: <><circle cx="12" cy="12" r="8" /><path d="m10 9 5 3-5 3Z" /></>,
    next: <><path d="M5 7.5h7a4.5 4.5 0 0 1 0 9H7" /><path d="m9 13-3 3.5L9 20M16 8l3 4-3 4" /></>,
    pause: <><circle cx="12" cy="12" r="8" /><path d="M10 9v6M14 9v6" /></>,
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  )
}

const steps = [
  {
    icon: 'clock',
    title: 'Fixez l’heure de fin',
    description: 'Indiquez quand la réunion doit se terminer, puis ajoutez le nombre de sujets et la pause prévue.',
  },
  {
    icon: 'play',
    title: 'Lancez la réunion',
    description: 'MikadoTimer calcule le temps disponible jusqu’à l’heure de fin et le partage entre les sujets.',
  },
  {
    icon: 'next',
    title: 'Avancez sujet par sujet',
    description: 'Validez chaque sujet dès qu’il est terminé. L’avance ou le retard est redistribué immédiatement.',
  },
  {
    icon: 'pause',
    title: 'Gardez la pause',
    description: 'Mettez la réunion en pause : le créneau prévu est protégé et tout dépassement est recalculé en direct.',
  },
]

export function TutorialModal({ onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="tutorial-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="tutorial-modal" role="dialog" aria-modal="true" aria-labelledby="tutorial-title" aria-describedby="tutorial-lead">
        <button className="tutorial-close" type="button" onClick={onClose} aria-label="Fermer le tutoriel">×</button>
        <span className="eyebrow">Bienvenue sur MikadoTimer</span>
        <h2 id="tutorial-title">Terminez à l’heure, sans calculer.</h2>
        <p className="tutorial-lead" id="tutorial-lead">Donnez votre heure de fin : MikadoTimer orchestre le reste en quatre étapes simples.</p>
        <ol className="tutorial-steps">
          {steps.map(({ icon, title, description }, index) => (
            <li key={title}>
              <span className="tutorial-step-icon"><TutorialIcon name={icon} /></span>
              <div>
                <small>Étape {index + 1}</small>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <button className="button button--primary tutorial-action" type="button" onClick={onClose} autoFocus>J’ai compris, cadrer ma réunion</button>
      </section>
    </div>
  )
}
