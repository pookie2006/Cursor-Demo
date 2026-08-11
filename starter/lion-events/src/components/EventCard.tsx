import type { CampusEvent } from '../data/events'
import { RsvpForm } from './RsvpForm'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
})

export function EventCard({ event }: { event: CampusEvent }) {
  const spotsLeft = Math.max(0, event.capacity - event.rsvps)

  return (
    <article className="event-card">
      <h2>{event.title}</h2>
      <p>
        {event.club} · {dateFormat.format(new Date(event.starts))} · {event.room}
      </p>
      <p>{spotsLeft > 0 ? `${spotsLeft} of ${event.capacity} spots left` : 'Room full — waitlist open'}</p>
      <RsvpForm eventId={event.id} />
    </article>
  )
}
