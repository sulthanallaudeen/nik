# Office PBX configuration

From the supplied screenshot:
- Name: PBX Extension ClickToCall
- Call URL: http://10.253.10.69/API/ExtensionClickToCall.php
- Agent value: User Extension
- DID reference: 4445841950 (kept exactly as displayed; confirm the full public number with your PBX administrator)

In the CRM, sign in as Owner. Open Global Settings → Calling Configuration → Add screenshot PBX configuration. Review the form and click Save Configuration. The record is saved in the SQLite `records` table with `kind='configs'` and configuration values in `meta`. This is a saved configuration reference; it does not enable live calling.

The screenshot's ACTIVE badges describe the old system, not a tested connection in this CRM. This package keeps the new configuration inactive until the integration is implemented and tested. The PBX address is private; the CRM backend must run on your office network or an authorized VPN that can reach it. No network request is made by loading or saving this form.

Ask your PBX administrator for:
1. PBX manufacturer/model and documentation for ExtensionClickToCall.php.
2. One working example request with credentials redacted: method, parameter names, required headers, agent extension, destination format and DID field.
3. The success/error response and returned call ID. HTTP success alone must not be treated as an answered call.
4. Incoming-call notifications, ringing/answered/ended events, callback authentication and sample payloads; alternatively the supported call-details polling API.
5. Duration and recording retrieval APIs, hangup API and agent-extension mapping.
6. Whether browser WebRTC/SIP is supported; a click-to-call endpoint alone does not establish browser audio.

Do not paste credentials in chat. Enter them locally when a documented adapter is available. An incoming-event adapter and provider call-ID mapping must be implemented before actual incoming calls, statuses and recordings can be synchronized. Existing calling remains demo-only in this package.

Database creation/upgrades: see DATABASE-SETUP.md. Use npm.cmd run db:init; keep your existing data folder and back it up before upgrading.

## Use the dummy PBX now

1. Sign in as Owner and open Global Settings → Calling Configuration.
2. Click **Use Dummy Incoming / Outgoing Calls** on the PBX card. This saves a separate dummy configuration and creates assigned demo extensions/DID labels once. Your office reference is preserved separately from simulated DIDs. No request is sent to the office PBX.
3. On Demo Phone, select your dummy DID and optionally link a lead.
4. Click **Demo Outgoing Call**, then **Simulate Customer Answer**, then **Hang Up Demo Call**.
5. Click **Simulate Incoming Call**, then **Answer in Demo Browser** or **Reject**.
6. Check Demo Call History or export CSV. Status, direction and duration are saved in `calls`; detailed simulated state, DID, contact and timestamps are in `demo_phone_calls`. They remain after restart.

The dummy connection uses no microphone and produces no live audio or telephone connection. Active setup is safe to repeat and does not overwrite existing PBX configurations.
