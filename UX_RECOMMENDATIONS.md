# Daily Check-In UX Recommendations

Observed locally on August 19, 2026 using the demo player, coach, and admin accounts.

## Priority 1 - Mobile navigation overlap

Status: Implemented in the first pass.

- The fixed mobile nav overlays player check-in/review content and admin/team sections on phone-sized screens.
- Hide the bottom nav during focused player submission flows, especially `/dashboard?view=check-in` and `/dashboard?view=review`.
- Increase the reserved bottom space for pages that keep the nav visible, including admin and coach dashboards.
- Keep bottom-nav buttons at a comfortable touch size and account for safe-area insets.

## Priority 2 - Player current-state clarity

Status: Implemented for the player dashboard readiness card.

- The dashboard can show "Action Required" for today while also showing "Current Readiness" from an older check-in.
- If there is no check-in today, show "Last readiness" with the entry date or hide the score until today's check-in is complete.
- Make the primary player message answer one question: "What do I need to do now?"

## Priority 3 - Faster player check-ins

Status: Implemented for the readiness step with compact mobile controls.

- The step-based player flow is clear, but the rating controls take a lot of vertical space on mobile.
- Compress the readiness controls into easier one-handed rows or segmented controls.
- Reduce hype-heavy wording where it slows comprehension, while keeping the athlete-focused tone.

## Priority 4 - Admin triage

Status: Implemented on the admin dashboard with triage filters and status explanations.

- Make the admin dashboard more explicitly operational: "Needs attention," "Recently active," "No check-ins today," and "Stale teams."
- Explain stale/inactive labels and make sorting visible.
- Consider showing the riskiest or most urgent teams first, with a separate filter for inactivity cleanup.

## Priority 5 - Admin team mobile layout

Status: Implemented with mobile-first ordering, larger actions, and the chart moved below recent activity on phones.

- The team detail chart is too small to read on mobile and can contribute to horizontal overflow.
- Put the mobile team page in this order: action summary, player status list, roster tools, recent entries, then charts.
- Make destructive and role-change actions larger and more explicit on touch devices.

## Priority 6 - Roster import safety

Status: Implemented with preview, duplicate/invalid row handling, and explicit confirmation.

- Add a roster preview before import.
- Show valid rows, duplicate emails, malformed rows, and existing users that will be reassigned.
- Confirm before mutating accounts or team assignments.

## Priority 7 - Touch targets and accessibility

Status: Implemented across shared header/nav controls, login controls, admin assignment forms, dictation, and reaction buttons.

- Increase mobile controls to at least 44px in both dimensions where practical.
- Add clearer labels or tooltips for icon-only admin controls.
- Do not rely on color alone for readiness, completion, or concern states.

## Priority 8 - Chart and image polish

Status: Implemented with stable chart containers, unique SVG gradients, and optimized logo image sizing.

- Fix chart container sizing warnings so mobile charts render reliably.
- Add the missing `sizes` prop to the logo image that uses `fill`.
