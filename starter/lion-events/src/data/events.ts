/** Campus building codes, never free-text rooms (see .cursor/rules/frontend.mdc). */
export type RoomCode = 'MUDD 233' | 'LER 555' | 'LER AUD' | 'NWC 501'

export interface CampusEvent {
  id: string
  title: string
  club: string
  /** ISO date-time, America/New_York. */
  starts: string
  room: RoomCode
  capacity: number
  rsvps: number
}

export const events: CampusEvent[] = [
  {
    id: 'devfest-kickoff',
    title: 'DevFest Kickoff',
    club: 'ACM@CU',
    starts: '2026-09-11T17:00:00-04:00',
    room: 'MUDD 233',
    capacity: 40,
    rsvps: 40,
  },
  {
    id: 'club-fair',
    title: 'Friday Club Fair',
    club: 'CU Engineering Council',
    starts: '2026-09-12T15:00:00-04:00',
    room: 'LER 555',
    capacity: 120,
    rsvps: 87,
  },
  {
    id: 'intro-night',
    title: 'Intro to Open Source Night',
    club: 'ADI',
    starts: '2026-09-16T19:00:00-04:00',
    room: 'NWC 501',
    capacity: 30,
    rsvps: 12,
  },
]
