# Vonage Business Communications in the CRM

This CRM uses Vonage Business Communications (VBC) Integration Platform APIs from the provided Postman collection. They are distinct from Vonage's separate Communications Voice API and its API key/secret system. This is an agent-device integration, not a WebRTC softphone. Use a VBC-supported phone or softphone for audio.

## Test dummy calls locally

1. Install Node.js 24. Extract the ZIP and open Command Prompt in the `nikhand-crm` folder with `package.json`.
2. Run `npm.cmd install`, `npm.cmd run db:init`, and `npm.cmd start`.
3. Open http://localhost:3100. Default owner login is `owner` / `Owner@12345` unless changed.
4. Open **Demo Phone → Vonage Business Calling**, select a lead and click **Dummy outgoing call** or **Simulate incoming call**.
5. Click **Simulate answer**, then **End dummy call**. Call history persists in the SQLite database. Dummy mode is the default and does not contact Vonage or provide real audio.

Keep your existing `data` folder when updating and back it up before migrating. Do not overwrite your data with the demo database. PostgreSQL migration is not included.

## Connect a live account

Requirements: a Vonage Business Communications account and licensed users/devices, an approved number, developer account, application subscribed to the relevant APIs, integration user and an OAuth access token with relevant permissions. Ask Vonage whether the service, phone numbers and call features are available for your account and region. A Vonage VBC access token differs from the dummy token in a different sample project.

1. In Windows Command Prompt inside the project folder, run `copy .env.example .env` if you do not already have a .env file. If you already have one, append the VBC fields shown in .env.example; do not overwrite it.
2. In .env, set `VBC_MODE=live`, `VBC_ACCESS_TOKEN` to a current VBC OAuth Bearer token, `VBC_ACCOUNT_ID` to your VBC account ID, and `VBC_USER_MAP` to a JSON object mapping CRM user IDs to distinct VBC user IDs, for example `{"1":"123456"}`. This token represents a VBC user; use a mapping only for the same user as the token. One server token and exactly one user mapping are supported; use of multiple agents with separate Vonage identities requires a per-agent OAuth extension. Keep credentials private; do not paste them in chat.
3. The provided Postman environment includes token_url, client credentials, integration-user credentials and grant settings. Import both supplied files from the postman folder into Postman. Follow Vonage's authentication instructions to create a token. This CRM accepts the resulting bearer token in .env; it does not automatically refresh or generate it. Renew the token and restart when it expires.
4. Obtain a reachable HTTPS endpoint for the CRM. localhost cannot receive Vonage events from the internet; use a securely hosted service or approved tunnel. Configure the VBC Integration Platform webhook with `events:["CALL"]`, `metadataPolicy:"HEADER"`, `signingAlgo:"HMAC_SHA256"` and a long random `signingKey`. Set the same key as `VBC_WEBHOOK_SIGNING_KEY` in .env. Point the webhook to `https://YOUR-CRM-HOST/api/vonage/events`. Register/renew the webhook according to Vonage documentation; it is not automatically registered by this CRM.
5. Restart `npm.cmd start`. In the CRM, open Demo Phone → Vonage Business Calling. Select a lead and click Call with Vonage. The backend sends `POST /t/vbc.prod/vis/v1/self/calls` with `{ "phoneNumber": "..." }`; Vonage routes the call to the device associated with the bearer token. Answer and speak on that device.
6. Incoming calls must be routed to your subscribed VBC user/device in Vonage. Signed CALL notifications for mapped account/user IDs appear in CRM history after refresh. Unknown VBC users/accounts are rejected; exact-number matching links the call to a unique lead owned by the mapped CRM user. Confirm routing with your administrator.
7. Test with your provider: outgoing and incoming, answered, missed, duplicate callback and disconnect. An API acceptance is not proof that a customer answered. Network timeout is marked UNKNOWN and must be checked in Vonage before attempting another call; choose 'Close after checking Vonage' only after reconciling.

The CRM verifies X-VON-Signature using HMAC-SHA256 over the sorted compact JSON event, deduplicates identical event content, and prevents final call states from reopening. Provider events update `vonage_calls`, `vonage_events`, and existing `calls`. Incoming and outgoing history can be viewed in the Vonage panel. Audio recordings and the Vonage Reports API are not integrated in this release. Use the provider's own retention/recording settings.

## Official documentation
- https://developer.vonage.com/en/vonage-business-cloud/overview
- https://developer.vonage.com/en/api/vonage-business-cloud/vonage-integration-platform
- https://developer.vonage.com/en/vonage-business-cloud/vonage-integration-platform/concepts/webhooks
- https://developer.vonage.com/en/vonage-business-cloud/vonage-integration-platform/concepts/call-events

No live Vonage account was available to verify credentials, devices, number eligibility or complete provider delivery. The automated tests use a mocked provider and signed test notifications. For live production use, verify callback signing and routing with Vonage first.
