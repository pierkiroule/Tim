import { describe, expect, it } from 'vitest'
import {
  closeActiveSubject,
  createMeeting,
  formatDelta,
  formatTime,
  liveAllocation,
  normalizeConfig,
  tickMeeting,
} from './meeting'

describe('meeting domain', () => {
  it('normalizes unsafe configuration values', () => {
    expect(normalizeConfig(0, 101, 50, 200)).toEqual({ duration: 1, subjectCount: 100, pauseMinutes: 0, pauseAfter: 99 })
  })

  it('starts with a one-minute meeting split into six subjects', () => {
    const meeting = createMeeting()
    expect(meeting.duration).toBe(1)
    expect(meeting.subjectCount).toBe(6)
    expect(meeting.subjects).toHaveLength(6)
  })

  it('allocates the budget equally', () => {
    const meeting = createMeeting(30, 3)
    expect(meeting.subjects.map((subject) => subject.allocation)).toEqual([600, 600, 600])
  })

  it('subtracts the configured pause from subject allocations', () => {
    const meeting = createMeeting(60, 5, 10, 2)
    expect(meeting.pauseSeconds).toBe(600)
    expect(meeting.totalSeconds).toBe(3000)
    expect(meeting.subjects.map((subject) => subject.allocation)).toEqual([600, 600, 600, 600, 600])
    expect(meeting.pauseAfter).toBe(2)
  })

  it('ticks only while running', () => {
    const idle = createMeeting(30, 3)
    expect(tickMeeting(idle, 5)).toBe(idle)
    const running = tickMeeting({ ...idle, running: true }, 5)
    expect(running.subjects[0].spent).toBe(5)
  })

  it('redistributes time saved by a completed subject', () => {
    let meeting = createMeeting(30, 3)
    meeting = { ...meeting, subjects: meeting.subjects.map((subject, i) => i === 0 ? { ...subject, spent: 300 } : subject) }
    meeting = closeActiveSubject(meeting)
    expect(meeting.subjects[1].allocation).toBe(750)
    expect(meeting.activeIndex).toBe(1)
  })

  it('shows live overrun on future allocations', () => {
    const meeting = createMeeting(30, 3)
    meeting.subjects[0].spent = 720
    expect(liveAllocation(meeting, 1)).toBe(540)
  })

  it('formats negative and delta times', () => {
    expect(formatTime(-61, { signed: true })).toBe('−01:01')
    expect(formatDelta(90)).toBe('+ 01:30')
  })
})
