import type { CampusEvent } from '../data/events'

export interface RsvpOutcome {
  kind: 'confirmed' | 'waitlisted'
  /** 1-based position when waitlisted. */
  position?: number
}

/**
 * Capacity + waitlist logic for a room.
 *
 * TODO (the demo's follow-up prompt): cap Mudd 233 at 40 and waitlist the
 * overflow for the ACM@CU kickoff. Decide the outcome from the event's
 * capacity and current RSVP count, and keep a stable waitlist order.
 */
export function placeRsvp(event: CampusEvent): RsvpOutcome {
  void event
  throw new Error('Not implemented — paste the capacity prompt into Agent chat.')
}
