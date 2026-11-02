# Local demo walkthrough

Every seeded account, event, registration, ticket code, attendance value and analytics number is fictional. Do not present demo passes as entry credentials or demo analytics as institutional reporting.

## Start

From the project root, configure `server/.env` and `client/.env` from their `.env.example` files, start a local MongoDB instance, then run:

```powershell
npm install
npm run seed
npm run dev
```

Open <http://localhost:5173>. The API health check is <http://localhost:5000/api/health>.

## Student flow

1. Browse the public event page without signing in. Point out the title, category/date filters and the visible `DEMO DATA` labels.
2. Open **Sign in**, choose the **Student** quick-fill account (`student1@example.test` / `Student@123`) and sign in.
3. Open an available sample event such as **Shape, Type & Interface Workshop** and register.
4. Visit **My events** to see the registration. Cancel from the dashboard or event detail and register again to exercise reactivation.
5. Show a sample ticket code, emphasizing it is not valid for real-world entry.
6. Open **The Last Place Showcase** to observe the already-full state.

## Organizer flow

1. Sign out and choose the **Organizer** quick-fill account (`organizer@example.test` / `Organizer@123`).
2. Open **Management**. The organizer sees only owned events and scoped sample analytics.
3. Create a draft event with a placeholder venue. Edit it to publish, then open its event management/attendance route.
4. Open **The Open Studio**, which has a fictional active registration that is not yet checked in, to inspect the attendee list and CSV export. Attendance is available because this demo event is in progress.
5. Check in the demo attendee once, then submit the same code again; the second check-in returns an explicit duplicate message.

## Administrator flow

1. Sign out and choose the **Admin** quick-fill account. The default local example is `admin@example.test` / `DemoAdminOnly123`; if you changed `ADMIN_PASSWORD` in `server/.env`, enter that value instead.
2. Review the event status controls, sample analytics, and the read-only **Account oversight** section.
3. Edit and publish a sample draft. Attempt to delete an event with registration history; the API blocks deletion and advises cancellation instead.
4. Open the sample past event's attendance route, mark a demo check-in, and export the roster as CSV.

## Rule demonstrations

- **Atomic capacity:** The service reserves a seat using one conditional MongoDB update; the unit test simulates a capacity-one race. This is not a live MongoDB integration test.
- **Cancellation:** Registration can be cancelled only before the start time; repeated concurrent cancellations cannot decrement capacity twice.
- **Attendance:** The server rejects early and duplicate check-ins. Organizer access is limited to owned events.
- **Capacity floor and deletion guard:** Server-side event updates reject capacity below active registrations; events with any registration history cannot be deleted.

The sample seed is restricted to local MongoDB. For a live presentation, do not connect it to an institutional or production database.
