export const DEFAULT_DURATION = 1
export const DEFAULT_SUBJECT_COUNT = 6
export const MIN_DURATION = 1
export const MAX_DURATION = 480
export const MIN_SUBJECTS = 1
export const MAX_SUBJECTS = 100
export const MIN_PLANNED_PAUSE = 0
export const MAX_PLANNED_PAUSE = 480

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function normalizeConfig(duration, subjectCount, plannedPauseMinutes = 0) {
  const safeDuration = Number.isFinite(Number(duration)) ? Number(duration) : DEFAULT_DURATION
  const safeCount = Number.isFinite(Number(subjectCount)) ? Number(subjectCount) : DEFAULT_SUBJECT_COUNT

  const safePause = Number.isFinite(Number(plannedPauseMinutes)) ? Number(plannedPauseMinutes) : 0
  return {
    duration: clamp(Math.round(safeDuration), MIN_DURATION, MAX_DURATION),
    subjectCount: clamp(Math.round(safeCount), MIN_SUBJECTS, MAX_SUBJECTS),
    plannedPauseMinutes: clamp(Math.round(safePause), MIN_PLANNED_PAUSE, MAX_PLANNED_PAUSE),
  }
}

export function createMeeting(duration = DEFAULT_DURATION, subjectCount = DEFAULT_SUBJECT_COUNT, plannedPauseMinutes = 0) {
  const config = normalizeConfig(duration, subjectCount, plannedPauseMinutes)
  const totalSeconds = config.duration * 60
  const pauseAllowance = config.plannedPauseMinutes * 60
  const initialShare = totalSeconds / config.subjectCount

  return {
    ...config,
    totalSeconds,
    pauseAllowance,
    initialShare,
    pauseSpent: 0,
    paused: false,
    activeIndex: 0,
    started: false,
    running: false,
    finished: false,
    subjects: Array.from({ length: config.subjectCount }, (_, index) => ({
      id: crypto.randomUUID(),
      title: `Sujet ${index + 1}`,
      spent: 0,
      allocation: initialShare,
      pauseDeduction: 0,
      done: false,
      result: 0,
    })),
  }
}

export function totalSpent(meeting) {
  return meeting.subjects.reduce((sum, subject) => sum + subject.spent, 0)
}

export function meetingRemaining(meeting) {
  return meeting.totalSeconds + meeting.pauseAllowance - totalSpent(meeting) - meeting.pauseSpent
}

export function activeSubject(meeting) {
  return meeting.subjects[meeting.activeIndex]
}

export function activeRemaining(meeting) {
  const subject = activeSubject(meeting)
  return subject && !subject.done ? subject.allocation - subject.spent : 0
}

export function futureIndices(meeting) {
  return meeting.subjects
    .map((subject, index) => ({ subject, index }))
    .filter(({ subject, index }) => !subject.done && index !== meeting.activeIndex)
    .map(({ index }) => index)
}

export function liveAllocation(meeting, index) {
  const subject = meeting.subjects[index]
  if (!subject || subject.done) return 0
  if (index === meeting.activeIndex) return Math.max(0, subject.allocation - subject.spent)

  const future = futureIndices(meeting)
  const active = activeSubject(meeting)
  const overrun = active ? Math.max(0, active.spent - (active.allocation + active.pauseDeduction)) : 0
  return Math.max(0, subject.allocation - (future.length ? overrun / future.length : 0))
}

export function impactPerFuture(meeting) {
  const [nextIndex] = futureIndices(meeting)
  return nextIndex === undefined ? 0 : liveAllocation(meeting, nextIndex) - meeting.initialShare
}

export function tickMeeting(meeting, elapsedSeconds) {
  if (meeting.finished || elapsedSeconds <= 0) return meeting
  if (meeting.paused) {
    const remainingCount = meeting.subjects.filter((subject) => !subject.done).length
    const previousOverage = Math.max(0, meeting.pauseSpent - meeting.pauseAllowance)
    const nextPauseSpent = meeting.pauseSpent + elapsedSeconds
    const nextOverage = Math.max(0, nextPauseSpent - meeting.pauseAllowance)
    const timeToRedistribute = nextOverage - previousOverage
    return {
      ...meeting,
      pauseSpent: nextPauseSpent,
      subjects: meeting.subjects.map((subject) => subject.done ? subject : {
        ...subject,
        allocation: Math.max(0, subject.allocation - timeToRedistribute / Math.max(1, remainingCount)),
        pauseDeduction: subject.pauseDeduction + timeToRedistribute / Math.max(1, remainingCount),
      }),
    }
  }
  if (!meeting.running) return meeting
  return {
    ...meeting,
    subjects: meeting.subjects.map((subject, index) =>
      index === meeting.activeIndex ? { ...subject, spent: subject.spent + elapsedSeconds } : subject,
    ),
  }
}

export function closeActiveSubject(meeting) {
  if (meeting.finished) return meeting
  const active = activeSubject(meeting)
  if (!active || active.done) return meeting

  const subjects = meeting.subjects.map((subject, index) =>
    index === meeting.activeIndex
      ? { ...subject, done: true, result: subject.allocation - subject.spent }
      : subject,
  )

  if (meeting.activeIndex === subjects.length - 1) {
    return { ...meeting, subjects, running: false, finished: true }
  }

  const pauseOverage = Math.max(0, meeting.pauseSpent - meeting.pauseAllowance)
  const pool = Math.max(0, meeting.totalSeconds - pauseOverage - subjects.reduce((sum, item) => sum + item.spent, 0))
  const remainingCount = subjects.filter((subject) => !subject.done).length
  const nextAllocation = remainingCount ? pool / remainingCount : 0
  const redistributed = subjects.map((subject) =>
    subject.done ? subject : { ...subject, allocation: nextAllocation, pauseDeduction: 0 },
  )

  return {
    ...meeting,
    subjects: redistributed,
    activeIndex: redistributed.findIndex((subject) => !subject.done),
  }
}

export function formatTime(seconds, { signed = false } = {}) {
  const value = Math.ceil(Math.abs(seconds))
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const remainingSeconds = value % 60
  const formatted = hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  return signed && seconds < 0 ? `−${formatted}` : formatted
}

export function formatDelta(seconds) {
  if (Math.abs(seconds) < 0.5) return '± 0 s'
  const prefix = seconds > 0 ? '+' : '−'
  const value = Math.round(Math.abs(seconds))
  return value < 60 ? `${prefix} ${value} s` : `${prefix} ${formatTime(value)}`
}
