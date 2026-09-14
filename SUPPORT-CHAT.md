# Support conversation update

Changed locally: chat.html, community-appeals.js, support-chat.js, support-glass.css.

Reports, suggestions, staff answer cards and bans use translucent glass surfaces. Chat-ban appeals have a real-time conversation accessible to the affected user and Owner/Admin. Nova-wide appeal conversations are available on the restriction screen and owner moderation review. AI participates after Ask Nova AI; later messages in that open conversation receive AI replies. Owner approval remains manual.

Automatic AI unbanning is NOT enabled. The current application identifies accounts through localStorage and client-readable roles. A server-authenticated identity and privileged moderation endpoint are required before an AI decision can authoritatively remove a ban. Do not give the ordinary /api/nova-ai endpoint database write access or trust an account/role supplied by the browser. The future endpoint must verify a Firebase ID token, load the exact current ban and appeal itself, enforce an owner-configured appeal policy, record its decision, and atomically ensure that the ban has not changed before removal.
