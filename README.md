# Group 63 — AI Projects and Services Freelancing Platform

A university group project to build a platform where clients post AI projects and freelancers offer skills, submit proposals, complete work, receive payments, and review one another.

## Project status

This repository currently contains the README only. The application source code, database scripts, and dependency files still need to be added by the team. Do not run `npm install` or `npm run dev` in this repository until the relevant `package.json` files have been committed by a team member.

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

1. Start **SSMS** and connect to the SQL Server instance configured on your computer. Use Windows Authentication for the initial local administrator connection, or the SQL Server login configured during installation.
2. When Member 1 adds the database schema, open the `.sql` file from the repository's `database/` folder in SSMS and run it with **Execute** (or press **F5**). Confirm the target database in the query toolbar before executing.
3. If a seed-data script is provided, run it after the schema script. Seed data is sample data for development; do not use real passwords or personal information.
4. Ask Member 1 for the agreed database name, instance/port, and local application login. The Node backend will use the `mssql` package to connect; do not use the SQL Server administrator login in application code.

The actual schema file and database name have not been added to this repository yet, so these database import steps become usable once the team adds those files.

## 4. Install and run the application

The frontend and backend will have their own `package.json` files. Once the team adds them, open **two PowerShell terminals** in VS Code.

In the first terminal, install and start the backend (the exact folder and script names will be confirmed in the backend `package.json`):

```powershell
cd server
npm install
npm run dev
```

In the second terminal, install and start the frontend:

```powershell
cd client
npm install
npm run dev
```

Vite normally prints a local browser address, commonly `http://localhost:5173`. Use the address printed in your terminal. The Express API's address and port will be documented when the backend is added.

Do not create duplicate project scaffolds if another member has already created `client/`, `server/`, or the shared database scripts. Coordinate first and use the `package.json` scripts provided by the team.

## 5. Local environment variables

The backend will need local settings to connect to SQL Server. When the backend owner adds `.env.example`, copy it to `.env` and fill in the local values shown by the team. A typical configuration may look like this:

```dotenv
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=ai_freelance_platform
DB_USER=app_user
DB_PASSWORD=replace_with_your_local_password
DB_ENCRYPT=true
DB_TRUST_SERVER_CERT=true
```

These names and values are examples and must match the actual configuration created by the team. For a named SQL Server instance, use the instance name agreed by the team instead of assuming port `1433`. `DB_TRUST_SERVER_CERT=true` is only for a local development server with a self-signed certificate. Keep `.env` out of Git: commit a placeholder `.env.example`, never your real password. If you are unsure, ask Member 1 before changing database settings.

## 6. Team responsibilities

The repository uses feature areas so members can work in parallel against one agreed database design.

| Member | Owns | Main work |
|---|---|---|
| **1 — You** | Shared database and accounts | Design and create the complete database schema, keys, relationships, baseline constraints, and setup/seed scripts; build authentication and freelancer/client profile features; coordinate shared naming and integration. |
| **2** | Skills and services | Build the AI skill/service catalogue, freelancer skill/service management, and expertise browsing or filters. |
| **3** | Projects | Build client project posting/editing, project requirements, and project browsing/search. |
| **4** | Proposals and tracking | Build proposal submission/review, freelancer selection, assignments, and project progress features. |
| **5** | Payments, reviews, and reporting | Build payment and review features, admin/manager views as agreed, and project/payment reports. |

Members 2–5 should tell Member 1 what queries, views, procedures, or database changes their features need before changing shared schema objects. Everyone should test their feature against the shared schema and add or update relevant tests/documentation. Agree as a team who implements each required trigger, user-defined function (UDF), stored procedure, and view so every coursework requirement is covered.

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

## 8. Suggested project layout

The following layout is a proposal for the team to create. It is not present yet:

```text
Group_63_IMR/
├── client/                 # React + Vite frontend
├── server/                 # Express API
├── database/               # schema, migrations, seed data, database notes
├── docs/                   # ER diagram, API notes, data dictionary
├── .gitignore
└── README.md
```

## 9. Common setup problems

- **`git`, `node`, or `npm` is not recognized:** restart PowerShell after installing; if it still fails, repair the installation or add the tool to PATH.
- **Cannot connect to SQL Server:** check that the SQL Server service is running, TCP/IP is enabled if the Node app connects over TCP, the instance/port match the team's configuration, and your login has access to the database.
- **`npm run dev` says the script is missing:** check that you are in the correct folder and that the package's `package.json` defines a `dev` script. The application files have not been added to this repository yet.
- **A teammate's changes conflict with yours:** do not discard either version. Contact the owners of the affected files and resolve the conflict together before completing the merge.

## Useful official guides

- [Git basics](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control)
- [Vite getting started](https://vite.dev/guide/)
- [SQL Server 2022 installation guide](https://learn.microsoft.com/en-us/sql/database-engine/install-windows/install-sql-server?view=sql-server-ver16)
- [SSMS documentation](https://learn.microsoft.com/en-us/ssms/)
- [`mssql` Node.js package](https://github.com/tediousjs/node-mssql)
