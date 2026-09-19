import { describe, expect, it } from 'vitest'
import { createMeeting } from '../domain/meeting'
import { formatSpokenDuration, resumeMessage } from './messages'

describe('spoken messages', () => {
  it.each([
    [0, '0 seconde'], [1, '1 seconde'], [45, '45 secondes'], [60, '1 minute'],
    [61, '1 minute et 1 seconde'], [90, '1 minute et 30 secondes'],
    [270, '4 minutes et 30 secondes'], [3600, '1 heure'],
    [3900, '1 heure et 5 minutes'], [3901, '1 heure, 5 minutes et 1 seconde'],
    [7202, '2 heures et 2 secondes'],
  ])('formats %s seconds for speech', (seconds, expected) => {
    expect(formatSpokenDuration(seconds)).toBe(expected)
  })

  it('rounds partial seconds up like the visual countdown', () => {
    expect(formatSpokenDuration(60.01)).toBe('1 minute et 1 seconde')
  })

  it('uses the singular wording for one remaining situation', () => {
    const meeting = createMeeting(4.5, 1)
    expect(resumeMessage(meeting)).toBe('Ça redémarre… Il reste une situation avant la fin. Le temps disponible pour cette situation est de 5 minutes.')
  })

  it('counts active and future unfinished situations', () => {
    const meeting = createMeeting(9, 3)
    meeting.subjects[0].done = true
    meeting.activeIndex = 1
    expect(resumeMessage(meeting)).toBe('Ça redémarre… Il reste 2 situations avant la fin. Le temps disponible pour chaque situation est de 3 minutes.')
  })
})
