# October 17 CRM update

This edition includes the complete Angular source, Express backend, SQLite database and production build. Node.js 24 or newer is required.

## Auto Dial Center: import into every campaign

1. Sign in as Owner or Team Leader and open Autodial → Auto Dial Center.
2. Find the campaign card, for example September follow-ups.
3. If it is running, click Stop first. Completed campaigns must be reopened before importing.
4. Click the Import button on that card.
5. Choose a default owner who belongs to the campaign's team/group.
6. Select your CSV. A preview validates it and shows new contacts, existing contacts to link, duplicates skipped, and row errors.
7. Click Import Contacts. The entire batch is rejected if any row is invalid; no partial contacts are saved.
8. Use the campaign's members/report button to review imported contacts and updated totals.

Each card has its own Import action. Import appends to the selected campaign. It does not replace previous members. Existing contact fields are kept when linking the same mobile number for the same owner; file duplicates and existing campaign members are skipped. Subsequent Start/Stop actions do not pull unrelated new team contacts into a manually imported campaign.

Maximum 2,000 rows and 2 MB per batch. Importing contacts does not start real phone calls.

## Supported CSV formats

The samples folder contains:
- auto-dial-import-sample.csv — the supplied Auto Dial sample, with Name, Company, Email, Mobile Number, Alternate Number, Source, Hidden Source, Address, Area, City and Pincode.
- manage-lead-import-template.csv — the supplied header-only Manage Lead template, with its nine leads_* columns. Add contact rows before using it.
- activity-details-columns.csv — the exact 11 export column headers from the supplied Activity Details report. The historical personal contact rows in the uploaded report are not automatically loaded into this demo database.

Manage Leads and Smart View have Import Leads. They also open the preview/import dialog and accept either of the first two formats, plus the earlier name/mobile format. Owner values may be existing usernames, unique display names or user IDs. An unknown, ambiguous or out-of-scope owner is a row error. Empty owner cells use the selected default owner. Imports never create user accounts.

Imported company, alternate number, hidden source, address, area, city and pincode are stored as separate fields. Imported latest status and follow-up date are preserved. Follow-up dates accept ISO-style dates or DD-MM-YYYY HH:mm (two-digit year is also accepted); dates without a timezone use the local server's timezone. They appear in the lead's smart card/calendar when there is no later saved activity follow-up.

## Lead activity form: all supplied screenshots

- Call Type: Connected or Not Connected.
- Sub Call Type changes with Call Type. Connected includes Builder, Already Purchased, Call Back, CG Leads, Channel Partner, Interested, Not Interested and all other options shown in the supplied dropdown. Not Connected includes Call waiting, Incoming Barred, Invalid Number, Number Busy, Others, Out of Service, RNR, Skipped, Switch off / Not Reachable, Unable to connect and Voice mail.
- Disposition: Hot, Warm or Cold. This is stored separately from the actual sub-call outcome.
- Feedback / notes is required for new screenshot-format activities.
- Connected activities show Project, Location, Budget and Property Type selectors from Masters. These are saved with the activity and update the lead profile.
- Not Connected hides those property selectors and retains the lead's previous selections.
- Activity date/time, next follow-up date/time, lead information, history and voice imports remain available.
- Existing older activity records are retained and remain reportable.

## Activity Dashboard Report

Choose a date range and click Search Report.
- User-wise Disposition Breakdown has a horizontally scrolling sub-call-type matrix, agent rows, a total row, Copy Table and Export Matrix.
- Case variants such as Interested/interested are counted together. SMS drafts are excluded.
- Hot/Warm/Cold is separate from the sub-call-type columns.
- Download Details follows the supplied report headers exactly: ID, Name, Mobile, Project, Status, Activity Date, Follow Up Date, Source, Owner, Last Feedback, Created At.
- ID identifies the activity. Status is the sub-call type, with the older disposition as a fallback. Project uses the saved activity snapshot where available. Dates are formatted DD-MM-YY HH:mm in the browser's local time.
- Preview Activity Details shows the first 100 rows; the download includes all matching rows.

## Run or update locally

Stop the old server using Ctrl+C. Back up your data folder. Extract this edition to a separate folder and copy your existing data folder into nikhand-crm if you want to retain your local records. Do not replace your current records with the supplied demo database.

Open CMD in nikhand-crm (the folder containing package.json):

```bat
npm.cmd install
npm.cmd start
```

Open http://localhost:3100 and choose Owner: owner / Owner@12345 on the supplied database. If reusing your old data folder, use your existing password. Refresh with Ctrl+F5.

Calling remains local simulation. This edition does not add live Airtel/PBX/WebRTC media. No imported number is dialed automatically.

## Validation

Angular production build and 14 automated tests pass. New tests cover the supplied import headers, quoted and multiline CSV cells, per-campaign targeting, group/team restrictions, duplicate protection, atomic rejection, stopped/running campaign behavior, heat/outcome separation, property snapshots, report totals and export headers. Existing account, campaign, database, routing and style checks remain passing. Visual browser comparison was not performed in this environment.
