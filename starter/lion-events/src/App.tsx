import { events } from './data/events'
import { EventCard } from './components/EventCard'

export default function App() {
  return (
    <main className="app">
      <header>
        <h1>Lion Events</h1>
        <p>Events for Columbia clubs — RSVP with your NetID email.</p>
      </header>

      <section className="events">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>

      {/* TODO: month calendar view of Lerner & Mudd rooms — ask Agent. */}
    </main>
  )
}
