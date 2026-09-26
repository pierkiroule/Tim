import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createMeeting } from '../domain/meeting'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('displays the configured end time instead of projecting it from the remaining time', () => {
    const meeting = { ...createMeeting(30, 3), endAt: Date.UTC(2030, 0, 1, 12, 34, 56) }
    const expectedEndTime = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(meeting.endAt))

    const html = renderToStaticMarkup(
      <Dashboard meeting={meeting} meetingTime={60} subjectTime={60} impact={0} />,
    )

    expect(html).toContain(`<span>Fin prévue</span><strong>${expectedEndTime}</strong>`)
  })
})
