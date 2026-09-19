export const messages = {
  ready: ['Votre tempo est prêt. Lancez-vous, je m’occupe du reste.', 'Les mikados sont en place. À vous de donner l’impulsion.'],
  running: ['Le rythme est juste. Continuez, je garde le cap.', 'Tout est fluide : les idées avancent, le temps reste maîtrisé.'],
  half: ['Mi-parcours atteint. C’est le bon moment pour recentrer.', 'La moitié est passée : gardez de l’espace pour la décision.'],
  closing: ['Dernière ligne droite. Une décision claire, puis on avance.', 'Le temps se resserre : faites émerger l’essentiel.'],
  late: ['La suite a besoin d’air. Concluons en une idée forte.', 'Petit dépassement : une décision, une action, et on repart.'],
  paused: ['Soufflez un instant. Je redistribue ce temps sur les sujets restants.'],
  finished: ['Tout est bouclé. Une réunion rythmée, des décisions bien posées.'],
}

export function getAssistantState(meeting, remaining) {
  if (meeting.finished) return 'finished'
  if (!meeting.started) return 'ready'
  if (meeting.paused) return 'paused'
  if (remaining < 0) return 'late'
  const active = meeting.subjects[meeting.activeIndex]
  const progress = active ? active.spent / Math.max(1, active.allocation) : 0
  if (progress >= 0.8) return 'closing'
  if (progress >= 0.5) return 'half'
  return 'running'
}
