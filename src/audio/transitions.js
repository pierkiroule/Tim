import { AUDIO_MESSAGES, closingMessage, resumeMessage } from './messages'

export function createAnnouncementTracker() {
  return { previous: null, closingSubjects: new Set() }
}

function isClosing(meeting) {
  const subject = meeting.subjects[meeting.activeIndex]
  if (!subject || subject.done) return false
  return subject.spent / Math.max(1, subject.allocation) >= 0.8
}

export function baselineAnnouncements(tracker, meeting) {
  tracker.previous = meeting
  if (isClosing(meeting)) tracker.closingSubjects.add(meeting.subjects[meeting.activeIndex].id)
}

export function detectAnnouncements(tracker, meeting) {
  const previous = tracker.previous
  tracker.previous = meeting
  if (!previous) return []

  if (previous.started && !meeting.started) {
    tracker.closingSubjects.clear()
    return []
  }

  const events = []
  if (!previous.started && meeting.started && !meeting.finished) {
    events.push({ type: 'start', message: AUDIO_MESSAGES.start })
  } else if (!previous.paused && meeting.paused && meeting.started) {
    events.push({ type: 'pause', message: AUDIO_MESSAGES.pause })
  } else if (previous.paused && !meeting.paused && meeting.started && !meeting.finished) {
    events.push({ type: 'resume', message: resumeMessage(meeting) })
  }

  const subject = meeting.subjects[meeting.activeIndex]
  const previousSubject = previous.subjects[previous.activeIndex]
  const crossedClosingThreshold = previousSubject?.id === subject?.id && !isClosing(previous) && isClosing(meeting)
  if (meeting.started && !meeting.paused && !meeting.finished && crossedClosingThreshold && !tracker.closingSubjects.has(subject.id)) {
    tracker.closingSubjects.add(subject.id)
    events.push({ type: 'closing', message: closingMessage(meeting.activeIndex + 1) })
  }
  return events
}
