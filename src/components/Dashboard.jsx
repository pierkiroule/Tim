import { useEffect, useState } from 'react'
import { formatDelta, formatTime } from '../domain/meeting'

function formatClock(date) {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date)
}

export function Dashboard({ meeting, meetingTime, subjectTime, impact }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const activeNumber = Math.min(meeting.activeIndex + 1, meeting.subjectCount)
  const endTime = new Date(now.getTime() + meetingTime * 1000)
  return (
    <section className="dashboard" aria-label="Indicateurs de la réunion">
      <article className="dashboard-global"><span>Temps global restant</span><strong className={meetingTime < 0 ? 'negative' : ''}>{formatTime(meetingTime, { signed: true })}</strong><small>sur {formatTime(meeting.totalSeconds + meeting.pauseAllowance)}, pause incluse</small></article>
      <article className="dashboard-primary"><span>Sujet en cours</span><strong className={subjectTime < 0 ? 'negative' : ''}>{meeting.finished ? 'Terminé' : formatTime(subjectTime, { signed: true })}</strong><small>{meeting.finished ? `${meeting.subjectCount} sujets traités` : `${activeNumber} sur ${meeting.subjectCount}`}</small></article>
      <article><span>Impact par sujet</span><strong className={impact > 0 ? 'positive' : impact < 0 ? 'negative' : ''}>{formatDelta(impact)}</strong><small>sur les suivants</small></article>
      <article className="dashboard-clock"><span>Heure actuelle</span><strong>{formatClock(now)}</strong></article>
      <article className="dashboard-clock"><span>Fin prévue</span><strong>{meeting.finished ? '—' : formatClock(endTime)}</strong></article>
    </section>
  )
}
