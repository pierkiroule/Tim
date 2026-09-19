import { describe, expect, it } from 'vitest'
import {
  closeActiveSubject,
  createMeeting,
  formatDelta,
  formatTime,
  liveAllocation,
  meetingRemaining,
  normalizeConfig,
  reframeMeeting,
  remainingSubjectCount,
  tickMeeting,
} from './meeting'

describe('meeting domain', () => {
  it('normalizes unsafe configuration values', () => {
    expect(normalizeConfig(0, 101, 999)).toEqual({ duration: 1, subjectCount: 100, plannedPauseMinutes: 480 })
  })

  it('starts with a three-hour meeting, thirty subjects and a fifteen-minute pause', () => {
    const meeting = createMeeting()
    expect(meeting.duration).toBe(180)
    expect(meeting.subjectCount).toBe(30)
    expect(meeting.subjects).toHaveLength(30)
    expect(meeting.plannedPauseMinutes).toBe(15)
    expect(meeting.pauseAllowance).toBe(900)
  })

  it('accepts a meeting with only one subject', () => {
    expect(createMeeting(10, 1).subjects).toHaveLength(1)
  })

  it('counts the active and future unfinished subjects', () => {
    const meeting = createMeeting(10, 3)
    meeting.subjects[0].done = true
    expect(remainingSubjectCount(meeting)).toBe(2)
  })

  it('allocates the budget equally', () => {
    const meeting = createMeeting(30, 3)
    expect(meeting.subjects.map((subject) => subject.allocation)).toEqual([600, 600, 600])
  })

  it('subtracts elapsed pause time from all remaining subjects', () => {
    const meeting = { ...createMeeting(60, 5, 0), started: true, paused: true }
    const paused = tickMeeting(meeting, 50)
    expect(paused.pauseSpent).toBe(50)
    expect(paused.subjects.map((subject) => subject.allocation)).toEqual([710, 710, 710, 710, 710])
  })

  it('does not penalize subjects while the planned pause allowance remains', () => {
    const meeting = { ...createMeeting(60, 5, 10), started: true, paused: true }
    const paused = tickMeeting(meeting, 50)
    expect(paused.pauseSpent).toBe(50)
    expect(paused.subjects.map((subject) => subject.allocation)).toEqual([720, 720, 720, 720, 720])
    expect(meetingRemaining(paused)).toBe(4150)
  })

  it('redistributes only the part exceeding the planned pause', () => {
    const meeting = { ...createMeeting(60, 5, 1), started: true, paused: true, pauseSpent: 50 }
    const paused = tickMeeting(meeting, 20)
    expect(paused.pauseSpent).toBe(70)
    expect(paused.subjects.map((subject) => subject.allocation)).toEqual([718, 718, 718, 718, 718])
    expect(meetingRemaining(paused)).toBe(3590)
  })

  it('ticks only while running', () => {
    const idle = createMeeting(30, 3)
    expect(tickMeeting(idle, 5)).toBe(idle)
    const running = tickMeeting({ ...idle, running: true }, 5)
    expect(running.subjects[0].spent).toBe(5)
  })

  it('ignores invalid elapsed time instead of corrupting the timer', () => {
    const meeting = { ...createMeeting(30, 3), running: true }
    expect(tickMeeting(meeting, Number.NaN)).toBe(meeting)
    expect(tickMeeting(meeting, Number.POSITIVE_INFINITY)).toBe(meeting)
  })

  it('cannot close a subject before start or during a pause', () => {
    const idle = createMeeting(30, 3)
    expect(closeActiveSubject(idle)).toBe(idle)
    const paused = { ...idle, started: true, running: false, paused: true }
    expect(closeActiveSubject(paused)).toBe(paused)
  })

  it('reframes the remaining meeting from a new end time', () => {
    const now = 1_000_000
    let meeting = { ...createMeeting(30, 3, 5), started: true, running: true }
    meeting = tickMeeting(meeting, 120)
    const reframed = reframeMeeting(meeting, now + 20 * 60 * 1000, 4, 5, now)
    expect(reframed.subjects).toHaveLength(4)
    expect(meetingRemaining(reframed)).toBe(1200)
    expect(reframed.subjects[0].allocation - reframed.subjects[0].spent).toBe(225)
    expect(reframed.subjects[3].allocation).toBe(225)
  })

  it('uses a pre-start reframing as the new allocation baseline', () => {
    const now = 1_000_000
    const meeting = createMeeting()
    const reframed = reframeMeeting(meeting, now + 4 * 60 * 1000, 10, 1, now)

    expect(reframed.initialShare).toBe(18)
    expect(reframed.subjects.map((subject) => subject.allocation)).toEqual(Array(10).fill(18))
    expect(liveAllocation(reframed, 1) - reframed.initialShare).toBe(0)
  })

  it('refreshes the baseline when the first start accounts for setup time', () => {
    const now = 1_000_000
    const meeting = createMeeting(30, 3, 5)
    const reframed = reframeMeeting(meeting, now + 20 * 60 * 1000, 3, 5, now)

    expect(reframed.initialShare).toBe(300)
    expect(reframed.subjects.map((subject) => subject.allocation)).toEqual([300, 300, 300])
  })

  it('never removes completed subjects during a live reframing', () => {
    let meeting = { ...createMeeting(30, 3), started: true, running: true }
    meeting = closeActiveSubject(meeting)
    const reframed = reframeMeeting(meeting, Date.now() + 600_000, 1, 0)
    expect(reframed.subjectCount).toBe(2)
    expect(reframed.subjects[0].done).toBe(true)
  })

  it('keeps the requested end time after reducing an already exceeded pause', () => {
    const now = 2_000_000
    const meeting = { ...createMeeting(30, 3, 10), started: true, paused: true, pauseSpent: 600 }
    const reframed = reframeMeeting(meeting, now + 15 * 60 * 1000, 3, 5, now)
    expect(meetingRemaining(reframed)).toBe(900)
  })

  it('redistributes time saved by a completed subject', () => {
    let meeting = { ...createMeeting(30, 3), started: true, running: true }
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
