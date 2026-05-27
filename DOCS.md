# Daily Check-In Web App - Documentation

## Overview
A private, mobile-first web application for athletes to set daily practice goals and track their physical, mental, and emotional readiness. Coaches and admins can view these trends to support better coaching decisions and practice design.

## Core Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Database**: **Turso (SQLite at the Edge)**
- **ORM**: **Drizzle ORM**
- **Authentication**: **Auth.js (formerly NextAuth.js)**
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts

## Design Philosophy

### 🏐 Core Values
- **Growth Over Perfection**: Embracing mistakes as fuel for improvement.
- **Play with Purpose**: Every action and intent is rooted in connection and movement.
- **Connection Before Correction**: Building trust through safe relationships and empathy.
- **Play Brave, Play Free**: Fostering resilience and joy in the struggle.

### 📱 Player View: Mobile-First & "High-Speed"
- **Primary Goal**: Submitting a check-in in under 30 seconds at the start of practice.
- **Constraints**: 
    - Must be fully operable with one hand (thumb-reachability).
    - High-contrast UI for outdoor/sunlight visibility.
    - Minimal typing; prioritize sliders and selection.

### 💻 Coach/Admin View: Data-Dense & Desktop-Optimized
- **Primary Goal**: Quick analysis of team readiness and identifying players in need of attention.
- **Constraints**:
    - Mobile-friendly (PWA ready) for quick checks on the field.
    - Dashboard layout optimized for wide screens (Laptops/Tablets).
    - Uses interactive charts and sortable data tables for deep dives.

---

## Onboarding & Team Joining

The application supports a flexible onboarding flow to ensure every user is correctly assigned to their organization and team:

1. **Invite Codes**: 
    - Each team generates two unique 6-character codes: one for **Coaches** and one for **Players**.
    - Entering a coach code automatically assigns the user the `coach` role.
    - Entering a player code assigns the `player` role.
2. **Manual Selection**:
    - Players can browse a list of organizations (e.g., "Century High School") and select their specific team (e.g., "Varsity", "JV").
    - Manual selection defaults the user to the `player` role.
3. **Admin Assignment**:
    - System administrators can manually override roles and team assignments through the Admin Control Center.

---

## Component Definitions

### 1. Common Components (Shared)
- **`Layout`**: Main wrapper providing consistent navigation and branding.
- **`Card`**: Standard container for check-in forms and dashboard widgets.
- **`Slider`**: Custom accessible slider for Mental, Physical, and Emotional ratings.
- **`Button`**: Standardized buttons for form submissions and navigation.
- **`Badge`**: Status indicators for submission completeness.

### 2. Player Components
- **`CheckInForm`**: Interface for players to enter their goal (via searchable dropdown or text) and readiness ratings.
- **`ReviewForm`**: Post-practice interface for reflecting on goal performance and setting intent for the next session.
- **`GoalInput`**: A text input specifically for the "small, achievable goal".
- **`PlayerHistory`**: A list or grid view of the player's past entries and trends.
- **`ReadinessSummary`**: A visual summary (e.g., small sparklines) of the player's recent ratings.

### 3. Coach Components
- **`TeamDashboard`**: Overview of all players in a team for the current day.
- **`SubmissionStatus`**: A list showing who has and hasn't submitted their daily check-in.
- **`PlayerProfileDetail`**: Detailed view of an individual athlete's goals and ratings over time.
- **`TeamTrendChart`**: Aggregated data visualization showing team readiness trends.

### 4. Admin Components
- **`OrganizationOverview`**: High-level list of all teams in the program.
- **`TeamManager`**: CRUD interface for managing teams and assigning coaches.
- **`AccessControl`**: Interface for managing roles and permissions for admins, coaches, and players.

---

## Data Model (Drizzle/SQLite)

### `organizations`
- `id` (text/uuid, PK)
- `name` (text)
- `createdAt` (integer/timestamp)

### `teams`
- `id` (text/uuid, PK)
- `orgId` (text, FK -> organizations)
- `name` (text)
- `coachInviteCode` (text, Unique)
- `playerInviteCode` (text, Unique)
- `createdAt` (integer/timestamp)

### `users` (Managed via Auth.js)
- `id` (text, PK)
- `name` (text)
- `email` (text)
- `role` (text: 'admin', 'coach', 'player')
- `teamId` (text, FK -> teams, Nullable)

### `checkIns`
- `id` (text/uuid, PK)
- `playerId` (text, FK -> users)
- `teamId` (text, FK -> teams)
- `goal` (text)
- `mentalRating` (integer, 1-10)
- `physicalRating` (integer, 1-10)
- `emotionalRating` (integer, 1-10)
- `createdAt` (integer/timestamp, Default: now())

### `reviews` (Post-Practice)
- `id` (text/uuid, PK)
- `playerId` (text, FK -> users)
- `teamId` (text, FK -> teams)
- `rating` (integer, 1-5, reflection on goal performance)
- `notes` (text, general reflections)
- `nextSessionNotes` (text, reminders for next practice)
- `createdAt` (integer/timestamp, Default: now())

---

## Future Enhancements & Roadmap

### 🏃 Player Engagement
- **Goal Templates**: Pre-set goal suggestions to minimize typing during fast transitions.
- **Consistency Streaks**: Visual rewards for consecutive check-ins to build habits.
- **Offline Support (PWA)**: Ensure check-ins work in low-connectivity gym environments.

### 📋 Coaching Intelligence
- **Low-Readiness Alerts**: Automated flagging of athletes reporting scores < 4.
- **"High-Five" Feedback**: Quick emoji/text reactions from coaches to athlete goals.
- **Trend Delta (Δ)**: Comparison of current averages vs. previous week's performance.
- **Data Export**: CSV downloads for attendance and readiness reporting.

### 🛠️ Administrative Efficiency
- **Bulk Roster Import**: CSV upload for quick team onboarding.
- **Invite QR Codes**: Scannable links for immediate team joining.
- **Global User Management**: Searchable directory for role and team overrides.

### 🎨 Technical & UI/UX
- **Dynamic Theming**: Full support for system-aware light/dark modes.
- **Skeleton Loading**: Improved perceived performance during data fetching.
- **Accessibility Audit**: Enhancing touch targets and contrast for outdoor visibility.
