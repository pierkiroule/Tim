import { tickMeeting } from './meeting'

/**
 * Advances a meeting from wall-clock timestamps.
 *
 * Date.now() is intentional here: unlike animation/performance clocks, it keeps
 * measuring time while a mobile browser is in the background or the device is
 * asleep.
 */
export function advanceMeetingTo(meeting, previousTimestamp, currentTimestamp) {
  if (!Number.isFinite(previousTimestamp) || !Number.isFinite(currentTimestamp)) return meeting
  const elapsedSeconds = Math.max(0, currentTimestamp - previousTimestamp) / 1000
  return tickMeeting(meeting, elapsedSeconds)
}
