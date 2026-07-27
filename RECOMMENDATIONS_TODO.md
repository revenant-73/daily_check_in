# Daily Check-In — Upgrade Recommendations

This checklist turns the July 2026 application review into an actionable roadmap. Items are ordered so that security and data integrity are addressed before broader feature development.

## Priority 0 — Security and access control

### Account creation and authentication

- [x] Remove `ensureTestUser` from production code, or make it impossible to call outside local development.
- [ ] Remove all known demo credentials from production-accessible code and data.
- [x] Make public signup always create a user with the `player` role.
- [x] Prevent clients from choosing `coach` or `admin` during public signup.
- [x] Grant coach access only through a coach-specific invitation or an administrator action.
- [x] Grant administrator access only through an existing administrator-controlled process.
- [x] Add password-strength requirements.
- [ ] Add rate limiting or throttling to login, signup, invite-code, and password-reset attempts.
- [ ] Add a secure password-reset flow.
- [ ] Decide whether email verification is required and implement it if the app will be used outside a tightly controlled team environment.
- [ ] Add session revocation for password changes, role changes, and account deactivation.

### Team and organization authorization

- [x] Remove or secure direct team joining by `teamId`.
- [x] Require a valid player invite to join a private team.
- [x] Require a separate coach invite to join a team as a coach.
- [ ] Make coach invites expiring and revocable.
- [x] Require administrator approval or an authorized organization role to create teams.
- [ ] Require administrator approval to create organizations.
- [x] Stop exposing the complete organization and team directory unless public discovery is an intentional product decision.
- [ ] Define whether a user may belong to more than one team and update the model accordingly.
- [ ] Add an audit log for role, organization, team, invite, and account-status changes.

### Resource-level authorization

- [x] Verify that a coach owns or is assigned to the target team before adding a reaction.
- [x] Verify that a coach owns or is assigned to the target team before adding or changing a coach note.
- [ ] Apply team/organization ownership checks to every action that accepts a player, team, organization, check-in, review, or reaction ID.
- [ ] Add shared authorization helpers such as `requireAdmin`, `requireCoach`, `requirePlayer`, and `requireCoachForTeam`.
- [ ] Treat middleware and hidden UI as navigation aids, not as the primary authorization boundary.
- [ ] Decide whether administrators should have access to individual athlete wellness responses; enforce the chosen policy consistently.
- [ ] Return safe user-facing authorization errors without exposing internal details.

### Server-side input validation

- [ ] Create Zod schemas for every server action.
- [x] Validate check-in ratings as integers in the range 1–10.
- [x] Validate review ratings as integers in the range 1–5.
- [ ] Add explicit length limits for goals, reflections, next-session notes, coach notes, names, and feedback.
- [x] Restrict reaction types to a fixed enum.
- [x] Normalize and validate emails before lookup and insertion.
- [x] Normalize invite codes consistently.
- [ ] Validate all team, organization, player, check-in, and review IDs.
- [ ] Reject unknown or malformed metadata instead of accepting arbitrary objects.
- [ ] Add safe handling for malformed stored JSON.

## Priority 1 — Data integrity and practice modeling

### Database constraints

- [x] Add a unique constraint/index for normalized user email.
- [x] Add unique constraints/indexes for player and coach invite codes.
- [x] Generate invite codes with a cryptographically secure random source.
- [x] Ensure invite-code generation fails safely rather than returning a potentially duplicated code after retry exhaustion.
- [x] Add a unique constraint for `(checkInId, coachId, reactionType)` or the selected reaction model.
- [x] Add database check constraints for all rating ranges.
- [ ] Make timestamps non-null where records must always have a timestamp.
- [ ] Define explicit `onDelete` behavior for every foreign key.
- [ ] Decide whether athlete records should be retained, anonymized, archived, or deleted when a user/team/organization is removed.
- [ ] Use transactions for multi-step operations such as organization/team creation, roster import, and account reassignment.
- [ ] Add indexes for common queries: team/date, player/date, session/player, organization/team, and check-in/reaction.
  - Current team/date, player/date, organization/team, and reaction indexes are implemented; session indexes depend on the practice-session model.

### First-class practice sessions

- [ ] Add a `practiceSessions` table.
- [ ] Include team, scheduled start, scheduled end, time zone, title/type, status, and optional location.
- [ ] Use statuses such as `scheduled`, `open`, `completed`, and `cancelled`.
- [ ] Link every check-in to a practice session.
- [ ] Link every review to a practice session.
- [ ] Enforce one check-in per player per practice session.
- [ ] Enforce one review per player per practice session.
- [ ] Replace “last 24 hours” attendance logic with session membership and submission state.
- [ ] Support multiple practices on the same calendar day.
- [ ] Handle practices spanning midnight and travel across time zones.
- [ ] Provide a migration/backfill strategy for existing check-ins and reviews.
- [ ] Let authorized coaches open, close, edit, cancel, and duplicate practice sessions.

### Data model cleanup

- [ ] Replace stabilized fields currently stored in generic `metadata` JSON with typed columns or related tables.
- [ ] Define typed schemas for metadata that remains intentionally flexible.
- [ ] Separate coach notes from athlete-authored check-in metadata.
- [ ] Record note author and edit timestamps in dedicated fields.
- [ ] Consider a membership model (`teamMemberships`) instead of a single `users.teamId` if athletes or coaches can belong to multiple teams.
- [ ] Add season support so historical data can be archived without losing team identity.

## Priority 2 — Automated quality checks

### Authorization and security tests

- [ ] Test that public signup cannot create a coach or administrator.
- [ ] Test that demo/test-user creation is unavailable in production.
- [ ] Test that players cannot read another player’s entries.
- [ ] Test that players cannot submit entries for another player.
- [ ] Test that coaches cannot view another team’s athlete data.
- [ ] Test that coaches cannot react to or annotate another team’s check-ins.
- [ ] Test that unauthorized users cannot create teams or organizations.
- [ ] Test expired, revoked, malformed, and incorrect invite codes.
- [ ] Test rate limits for authentication and invite-code attempts.

### Data and workflow tests

- [ ] Test that duplicate session check-ins are rejected.
- [ ] Test that duplicate session reviews are rejected.
- [x] Test that ratings outside allowed ranges are rejected.
- [ ] Test maximum text lengths and malformed metadata.
- [ ] Test role and team assignment for player and coach invites.
- [ ] Test deletion, archival, and reassignment behavior.
- [ ] Test practice calculations across daylight-saving and time-zone boundaries.
- [ ] Test double-practice days and practices spanning midnight.
- [ ] Test concurrent invite, reaction, and submission operations.
- [ ] Add migration tests against a copy of representative existing data.

### UI and end-to-end tests

- [ ] Add end-to-end coverage for signup, invitation, check-in, review, coach acknowledgement, and admin management.
- [ ] Test the player flow at common phone sizes.
- [ ] Test keyboard-only navigation.
- [ ] Test screen-reader labels and announcements.
- [ ] Test high-contrast and outdoor-visibility modes.
- [ ] Add CI checks for linting, TypeScript, tests, migrations, and production builds.

## Priority 3 — Privacy, safeguarding, and operations

### Athlete privacy

- [ ] Write a clear in-app explanation of what is collected, why it is collected, and who can see it.
- [ ] Define the visibility of goals, ratings, reflections, coach notes, and alerts by role.
- [ ] Establish a retention and deletion policy for athlete readiness data.
- [ ] Add account export and deletion procedures where required.
- [ ] Review applicable school, club, child-privacy, and health-information obligations with qualified counsel.
- [ ] Establish parent/guardian consent procedures where applicable.
- [ ] Avoid presenting readiness scores as medical diagnoses.
- [ ] Define an escalation protocol for responses that indicate injury, distress, abuse, or immediate safety concerns.
- [ ] Suppress identifiable team analytics for groups below a minimum size.
- [ ] Avoid public leaderboards or comparisons based on wellness/readiness scores.

### Logging, monitoring, and recovery

- [ ] Replace ad hoc `console.log` calls with structured logging.
- [ ] Ensure logs never contain passwords, invite codes, athlete notes, or sensitive readiness content.
- [ ] Add error monitoring with privacy-aware filtering.
- [ ] Track audit events separately from application error logs.
- [ ] Add database backup and verified restore procedures.
- [ ] Document incident response for compromised accounts or exposed invitations.
- [ ] Add health checks and basic operational monitoring.
- [ ] Add dependency and security scanning to CI.

## Priority 4 — Core workflow and coaching improvements

### Player experience

- [ ] Display a clear current-session status: not started, check-in complete, review due, or complete.
- [ ] Confirm successful submissions and prevent accidental repeated submission.
- [ ] Allow a short correction window, with edits recorded.
- [ ] Show private weekly trends with context rather than judgment.
- [ ] Add weekly reflection prompts.
- [ ] Let players see coach acknowledgements and appropriate coach notes.
- [ ] Provide coach-managed goal templates to minimize typing.
- [ ] Support personal favorite/recent goals.
- [ ] Keep check-in completion comfortably under 30 seconds.
- [ ] Celebrate reflection consistency without rewarding high scores or perfect attendance.

### Coach experience

- [ ] Add filters for practice, team, position/group, incomplete status, and concern level.
- [ ] Add configurable low-readiness and significant-change rules.
- [ ] Provide acknowledgement options such as “Seen,” “Let’s talk,” and supportive reactions.
- [ ] Let coaches record private follow-up status without placing it in generic metadata.
- [ ] Add an attendance and readiness CSV export.
- [ ] Add an aggregate practice-readiness summary.
- [ ] Add practice-plan notes informed by aggregate readiness.
- [ ] Make concern indicators explainable: show which rule triggered the flag.
- [ ] Avoid automatically ranking athletes by wellness scores.
- [ ] Add a workflow for resolving or dismissing alerts with an audit trail.

### Administrator experience

- [ ] Add QR-code invitations with expiration and revocation.
- [ ] Improve bulk roster import with validation, preview, and rollback.
- [ ] Add searchable user/team/organization management.
- [ ] Add account deactivate/reactivate controls instead of relying only on deletion.
- [ ] Add season rollover and team archival.
- [ ] Add role-change and team-transfer history.
- [ ] Add organization-level privacy and data-retention settings.

## Priority 5 — Performance and maintainability

### Application structure

- [ ] Split the coach dashboard into smaller data, domain, and presentation modules.
- [ ] Replace widespread `any` usage with Drizzle-inferred types and explicit view models.
- [ ] Create shared domain types for ratings, roles, reactions, session status, and alerts.
- [ ] Centralize date/time-zone handling.
- [ ] Centralize JSON parsing with safe typed helpers.
- [ ] Standardize server-action return values and user-facing error handling.
- [ ] Keep database queries in focused repository/service modules as complexity grows.
- [ ] Remove unused imports, legacy fields, and stale comments after migration.

### Query and analytics performance

- [ ] Replace loading all historical records and filtering in JavaScript with bounded database queries.
- [ ] Perform date filtering and aggregation in SQL where practical.
- [ ] Paginate player history, coach activity, and admin lists.
- [ ] Avoid repeated per-team queries in admin statistics.
- [ ] Add query limits for charts and activity feeds.
- [ ] Measure dashboard performance with realistic roster and history sizes.
- [ ] Add caching only after authorization boundaries and invalidation rules are well defined.

## Priority 6 — PWA, accessibility, and resilience

### PWA and offline use

- [ ] Verify that manifest icon files have the declared 192×192 and 512×512 dimensions.
- [ ] Add a maskable application icon.
- [ ] Add a service worker and an intentional offline strategy; a manifest alone does not provide offline submission.
- [ ] Queue offline check-ins/reviews locally and synchronize safely when connectivity returns.
- [ ] Show pending, synchronized, and failed submission states.
- [ ] Make synchronization idempotent to prevent duplicate entries.
- [ ] Test unreliable gym Wi-Fi and offline-to-online transitions.
- [ ] Provide a safe update flow when a new app version is available.

### Accessibility and usability

- [ ] Audit color contrast in light, dark, and bright outdoor conditions.
- [ ] Ensure touch targets meet mobile accessibility guidance.
- [ ] Ensure sliders expose labels, values, instructions, and keyboard controls.
- [ ] Do not communicate concern or completion using color alone.
- [ ] Add visible focus states throughout the app.
- [ ] Verify screen-reader reading order and live submission feedback.
- [ ] Respect reduced-motion preferences.
- [ ] Test one-handed use with representative athletes.

## Priority 7 — Documentation and product decisions

- [ ] Update `DOCS.md` to reflect the actual Next.js version and installed dependencies.
- [ ] Remove references to TanStack Query and shadcn/Radix unless they are intentionally added.
- [ ] Replace the starter README with project-specific setup and architecture documentation.
- [ ] Document required environment variables without including secret values.
- [ ] Document local development, migrations, seeding, tests, deployment, backup, and restore.
- [ ] Document the role/permission matrix.
- [ ] Document the athlete-data visibility matrix.
- [ ] Document invitation lifecycle and account recovery.
- [ ] Add architecture decision records for practice sessions, team membership, and privacy/retention.
- [ ] Keep this roadmap synchronized with completed migrations and product decisions.

## Suggested delivery sequence

- [ ] Milestone 1: Close account, role-escalation, cross-team access, and validation gaps.
- [ ] Milestone 2: Add database constraints, audit records, and deletion/retention rules.
- [ ] Milestone 3: Introduce practice sessions and migrate existing data.
- [ ] Milestone 4: Add authorization, workflow, migration, and end-to-end tests with CI.
- [ ] Milestone 5: Complete privacy, safeguarding, backup, and monitoring work.
- [ ] Milestone 6: Improve player/coach workflows, exports, alerts, and administration.
- [ ] Milestone 7: Add robust offline/PWA behavior and finish accessibility testing.
- [ ] Milestone 8: Optimize analytics, archive seasons, and expand long-term reporting.
