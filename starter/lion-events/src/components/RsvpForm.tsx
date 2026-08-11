import type { FormEvent } from 'react'
import { useRsvp } from '../hooks/useRsvp'

export function RsvpForm({ eventId }: { eventId: string }) {
  const { email, setEmail, status, submit } = useRsvp(eventId)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void submit()
  }

  if (status === 'confirmed') return <p className="rsvp-done">You’re in — check your email.</p>
  if (status === 'waitlisted') return <p className="rsvp-done">Room full — you’re on the waitlist.</p>

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="uni@columbia.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="NetID email"
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'RSVP'}
      </button>
      {status === 'error' && <p className="rsvp-error">Something went wrong — try again.</p>}
    </form>
  )
}
