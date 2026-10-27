# Airtel IQ in this CRM

The new panel is on **Demo Phone → Airtel IQ Cloud Telephony**. It is separate from the older local PBX simulator. Data is stored in the existing SQLite database, not PostgreSQL. No Azure account is required.

## Run locally now
1. Install Node.js 24. Extract the project and open Command Prompt in the folder containing package.json.
2. Run `npm.cmd install`, `npm.cmd run db:init`, then `npm.cmd start`.
3. Open http://localhost:3100 and select Owner. Default demo login: owner / Owner@12345 (unless you changed it).
4. Open Demo Phone. Select a CRM lead with a valid telephone number, enter a test agent phone number, and click Dummy Airtel outgoing or Simulate Airtel incoming. In dummy mode these numbers are labels only; no network call is made.
5. Click Simulate answer, then End dummy call. Refresh or restart to verify persisted history. No microphone, real ringing, or audio is connected in dummy mode.

No .env file is required for dummy mode. You can also run `copy .env.example .env` in Windows Command Prompt. Never put secrets in Angular code.

## Live integration scope
The adapter follows Airtel's public sample's callflow-component API family, with Basic authorization and the initiateCall, addParticipant and destroySession operations. Confirm your Airtel account supports this API family; a different Airtel product/API requires a different adapter. No live Airtel account was available for testing. Live behavior is not provider-certified.

Outgoing: initiateCall rings the agent. On its ANSWER callback, the backend requests addParticipant for the customer. Only the customer's ANSWER event marks the CRM conversation Connected. Hangup requests destroySession; an actual disconnect event closes history. API acceptance is not proof of an answered call. Unknown results are retained for reconciliation instead of automatically redialing, to avoid duplicate calls.

Live incoming routing must be configured in Airtel's portal/account. This CRM does not provision DIDs or route incoming calls to agents. It receives and logs inbound notifications from an account-specific adapter, so you must confirm and map the actual inbound payload first. Agent phones handle voice; this integration does not add browser WebRTC audio.

## Configure your Airtel account
1. Obtain Airtel IQ activation, API username/password, customer ID, assigned caller ID and approved agent/customer number formats. Existing office PRI access does not automatically grant an IQ account.
2. Copy .env.example to .env and fill the real account values locally. Keep AIRTEL_MODE=demo until all account routing and callback mappings are checked.
3. Generate a webhook secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Set AIRTEL_WEBHOOK_SECRET to the result.
4. Ask Airtel to whitelist your reachable HTTPS callback address `/api/airtel/events`. localhost is not reachable by Airtel. For a local backend, use an approved HTTPS tunnel for testing or a properly hosted endpoint.
5. Set AIRTEL_CALLBACK_URLS to the account-approved JSON array of callbacks. Airtel's CallbackURL model has eventType, notifyURL, method, headers. Ask Airtel for the correct eventType values. Configure method POST and header `x-crm-webhook-secret` with your secret for each callback; do not send the callback secret in query strings. The code does not invent undocumented enum values.
6. Set AIRTEL_AGENT_NUMBERS to a JSON object mapping CRM user IDs to Airtel-approved agent numbers, e.g. {"1":"your-approved-number"}. Users can only initiate live calls through their assigned phone. Configure incoming routing in Airtel, then map inbound payloads using the contract below. Set AIRTEL_INCOMING_AGENT_ID to the CRM user's numeric ID for that inbound route. This edition supports one configured inbound agent route.
7. Change AIRTEL_MODE=live and restart the backend. Test one outgoing call, inbound notification, unanswered call and disconnect with your Airtel technician. Incoming audio is answered on the routed agent phone.

## Event contract
The endpoint accepts JSON POST with the shared-secret header. Airtel's public event model supplies vmSessionId, clientCorrelationId, participantAddress, eventType, event, eventId. CALL events ANSWER and DISCONNECTED update linked outgoing sessions; duplicate event IDs are ignored and terminal calls are not reopened.

For a NEW incoming session, your account-specific adapter must also supply:
- direction: Incoming
- customerNumber: caller number
- agentNumber: routed agent phone
- did: exact configured AIRTEL_CALLER_ID
- vmSessionId: Airtel session identifier

These incoming fields are a **CRM normalization contract**, not a claim that every Airtel account sends these names. Unknown/unmapped sessions are rejected. The inbound customer is linked to a lead only when one exact matching number belongs to the configured agent. Otherwise it remains an unlinked call. Real CDR/recording field mapping is not included until your account's schema and access controls are supplied; do not assume recordings are available just because a call ended.

## Database
- calls: existing CRM reporting/history, with DEMO Airtel or Airtel status prefixes.
- airtel_calls: mode, linked CRM lead/agent, direction, provider session, correlation ID, phone numbers, status, timestamps and duration.
- airtel_events: authenticated callback payloads and deduplication keys.
Tables are added automatically without deleting existing records. Back up the data folder before upgrading. Do not replace your real database with the bundled demo database.

## Sources
https://github.com/airteliq/airtel-iq-click-to-call-sample
https://www.airtel.in/business/b2b/airtel-iq/api-docs/callflow-component-apis

The old 10.253.10.69 PBX reference is separate from Airtel IQ cloud settings. PostgreSQL migration is not included in this update.
