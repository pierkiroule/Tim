import { formatDelta, formatTime } from '../domain/meeting'

export function Dashboard({ meeting, meetingTime, subjectTime, impact }) {
  const activeNumber = Math.min(meeting.activeIndex + 1, meeting.subjectCount)
  return (
    <section className="dashboard" aria-label="Indicateurs de la réunion">
      <article><span>Temps réunion</span><strong className={meetingTime < 0 ? 'negative' : ''}>{formatTime(meetingTime, { signed: true })}</strong><small>sur {formatTime(meeting.totalSeconds)}</small></article>
      <article className="dashboard-primary"><span>Sujet en cours</span><strong className={subjectTime < 0 ? 'negative' : ''}>{meeting.finished ? 'Terminé' : formatTime(subjectTime, { signed: true })}</strong><small>{meeting.finished ? `${meeting.subjectCount} sujets traités` : `${activeNumber} sur ${meeting.subjectCount}`}</small></article>
      <article><span>Impact par sujet</span><strong className={impact > 0 ? 'positive' : impact < 0 ? 'negative' : ''}>{formatDelta(impact)}</strong><small>sur les suivants</small></article>
    </section>
  )
}
