# Activate verified AI appeals

The code is implemented locally, but automatic unbanning stays disabled until these Firebase/Vercel steps are completed. Do not paste service account private keys into chat or commit them to GitHub.

## 1. Google sign-in
In Firebase project nova-chat-43a18, open Authentication, choose Get started, and enable Google under Sign-in method. Add novaoffical.vercel.app and novav3w-3ot9.vercel.app under Authentication Settings > Authorized domains.

In a Nova appeal conversation, choose Request automatic AI review > Verify with Google. The dialog shows the signed-in Firebase UID even before account linking is complete. Alternatively see Authentication > Users in Firebase. The owner must verify which existing Nova account belongs to that person; knowing a username is not proof. There is no automatic account claiming.

## 2. Private server settings
In Firebase Project settings > Service accounts, generate a server service-account key. Store its entire JSON privately in Vercel's Production environment variable FIREBASE_SERVICE_ACCOUNT_JSON. Configure NOVA_OWNER_UIDS with the owner's verified Firebase UID (comma-separated for multiple owners). Keep GEMINI_API_KEY and GEMINI_MODEL configured. Repeat for separate Vercel projects and redeploy.

These values are server-only. Google sign-in does not turn the old browser-storage Nova login into a secure login everywhere; the new protected moderation/appeal route independently verifies Google identity.

## 3. Database rules — preserve the rest of your rules
Export the current Realtime Database rules before editing. Do NOT replace the entire rules file with a generic sample. Root .read and .write must both be false, with explicit permissions for other existing branches. Firebase grants cascade: a root allow cannot be overridden by a child deny.

The server refuses to enable unless:
- Root .read and .write are false.
- bans and novaModeration have NO descendant client write grants. Existing reads for ban status may remain.
- novaSecureAccounts and novaSecureAppeals have NO client read or write grants anywhere below them.

The server Admin SDK alone writes these protected branches. Moving root grants requires preserving explicit rules for chat, profiles, etc.; this needs review of your actual deployed rules. The existing rules are not included in this repository, so they have NOT been changed or deployed by this update.

The main moderation panel and community moderation helper now route protected updates through the verified server when configuration is enabled. Legacy inline ban actions that directly write Firebase will be denied by protected rules; use the main moderation panel. Admin/Moderator mutes through staff-controls require the verified Firebase custom claim novaRole set by a trusted administrator to Admin or Moderator. The browser's existing role field is never sufficient for server authority. Owner authority comes only from NOVA_OWNER_UIDS.

## 4. Enable a specific ban
Open that user's appeal conversation as owner and choose Configure automatic AI review. Link their verified Google UID, write clear conditions (20–1,500 characters), and click Enable for this ban. Example: "For this first spam violation, approve only after the user explains the spam rule accurately, acknowledges their behavior and commits to stop. Otherwise continue asking questions or leave the ban for human review."

No policy is silently selected. Ban replacement or opting out invalidates in-flight approval. The affected user opens Request automatic AI review, verifies with Google and sends messages. The AI's valid approval removes only that exact restriction. Other bans, roles and mutes are untouched. The original ban record remains with banned:false and an audit decision; the existing ban listeners restore access.

## Files to deploy together
package.json, package-lock.json, server/secure-appeals.js, api/secure-appeal.js, secure-appeal-client.js, community.js, support-chat.js, support-glass.css, community-appeals.js, chat.html. Keep existing nova-ai-client.js and nova-ai-basic.js.

## Checks performed
Mocked server tests: successful automatic approval, wrong UID rejected, no opt-in rejected, new ban preserved during review, upstream failure preserves ban. No live bans or production database rules were modified. Live authenticated testing still requires the configuration above.
