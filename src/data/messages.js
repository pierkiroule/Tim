export const messages = {
  ready: ['Tout est prêt. Chaque sujet a sa part.', 'Les mikados sont rangés. À vous de jouer.'],
  running: ['Je garde un œil sur le tempo.', 'Tout roule. Restons dans le rythme.'],
  half: ['Mi-chemin. Ce sujet a encore de quoi respirer.', 'La moitié est passée, tout va bien.'],
  closing: ['Dernière ligne droite. Gardons l’essentiel.', 'Ça sent la conclusion…'],
  late: ['On grignote la suite. On atterrit ?', 'Le retard pointe son nez.'],
  finished: ['Tous les sujets sont bouclés. Bien joué !'],
}

export function getAssistantState(meeting, remaining) {
  if (meeting.finished) return 'finished'
  if (!meeting.started) return 'ready'
  if (remaining < 0) return 'late'
  const active = meeting.subjects[meeting.activeIndex]
  const progress = active ? active.spent / Math.max(1, active.allocation) : 0
  if (progress >= 0.8) return 'closing'
  if (progress >= 0.5) return 'half'
  return 'running'
}
