# Nova moderation and website announcements

## Included

- Redesigned admin panel and chat restriction screen.
- Timed mutes in minutes, hours, or days. Expiry uses Firebase's server clock offset. Expired records remain stored but stop restricting the user.
- Separate chat-only and Nova-wide bans, with an expiry or until manually removed.
- Owner announcements with the owner's current database profile image and username, a top-center banner, manual dismissal, and a 15-second expiry. Expired announcements are not replayed on new pages.
- Shared listeners on Nova's home, settings, chat, game/app lists and players, browser, proxy, error, and policy pages. The home shell covers embedded games; announcements can appear above fullscreen frames in supported browsers.
- Existing Smart Panic settings are preserved. Smart Panic cannot open over an active Nova-wide ban.

## Firebase data

The existing Firebase project is reused. No live users were moderated and no live announcements were sent during development.

| Path | Purpose |
| --- | --- |
| `bans/{username}` | Existing chat-only ban records; adds optional `expiresAt` |
| `novaModeration/{username}/mute` | Timed mute record |
| `novaModeration/{username}/siteBan` | Nova-wide ban record |
| `novaAnnouncements/latest` | Latest owner announcement |

Restriction fields: `banned`, `bannedBy`, `reason`, `timestamp`, and optional `expiresAt` in milliseconds. Announcement fields: `id`, `author`, `profilePic`, `text`, and `createdAt`. Timestamps use Firebase server values; expiration deadlines use the server clock offset.

New restrictions preserve existing roles. Removing a legacy chat ban restores `Member` only when the old system replaced the user's role with `Banned`.

## Deployment and enforcement limits

Deploy all changed HTML pages together with `community.js`, `community-core.js`, `community-admin.js`, `community.css`, and the updated `panic-smart.js`.

This repository currently identifies accounts through browser storage and usernames, and does not configure Firebase Authentication or Firebase security rules. The UI checks database roles before applying restrictions or publishing announcements, but this is not server-side authorization. A modified browser client, changed username, or direct database request could bypass client checks if the database rules permit it. These changes do not solve that existing authentication design.

Before treating moderation as tamper-resistant, configure authenticated stable user IDs and rules that authorize staff actions and announcement publishing, and reject writes from muted/banned users at every chat message path. Do not deploy blanket public write rules. Review existing rules before adding the new paths; no rules were changed by this work.

A Nova-wide ban covers Nova's own pages and embedded content. It cannot control a separate external website opened in another tab. Already-open copies of the old website need to reload once after deployment to receive the shared listeners. Network delays and background tab throttling can delay updates; banners check their absolute expiry and do not intentionally queue stale announcements.

## Verification

Local two-user tests use an in-memory mock database, not the production Firebase database. Covered: timed mute and expiry, blocked sending, chat-only scope, Nova-wide overlay during a fullscreen game, persistence after reload, live unban, owner-only announcement controls, fullscreen banner rendering, and automatic banner expiry. JavaScript syntax checks run on new modules and modified chat scripts.
