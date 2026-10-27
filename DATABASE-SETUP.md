# Local CRM and database setup (Windows)

This CRM uses SQLite. The database is a file named `data/crm.sqlite`; MySQL, XAMPP and a separate database server are not required. The package includes a demo database. The same command below creates a database if it is missing, or upgrades an existing one without deleting records.

1. Install Node.js 24, then open a new Command Prompt.
2. Extract the ZIP. Open the `nikhand-crm` folder containing `package.json`. In File Explorer's address bar, type `cmd` and press Enter.
3. Install dependencies:
   ```bat
   npm.cmd install
   ```
4. Create or upgrade the database:
   ```bat
   npm.cmd run db:init
   ```
   Wait for the database path and success message. Tables and demo accounts are created automatically. Do not run a manual CREATE DATABASE command.
5. Start the CRM:
   ```bat
   npm.cmd start
   ```
6. Open `http://localhost:3100` and sign in with role Owner, username `owner`, password `Owner@12345`. Keep Command Prompt open while using the CRM. Change the demo password in Settings before using real customer records.

## Add clients and projects

1. Open Masters → Client → Add Client Master.
2. Enter the client's name and save. Repeat for each client.
3. Open Masters → Project → Add Project Master.
4. Enter the project name. The **Client** dropdown shows every saved Client Master entry. Select one and save.
5. The Project Master list displays the selected client's name. Edit a project to change its client.

A linked client cannot be deleted until its projects are reassigned or deleted. Existing projects without a client display **Unassigned**; edit each to select the correct client. Renaming a client updates the name shown for its projects.

Project CSV import accepts `name,client,description`. The `client` value must exactly match one unique existing Client Master name. Use the sample download on Project Master.

## See how the database stores this

Clients and projects are stored in the `records` table. `kind='clients'` identifies clients; `kind='projects'` identifies projects. A project's `clientId` references its client record's `id`. The server additionally verifies that the selected record is a client.

To view this relationship with SQL in a SQLite database tool, open `data/crm.sqlite` and run:

```sql
SELECT p.id, p.name AS project, c.name AS client
FROM records AS p
LEFT JOIN records AS c ON c.id = p.clientId
WHERE p.kind = 'projects';
```

`database-schema.sql` contains the database structure for reference. It is SQLite SQL. Use `npm.cmd run db:init` for normal setup because it also applies migrations and creates demo accounts.

## Keep your existing data

Stop the CRM with Ctrl+C before copying or backing up the database. Keep a backup of your entire existing `data` folder before upgrading. Put your existing `data` folder in the updated project instead of overwriting it with the included demo database, then run `npm.cmd run db:init`. Keep any existing uploaded files too. Existing records are preserved; the project-client column is added automatically.

For a deliberately fresh database, first stop the CRM and move your existing `data` folder to a safe backup location. Then run `npm.cmd run db:init`. This creates a new demo database, separate from your backup.

On later starts, run `npm.cmd start`; you do not need to reinstall dependencies each time. On macOS/Linux use `npm` instead of `npm.cmd`.
