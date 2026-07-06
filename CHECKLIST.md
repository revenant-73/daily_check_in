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
    - [x] Install core dependencies: `lucide-react`, `zod`, `clsx`.

### 🎫 Ticket #102: Database Layer (Turso & Drizzle)
- **Goal**: Connect the app to a "brain" (the database) that never sleeps.
- **Actions**:
    - [x] Install `drizzle-orm`, `@libsql/client`, and `drizzle-kit`.
    - [x] Create **Schema Definitions** in `src/lib/db/schema.ts` (Tables for Users, Teams, and Check-ins).
    - [x] Configure `drizzle.config.ts` for database migrations.

### 🎫 Ticket #103: Identity & Access (Auth.js)
- **Goal**: Let users sign in and keep their data private.
- **Actions**:
    - [x] Install `next-auth` (Auth.js) and the Drizzle adapter.
    - [x] Set up "Roles" (Admin vs. Coach vs. Player).
    - [x] Create a basic Login page.

---

## 🏃 Milestone 2: Player Experience (The "Check-In")
*Building the core features athletes use every day at practice. Goal: Mobile-first & thumb-friendly.*

### 🎫 Ticket #201: Daily Entry Form
- **Goal**: A fast, mobile-friendly way to submit goals.
- **Actions**:
    - [x] Create a text input for the "Daily Practice Goal".
    - [x] Build 3 sliders (Mental, Physical, Emotional) rated 1-10.
    - [x] Add a "Submit" button with a success confirmation.
    - [x] **Mobile Audit**: Ensure sliders have large touch targets and the submit button is easily clickable with one hand.

### 🎫 Ticket #203: Goal-Focused Reflection
- **Goal**: Help athletes reflect on their specific intent.
- **Actions**:
    - [x] **Contextual Rating**: Star rating now asks about performance on the specific daily goal.
    - [x] **Future Intent**: Added "Note for next session" text area.
    - [x] **Persistence**: Schema updated to store next session reflections.

---

## 📋 Milestone 3: Coach Dashboard (The "Command Center")
*Tools for coaches to see how the team is doing before practice starts. Goal: Data-dense desktop view, responsive mobile view.*

### 🎫 Ticket #301: Team Attendance/Submission Tracker
- **Goal**: See who has (and hasn't) checked in yet today.
- **Actions**:
    - [x] Build a dashboard showing a list of players.
    - [x] Add "Checked In" vs. "Pending" status badges.
    - [x] **Responsive Design**: List layout for mobile, multi-column grid for desktop.

### 🎫 Ticket #302: Team Readiness Insights
- **Goal**: Visualize how the team feels today.
- **Actions**:
    - [x] Create charts showing the *average* team mental/physical state.
    - [x] List all individual player goals for the coach to scan.
    - [x] **Desktop Optimization**: Use full screen width for side-by-side charts and data tables.

---

## 🛠️ Milestone 4: Admin & Management
*Control center for the whole program.*

### 🎫 Ticket #401: Team & Roster Management
- **Goal**: Add new teams and manage who coaches them.
- **Actions**:
    - [x] Build an interface to create a new "Team".
    - [x] Generate unique Invite Codes/QR Links for players to join.

---

## 📱 Milestone 5: Polishing & Deployment
*Making it look professional and putting it on the internet.*

### 🎫 Ticket #501: Mobile UI/UX Audit
- **Goal**: Ensure it works perfectly on phones.
- **Actions**:
    - [x] Test thumb-reachability for sliders.
    - [x] Optimize font sizes for outdoor sunlight visibility.

### 🎫 Ticket #502: Production Launch
- **Goal**: Make the app live.
- **Actions**:
    - [x] Deploy to Vercel.
    - [x] Connect production Turso database.
    - [x] **Bug Fix**: Fix "undefined URL" error by ensuring all server actions use `"use server"`.
    - [x] **Security**: Added `AUTH_SECRET` for production authentication.

### 🎫 Ticket #503: Demo & Testing
- **Goal**: Facilitate easy testing for stakeholders.
- **Actions**:
    - [x] Create a database seeding script for demo accounts.
    - [x] Add high-contrast "One-Click" Demo Login buttons for all roles.
    - [x] Seed production/local database with Player, Coach, and Admin test users.

---

## 🚀 Milestone 7: Enhancements & Optimization
*Polishing the experience for all users based on initial audit.*

### 🎫 Ticket #701: Coaching Intelligence (Alerts & Delta)
- **Goal**: Surface critical data and trends.
- **Actions**:
    - [x] **Low-Readiness Alerts**: Highlight players with scores < 4 on the dashboard.
    - [x] **Trend Delta (Δ)**: Display week-over-week changes for team averages.
    - [x] **High-Five Feedback**: Add a "reaction" button for coaches to acknowledge player goals.

### 🎫 Ticket #702: Player Engagement (Speed & Habits)
- **Goal**: Make check-ins faster and more rewarding.
- **Actions**:
    - [x] **Goal Templates**: Implement a "Quick Select" for common practice goals (65+ curated goals).
    - [x] **Goal Dropdown**: Added searchable dropdown for easier goal selection.
    - [ ] **Streaks**: Display check-in consistency on the player dashboard.

### 🎫 Ticket #703: Admin & Data Management
- **Goal**: Steamline onboarding and data access.
- **Actions**:
    - [ ] **Bulk Roster Import**: Implement CSV upload for players.
    - [x] **Direct Invite Links**: Support `?code=XXXX` in onboarding for one-click team joining.
    - [ ] **Invite QR Codes**: Generate scannable links for team joining.
    - [ ] **Data Export**: Add CSV export for team readiness data.

### 🎫 Ticket #705: Player Feedback & Testing
- **Goal**: Collect insights from players during the testing phase.
- **Actions**:
    - [x] **Feedback Table**: Create database schema for feedback collection.
    - [x] **Feedback Form**: Build a dedicated `/feedback` page and form.
    - [x] **Dashboard Integration**: Add "Give Feedback" link to the global Header.

### 🎫 Ticket #704: UI/UX & Performance
- **Goal**: Professionalize the interface and feel.
- **Actions**:
    - [ ] **Dynamic Theming**: Implement `next-themes` for system light/dark mode.
    - [ ] **Skeleton Loaders**: Add loading states for dashboard charts and tables.

---

## ✨ Milestone 6: Philosophy & Branding
*Aligning the platform with core coaching values and philosophy.*

### 🎫 Ticket #601: Philosophy Alignment
- **Goal**: Reflect TVVC and Century Volleyball philosophies in the app's messaging.
- **Actions**:
    - [x] Refactor Promo page to focus on Growth, Connection, and Bravery.
    - [x] Shift messaging from "elite performance" to "athlete wellbeing".
    - [x] Update calls-to-action to "Start Your Season" and "Play Brave".
