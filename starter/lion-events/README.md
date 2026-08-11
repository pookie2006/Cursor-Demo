# Lion Events — starter

The take-home starter from the Cursor demo tour: an event planning site for
Columbia clubs. Event list, NetID/email RSVP, and (soon — that's you) a month
view of Lerner & Mudd rooms with capacity limits and a waitlist.

## Get started

```bash
npm install
npm run dev
```

Open the folder in [Cursor](https://cursor.com) and drive the work with Agent.
Every "Try" prompt from the demo tour works here. Good first prompts:

- `Cap Mudd 233 at 40; waitlist overflow for the ACM@CU kickoff.`
  (`src/lib/waitlist.ts` is stubbed and waiting)
- `Build the month calendar view of Lerner & Mudd rooms.`
- `Validate the Columbia email domain with an inline error.` (try ⌘K on `RsvpForm.tsx`)
- `@Branch, then ask for a review of the diff.`

## What's here

```
.cursor/rules/frontend.mdc   The rule from the demo — scoped to src/components/**
src/
  data/events.ts             Seed events (DevFest kickoff, club fair, …)
  hooks/useRsvp.ts           RSVP state — the rule says forms must use this
  lib/waitlist.ts            Capacity + waitlist logic (stubbed: your move)
  components/EventCard.tsx   One event with its RSVP form
  components/RsvpForm.tsx    NetID/email RSVP
```

## Stretch (from the tour's completion card)

- Design a context budget: rules vs skills vs MCP
- Write a hook that blocks network shell unless allowlisted
- `/best-of-n` on a hard bug, with a winner rubric
- A 20-line SDK script that opens a PR on a cloud run

Then open *your* Columbia repo and reuse the same loop.
