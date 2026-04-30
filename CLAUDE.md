# Daily Check-In

## Project Commands

### Development
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

### Database & Seeding
- `npx drizzle-kit generate`: Generates SQL migrations from the Drizzle schema.
- `npx drizzle-kit push`: Pushes the schema directly to the database.
- `npx drizzle-kit studio`: Opens the Drizzle Studio database browser.
- `npx tsx scripts/seed.ts`: Seeds the database with Demo Admin, Coach, and Player accounts.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Database**: Turso (SQLite)
- **ORM**: Drizzle ORM
- **Auth**: Auth.js (NextAuth)
- **UI**: Tailwind CSS, Lucide React

## Deployment Notes
- **Middleware**: Authentication is handled in `src/middleware.ts`.
- **Environment Variables**:
  - `TURSO_CONNECTION_URL`: Turso DB URL.
  - `TURSO_AUTH_TOKEN`: Turso DB Token.
  - `AUTH_SECRET`: Required for Auth.js production sessions.
  - `NEXT_PUBLIC_APP_URL`: The production URL of the app.
