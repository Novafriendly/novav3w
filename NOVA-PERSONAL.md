# Nova Personal

The home shell mounts a compact personal bar to the left of its bottom navigation dock with an 8-pixel gap. On narrow screens it wraps above the dock. With a left or right sidebar it stacks underneath, reserving viewport space and opening cards inward. Its finish follows the dock theme. Hover, click, or keyboard activation opens the profile, online activity, and visits cards. Click outside or press Escape to close a card.

- Current profile names and photos come from `users`; activity comes from the existing `novaActivity` sessions. Four avatars are shown, plus the remaining online count. Expired activity disappears after the existing 65-second timeout. Elapsed times update locally without extra database writes.
- `novaStats/homeVisits` is an integer, initialized to 190,000 and incremented atomically by a Firebase transaction on each home-document load. This is page views, not unique visitors. Refreshes count, embedded panel navigation does not. No live counter was seeded during development.
- Update logs are at `novaUpdateLogs/{id}` with `title`, `description`, `banner`, `items`, `author`, `createdAt`, and `updatedAt`. The owner Update Log tab creates and edits releases. Existing release dates remain unchanged during editing. The viewer subscribes while open and unsubscribes on close. Banner images use a URL; titles and details render as text.

Deploy `nova-personal.js`, `nova-personal.css`, `community.js`, `community-core.js`, and `community-admin.js` together. No proxy repository changes are needed.

## Existing backend limitation

This project uses local-storage account names and client-side role checks, without Firebase Authentication configured in this repository. The new owner editor follows those checks; they are not server-side access control. Production rules must authorize owner writes to update logs and validate counter increments. No database rules were weakened or changed. Read/write failures are shown in the UI. The visit count is not an abuse-resistant analytics service.

## Checks

JavaScript syntax checks and an isolated local database preview cover online activity, current profile updates, visit totals, release creation/editing, and non-owner editor denial. Production Firebase records were not changed by the tests.
