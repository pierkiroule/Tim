import { describe, expect, it } from 'vitest'
import { createMeeting, tickMeeting } from '../domain/meeting'
import { baselineAnnouncements, createAnnouncementTracker, detectAnnouncements } from './transitions'

const running = () => ({ ...createMeeting(10, 2, 0), started: true, running: true })

describe('audio announcement transitions', () => {
  it('announces a real start once', () => {
    const tracker = createAnnouncementTracker()
    const idle = createMeeting(10, 2)
    baselineAnnouncements(tracker, idle)
    const started = { ...idle, started: true, running: true }
    expect(detectAnnouncements(tracker, started).map(({ type }) => type)).toEqual(['start'])
    expect(detectAnnouncements(tracker, started)).toEqual([])
  })

  it('distinguishes entering and leaving a pause', () => {
    const tracker = createAnnouncementTracker()
    const meeting = running()
    baselineAnnouncements(tracker, meeting)
    const paused = { ...meeting, paused: true, running: false }
    expect(detectAnnouncements(tracker, paused)[0].type).toBe('pause')
    expect(detectAnnouncements(tracker, { ...paused, paused: false, running: true })[0].type).toBe('resume')
  })

  it('announces 80% only once rather than on every tick', () => {
    const tracker = createAnnouncementTracker()
    const meeting = running()
    baselineAnnouncements(tracker, tickMeeting(meeting, 239))
    const threshold = tickMeeting(meeting, 240)
    expect(detectAnnouncements(tracker, threshold)).toMatchObject([{ type: 'closing', message: 'Pensons à conclure le sujet 1.' }])
    expect(detectAnnouncements(tracker, tickMeeting(meeting, 250))).toEqual([])
  })

  it('baselines activation without announcements or retroactive playback', () => {
    const tracker = createAnnouncementTracker()
    const late = tickMeeting(running(), 310)
    baselineAnnouncements(tracker, late)
    expect(detectAnnouncements(tracker, tickMeeting(late, 1))).toEqual([])
  })

  it('clears closing deduplication after reset for the next meeting', () => {
    const tracker = createAnnouncementTracker()
    const first = running()
    baselineAnnouncements(tracker, tickMeeting(first, 239))
    expect(detectAnnouncements(tracker, tickMeeting(first, 240))).toHaveLength(1)
    const reset = createMeeting(10, 2)
    expect(detectAnnouncements(tracker, reset)).toEqual([])
    const second = { ...reset, started: true, running: true }
    detectAnnouncements(tracker, second)
    detectAnnouncements(tracker, tickMeeting(second, 239))
    expect(detectAnnouncements(tracker, tickMeeting(second, 240))[0].type).toBe('closing')
  })
})
