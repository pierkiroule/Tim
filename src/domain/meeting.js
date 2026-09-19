export const DEFAULT_DURATION = 1
export const DEFAULT_SUBJECT_COUNT = 6
export const MIN_DURATION = 1
export const MAX_DURATION = 480
export const MIN_SUBJECTS = 2
export const MAX_SUBJECTS = 100

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function normalizeConfig(duration, subjectCount) {
  const safeDuration = Number.isFinite(Number(duration)) ? Number(duration) : DEFAULT_DURATION
  const safeCount = Number.isFinite(Number(subjectCount)) ? Number(subjectCount) : DEFAULT_SUBJECT_COUNT

  return {
    duration: clamp(Math.round(safeDuration), MIN_DURATION, MAX_DURATION),
    subjectCount: clamp(Math.round(safeCount), MIN_SUBJECTS, MAX_SUBJECTS),
  }
}

export function createMeeting(duration = DEFAULT_DURATION, subjectCount = DEFAULT_SUBJECT_COUNT) {
  const config = normalizeConfig(duration, subjectCount)
  const totalSeconds = config.duration * 60
  const initialShare = totalSeconds / config.subjectCount

  return {
    ...config,
    totalSeconds,
    initialShare,
    activeIndex: 0,
    started: false,
    running: false,
    finished: false,
    subjects: Array.from({ length: config.subjectCount }, (_, index) => ({
      id: crypto.randomUUID(),
      title: `Sujet ${index + 1}`,
      spent: 0,
      allocation: initialShare,
      done: false,
      result: 0,
    })),
  }
}

export function totalSpent(meeting) {
  return meeting.subjects.reduce((sum, subject) => sum + subject.spent, 0)
}

export function meetingRemaining(meeting) {
  return meeting.totalSeconds - totalSpent(meeting)
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
  const overrun = active ? Math.max(0, active.spent - active.allocation) : 0
  return Math.max(0, subject.allocation - (future.length ? overrun / future.length : 0))
}

export function impactPerFuture(meeting) {
  const [nextIndex] = futureIndices(meeting)
  return nextIndex === undefined ? 0 : liveAllocation(meeting, nextIndex) - meeting.initialShare
}

export function tickMeeting(meeting, elapsedSeconds) {
  if (!meeting.running || meeting.finished || elapsedSeconds <= 0) return meeting
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

  const pool = Math.max(0, meeting.totalSeconds - subjects.reduce((sum, item) => sum + item.spent, 0))
  const remainingCount = subjects.filter((subject) => !subject.done).length
  const nextAllocation = remainingCount ? pool / remainingCount : 0
  const redistributed = subjects.map((subject) =>
    subject.done ? subject : { ...subject, allocation: nextAllocation },
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
