import { useState } from 'react'

export type RsvpStatus = 'idle' | 'loading' | 'confirmed' | 'waitlisted' | 'error'

/**
 * RSVP state for one event. The frontend rule requires every RSVP form to go
 * through this hook — no ad-hoc fetch calls in components.
 */
export function useRsvp(eventId: string) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<RsvpStatus>('idle')

  async function submit() {
    setStatus('loading')
    try {
      // TODO: POST /api/rsvp with { eventId, email } and confirmation email.
      // For now the starter fakes a confirmed RSVP so the UI is testable.
      await new Promise((resolve) => setTimeout(resolve, 400))
      void eventId
      setStatus('confirmed')
    } catch {
      setStatus('error')
    }
  }

  return { email, setEmail, status, submit }
}
