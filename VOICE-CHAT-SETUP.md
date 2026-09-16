# Nova voice chat

## Finish setup
1. In Firebase, enable Google sign-in and authorize both site domains.
2. In each Vercel project, set FIREBASE_SERVICE_ACCOUNT_JSON in Production, using your Firebase service account JSON. Never put this value in website files or send it in chat.
3. In Firebase → Realtime Database → Rules, save a copy of your current rules. Replace them with the complete contents of firebase-voice.rules.json, then Publish.
4. After the GitHub deployment finishes, open Nova Chat → Voice setup → Sign in with Google. Copy Your Google user ID.
5. Set NOVA_OWNER_UIDS to that ID in Vercel Production for each project, then redeploy. Multiple owner IDs can be comma-separated.
6. Return to Voice setup and Refresh. The owner linking form now appears. Enter your actual Nova account username and your Google user ID, then Link verified account.
7. Other users sign in through Voice setup and share their Google user ID with you. Verify ownership before linking them with the same owner form. Existing links cannot be replaced by this form.

General Voice appears in the channel list (six people maximum). Individual DMs have a Call button, with Accept/Decline for the recipient. Both people must be signed in and linked. Mute, Deafen and Leave are in the voice panel. Closing Chat stops microphone use. Audio is peer-to-peer and is not recorded.

## Database rules compatibility
The rules file inventories existing database root names plus paths found in the application. Existing feature paths retain the test-mode condition you supplied: now < 1791345600000 (October 7, 2026). This deadline has NOT been extended. Those legacy paths remain publicly accessible until then; this is not a complete authentication migration for the old chat. Before the deadline, migrate those paths to authenticated permissions to avoid interruption.

The root is denied. novaSecureAccounts, novaSecureAppeals, novaVoice and novaVoiceInvites explicitly deny browser reads/writes. Only the server handles voice signaling and owner-approved account links. The backend refuses to run voice if these protections are absent. Do not add a root or wildcard allow rule. Existing moderation records are honored, but legacy moderation itself still uses its existing permissions. No automatic AI unbanning is added.

## Network reliability and verification
STUN is provided for direct connections. Some networks require a TURN relay. Set NOVA_TURN_URL, NOVA_TURN_USERNAME and NOVA_TURN_CREDENTIAL in Vercel Production, then redeploy. These are dedicated relay credentials supplied to authenticated participants; use limited credentials and monitor usage. Large deployments should use short-lived relay credentials.

Syntax and mocked authorization checks can run locally; actual audio still needs two linked users on separate devices. Check DM accept/decline, General Voice, mute/deafen, close/reopen Chat, microphone denial and TURN on restrictive networks. This implementation is not yet verified by a live two-device call.

Members expire after 45 seconds without a heartbeat. Recipients delete acknowledged signals. Expired invitations and abandoned rooms are ignored but may remain stored; add retention cleanup before high-volume deployment. Voice uses periodic server requests and a six-person peer mesh, not a scalable hosted voice service.
