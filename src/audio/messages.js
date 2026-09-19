import { activeRemaining, remainingSubjectCount } from '../domain/meeting'

export const AUDIO_MESSAGES = {
  start: 'Ça commence ! Bonne réunion.',
  pause: 'Bonne pause !',
}

export function formatSpokenDuration(seconds) {
  // Like the visual timer, a partial remaining second is announced as a full second.
  const value = Math.max(0, Math.ceil(Number.isFinite(seconds) ? seconds : 0))
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const remainder = value % 60
  const parts = []
  if (hours) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`)
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
  if (remainder || parts.length === 0) parts.push(`${remainder} seconde${remainder > 1 ? 's' : ''}`)
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} et ${parts[1]}`
  return `${parts[0]}, ${parts[1]} et ${parts[2]}`
}

export function closingMessage(subjectNumber) {
  return `Pensons à conclure le sujet ${subjectNumber}.`
}

export function resumeMessage(meeting) {
  const count = remainingSubjectCount(meeting)
  const duration = formatSpokenDuration(activeRemaining(meeting))
  return count === 1
    ? `Ça redémarre… Il reste une situation avant la fin. Le temps disponible pour cette situation est de ${duration}.`
    : `Ça redémarre… Il reste ${count} situations avant la fin. Le temps disponible pour chaque situation est de ${duration}.`
}
