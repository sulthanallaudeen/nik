# Nikhand CRM — Angular + Express

A downloadable local CRM based on the supplied Nikhand screen references, with a clean light interface. This is a new project; it does not overwrite an earlier CRM or connect to the original private server.

## Start on Windows (CMD)

1. Install Node.js **24 LTS**. SQLite is built into this version of Node; no separate database installation is needed.
2. Extract this ZIP. Open the **nikhand-crm** folder containing **package.json**.
3. In that folder, open CMD and run:

```bat
npm.cmd install
npm.cmd start
```

4. Leave CMD open. Visit **http://localhost:3100**.

You can also double-click **START-WINDOWS.bat**. It installs packages if needed, builds Angular and starts Express.

If CMD reports ENOENT, you are outside the folder containing package.json. If `ng` is not recognised, run npm.cmd install here first. No global Angular CLI installation is required. If port 3100 is occupied:

```bat
set PORT=3101
npm.cmd start
```

Then visit http://localhost:3101. `npm.cmd run serve` is an alias for npm start. `npm.cmd run backend` serves the included prebuilt Angular files without rebuilding.

## Three role logins

Select the matching tab on the login screen.

| Role | Username | Initial password | Access |
|---|---|---|---|
| Owner | owner | Owner@12345 | All leads, teams, reports, users, masters, settings, audit |
| Team Leader | tl | Team@12345 | Team Sales A leads, assignments, reports and campaign management |
| User | user | User@12345 | Own assigned leads, activities, follow-ups, calls and reports |

Another sample user, agent2 / User@12345, belongs to Sales B to demonstrate team isolation. These are demo credentials. Change them under Account before using real information. Owner can add accounts, change team/role, deactivate accounts and reset other users' passwords. Password changes revoke other sessions; account changes and owner resets revoke all that account's sessions. Login sessions expire after 8 hours. No public signup or email password recovery is connected.

## What works

- Dashboard: real lead counts, disposition counts, agent activity and scheduled follow-ups.
- Lead list: name/mobile/source/agent search, disposition filter, add/edit, role-aware assignment, owner deletion.
- Lead profile: basic information, metadata, activity history, call type/subtype, disposition, notes and next follow-up.
- CSV lead import (TL/Owner), CSV exports, spreadsheet formula escaping on export. Lead and campaign imports now use a preview and an atomic transaction; invalid rows reject the batch. See UPDATE-OCT17.md.
- Activity report: date filter and actual activity rows.
- Hourly performance: date and local-hour filters, per-agent activity/call counts.
- Talktime: actual logged call durations, initially zero for demo calls.
- Auto Dial / OBD: persistent campaign records, team scope, names, descriptions, draft/ready/paused/completed organisation statuses.
- Users, groups, locations, sources and dispositions: persistent administrative records. Saved sources and dispositions populate lead selectors. Groups are reference records; access uses each account's team field.
- Global settings: persistent company/extension/provider reference fields.
- Audit log: lead, activity, campaign, account and settings changes.
- Password hashing with per-password salts; HttpOnly sessions; API permission checks, same-origin checks and login attempt limiting.
- Responsive desktop and mobile layout; no external font/image dependency.

## Telephony boundary

This package does **not** place real calls, broadcast audio, send SMS, score voice quality. “Log demo call” creates a clearly labelled zero-duration CRM call record. Campaign statuses organise records; they do not run dial jobs. Provider settings are reference fields only. A real PBX/IVR/SMS integration needs your provider's API, credentials, recording storage, callbacks and a background campaign runner. The call/voice pages explicitly state this.

Follow-ups are saved and shown in the dashboard; email/push reminders are not connected. Reports derive from local CRM records, not from the original system's historical data. Demo lead/contact information is fictional.

## Project structure

```text
nikhand-crm/
  src/app/                Angular component, templates and API service
  src/styles.css          Responsive interface theme
  server/index.cjs        Express startup
  server/app.cjs          Authentication, permissions and API routes
  server/database.cjs     SQLite schema and initial demo seed
  data/                   Database created automatically on first start
  tests/access.test.cjs    Permission and persistence checks
  dist/crm/browser/       Included production build
  angular.json            Angular build configuration
  package.json            Scripts and dependencies
  package-lock.json       Dependency lock
```

The backend is organised into startup, database and API modules. The Angular UI uses one standalone workspace component and an API service; large deployments can split each module into routed feature components.

## Database and backup

Data is stored in **data/crm.sqlite**, with SQLite WAL sidecar files while running. Stop the server before copying the data folder as a backup. Do not delete the database to update the code. Demo records seed only when the users table is empty. Start a separate empty database by setting CRM_DB to a new path.

Use `npm.cmd test` for role-boundary and persistence checks; `npm.cmd run build` for Angular compilation. This package targets a local workstation. Shared production deployment still needs HTTPS, secret/configuration management, backups and your provider adapter.

## Updated appearance and CSS fix
Angular critical-CSS inlining is disabled so the complete stylesheet loads under the Express security policy. The login has a navy welcome panel, white form card and separate role tabs.

To update: stop the old server with Ctrl+C. Extract this edition to a new folder. Copy your old data folder into the new nikhand-crm folder to preserve records and passwords. Run npm.cmd install and npm.cmd start there. Refresh the browser with Ctrl+F5.

## Spacious CRM edition

This edition embeds the workspace styles in the Angular component as well as providing the global stylesheet. It uses port 3100 by default so an older CRM on port 3000 cannot be mistaken for this version. The interface has a navy sidebar, larger type, roomier cards and tables, and a refined login panel. Copy your existing data folder into this project to keep records.


## Lead profile update (screenshot reference)

The Leads page now opens a profile with Previous/Next navigation, Edit Lead, PBX/demo-call action, SMS draft, View Log and Import Voice. Basic information includes alternate mobile; metadata includes hidden source and latest services. Activity history supports call type, sub call type, disposition, service, feedback, editable local date/time, and next follow-up. Saving an activity updates lead status and latest service. Future activity timestamps are rejected; future contact should use the follow-up field.

SMS drafts save into the interaction log with Not sent status. No SMS is transmitted. The PBX button logs a demo call only. Voice import now actually uploads and stores MP3, WAV or OGG audio (maximum 8 MB) in SQLite and offers authenticated playback. Audio compatibility depends on the browser. Uploaded files stay with the database backup and use the same role scope as the lead.

Database schema changes are additive: existing leads, accounts, activities and passwords are retained. Stop your old server, back up the data folder, extract the update, and copy the old data folder into the new nikhand-crm folder before starting. Open http://localhost:3100. The screenshot is used as a layout reference; its private contact information is not inserted as demo data.


## Screenshot-aligned edition

The visible headings and menu wording follow the supplied reference screens:

| Menu group | Screens |
| --- | --- |
| Dashboard | Analytics, Activity Dashboard Report, Hourly Performance Report, Talktime Report |
| Autodial | Auto Dial Center, OBD |
| Voice Quality | Outgoing Calls, Voice Quality |
| Leads | Manage Leads and the lead profile / Activity History |
| Admin | User Management, Deleted Leads, Group Management, User Logs, Download Logs, Roles & Permissions, GLOBAL SETTINGS, Audit Log |
| Masters | Location Master, Budget, Property Type, Sub Call Type (Dispo), Client, Project, Push Logs, Sources and Dispositions |

New Campaign uses Campaign Name, Target Group, Cancel and Launch Campaign. Campaign boxes show status, target group, Progress, Called / Total, Created, Owner, Stop/Start/Pause, export, members, edit, log and statistics. Launch saves a locally active campaign and snapshots targeted leads from the group members. Calls made using **Log demo call** in campaign details update its Called/Total counters. No live dialler is connected. Join Campaign and Maybe Later responses are saved and shown in campaign notifications.

Groups have selectable account members. Team Leaders can launch campaigns only for groups within their team. Campaign target groups are fixed after creation, and groups in use cannot be deleted. The counts reflect local records; screenshot statistics and private customers are not imported automatically.

Lead deletion now moves records into Deleted Leads. Owner can restore them, retaining activities and uploaded audio. Lead filters include All Users, All Sources, All Call Types and All Projects; pagination and bulk assignment are available. Leads can reference location, budget, property type and project masters. Masters support Sample CSV and Bulk Upload, with a name column required. Imports save sequentially; an error states how many rows were saved before it.

Roles & Permissions includes Admin, Manager, Team Leader, User, Client, QC and Vendor profile names. Every profile maps to one of the three login types (Owner, Team Leader, User). Profiles can be added, duplicated and edited, then assigned from User Management. Changing a profile's base login access updates its assigned accounts and revokes their sessions. Call-option permissions are enforced in Express. A role profile assigned to accounts cannot be deleted. Own Owner access is protected.

User Logs records actual login sessions, timestamps, browser and request IP. Download Logs records local CSV exports. Push Logs stays empty until a push provider is connected. Report headings/columns match the screenshots. The Copy Screenshot action copies a generated report PNG, or downloads it if clipboard image access is unavailable. Provider-specific timings, credits and status durations remain unavailable rather than using invented values.

Global settings has Calling Configuration, DID Management and Branding & White-label tabs, saved call-role access, provider reference configurations and branding fields. These do not connect a PBX or provision a DID. The saved company name and footer appear in the signed-in workspace.

### Updating

Stop the old server, back up the entire data folder, extract the updated ZIP to a new directory, copy your old data folder into its nikhand-crm folder and run npm.cmd install followed by npm.cmd start. Schema updates are additive and preserve existing records. Open http://localhost:3100 and refresh with Ctrl+F5. Browser visual QA could not be completed in this environment; Angular compilation and functional database/API tests are included.

## Dropdown navigation update

The sidebar now has expandable Dashboard, Autodial, Voice Quality, Leads, Admin and Masters menus. Click a section heading to open or close its dropdown. The selected page is highlighted. Menus show only the pages available to the logged-in role.

Admin includes Users, Deleted Leads, Groups, User Logs, Download Logs, Roles & Permissions, Settings and Audit Log. Sign in as Owner (owner / Owner@12345 on a new database) to access the full Admin and Masters menus. Existing saved passwords are retained when copying the data folder.

Every page has a bookmarkable hash URL. For example, http://localhost:3100/#/admin/users opens Users and http://localhost:3100/#/admin/groups opens Groups. Refresh and browser Back/Forward navigation restore the selected screen. A lead profile uses #/leads/profile/ID. Unauthorized bookmarked pages return to Analytics, and Express continues to enforce record access.

Users and Deleted Leads now include search and export. User Logs includes All Users, All Statuses, From Date, To Date, Clear filters, Refresh and Live/Pause controls. Live refresh polls every 15 seconds while User Logs is open and stops on navigation or sign-out. Session status is local CRM login state, not PBX agent availability.

## Dashboard report menu
Analytics, Project Wise Report, Activity Dashboard, Hourly Report, Daily QC Report, Talktime Report, User Billing Report are grouped under the Dashboard dropdown. Every screen supports a refreshable route. Reports filter local records by date and preserve role scope. Project reports group leads by project; Daily QC checks saved activity field completeness (not a reviewer score); User Billing shows call usage, with charges unavailable until rates/provider billing are configured. Analytics shows actual touched/untouched leads and the top five agents by Interested activity entries.

## Auto Dial Center and OBD
Auto Dial Center has Ongoing/Completed tabs, campaign search, Sync, progress, group, owner and date. OBD has total assigned records, running campaign count, campaign boxes, saved CSV/voice references, schedule and max attempts. Start/Stop/Retry update local campaign state; Report opens assigned leads, demo call logs and responses. Sync Queue refreshes records without placing calls. CSV and audio references are metadata; import lead CSVs in Manage Leads. Actual bulk audio broadcasting requires a provider integration.

Campaign layout correction: Auto Dial Center uses one header containing search, Sync and New Campaign with summary counters underneath, followed by tabs and standalone cards. OBD uses a separate header, three summary cards and a Campaign Boxes container with search. OBD controls have their own footer. Process Queue refreshes local records only. Local start/stop timestamps are saved. Provider failure counts remain unavailable.

OBD includes three clearly labelled dummy campaign boxes on first startup after this update. Start/Stop persist local status and timestamps; no live calls are made. Examples are added once so deleting them does not recreate them.

Admin examples: Roles & Permissions includes two labelled dummy roles with User scope and calling disabled. Settings includes two draft dummy provider references using example.invalid. User Logs offers a Show dummy sessions checkbox; these preview rows never create authenticated sessions and are labelled in exports. Real logs remain separate.


## October 15 screenshot update

- Manage Leads offers Table View and Smart View with callback cards, totals and lead profile links.
- Actions opens a side panel for Add New Lead, CSV Import/Export, bulk assignment and Owner bulk deletion. Deleted leads remain restorable.
- Filters opens a side panel with User, Project, Source, Hidden Source, Call Type and date range controls; Clear Filters resets them.
- Activity, Hourly, Daily QC and Talktime results appear after Search; Clear returns to the initial screen. Reversed date and hourly ranges are rejected.
- Existing campaign cards, start/stop controls, campaign dialogs, OBD settings and dashboard dropdowns are retained.

Validation: Angular production build and all eight existing database/API/navigation/CSS tests passed. Browser visual verification was unavailable because no browser executable is installed in the build environment. Telephony execution remains local demo behavior.

This ZIP excludes node_modules and Angular caches. Run npm.cmd install before npm.cmd start. Keep the included data folder or copy your own backed-up data folder before starting.


## Settings and Smart View screenshot edition

The top bar now has **Settings** on every signed-in screen. It opens the personal drawer with Online, Break, Meeting, Lunch, Training and Demo, plus Vertical/Horizontal menu layout and Sign Out. Choices persist separately for each account. Owner can open Global Settings from this drawer.

Under Leads, **Manage Leads**, **Smart View** and **Calendar** now have separate routes. Smart View follows the supplied three-column card layout with Today's Total, Call Back and Interested totals, grouped lead cards, scheduled time badges and Call Now. Today's Total counts visible leads with follow-ups due today, or newly added today when no follow-up exists. Call Now opens the profile and records a demo call; it does not dial a phone.

Actions includes add, import, export, assignment and restorable bulk deletion. Filters includes Owner, Project, Source, Hidden Source, Sub Call Type, Lead Type, Date Added/Follow-up Date, All Time/Today/Last 7 Days/This Month/Custom Range. Calendar has month/week views, Today, period navigation and follow-up links. It shows the latest follow-up for each accessible lead; completion tracking remains unavailable.

Global Settings now includes Add/Edit Configuration with method, parameter format, call/end-call URLs, placeholder hints, DID reference and CRM/API flags. DID Management supports Add/Edit/Delete, provider, assignment, validity and an active DID card. These save provider references only and do not execute URLs or provision telephony. Role editing includes a View/Add/Edit/Delete matrix. It narrows the existing base role, with server checks for lead/user/master/campaign operations and corresponding menu visibility; Owner keeps full administrative access. Sub Call Type editing includes Connected/Not Connected classification.

The new OBD form accepts a CSV and MP3/WAV/OGG file. It saves up to 2,000 validated contacts and audio up to 8 MB together in one database transaction. Imported campaigns retain only their uploaded contacts when started/stopped. Download Sample CSV provides the required mobile_number/name/city structure. Local queue controls still require a provider adapter for real broadcasts. Campaign state changes appear in the notification dropdown. The lead profile has alternating Activity Timeline cards, retaining the existing authenticated recording player.

Project Wise Report now includes Total Leads, Active Projects, Conversion (Booked leads divided by leads in range), Top Project and the Volume Velocity bar chart from the supplied reference, followed by the detailed table.

Validation: Angular production build; nine automated API/database/navigation/style tests, including account-scoped settings, configuration persistence, OBD transaction/target retention and restrictive permissions. Visual browser verification was unavailable because browser download failed in the build environment.

## Bulk India DID setup — Airtel account pending

Open Owner → Settings → Global Settings → DID Management. Download the Bulk DID CSV Template, replace its placeholders with numbers allocated to your business by the provider, and import. Columns: `did,provider,agent_username,agent_mobile,ring_mode`. National India numbers are normalized to +91; the ring mode accepts `browser`, `mobile` or `both`. Up to 2,000 rows are supported. Invalid numbers, duplicate numbers, unknown agents and invalid ring modes reject the entire batch without partial saves.

Select DID cards to assign several numbers to one active agent. For mobile/both routing, supply the agent's India mobile as +91 plus 10 digits. Assignment saves local preferences and marks provider verification as pending; it does not provision or route numbers at the carrier. Imported numbers remain Draft. No numbers are purchased or generated by this software.

Calling Configuration now saves the carrier, service type, incoming destination (default both), non-secret account reference and public CRM HTTPS address. This is preparation only: the existing call actions remain explicitly labelled demo calls. This package does not yet contain a live Airtel/ACT adapter or a browser phone, and cannot receive or place PSTN calls until the account's voice service and integration details are supplied.

To finish the live integration, identify the exact Airtel product: IQ Voice, SIP Trunk or PRI. For IQ Voice, obtain the account-specific API/authentication and callback specifications, allocated DIDs, approved caller IDs and browser calling capability from Airtel. For SIP/PRI, provide the PBX type and its API/WebRTC interface specifications. Incoming calls need the provider/PBX's actual routing and browser registrations, not only a saved preference. Airtel's official sample states that callback URLs must be whitelisted and real-time events/CDRs handled by the integrator. Confirm both-device ringing behavior with the enabled service.

Official references checked for this edition:
- https://www.airtel.in/b2b/cloud-telephony
- https://www.airtel.in/business/b2b/airtel-iq/api-docs/voice/overview
- https://github.com/airteliq/airtel-iq-click-to-call-sample
- https://www.actcorp.in/company

Validation: ten automated tests pass, including bulk DID validation, atomic imports, duplicate protection, Owner-only access, assignment persistence and verification that saving connection preferences does not enable calls. Angular production build passes.


## Local dummy phone edition

No Airtel account, SIP password, PBX hardware or internet telephony connection is needed to practice this edition. It includes a local simulator with a dummy PBX, per-account extensions, dummy DID labels, incoming/outgoing workflows and SQLite call history.

### Run and practice

1. Extract the full ZIP and open the nikhand-crm folder containing package.json.
2. Install Node.js 24 or newer if needed. Run npm.cmd install, then npm.cmd start.
3. Visit http://localhost:3100/#/demo-phone and choose Owner. Use owner / Owner@12345 on the supplied demo database.
4. Open Voice Quality → Demo Phone if you are on another screen.
5. Click Load Dummy Setup once. This creates one clearly labelled dummy DID for each active account. Running setup again does not duplicate them.
6. Select your dummy DID. Enter Demo Customer or another practice label. Linking an existing CRM lead is optional.
7. Click Demo Outgoing Call, then Simulate Customer Answer, then Hang Up Demo Call.
8. Click Simulate Incoming Call. Browser and virtual mobile indicators ring on screen. Choose Answer in Demo Browser, Answer on Virtual Mobile, or Reject.
9. On a connected demo call, try Mute/Unmute and Hold/Resume. They update simulated state only.
10. Review Demo Call History and export CSV if needed. Refreshing/reopening the page retains calls in SQLite; end any active call before starting another.

Other demo accounts are tl / Team@12345 and user / User@12345 (choose the matching login role). Each account uses its own extension, dummy DID and private simulator history. Owner must load setup once before these accounts practice.

### What is simulated

- PBX: Local Demo PBX; softphone: CRM Demo Softphone; server label: localhost.
- Extension: 1000 plus the account ID, such as 1001 for the supplied Owner and 1003 for User.
- DID labels: DEMO-DID-001, DEMO-DID-003 and so on. They are not dialable numbers.
- Both-device ringing: visual indicators in the CRM, including a virtual mobile. No physical mobile or desk phone rings.
- Connected duration: elapsed seconds in the simulation. Mute and hold do not operate an audio stream; no microphone/audio is requested.
- Calls are written to demo_phone_calls and marked DEMO in the shared calls log. No real call, billable provider operation, SMS, WebRTC session or SIP connection is started.

Smart View Call Now and the lead profile PBX/demo action now open the simulator with the lead selected. Existing campaign demo logging remains available separately.

### Database and updates

The full ZIP includes data/crm.sqlite. The backend adds the demo_phone_calls table automatically and preserves existing records. Back up your current data folder before updating; copy it into this edition to keep your local work. Load Dummy Setup only creates clearly labelled simulator DID references; it does not change allocated real DID rows or provision numbers.

Backend implementation: server/demo-phone.cjs. Frontend: src/app/app.component.ts, app.component.html and workspace.css. Eleven tests pass, including call state transitions, duplicate active-call protection, idempotent setup, user isolation, call-role restrictions, duration/history persistence, earlier CRM APIs and database migrations. Angular production build passes. Visual browser checking remains unavailable in this environment.

Actual Airtel PRI calling still requires identifying and integrating the office PBX/softphone server. This local simulator is ready to use while those details are collected.


## October 17 campaign and activity update

See **UPDATE-OCT17.md** for campaign-card imports, the supplied CSV formats, Connected/Not Connected activity fields, Hot/Warm/Cold, master selections, user-wise disposition matrix and matching Activity Details exports. Source and database changes are additive.


## Client and Project Master update

Project Master now requires a client selected from all saved Client Master entries and displays the linked client name. The lead profile heading and Service (Optional) field have been removed. See **DATABASE-SETUP.md** for step-by-step local installation, database creation, backups and client/project usage. Run `npm.cmd run db:init` after installing dependencies to create or upgrade SQLite safely.


## Airtel IQ Cloud Telephony

Open Demo Phone for the new Airtel IQ panel. Dummy mode works without credentials and persists call history. A server-side adapter for Airtel callflow-component APIs is included, with protected callbacks and account-specific inbound normalization. Live account activation and validation are required; see AIRTEL-IQ-SETUP.md. Database remains SQLite.


## Vonage Business Communications

The Vonage panel in Demo Phone supports local simulated calls and a VBC Integration Platform adapter. Follow VONAGE-SETUP.md for live account, webhook and device setup. Live calls have not been tested with a provider account.


## Call activity sync

Lead timelines display linked call status alongside logged activities. Call history, lead lists and dashboard reports refresh approximately every eight seconds in a visible browser tab. See LIVE-CALL-HISTORY.md for call matching, access and setup details.
