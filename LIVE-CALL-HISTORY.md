# Call history and activity updates

The lead profile Activity Timeline shows both manually entered activities and linked incoming/outgoing call records. Each call shows its direction, provider/demo status, agent, time and duration. The underlying call remains in the calls table; entries are combined for display, so call status changes do not create duplicate activity rows or alter dispositions.

The open lead timeline, dashboard report and lead list refresh every 8 seconds while the browser tab is visible. Demo Phone refreshes Vonage call history as well; the Outgoing Calls and Voice Quality lists update while open. This is polling, not a continuous audio connection. Provider event arrival, the polling interval and network conditions affect when updates appear. Refresh may pause in a hidden tab.

The Call Lead button selects that lead on Demo Phone, where you can use Vonage or other available call options. Incoming Vonage call notifications match a lead only when there is one matching phone number assigned to the mapped agent. Indian 10-digit numbers and +91 format are matched. Unknown or duplicate numbers remain unlinked and need manual review. No lead is automatically created.

Dummy mode saves simulated status and duration; it does not connect audio. Live information requires a configured VBC account, supported device and a working signed webhook. For activation and limits see VONAGE-SETUP.md. Provider recordings are not automatically imported.

Existing SQLite data is retained. Before updating, stop the CRM and back up the data folder. Install this version while keeping your existing data folder, then run npm.cmd install, npm.cmd run db:init and npm.cmd start. The app builds on startup. No PostgreSQL migration is included.
