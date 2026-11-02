# Data model notes

MongoDB documents are defined with Mongoose in `server/src/models/`.

## User

`User` stores `name`, unique normalized `email`, `passwordHash`, role (`student`, `organizer`, `admin`), optional `department`, `rollNumber`, `usn`, and `clubName`, plus timestamps. Password hashes are omitted from normal JSON serialization and are not selected by the administrator user-list query. Public sign-up always creates a student.

## Event

`Event` stores title, description, category, venue, `startsAt`, `endsAt`, capacity, active `registeredCount`, status (`draft`, `published`, `cancelled`), creator, optional organizer label and timestamps. Its `phase` virtual is derived from the dates when serialized. An index covers `(startsAt, status)`.

Venue, organizer and eligibility data are configurable event fields; the seed values are fictional and must not be interpreted as DSU locations or rules. The schema does not yet include a structured schedule or eligibility-policy model.

## Registration

`Registration` stores event and student references, status (`registered`, `cancelled`), attendance state and timestamps, plus a random ticket code. Unique indexes enforce one registration record per `(event, student)` and one ticket code per record. Cancellation and re-registration update the same record.

## Capacity and concurrency

The event document's `registeredCount` is incremented with one conditional `findOneAndUpdate` that checks published status, future start, and remaining capacity. Registration creation/reactivation follows that reservation; a failed write rolls the counter back. Capacity changes compare the requested value to the latest active count atomically. Deletion requires both no registration history and a conditional zero-count delete so a simultaneous reservation cannot remove an event. Cancellation first performs a conditional transition from `registered` to `cancelled` so concurrent cancellation requests cannot decrement twice, then decrements the event count. These behaviors are covered by service-level mocks, not a live MongoDB concurrency test.

There is no transaction spanning the event and registration documents. The compensating counter update follows the supplied playbook, so production reliability should be revalidated against the deployed MongoDB topology and operational recovery process.
