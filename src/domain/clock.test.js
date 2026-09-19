import { describe, expect, it } from 'vitest'
import { createMeeting } from './meeting'
import { advanceMeetingTo } from './clock'

describe('meeting wall clock', () => {
  it('catches up after the page was suspended', () => {
    const meeting = { ...createMeeting(30, 3), started: true, running: true }
    const resumed = advanceMeetingTo(meeting, 1_000, 91_000)

    expect(resumed.subjects[0].spent).toBe(90)
  })

  it('counts a pause while the app is in the background', () => {
    const meeting = { ...createMeeting(30, 3), started: true, running: false, paused: true }
    const resumed = advanceMeetingTo(meeting, 10_000, 70_000)

    expect(resumed.pauseSpent).toBe(60)
  })

  it('does not subtract time when the system clock moves backwards', () => {
    const meeting = { ...createMeeting(30, 3), started: true, running: true }

    expect(advanceMeetingTo(meeting, 10_000, 5_000)).toBe(meeting)
  })
})
