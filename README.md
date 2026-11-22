# Group 63 — AI Projects and Services Freelancing Platform

A university group project to build a platform where clients post AI projects and freelancers offer skills, submit proposals, complete work, receive payments, and review one another.

## Project status

The backend is in `server/` and includes an Express health route, authentication routes, and SQL Server configuration. Its dependencies and run scripts are in `server/package.json`. The database setup script is `SQL_FILE/AIFreelancerDB.sql`; it creates the `AIFreelancePlatform` database and its tables. The `client/` folder has feature placeholders, but no React/Vite app or `client/package.json` yet. Each teammate will run a local backend and database using the same schema and their own local credentials.

## Agreed technology stack

- **Frontend:** React with Vite
- **Backend:** Node.js with Express
- **Database:** Microsoft SQL Server 2022
- **Database client for Node.js:** `mssql` (npm package)
- **Version control:** Git and GitHub
- **Editor:** Visual Studio Code (recommended)

The frontend is the part users see in their browser. The backend is the server that handles requests and applies application rules. SQL Server stores the shared project data. The React app should call the Express API; it should not connect directly to SQL Server.

## 1. Install the basic tools (Windows)

Install these before joining the project:

1. **Git for Windows** — [download and install Git](https://git-scm.com/install/windows). Git tracks changes and lets the team share code through GitHub.
2. **Visual Studio Code** — [download VS Code](https://code.visualstudio.com/download). It is the recommended editor, but any editor can be used.
3. **Node.js LTS** — [download Node.js](https://nodejs.org/en/download). Choose the current LTS installer. npm is included with Node.js and installs JavaScript packages.
4. **SQL Server 2022 Database Engine** — download SQL Server from [Microsoft's SQL Server downloads page](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) and install the **2022** Database Engine version agreed by the team. Developer edition is intended for development and testing. The Database Engine is the actual database server. If the download page only offers a newer version, use the SQL Server 2022 installation media provided by your course or team so everyone uses the same version.
5. **SQL Server Management Studio (SSMS)** — install SSMS from [Microsoft's SSMS download and install guide](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver16). SSMS is the graphical tool for connecting to SQL Server and running SQL files; installing SSMS alone does not install the Database Engine. Current SSMS releases can manage SQL Server 2022.

During SQL Server setup, install the Database Engine, use a local default instance unless the team agrees otherwise, and enable **Mixed Mode** if the app will connect with a SQL Server login. Set a strong administrator password and keep it private. Do not use the administrator login from the application. Once SQL Server is installed, enable TCP/IP for the instance if needed and agree with Member 1 on the instance name, port, and local app login. The usual TCP port is `1433`; the actual port depends on the instance configuration.

After installation, open **PowerShell** and check the tools. Each command should print a version:

```powershell
git --version
node --version
npm --version
```

To verify the database server, open SSMS and connect to the local SQL Server instance. Depending on the instance installed, its server name may be `localhost` or `localhost\SQLEXPRESS`; ask Member 1 which one the team is using.

If a command is not recognized, close and reopen PowerShell. If it still fails, check that the tool was installed and added to PATH.

## 2. Get the project on your computer

### First time: clone the repository

Open PowerShell in the folder where you keep your university work, then run:

```powershell
git clone https://github.com/Induwara-Hansajith/Group_63_IMR.git
cd Group_63_IMR
code .
```

If `code .` is not recognized, open VS Code from the Start menu and choose **File → Open Folder**, then select the `Group_63_IMR` folder.

### Later: get your teammates' latest changes

In PowerShell, move into the project folder and update your local `main` branch:

```powershell
cd path\to\Group_63_IMR
git switch main
git pull origin main
```

Replace `path\to\Group_63_IMR` with the actual folder path on your computer. For example:

```powershell
cd "$HOME\Documents\Group_63_IMR"
```

## 3. Set up SQL Server for local development

Each teammate needs the SQL Server **Database Engine** on their computer; SSMS is only the management app. Use the SQL Server version agreed by the team, enable TCP/IP, and configure the local instance to listen on the port used in that teammate's `.env` (the examples below use `1433`).

1. Start SSMS and connect to your local instance with Windows Authentication.
2. Open `SQL_FILE/AIFreelancerDB.sql` and execute it (press **F5**). The script creates `AIFreelancePlatform` if it does not exist, then creates the tables and initial role rows. Run it on a fresh database; it is not a migration script and should not be rerun over existing tables.
3. Create a local SQL Server login for the app, such as `app_user`, with a password. Map it to `AIFreelancePlatform`, enable it, and grant only the roles the app needs (for the current API, `db_datareader` and `db_datawriter`). SQL logins require **SQL Server and Windows Authentication mode** (mixed mode).
4. Keep the login password on your computer and put it in your own `server/.env`. Never use the SQL Server administrator login for the app.

Each teammate has a separate local database and login. The SQL script is shared; passwords and `.env` files are not.

## 4. Install and run the application

### Local ports for every teammate

Use these defaults on each teammate's own computer:

| Service | Port | Local address / setting |
|---|---:|---|
| React/Vite frontend | `5173` | `http://localhost:5173` |
| Express API | `3000` | `http://localhost:3000` (`PORT=3000`) |
| SQL Server Database Engine | `1433` | `localhost:1433` (`DB_PORT=1433`) |

Each member can use the same port numbers because each has a separate local computer. If Vite reports that `5173` is busy, use the address it prints and set `CLIENT_ORIGIN` to that exact frontend address. If SQL Server uses a different port, set `DB_PORT` to that port. If you run two copies of a service on the same computer, give one a different port and update its URLs/settings too.

### Backend

From the repository root, open a PowerShell terminal and run:

```powershell
cd server
npm install
npm run dev
```

Leave the terminal open while developing. The API uses port `3000` by default. Visit `http://localhost:3000/api/health`; the expected response is `{"status":"ok"}`. This endpoint confirms the API responds; it does not itself query SQL Server. A database login or connection error will appear in the backend terminal.

### Frontend

The `client/` folder currently has feature folders but no React app or `package.json`. Yes, the team should set up React with Vite **inside `client/`**, once, and share that scaffold through Git. Do not install React globally or in `server/`. Have the person coordinating shared setup run:

```powershell
cd client
npm create vite@latest . -- --template react
```

If Vite asks how to handle the non-empty folder, choose the option to keep/ignore existing files; do not delete the feature placeholders. Then run `npm install` in `client/`.

After the React/Vite scaffold has been added, each teammate can run it in a second terminal:

```powershell
cd client
npm install
npm run dev
```

Use the local browser URL printed by Vite (commonly `http://localhost:5173`). The React app should call the Express API; it should never connect directly to SQL Server.

## 5. Local environment variables

Create `server/.env` locally and fill in your own SQL login password and a newly generated JWT secret. Example keys and non-secret settings:

```dotenv
PORT=3000
CLIENT_ORIGIN=http://localhost:5173

DB_SERVER=localhost
DB_PORT=1433
DB_NAME=AIFreelancePlatform
DB_USER=app_user
DB_PASSWORD=your_local_sql_login_password
DB_ENCRYPT=true
DB_TRUST_SERVER_CERT=true

JWT_SECRET=your_own_random_secret
JWT_EXPIRES_IN=1h
```

`DB_SERVER`, `DB_PORT`, and `DB_NAME` must match your local SQL Server setup. If your instance uses a different port, update `DB_PORT`. `DB_TRUST_SERVER_CERT=true` is for local development with a self-signed certificate only. Keep real `.env` files, passwords, and JWT secrets out of Git; use your own secret values and share only a redacted `.env.example`.

## 6. Team responsibilities and assigned folders

Each member owns the feature folders listed below. Put your UI code in your `client` folder and your API code in the matching `server` folder. Keep each feature's files inside those paths so members can work in parallel against one agreed database design.

| Member | Assigned folders | Main work |
|---|---|---|
| **1** | `database/`; `client/src/features/accounts/`; `server/src/modules/accounts/` | Design and create the complete database schema, keys, relationships, constraints, and seed scripts; build authentication and freelancer/client profile features; coordinate shared naming and integration. |
| **2** | `client/src/features/skills-services/`; `server/src/modules/skills-services/` | Build the AI skill/service catalogue, freelancer skill/service management, and expertise browsing or filters. |
| **3** | `client/src/features/projects/`; `server/src/modules/projects/` | Build client project posting/editing, project requirements, and project browsing/search. |
| **4** | `client/src/features/proposals-assignments/`; `server/src/modules/proposals-assignments/` | Build proposal submission/review, freelancer selection, assignments, and project progress features. |
| **5** | `client/src/features/payments-reviews-reports/`; `server/src/modules/payments-reviews-reports/` | Build payment and review features, admin/manager views as agreed, and project/payment reports. |

Members 2–5 should tell Member 1 what queries, views, procedures, or database changes their features need before changing shared schema objects. Everyone should test their feature against the shared schema and add or update relevant tests/documentation. Agree as a team who implements each required trigger, user-defined function (UDF), stored procedure, and view so every coursework requirement is covered.

### Folder ownership rules

- Work only in your assigned feature folders unless the team agrees that a shared file needs to change.
- Member 1 owns the shared database script in `SQL_FILE/` and coordinates the database schema. Do not create a separate database schema for an individual feature.
- Shared setup files such as `client/package.json`, `server/package.json`, the application entry points, route registries, shared components, `.env.example`, and `.gitignore` affect everyone. Member 1 coordinates changes to these files; discuss a change before editing them.
- Keep feature-specific UI, API logic, and tests with that feature. If a module needs another module's data or API, agree on the interface with that member before depending on it.
- The feature folders currently contain `.gitkeep` placeholders. Replace them with feature files when work begins. The backend's shared entry point, route registry, database config, and frontend scaffold affect everyone, so coordinate changes to those files.

## 7. Basic Git workflow for each task

Do not work directly on `main`. For each feature or fix, create a separate branch from the latest `main`:

```powershell
git switch main
git pull origin main
git switch -c feature/short-task-name
```

Examples: `feature/freelancer-profile`, `feature/project-search`, `feature/payment-records`.

When your work is ready, review your changes and run the tests available for your feature:

```powershell
git status
git diff
```

Commit and push your branch when you are ready to share it, then open a GitHub Pull Request for review. Keep commits focused on one task and do not include `.env`, passwords, `node_modules`, or generated build output. If a teammate changes a shared table or API, coordinate with them before merging dependent work.

## 8. Repository folder layout

The member-owned feature folders are in place. The backend runs; the React/Vite frontend scaffold still needs to be added once under `client/`.

```text
Group_63_IMR/
├── client/
│   └── src/features/
│       ├── accounts/                    # Member 1
│       ├── skills-services/             # Member 2
│       ├── projects/                    # Member 3
│       ├── proposals-assignments/       # Member 4
│       └── payments-reviews-reports/    # Member 5
├── server/
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── middleware/
│       │   └── requireAuth.js
│       ├── routes/
│       │   └── auth.routes.js
│       └── modules/                     # feature work
│           ├── accounts/                # Member 1
│           ├── skills-services/         # Member 2
│           ├── projects/                # Member 3
│           ├── proposals-assignments/   # Member 4
│           └── payments-reviews-reports/ # Member 5
├── SQL_FILE/
│   └── AIFreelancerDB.sql               # shared database setup
├── docs/                                # Shared diagrams and documentation
└── README.md
```

## 9. Common setup problems

- **`git`, `node`, or `npm` is not recognized:** restart PowerShell after installing; if it still fails, repair the installation or add the tool to PATH.
- **Cannot connect to SQL Server:** check that the SQL Server service is running, TCP/IP is enabled if the Node app connects over TCP, the instance/port match the team's configuration, and your login has access to the database.
- **`npm run dev` says the script is missing:** check that you are in `server/` and that `server/package.json` is present. The `client/` folder has no package script until the React/Vite scaffold is added.
- **`Login failed for user 'app_user'`:** confirm the SQL login is enabled, its password matches `DB_PASSWORD`, it is mapped to `AIFreelancePlatform`, and SQL Server is in mixed mode.
- **A teammate has no frontend `package.json`:** the React/Vite scaffold has not been added yet; coordinate once to create it inside `client/`, preserving the feature folders.
- **A teammate's changes conflict with yours:** do not discard either version. Contact the owners of the affected files and resolve the conflict together before completing the merge.

## Useful official guides

- [Git basics](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control)
- [Vite getting started](https://vite.dev/guide/)
- [SQL Server 2022 installation guide](https://learn.microsoft.com/en-us/sql/database-engine/install-windows/install-sql-server?view=sql-server-ver16)
- [SSMS documentation](https://learn.microsoft.com/en-us/ssms/)
- [`mssql` Node.js package](https://github.com/tediousjs/node-mssql)
