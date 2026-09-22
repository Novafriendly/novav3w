# Nova AI on Vercel

Deploy chat.html, nova-ai-client.js, nova-ai-basic.js, and api/nova-ai.js together, along with any other pending chat modules. In the uploader, use FIND nova-ai to include the endpoint inside api/.

1. Create a Gemini API key in Google AI Studio: https://aistudio.google.com/apikey
2. Open the Vercel project serving Nova, then Settings > Environment Variables.
3. Add GEMINI_API_KEY with the key as its value, for Production. Keep it server-only; never put the key in GitHub or browser code.
4. Optional: GEMINI_MODEL overrides the default gemini-2.5-flash.
5. Deploy the changed files and redeploy after adding variables. If the two URLs are separate Vercel projects, configure both projects.
6. Test in ai-assistance: “What is 5+5?”, then a follow-up question. Real provider responses have not been verified until a valid key is installed.

The endpoint accepts the two supplied Nova origins. Other domains need adding to its allowlist. It provides text-only chat with recent per-user/channel context kept in the browser tab; reloading clears context. There is no cross-user channel history sharing with the model.

The secret stays on the server, but the endpoint is public. Origin checks are not authentication, and its in-memory limiter is only best-effort burst protection across a warm function instance. Configure provider quotas and Vercel firewall rate limits before enabling paid/public usage; this is not a guaranteed spending cap. No billing was enabled or production API call made during development.

References: https://ai.google.dev/api/generate-content and https://vercel.com/docs/environment-variables/managing-environment-variables
