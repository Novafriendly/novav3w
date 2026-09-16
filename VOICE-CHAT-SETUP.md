# Nova device voice chat

## Owner setup
1. Firebase → Authentication → Sign-in method → Add provider → Anonymous → Enable → Save. No Google sign-in, password, owner UID or manual account linking is required for voice.
2. Keep FIREBASE_SERVICE_ACCOUNT_JSON set in Vercel Production for each site. Never include the private service account JSON in website files.
3. Firebase → Realtime Database → Rules: back up the existing rules, paste the complete firebase-voice.rules.json, and Publish. This is the same protected rules file supplied with the first voice release.
4. Deploy the latest GitHub main commit and open Nova Chat → Voice Chat. A voice ID is created automatically. Join General Voice, or open a DM and use Call to choose that person's online voice ID. Microphone permission is requested only when joining a call.

## Device identity
Firebase anonymous authentication stores a signed-in device identity in browser storage. Refreshing or reopening the same site restores that identity; the API never trusts a submitted ID. The visible nova_voice_id value is only a display copy, not authentication. Clearing site data, using a different browser/device/site domain or private browsing creates a different identity. Browser storage eviction can also reset it. Disable Firebase anonymous-account automatic cleanup if you need IDs to survive beyond its cleanup window.

Existing Nova usernames are display labels, not verified ownership. Device identities do not acquire Owner/Admin permissions or ownership of legacy chat accounts. Two people can use the same display name. Calls show full voice IDs; compare the ID with your friend, then select their device explicitly. Private rooms authorize only the caller and selected recipient's signed IDs. Incoming calls require acceptance before microphone access. This does not migrate legacy text chat authentication or provide recovery after clearing data. Existing name-based moderation is honored but is not durable identity enforcement against someone clearing data or changing their label.

## Interface
Voice Chat is a tab in the chat sidebar, not a floating corner panel. It contains the saved ID, General Voice, incoming calls and Mute/Deafen/Leave controls. Switching to text channels preserves an active call; closing Nova Chat stops the microphone. General Voice supports ten people and DM calls support two. No recording is added.

## Rules and network limitations
The rules preserve existing feature paths and their original test-mode deadline: October 7, 2026. Those legacy paths remain public until that deadline, so complete an authenticated migration before then. Voice data stays in server-only novaVoice and novaVoiceInvites paths. The API rejects inherited public grants. The new identity uses novaVoice/devices; no new public database grants are needed.

STUN is included. Some networks require a TURN relay: set NOVA_TURN_URL, NOVA_TURN_USERNAME and NOVA_TURN_CREDENTIAL in Vercel Production and redeploy. Use dedicated limited relay credentials (they are supplied to participants), and short-lived credentials for larger deployments.

Before relying on voice, test with two devices: persistent IDs on refresh, DM selection/accept/decline, General Voice, mute/deafen, leaving, closing chat, microphone denial and TURN on restrictive networks. Local syntax and mocked authorization checks do not prove live audio works. Membership expires after 45 seconds without a heartbeat; expired invitations and abandoned rooms require retention cleanup for high-volume use.

Voice redesign: General Voice previews its live roster before joining. Profile pictures and display names refresh from Nova profiles. Speaking rings use local audio analysis while connected; no audio is recorded. Friend calls open a separate private dialog over the DM; Back to chat minimizes it and Open call restores it. Device IDs are tucked into expandable details. Ten-person mesh calls still need a real multi-device network/load test.


Private-call fix: online devices are discovered through a server-maintained per-name directory, without requiring an orderByChild database index. Refresh both callers after deployment to register the directory entry. Incoming calls display an in-app Accept/Decline notification on Nova's main page when its chat iframe has been loaded, including while minimized. This is not an operating-system push notification and cannot arrive after closing Nova. Decline, caller hangup, and the 60-second ringing deadline end pending calls. No extra Firebase rules are needed for this directory because it is under the existing server-only novaVoice path.

