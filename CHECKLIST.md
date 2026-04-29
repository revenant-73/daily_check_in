# Project Roadmap & Product Backlog

This document breaks down the "Daily Check-In" app into **Milestones** (phases) and **Tickets** (individual tasks). Each ticket contains specific **Acceptance Criteria** (what needs to be done).

---

## 🏗️ Milestone 1: Technical Foundation (The "Basics")
*Setting up the tools and database that the app will run on.*

### 🎫 Ticket #101: Project Scaffolding
- **Goal**: Prepare the code environment.
- **Actions**:
    - [x] Initialize Next.js with TypeScript and Tailwind CSS.
    - [x] Create project folder structure (`/components`, `/lib`, `/hooks`).
    - [ ] Install core dependencies: `lucide-react`, `zod`, `clsx`.

### 🎫 Ticket #102: Database Layer (Turso & Drizzle)
- **Goal**: Connect the app to a "brain" (the database) that never sleeps.
- **Actions**:
    - [ ] Install `drizzle-orm`, `@libsql/client`, and `drizzle-kit`.
    - [ ] Create **Schema Definitions** in `src/lib/db/schema.ts` (Tables for Users, Teams, and Check-ins).
    - [ ] Configure `drizzle.config.ts` for database migrations.

### 🎫 Ticket #103: Identity & Access (Auth.js)
- **Goal**: Let users sign in and keep their data private.
- **Actions**:
    - [ ] Install `next-auth` (Auth.js) and the Drizzle adapter.
    - [ ] Set up "Roles" (Admin vs. Coach vs. Player).
    - [ ] Create a basic Login page.

---

## 🏃 Milestone 2: Player Experience (The "Check-In")
*Building the core features athletes use every day at practice.*

### 🎫 Ticket #201: Daily Entry Form
- **Goal**: A fast, mobile-friendly way to submit goals.
- **Actions**:
    - [ ] Create a text input for the "Daily Practice Goal".
    - [ ] Build 3 sliders (Mental, Physical, Emotional) rated 1-10.
    - [ ] Add a "Submit" button with a success confirmation.

### 🎫 Ticket #202: Personal History View
- **Goal**: Let athletes see their own growth over the season.
- **Actions**:
    - [ ] Create a list view showing past goals.
    - [ ] Build a small "Readiness Graph" showing rating trends over the last 7 days.

---

## 📋 Milestone 3: Coach Dashboard (The "Command Center")
*Tools for coaches to see how the team is doing before practice starts.*

### 🎫 Ticket #301: Team Attendance/Submission Tracker
- **Goal**: See who has (and hasn't) checked in yet today.
- **Actions**:
    - [ ] Build a dashboard showing a list of players.
    - [ ] Add "Checked In" vs. "Pending" status badges.

### 🎫 Ticket #302: Team Readiness Insights
- **Goal**: Visualize how the team feels today.
- **Actions**:
    - [ ] Create charts showing the *average* team mental/physical state.
    - [ ] List all individual player goals for the coach to scan.

---

## 🛠️ Milestone 4: Admin & Management
*Control center for the whole program.*

### 🎫 Ticket #401: Team & Roster Management
- **Goal**: Add new teams and manage who coaches them.
- **Actions**:
    - [ ] Build an interface to create a new "Team".
    - [ ] Generate unique Invite Codes/QR Links for players to join.

---

## 📱 Milestone 5: Polishing & Deployment
*Making it look professional and putting it on the internet.*

### 🎫 Ticket #501: Mobile UI/UX Audit
- **Goal**: Ensure it works perfectly on phones.
- **Actions**:
    - [ ] Test thumb-reachability for sliders.
    - [ ] Optimize font sizes for outdoor sunlight visibility.

### 🎫 Ticket #502: Production Launch
- **Goal**: Make the app live.
- **Actions**:
    - [ ] Deploy to Vercel.
    - [ ] Connect production Turso database.
