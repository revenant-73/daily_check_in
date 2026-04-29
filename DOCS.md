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

## Component Definitions

### 1. Common Components (Shared)
- **`Layout`**: Main wrapper providing consistent navigation and branding.
- **`Card`**: Standard container for check-in forms and dashboard widgets.
- **`Slider`**: Custom accessible slider for Mental, Physical, and Emotional ratings.
- **`Button`**: Standardized buttons for form submissions and navigation.
- **`Badge`**: Status indicators for submission completeness.

### 2. Player Components
- **`CheckInForm`**: The primary interface for players to enter their goal and ratings.
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
- `inviteCode` (text, Unique)

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
